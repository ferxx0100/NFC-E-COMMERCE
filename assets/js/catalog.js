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
      cartName: "Reseñas Google",
      name: "Tarjeta NFC de reseñas de Google",
      short: "Tus clientes te califican con 5 estrellas en segundos.",
      photos: { negra: "google-negra.jpg", blanca: "google-blanca.jpg" },
      material: "Plástico rígido",
      materialShort: "Plástico",
      stock: true,
      shape: "v",
      retail: 345,
      wholesale: 175,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra", screen: "google", color: "#4285F4" },
        { id: "blanca", name: "Blanca", screen: "google", color: "#4285F4" },
      ],
    },
    {
      id: "redes",
      cartName: "Redes sociales",
      name: "Tarjetas NFC para redes sociales",
      short: "Más seguidores y mensajes sin que te busquen por nombre.",
      photos: { instagram: "redes.jpg", whatsapp: "whatsapp.jpg", facebook: "facebook.jpg", tiktok: "redes.jpg" },
      material: "Plástico rígido",
      materialShort: "Plástico",
      stock: true,
      shape: "v",
      retail: 345,
      wholesale: 175,
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
      cartName: "Lisa de plástico",
      name: "Tarjeta NFC lisa de plástico",
      short: "Negra o blanca. En blanco o con tu nombre.",
      photos: { negra: "lisa.jpg", blanca: "lisa.jpg" },
      custom: true,
      material: "Plástico mate",
      materialShort: "Plástico",
      stock: true,
      shape: "h",
      retail: 68,
      // Paquete de 10 por $399.
      wholesale: 39.9,
      wholesaleFrom: 10,
      pack: 10,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "blanca", name: "Blanca" },
      ],
    },
    {
      id: "metal",
      cartName: "Metálica",
      name: "Tarjeta NFC metálica",
      short: "Programada a tu web, app, tienda, menú o redes. En blanco o con tu nombre.",
      photos: { negra: "metal.jpg", plata: "metal.jpg", dorada: "metal.jpg" },
      custom: true,
      material: "Metal (acero inoxidable)",
      materialShort: "Metal",
      stock: false,
      shape: "h",
      retail: 450,
      wholesale: 320,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "plata", name: "Plata" },
        { id: "dorada", name: "Dorada" },
      ],
    },
    {
      id: "papel",
      cartName: "Papel negro",
      name: "Tarjeta NFC de papel negro",
      short: "Ligera y mate. En blanco o con tu nombre.",
      photos: { negra: "papel.jpg" },
      custom: true,
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

  /*
   * Recoger en Guadalajara: el cliente paga en línea y pasa por su pedido, sin costo de envío.
   * Edita la zona, los municipios o la nota cuando cambies de punto de entrega.
   */
  var pickup = {
    zone: "Zona Metropolitana de Guadalajara",
    cities: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco", "El Salto"],
    note: "Sin costo de envío · te escribimos por WhatsApp para coordinar punto y hora",
  };

  // Opciones de entrega. "pickup": nunca cobra envío ni pide dirección. "address": pide dirección completa.
  var delivery = [
    { id: "recoger", name: "Recoger en Guadalajara", detail: pickup.note, cost: 0, pickup: true },
    { id: "envio", name: "Envío a toda la República", detail: "Gratis desde " + freeShippingFrom + " piezas", cost: 99, address: true },
  ];
  var defaultDelivery = "envio";

  /*
   * "¿Qué quieres que abra tu tarjeta?": a dónde se programa cada tarjeta.
   * "suggest": el destino que se propone según el producto o diseño.
   */
  var programTargets = [
    { id: "google", name: "Reseñas de Google", placeholder: "https://g.page/r/…", help: "En tu Perfil de Negocio de Google toca «Pedir reseñas» y copia el enlace." },
    { id: "instagram", name: "Instagram", placeholder: "@tunegocio", help: "Tu usuario o el enlace de tu perfil." },
    { id: "facebook", name: "Facebook", placeholder: "facebook.com/tunegocio", help: "Abre tu página, toca Compartir y copia el enlace." },
    { id: "tiktok", name: "TikTok", placeholder: "@tunegocio", help: "Tu usuario de TikTok." },
    { id: "whatsapp", name: "WhatsApp", placeholder: "33 1234 5678", help: "Número a 10 dígitos. Si quieres, agrega el mensaje con el que te escriben." },
    { id: "web", name: "Página web, menú o tienda", placeholder: "https://tunegocio.com", help: "El enlace completo de tu página, menú digital o tienda en línea." },
    { id: "vcard", name: "Tarjeta de contacto (vCard)", placeholder: "Nombre, puesto, teléfono y correo", help: "Al acercar el celular se guarda tu contacto. Escribe los datos que quieres que aparezcan." },
    { id: "otro", name: "Otro", placeholder: "Escribe el enlace o lo que quieres que abra", help: "Cualquier enlace: Google Maps, YouTube, Spotify, Linktree, catálogo…" },
    { id: "luego", name: "Aún no sé / la programo yo con el video", placeholder: "", help: "Te mandamos un video corto para programarla tú en un minuto." },
  ];

  function getProduct(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }

  function getVariant(product, id) {
    for (var i = 0; i < product.variants.length; i++) if (product.variants[i].id === id) return product.variants[i];
    return null;
  }

  // Una opción desconocida se toma como envío (nunca regala el envío por error).
  function getDelivery(id) {
    for (var i = 0; i < delivery.length; i++) if (delivery[i].id === id) return delivery[i];
    for (var j = 0; j < delivery.length; j++) if (delivery[j].id === defaultDelivery) return delivery[j];
    return delivery[0];
  }

  function getTarget(id) {
    for (var i = 0; i < programTargets.length; i++) if (programTargets[i].id === id) return programTargets[i];
    return null;
  }

  // Destino que se propone para una tarjeta: Google para reseñas, la red del diseño en redes sociales.
  function suggestTarget(productId, variantId) {
    if (productId === "google") return "google";
    if (productId === "redes" && getTarget(variantId)) return variantId;
    return "";
  }

  // Desde cuántas piezas aplica el mayoreo en un producto.
  function minWholesale(product) {
    return product.wholesaleFrom || wholesaleFrom;
  }

  // Precio por pieza según cuántas piezas de ese producto lleva el pedido.
  function unitPrice(product, qty) {
    return qty >= minWholesale(product) ? product.wholesale : product.retail;
  }

  function cents(n) {
    return Math.round(n * 100) / 100;
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
      var target = getTarget(it.dest);
      lines.push({
        product: p, variant: v, qty: n,
        text: p.custom ? String(it.text || "").slice(0, 40) : "",
        dest: target ? target.id : "",
        link: target && target.id !== "luego" ? String(it.link || "").replace(/\s+/g, " ").trim().slice(0, 300) : "",
      });
      byProduct[p.id] = (byProduct[p.id] || 0) + n;
    });

    var groups = [];
    var subtotal = 0;
    var qty = 0;
    products.forEach(function (p) {
      var n = byProduct[p.id];
      if (!n) return;
      var unit = unitPrice(p, n), min = minWholesale(p);
      groups.push({
        product: p,
        qty: n,
        unit: unit,
        total: cents(unit * n),
        wholesale: n >= min,
        saving: cents((p.retail - unit) * n),
        missing: n < min ? min - n : 0,
        lines: lines.filter(function (l) { return l.product === p; }),
      });
      subtotal = cents(subtotal + unit * n);
      qty += n;
    });

    var d = getDelivery(deliveryId);
    var shipping = d.pickup || !qty || qty >= freeShippingFrom ? 0 : d.cost;
    return { groups: groups, qty: qty, subtotal: subtotal, delivery: d, shipping: shipping, total: subtotal + shipping, error: qty ? null : "Agrega al menos una tarjeta." };
  }

  /*
   * Texto de "qué abre cada tarjeta" para WhatsApp y Mercado Pago.
   * lines: las líneas de quote(). Si todas van igual, sale una sola línea "Todas".
   */
  function programSummary(lines) {
    function what(l) {
      var t = getTarget(l.dest);
      if (!t) return "por definir";
      if (t.id === "luego") return t.name;
      return t.name + (l.link ? ": " + l.link : " (enlace pendiente)");
    }
    if (!lines || !lines.length) return [];
    var first = what(lines[0]);
    var same = lines.length > 1 && lines.every(function (l) { return what(l) === first; });
    if (same) return ["Todas: " + first];
    return lines.map(function (l) {
      return l.product.cartName + " " + l.variant.name + (l.text ? " (" + l.text + ")" : "") + " → " + what(l);
    });
  }

  function formatMoney(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
  }

  var catalog = {
    brand: brand, products: products, delivery: delivery, defaultDelivery: defaultDelivery, pickup: pickup, programTargets: programTargets,
    wholesaleFrom: wholesaleFrom, freeShippingFrom: freeShippingFrom, leadTime: leadTime,
    getProduct: getProduct, getVariant: getVariant, getDelivery: getDelivery, getTarget: getTarget, suggestTarget: suggestTarget, minWholesale: minWholesale, unitPrice: unitPrice, quote: quote, programSummary: programSummary, formatMoney: formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.CATALOG = catalog;
})(this);
