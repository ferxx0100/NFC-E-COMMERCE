/* Encabezado, pie de página y botón flotante de WhatsApp compartidos por todas las páginas. */
(function () {
  var C = window.CATALOG;
  var nfcMark =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 8c-2 2.5-2 5.5 0 8M10 10c-.8 1.2-.8 2.8 0 4M14 6c3 3.5 3 8.5 0 12M18 4c4 4.5 4 11.5 0 16"/></svg>';
  var bag =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
  var menu =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var chat =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.4-4.2A8 8 0 1 1 8.3 18.6L4 20z"/><path d="M9.5 9.5c.3 2 2 3.8 4 4.2l1-1 1.8.8-.4 1.6c-3.4.2-7-3.4-6.8-6.8l1.6-.4.8 1.8-1 1z" fill="currentColor" stroke="none"/></svg>';

  var header = document.querySelector("[data-header]");
  if (header) {
    header.outerHTML =
      '<div class="topbar">Envío gratis en pedidos desde ' + C.formatMoney(C.config.freeShippingFrom) + ' · Te lo entregamos programado</div>' +
      '<header class="header"><div class="container">' +
      '<a class="logo" href="index.html"><span class="logo-mark">' + nfcMark + "</span>" + C.config.storeName + "</a>" +
      '<nav class="nav" aria-label="Principal">' +
      '<a href="index.html#productos">Productos</a>' +
      '<a href="index.html#como-funciona">Cómo funciona</a>' +
      '<a href="index.html#mayoreo">Mayoreo</a>' +
      '<a href="index.html#faq">Preguntas</a>' +
      "</nav>" +
      '<div style="display:flex;align-items:center;gap:6px">' +
      '<a class="cart-link" href="carrito.html" aria-label="Carrito">' + bag + '<span class="cart-count" data-cart-count hidden>0</span></a>' +
      '<button class="nav-toggle" aria-label="Menú" aria-expanded="false">' + menu + "</button>" +
      "</div></div></header>";
  }

  var footer = document.querySelector("[data-footer]");
  if (footer) {
    footer.outerHTML =
      '<footer class="footer"><div class="container">' +
      "<div><strong>" + C.config.storeName + "</strong><br>Placas y tarjetas NFC para negocios en México.<br>© <span data-year></span></div>" +
      '<div class="footer-links">' +
      '<a href="index.html#productos">Productos</a>' +
      '<a href="index.html#faq">Preguntas frecuentes</a>' +
      '<a href="https://wa.me/' + C.config.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>' +
      "</div>" +
      '<p class="legal-note">Google, Instagram, TikTok, Facebook, WhatsApp y Tripadvisor son marcas de sus respectivos dueños. ' +
      C.config.storeName + " no está afiliado ni patrocinado por ellas; las placas solo enlazan a tu perfil público.</p>" +
      "</div></footer>" +
      '<a class="wa-float" href="https://wa.me/' + C.config.whatsapp + '?text=' + encodeURIComponent("Hola, quiero información sobre las placas NFC") +
      '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + chat + "</a>";
  }
})();
