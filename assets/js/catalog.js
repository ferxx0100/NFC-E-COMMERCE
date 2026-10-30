/*
 * Marca, catálogo y reglas de precio.
 * Lo usan el navegador (window.CATALOG) y la función api/checkout.js (require),
 * así el precio que se cobra siempre se recalcula en el servidor.
 *
 * Para cambiar precios, regalos, plataformas o la marca, edita solo este archivo.
 */
(function (root) {
  var brand = {
    name: "TAKTO",
    tagline: "Un toque. Más clientes.",
    city: "Guadalajara",
    // WhatsApp para pedidos: 521 + 10 dígitos, sin "+" ni espacios.
    whatsapp: "5213300000000",
    currency: "MXN",
  };

  // Las 7 tarjetas de la colección. "accent" es el color de detalle sobre el negro.
  var platforms = [
    { id: "google", name: "Google", eyebrow: "GOOGLE · RESEÑAS", lines: ["Déjanos tu", "reseña"], stars: true, accent: "#4285F4", use: "Restaurantes, consultorios, talleres, hoteles" },
    { id: "instagram", name: "Instagram", eyebrow: "INSTAGRAM", lines: ["Síguenos", "en un toque"], stars: false, accent: "#E1306C", use: "Boutiques, barberías, salones, cafeterías" },
    { id: "tiktok", name: "TikTok", eyebrow: "TIKTOK", lines: ["Míranos", "en acción"], stars: false, accent: "#25F4EE", use: "Food trucks, gimnasios, marcas jóvenes" },
    { id: "facebook", name: "Facebook", eyebrow: "FACEBOOK", lines: ["Únete a nuestra", "comunidad"], stars: false, accent: "#1877F2", use: "Negocios de barrio, escuelas, eventos" },
    { id: "whatsapp", name: "WhatsApp", eyebrow: "WHATSAPP", lines: ["Escríbenos", "ahora mismo"], stars: false, accent: "#25D366", use: "Pedidos a domicilio, citas, cotizaciones" },
    { id: "tripadvisor", name: "Tripadvisor", eyebrow: "TRIPADVISOR", lines: ["Cuéntanos tu", "experiencia"], stars: true, accent: "#34E0A1", use: "Hoteles, tours, bares y restaurantes turísticos" },
    { id: "menu", name: "Menú / Web", eyebrow: "MENÚ · WEB · CATÁLOGO", lines: ["Todo lo que", "ofrecemos"], stars: false, accent: "#C9A96E", use: "Menú digital, página web, catálogo, pagos" },
  ];

  /*
   * Materiales. El precio por pieza es el del nivel (o el de negocio) más "delta".
   * "resale" es el precio sugerido de reventa para ese material.
   * Solo los que tienen stock: true se entregan de inmediato; el resto es bajo pedido.
   */
  var finishes = [
    { id: "pvc-negro", name: "PVC negro mate", group: "Plástico", stock: true, delta: 0, resale: 349 },
    { id: "papel-negro", name: "Papel negro", group: "Papel", stock: false, delta: -50, resale: 249 },
    { id: "metal-negro", name: "Metal negro", group: "Metal", stock: false, delta: 200, resale: 699 },
    { id: "metal-blanco", name: "Metal blanco", group: "Metal", stock: false, delta: 200, resale: 699 },
    { id: "metal-dorado", name: "Metal dorado", group: "Metal", stock: false, delta: 230, resale: 749 },
    { id: "metal-plateado", name: "Metal plateado", group: "Metal", stock: false, delta: 230, resale: 749 },
  ];
  var leadTime = "7 a 12 días hábiles";

  // Compra para tu propio negocio (1 a 6 piezas): se entregan programadas.
  var retail = { price: 349, maxQty: 6 };

  // Mayoreo para revender: el precio por pieza depende del total del pedido.
  // "giftCards" son tarjetas extra que enviamos sin costo; "gifts" son extras del nivel.
  var tiers = [
    { id: "arranque", name: "Kit Arranque", min: 7, price: 170, giftCards: 0, gifts: ["Tarjeta demo programada con tu WhatsApp", "Guía de venta y mensajes listos para WhatsApp"] },
    { id: "emprendedor", name: "Kit Emprendedor", min: 21, price: 142, giftCards: 3, gifts: ["Guía de venta y mensajes listos para WhatsApp", "Pack de imágenes para tus redes"] },
    { id: "negocio", name: "Kit Negocio", min: 49, price: 122, giftCards: 7, gifts: ["Exhibidor acrílico de mostrador", "Pack de imágenes para tus redes", "Capacitación 1 a 1 por videollamada"] },
    { id: "distribuidor", name: "Kit Distribuidor", min: 105, price: 105, giftCards: 15, gifts: ["Exhibidor acrílico de mostrador", "Zona preferente en la ZMG", "Apareces en nuestro directorio de distribuidores"] },
  ];

  // Precio sugerido de reventa (PVC) y el rango del simulador de ganancias.
  var resale = { suggested: 349, min: 149, max: 999 };

  var delivery = [
    { id: "zmg", name: "Entrega en la ZMG", detail: "Guadalajara, Zapopan, Tlaquepaque, Tonalá, Tlajomulco y El Salto · 24 a 48 h", cost: 0 },
    { id: "pickup", name: "Recoger en punto de entrega", detail: "Te compartimos la ubicación por WhatsApp", cost: 0 },
    { id: "nacional", name: "Envío a todo México", detail: "2 a 5 días hábiles · gratis desde 21 piezas", cost: 199, freeFrom: 21 },
  ];

  function getPlatform(id) {
    for (var i = 0; i < platforms.length; i++) if (platforms[i].id === id) return platforms[i];
    return null;
  }

  function getFinish(id) {
    for (var i = 0; i < finishes.length; i++) if (finishes[i].id === id) return finishes[i];
    return finishes[0];
  }

  function getDelivery(id) {
    for (var i = 0; i < delivery.length; i++) if (delivery[i].id === id) return delivery[i];
    return delivery[0];
  }

  function tierFor(qty) {
    var t = null;
    for (var i = 0; i < tiers.length; i++) if (qty >= tiers[i].min) t = tiers[i];
    return t;
  }

  function nextTier(qty) {
    for (var i = 0; i < tiers.length; i++) if (tiers[i].min > qty) return tiers[i];
    return null;
  }

  /*
   * Cotización completa de un pedido.
   * mode: "reventa" (mayoreo, mínimo 7) o "negocio" (1 a 6, programadas).
   * items: [{ platform, qty }]
   * finishId: material de las tarjetas (un material por pedido).
   */
  function quote(mode, items, deliveryId, finishId) {
    var finish = getFinish(finishId);
    var lines = [];
    var qty = 0;
    (items || []).forEach(function (it) {
      var pl = getPlatform(it.platform);
      var n = Math.max(0, Math.min(999, parseInt(it.qty, 10) || 0));
      if (!pl || !n) return;
      lines.push({ platform: pl, qty: n });
      qty += n;
    });

    var tier = mode === "reventa" ? tierFor(qty) : null;
    var unit = (mode === "reventa" ? (tier ? tier.price : tiers[0].price) : retail.price) + finish.delta;
    var error = null;
    if (!qty) error = "Agrega al menos una tarjeta.";
    else if (mode === "reventa" && qty < tiers[0].min) error = "El mayoreo empieza en " + tiers[0].min + " piezas.";
    else if (mode === "negocio" && qty > retail.maxQty) error = "Para más de " + retail.maxQty + " piezas usa precio de mayoreo.";

    var subtotal = unit * qty;
    var d = getDelivery(deliveryId);
    var shipping = d.freeFrom && qty >= d.freeFrom ? 0 : d.cost;
    return {
      mode: mode,
      finish: finish,
      lines: lines,
      qty: qty,
      unit: unit,
      tier: tier,
      next: mode === "reventa" ? nextTier(qty) : null,
      giftCards: tier ? tier.giftCards : 0,
      subtotal: subtotal,
      delivery: d,
      shipping: qty ? shipping : 0,
      total: qty ? subtotal + shipping : 0,
      error: error,
    };
  }

  // Ganancia estimada si se venden todas las piezas (incluidas las de regalo).
  function profit(q, resalePrice) {
    var sold = q.qty + q.giftCards;
    return { sold: sold, revenue: sold * resalePrice, gain: sold * resalePrice - q.subtotal };
  }

  function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString("es-MX");
  }

  var catalog = {
    brand: brand, platforms: platforms, finishes: finishes, leadTime: leadTime, retail: retail, tiers: tiers, resale: resale, delivery: delivery,
    getPlatform: getPlatform, getFinish: getFinish, getDelivery: getDelivery, tierFor: tierFor, nextTier: nextTier,
    quote: quote, profit: profit, formatMoney: formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.CATALOG = catalog;
})(this);
