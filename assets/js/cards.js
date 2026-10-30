/*
 * Dibuja las tarjetas NFC como SVG (formato de tarjeta bancaria, 856 × 540).
 * Todo sale de CATALOG.products: si cambias un texto allá, cambia en la página
 * y en las imágenes exportadas (tools/exportar-imagenes.js).
 */
(function () {
  var C = window.CATALOG;
  var uid = 0;
  var SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
  var SERIF = "'Instrument Serif', Georgia, serif";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Símbolo de la marca: punto con ondas de proximidad.
  function mark(x, y, s, color) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round">' +
      '<circle cx="0" cy="0" r="3.2" fill="' + color + '" stroke="none"/>' +
      '<path d="M7 -7a10 10 0 0 1 0 14M12.5 -12.5a17.7 17.7 0 0 1 0 25M18 -18a25.5 25.5 0 0 1 0 36"/></g>';
  }

  // Ondas de "sin contacto" centradas en (cx, cy).
  function contactless(cx, cy, r, color, width) {
    var d = "";
    for (var i = 0; i < 4; i++) {
      var rr = r * (0.22 + i * 0.18);
      d += "M" + (cx - r * 0.46 + i * r * 0.056) + " " + (cy - rr) + "a" + rr + " " + rr + " 0 0 1 0 " + rr * 2;
    }
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (width || r * 0.075) + '" stroke-linecap="round"/>';
  }

  /*
   * Logotipos de cada plataforma dentro de un cuadro de lado "s" en (x, y).
   * Son marcas de sus dueños: se muestran para que el cliente identifique
   * a qué perfil abre cada tarjeta.
   */
  function logo(id, x, y, s, gid) {
    var k = s / 48;
    var g = '<g transform="translate(' + x + " " + y + ") scale(" + k + ')">';
    if (id === "google") {
      return g + '<rect width="48" height="48" rx="11" fill="#fff"/><g transform="translate(9 9) scale(.625)">' +
        '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
        '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
        '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
        '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></g></g>';
    }
    if (id === "instagram") {
      return g + '<defs><linearGradient id="' + gid + 'ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".3" stop-color="#FA7E1E"/><stop offset=".6" stop-color="#D62976"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs>' +
        '<rect width="48" height="48" rx="11" fill="url(#' + gid + 'ig)"/>' +
        '<rect x="11" y="11" width="26" height="26" rx="8" fill="none" stroke="#fff" stroke-width="3.2"/>' +
        '<circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" stroke-width="3.2"/><circle cx="31.6" cy="16.4" r="1.9" fill="#fff"/></g>';
    }
    if (id === "whatsapp") {
      return g + '<rect width="48" height="48" rx="11" fill="#25D366"/>' +
        '<path d="M24 10.5a13.5 13.5 0 0 0-11.6 20.4L10.5 37.5l6.8-1.8A13.5 13.5 0 1 0 24 10.5z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M19.3 17.6c.4-.4 1-.4 1.3 0l1.6 2.4c.3.4.2.9-.1 1.2l-.9.9c.7 1.6 2 2.9 3.6 3.6l.9-.9c.3-.3.8-.4 1.2-.1l2.4 1.6c.4.3.4.9 0 1.3l-1 1c-.7.7-1.8.9-2.7.5-3.2-1.4-5.8-4-7.2-7.2-.4-.9-.2-2 .5-2.7z" fill="#fff"/></g>';
    }
    if (id === "tiktok") {
      var note = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
      return g + '<rect width="48" height="48" rx="11" fill="#000" stroke="#333" stroke-width="1"/>' +
        '<g transform="translate(12.5 11) scale(1.05)"><path d="' + note + '" fill="#25F4EE" transform="translate(-1 -1)"/><path d="' + note + '" fill="#FE2C55" transform="translate(1 1)"/><path d="' + note + '" fill="#fff"/></g></g>';
    }
    if (id === "facebook") {
      return g + '<rect width="48" height="48" rx="11" fill="#1877F2"/>' +
        '<path d="M26.6 40V26.2h4.6l.7-5.4h-5.3v-3.4c0-1.6.4-2.6 2.7-2.6h2.8V10c-.5-.1-2.2-.2-4.1-.2-4.1 0-6.9 2.5-6.9 7.1v3.9h-4.6v5.4h4.6V40z" fill="#fff"/></g>';
    }
    return "";
  }

  // Fondo con textura: "pvc" (mate), "gloss" (brillante), "paper" (fibra) o "brushed" (metal cepillado).
  function base(id, stops, kind, light, rx) {
    var tone = light ? "0" : "1";
    var filter;
    if (kind === "brushed") {
      filter = '<filter id="' + id + 'n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".002 .9" numOctaves="3" seed="4"/>' +
        '<feColorMatrix values="0 0 0 0 ' + tone + "  0 0 0 0 " + tone + "  0 0 0 0 " + tone + "  0 0 0 " + (light ? ".14" : ".16") + ' 0"/></filter>';
    } else {
      filter = '<filter id="' + id + 'n"><feTurbulence type="fractalNoise" baseFrequency="' + (kind === "paper" ? ".5" : ".9") + '" numOctaves="2" stitchTiles="stitch"/>' +
        '<feColorMatrix values="0 0 0 0 ' + tone + "  0 0 0 0 " + tone + "  0 0 0 0 " + tone + "  0 0 0 " + (kind === "paper" ? ".12" : ".045") + ' 0"/></filter>';
    }
    var gloss = kind === "paper" ? 0 : kind === "gloss" ? (light ? 0.7 : 0.16) : light ? 0.5 : 0.08;
    return "<defs>" +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + stops[0] + '"/><stop offset=".55" stop-color="' + stops[1] + '"/><stop offset="1" stop-color="' + stops[2] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'h" cx=".12" cy="0" r=".85"><stop offset="0" stop-color="#fff" stop-opacity="' + gloss + '"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      filter + '<clipPath id="' + id + 'c"><rect width="856" height="540" rx="' + rx + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'c)"><rect width="856" height="540" fill="url(#' + id + 'b)"/><rect width="856" height="540" fill="url(#' + id + 'h)"/>' +
      '<rect width="856" height="540" filter="url(#' + id + 'n)"/></g>' +
      '<rect x="1" y="1" width="854" height="538" rx="' + (rx - 1) + '" fill="none" stroke="' + (light ? "#000" : "#fff") + '" stroke-opacity="' + (light ? ".1" : ".08") + '" stroke-width="2"/>';
  }

  function stars(x, y, color) {
    var out = "";
    for (var i = 0; i < 5; i++) {
      out += '<path transform="translate(' + (x + i * 40) + " " + y + ') scale(1.3)" d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z" fill="' + color + '"/>';
    }
    return out;
  }

  function svg(label, body) {
    return '<svg class="tk-card" viewBox="0 0 856 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label) + '">' + body + "</svg>";
  }

  // Tarjeta de reseñas o redes: PVC negro con el logo de la plataforma.
  function social(v, id) {
    return svg("Tarjeta NFC " + v.name,
      base(id, ["#1b1b1d", "#0c0c0d", "#050506"], "pvc", false, 34) +
      '<text x="64" y="104" font-family="' + SANS + '" font-size="19" font-weight="600" letter-spacing="4" fill="#a1a1aa">ACERCA TU CELULAR</text>' +
      '<text font-family="' + SANS + '" font-size="50" font-weight="700" letter-spacing="-1.2" fill="#fff"><tspan x="62" y="196">' + esc(v.headline[0]) + '</tspan><tspan x="62" y="254">' + esc(v.headline[1]) + "</tspan></text>" +
      (v.stars ? stars(62, 296, "#FBBC04") : "") +
      contactless(98, 452, 46, "#fff", 4.5) +
      '<text x="140" y="461" font-family="' + SANS + '" font-size="22" font-weight="600" letter-spacing="3" fill="#d4d4d8">NFC</text>' +
      '<rect x="566" y="150" width="236" height="236" rx="54" fill="#fff" fill-opacity=".04"/>' +
      logo(v.id, 584, 168, 200, id) +
      '<text x="684" y="452" text-anchor="middle" font-family="' + SANS + '" font-size="20" font-weight="500" fill="#a1a1aa">Sin apps · iPhone y Android</text>'
    );
  }

  // Tarjeta metálica de presentación con grabado láser.
  var METAL = {
    plata: { stops: ["#fbfbfc", "#cfcfd3", "#97979d"], ink: "#2b2b30", light: true },
    dorada: { stops: ["#f7e6bd", "#d5b57a", "#9f7e45"], ink: "#3d2c0e", light: true },
    negra: { stops: ["#3b3b3f", "#1a1a1c", "#0b0b0c"], ink: "#d9d9de", light: false },
  };
  function metal(v, id) {
    var m = METAL[v.id] || METAL.plata;
    return svg("Tarjeta NFC metálica " + v.name,
      base(id, m.stops, "brushed", m.light, 30) +
      '<circle cx="770" cy="92" r="34" fill="none" stroke="' + m.ink + '" stroke-width="2" opacity=".85"/>' +
      '<text x="770" y="104" text-anchor="middle" font-family="' + SERIF + '" font-size="34" fill="' + m.ink + '">AR</text>' +
      '<text x="64" y="300" font-family="' + SERIF + '" font-size="72" fill="' + m.ink + '">Andrea Ramírez</text>' +
      '<text x="66" y="346" font-family="' + SANS + '" font-size="20" font-weight="500" letter-spacing="5" fill="' + m.ink + '" opacity=".85">DIRECTORA COMERCIAL</text>' +
      '<text x="66" y="466" font-family="' + SANS + '" font-size="20" font-weight="500" fill="' + m.ink + '" opacity=".8">andrea@empresa.mx</text>' +
      contactless(772, 448, 52, m.ink, 4.5)
    );
  }

  // Tarjeta de papel negro con tinta blanca.
  function paper(v, id) {
    return svg("Tarjeta NFC de papel negro",
      base(id, ["#1a1918", "#141312", "#0f0e0d"], "paper", false, 16) +
      '<text x="428" y="250" text-anchor="middle" font-family="' + SERIF + '" font-size="86" fill="#ece8e1">Tu marca</text>' +
      '<text x="428" y="300" text-anchor="middle" font-family="' + SANS + '" font-size="19" font-weight="500" letter-spacing="7" fill="#b6b0a6">ESTUDIO · GUADALAJARA</text>' +
      '<line x1="388" y1="350" x2="468" y2="350" stroke="#ece8e1" stroke-opacity=".35" stroke-width="2"/>' +
      contactless(428, 440, 40, "#ece8e1", 3.5)
    );
  }

  // Tarjeta PVC personalizada con el logo de la empresa (negra o blanca).
  function pvc(v, id) {
    var light = v.id === "blanca";
    var ink = light ? "#111" : "#fff";
    var sub = light ? "#5b5b60" : "#a1a1aa";
    return svg("Tarjeta NFC PVC " + v.name + " con logo",
      base(id, light ? ["#ffffff", "#f3f3f1", "#e2e1dd"] : ["#202022", "#0e0e0f", "#060607"], "gloss", light, 34) +
      '<g transform="translate(64 70)"><rect width="96" height="96" rx="24" fill="#2563EB"/><path d="M26 66l22-36 22 36z" fill="#fff"/><circle cx="66" cy="34" r="9" fill="#93C5FD"/></g>' +
      '<text x="64" y="300" font-family="' + SANS + '" font-size="58" font-weight="700" letter-spacing="-1.5" fill="' + ink + '">Tu empresa</text>' +
      '<text x="66" y="346" font-family="' + SANS + '" font-size="21" font-weight="500" letter-spacing="1" fill="' + sub + '">Tu logo y colores, impresos o grabados</text>' +
      '<text x="66" y="466" font-family="' + SANS + '" font-size="20" font-weight="500" fill="' + sub + '">www.tuempresa.mx</text>' +
      contactless(772, 448, 52, ink, 4.5)
    );
  }

  var RENDER = { redes: social, metal: metal, papel: paper, pvc: pvc };

  function card(productId, variantId) {
    var p = C.getProduct(productId) || C.products[0];
    var v = C.getVariant(p, variantId) || p.variants[0];
    return RENDER[p.id](v, "tk" + ++uid);
  }

  // Muestra de color de cada variante (para los selectores).
  var SWATCH = {
    "metal:plata": "linear-gradient(135deg,#fbfbfc,#97979d)",
    "metal:dorada": "linear-gradient(135deg,#f7e6bd,#9f7e45)",
    "metal:negra": "linear-gradient(135deg,#3b3b3f,#0b0b0c)",
    "papel:negro": "#141312",
    "pvc:negra": "linear-gradient(135deg,#2a2a2d,#060607)",
    "pvc:blanca": "linear-gradient(135deg,#fff,#dcdbd7)",
  };
  function swatch(productId, variantId) {
    if (productId === "redes") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true">' + logo(variantId, 0, 0, 48, "sw" + ++uid) + "</svg>";
    }
    return '<i style="background:' + (SWATCH[productId + ":" + variantId] || "#222") + '"></i>';
  }

  // Lo que aparece en el celular al acercarlo a cada tarjeta (animación de portada y video).
  var SCREENS = {
    google: '<div class="app app-google"><span class="app-top">Google</span><strong>Café La Esquina</strong><span class="app-sub">Califica tu experiencia</span><span class="app-stars"><i>★</i><i>★</i><i>★</i><i>★</i><i>★</i></span><span class="app-btn">Publicar reseña</span></div>',
    instagram: '<div class="app app-ig"><span class="app-avatar"></span><strong>@cafelaesquina</strong><span class="app-stats"><b>248</b> publicaciones · <b>18.4 mil</b> seguidores</span><span class="app-btn">Seguir</span><span class="app-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>',
    whatsapp: '<div class="app app-wa"><span class="app-head">Café La Esquina</span><span class="bubble">¡Hola! 👋 ¿Qué se te antoja hoy?</span><span class="bubble me">Quiero hacer un pedido</span><span class="app-input">Escribe un mensaje</span></div>',
    tiktok: '<div class="app app-tt"><span class="app-avatar"></span><strong>@cafelaesquina</strong><span class="app-stats"><b>32.1 mil</b> seguidores · <b>410 mil</b> me gusta</span><span class="app-btn">Seguir</span><span class="app-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>',
    facebook: '<div class="app app-fb"><span class="app-cover"></span><span class="app-avatar"></span><strong>Café La Esquina</strong><span class="app-stats">Cafetería · <b>4.9 ★</b> · 2.3 mil seguidores</span><span class="app-btn">Seguir</span></div>',
  };
  function screen(platformId) {
    return SCREENS[platformId] || SCREENS.google;
  }

  window.CARDS = { card: card, mark: mark, logo: logo, swatch: swatch, screen: screen };
})();
