/*
 * Dibuja las tarjetas NFC de la marca como SVG.
 * Todo sale de CATALOG.platforms: si cambias un texto o color allá,
 * cambia en la página y en las imágenes exportadas (tools/exportar-imagenes.js).
 * No usa logotipos de terceros: solo tipografía y el color de cada plataforma.
 */
(function () {
  var C = window.CATALOG;
  var uid = 0;
  var FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
  var GOLD = "#C9A96E";

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

  function contactless(cx, cy, r, color) {
    var w = r * 0.16;
    var d = "";
    for (var i = 0; i < 4; i++) {
      var rr = r * (0.22 + i * 0.18);
      d += "M" + (cx - r * 0.46 + i * w * 0.35) + " " + (cy - rr) + "a" + rr + " " + rr + " 0 0 1 0 " + rr * 2;
    }
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + r * 0.075 + '" stroke-linecap="round"/>';
  }

  /*
   * Aspecto de cada material (ids de CATALOG.finishes).
   * bg: degradado de fondo · ink: texto principal · sub: texto secundario
   * ring: anillo y marca (degradado) · glow: brillo del color de la plataforma
   * texture: "noise" (mate), "paper" (fibra) o "brushed" (metal cepillado)
   */
  var RING_GOLD = ["#f3dfb1", GOLD, "#8a6d3b"];
  var RING_DARK = ["#3a2f1c", "#1a1408", "#3a2f1c"];
  var STYLES = {
    "pvc-negro": { bg: ["#1c1c1e", "#0b0b0c", "#050505"], ink: "#fff", sub: "#a1a1aa", ring: RING_GOLD, glow: true, accentText: true, texture: "noise" },
    "papel-negro": { bg: ["#181717", "#121111", "#0d0c0c"], ink: "#f2efe9", sub: "#9c968c", ring: RING_GOLD, glow: false, accentText: true, texture: "paper" },
    "metal-negro": { bg: ["#3a3a3d", "#161618", "#0a0a0b"], ink: "#fff", sub: "#b4b4bb", ring: ["#ffffff", "#b9b9c0", "#6b6b72"], glow: true, accentText: true, texture: "brushed" },
    "metal-blanco": { bg: ["#ffffff", "#f1f0ec", "#dedcd6"], ink: "#111", sub: "#5b5b60", ring: ["#c9a96e", "#8a6d3b", "#5c4724"], grain: ".10", glow: false, accentText: true, texture: "brushed" },
    "metal-dorado": { bg: ["#f6e4b8", "#d2b277", "#9c7b42"], ink: "#1a1408", sub: "#4a3b1f", ring: RING_DARK, glow: false, accentText: false, texture: "brushed" },
    "metal-plateado": { bg: ["#f7f7f8", "#c9c9cd", "#8e8e94"], ink: "#111", sub: "#45454b", ring: ["#3c3c42", "#16161a", "#3c3c42"], glow: false, accentText: false, texture: "brushed" },
  };

  function texture(id, kind, dark, grain) {
    var tone = dark ? "1" : "0";
    if (kind === "brushed") {
      return '<filter id="' + id + 'n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".002 .9" numOctaves="3" seed="4"/>' +
        '<feColorMatrix values="0 0 0 0 ' + tone + '  0 0 0 0 ' + tone + '  0 0 0 0 ' + tone + '  0 0 0 ' + (grain || (dark ? ".16" : ".22")) + ' 0"/></filter>';
    }
    var amount = kind === "paper" ? ".11" : ".05";
    return '<filter id="' + id + 'n"><feTurbulence type="fractalNoise" baseFrequency="' + (kind === "paper" ? ".55" : ".9") + '" numOctaves="2" stitchTiles="stitch"/>' +
      '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ' + amount + ' 0"/></filter>';
  }

  /*
   * opts.animated: agrega las ondas animadas (solo en la página).
   * opts.finish: id del material (por defecto el primero del catálogo).
   * Proporción de tarjeta de crédito: 856 × 540.
   */
  function card(platformId, opts) {
    opts = opts || {};
    var p = C.getPlatform(platformId) || C.platforms[0];
    var f = C.getFinish(opts.finish);
    var st = STYLES[f.id] || STYLES["pvc-negro"];
    var dark = st.ink === "#fff" || st.ink === "#f2efe9";
    var id = "tk" + ++uid;
    var starColor = dark ? GOLD : st.ink;
    var stars = "";
    if (p.stars) {
      for (var i = 0; i < 5; i++) {
        stars += '<path transform="translate(' + (64 + i * 38) + ' 408) scale(1.25)" d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z" fill="' + starColor + '"/>';
      }
    }
    var ripples = opts.animated
      ? '<g class="tk-ripples" stroke="' + p.accent + '" fill="none" stroke-width="2">' +
        '<circle cx="690" cy="285" r="96"/><circle cx="690" cy="285" r="96"/><circle cx="690" cy="285" r="96"/></g>'
      : "";
    var grad = function (suffix, c) {
      return '<linearGradient id="' + id + suffix + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient>';
    };

    return (
      '<svg class="tk-card" viewBox="0 0 856 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tarjeta NFC ' + esc(p.name) + " en " + esc(f.name.toLowerCase()) + '">' +
      "<defs>" +
      grad("b", st.bg) + grad("r", st.ring) +
      '<radialGradient id="' + id + 'g" cx=".82" cy=".95" r=".7"><stop offset="0" stop-color="' + p.accent + '" stop-opacity=".38"/><stop offset="1" stop-color="' + p.accent + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'h" cx=".15" cy="0" r=".8"><stop offset="0" stop-color="#fff" stop-opacity="' + (f.group === "Papel" ? "0" : dark ? ".10" : ".55") + '"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      texture(id, st.texture, dark, st.grain) +
      '<clipPath id="' + id + 'c"><rect width="856" height="540" rx="38"/></clipPath>' +
      "</defs>" +
      '<g clip-path="url(#' + id + 'c)">' +
      '<rect width="856" height="540" fill="url(#' + id + 'b)"/>' +
      (st.glow ? '<rect width="856" height="540" fill="url(#' + id + 'g)"/>' : "") +
      '<rect width="856" height="540" fill="url(#' + id + 'h)"/>' +
      '<rect width="856" height="540" filter="url(#' + id + 'n)"/>' +
      "</g>" +
      '<rect x="1" y="1" width="854" height="538" rx="37" fill="none" stroke="' + (dark ? "#fff" : "#000") + '" stroke-opacity="' + (dark ? ".09" : ".12") + '" stroke-width="2"/>' +
      mark(76, 74, 1.05, "url(#" + id + "r)") +
      '<text x="112" y="83" font-family="' + FONT + '" font-size="25" font-weight="700" letter-spacing="7" fill="url(#' + id + 'r)">' + esc(C.brand.name) + "</text>" +
      '<text x="64" y="232" font-family="' + FONT + '" font-size="21" font-weight="700" letter-spacing="4" fill="' + (st.accentText ? p.accent : st.ink) + '">' + esc(p.eyebrow) + "</text>" +
      '<text font-family="' + FONT + '" font-size="54" font-weight="700" letter-spacing="-1.5" fill="' + st.ink + '">' +
      '<tspan x="62" y="300">' + esc(p.lines[0]) + '</tspan><tspan x="62" y="362">' + esc(p.lines[1]) + "</tspan></text>" +
      stars +
      '<text x="64" y="486" font-family="' + FONT + '" font-size="19" font-weight="500" letter-spacing="1" fill="' + st.sub + '">Acerca tu celular · Sin apps</text>' +
      ripples +
      '<circle cx="690" cy="285" r="96" fill="' + (dark ? "#fff" : "#000") + '" fill-opacity=".04" stroke="url(#' + id + 'r)" stroke-width="2.5"/>' +
      contactless(690, 285, 96, st.ink) +
      "</svg>"
    );
  }

  // Muestra de color del material (para los selectores).
  function swatch(finishId) {
    var st = STYLES[finishId] || STYLES["pvc-negro"];
    return "linear-gradient(135deg," + st.bg[0] + "," + st.bg[1] + " 55%," + st.bg[2] + ")";
  }

  // Lo que aparece en el celular al acercarlo a cada tarjeta (animación de portada y video).
  var SCREENS = {
    google: '<div class="app app-google"><span class="app-top">Google</span><strong>Café La Esquina</strong><span class="app-sub">Califica tu experiencia</span><span class="app-stars"><i>★</i><i>★</i><i>★</i><i>★</i><i>★</i></span><span class="app-btn">Publicar reseña</span></div>',
    instagram: '<div class="app app-ig"><span class="app-avatar"></span><strong>@cafelaesquina</strong><span class="app-stats"><b>248</b> publicaciones · <b>18.4 mil</b> seguidores</span><span class="app-btn">Seguir</span><span class="app-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>',
    whatsapp: '<div class="app app-wa"><span class="app-head">Café La Esquina</span><span class="bubble">¡Hola! 👋 ¿Qué se te antoja hoy?</span><span class="bubble me">Quiero hacer un pedido</span><span class="app-input">Escribe un mensaje</span></div>',
  };
  function screen(platformId) {
    return SCREENS[platformId] || SCREENS.google;
  }

  window.CARDS = { card: card, mark: mark, swatch: swatch, screen: screen };
})();
