/*
 * Función de servidor (Vercel / Node 18+) que crea una preferencia de pago
 * de Mercado Pago Checkout Pro y devuelve la URL de pago.
 *
 * Variables de entorno:
 *   MP_ACCESS_TOKEN  Access token de producción o de prueba de Mercado Pago.
 *   SITE_URL         URL pública de la tienda, p. ej. https://takto.mx
 *
 * Los precios, niveles y regalos se recalculan aquí con catalog.js:
 * nunca se confía en lo que manda el navegador.
 */
const C = require("../assets/js/catalog.js");

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "Mercado Pago no está configurado" });

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      return res.status(400).json({ error: "Solicitud inválida" });
    }
  }

  const mode = body.mode === "negocio" ? "negocio" : "reventa";
  const q = C.quote(mode, Array.isArray(body.items) ? body.items.slice(0, 20) : [], body.delivery);
  if (q.error) return res.status(400).json({ error: q.error });

  const customer = body.customer || {};
  const items = q.lines.map((l) => ({
    id: l.platform.id,
    title: `Tarjeta NFC ${C.brand.name} · ${l.platform.name}`,
    quantity: l.qty,
    unit_price: q.unit,
    currency_id: C.brand.currency,
  }));
  if (q.shipping) {
    items.push({ id: "envio", title: q.delivery.name, quantity: 1, unit_price: q.shipping, currency_id: C.brand.currency });
  }

  const siteUrl = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const reference = "TK-" + Date.now().toString(36).toUpperCase();
  const back = `${siteUrl}/gracias.html`;

  const preference = {
    items,
    external_reference: reference,
    payer: {
      name: clean(customer.name, 80),
      email: clean(customer.email, 120),
      phone: { number: clean(customer.phone, 20) },
    },
    back_urls: { success: back, pending: back, failure: back },
    auto_return: "approved",
    statement_descriptor: C.brand.name,
    // Datos para preparar el pedido; se ven en el detalle del pago en Mercado Pago.
    metadata: {
      reference,
      mode,
      tier: q.tier ? q.tier.name : null,
      gift_cards: q.giftCards,
      delivery: q.delivery.name,
      customer: {
        name: clean(customer.name, 80),
        phone: clean(customer.phone, 20),
        email: clean(customer.email, 120),
        address: [customer.street, customer.colonia, customer.zip, customer.city, customer.state].map((v) => clean(v, 120)).filter(Boolean).join(", "),
        links: clean(customer.links, 1000),
        notes: clean(customer.notes, 300),
      },
    },
  };

  try {
    const mp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(preference),
    });
    const data = await mp.json();
    if (!mp.ok) {
      console.error("Mercado Pago error", mp.status, data);
      return res.status(502).json({ error: "No se pudo crear el pago" });
    }
    return res.status(200).json({ init_point: data.init_point, reference });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "No se pudo conectar con Mercado Pago" });
  }
};
