/*
 * Marca, productos y reglas de precio de TAKTO.
 * Lo usan el navegador (window.CATALOG) y la función api/checkout.js (require),
 * así el precio que se cobra siempre se recalcula en el servidor.
 *
 * Para cambiar precios, productos o el WhatsApp, edita solo este archivo.
 */
(function (root) {
  var brand = {
    name: "TAKTO",
    city: "Guadalajara",
    // WhatsApp para pedidos: 521 + 10 dígitos, sin "+" ni espacios.
    whatsapp: "5213300000000",
    currency: "MXN",
  };

  // Mayoreo: desde esta cantidad por producto (se pueden mezclar colores o plataformas).
  var wholesaleFrom = 20;
  // Envío gratis desde esta cantidad de piezas en todo el pedido.
  var freeShippingFrom = 3;
  var leadTime = { stock: "Sale en 24 h", order: "Bajo pedido · 7 a 12 días hábiles" };

  /*
   * Productos. "retail" es el precio de menudeo (1 a 19 piezas).
   * "tiers" son los precios de mayoreo por pieza según la cantidad de ese producto.
   * "resale" es el precio sugerido para quien revende.
   */
  var products = [
    {
      id: "redes",
      name: "Tarjetas para reseñas y redes",
      short: "Google, Instagram, WhatsApp, TikTok y Facebook",
      material: "PVC negro mate con logo impreso",
      stock: true,
      retail: 349,
      tiers: [{ min: 20, price: 169 }, { min: 50, price: 139 }, { min: 100, price: 119 }],
      resale: 349,
      variantLabel: "Plataforma",
      variants: [
        { id: "google", name: "Google", headline: ["Déjanos tu", "reseña en Google"], stars: true, color: "#4285F4" },
        { id: "instagram", name: "Instagram", headline: ["Síguenos en", "Instagram"], color: "#E1306C" },
        { id: "whatsapp", name: "WhatsApp", headline: ["Escríbenos por", "WhatsApp"], color: "#25D366" },
        { id: "tiktok", name: "TikTok", headline: ["Síguenos en", "TikTok"], color: "#25F4EE" },
        { id: "facebook", name: "Facebook", headline: ["Síguenos en", "Facebook"], color: "#1877F2" },
      ],
      points: ["Listas para usar en mostrador, mesa o caja", "Se programan con el enlace de cada negocio"],
    },
    {
      id: "metal",
      name: "Tarjeta metálica",
      short: "Tarjeta de presentación con grabado láser",
      material: "Acero inoxidable con chip NFC en zona especial",
      stock: false,
      retail: 899,
      tiers: [{ min: 20, price: 549 }, { min: 50, price: 479 }, { min: 100, price: 429 }],
      resale: 899,
      variantLabel: "Color",
      variants: [
        { id: "plata", name: "Plata" },
        { id: "dorada", name: "Dorada" },
        { id: "negra", name: "Negra" },
      ],
      points: ["Nombre y logo grabados con láser", "Abre tu contacto, web o WhatsApp"],
    },
    {
      id: "papel",
      name: "Tarjeta de papel negro",
      short: "Cartón negro grueso, ligera y económica",
      material: "Papel negro de alto gramaje con chip NFC",
      stock: false,
      retail: 199,
      tiers: [{ min: 20, price: 89 }, { min: 50, price: 75 }, { min: 100, price: 65 }],
      resale: 199,
      variantLabel: "Color",
      variants: [{ id: "negro", name: "Negro" }],
      points: ["Ideal para eventos, tarjetas de presentación y regalos", "Impresión en tinta blanca o metálica"],
    },
    {
      id: "pvc",
      name: "Tarjeta PVC con tu logo",
      short: "Diseño de la empresa, impresa o grabada",
      material: "PVC rígido, formato de tarjeta bancaria",
      stock: false,
      retail: 399,
      tiers: [{ min: 20, price: 189 }, { min: 50, price: 159 }, { min: 100, price: 139 }],
      resale: 399,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "blanca", name: "Blanca" },
      ],
      points: ["Con el logo y colores del negocio", "Te enviamos prueba digital antes de producir"],
    },
  ];

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
    var price = product.retail;
    product.tiers.forEach(function (t) { if (qty >= t.min) price = t.price; });
    return price;
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
      var total = unit * n;
      groups.push({
        product: p,
        qty: n,
        unit: unit,
        total: total,
        wholesale: n >= wholesaleFrom,
        saving: (p.retail - unit) * n,
        missing: n < wholesaleFrom ? wholesaleFrom - n : 0,
        lines: lines.filter(function (l) { return l.product === p; }),
      });
      subtotal += total;
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
