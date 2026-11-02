/*
 * Función de servidor (Vercel / Node 18+) que crea una preferencia de pago
 * de Mercado Pago Checkout Pro y devuelve la URL de pago.
 *
 * Variables de entorno:
 *   MP_ACCESS_TOKEN  Access token de producción o de prueba de Mercado Pago.
 *   SITE_URL         URL pública de la tienda, p. ej. https://takto.mx
 *
 * Los precios (menudeo y mayoreo) se recalculan aquí con catalog.js y pay-catalog.js:
 * nunca se confía en lo que manda el navegador.
 */
const C = require("../assets/js/catalog.js");
const P = require("../assets/js/pay-catalog.js");

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  const token = (process.env.MP_ACCESS_TOKEN || "").trim();

  // Abrir /api/checkout en el navegador muestra si el cobro está listo (sin mostrar la clave).
  if (req.method === "GET") {
    return res.status(200).json({
      mercadoPago: token ? "configurado" : "falta la variable MP_ACCESS_TOKEN en Vercel",
      modo: token.startsWith("TEST-") ? "prueba" : token.startsWith("APP_USR-") ? "producción" : token ? "clave con formato desconocido" : "sin clave",
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método no permitido" });
  }
  if (!token) return res.status(500).json({ error: "falta configurar MP_ACCESS_TOKEN en Vercel" });

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      return res.status(400).json({ error: "Solicitud inválida" });
    }
  }

  const customer = body.customer || {};
  let items;
  let meta;
  let shipping;

  if (body.store === "pay") {
    const q = P.quote(body.package, body.qty, body.delivery);
    if (q.error) return res.status(400).json({ error: q.error });
    items = [{ id: q.pkg.id, title: `Kit de cobro ${P.brand.name} · ${q.pkg.name}`, quantity: q.qty, unit_price: q.unit, currency_id: P.brand.currency }];
    shipping = { amount: q.shipping, name: q.delivery.name };
    meta = { store: "pay", package: q.pkg.name, delivery: q.delivery.name, machine: clean(customer.machine, 120) };
  } else {
    const q = C.quote(Array.isArray(body.items) ? body.items.slice(0, 40) : [], body.delivery);
    if (q.error) return res.status(400).json({ error: q.error });
    items = [];
    q.groups.forEach((g) => {
      g.lines.forEach((l) => {
        items.push({
          id: `${g.product.id}-${l.variant.id}`,
          title: `${g.product.name} · ${l.variant.name}${g.product.custom ? (l.text ? ` · nombre: ${l.text}` : " · en blanco") : ""}`.slice(0, 250),
          quantity: l.qty,
          unit_price: g.unit,
          currency_id: C.brand.currency,
        });
      });
    });
    shipping = { amount: q.shipping, name: q.delivery.name };
    meta = {
      store: "tarjetas",
      delivery: q.delivery.name,
      pricing: q.groups.map((g) => `${g.product.name}: ${g.qty} pzas ${g.wholesale ? "mayoreo" : "menudeo"} a ${g.unit}`).join(" | "),
      names: q.groups.flatMap((g) => g.lines.filter((l) => l.text).map((l) => `${g.product.name} ${l.variant.name}: ${l.text}`)).join(" | ").slice(0, 900),
    };
  }
  if (shipping.amount) {
    items.push({ id: "envio", title: shipping.name, quantity: 1, unit_price: shipping.amount, currency_id: C.brand.currency });
  }

  const siteUrl = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const reference = (body.store === "pay" ? "TP-" : "TK-") + Date.now().toString(36).toUpperCase();
  const back = `${siteUrl}/gracias.html`;

  const preference = {
    items,
    external_reference: reference,
    payer: { name: clean(customer.name, 80) },
    back_urls: { success: back, pending: back, failure: back },
    auto_return: "approved",
    statement_descriptor: C.brand.name,
    // Datos para preparar el pedido; se ven en el detalle del pago en Mercado Pago.
    metadata: {
      reference,
      ...meta,
      customer: {
        name: clean(customer.name, 80),
        phone: clean(customer.phone, 20),
        address: [customer.street, customer.zip, customer.city, customer.state].map((v) => clean(v, 120)).filter(Boolean).join(", "),
        links: clean(customer.links, 1000),
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
    if (!mp.ok || !data.init_point) {
      console.error("Mercado Pago error", mp.status, data);
      const reason = mp.status === 401 ? "la clave de Mercado Pago no es válida" : data.message || "Mercado Pago respondió " + mp.status;
      return res.status(502).json({ error: reason });
    }
    return res.status(200).json({ init_point: data.init_point, reference });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "No se pudo conectar con Mercado Pago" });
  }
};
