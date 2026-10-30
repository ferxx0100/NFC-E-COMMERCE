/*
 * Dibuja las tarjetas NFC como SVG, por el frente y por el reverso.
 * Verticales (reseñas y redes): 540 × 856. Horizontales (presentación): 856 × 540.
 * Funciona en el navegador (window.CARDS) y en build.js (prerender).
 */
(function () {
  var C = window.CATALOG;
  var uid = 0;
  // Prefijo distinto en build.js y en el navegador para que los ids de los SVG nunca se repitan.
  var PREFIX = typeof document === "undefined" ? "b" : "c" + Math.random().toString(36).slice(2, 6);
  var SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
  var SERIF = "'Instrument Serif', Georgia, serif";
  var STAR = "M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z";
  var TIKTOK = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Símbolo de la marca TAKTO: punto con ondas de proximidad.
  function mark(x, y, s, color) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round">' +
      '<circle cx="0" cy="0" r="3.2" fill="' + color + '" stroke="none"/>' +
      '<path d="M7 -7a10 10 0 0 1 0 14M12.5 -12.5a17.7 17.7 0 0 1 0 25M18 -18a25.5 25.5 0 0 1 0 36"/></g>';
  }

  // Ícono universal de "sin contacto": ondas dentro de un círculo.
  function contactless(cx, cy, r, color, ring) {
    var d = "";
    for (var i = 0; i < 4; i++) {
      var rr = r * (0.14 + i * 0.13);
      d += "M" + (cx - r * 0.3 + i * r * 0.05) + " " + (cy - rr) + "a" + rr + " " + rr + " 0 0 1 0 " + rr * 2;
    }
    return (ring === false ? "" : '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + r * 0.09 + '"/>') +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + r * 0.085 + '" stroke-linecap="round"/>';
  }

  function stars(cx, y, size, color) {
    var k = size / 24, gap = size * 1.12, x0 = cx - gap * 2.5, out = "";
    for (var i = 0; i < 5; i++) out += '<path transform="translate(' + (x0 + i * gap) + " " + y + ") scale(" + k + ')" d="' + STAR + '" fill="' + color + '"/>';
    return out;
  }

  // Ícono de Perfil de Negocio de Google (tiendita con toldo y la G).
  function storefront(x, y, w) {
    var k = w / 100, cols = ["#8FB4F5", "#4D63C7", "#8FB4F5", "#4D63C7"], out = "";
    out += '<rect x="5" y="30" width="90" height="60" rx="8" fill="#4F86EC"/>';
    for (var i = 0; i < 4; i++) {
      var tl = 15 + 17.5 * i, tr = tl + 17.5, bl = 3 + 23.5 * i, br = bl + 23.5;
      out += '<path d="M' + tl + " 3H" + tr + "L" + br + " 33A11.75 11.75 0 0 1 " + bl + ' 33Z" fill="' + cols[i] + '"/>';
    }
    out += '<text x="73" y="80" text-anchor="middle" font-family="' + SANS + '" font-size="31" font-weight="700" fill="#fff">G</text>';
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')">' + out + "</g>";
  }

  function wordmarkGoogle(cx, y, size) {
    var cols = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
    var t = "Google".split("").map(function (ch, i) { return '<tspan fill="' + cols[i] + '">' + ch + "</tspan>"; }).join("");
    return '<text x="' + cx + '" y="' + y + '" text-anchor="middle" font-family="' + SANS + '" font-size="' + size + '" font-weight="600" letter-spacing="-' + size * 0.03 + '">' + t + "</text>";
  }

  function igGlyph(x, y, s, color) {
    var k = s / 48;
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')" fill="none" stroke="' + color + '" stroke-width="4.4">' +
      '<rect x="3" y="3" width="42" height="42" rx="12.5"/><circle cx="24" cy="24" r="10"/><circle cx="36" cy="12" r="2.6" fill="' + color + '" stroke="none"/></g>';
  }
  function waGlyph(x, y, s, color) {
    var k = s / 48;
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')">' +
      '<path d="M24 3.5A20.5 20.5 0 0 0 6.4 34.5L3.5 44.5l10.3-2.7A20.5 20.5 0 1 0 24 3.5z" fill="none" stroke="' + color + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M16.9 14.3c.6-.6 1.5-.6 2 0l2.4 3.6c.4.6.3 1.4-.2 1.9l-1.4 1.4c1.1 2.4 3 4.4 5.4 5.4l1.4-1.4c.5-.5 1.3-.6 1.9-.2l3.6 2.4c.6.4.7 1.4 0 2l-1.5 1.5c-1.1 1.1-2.7 1.4-4.1.8-4.8-2.1-8.7-6-10.8-10.8-.6-1.4-.3-3 .8-4.1z" fill="' + color + '"/></g>';
  }
  function fbTile(x, y, s, tile, f) {
    var k = s / 48;
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><rect width="48" height="48" rx="10" fill="' + tile + '"/>' +
      '<path d="M27.6 48V29.4h6.2l.9-7.2h-7.1v-4.6c0-2.1.6-3.5 3.6-3.5h3.8V7.6c-.7-.1-2.9-.3-5.5-.3-5.5 0-9.2 3.3-9.2 9.5v5.4h-6.2v7.2h6.2V48z" fill="' + f + '"/></g>';
  }
  function ttGlyph(x, y, s) {
    var k = s / 24;
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="' + TIKTOK + '" fill="#25F4EE" transform="translate(-.6 -.6)"/>' +
      '<path d="' + TIKTOK + '" fill="#FE2C55" transform="translate(.6 .6)"/><path d="' + TIKTOK + '" fill="#fff"/></g>';
  }

  /*
   * Logotipo de cada plataforma dentro de un cuadro (selectores y etiquetas).
   * Son marcas de sus dueños: se muestran para identificar a qué perfil abre cada tarjeta.
   */
  function logo(id, x, y, s, gid) {
    var k = s / 48, g = '<g transform="translate(' + x + " " + y + ") scale(" + k + ')">';
    if (id === "google") {
      return g + '<rect width="48" height="48" rx="11" fill="#fff" stroke="#e4e4e7"/><g transform="translate(9 9) scale(.625)">' +
        '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
        '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
        '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
        '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></g></g>';
    }
    if (id === "instagram") {
      return g + '<defs><linearGradient id="' + gid + 'ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".35" stop-color="#FA7E1E"/><stop offset=".65" stop-color="#D62976"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs>' +
        '<rect width="48" height="48" rx="11" fill="url(#' + gid + 'ig)"/></g>' + igGlyph(x + s * 0.2, y + s * 0.2, s * 0.6, "#fff");
    }
    if (id === "whatsapp") return g + '<rect width="48" height="48" rx="11" fill="#25D366"/></g>' + waGlyph(x + s * 0.18, y + s * 0.17, s * 0.64, "#fff");
    if (id === "facebook") return fbTile(x, y, s, "#1877F2", "#fff");
    if (id === "tiktok") return g + '<rect width="48" height="48" rx="11" fill="#000"/></g>' + ttGlyph(x + s * 0.22, y + s * 0.2, s * 0.56);
    return "";
  }

  /*
   * Fondo de la tarjeta con su textura y brillo.
   * kind: "pvc" (mate), "gloss" (brillante), "paper" (fibra) o "brushed" (metal cepillado).
   */
  function base(id, w, h, rx, stops, kind, light, angle) {
    var tone = light ? "0" : "1";
    var alpha = { pvc: ".04", gloss: ".03", paper: ".12", brushed: light ? ".13" : ".16" }[kind];
    var freq = kind === "brushed" ? (w > h ? ".002 .9" : ".9 .002") : kind === "paper" ? ".5" : ".9";
    var gloss = kind === "paper" ? 0 : light ? 0.6 : kind === "gloss" ? 0.14 : 0.07;
    var grad = angle === "v" ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="1"';
    return "<defs>" +
      '<linearGradient id="' + id + 'b" ' + grad + ">" + stops.map(function (s, i) { return '<stop offset="' + i / (stops.length - 1) + '" stop-color="' + s + '"/>'; }).join("") + "</linearGradient>" +
      '<radialGradient id="' + id + 'h" cx=".1" cy="0" r=".9"><stop offset="0" stop-color="#fff" stop-opacity="' + gloss + '"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + id + 'n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + (kind === "brushed" ? 3 : 2) + '" seed="3" stitchTiles="stitch"/>' +
      '<feColorMatrix values="0 0 0 0 ' + tone + "  0 0 0 0 " + tone + "  0 0 0 0 " + tone + "  0 0 0 " + alpha + ' 0"/></filter>' +
      '<clipPath id="' + id + 'c"><rect width="' + w + '" height="' + h + '" rx="' + rx + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'c)"><rect width="' + w + '" height="' + h + '" fill="url(#' + id + 'b)"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + 'h)"/><rect width="' + w + '" height="' + h + '" filter="url(#' + id + 'n)"/></g>' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="' + (rx - 1) + '" fill="none" stroke="' + (light ? "#000" : "#fff") + '" stroke-opacity="' + (light ? ".1" : ".1") + '" stroke-width="2"/>';
  }

  function svg(w, h, label, body) {
    return '<svg class="tk-card" viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label) + '">' + body + "</svg>";
  }

  // ---------- Tarjetas verticales: reseñas y redes ----------
  var VERTICAL = {
    "google:negra": { bg: ["#2e2e31", "#1d1d1f", "#151516"], ink: "#fff", light: false },
    "google:blanca": { bg: ["#ffffff", "#f3f4f6", "#e6e7ea"], ink: "#1f1f1f", light: true },
    "redes:instagram": { bg: ["#5b34d6", "#c42d97", "#ef4f4a", "#f9893a"], ink: "#fff", light: false, angle: "v" },
    "redes:whatsapp": { bg: ["#1c8a77", "#4fb36c", "#2b9479"], ink: "#fff", light: false },
    "redes:facebook": { bg: ["#4f6db6", "#45619f", "#3a5592"], ink: "#fff", light: false },
    "redes:tiktok": { bg: ["#1d1d20", "#111113", "#0a0a0b"], ink: "#fff", light: false },
  };

  function verticalFront(p, v, id) {
    var key = p.id + ":" + v.id, st = VERTICAL[key], W = 540, H = 856, body;
    var hint = '<text x="270" y="806" text-anchor="middle" font-family="' + SANS + '" font-size="22" font-weight="500" letter-spacing="1" fill="' + st.ink + '" opacity=".6">Acerca tu celular</text>';
    if (p.id === "google") {
      body = storefront(120, 92, 300) + wordmarkGoogle(270, 500, 116) + stars(270, 536, 50, "#FBBC04") + contactless(270, 690, 52, st.ink);
    } else if (v.id === "instagram") {
      body = igGlyph(160, 150, 220, "#fff") +
        '<text x="270" y="530" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="124" fill="#fff">Instagram</text>' + contactless(270, 676, 52, "#fff");
    } else if (v.id === "whatsapp") {
      body = waGlyph(150, 130, 240, "#fff") +
        '<text x="270" y="520" text-anchor="middle" font-family="' + SANS + '" font-size="88" font-weight="800" letter-spacing="-2" fill="#fff">WhatsApp</text>' + contactless(270, 676, 52, "#fff");
    } else if (v.id === "facebook") {
      body = fbTile(160, 140, 220, "#fff", "#4562a8") +
        '<text x="270" y="520" text-anchor="middle" font-family="' + SANS + '" font-size="98" font-weight="800" letter-spacing="-3" fill="#fff">facebook</text>' + contactless(270, 676, 52, "#fff");
    } else {
      body = ttGlyph(165, 140, 210) +
        '<text x="270" y="520" text-anchor="middle" font-family="' + SANS + '" font-size="100" font-weight="800" letter-spacing="-2" fill="#fff">TikTok</text>' + contactless(270, 676, 52, "#fff");
    }
    return svg(W, H, p.name + " " + v.name, base(id, W, H, 36, st.bg, "pvc", st.light, st.angle) + body + hint);
  }

  function verticalBack(p, v, id) {
    var st = VERTICAL[p.id + ":" + v.id], W = 540, H = 856;
    return svg(W, H, "Reverso " + p.name, base(id, W, H, 36, st.bg, "pvc", st.light, st.angle) +
      contactless(270, 340, 96, st.ink) +
      '<text text-anchor="middle" font-family="' + SANS + '" font-size="44" font-weight="700" letter-spacing="-1" fill="' + st.ink + '"><tspan x="270" y="540">Acerca tu</tspan><tspan x="270" y="594">celular aquí</tspan></text>' +
      '<text x="270" y="664" text-anchor="middle" font-family="' + SANS + '" font-size="24" font-weight="500" fill="' + st.ink + '" opacity=".65">Sin apps · iPhone y Android</text>');
  }

  // ---------- Tarjetas horizontales: lisa, metálica y papel ----------
  var LISA = {
    negra: { bg: ["#232325", "#141415", "#0b0b0c"], ink: "#fff", light: false },
    blanca: { bg: ["#ffffff", "#f2f2f0", "#e2e1dd"], ink: "#111", light: true },
  };
  var METAL = {
    negra: { bg: ["#38383c", "#1c1c1e", "#0d0d0e"], ink: "#d4d4d9", light: false },
    plata: { bg: ["#f8f8fa", "#c9c9ce", "#96969c"], ink: "#2b2b30", light: true },
    dorada: { bg: ["#f5e2b4", "#d2b175", "#9c7a42"], ink: "#3b2a0c", light: true },
  };
  var FOIL = ["#f2e6c9", "#cdb27c", "#a58852"];

  function horizontalFront(p, v, id) {
    var W = 856, H = 540, st;
    if (p.id === "lisa") {
      st = LISA[v.id] || LISA.negra;
      return svg(W, H, p.name + " " + v.name, base(id, W, H, 34, st.bg, "pvc", st.light) +
        '<rect x="278" y="190" width="300" height="160" rx="20" fill="none" stroke="' + st.ink + '" stroke-opacity=".22" stroke-width="2.5" stroke-dasharray="10 9"/>' +
        '<text x="428" y="282" text-anchor="middle" font-family="' + SANS + '" font-size="26" font-weight="600" letter-spacing="7" fill="' + st.ink + '" opacity=".4">TU LOGO</text>' +
        contactless(772, 456, 36, st.ink));
    }
    if (p.id === "metal") {
      st = METAL[v.id] || METAL.negra;
      var shade = st.light ? "#000" : "#fff";
      return svg(W, H, p.name + " " + v.name, base(id, W, H, 30, st.bg, "brushed", st.light) +
        '<rect x="26" y="26" width="330" height="488" rx="20" fill="' + shade + '" fill-opacity=".07" stroke="' + shade + '" stroke-opacity=".14" stroke-width="2"/>' +
        contactless(191, 250, 58, st.ink) +
        '<text x="191" y="372" text-anchor="middle" font-family="' + SANS + '" font-size="20" font-weight="600" letter-spacing="6" fill="' + st.ink + '" opacity=".75">NFC</text>' +
        '<text x="400" y="262" font-family="' + SERIF + '" font-size="62" fill="' + st.ink + '">Andrea Ramírez</text>' +
        '<text x="402" y="306" font-family="' + SANS + '" font-size="18" font-weight="500" letter-spacing="5" fill="' + st.ink + '" opacity=".8">DIRECTORA COMERCIAL</text>' +
        '<text x="402" y="456" font-family="' + SANS + '" font-size="19" font-weight="500" fill="' + st.ink + '" opacity=".75">andrea@empresa.mx</text>');
    }
    // Papel negro con tinta metálica.
    return svg(W, H, p.name, base(id, W, H, 18, ["#1b1a19", "#141312", "#0e0d0c"], "paper", false) +
      '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1">' + FOIL.map(function (c, i) { return '<stop offset="' + i / 2 + '" stop-color="' + c + '"/>'; }).join("") + "</linearGradient></defs>" +
      '<g transform="translate(428 150)" fill="url(#' + id + 'f)">' +
      [-50, -25, 0, 25, 50].map(function (a) { return '<ellipse cx="0" cy="-26" rx="11" ry="30" transform="rotate(' + a + ' 0 18)"/>'; }).join("") + "</g>" +
      '<text x="428" y="280" text-anchor="middle" font-family="' + SERIF + '" font-size="80" fill="url(#' + id + 'f)">Tu marca</text>' +
      '<text x="428" y="326" text-anchor="middle" font-family="' + SANS + '" font-size="18" font-weight="500" letter-spacing="7" fill="#b9b3a8">ESTUDIO · GUADALAJARA</text>' +
      contactless(428, 438, 34, "#d9cdb3"));
  }

  function horizontalBack(p, v, id) {
    var W = 856, H = 540, st;
    if (p.id === "lisa") {
      st = LISA[v.id] || LISA.negra;
      return svg(W, H, "Reverso " + p.name, base(id, W, H, 34, st.bg, "pvc", st.light) + contactless(428, 270, 64, st.ink) +
        '<text x="428" y="392" text-anchor="middle" font-family="' + SANS + '" font-size="22" font-weight="600" letter-spacing="6" fill="' + st.ink + '" opacity=".6">NFC</text>');
    }
    if (p.id === "metal") {
      st = METAL[v.id] || METAL.negra;
      return svg(W, H, "Reverso " + p.name, base(id, W, H, 30, st.bg, "brushed", st.light) +
        '<text x="428" y="300" text-anchor="middle" font-family="' + SERIF + '" font-size="72" fill="' + st.ink + '">empresa.mx</text>');
    }
    return svg(W, H, "Reverso " + p.name, base(id, W, H, 18, ["#1b1a19", "#141312", "#0e0d0c"], "paper", false) +
      '<text x="428" y="290" text-anchor="middle" font-family="' + SERIF + '" font-size="64" fill="#e6dfd2">tumarca.mx</text>');
  }

  function parts(productId, variantId) {
    var p = C.getProduct(productId) || C.products[0];
    return { p: p, v: C.getVariant(p, variantId) || p.variants[0] };
  }

  function card(productId, variantId) {
    var x = parts(productId, variantId);
    return (x.p.shape === "v" ? verticalFront : horizontalFront)(x.p, x.v, PREFIX + ++uid);
  }

  function back(productId, variantId) {
    var x = parts(productId, variantId);
    return (x.p.shape === "v" ? verticalBack : horizontalBack)(x.p, x.v, PREFIX + ++uid);
  }

  // Muestra de cada variante para los selectores.
  var SWATCH = {
    "google:negra": "#1d1d1f", "google:blanca": "#f3f4f6",
    "lisa:negra": "#141415", "lisa:blanca": "#f2f2f0",
    "metal:negra": "linear-gradient(135deg,#38383c,#0d0d0e)", "metal:plata": "linear-gradient(135deg,#f8f8fa,#96969c)", "metal:dorada": "linear-gradient(135deg,#f5e2b4,#9c7a42)",
    "papel:negra": "#141312",
  };
  function swatch(productId, variantId) {
    if (productId === "redes") return '<svg viewBox="0 0 48 48" aria-hidden="true">' + logo(variantId, 0, 0, 48, PREFIX + "s" + ++uid) + "</svg>";
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
  function screen(id) {
    return SCREENS[id] || SCREENS.google;
  }

  window.CARDS = { card: card, back: back, mark: mark, logo: logo, swatch: swatch, screen: screen };
})();
