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
  var state = { sel: {}, pick: {}, custom: {}, cart: [], delivery: C.delivery[0].id, customer: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch (e) {}
  if (!Array.isArray(state.cart)) state.cart = [];
  if (!state.custom || typeof state.custom !== "object") state.custom = {};
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
  function custom(p) {
    return p.custom ? state.custom[p.id] || {} : {};
  }

  function renderFront(p) {
    var box = $('[data-product="' + p.id + '"]');
    $('[data-face="front"]', box).innerHTML = CARDS.card(p.id, selected(p).id, custom(p));
  }

  function renderVariant(p) {
    var v = selected(p), box = $('[data-product="' + p.id + '"]'), back = $('[data-face="back"]', box);
    renderFront(p);
    back.innerHTML = VIEWS.backFace(p, v);
    back.classList.toggle("photo", !!VIEWS.photoFor(p, v));
    $$("[data-variant]", box).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.variant === p.id + ":" + v.id); });
  }

  // Vuelve a armar toda la ficha (cuando cambia el logo).
  function renderProduct(p) {
    var box = $('[data-product="' + p.id + '"]');
    box.outerHTML = VIEWS.product(p, selected(p).id, state.pick[p.id], custom(p));
    if (finePointer && !reduceMotion) {
      var m = $('[data-product="' + p.id + '"] .product-media');
      tilt(m, $(".tilt", m), 10);
    }
  }

  // Reduce el logo a 400 px para guardarlo en el navegador sin ocupar mucho.
  function readLogo(file, pid) {
    if (!file || !/^image\//.test(file.type)) return toast("El logo debe ser una imagen");
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 400 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        state.custom[pid] = Object.assign({}, state.custom[pid], { logo: c.toDataURL("image/png") });
        save();
        renderProduct(C.getProduct(pid));
        toast("Logo listo ✓");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function renderPick(p) {
    var n = state.pick[p.id] || 1, input = $('[data-pick="' + p.id + '"]');
    if (document.activeElement !== input) input.value = n;
    $('[data-pick-note="' + p.id + '"]').textContent = VIEWS.pickNote(p, n);
    $$('[data-tier][data-pid="' + p.id + '"]').forEach(function (b) {
      b.setAttribute("aria-checked", (b.dataset.tier === "wholesale") === n >= C.minWholesale(p));
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
    var p = C.getProduct(pid), v = selected(p), n = state.pick[pid] || 1, cu = custom(p);
    var text = (cu.text || "").trim(), logo = cu.logo || "";
    var line = state.cart.filter(function (l) { return l.product === pid && l.variant === v.id && (l.text || "") === text && (l.logo || "") === logo; })[0];
    if (line) line.qty = Math.min(999, line.qty + n);
    else state.cart.push({ product: pid, variant: v.id, qty: n, text: text, logo: logo });
    state.pick[pid] = 1;
    save();
    renderPick(p);
    renderCount();
    var bag = $(".bag");
    if (bag.animate && !reduceMotion) bag.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 400 });
    toast("Agregado al carrito ✓");
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
      body.innerHTML = '<div class="empty-msg"><p>Tu carrito está vacío.</p><a class="btn btn-primary" href="#productos" data-close-order>Ver tarjetas</a></div>';
      return;
    }
    var html = q.groups.map(function (g) {
      return '<div class="d-group">' + g.lines.map(function (l) {
          var i = state.cart.findIndex(function (c) { return c.product === l.product.id && c.variant === l.variant.id && (c.text || "") === l.text && !!c.logo === l.logo; });
          var item = state.cart[i] || {};
          var extra = (item.text ? "“" + item.text + "”" : "") + (item.logo ? (item.text ? " · " : "") + "con logo" : "");
          return '<div class="d-line"><div class="mini shape-' + l.product.shape + '">' + CARDS.card(l.product.id, l.variant.id, { text: item.text, logo: item.logo }) + "</div>" +
            '<span class="d-name">' + esc(l.product.cartName) + "<small>" + esc(l.variant.name) + " · " + money(g.unit) + " c/u</small>" + (extra ? "<small>" + esc(extra) + "</small>" : "") + "</span>" +
            '<div class="stepper"><button type="button" data-line-dec="' + i + '" aria-label="Menos">−</button><input type="number" min="1" max="999" inputmode="numeric" data-line="' + i + '" value="' + l.qty + '" aria-label="Cantidad"><button type="button" data-line-inc="' + i + '" aria-label="Más">+</button></div>' +
            '<button type="button" class="remove" data-remove="' + i + '" aria-label="Quitar del carrito">×</button></div>';
        }).join("") +
        (g.wholesale
          ? '<p class="d-note ok">Precio de mayoreo aplicado</p>'
          : '<p class="d-note">Con ' + g.missing + " más pagas " + money(g.product.wholesale) + " c/u (mayoreo)</p>") +
        "</div>";
    }).join("");

    html += '<form id="order-form" novalidate><div class="d-block"><span class="lbl">Envío</span><div class="form-grid">' +
      field("name", "Nombre", "text", true, 'autocomplete="name" required') +
      field("phone", "WhatsApp", "tel", true, 'autocomplete="tel" inputmode="tel" pattern="[0-9 +]{10,16}" required') +
      field("street", "Calle y número", "text", true, 'autocomplete="address-line1" required') +
      field("zip", "Código postal", "text", false, 'inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code" required') +
      field("city", "Ciudad", "text", false, 'autocomplete="address-level2" required') +
      field("state", "Estado", "text", true, 'autocomplete="address-level1" required') +
      field("links", "Enlace para programarlas (opcional)", "text", true, 'placeholder="Tu link de Google, Instagram o WhatsApp"') +
      "</div></div>" +
      '<div class="d-block"><div class="sum-rows" style="margin:0 0 12px">' +
      "<div><span>" + q.qty + (q.qty === 1 ? " pieza" : " piezas") + "</span><strong>" + money(q.subtotal) + "</strong></div>" +
      "<div><span>Envío</span><strong>" + (q.shipping ? money(q.shipping) : "Gratis") + "</strong></div></div>" +
      '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>" +
      '<div class="pay"><button class="btn btn-primary btn-block" type="submit" data-pay="mp">Pagar ' + money(q.total) + "</button>" +
      '<button class="btn btn-line btn-block" type="submit" data-pay="wa">Pedir por WhatsApp</button></div>' +
      '<p class="form-error" id="order-error" hidden></p></div></form>';
    body.innerHTML = html;
  }

  function readCustomer() {
    var form = $("#order-form");
    if (!form) return state.customer;
    $$("input", form).forEach(function (el) { if (el.name) state.customer[el.name] = el.value.trim(); });
    save();
    return state.customer;
  }

  function orderText(q, c) {
    var lines = q.groups.map(function (g) {
      return g.product.name + " (" + (g.wholesale ? "mayoreo" : "menudeo") + ", " + money(g.unit) + " c/u):\n" +
        g.lines.map(function (l) {
          return "  • " + l.qty + " × " + l.variant.name + (l.text ? " · texto: " + l.text : "") + (l.logo ? " · con logo (te lo envío por aquí)" : "");
        }).join("\n");
    }).join("\n");
    var where = c.street + ", CP " + c.zip + ", " + c.city + ", " + c.state;
    return "Hola, quiero hacer este pedido de " + C.brand.name + ":\n\n" + lines +
      "\n\nSubtotal: " + money(q.subtotal) + "\nEnvío: " + (q.shipping ? money(q.shipping) : "Gratis") + "\nTotal: " + money(q.total) +
      "\n\nNombre: " + c.name + "\nWhatsApp: " + c.phone + "\nEnvío: " + where +
      (c.links ? "\nProgramar con: " + c.links : "");
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
      body: JSON.stringify({
        items: state.cart.map(function (l) { return { product: l.product, variant: l.variant, qty: l.qty, text: l.text, logo: !!l.logo }; }),
        delivery: state.delivery,
        customer: c,
      }),
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.init_point) throw new Error(j.error || "Error " + r.status); return j; });
      })
      .then(function (j) { location.href = j.init_point; })
      .catch(function (ex) {
        btn.disabled = false;
        btn.textContent = "Pagar " + money(q.total);
        err.textContent = "No se pudo abrir Mercado Pago (" + ex.message + "). Puedes pedir por WhatsApp.";
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
      var minWs = C.minWholesale(C.getProduct(d.pid));
      state.pick[d.pid] = d.tier === "wholesale" ? Math.max(cur, minWs) : cur >= minWs ? 1 : cur;
      renderPick(C.getProduct(d.pid));
    } else if (d.pickInc || d.pickDec) {
      var id = d.pickInc || d.pickDec;
      state.pick[id] = Math.max(1, Math.min(999, (state.pick[id] || 1) + (d.pickInc ? 1 : -1)));
      renderPick(C.getProduct(id));
    } else if (d.add) addToCart(d.add);
    else if (d.logoClear) {
      state.custom[d.logoClear] = Object.assign({}, state.custom[d.logoClear], { logo: "" });
      save();
      renderProduct(C.getProduct(d.logoClear));
    }
    else if (d.remove !== undefined) {
      readCustomer();
      setLine(+d.remove, 0);
    } else if (d.lineInc || d.lineDec) {
      readCustomer();
      var i = +(d.lineInc || d.lineDec);
      setLine(i, Math.max(1, state.cart[i].qty + (d.lineInc ? 1 : -1)));
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

  var products = $("#products");
  products.addEventListener("change", function (e) {
    if (e.target.dataset.logo) readLogo(e.target.files[0], e.target.dataset.logo);
  });
  // Arrastrar un logo sobre la tarjeta.
  products.addEventListener("dragover", function (e) {
    var zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    zone.classList.add("dragging");
  });
  products.addEventListener("dragleave", function (e) {
    var zone = e.target.closest("[data-drop]");
    if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("dragging");
  });
  products.addEventListener("drop", function (e) {
    var zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove("dragging");
    readLogo(e.dataTransfer.files[0], zone.dataset.drop);
  });
  // En celular, tocar la tarjeta la voltea.
  products.addEventListener("click", function (e) {
    var media = e.target.closest(".product-media");
    if (media && !finePointer) media.classList.toggle("flipped");
  });
  products.addEventListener("input", function (e) {
    if (e.target.dataset.text) {
      var tid = e.target.dataset.text, tp = C.getProduct(tid);
      state.custom[tid] = Object.assign({}, state.custom[tid], { text: e.target.value.slice(0, 60) });
      save();
      renderFront(tp);
      $('[data-count-for="' + tid + '"]').textContent = e.target.value.length + "/60";
      return;
    }
    var id = e.target.dataset.pick;
    if (!id) return;
    state.pick[id] = Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1));
    renderPick(C.getProduct(id));
  });

  drawer.addEventListener("change", function (e) {
    if (e.target.dataset.line !== undefined) {
      readCustomer();
      setLine(+e.target.dataset.line, Math.max(1, parseInt(e.target.value, 10) || 1));
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
    if (p.custom && (custom(p).text || custom(p).logo)) renderProduct(p);
    else if (state.sel[p.id]) renderVariant(p);
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
