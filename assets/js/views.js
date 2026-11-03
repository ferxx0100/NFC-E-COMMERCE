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

  var ship = C.getDelivery("envio");
  var pick = C.pickup;
  var G = C.getProduct("google"), LISA = C.getProduct("lisa"), METAL = C.getProduct("metal"), PAPEL = C.getProduct("papel");
  // Precio más bajo por pieza suelta (sin contar los paquetes).
  var fromPrice = Math.min.apply(null, C.products.filter(function (p) { return !p.packOf; }).map(function (p) { return p.retail; }));
  var priceList =
    "Reseñas de Google y redes sociales: " + C.priceRule(G) +
    " Lisa de plástico: " + C.priceRule(LISA) +
    " Metálica: " + C.priceRule(METAL) +
    " Cartón negro: " + C.priceRule(PAPEL).replace(/^P/, "p");
  var setup = "Nosotros te las configuramos con tu enlace, o si prefieres te mandamos un video corto para que las configures tú.";
  var FAQ = [
    { q: "¿Qué es una tarjeta NFC?", a: "Una tarjeta con un chip. Acercas el celular y se abre lo que tú quieras: tus reseñas de Google, Instagram, WhatsApp, tu menú o tu contacto. Sin escanear nada y sin apps." },
    { q: "¿Todas las tarjetas son NFC?", a: "Sí. Todas llevan chip NFC original, en plástico, metal o cartón." },
    { q: "¿Funcionan con iPhone y Android?", a: "Sí. iPhone XS o más nuevo la lee sin apps, solo acercándolo. En Android basta con tener el NFC encendido (Ajustes → Conexiones → NFC)." },
    { q: "¿Y si el celular de mi cliente no tiene NFC?", a: "La gran mayoría de los celulares desde 2018 tienen NFC. Si alguno no lo tiene, le compartes el mismo enlace por WhatsApp." },
    { q: "¿Cuánto cuesta una tarjeta NFC?", a: "Desde " + money(fromPrice) + " por pieza. " + priceList },
    { q: "¿Cómo pago?", a: "Aquí mismo en la página con Mercado Pago: tarjeta de crédito o débito, efectivo en OXXO, transferencia SPEI o saldo de Mercado Pago. Es pago seguro: nosotros nunca vemos los datos de tu tarjeta." },
    { q: "¿Puedo recoger en Guadalajara sin pagar envío?", a: "Sí. Elige «Recoger en Guadalajara» en el carrito: pagas en línea y pasas por tu pedido sin costo de envío. Te escribimos por WhatsApp para coordinar punto y hora. Aplica en " + pick.cities.join(", ") + "." },
    { q: "¿Hacen envíos a toda la República?", a: "Sí. El envío cuesta " + money(ship.cost) + " y es gratis desde " + C.freeShippingFrom + " tarjetas en tu pedido (un paquete de cartón ya trae " + PAPEL.packOf + ", así que va con envío gratis)." },
    { q: "¿En cuánto tiempo la recibo?", a: "Las tarjetas en existencia salen en 24 horas. Las que dicen «Bajo pedido» se fabrican en 7 a 12 días hábiles. El envío tarda de 2 a 5 días hábiles según tu ciudad." },
    { q: "¿Llegan programadas?", a: "Sí. " + setup + " En el carrito eliges qué abre cada tarjeta (Google, Instagram, WhatsApp, tu web o tu contacto) y nos pasas el enlace; si aún no lo sabes, te lo pedimos por WhatsApp." },
    { q: "¿Cómo saco mi enlace de reseñas de Google?", a: "Entra a tu Perfil de Negocio de Google, toca «Pedir reseñas» y copia el enlace. Si no lo encuentras, te ayudamos por WhatsApp." },
    { q: "¿Puedo programarlas yo mismo?", a: "Sí. Con una app gratuita para escribir NFC (por ejemplo NFC Tools, en iPhone y Android) pegas tu enlace y acercas la tarjeta. Te mandamos un video corto con los pasos." },
    { q: "¿Puedo cambiar el enlace después?", a: "Sí, las veces que quieras." },
    { q: "¿Pueden llevar mi nombre o logo?", a: "La lisa de plástico va en blanco o con tu nombre (hasta 40 caracteres). La metálica y el paquete de cartón negro van en blanco, con tu nombre o con tu logo; en el cartón aplica a las " + PAPEL.packOf + " tarjetas del paquete. Si eliges logo, puedes subirlo para ver cómo queda y después de pagar nos lo mandas por WhatsApp (PNG o PDF)." },
    { q: "¿Venden mayoreo?", a: "Sí. En reseñas de Google y redes sociales pagas " + money(G.wholesale) + " c/u desde " + C.minWholesale(G) + " piezas de un mismo producto, y puedes mezclar diseños o colores. La lisa de plástico tiene paquete de " + LISA.pack + " por " + money(LISA.wholesale * LISA.pack) + " y el cartón negro se vende en paquete de " + PAPEL.packOf + " por " + money(PAPEL.retail) + ". La metálica tiene un solo precio: " + money(METAL.retail) + ". Ideal para revender." },
    { q: "¿Necesitan batería o se gastan?", a: "No. El chip no usa batería: toma energía del celular al acercarlo. Dura años con uso normal." },
    { q: "¿La tarjeta guarda datos de quien la toca?", a: "No. Solo tiene guardado tu enlace. No lee ni guarda información del celular de tus clientes." },
    { q: "¿Y si mi tarjeta no funciona?", a: "Te la reemplazamos sin costo. Escríbenos por WhatsApp con tu número de pedido." },
    { q: "¿Dan factura?", a: "Pregúntanos por WhatsApp antes de pagar y te decimos cómo." },
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

  function photoFor(p, v) {
    return p.photos && p.photos[v.id] ? "/assets/img/productos/" + p.photos[v.id] : null;
  }

  // Reverso de la ficha: la foto real del producto (o el reverso dibujado si no hay foto).
  function backFace(p, v) {
    var src = photoFor(p, v);
    return src ? '<img src="' + src + '" alt="Foto real: ' + esc(p.name + " " + v.name) + '" loading="lazy"><span>Foto real</span>' : root.CARDS.back(p.id, v.id);
  }

  var MODES = { blank: "En blanco", name: "Con nombre", logo: "Con logo" };

  // Personalización elegida, validada contra el producto: { mode, text, logo }.
  function customMode(p, custom) {
    custom = custom || {};
    return C.allowsMode(p, custom.mode) ? custom.mode : "blank";
  }

  // Lo que se dibuja en el frente: el nombre, el logo subido o "TU LOGO" de muestra.
  function cardOpts(p, custom) {
    var mode = customMode(p, custom);
    if (mode === "name") return { text: custom.text || "" };
    if (mode === "logo") return custom.logo ? { logo: custom.logo } : { text: "TU LOGO" };
    return null;
  }

  // Bloque de personalización: En blanco / Con nombre / Con logo.
  function customize(p, custom) {
    var mode = customMode(p, custom), modes = p.customModes || ["blank", "name"];
    var html = '<div class="customize"><div class="mode-pick' + (modes.length > 2 ? " three" : "") + '" role="radiogroup" aria-label="Personalización">' +
      modes.map(function (m) {
        return '<button type="button" role="radio" data-mode="' + p.id + ":" + m + '" aria-checked="' + (m === mode) + '">' + MODES[m] + "</button>";
      }).join("") + "</div>";
    if (mode === "name") {
      html += '<div class="name-field"><input type="text" maxlength="40" data-text="' + p.id + '" value="' + esc(custom.text || "") + '" placeholder="Escribe el nombre" aria-label="Nombre en la tarjeta">' +
        '<span class="count" data-count-for="' + p.id + '">' + (custom.text || "").length + "/40</span></div>" +
        (p.packOf ? '<p class="custom-note">El mismo nombre en las ' + p.packOf + " tarjetas del paquete.</p>" : "");
    } else if (mode === "logo") {
      html += '<div class="logo-field"><div class="logo-row"><label class="logo-btn">' + (custom.logo ? "Cambiar logo" : "Ver mi logo en la tarjeta") +
        '<input type="file" accept="image/*" data-logo="' + p.id + '" hidden></label>' +
        (custom.logo ? '<button type="button" class="logo-clear" data-logo-clear="' + p.id + '">Quitar</button>' : "<small>Opcional · solo se ve aquí</small>") + "</div>" +
        '<p class="custom-note logo-note"><strong>Después de pagar nos mandas tu logo por WhatsApp (PNG o PDF).</strong>' +
        (p.packOf ? " Va en las " + p.packOf + " tarjetas del paquete." : "") + "</p></div>";
    }
    return html + "</div>";
  }

  // Precios de la ficha: dos botones (menudeo / mayoreo o paquete) o un solo precio.
  function prices(p, n) {
    if (!C.hasWholesale(p)) {
      return '<div class="one-price"><strong>' + money(p.retail) + "</strong><small>" +
        (p.packOf ? "Paquete de " + p.packOf + " tarjetas · " + money(p.retail / p.packOf) + " c/u" : "Por pieza · un solo precio") + "</small></div>";
    }
    var min = C.minWholesale(p), ws = n >= min;
    var wsPrice = p.pack ? money(p.wholesale * p.pack) : money(p.wholesale);
    var wsLabel = p.pack ? "Paquete de " + p.pack : "Mayoreo " + min + "+ · c/u";
    return '<div class="two-prices" role="radiogroup" aria-label="Precio">' +
      '<button type="button" role="radio" data-tier="retail" data-pid="' + p.id + '" aria-checked="' + !ws + '"><strong>' + money(p.retail) + "</strong><small>Menudeo · pieza</small></button>" +
      '<button type="button" role="radio" data-tier="wholesale" data-pid="' + p.id + '" aria-checked="' + ws + '"><strong>' + wsPrice + "</strong><small>" + wsLabel + "</small></button></div>";
  }

  // Tarjeta de producto: da vuelta al pasar el mouse, colores, precios, cantidad y botón.
  function product(p, variantId, pick, custom) {
    var CARDS = root.CARDS;
    var v = C.getVariant(p, variantId) || p.variants[0];
    var n = pick || 1;
    custom = custom || {};
    var unitName = p.packOf ? "Paquetes" : "Cantidad";
    return '<article class="product shape-' + p.shape + (p.packOf ? " is-pack" : "") + '" id="' + p.id + '" data-product="' + p.id + '">' +
      '<div class="product-media"><div class="tilt"><div class="flip">' +
      '<div class="face front" data-face="front">' + CARDS.card(p.id, v.id, cardOpts(p, custom)) + "</div>" +
      '<div class="face back' + (photoFor(p, v) ? " photo" : "") + '" data-face="back">' + backFace(p, v) + "</div></div></div>" +
      (p.stock ? "" : '<span class="soon">Bajo pedido</span>') + (p.packOf ? '<span class="pack-badge">×' + p.packOf + " tarjetas</span>" : "") + "</div>" +
      '<div class="product-body">' +
      '<p class="kicker">NFC · ' + esc(p.materialShort) + "</p>" +
      "<h3>" + esc(p.name.replace("Tarjeta NFC ", "Tarjeta ").replace("Tarjetas NFC ", "Tarjetas ")) + "</h3>" +
      '<p class="short">' + esc(p.short) + "</p>" +
      '<div class="variants" role="group" aria-label="' + esc(p.variantLabel) + '">' + p.variants.map(function (x) {
        return '<button type="button" class="variant" data-variant="' + p.id + ":" + x.id + '" aria-pressed="' + (x.id === v.id) + '" title="' + esc(x.name) + '">' + CARDS.swatch(p.id, x.id) + "<span>" + esc(x.name) + "</span></button>";
      }).join("") + "</div>" +
      (p.custom ? customize(p, custom) : "") +
      prices(p, n) +
      '<div class="buy"><div class="stepper"><button type="button" data-pick-dec="' + p.id + '" aria-label="Menos">−</button>' +
      '<input type="number" min="1" max="999" inputmode="numeric" data-pick="' + p.id + '" value="' + n + '" aria-label="' + unitName + '"><button type="button" data-pick-inc="' + p.id + '" aria-label="Más">+</button></div>' +
      '<button type="button" class="btn btn-primary" data-add="' + p.id + '">' + (p.packOf ? "Agregar paquete" : "Agregar al carrito") + "</button></div>" +
      '<p class="pick-note" data-pick-note="' + p.id + '">' + pickNote(p, n) + "</p>" +
      "</div></article>";
  }

  // "3 piezas · $597", "10 piezas · $399 (paquete de 10)", "2 paquetes (200 tarjetas) · $998".
  function pickNote(p, n) {
    var unit = C.unitPrice(p, n), ws = C.hasWholesale(p) && n >= C.minWholesale(p);
    var total = money(Math.round(unit * n * 100) / 100);
    if (p.packOf) return C.unitLabel(p, n) + " (" + (n * p.packOf).toLocaleString("es-MX") + " tarjetas) · " + total;
    var note = C.unitLabel(p, n) + " · " + total;
    if (ws) return note + (p.pack ? " (precio de paquete)" : " (mayoreo)");
    if (C.hasWholesale(p)) {
      var miss = C.minWholesale(p) - n;
      return note + " · con " + miss + " más pagas " + money(p.wholesale) + " c/u";
    }
    return note;
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

  var views = { backFace: backFace, photoFor: photoFor, FAQ: FAQ, SECTORS: SECTORS, CITIES: CITIES, product: product, products: products, pickNote: pickNote, customMode: customMode, cardOpts: cardOpts, faq: faq, sectors: sectors, cityLinks: cityLinks, esc: esc };
  if (typeof module !== "undefined" && module.exports) module.exports = views;
  else root.VIEWS = views;
})(typeof window !== "undefined" ? window : this);
