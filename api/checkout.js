/*
 * Función de servidor (Vercel / Node 18+) que crea una preferencia de pago
 * de Mercado Pago Checkout Pro y devuelve la URL de pago.
 *
 * Variables de entorno:
 *   MP_ACCESS_TOKEN  Access token de producción o de prueba de Mercado Pago.
 *   SITE_URL         URL pública de la tienda, p. ej. https://tapreview.mx
 *
 * Los precios se recalculan aquí con catalog.js: nunca se confía en el
 * precio que manda el navegador.
 */
const C = require("../assets/js/catalog.js");

const MAX_LINES = 30;

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
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, MAX_LINES) : [];
  const customer = body.customer || {};

  const items = [];
  const details = [];
  let subtotal = 0;
  for (const raw of rawItems) {
    const product = C.getProduct(raw.productId);
    const platform = C.getPlatform(raw.platform);
    const qty = Math.max(1, Math.min(999, parseInt(raw.qty, 10) || 1));
    if (!product || !platform) continue;
    const unit = C.unitPrice(product, qty);
    subtotal += unit * qty;
    items.push({
      id: product.id,
      title: `${product.name} · ${platform.name}`,
      quantity: qty,
      unit_price: unit,
      currency_id: C.config.currency,
    });
    details.push({
      product: product.id,
      platform: platform.id,
      qty,
      link: clean(raw.link, 300),
      business: clean(raw.businessName, 60),
      notes: clean(raw.notes, 400),
    });
  }
  if (!items.length) return res.status(400).json({ error: "El carrito está vacío" });

  const shipping = C.shippingFor(subtotal);
  if (shipping) {
    items.push({ id: "envio", title: "Envío nacional", quantity: 1, unit_price: shipping, currency_id: C.config.currency });
  }

  const siteUrl = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const reference = "TR-" + Date.now().toString(36).toUpperCase();
  const back = `${siteUrl}/gracias.html`;

  const preference = {
    items,
    external_reference: reference,
    payer: {
      name: clean(customer.name, 80),
      email: clean(customer.email, 120),
      phone: { number: clean(customer.phone, 20) },
      address: { zip_code: clean(customer.zip, 10), street_name: clean(customer.street, 120) },
    },
    back_urls: { success: back, pending: back, failure: back },
    auto_return: "approved",
    statement_descriptor: C.config.storeName.slice(0, 22),
    // Datos para preparar el pedido; se ven en el detalle del pago en Mercado Pago.
    metadata: {
      reference,
      customer: {
        name: clean(customer.name, 80),
        email: clean(customer.email, 120),
        phone: clean(customer.phone, 20),
        address: [customer.street, customer.colonia, customer.zip, customer.city, customer.state].map((v) => clean(v, 120)).join(", "),
        notes: clean(customer.notes, 300),
      },
      lines: details,
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
