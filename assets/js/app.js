/* TAKTO: productos, carrito, pedido y animaciones. El HTML base ya viene armado por build.js. */
(function () {
  var C = window.CATALOG;
  var CARDS = window.CARDS;
  var VIEWS = window.VIEWS;
  // v4: el cartón negro pasó de piezas a paquetes de 100 (gracias.html lee esta misma clave).
  var KEY = "takto_state_v4";
  var OLD_KEY = "takto_state_v3";
  // Logos más pesados que esto solo viven en memoria (no se guardan en el navegador).
  var LOGO_MAX = 200 * 1024;
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
  var state = { sel: {}, pick: {}, custom: {}, cart: [], delivery: C.defaultDelivery, customer: {}, program: null };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!saved) {
      // Carrito de la versión anterior: el cartón negro se contaba por pieza, ahora por paquete; se quita para no cobrar de más.
      saved = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
      if (saved && Array.isArray(saved.cart)) saved.cart = saved.cart.filter(function (l) { return l && l.product !== "papel"; });
      if (saved && saved.pick) delete saved.pick.papel;
    }
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch (e) {}
  if (!Array.isArray(state.cart)) state.cart = [];
  state.cart = state.cart.filter(function (l) { return l && C.getProduct(l.product) && l.qty > 0; });
  if (!state.pick || typeof state.pick !== "object") state.pick = {};
  if (!state.sel || typeof state.sel !== "object") state.sel = {};
  if (!state.custom || typeof state.custom !== "object") state.custom = {};
  if (!state.customer || typeof state.customer !== "object") state.customer = {};
  if (!C.delivery.some(function (d) { return d.id === state.delivery; })) state.delivery = C.defaultDelivery;
  // "¿Qué quieres que abra tu tarjeta?": same = todas igual; all = destino común; lines = destino por línea del carrito.
  if (!state.program || typeof state.program !== "object") {
    state.program = { same: false, all: { dest: "", link: "" }, lines: {} };
    // Compatibilidad: el campo viejo "links" pasa a "Todas igual".
    if (state.customer.links) {
      state.program.same = true;
      state.program.all = { dest: "otro", link: state.customer.links };
    }
  }
  if (!state.program.all) state.program.all = { dest: "", link: "" };
  if (!state.program.lines || typeof state.program.lines !== "object") state.program.lines = {};
  delete state.customer.links;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Sin espacio: se guarda todo menos las imágenes de logo.
      try {
        localStorage.setItem(KEY, JSON.stringify(state, function (k, v) { return k === "logo" && typeof v === "string" ? undefined : v; }));
      } catch (e2) {}
    }
  }
  function lineKey(l) {
    return l.product + "|" + l.variant + "|" + (l.text || "") + (l.logo ? "|logo" : "");
  }
  // Destino de una línea del carrito (o el común si eligió "Todas igual").
  function progFor(l) {
    if (state.program.same) return state.program.all;
    var k = lineKey(l);
    if (!state.program.lines[k]) state.program.lines[k] = { dest: C.suggestTarget(l.product, l.variant), link: "" };
    return state.program.lines[k];
  }
  function cartItems() {
    return state.cart.map(function (l) {
      var pr = progFor(l);
      // Del logo solo viaja la marca "con logo": la imagen nunca sale del navegador.
      return { product: l.product, variant: l.variant, qty: l.qty, text: l.text, logo: !!l.logo, dest: pr.dest, link: pr.link };
    });
  }
  function isPickup() {
    return !!C.getDelivery(state.delivery).pickup;
  }
  function currentQuote() {
    return C.quote(cartItems(), state.delivery);
  }
  function selected(p) {
    return C.getVariant(p, state.sel[p.id]) || p.variants[0];
  }

  // ---------- Productos ----------
  // Logos subidos para la vista previa (también los que pesan mucho para guardarse).
  var logoMem = {};
  // Personalización: "blank" (en blanco, por defecto), "name" (con nombre) o "logo" (con logo).
  function choice(p) {
    if (!p.custom) return {};
    var c = state.custom[p.id] || {};
    return { mode: VIEWS.customMode(p, c), text: c.text || "", logo: logoMem[p.id] || c.logo || "" };
  }
  // Lo que se dibuja en la tarjeta según la personalización.
  function custom(p) {
    return VIEWS.cardOpts(p, choice(p)) || {};
  }
  function logoImage(pid) {
    return logoMem[pid] || (state.custom[pid] && state.custom[pid].logo) || "";
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

  // Vuelve a armar toda la ficha (al cambiar la personalización o el logo).
  function renderProduct(p) {
    var box = $('[data-product="' + p.id + '"]');
    box.outerHTML = VIEWS.product(p, selected(p).id, state.pick[p.id], choice(p));
    if (finePointer && !reduceMotion) {
      var m = $('[data-product="' + p.id + '"] .product-media');
      tilt(m, $(".tilt", m), 10);
    }
  }

  // Vista previa del logo: se reduce a 400 px. No se manda al servidor; se guarda en el navegador solo si pesa poco.
  function readLogo(file, pid) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast("Para verlo aquí usa PNG o JPG. El PDF nos lo mandas por WhatsApp");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var url = reader.result;
        try {
          var k = Math.min(1, 400 / Math.max(img.width || 400, img.height || 400)), c = document.createElement("canvas");
          c.width = Math.max(1, Math.round((img.width || 400) * k));
          c.height = Math.max(1, Math.round((img.height || 400) * k));
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          url = c.toDataURL("image/png");
        } catch (e) {}
        logoMem[pid] = url;
        var cu = Object.assign({}, state.custom[pid], { mode: "logo" });
        delete cu.logo;
        if (url.length < LOGO_MAX) cu.logo = url;
        state.custom[pid] = cu;
        save();
        renderProduct(C.getProduct(pid));
        toast("Así se verá tu logo ✓");
      };
      img.onerror = function () { toast("No pudimos abrir esa imagen. Prueba con PNG o JPG"); };
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
  // Tolera que falte cualquier pieza de la portada (se puede rediseñar sin romper la tienda).
  function renderHeroCard() {
    var k = heroSeq[heroIdx % heroSeq.length], v = C.getVariant(C.getProduct(k[0]), k[1]);
    var card = $("#hero-card"), open = $("#phone-open"), app = $("#banner-app"), burst = $(".nfc-burst");
    if (card) card.innerHTML = CARDS.card(k[0], k[1]);
    if (open) open.innerHTML = CARDS.screen(v.screen);
    if (app) app.textContent = CARDS.appName(v.screen);
    if (burst) burst.style.setProperty("--burst", v.color);
  }

  // ---------- Carrito ----------
  function addToCart(pid) {
    var p = C.getProduct(pid), v = selected(p), n = state.pick[pid] || 1, ch = choice(p);
    var text = ch.mode === "name" ? String(ch.text || "").replace(/\s+/g, " ").trim().slice(0, 40) : "";
    var logo = ch.mode === "logo";
    if (ch.mode === "name" && !text) {
      toast("Escribe el nombre o elige En blanco");
      var input = $('[data-text="' + pid + '"]');
      if (input) input.focus();
      return;
    }
    var line = state.cart.filter(function (l) { return l.product === pid && l.variant === v.id && (l.text || "") === text && !!l.logo === logo; })[0];
    if (line) line.qty = Math.min(999, line.qty + n);
    else state.cart.push(logo ? { product: pid, variant: v.id, qty: n, text: "", logo: true } : { product: pid, variant: v.id, qty: n, text: text });
    state.pick[pid] = 1;
    save();
    renderPick(p);
    renderCount();
    var bag = $(".bag");
    if (bag && bag.animate && !reduceMotion) bag.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 400 });
    toast(logo ? "Agregado ✓ El logo lo mandas al pagar" : "Agregado al carrito ✓");
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

  // Bloque "¿Qué quieres que abra tu tarjeta?": un destino por línea, o uno para todas.
  function progRow(id, title, pr) {
    var t = C.getTarget(pr.dest);
    var needsLink = t && t.id !== "luego";
    return '<div class="prog-row">' +
      (title ? '<label class="prog-title" for="p-dest-' + id + '">' + esc(title) + "</label>" : "") +
      '<select id="p-dest-' + id + '" data-prog-dest="' + id + '"' + (title ? "" : ' aria-label="Qué abre la tarjeta"') + ">" +
      '<option value="">Elige qué abre</option>' +
      C.programTargets.map(function (x) {
        return '<option value="' + x.id + '"' + (t && t.id === x.id ? " selected" : "") + ">" + esc(x.name) + "</option>";
      }).join("") + "</select>" +
      (needsLink
        ? '<input type="text" maxlength="300" id="p-link-' + id + '" data-prog-link="' + id + '" value="' + esc(pr.link || "") + '" placeholder="' + esc(t.placeholder) + '" aria-label="' + esc(t.name) + ': enlace, usuario o datos">'
        : "") +
      (t ? '<small class="prog-help">' + esc(t.help) + (needsLink ? " Si no lo tienes a la mano, te lo pedimos por WhatsApp." : "") + "</small>" : "") +
      "</div>";
  }

  function programBlock() {
    var html = '<div class="d-block prog"><span class="lbl">¿Qué quieres que abra tu tarjeta?</span>' +
      '<p class="prog-notice" role="note"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>' +
      "<span>Nosotros te las configuramos con tu enlace, o si prefieres te mandamos un video corto para que las configures tú.</span></p>" +
      '<p class="prog-intro">Elige a dónde abre y llega lista para usarse. Puedes cambiarlo después.</p>';
    if (state.cart.length > 1) {
      html += '<label class="prog-same"><input type="checkbox" data-prog-same' + (state.program.same ? " checked" : "") + "> Todas igual</label>";
    }
    if (state.program.same || state.cart.length === 1) {
      var only = state.cart.length === 1 && !state.program.same;
      html += progRow(only ? 0 : "all", "", only ? progFor(state.cart[0]) : state.program.all);
    } else {
      html += state.cart.map(function (l, i) {
        var p = C.getProduct(l.product), v = p && C.getVariant(p, l.variant);
        if (!p || !v) return "";
        return progRow(i, p.cartName + " · " + v.name + (l.text ? " · " + l.text : "") + (l.logo ? " · con logo" : ""), progFor(l));
      }).join("");
    }
    return html + "</div>";
  }

  function deliveryBlock(q) {
    return '<div class="d-block"><span class="lbl">Entrega</span>' + C.delivery.map(function (d) {
      var price = d.pickup ? "Sin costo" : q.cards >= C.freeShippingFrom ? "Gratis" : money(d.cost);
      return '<label class="radio"><input type="radio" name="delivery" value="' + d.id + '"' + (state.delivery === d.id ? " checked" : "") + ">" +
        "<span><strong>" + esc(d.name) + "</strong><small>" + esc(d.pickup ? d.detail : d.detail + " · llega a tu domicilio") + "</small></span><em>" + price + "</em></label>";
    }).join("") +
      (isPickup() ? '<p class="d-note pickup-note">Solo ' + esc(C.pickup.zone) + ": " + esc(C.pickup.cities.join(", ")) + ". Pagas aquí y pasas por tu pedido.</p>" : "") +
      "</div>";
  }

  function renderOrder() {
    var q = currentQuote(), body = $("#drawer-body");
    if (!q.qty) {
      body.innerHTML = '<div class="empty-msg"><p>Tu carrito está vacío.</p><a class="btn btn-primary" href="#productos" data-close-order>Ver tarjetas</a></div>';
      return;
    }
    // Quita destinos de líneas que ya no están en el carrito.
    var keys = state.cart.map(lineKey);
    Object.keys(state.program.lines).forEach(function (k) { if (keys.indexOf(k) < 0) delete state.program.lines[k]; });
    var pickup = isPickup();
    // El envío gratis cuenta tarjetas reales (un paquete de cartón cuenta como 100).
    var remaining = Math.max(0, C.freeShippingFrom - q.cards);
    var html = pickup
      ? '<div class="shipping-progress" role="status"><span>Recoges en Guadalajara: sin costo de envío.</span></div>'
      : '<div class="shipping-progress" role="status"><span>' +
        (remaining ? 'Agrega ' + remaining + (remaining === 1 ? ' tarjeta más' : ' tarjetas más') + ' y tu envío es gratis.' : 'Tu pedido ya tiene envío gratis.') +
        '</span><progress max="' + C.freeShippingFrom + '" value="' + Math.min(q.cards, C.freeShippingFrom) + '" aria-label="Avance para envío gratis"></progress></div>';
    var anyLogo = false;
    html += q.groups.map(function (g) {
      var p = g.product;
      return '<div class="d-group">' + g.lines.map(function (l) {
          var i = state.cart.findIndex(function (c) { return c.product === p.id && c.variant === l.variant.id && (c.text || "") === l.text && !!c.logo === l.logo; });
          if (l.logo) anyLogo = true;
          var extra = p.custom ? (l.logo ? "Con logo · lo mandas por WhatsApp" : l.text ? "Nombre: " + l.text : "En blanco") : "";
          if (p.custom && p.packOf && (l.logo || l.text)) extra += " (en las " + p.packOf + ")";
          var img = l.logo ? logoImage(p.id) : "";
          var opts = l.logo ? (img ? { logo: img } : { text: "TU LOGO" }) : { text: l.text };
          var price = p.packOf ? money(g.unit) + " · paquete de " + p.packOf : money(g.unit) + " c/u";
          return '<div class="d-line"><div class="mini shape-' + p.shape + '">' + CARDS.card(p.id, l.variant.id, opts) + "</div>" +
            '<span class="d-name">' + esc(p.cartName) + "<small>" + esc(l.variant.name) + " · " + price + "</small>" + (extra ? "<small>" + esc(extra) + "</small>" : "") + "</span>" +
            '<div class="stepper"><button type="button" data-line-dec="' + i + '" aria-label="Menos">−</button><input type="number" min="1" max="999" inputmode="numeric" data-line="' + i + '" value="' + l.qty + '" aria-label="' + (p.packOf ? "Paquetes" : "Cantidad") + '"><button type="button" data-line-inc="' + i + '" aria-label="Más">+</button></div>' +
            '<button type="button" class="remove" data-remove="' + i + '" aria-label="Quitar del carrito">×</button></div>';
        }).join("") + groupNote(g) + "</div>";
    }).join("");
    if (anyLogo) html += '<p class="d-note logo-reminder" role="note"><strong>Con logo:</strong> después de pagar nos mandas tu logo por WhatsApp (PNG o PDF).</p>';

    html += deliveryBlock(q) + programBlock();

    html += '<form id="order-form" novalidate><div class="d-block"><span class="lbl">' + (pickup ? "Tus datos" : "Tus datos y envío") + '</span><div class="form-grid">' +
      field("name", "Nombre", "text", true, 'autocomplete="name" required') +
      field("phone", "WhatsApp", "tel", true, 'autocomplete="tel" inputmode="tel" pattern="[0-9 +]{10,16}" required') +
      (pickup
        ? ""
        : field("street", "Calle, número y colonia", "text", true, 'autocomplete="address-line1" required') +
          field("zip", "Código postal", "text", false, 'inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code" required') +
          field("city", "Ciudad", "text", false, 'autocomplete="address-level2" required') +
          field("state", "Estado", "text", true, 'autocomplete="address-level1" required')) +
      "</div>" +
      (pickup ? '<p class="d-note">Te escribimos a este WhatsApp para coordinar punto y hora de entrega en Guadalajara.</p>' : "") +
      "</div>" +
      '<div class="d-block"><div class="sum-rows" style="margin:0 0 12px">' +
      "<div><span>" + q.cards.toLocaleString("es-MX") + (q.cards === 1 ? " tarjeta" : " tarjetas") + "</span><strong>" + money(q.subtotal) + "</strong></div>" +
      "<div><span>" + (pickup ? "Recoger en Guadalajara" : "Envío") + "</span><strong>" + (pickup ? "Sin costo" : q.shipping ? money(q.shipping) : "Gratis") + "</strong></div></div>" +
      '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>" +
      '<div class="pay"><button class="btn btn-primary btn-block" type="submit" data-pay="mp">Pagar ' + money(q.total) + " con Mercado Pago</button>" +
      '<button class="btn btn-line btn-block" type="submit" data-pay="wa">Pedir por WhatsApp</button></div>' +
      '<p class="form-note">Tarjeta, OXXO, transferencia o saldo de Mercado Pago. Pago seguro.</p>' +
      '<p class="form-error" id="order-error" hidden></p></div></form>';
    body.innerHTML = html;
  }

  // Nota de precio debajo de cada producto del carrito.
  function groupNote(g) {
    var p = g.product;
    if (p.packOf) return '<p class="d-note">' + C.unitLabel(p, g.qty) + " de " + p.packOf + " = " + g.cards.toLocaleString("es-MX") + " tarjetas</p>";
    if (!g.hasWholesale) return "";
    if (g.wholesale) {
      return '<p class="d-note ok">' + (p.pack ? "Precio de paquete aplicado: " + money(p.wholesale) + " c/u" : "Precio de mayoreo aplicado") + "</p>";
    }
    return '<p class="d-note">Con ' + g.missing + " más pagas " + money(p.wholesale) + " c/u" +
      (p.pack ? " (paquete de " + p.pack + " por " + money(p.wholesale * p.pack) + ")" : " (mayoreo)") + "</p>";
  }

  function readCustomer() {
    var form = $("#order-form");
    if (!form) return state.customer;
    $$("input", form).forEach(function (el) { if (el.name) state.customer[el.name] = el.value.trim(); });
    delete state.customer.links;
    save();
    return state.customer;
  }

  function orderText(q, c) {
    var anyLogo = false;
    var lines = q.groups.map(function (g) {
      return g.product.name + " (" + C.groupPriceLabel(g) + "):\n" +
        g.lines.map(function (l) {
          if (l.logo) anyLogo = true;
          var cu = C.customLabel(l);
          var qty = g.product.packOf ? C.unitLabel(g.product, l.qty) + " (" + l.qty * g.product.packOf + " tarjetas)" : l.qty;
          return "  • " + qty + " × " + l.variant.name + (cu ? " · " + cu : "");
        }).join("\n");
    }).join("\n");
    var all = [];
    q.groups.forEach(function (g) { all = all.concat(g.lines); });
    var program = C.programSummary(all).map(function (t) { return "  • " + t; }).join("\n");
    var delivery = q.delivery.pickup
      ? "Entrega: Recoger en Guadalajara (sin costo de envío). ¿Dónde y a qué hora paso?"
      : "Envío a: " + c.street + ", CP " + c.zip + ", " + c.city + ", " + c.state;
    return "Hola, quiero hacer este pedido de " + C.brand.name + ":\n\n" + lines +
      "\n\nQué abre cada tarjeta:\n" + program +
      "\n\nSubtotal: " + money(q.subtotal) + "\n" + (q.delivery.pickup ? "Recoger en Guadalajara: sin costo" : "Envío: " + (q.shipping ? money(q.shipping) : "Gratis")) + "\nTotal: " + money(q.total) +
      "\n\nNombre: " + c.name + "\nWhatsApp: " + c.phone + "\n" + delivery +
      (anyLogo ? "\n\nMi logo se los mando por aquí (PNG o PDF)." : "");
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
        items: cartItems(),
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
        btn.textContent = "Pagar " + money(q.total) + " con Mercado Pago";
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
    else if (d.mode) {
      var mp = d.mode.split(":");
      state.custom[mp[0]] = Object.assign({}, state.custom[mp[0]], { mode: mp[1] });
      save();
      renderProduct(C.getProduct(mp[0]));
      var focus = mp[1] === "name" ? $('[data-text="' + mp[0] + '"]') : $('[data-mode="' + d.mode + '"]');
      if (focus) focus.focus();
    } else if (d.logoClear) {
      delete logoMem[d.logoClear];
      if (state.custom[d.logoClear]) delete state.custom[d.logoClear].logo;
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
    if (e.target.dataset.logo) {
      readLogo(e.target.files && e.target.files[0], e.target.dataset.logo);
      e.target.value = "";
    }
  });
  // En celular, tocar la tarjeta la voltea.
  products.addEventListener("click", function (e) {
    var media = e.target.closest(".product-media");
    if (media && !finePointer) media.classList.toggle("flipped");
  });
  products.addEventListener("input", function (e) {
    if (e.target.dataset.text) {
      var tid = e.target.dataset.text, tp = C.getProduct(tid);
      state.custom[tid] = Object.assign({}, state.custom[tid], { text: e.target.value.slice(0, 40) });
      save();
      renderFront(tp);
      $('[data-count-for="' + tid + '"]').textContent = e.target.value.length + "/40";
      return;
    }
    var id = e.target.dataset.pick;
    if (!id) return;
    state.pick[id] = Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1));
    renderPick(C.getProduct(id));
  });

  // Destino común ("all") o de la línea i del carrito.
  function progTarget(id) {
    if (id === "all") return state.program.all;
    return state.cart[+id] ? progFor(state.cart[+id]) : null;
  }

  drawer.addEventListener("change", function (e) {
    var d = e.target.dataset;
    if (d.line !== undefined) {
      readCustomer();
      setLine(+d.line, Math.max(1, parseInt(e.target.value, 10) || 1));
    } else if (e.target.name === "delivery") {
      readCustomer();
      state.delivery = e.target.value;
      save();
      renderOrder();
      var r = $('input[name="delivery"]:checked', drawer);
      if (r) r.focus();
    } else if (d.progSame !== undefined) {
      readCustomer();
      // Al juntar, parte del destino de la primera tarjeta.
      if (e.target.checked && !state.program.all.dest && state.cart[0]) {
        var first = progFor(state.cart[0]);
        state.program.all = { dest: first.dest, link: first.link };
      }
      state.program.same = e.target.checked;
      save();
      renderOrder();
      var box = $("[data-prog-same]", drawer);
      if (box) box.focus();
    } else if (d.progDest !== undefined) {
      readCustomer();
      var pr = progTarget(d.progDest);
      if (!pr) return;
      pr.dest = e.target.value;
      save();
      renderOrder();
      var next = $('[data-prog-link="' + d.progDest + '"]', drawer) || $('[data-prog-dest="' + d.progDest + '"]', drawer);
      if (next) next.focus();
    }
  });
  drawer.addEventListener("input", function (e) {
    if (e.target.dataset.progLink !== undefined) {
      var pr = progTarget(e.target.dataset.progLink);
      if (pr) { pr.link = e.target.value.slice(0, 300); save(); }
      return;
    }
    if (e.target.closest("#order-form")) readCustomer();
  });
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
    if (p.custom && choice(p).mode !== "blank") renderProduct(p);
    else if (state.sel[p.id]) renderVariant(p);
    renderPick(p);
  });
  renderCount();
  renderHeroCard();

  // Cada vuelta de la animación muestra otra tarjeta.
  var phone = $(".phone");
  if (phone) phone.addEventListener("animationiteration", function (e) {
    if (e.target !== e.currentTarget) return;
    heroIdx++;
    renderHeroCard();
  });

  if (finePointer && !reduceMotion) {
    if ($("#stage") && $("#hero-tilt")) tilt($("#stage"), $("#hero-tilt"), 10);
    $$(".product-media").forEach(function (m) { tilt(m, $(".tilt", m), 14); });
  }
})();
