/* TAKTO: productos, carrito, pedido y animaciones. El HTML base ya viene armado por build.js. */
(function () {
  var C = window.CATALOG;
  var CARDS = window.CARDS;
  var VIEWS = window.VIEWS;
  var KEY = "takto_state_v3";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = C.formatMoney;
  var esc = VIEWS.esc;

  function wa(text) {
    return "https://wa.me/" + C.brand.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 400); }, 2400);
  }

  // ---------- Estado (se recuerda en este navegador) ----------
  var state = { sel: {}, pick: {}, cart: [], delivery: C.delivery[0].id, customer: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch (e) {}
  if (!Array.isArray(state.cart)) state.cart = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function currentQuote() {
    return C.quote(state.cart, state.delivery);
  }
  function selected(p) {
    return C.getVariant(p, state.sel[p.id]) || p.variants[0];
  }

  // ---------- Productos ----------
  function renderVariant(p) {
    var v = selected(p), box = $('[data-product="' + p.id + '"]');
    $('[data-face="front"]', box).innerHTML = CARDS.card(p.id, v.id);
    $('[data-face="back"]', box).innerHTML = CARDS.back(p.id, v.id);
    $$("[data-variant]", box).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.variant === p.id + ":" + v.id); });
  }

  function renderPick(p) {
    var n = state.pick[p.id] || 1, input = $('[data-pick="' + p.id + '"]');
    if (document.activeElement !== input) input.value = n;
    $('[data-pick-note="' + p.id + '"]').textContent = VIEWS.pickNote(p, n);
    $$('[data-tier][data-pid="' + p.id + '"]').forEach(function (b) {
      b.setAttribute("aria-checked", (b.dataset.tier === "wholesale") === n >= C.wholesaleFrom);
    });
  }

  function renderCount() {
    var n = currentQuote().qty;
    $$("[data-count]").forEach(function (el) { el.textContent = n; el.hidden = !n; });
  }

  // ---------- Animación del celular en la portada ----------
  var heroSeq = [["google", "negra"], ["redes", "instagram"], ["redes", "whatsapp"], ["google", "blanca"], ["redes", "facebook"], ["redes", "tiktok"]];
  var heroIdx = 0;
  function renderHeroCard() {
    var k = heroSeq[heroIdx % heroSeq.length], v = C.getVariant(C.getProduct(k[0]), k[1]);
    $("#hero-card").innerHTML = CARDS.card(k[0], k[1]);
    $("#phone-open").innerHTML = CARDS.screen(v.screen);
    $("#banner-app").textContent = CARDS.appName(v.screen);
    $(".nfc-burst").style.setProperty("--burst", v.color);
  }

  // ---------- Carrito ----------
  function addToCart(pid) {
    var p = C.getProduct(pid), v = selected(p), n = state.pick[pid] || 1;
    var line = state.cart.filter(function (l) { return l.product === pid && l.variant === v.id; })[0];
    if (line) line.qty = Math.min(999, line.qty + n);
    else state.cart.push({ product: pid, variant: v.id, qty: n });
    state.pick[pid] = 1;
    save();
    renderPick(p);
    renderCount();
    var bag = $(".bag");
    if (bag.animate && !reduceMotion) bag.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 400 });
    toast("Agregaste " + n + " × " + p.name + " · " + v.name);
  }

  function setLine(i, qty) {
    if (!state.cart[i]) return;
    if (qty <= 0) state.cart.splice(i, 1);
    else state.cart[i].qty = Math.min(999, qty);
    save();
    renderCount();
    renderOrder();
  }

  // ---------- Panel de pedido ----------
  var drawer = $("#drawer"), overlay = $(".overlay");
  function openOrder() {
    renderOrder();
    drawer.classList.add("open");
    overlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }
  function closeOrder() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function field(name, label, type, full, attrs) {
    return '<div class="' + (full ? "full" : "") + '"><label for="o-' + name + '">' + label + "</label>" +
      '<input id="o-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(state.customer[name] || "") + '" ' + (attrs || "") + "></div>";
  }

  function renderOrder() {
    var q = currentQuote(), body = $("#drawer-body");
    if (!q.qty) {
      body.innerHTML = '<div class="empty-msg"><p>Aún no agregas tarjetas.</p><a class="btn btn-primary" href="#productos" data-close-order>Ver tarjetas</a></div>';
      return;
    }
    var html = q.groups.map(function (g) {
      return '<div class="d-group"><div class="d-group-head"><span>' + esc(g.product.name) + "</span><span>" + money(g.total) + "</span></div>" +
        g.lines.map(function (l) {
          var i = state.cart.findIndex(function (c) { return c.product === l.product.id && c.variant === l.variant.id; });
          return '<div class="d-line"><div class="mini shape-' + l.product.shape + '">' + CARDS.card(l.product.id, l.variant.id) + "</div><span>" + esc(l.variant.name) + "</span>" +
            '<div class="stepper"><button type="button" data-line-dec="' + i + '" aria-label="Menos">−</button><input type="number" min="0" max="999" data-line="' + i + '" value="' + l.qty + '" aria-label="Cantidad"><button type="button" data-line-inc="' + i + '" aria-label="Más">+</button></div></div>';
        }).join("") +
        (g.wholesale
          ? '<p class="d-note ok">Precio de mayoreo: ' + money(g.unit) + " c/u · ahorras " + money(g.saving) + "</p>"
          : '<p class="d-note">Menudeo: ' + money(g.unit) + " c/u. Agrega " + g.missing + " más de este producto y paga " + money(g.product.wholesale) + " c/u.</p>") +
        "</div>";
    }).join("");

    var missingShip = C.freeShippingFrom - q.qty;
    html += '<div class="d-block"><span class="lbl">Entrega</span>' + C.delivery.map(function (d) {
      var cost = q.qty >= C.freeShippingFrom ? 0 : d.cost;
      return '<label class="radio"><input type="radio" name="delivery" value="' + d.id + '"' + (state.delivery === d.id ? " checked" : "") + ">" +
        "<span><strong>" + esc(d.name) + "</strong><small>" + esc(d.detail) + "</small></span><em>" + (cost ? money(cost) : "Gratis") + "</em></label>";
    }).join("") +
      (missingShip > 0 && state.delivery === "envio" ? '<p class="d-note">Agrega ' + missingShip + (missingShip === 1 ? " pieza" : " piezas") + " más y el envío es gratis.</p>" : "") + "</div>";

    var needsAddress = state.delivery === "envio";
    var custom = q.groups.some(function (g) { return !g.product.stock; });
    html += '<form id="order-form" novalidate><div class="d-block"><span class="lbl">Tus datos</span><div class="form-grid">' +
      field("name", "Nombre completo", "text", true, 'autocomplete="name" required') +
      field("phone", "WhatsApp", "tel", false, 'autocomplete="tel" inputmode="tel" pattern="[0-9 +]{10,16}" required') +
      field("email", "Correo", "email", false, 'autocomplete="email" required') +
      (needsAddress
        ? field("street", "Calle y número", "text", true, 'autocomplete="address-line1" required') +
          field("colonia", "Colonia", "text", false, "required") +
          field("zip", "Código postal", "text", false, 'inputmode="numeric" pattern="[0-9]{5}" required') +
          field("city", "Ciudad", "text", false, 'autocomplete="address-level2" required') +
          field("state", "Estado", "text", false, "required")
        : "") +
      '<div class="full"><label for="o-links">Enlaces para programar (opcional)</label><textarea id="o-links" name="links" rows="2" placeholder="Si quieres que te las enviemos programadas">' + esc(state.customer.links || "") + "</textarea></div>" +
      "</div>" + (custom ? '<p class="d-note">Las tarjetas bajo pedido se fabrican en 7 a 12 días hábiles.</p>' : "") + "</div>" +
      '<div class="d-block"><div class="sum-rows" style="margin:0 0 14px">' +
      "<div><span>" + q.qty + (q.qty === 1 ? " pieza" : " piezas") + "</span><strong>" + money(q.subtotal) + "</strong></div>" +
      "<div><span>Envío</span><strong>" + (q.shipping ? money(q.shipping) : "Gratis") + "</strong></div></div>" +
      '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>" +
      '<div class="pay"><button class="btn btn-primary btn-block" type="submit" data-pay="mp">Pagar con Mercado Pago</button>' +
      '<button class="btn btn-wa btn-block" type="submit" data-pay="wa">Pedir por WhatsApp</button></div>' +
      '<p class="form-error" id="order-error" hidden></p>' +
      '<p class="form-note">Tarjeta, OXXO o transferencia con Mercado Pago. Incluye el video de configuración.</p></div></form>';
    body.innerHTML = html;
  }

  function readCustomer() {
    var form = $("#order-form");
    if (!form) return state.customer;
    $$("input, textarea", form).forEach(function (el) { if (el.name) state.customer[el.name] = el.value.trim(); });
    save();
    return state.customer;
  }

  function orderText(q, c) {
    var lines = q.groups.map(function (g) {
      return g.product.name + " (" + (g.wholesale ? "mayoreo" : "menudeo") + ", " + money(g.unit) + " c/u):\n" +
        g.lines.map(function (l) { return "  • " + l.qty + " × " + l.variant.name; }).join("\n");
    }).join("\n");
    var where = state.delivery === "pickup" ? "Recojo en Guadalajara" : c.street + ", Col. " + c.colonia + ", CP " + c.zip + ", " + c.city + ", " + c.state;
    return "Hola, quiero hacer este pedido de " + C.brand.name + ":\n\n" + lines +
      "\n\nSubtotal: " + money(q.subtotal) + "\nEnvío: " + (q.shipping ? money(q.shipping) : "Gratis") + "\nTotal: " + money(q.total) +
      "\n\nNombre: " + c.name + "\nWhatsApp: " + c.phone + "\nCorreo: " + c.email + "\nEntrega: " + where +
      (c.links ? "\n\nEnlaces para programar:\n" + c.links : "");
  }

  function submitOrder(e) {
    e.preventDefault();
    var form = e.target, err = $("#order-error"), method = (e.submitter && e.submitter.dataset.pay) || "mp";
    err.hidden = true;
    var c = readCustomer();
    if (!form.checkValidity()) {
      var bad = $(":invalid", form);
      err.textContent = "Revisa el campo «" + $('label[for="' + bad.id + '"]', form).textContent + "».";
      err.hidden = false;
      bad.focus();
      return;
    }
    var q = currentQuote();
    if (method === "wa") {
      window.open(wa(orderText(q, c)), "_blank", "noopener");
      return;
    }
    var btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "Conectando con Mercado Pago…";
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: state.cart, delivery: state.delivery, customer: c }),
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error); return j; }); })
      .then(function (j) { location.href = j.init_point; })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "Pagar con Mercado Pago";
        err.textContent = "El pago en línea no está disponible en este momento. Haz tu pedido por WhatsApp y te mandamos tu liga de pago.";
        err.hidden = false;
      });
  }

  // ---------- Eventos ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    var d = t.dataset;
    if (d.variant) {
      var parts = d.variant.split(":");
      state.sel[parts[0]] = parts[1];
      save();
      renderVariant(C.getProduct(parts[0]));
    } else if (d.tier) {
      // Menudeo regresa a 1 pieza; mayoreo sube al mínimo de mayoreo.
      var cur = state.pick[d.pid] || 1;
      state.pick[d.pid] = d.tier === "wholesale" ? Math.max(cur, C.wholesaleFrom) : cur >= C.wholesaleFrom ? 1 : cur;
      renderPick(C.getProduct(d.pid));
    } else if (d.pickInc || d.pickDec) {
      var id = d.pickInc || d.pickDec;
      state.pick[id] = Math.max(1, Math.min(999, (state.pick[id] || 1) + (d.pickInc ? 1 : -1)));
      renderPick(C.getProduct(id));
    } else if (d.add) addToCart(d.add);
    else if (d.lineInc || d.lineDec) {
      readCustomer();
      var i = +(d.lineInc || d.lineDec);
      setLine(i, state.cart[i].qty + (d.lineInc ? 1 : -1));
    } else if (t.hasAttribute("data-open-order")) openOrder();
    else if (t.hasAttribute("data-close-order")) closeOrder();
    else if (t.classList.contains("menu-btn")) {
      var open = document.body.classList.toggle("nav-open");
      t.setAttribute("aria-expanded", open);
    }
    if (t.closest(".nav")) document.body.classList.remove("nav-open");
  });
  overlay.addEventListener("click", closeOrder);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOrder(); });

  $("#products").addEventListener("input", function (e) {
    var id = e.target.dataset.pick;
    if (!id) return;
    state.pick[id] = Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1));
    renderPick(C.getProduct(id));
  });

  drawer.addEventListener("change", function (e) {
    if (e.target.name === "delivery") {
      readCustomer();
      state.delivery = e.target.value;
      save();
      renderOrder();
    } else if (e.target.dataset.line !== undefined) {
      readCustomer();
      setLine(+e.target.dataset.line, parseInt(e.target.value, 10) || 0);
    }
  });
  drawer.addEventListener("input", function (e) { if (e.target.closest("#order-form")) readCustomer(); });
  drawer.addEventListener("submit", submitOrder);

  // ---------- Animaciones ----------
  var header = $("#header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal, .reveal-stagger").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal, .reveal-stagger").forEach(function (el) { el.classList.add("in"); });
  }

  // Inclinación 3D que sigue al cursor.
  function tilt(area, target, strength) {
    area.addEventListener("pointermove", function (e) {
      var r = area.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      target.style.transform = "rotateX(" + (-y * strength) + "deg) rotateY(" + (x * strength) + "deg)";
    });
    area.addEventListener("pointerleave", function () { target.style.transform = ""; });
  }

  var markSvg = '<svg viewBox="-6 -21 30 42" aria-hidden="true">' + CARDS.mark(0, 0, 1, "currentColor") + "</svg>";
  $$("[data-mark]").forEach(function (el) { el.innerHTML = markSvg; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("[data-wa]").forEach(function (el) { el.href = wa("Hola, quiero información de las tarjetas NFC " + C.brand.name); el.target = "_blank"; el.rel = "noopener"; });

  C.products.forEach(function (p) {
    if (state.sel[p.id]) renderVariant(p);
    renderPick(p);
  });
  renderCount();
  renderHeroCard();

  // Cada vuelta de la animación muestra otra tarjeta.
  $(".phone").addEventListener("animationiteration", function (e) {
    if (e.target !== e.currentTarget) return;
    heroIdx++;
    renderHeroCard();
  });

  if (finePointer && !reduceMotion) {
    tilt($("#stage"), $("#hero-tilt"), 10);
    $$(".product-media").forEach(function (m) { tilt(m, $(".tilt", m), 14); });
  }
})();
