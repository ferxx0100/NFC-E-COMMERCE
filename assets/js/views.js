/*
 * Piezas de HTML y textos compartidos entre el navegador (window.VIEWS) y build.js,
 * que publica la página ya armada para que Google la lea completa.
 * Aquí están las preguntas frecuentes, los giros recomendados y las ciudades.
 */
(function (root) {
  var C = root.CATALOG || (typeof require === "function" ? require("./catalog.js") : null);
  var money = C.formatMoney;
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var FAQ = [
    { q: "¿Qué es una tarjeta NFC para reseñas de Google?", a: "Es una tarjeta con un chip NFC que guarda el enlace de reseñas de tu negocio. Tu cliente acerca su celular, se abre tu perfil de Google y te deja su calificación en segundos, sin buscarte ni escanear nada." },
    { q: "¿Cómo funciona la tecnología NFC?", a: "NFC significa comunicación de campo cercano. El chip no tiene batería: el celular le da energía al acercarse a 1 a 4 cm, lee el enlace guardado y lo abre al instante." },
    { q: "¿Funciona con iPhone y Android?", a: "Sí. En iPhone XS o más reciente funciona sin abrir nada; en iPhone 7 a X, desde el lector NFC del Centro de control. En Android basta con tener el NFC activado." },
    { q: "¿Cuánto cuesta una tarjeta NFC?", a: "Desde " + money(Math.min.apply(null, C.products.map(function (p) { return p.retail; }))) + " por pieza en menudeo. Desde " + C.wholesaleFrom + " piezas de un mismo producto pagas precio de mayoreo, a partir de " + money(Math.min.apply(null, C.products.map(function (p) { return p.wholesale; }))) + " por pieza." },
    { q: "¿Venden tarjetas NFC al mayoreo?", a: "Sí. Desde " + C.wholesaleFrom + " piezas de un mismo producto aplica el precio de mayoreo, aunque mezcles diseños o colores. Es el precio para revender o surtir varias sucursales." },
    { q: "¿Hacen envíos a toda la República?", a: "Sí, enviamos a todo México desde Guadalajara. El envío es gratis desde " + C.freeShippingFrom + " piezas; con menos cuesta " + money(C.delivery[0].cost) + "." },
    { q: "¿Puedo cambiar el enlace de la tarjeta?", a: "Sí, cuantas veces quieras con una app gratuita, mientras la tarjeta no esté bloqueada. Con tu compra recibes un video que te enseña a configurarla." },
    { q: "¿Qué es mejor, NFC o código QR?", a: "Con NFC tu cliente solo acerca el celular. Con QR tiene que abrir la cámara, enfocar y tocar el enlace. Muchas de nuestras tarjetas pueden llevar los dos." },
  ];

  var SECTORS = [
    { name: "Hoteles", text: "Reseñas de Google en recepción y WhatsApp del concierge en cada habitación.", rec: ["google", "whatsapp"] },
    { name: "Restaurantes y bares", text: "Una tarjeta en cada mesa para reseñas y otra en la barra para Instagram.", rec: ["google", "instagram"] },
    { name: "Escuelas", text: "Informes e inscripciones por WhatsApp y avisos por Facebook.", rec: ["whatsapp", "facebook"] },
    { name: "Consultorios y clínicas", text: "Reseñas que dan confianza a nuevos pacientes y citas por WhatsApp.", rec: ["google", "whatsapp"] },
    { name: "Salones y barberías", text: "Seguidores en Instagram y TikTok mientras el cliente espera.", rec: ["instagram", "tiktok"] },
    { name: "Profesionistas", text: "Una tarjeta metálica que comparte tu contacto con un toque.", rec: ["metal"] },
  ];

  /*
   * Ciudades con página propia (/tarjetas-nfc/<slug>/).
   * "days": tiempo de entrega estimado · "focus": a quién le sirve más en esa ciudad.
   */
  var CITIES = [
    { slug: "guadalajara", name: "Guadalajara", state: "Jalisco", days: "24 a 48 horas", focus: "Restaurantes, cafeterías, consultorios y tiendas que compiten por aparecer primero en Google Maps." },
    { slug: "zapopan", name: "Zapopan", state: "Jalisco", days: "24 a 48 horas", focus: "Plazas comerciales, restaurantes, gimnasios y clínicas con mucha competencia en reseñas." },
    { slug: "tlaquepaque", name: "Tlaquepaque", state: "Jalisco", days: "24 a 48 horas", focus: "Galerías, restaurantes y tiendas de artesanía que reciben turismo todo el año." },
    { slug: "tonala", name: "Tonalá", state: "Jalisco", days: "24 a 48 horas", focus: "Talleres, tiendas y mayoristas que venden por WhatsApp." },
    { slug: "tlajomulco", name: "Tlajomulco", state: "Jalisco", days: "24 a 48 horas", focus: "Negocios de colonia, escuelas y consultorios que crecen con recomendaciones." },
    { slug: "puerto-vallarta", name: "Puerto Vallarta", state: "Jalisco", days: "2 a 3 días hábiles", focus: "Hoteles, tours y restaurantes que dependen de sus reseñas de Google." },
    { slug: "zamora", name: "Zamora", state: "Michoacán", days: "2 a 3 días hábiles", focus: "Comercios, restaurantes y consultorios que quieren destacar en Google." },
    { slug: "morelia", name: "Morelia", state: "Michoacán", days: "2 a 3 días hábiles", focus: "Restaurantes del centro, hoteles y escuelas." },
    { slug: "leon", name: "León", state: "Guanajuato", days: "2 a 3 días hábiles", focus: "Zapaterías, tiendas y fábricas que venden por Instagram y WhatsApp." },
    { slug: "aguascalientes", name: "Aguascalientes", state: "Aguascalientes", days: "2 a 3 días hábiles", focus: "Restaurantes, gimnasios y empresas que reparten tarjetas de presentación." },
    { slug: "queretaro", name: "Querétaro", state: "Querétaro", days: "2 a 3 días hábiles", focus: "Empresas, restaurantes y profesionistas que usan tarjetas metálicas de presentación." },
    { slug: "ciudad-de-mexico", name: "Ciudad de México", state: "CDMX", days: "2 a 3 días hábiles", focus: "Restaurantes, bares, salones y oficinas donde cada reseña cuenta." },
    { slug: "monterrey", name: "Monterrey", state: "Nuevo León", days: "2 a 4 días hábiles", focus: "Restaurantes, clínicas, gimnasios y empresas con tarjetas de presentación NFC." },
    { slug: "puebla", name: "Puebla", state: "Puebla", days: "2 a 4 días hábiles", focus: "Restaurantes, hoteles del centro histórico y escuelas." },
    { slug: "toluca", name: "Toluca", state: "Estado de México", days: "2 a 4 días hábiles", focus: "Comercios, consultorios y empresas que venden por WhatsApp." },
    { slug: "san-luis-potosi", name: "San Luis Potosí", state: "San Luis Potosí", days: "2 a 4 días hábiles", focus: "Restaurantes, hoteles y empresas de la zona industrial." },
    { slug: "tepic", name: "Tepic", state: "Nayarit", days: "2 a 3 días hábiles", focus: "Restaurantes, consultorios y negocios que atienden turismo de la costa." },
    { slug: "colima", name: "Colima", state: "Colima", days: "2 a 3 días hábiles", focus: "Comercios, restaurantes y consultorios." },
    { slug: "cancun", name: "Cancún", state: "Quintana Roo", days: "3 a 5 días hábiles", focus: "Hoteles, restaurantes y tours que viven de sus reseñas." },
    { slug: "merida", name: "Mérida", state: "Yucatán", days: "3 a 5 días hábiles", focus: "Restaurantes, hoteles boutique y cafeterías." },
    { slug: "tijuana", name: "Tijuana", state: "Baja California", days: "3 a 5 días hábiles", focus: "Restaurantes, clínicas y consultorios que atienden a clientes de ambos lados de la frontera." },
    { slug: "mazatlan", name: "Mazatlán", state: "Sinaloa", days: "3 a 4 días hábiles", focus: "Hoteles, restaurantes de mariscos y tours." },
    { slug: "culiacan", name: "Culiacán", state: "Sinaloa", days: "3 a 4 días hábiles", focus: "Restaurantes, tiendas y consultorios." },
    { slug: "hermosillo", name: "Hermosillo", state: "Sonora", days: "3 a 5 días hábiles", focus: "Restaurantes, gimnasios y empresas." },
    { slug: "chihuahua", name: "Chihuahua", state: "Chihuahua", days: "3 a 5 días hábiles", focus: "Restaurantes, comercios y empresas de servicios." },
    { slug: "saltillo", name: "Saltillo", state: "Coahuila", days: "2 a 4 días hábiles", focus: "Empresas, restaurantes y profesionistas." },
    { slug: "torreon", name: "Torreón", state: "Coahuila", days: "3 a 4 días hábiles", focus: "Restaurantes, tiendas y consultorios." },
    { slug: "veracruz", name: "Veracruz", state: "Veracruz", days: "3 a 4 días hábiles", focus: "Restaurantes, hoteles y comercios del puerto." },
    { slug: "oaxaca", name: "Oaxaca", state: "Oaxaca", days: "3 a 5 días hábiles", focus: "Restaurantes, hoteles y tiendas de artesanía con turismo internacional." },
    { slug: "acapulco", name: "Acapulco", state: "Guerrero", days: "3 a 5 días hábiles", focus: "Hoteles, restaurantes y bares de playa." },
  ];

  function stockLabel(p) {
    return p.stock ? C.leadTime.stock : C.leadTime.order;
  }

  // Tarjeta de producto con giro 3D, dos precios y botón de compra.
  function product(p, variantId, pick) {
    var CARDS = root.CARDS;
    var v = C.getVariant(p, variantId) || p.variants[0];
    var n = pick || 1;
    return '<article class="product shape-' + p.shape + '" id="' + p.id + '" data-product="' + p.id + '">' +
      '<div class="product-media"><div class="tilt"><div class="flip" style="animation-delay:-' + C.products.indexOf(p) * 2.3 + 's">' +
      '<div class="face front" data-face="front">' + CARDS.card(p.id, v.id) + "</div>" +
      '<div class="face back" data-face="back">' + CARDS.back(p.id, v.id) + "</div></div></div></div>" +
      '<div class="product-body">' +
      '<div class="product-head"><h3>' + esc(p.name) + '</h3><span class="badge' + (p.stock ? " in" : "") + '">' + (p.stock ? "En stock" : "Bajo pedido") + "</span></div>" +
      '<p class="product-desc">' + esc(p.short) + " <span>" + esc(p.material) + " con chip NFC · " + esc(stockLabel(p)) + (p.note ? " · " + esc(p.note) : "") + "</span></p>" +
      '<div class="variants" role="group" aria-label="' + esc(p.variantLabel) + '">' + p.variants.map(function (x) {
        return '<button type="button" class="variant" data-variant="' + p.id + ":" + x.id + '" aria-pressed="' + (x.id === v.id) + '">' + CARDS.swatch(p.id, x.id) + esc(x.name) + "</button>";
      }).join("") + "</div>" +
      '<div class="two-prices">' +
      "<div><span>Menudeo</span><strong>" + money(p.retail) + "</strong><small>por pieza</small></div>" +
      '<div class="ws"><span>Mayoreo</span><strong>' + money(p.wholesale) + "</strong><small>desde " + C.wholesaleFrom + " piezas</small></div></div>" +
      '<div class="buy"><div class="stepper"><button type="button" data-pick-dec="' + p.id + '" aria-label="Menos">−</button>' +
      '<input type="number" min="1" max="999" inputmode="numeric" data-pick="' + p.id + '" value="' + n + '" aria-label="Cantidad"><button type="button" data-pick-inc="' + p.id + '" aria-label="Más">+</button></div>' +
      '<button type="button" class="btn btn-primary" data-add="' + p.id + '">Agregar</button></div>' +
      '<p class="pick-note" data-pick-note="' + p.id + '">' + pickNote(p, n) + "</p>" +
      "</div></article>";
  }

  function pickNote(p, n) {
    if (n >= C.wholesaleFrom) return "Precio de mayoreo: " + money(p.wholesale * n) + " por " + n + " piezas";
    if (n > 1) return money(p.retail * n) + " por " + n + " piezas · con " + C.wholesaleFrom + " pagas " + money(p.wholesale) + " c/u";
    return "Video de configuración incluido";
  }

  function products(sel, picks) {
    sel = sel || {};
    picks = picks || {};
    return C.products.map(function (p) { return product(p, sel[p.id], picks[p.id]); }).join("");
  }

  function faq() {
    return FAQ.map(function (f) { return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>"; }).join("");
  }

  function sectors() {
    var CARDS = root.CARDS, social = C.getProduct("redes");
    return SECTORS.map(function (s) {
      return '<div class="sector"><h3>' + esc(s.name) + "</h3><p>" + esc(s.text) + '</p><div class="rec">' + s.rec.map(function (r) {
        var v = C.getVariant(social, r);
        if (v) return "<span>" + CARDS.swatch("redes", r) + esc(v.name) + "</span>";
        if (r === "google") return "<span>" + '<svg viewBox="0 0 48 48" aria-hidden="true">' + CARDS.logo("google", 0, 0, 48, "sec" + s.name.length) + "</svg>Google</span>";
        return '<span class="plain">Tarjeta metálica</span>';
      }).join("") + "</div></div>";
    }).join("");
  }

  function cityLinks(current, prefix) {
    return CITIES.map(function (c) {
      return '<a href="' + prefix + "tarjetas-nfc/" + c.slug + '/"' + (c.slug === current ? ' aria-current="page"' : "") + ">" + esc(c.name) + "</a>";
    }).join("");
  }

  var views = { FAQ: FAQ, SECTORS: SECTORS, CITIES: CITIES, product: product, products: products, pickNote: pickNote, faq: faq, sectors: sectors, cityLinks: cityLinks, esc: esc };
  if (typeof module !== "undefined" && module.exports) module.exports = views;
  else root.VIEWS = views;
})(typeof window !== "undefined" ? window : this);
