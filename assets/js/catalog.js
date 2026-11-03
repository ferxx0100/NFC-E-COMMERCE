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
  // Envío gratis desde esta cantidad de tarjetas en todo el pedido (un paquete de 100 cuenta como 100).
  var freeShippingFrom = 3;

  /*
   * Productos, en el orden en que aparecen.
   * - "retail": precio de una unidad (una pieza, o un paquete si el producto tiene "packOf").
   * - "wholesale": precio por pieza de mayoreo desde "wholesaleFrom" (o 20) unidades.
   *   null = un solo precio: no hay mayoreo y la página no muestra el selector menudeo/mayoreo.
   * - "pack": solo para mostrar el mayoreo como paquete (la lisa: 10 × $39.90 = paquete de 10 por $399).
   * - "packOf": el producto se vende por paquete; la cantidad del carrito cuenta paquetes
   *   y cada paquete trae "packOf" tarjetas (para el envío gratis cuentan las tarjetas).
   * - "customModes": personalización que se puede elegir ("blank" en blanco, "name" con nombre,
   *   "logo" con logo: el cliente nos manda el logo por WhatsApp después de pagar).
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
      retail: 199,
      wholesale: 99,
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
      retail: 199,
      wholesale: 99,
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
      customModes: ["blank", "name"],
      material: "Plástico mate",
      materialShort: "Plástico",
      stock: true,
      shape: "h",
      retail: 49,
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
      short: "Programada a tu web, app, tienda, menú o redes. En blanco, con tu nombre o con tu logo.",
      photos: { negra: "metal.jpg", plata: "metal.jpg", dorada: "metal.jpg" },
      custom: true,
      customModes: ["blank", "name", "logo"],
      material: "Metal (acero inoxidable)",
      materialShort: "Metal",
      stock: false,
      shape: "h",
      retail: 399,
      // Un solo precio: sin mayoreo.
      wholesale: null,
      variantLabel: "Color",
      variants: [
        { id: "negra", name: "Negra" },
        { id: "plata", name: "Plata" },
        { id: "dorada", name: "Dorada" },
      ],
    },
    {
      id: "papel",
      cartName: "Cartón negro ×100",
      name: "Tarjetas NFC de cartón negro (paquete de 100)",
      short: "100 tarjetas ligeras y mate por paquete. En blanco, con tu nombre o con tu logo.",
      photos: { negra: "papel.jpg" },
      custom: true,
      customModes: ["blank", "name", "logo"],
      material: "Cartón negro grueso",
      materialShort: "Cartón",
      stock: false,
      shape: "h",
      // Se vende solo por paquete: 1 unidad = 1 paquete de 100 tarjetas.
      retail: 499,
      wholesale: null,
      packOf: 100,
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
    { id: "envio", name: "Envío a toda la República", detail: "Gratis desde " + freeShippingFrom + " tarjetas", cost: 99, address: true },
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

  // ¿El producto tiene precio de mayoreo? (false = un solo precio).
  function hasWholesale(product) {
    return product.wholesale != null && product.wholesale < product.retail;
  }

  // Desde cuántas unidades aplica el mayoreo en un producto (Infinity si no tiene mayoreo).
  function minWholesale(product) {
    return hasWholesale(product) ? product.wholesaleFrom || wholesaleFrom : Infinity;
  }

  // Precio por unidad (pieza o paquete) según cuántas unidades de ese producto lleva el pedido.
  function unitPrice(product, qty) {
    return hasWholesale(product) && qty >= minWholesale(product) ? product.wholesale : product.retail;
  }

  // Tarjetas que trae una unidad del producto (1, o 100 en el paquete de cartón).
  function cardsPer(product) {
    return product.packOf || 1;
  }

  // "1 pieza", "3 piezas", "1 paquete", "2 paquetes".
  function unitLabel(product, n) {
    return n + (product.packOf ? (n === 1 ? " paquete" : " paquetes") : n === 1 ? " pieza" : " piezas");
  }

  // ¿Se puede elegir este modo de personalización ("blank", "name", "logo")?
  function allowsMode(product, mode) {
    return !!product.custom && (product.customModes || ["blank", "name"]).indexOf(mode) >= 0;
  }

  function cents(n) {
    return Math.round(n * 100) / 100;
  }

  // Regla de precio de cada producto en una frase (FAQ, datos para Google, README).
  function priceRule(product) {
    var m = formatMoney;
    if (product.packOf) return "Paquete de " + product.packOf + " tarjetas por " + m(product.retail) + ".";
    if (!hasWholesale(product)) return m(product.retail) + " por pieza, un solo precio.";
    if (product.pack) {
      return m(product.retail) + " por pieza o paquete de " + product.pack + " por " + m(cents(product.wholesale * product.pack)) +
        " (" + m(product.wholesale) + " c/u desde " + minWholesale(product) + ").";
    }
    return m(product.retail) + " por pieza; " + m(product.wholesale) + " c/u desde " + minWholesale(product) + " piezas (se pueden mezclar diseños o colores).";
  }

  // Personalización de una línea del pedido, igual en Mercado Pago, WhatsApp y el carrito.
  function customLabel(line) {
    if (!line.product.custom) return "";
    var out = [];
    if (line.text) out.push("nombre: " + line.text);
    if (line.logo) out.push("con logo (lo envía por WhatsApp)");
    return out.length ? out.join(" · ") : "en blanco";
  }

  // Precio aplicado a un grupo de quote(): "mayoreo, $99 c/u", "$499 por paquete de 100"…
  function groupPriceLabel(g) {
    var p = g.product;
    if (p.packOf) return formatMoney(g.unit) + " por paquete de " + p.packOf;
    if (!hasWholesale(p)) return "precio único, " + formatMoney(g.unit) + " c/u";
    if (p.pack) return (g.wholesale ? "precio de paquete" : "menudeo") + ", " + formatMoney(g.unit) + " c/u";
    return (g.wholesale ? "mayoreo" : "menudeo") + ", " + formatMoney(g.unit) + " c/u";
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
        text: allowsMode(p, "name") ? String(it.text || "").replace(/\s+/g, " ").trim().slice(0, 40) : "",
        // Solo una marca: la imagen del logo nunca viaja al servidor, el cliente la manda por WhatsApp.
        logo: allowsMode(p, "logo") && it.logo === true,
        dest: target ? target.id : "",
        link: target && target.id !== "luego" ? String(it.link || "").replace(/\s+/g, " ").trim().slice(0, 300) : "",
      });
      byProduct[p.id] = (byProduct[p.id] || 0) + n;
    });

    var groups = [];
    var subtotal = 0;
    var qty = 0;
    var cards = 0;
    products.forEach(function (p) {
      var n = byProduct[p.id];
      if (!n) return;
      var unit = unitPrice(p, n), ws = hasWholesale(p), min = minWholesale(p);
      groups.push({
        product: p,
        // Unidades: piezas, o paquetes si el producto tiene packOf.
        qty: n,
        cards: n * cardsPer(p),
        unit: unit,
        total: cents(unit * n),
        hasWholesale: ws,
        wholesale: ws && n >= min,
        saving: cents((p.retail - unit) * n),
        missing: ws && n < min ? min - n : 0,
        lines: lines.filter(function (l) { return l.product === p; }),
      });
      subtotal = cents(subtotal + unit * n);
      qty += n;
      cards += n * cardsPer(p);
    });

    var d = getDelivery(deliveryId);
    // El envío gratis cuenta tarjetas reales: un paquete de 100 ya lo tiene.
    var shipping = d.pickup || !cards || cards >= freeShippingFrom ? 0 : d.cost;
    return { groups: groups, qty: qty, cards: cards, subtotal: subtotal, delivery: d, shipping: shipping, total: cents(subtotal + shipping), error: qty ? null : "Agrega al menos una tarjeta." };
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
      var c = [l.text, l.logo ? "con logo" : ""].filter(Boolean).join(", ");
      return l.product.cartName + " " + l.variant.name + (c ? " (" + c + ")" : "") + " → " + what(l);
    });
  }

  function formatMoney(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
  }

  var catalog = {
    brand: brand, products: products, delivery: delivery, defaultDelivery: defaultDelivery, pickup: pickup, programTargets: programTargets,
    wholesaleFrom: wholesaleFrom, freeShippingFrom: freeShippingFrom, leadTime: leadTime,
    getProduct: getProduct, getVariant: getVariant, getDelivery: getDelivery, getTarget: getTarget, suggestTarget: suggestTarget,
    hasWholesale: hasWholesale, minWholesale: minWholesale, unitPrice: unitPrice, cardsPer: cardsPer, unitLabel: unitLabel, allowsMode: allowsMode,
    priceRule: priceRule, customLabel: customLabel, groupPriceLabel: groupPriceLabel, quote: quote, programSummary: programSummary, formatMoney: formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.CATALOG = catalog;
})(this);
