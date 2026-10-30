/* Carrito (localStorage), contador del encabezado y vista previa de la placa. */
(function () {
  var C = window.CATALOG;
  var KEY = "tapreview_cart_v1";

  function read() {
    try {
      var items = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {}
    updateBadge();
  }

  function lineKey(item) {
    return [item.productId, item.platform, item.businessName, item.link, item.notes].join("|");
  }

  // Une líneas idénticas para que el descuento por volumen se calcule bien.
  function add(item) {
    var items = read();
    var key = lineKey(item);
    for (var i = 0; i < items.length; i++) {
      if (lineKey(items[i]) === key) {
        items[i].qty = Math.min(999, items[i].qty + item.qty);
        write(items);
        return;
      }
    }
    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    items.push(item);
    write(items);
  }

  function setQty(id, qty) {
    var items = read().map(function (it) {
      if (it.id === id) it.qty = Math.max(1, Math.min(999, qty));
      return it;
    });
    write(items);
  }

  function remove(id) {
    write(read().filter(function (it) { return it.id !== id; }));
  }

  function clear() {
    write([]);
  }

  // Líneas válidas con precio calculado y totales.
  function summary() {
    var lines = [];
    var subtotal = 0;
    read().forEach(function (it) {
      var p = C.getProduct(it.productId);
      if (!p) return;
      var unit = C.unitPrice(p, it.qty);
      var total = unit * it.qty;
      subtotal += total;
      lines.push({ item: it, product: p, platform: C.getPlatform(it.platform), unit: unit, total: total, off: C.discountFor(it.qty) });
    });
    var shipping = C.shippingFor(subtotal);
    return { lines: lines, subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
  }

  function count() {
    return read().reduce(function (n, it) { return n + it.qty; }, 0);
  }

  function updateBadge() {
    var n = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var tapIcon =
    '<svg viewBox="0 0 64 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 12c-3 5-3 11 0 16M14 15c-1.6 3-1.6 7 0 10M20 18c-.6 1.3-.6 2.7 0 4"/>' +
    '<rect x="30" y="3" width="17" height="30" rx="3.5" transform="rotate(14 38 18)"/>' +
    '<path d="M28 33c4 3 10 4 15 2l9-4c2-1 2-3.5 0-4l-6 1"/></svg>';

  // Vista previa de la placa construida con CSS (sin logotipos de terceros).
  function preview(platformId, businessName, shape) {
    var pl = C.getPlatform(platformId) || C.platforms[0];
    var stars = pl.stars ? '<div class="pv-stars" aria-hidden="true">★★★★★</div>' : "";
    return (
      '<div class="pv pv-' + (shape || "square") + '" style="--pv-bg:' + pl.bg + ";--pv-fg:" + pl.fg + '">' +
      '<div class="pv-top">' + stars +
      '<div class="pv-headline">' + escapeHtml(pl.headline) + "</div></div>" +
      '<div class="pv-bottom">' +
      '<div class="pv-brand">' + escapeHtml(pl.name) + "</div>" +
      '<div class="pv-tap">' + tapIcon + "</div>" +
      '<div class="pv-cta">' + escapeHtml(pl.cta) + "</div>" +
      (businessName ? '<div class="pv-biz">' + escapeHtml(businessName) + "</div>" : "") +
      "</div></div>"
    );
  }

  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  window.STORE = {
    read: read, add: add, setQty: setQty, remove: remove, clear: clear,
    summary: summary, count: count, preview: preview, escapeHtml: escapeHtml, toast: toast,
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateBadge();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
    });
  });
})();
