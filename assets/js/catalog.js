/*
 * Catálogo y reglas de precio.
 * Este archivo lo usan tanto el navegador (window.CATALOG) como la función
 * de servidor api/checkout.js (require), para que el precio cobrado siempre
 * se recalcule del lado del servidor con los mismos datos.
 *
 * Para cambiar precios, productos o plataformas, edita solo este archivo.
 */
(function (root) {
  var config = {
    storeName: "TapReview MX",
    currency: "MXN",
    // Número de WhatsApp para pedidos, en formato internacional sin "+" ni espacios.
    whatsapp: "5215500000000",
    freeShippingFrom: 999,
    shippingCost: 149,
  };

  // Descuento por volumen: se aplica por línea según la cantidad.
  var tiers = [
    { min: 1, off: 0 },
    { min: 3, off: 0.1 },
    { min: 5, off: 0.15 },
    { min: 10, off: 0.25 },
    { min: 25, off: 0.35 },
  ];

  // Plataformas a las que se puede programar el chip NFC.
  var platforms = [
    { id: "google", name: "Google", headline: "¡Déjanos tu reseña en Google!", cta: "Toca para calificarnos", stars: true, bg: "#1a56db", fg: "#ffffff", placeholder: "https://g.page/r/tu-negocio/review" },
    { id: "instagram", name: "Instagram", headline: "Síguenos en Instagram", cta: "Toca para seguirnos", stars: false, bg: "linear-gradient(160deg,#5b2bd6 0%,#d6249f 50%,#fd7e14 100%)", fg: "#ffffff", placeholder: "https://instagram.com/tu_negocio" },
    { id: "tiktok", name: "TikTok", headline: "Síguenos en TikTok", cta: "Toca para seguirnos", stars: false, bg: "#111111", fg: "#ffffff", placeholder: "https://www.tiktok.com/@tu_negocio" },
    { id: "facebook", name: "Facebook", headline: "Síguenos en Facebook", cta: "Toca para seguirnos", stars: false, bg: "#1d3fd1", fg: "#ffffff", placeholder: "https://facebook.com/tu_negocio" },
    { id: "whatsapp", name: "WhatsApp", headline: "Escríbenos por WhatsApp", cta: "Toca para chatear", stars: false, bg: "#128c4a", fg: "#ffffff", placeholder: "https://wa.me/5215500000000" },
    { id: "tripadvisor", name: "Tripadvisor", headline: "Califícanos en Tripadvisor", cta: "Toca para calificarnos", stars: true, bg: "#15a46b", fg: "#ffffff", placeholder: "https://www.tripadvisor.com.mx/..." },
    { id: "custom", name: "Mi enlace", headline: "Conoce más de nosotros", cta: "Toca con tu celular", stars: false, bg: "#0f172a", fg: "#ffffff", placeholder: "https://tu-sitio.com" },
  ];

  var products = [
    {
      id: "placa-escritorio",
      name: "Placa NFC de escritorio",
      tagline: "Acrílico premium que se sostiene sola en mostrador o mesa.",
      description:
        "Placa de acrílico transparente de 1.8 mm con chip NFC integrado y base para escritorio. Tus clientes acercan el celular y llegan directo a tu perfil de reseñas o redes, sin descargar ninguna app. Ideal para recepción, caja, mesas de restaurante y consultorios.",
      price: 449,
      compareAt: 599,
      images: ["assets/img/placas-stack.jpg", "assets/img/estructura-4-capas.jpg", "assets/img/plataformas.jpg"],
      platforms: ["google", "instagram", "tiktok", "facebook", "whatsapp", "tripadvisor", "custom"],
      features: [
        "Chip NFC213 original, compatible con iPhone y Android",
        "Acrílico transparente de 1.8 mm, acabado brillante",
        "Base de escritorio incluida",
        "Te lo entregamos programado con tu enlace",
        "Funciona también con código QR impreso",
      ],
      badge: "Más vendido",
      shape: "stand",
    },
    {
      id: "sticker-nfc",
      name: "Tarjeta NFC adhesiva",
      tagline: "Cuadrada, delgada y con adhesivo de superficie completa.",
      description:
        "Estructura de 4 capas: acrílico transparente, impresión a color, antena NFC y respaldo adhesivo. Pégala en la caja registradora, la puerta, la terminal de cobro o el menú. Resistente al uso diario y fácil de limpiar.",
      price: 299,
      compareAt: 399,
      images: ["assets/img/estructura-4-capas.jpg", "assets/img/plataformas.jpg", "assets/img/placas-stack.jpg"],
      platforms: ["google", "instagram", "tiktok", "facebook", "whatsapp", "tripadvisor", "custom"],
      features: [
        "Estructura premium de 4 capas",
        "Respaldo adhesivo de superficie completa",
        "Chip NFC213 reprogramable",
        "Medida aproximada 9 × 9 cm",
        "Te lo entregamos programado con tu enlace",
      ],
      badge: null,
      shape: "square",
    },
    {
      id: "personalizada",
      name: "Placa NFC 100% personalizada",
      tagline: "Con tu logo, tus colores y el texto que tú quieras.",
      description:
        "Diseñamos la placa con la identidad de tu marca: logotipo, colores, mensaje y código QR de respaldo. Te enviamos una prueba digital para aprobación antes de producir. Disponible en formato de escritorio o adhesivo.",
      price: 599,
      compareAt: 799,
      images: ["assets/img/plataformas.jpg", "assets/img/tiktok.jpg", "assets/img/whatsapp.jpg"],
      platforms: ["google", "instagram", "tiktok", "facebook", "whatsapp", "tripadvisor", "custom"],
      features: [
        "Diseño con tu logo y colores de marca",
        "Prueba digital para aprobación antes de producir",
        "Formato de escritorio o adhesivo",
        "Código QR de respaldo opcional",
        "Programación del chip incluida",
      ],
      badge: "Personalizable",
      shape: "stand",
      custom: true,
    },
  ];

  function getProduct(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }

  function getPlatform(id) {
    for (var i = 0; i < platforms.length; i++) if (platforms[i].id === id) return platforms[i];
    return null;
  }

  function discountFor(qty) {
    var off = 0;
    for (var i = 0; i < tiers.length; i++) if (qty >= tiers[i].min) off = tiers[i].off;
    return off;
  }

  // Precio unitario redondeado a pesos enteros.
  function unitPrice(product, qty) {
    return Math.round(product.price * (1 - discountFor(qty)));
  }

  function shippingFor(subtotal) {
    if (subtotal <= 0) return 0;
    return subtotal >= config.freeShippingFrom ? 0 : config.shippingCost;
  }

  function formatMoney(n) {
    return "$" + Number(n).toLocaleString("es-MX", { maximumFractionDigits: 0 }) + " MXN";
  }

  var catalog = {
    config: config,
    tiers: tiers,
    platforms: platforms,
    products: products,
    getProduct: getProduct,
    getPlatform: getPlatform,
    discountFor: discountFor,
    unitPrice: unitPrice,
    shippingFor: shippingFor,
    formatMoney: formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.CATALOG = catalog;
})(this);
