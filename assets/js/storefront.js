/* Collection navigation: keep all product controls and server-rendered content. */
(function () {
  var filters = document.querySelectorAll('[data-filter]');
  var count = document.querySelector('[data-catalog-count]');
  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var visible = 0;
      document.querySelectorAll('[data-product]').forEach(function (article) {
        var product = window.CATALOG.getProduct(article.dataset.product);
        var show = button.dataset.filter === 'all' ||
          (button.dataset.filter === 'custom' ? product.custom : !product.custom);
        article.hidden = !show;
        if (show) visible++;
      });
      filters.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
      count.textContent = visible + (visible === 1 ? ' diseño' : ' diseños') + ' · precios en MXN';
    });
  });
  // Keep keyboard focus inside the cart and return it to the triggering control.
  var drawer = document.querySelector('#drawer');
  var previousFocus;
  var observer = new MutationObserver(function () {
    if (drawer.getAttribute('aria-hidden') === 'false') {
      previousFocus = document.activeElement;
      drawer.querySelector('[data-close-order]').focus();
      document.querySelector('main').inert = true;
      document.querySelector('header').inert = true;
    } else {
      document.querySelector('main').inert = false;
      document.querySelector('header').inert = false;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
  });
  observer.observe(drawer, { attributes: true, attributeFilter: ['aria-hidden'] });
  drawer.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var controls = Array.from(drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]')).filter(function (el) { return el.getClientRects().length; });
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
