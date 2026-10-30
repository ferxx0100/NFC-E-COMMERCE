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

  function contactless(cx, cy, r) {
    var w = r * 0.16;
    var d = "";
    for (var i = 0; i < 4; i++) {
      var rr = r * (0.22 + i * 0.18);
      d += "M" + (cx - r * 0.46 + i * w * 0.35) + " " + (cy - rr) + "a" + rr + " " + rr + " 0 0 1 0 " + rr * 2;
    }
    return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + r * 0.075 + '" stroke-linecap="round"/>';
  }

  /*
   * opts.animated: agrega las ondas animadas (solo en la página).
   * Proporción de tarjeta de crédito: 856 × 540.
   */
  function card(platformId, opts) {
    opts = opts || {};
    var p = C.getPlatform(platformId) || C.platforms[0];
    var id = "tk" + ++uid;
    var stars = "";
    if (p.stars) {
      for (var i = 0; i < 5; i++) {
        stars += '<path transform="translate(' + (64 + i * 38) + ' 408) scale(1.25)" d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z" fill="' + GOLD + '"/>';
      }
    }
    var ripples = opts.animated
      ? '<g class="tk-ripples" stroke="' + p.accent + '" fill="none" stroke-width="2">' +
        '<circle cx="690" cy="285" r="96"/><circle cx="690" cy="285" r="96"/><circle cx="690" cy="285" r="96"/></g>'
      : "";

    return (
      '<svg class="tk-card" viewBox="0 0 856 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tarjeta NFC ' + esc(p.name) + '">' +
      "<defs>" +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1c1e"/><stop offset=".55" stop-color="#0b0b0c"/><stop offset="1" stop-color="#050505"/></linearGradient>' +
      '<radialGradient id="' + id + 'g" cx=".82" cy=".95" r=".7"><stop offset="0" stop-color="' + p.accent + '" stop-opacity=".38"/><stop offset="1" stop-color="' + p.accent + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'h" cx=".15" cy="0" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dfb1"/><stop offset=".5" stop-color="' + GOLD + '"/><stop offset="1" stop-color="#8a6d3b"/></linearGradient>' +
      '<filter id="' + id + 'n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0"/></filter>' +
      '<clipPath id="' + id + 'c"><rect width="856" height="540" rx="38"/></clipPath>' +
      "</defs>" +
      '<g clip-path="url(#' + id + 'c)">' +
      '<rect width="856" height="540" fill="url(#' + id + 'b)"/>' +
      '<rect width="856" height="540" fill="url(#' + id + 'g)"/>' +
      '<rect width="856" height="540" fill="url(#' + id + 'h)"/>' +
      '<rect width="856" height="540" filter="url(#' + id + 'n)"/>' +
      "</g>" +
      '<rect x="1" y="1" width="854" height="538" rx="37" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="2"/>' +
      mark(76, 74, 1.05, GOLD) +
      '<text x="112" y="83" font-family="' + FONT + '" font-size="25" font-weight="700" letter-spacing="7" fill="url(#' + id + 'r)">' + esc(C.brand.name) + "</text>" +
      '<text x="64" y="232" font-family="' + FONT + '" font-size="21" font-weight="700" letter-spacing="4" fill="' + p.accent + '">' + esc(p.eyebrow) + "</text>" +
      '<text font-family="' + FONT + '" font-size="54" font-weight="700" letter-spacing="-1.5" fill="#fff">' +
      '<tspan x="62" y="300">' + esc(p.lines[0]) + '</tspan><tspan x="62" y="362">' + esc(p.lines[1]) + "</tspan></text>" +
      stars +
      '<text x="64" y="486" font-family="' + FONT + '" font-size="19" font-weight="500" letter-spacing="1" fill="#a1a1aa">Acerca tu celular · Sin apps</text>' +
      ripples +
      '<circle cx="690" cy="285" r="96" fill="#fff" fill-opacity=".03" stroke="url(#' + id + 'r)" stroke-width="2.5"/>' +
      contactless(690, 285, 96) +
      "</svg>"
    );
  }

  window.CARDS = { card: card, mark: mark };
})();
