/*
 * Marca, productos y reglas de precio de TAKTO.
 * Lo usan el navegador (window.CATALOG), la función api/checkout.js y build.js,
 * así el precio que se cobra siempre se recalcula en el servidor.
 *
 * Para cambiar precios, productos o el WhatsApp, edita solo este archivo.
 */
(function (root) {
  var brand = {
    name: "TAKTO",
    city: "Guadalajara",
    state: "Jalisco",
    // WhatsApp para pedidos: 52 + 10 dígitos, sin "+" ni espacios.
    whatsapp: "523511240636",
    phoneDisplay: "+52 351 124 0636",
    // Dirección pública del sitio. En Vercel se toma sola; cámbiala cuando tengas tu dominio.
    url: "https://nfc-e-commerce.vercel.app",
    currency: "MXN",
  };

  // Mayoreo desde esta cantidad de piezas de un mismo producto (se pueden mezclar diseños o colores).
  var wholesaleFrom = 20;
  // Envío gratis desde esta cantidad de piezas en todo el pedido.
  var freeShippingFrom = 3;

  /*
   * Productos, en el orden en que aparecen. Cada uno tiene dos precios por pieza:
   * "retail" (menudeo, 1 a 19) y "wholesale" (mayoreo, desde 20).
   * "shape": "v" vertical (como las tarjetas de reseñas) o "h" horizontal (presentación).
   */
  var products = [
    {
      id: "google",
      name: "Tarjeta NFC de reseñas de Google",
      short: "Tus clientes te califican con 5 estrellas en segundos.",
      material: "Plástico rígido",
      materialShort: "Plástico",
      stock: true,
      shape: "v",
      retail: 349,
      wholesale: 169,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra", screen: "google", color: "#4285F4" },
        { id: "blanca", name: "Blanca", screen: "google", color: "#4285F4" },
      ],
    },
    {
      id: "redes",
      name: "Tarjetas NFC para redes sociales",
      short: "Más seguidores y mensajes sin que te busquen por nombre.",
      material: "Plástico rígido",
      materialShort: "Plástico",
      stock: true,
      shape: "v",
      retail: 349,
      wholesale: 169,
      variantLabel: "Red social",
      variants: [
        { id: "instagram", name: "Instagram", screen: "instagram", color: "#E1306C" },
        { id: "whatsapp", name: "WhatsApp", screen: "whatsapp", color: "#25D366" },
        { id: "facebook", name: "Facebook", screen: "facebook", color: "#1877F2" },
        { id: "tiktok", name: "TikTok", screen: "tiktok", color: "#25F4EE" },
      ],
    },
    {
      id: "lisa",
      name: "Tarjeta NFC lisa de plástico",
      short: "Negra o blanca, lista para abrir cualquier enlace.",
      material: "Plástico mate",
      materialShort: "Plástico",
      stock: true,
      shape: "h",
      retail: 299,
      wholesale: 139,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "blanca", name: "Blanca" },
      ],
    },
    {
      id: "metal",
      name: "Tarjeta NFC metálica",
      short: "Acero con acabado cepillado. La más elegante para presentarte.",
      material: "Metal (acero inoxidable)",
      materialShort: "Metal",
      stock: false,
      shape: "h",
      retail: 899,
      wholesale: 549,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "plata", name: "Plata" },
        { id: "dorada", name: "Dorada" },
      ],
    },
    {
      id: "papel",
      name: "Tarjeta NFC de papel negro",
      short: "Ligera y mate. Ideal para eventos y para repartir.",
      material: "Papel negro grueso",
      materialShort: "Papel",
      stock: false,
      shape: "h",
      retail: 199,
      wholesale: 89,
      variantLabel: "Color",
      variants: [{ id: "negra", name: "Negra" }],
    },
  ];

  var leadTime = { stock: "Sale en 24\u00a0h", order: "Se fabrica en 7 a 12 días hábiles" };

  var delivery = [
    { id: "envio", name: "Envío a todo México", detail: "Gratis desde " + freeShippingFrom + " piezas", cost: 99 },
    { id: "pickup", name: "Recoger en Guadalajara", detail: "Te compartimos la ubicación por WhatsApp", cost: 0 },
  ];

  function getProduct(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }

  function getVariant(product, id) {
    for (var i = 0; i < product.variants.length; i++) if (product.variants[i].id === id) return product.variants[i];
    return null;
  }

  function getDelivery(id) {
    for (var i = 0; i < delivery.length; i++) if (delivery[i].id === id) return delivery[i];
    return delivery[0];
  }

  // Precio por pieza según cuántas piezas de ese producto lleva el pedido.
  function unitPrice(product, qty) {
    return qty >= wholesaleFrom ? product.wholesale : product.retail;
  }

  /*
   * Cotización de un pedido.
   * items: [{ product, variant, qty }]
   */
  function quote(items, deliveryId) {
    var byProduct = {};
    var lines = [];
    (items || []).forEach(function (it) {
      var p = getProduct(it.product);
      var v = p && getVariant(p, it.variant);
      var n = Math.max(0, Math.min(999, parseInt(it.qty, 10) || 0));
      if (!p || !v || !n) return;
      lines.push({ product: p, variant: v, qty: n });
      byProduct[p.id] = (byProduct[p.id] || 0) + n;
    });

    var groups = [];
    var subtotal = 0;
    var qty = 0;
    products.forEach(function (p) {
      var n = byProduct[p.id];
      if (!n) return;
      var unit = unitPrice(p, n);
      groups.push({
        product: p,
        qty: n,
        unit: unit,
        total: unit * n,
        wholesale: n >= wholesaleFrom,
        saving: (p.retail - unit) * n,
        missing: n < wholesaleFrom ? wholesaleFrom - n : 0,
        lines: lines.filter(function (l) { return l.product === p; }),
      });
      subtotal += unit * n;
      qty += n;
    });

    var d = getDelivery(deliveryId);
    var shipping = !qty || qty >= freeShippingFrom ? 0 : d.cost;
    return { groups: groups, qty: qty, subtotal: subtotal, delivery: d, shipping: shipping, total: subtotal + shipping, error: qty ? null : "Agrega al menos una tarjeta." };
  }

  function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString("es-MX");
  }

  var catalog = {
    brand: brand, products: products, delivery: delivery, wholesaleFrom: wholesaleFrom, freeShippingFrom: freeShippingFrom, leadTime: leadTime,
    getProduct: getProduct, getVariant: getVariant, getDelivery: getDelivery, unitPrice: unitPrice, quote: quote, formatMoney: formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.CATALOG = catalog;
})(this);
