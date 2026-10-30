/* Página única: colección, armado de paquete, niveles, pedido y animaciones. */
(function () {
  var C = window.CATALOG;
  var CARDS = window.CARDS;
  var KEY = "takto_state_v1";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = C.formatMoney;
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  var giftIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H8a2.5 2.5 0 1 1 0-5c3 0 4 5 4 5zM12 7h4a2.5 2.5 0 1 0 0-5c-3 0-4 5-4 5z"/></svg>';
  var ZONES = ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco", "El Salto", "Otro municipio de Jalisco", "Otro estado"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Estado (se recuerda en este navegador) ----------
  var state = { mode: "reventa", finish: C.finishes[0].id, qty: {}, delivery: "zmg", resale: C.resale.suggested, customer: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch (e) {}
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function items() {
    return C.platforms.map(function (p) { return { platform: p.id, qty: state.qty[p.id] || 0 }; });
  }
  function currentQuote() {
    return C.quote(state.mode, items(), state.delivery, state.finish);
  }

  // Reparte n piezas entre los 7 diseños lo más parejo posible.
  function spread(n) {
    var q = {}, base = Math.floor(n / C.platforms.length), extra = n % C.platforms.length;
    C.platforms.forEach(function (p, i) { q[p.id] = base + (i < extra ? 1 : 0); });
    return q;
  }

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
    setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 400); }, 2600);
  }

  // ---------- Contenido estático generado desde el catálogo ----------
  function renderStatic() {
    var markSvg = '<svg viewBox="-6 -21 30 42" aria-hidden="true">' + CARDS.mark(0, 0, 1, "#C9A96E") + "</svg>";
    $$("[data-mark]").forEach(function (el) { el.innerHTML = markSvg; });
    $$("[data-wa]").forEach(function (el) { el.href = wa("Hola, quiero información de las tarjetas " + C.brand.name); el.target = "_blank"; el.rel = "noopener"; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var first = C.tiers[0];
    $$("[data-min-invest]").forEach(function (el) { el.textContent = money(first.min * first.price); });
    $$("[data-min-qty]").forEach(function (el) { el.textContent = first.min; });
    $$("[data-resale]").forEach(function (el) { el.textContent = money(C.resale.suggested); });
    $$("[data-margin]").forEach(function (el) { el.textContent = "+" + Math.floor((C.resale.suggested / first.price - 1) * 100) + "%"; });
    $$("[data-payback]").forEach(function (el) { el.textContent = Math.ceil((first.min * first.price) / C.resale.suggested); });

    var names = C.platforms.map(function (p) {
      return '<span><i style="background:' + p.accent + '"></i>' + esc(p.name) + "</span>";
    }).join("");
    $("#marquee").innerHTML = names + names + names + names;

    $("#collection").innerHTML = C.platforms.map(function (p) {
      return '<article class="c-item"><div class="tilt" data-tk="' + p.id + '"></div>' +
        '<div class="c-meta"><div><h3>' + esc(p.name) + "</h3><p>" + esc(p.use) + "</p></div>" +
        '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.name) + ' al paquete">+</button></div></article>';
    }).join("");

    // Ejemplo de ganancia con el nivel recomendado.
    var t = C.tiers[1];
    var exQ = C.quote("reventa", C.platforms.map(function (p) { return { platform: p.id, qty: spread(t.min)[p.id] }; }), "zmg", C.finishes[0].id);
    var exP = C.profit(exQ, C.resale.suggested);
    $("#example").innerHTML =
      '<div><span class="eyebrow">Ejemplo con el ' + esc(t.name) + '</span><div class="amount gold">+' + money(exP.gain) + '</div>' +
      '<p class="muted" style="margin-top:14px">de ganancia estimada vendiendo tus ' + exP.sold + " tarjetas a " + money(C.resale.suggested) + " cada una.</p></div>" +
      "<ul>" +
      "<li>Tu inversión <strong>" + money(exQ.subtotal) + "</strong></li>" +
      "<li>Tarjetas que compras <strong>" + exQ.qty + "</strong></li>" +
      "<li>Tarjetas de regalo <strong>+" + exQ.giftCards + "</strong></li>" +
      "<li>Lo que cobras al vender todo <strong>" + money(exP.revenue) + "</strong></li>" +
      '<li class="fine" style="border:0">Estimación ilustrativa; no es una ganancia garantizada.</li>' +
      "</ul>";

    $("#presets").innerHTML = C.tiers.map(function (t) {
      return '<button type="button" class="preset" data-preset="' + t.min + '" aria-pressed="false"><strong>' + t.min + "</strong><span>" + esc(t.name) + "</span><em>" + money(t.price) + " c/u</em></button>";
    }).join("");

    $("#rows").innerHTML = C.platforms.map(function (p) {
      return '<div class="row" data-row="' + p.id + '"><div class="mini" data-tk="' + p.id + '"></div>' +
        '<div class="row-info"><strong>' + esc(p.name) + "</strong><span>" + esc(p.use) + "</span></div>" +
        '<div class="stepper"><button type="button" data-dec="' + p.id + '" aria-label="Quitar ' + esc(p.name) + '">−</button>' +
        '<input type="number" min="0" max="999" inputmode="numeric" data-qty="' + p.id + '" aria-label="Cantidad de ' + esc(p.name) + '" value="0">' +
        '<button type="button" data-inc="' + p.id + '" aria-label="Agregar ' + esc(p.name) + '">+</button></div></div>';
    }).join("");

    $("#tiers").innerHTML = C.tiers.map(function (t, i) {
      var q = C.quote("reventa", C.platforms.map(function (p) { return { platform: p.id, qty: spread(t.min)[p.id] }; }), "zmg", C.finishes[0].id);
      var pr = C.profit(q, C.resale.suggested);
      var gifts = (t.giftCards ? ["<strong>+" + t.giftCards + " tarjetas de regalo</strong>"] : []).concat(t.gifts.map(esc));
      return '<div class="tier' + (i === 1 ? " featured" : "") + '">' +
        '<span class="qty">' + esc(t.name) + " · desde " + t.min + " piezas</span>" +
        '<div class="price">' + money(t.price) + " <small>por pieza</small></div>" +
        '<div class="inv">Inversión desde ' + money(q.subtotal) + "</div>" +
        "<ul>" + gifts.map(function (g) { return "<li>" + check + "<span>" + g + "</span></li>"; }).join("") + "</ul>" +
        '<div class="earn"><strong>+' + money(pr.gain) + "</strong><span>ganancia estimada con " + pr.sold + " tarjetas</span></div>" +
        '<a class="btn ' + (i === 1 ? "btn-gold" : "btn-line") + '" href="#paquete" data-preset="' + t.min + '">Elegir ' + esc(t.name.replace("Kit ", "")) + "</a></div>";
    }).join("");

    var deltas = C.finishes.filter(function (f) { return f.delta; }).map(function (f) {
      return f.name + " " + (f.delta > 0 ? "+" : "−") + money(Math.abs(f.delta));
    });
    $$("[data-finish-note]").forEach(function (el) { el.textContent = "Precios en " + C.finishes[0].name + ". Otros materiales por pieza: " + deltas.join(" · ") + "."; });

    $("#zones").innerHTML = ZONES.slice(0, 6).map(function (z) { return "<span>" + z + "</span>"; }).join("");
    $("#s-zone").innerHTML = '<option value="">Selecciona</option>' + ZONES.map(function (z) { return "<option>" + z + "</option>"; }).join("");
    $("#s-kit").innerHTML = '<option value="">Selecciona</option>' + C.tiers.map(function (t) {
      return "<option>" + esc(t.name) + " · " + t.min + " piezas · " + money(t.min * t.price) + "</option>";
    }).join("") + "<option>Aún no lo sé, quiero asesoría</option>";
  }

  // ---------- Materiales ----------
  function renderFinish() {
    var f = C.getFinish(state.finish);
    $$("[data-finish-picker]").forEach(function (box) {
      var compact = box.classList.contains("compact");
      box.innerHTML = (compact ? "" : '<span class="lbl">Elige el material</span>') + '<div class="finishes">' + C.finishes.map(function (x) {
        return '<button type="button" class="finish" data-finish="' + x.id + '" aria-pressed="' + (x.id === f.id) + '">' +
          '<i style="background:' + CARDS.swatch(x.id) + '"></i><span>' + esc(x.name) + "<small>" + (x.stock ? "En stock" : "Bajo pedido") + "</small></span></button>";
      }).join("") + "</div>" +
        (compact ? "" : '<p class="finish-info">' + (f.stock ? '<span class="ok">● En stock en Guadalajara</span>' : "○ Bajo pedido · " + C.leadTime) +
          " · Sugerido para reventa: " + money(f.resale) + "</p>");
    });
    $$("[data-tk]").forEach(function (el) {
      el.innerHTML = CARDS.card(el.dataset.tk, { finish: f.id }) + (el.classList.contains("tilt") ? '<div class="shine"></div>' : "");
    });
    renderHeroCard();
  }

  function setFinish(id) {
    state.finish = C.getFinish(id).id;
    state.resale = C.getFinish(id).resale;
    renderFinish();
    renderBuilder();
  }

  // ---------- Animación del celular en la portada ----------
  var heroSeq = ["google", "instagram", "whatsapp"];
  var heroIdx = 0;
  function renderHeroCard() {
    var id = heroSeq[heroIdx % heroSeq.length];
    $("#hero-card").innerHTML = CARDS.card(id, { finish: state.finish });
    $("#phone-open").innerHTML = CARDS.screen(id);
    $(".nfc-burst").style.setProperty("--burst", C.getPlatform(id).accent);
  }

  // ---------- Armado del paquete ----------
  var lastTier = null;

  function renderBuilder() {
    var q = currentQuote();

    $$("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.mode === state.mode); });
    $("#presets").hidden = state.mode !== "reventa";
    $$("#presets [data-preset]").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.preset === q.qty); });
    C.platforms.forEach(function (p) {
      var n = state.qty[p.id] || 0, input = $('[data-qty="' + p.id + '"]');
      if (document.activeElement !== input) input.value = n;
      $('[data-row="' + p.id + '"]').classList.toggle("has", n > 0);
    });

    var count = q.qty;
    $$("[data-count]").forEach(function (el) { el.textContent = count; el.hidden = !count; });

    var s = $("#summary");
    var html = "";
    if (state.mode === "reventa") {
      var tier = q.tier;
      html += "<h3>Tu paquete</h3>" +
        '<div class="tier-name">' + (tier ? esc(tier.name) : "Arma tu kit") + "</div>" +
        '<div class="muted" style="font-size:.92rem">' + (tier ? count + " tarjetas a " + money(q.unit) + " cada una" : "El mayoreo empieza en " + C.tiers[0].min + " piezas") + "</div>" +
        finishLine(q.finish);

      if (q.next) {
        var missing = q.next.min - count;
        html += '<div class="progress" style="margin-top:18px">Agrega <strong style="color:var(--text)">' + missing + "</strong> más para " + esc(q.next.name) + ": " +
          money(q.next.price + q.finish.delta) + " c/u" + (q.next.giftCards ? " y " + q.next.giftCards + " tarjetas de regalo" : "") +
          '<div class="bar"><i style="width:' + Math.min(100, (count / q.next.min) * 100) + '%"></i></div></div>';
      } else {
        html += '<div class="progress" style="margin-top:18px;color:var(--gold-2)">Tienes el mejor precio por pieza.</div>';
      }

      if (tier) {
        var gifts = (tier.giftCards ? ["<strong>" + tier.giftCards + " tarjetas extra</strong> sin costo"] : []).concat(tier.gifts.map(esc));
        html += '<div class="gift' + (lastTier && lastTier !== tier.id ? " pop" : "") + '"><div class="gift-title">' + giftIcon + "Tu regalo</div><ul>" +
          gifts.map(function (g) { return "<li>" + g + "</li>"; }).join("") + "</ul></div>";
      }

      var saving = (C.retail.price + q.finish.delta - q.unit) * count;
      html += '<div class="sum-rows">' +
        "<div><span>Tarjetas</span><strong>" + count + (q.giftCards ? " + " + q.giftCards + " de regalo" : "") + "</strong></div>" +
        "<div><span>Precio por pieza</span><strong>" + money(q.unit) + "</strong></div>" +
        (tier ? "<div><span>Ahorro vs. precio al público</span><strong>" + money(saving) + "</strong></div>" : "") +
        "</div>" +
        '<div class="sum-total"><span>Inversión</span><strong data-tw="total">' + money(q.subtotal) + "</strong></div>";

      var pr = C.profit(q, state.resale);
      html += '<div class="calc"><label for="resale"><span>Si las vendes a</span><strong>' + money(state.resale) + " c/u</strong></label>" +
        '<input type="range" id="resale" min="' + C.resale.min + '" max="' + C.resale.max + '" step="10" value="' + state.resale + '">' +
        '<div class="gain"><span class="muted" style="font-size:.88rem">Ganancia estimada<br>vendiendo ' + pr.sold + " tarjetas</span>" +
        '<strong data-tw="gain">' + (count ? (pr.gain >= 0 ? "+" : "") + money(pr.gain) : "$0") + "</strong></div></div>";
    } else {
      html += "<h3>Para tu negocio</h3>" +
        '<div class="tier-name">' + (count ? count + (count === 1 ? " tarjeta" : " tarjetas") : "Elige tus tarjetas") + "</div>" +
        '<div class="muted" style="font-size:.92rem">Te las entregamos programadas con tus enlaces.</div>' + finishLine(q.finish) +
        '<div class="sum-rows">' +
        "<div><span>Precio por pieza</span><strong>" + money(q.unit) + "</strong></div>" +
        "<div><span>Programación y prueba</span><strong>Incluida</strong></div></div>" +
        '<div class="sum-total"><span>Total</span><strong data-tw="total">' + money(q.subtotal) + "</strong></div>" +
        '<div class="progress">¿Necesitas ' + C.tiers[0].min + ' o más? <a href="#paquete" data-switch="reventa" style="color:var(--gold)">Cambia a mayoreo</a> y paga desde ' + money(C.tiers[0].price + q.finish.delta) + " por pieza.</div>";
    }
    html += '<p class="sum-error">' + (count && q.error ? esc(q.error) : "") + "</p>" +
      '<button class="btn btn-gold btn-block" type="button" data-open-order' + (q.error ? " disabled" : "") + ">Continuar con mi pedido</button>";
    s.innerHTML = html;

    if (lastTier !== null && q.tier && lastTier !== q.tier.id && state.mode === "reventa") {
      toast("Desbloqueaste " + q.tier.name + (q.tier.giftCards ? ": +" + q.tier.giftCards + " tarjetas de regalo" : ""));
    }
    lastTier = q.tier ? q.tier.id : "";
    save();
  }

  function finishLine(f) {
    return '<div class="finish-line"><i style="background:' + CARDS.swatch(f.id) + '"></i>' + esc(f.name) + " · " +
      (f.stock ? '<span class="ok">en stock</span>' : "bajo pedido, " + C.leadTime) + "</div>";
  }

  function setQty(id, n) {
    state.qty[id] = Math.max(0, Math.min(999, n || 0));
    renderBuilder();
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "negocio") {
      var total = currentQuote().qty;
      if (total > C.retail.maxQty) state.qty = {};
    }
    lastTier = null;
    renderBuilder();
  }

  // ---------- Panel de pedido ----------
  var drawer = $("#drawer"), overlay = $(".overlay");

  function openOrder() {
    renderOrder();
    drawer.classList.add("open");
    overlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(function () { var f = $("button, input", drawer); if (f) f.focus(); }, 300);
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
      body.innerHTML = '<div class="empty-msg"><p>Aún no eliges tarjetas.</p><a class="btn btn-gold" href="#paquete" data-close-order>Armar mi paquete</a></div>';
      return;
    }
    var needsAddress = state.delivery !== "pickup";
    var html = '<div class="d-lines">' + q.lines.map(function (l) {
      return '<div class="d-line"><div class="mini">' + CARDS.card(l.platform.id, { finish: q.finish.id }) + "</div><span>" + l.qty + " × " + esc(l.platform.name) + "</span><strong>" + money(l.qty * q.unit) + "</strong></div>";
    }).join("") + "</div>" + finishLine(q.finish);
    if (q.giftCards) html += '<div class="gift"><div class="gift-title">' + giftIcon + "+" + q.giftCards + " tarjetas de regalo</div><ul><li>Elige los diseños por WhatsApp después de tu compra.</li></ul></div>";

    html += '<div class="d-block"><span class="lbl">Entrega</span>' + C.delivery.map(function (d) {
      var cost = d.freeFrom && q.qty >= d.freeFrom ? 0 : d.cost;
      return '<label class="radio"><input type="radio" name="delivery" value="' + d.id + '"' + (state.delivery === d.id ? " checked" : "") + ">" +
        "<span><strong>" + esc(d.name) + "</strong><small>" + esc(d.detail) + "</small></span><em>" + (cost ? money(cost) : "Gratis") + "</em></label>";
    }).join("") + "</div>";

    html += '<form id="order-form" novalidate><div class="d-block"><span class="lbl">Tus datos</span><div class="form-grid">' +
      field("name", "Nombre completo", "text", true, 'autocomplete="name" required') +
      field("phone", "WhatsApp", "tel", false, 'autocomplete="tel" inputmode="tel" pattern="[0-9 +]{10,16}" required') +
      field("email", "Correo", "email", false, 'autocomplete="email" required') +
      (needsAddress
        ? field("street", "Calle y número", "text", true, 'autocomplete="address-line1" required') +
          field("colonia", "Colonia", "text", false, "required") +
          field("zip", "Código postal", "text", false, 'inputmode="numeric" pattern="[0-9]{5}" required') +
          field("city", "Municipio / ciudad", "text", false, 'autocomplete="address-level2" required') +
          field("state", "Estado", "text", false, "required")
        : "") +
      (state.mode === "negocio"
        ? '<div class="full"><label for="o-links">Enlaces a programar (uno por tarjeta)</label><textarea id="o-links" name="links" rows="3" placeholder="Google: https://g.page/r/...&#10;Instagram: https://instagram.com/...">' + esc(state.customer.links || "") + "</textarea></div>"
        : "") +
      '<div class="full"><label for="o-notes">Notas (opcional)</label><textarea id="o-notes" name="notes" rows="2">' + esc(state.customer.notes || "") + "</textarea></div>" +
      "</div></div>" +
      '<div class="d-block"><div class="sum-rows" style="margin:0 0 14px">' +
      "<div><span>Subtotal</span><strong>" + money(q.subtotal) + "</strong></div>" +
      "<div><span>Entrega</span><strong>" + (q.shipping ? money(q.shipping) : "Gratis") + "</strong></div></div>" +
      '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>" +
      '<div class="pay"><button class="btn btn-gold btn-block" type="submit" data-pay="mp">Pagar con Mercado Pago</button>' +
      '<button class="btn btn-wa btn-block" type="submit" data-pay="wa">Pedir por WhatsApp</button></div>' +
      '<p class="form-error" id="order-error" hidden></p>' +
      '<p class="form-note">Tarjeta, OXXO o transferencia vía Mercado Pago. Usamos tus datos solo para tu entrega.</p></div></form>';
    body.innerHTML = html;

    // El campo Estado toma "Jalisco" como valor inicial solo si está vacío.
    var st = $("#o-state");
    if (st && !state.customer.state) st.value = "Jalisco";
  }

  function readCustomer(form) {
    $$("input, textarea", form).forEach(function (el) { if (el.name) state.customer[el.name] = el.value.trim(); });
    save();
    return state.customer;
  }

  function orderText(q, c) {
    var lines = q.lines.map(function (l) { return "• " + l.qty + " × " + l.platform.name; }).join("\n") +
      "\nMaterial: " + q.finish.name + (q.finish.stock ? " (en stock)" : " (bajo pedido)");
    var where = state.delivery === "pickup" ? "Recojo en punto de entrega" :
      c.street + ", Col. " + c.colonia + ", CP " + c.zip + ", " + c.city + ", " + c.state;
    return "Hola, quiero hacer este pedido de " + C.brand.name + " (" + (state.mode === "reventa" ? "mayoreo para revender" : "para mi negocio") + "):\n\n" +
      lines + "\n\n" +
      (q.tier ? q.tier.name + ": " + q.qty + " piezas a " + money(q.unit) + " c/u" + (q.giftCards ? " + " + q.giftCards + " de regalo" : "") + "\n" : "") +
      "Subtotal: " + money(q.subtotal) + "\nEntrega (" + q.delivery.name + "): " + (q.shipping ? money(q.shipping) : "Gratis") +
      "\nTotal: " + money(q.total) +
      "\n\nNombre: " + c.name + "\nWhatsApp: " + c.phone + "\nCorreo: " + c.email + "\nEntrega: " + where +
      (state.mode === "negocio" && c.links ? "\n\nEnlaces a programar:\n" + c.links : "") +
      (c.notes ? "\n\nNotas: " + c.notes : "");
  }

  function submitOrder(e) {
    e.preventDefault();
    var form = e.target, err = $("#order-error"), method = (e.submitter && e.submitter.dataset.pay) || "mp";
    err.hidden = true;
    var c = readCustomer(form);
    if (!form.checkValidity()) {
      var bad = $(":invalid", form);
      err.textContent = "Revisa el campo «" + $('label[for="' + bad.id + '"]', form).textContent + "».";
      err.hidden = false;
      bad.focus();
      return;
    }
    var q = currentQuote();
    if (q.error) { err.textContent = q.error; err.hidden = false; return; }

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
      body: JSON.stringify({ mode: state.mode, finish: state.finish, items: items(), delivery: state.delivery, customer: c }),
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

    if (d.finish) setFinish(d.finish);
    else if (d.inc) setQty(d.inc, (state.qty[d.inc] || 0) + 1);
    else if (d.dec) setQty(d.dec, (state.qty[d.dec] || 0) - 1);
    else if (d.mode) setMode(d.mode);
    else if (d.modeLink || d.switch) setMode(d.modeLink || d.switch);
    else if (d.preset) {
      state.mode = "reventa";
      state.qty = spread(+d.preset);
      renderBuilder();
    } else if (d.add) {
      setQty(d.add, (state.qty[d.add] || 0) + 1);
      var bag = $(".bag");
      bag.animate && !reduceMotion && bag.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 450 });
      toast("Agregada: " + C.getPlatform(d.add).name + " · " + currentQuote().qty + " en tu paquete");
    } else if (d.quote !== undefined) {
      e.preventDefault();
      window.open(wa("Hola, quiero cotizar: " + d.quote), "_blank", "noopener");
    } else if (t.hasAttribute("data-open-order") && !t.disabled) openOrder();
    else if (t.hasAttribute("data-close-order")) closeOrder();
    else if (t.id === "clear") { state.qty = {}; renderBuilder(); }
    else if (t.classList.contains("menu-btn")) {
      var open = document.body.classList.toggle("nav-open");
      t.setAttribute("aria-expanded", open);
    }
    if (t.closest(".nav")) document.body.classList.remove("nav-open");
  });
  overlay.addEventListener("click", closeOrder);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOrder(); });

  $("#rows").addEventListener("input", function (e) {
    var id = e.target.dataset.qty;
    if (id) setQty(id, parseInt(e.target.value, 10));
  });

  $("#summary").addEventListener("input", function (e) {
    if (e.target.id !== "resale") return;
    state.resale = +e.target.value;
    var q = currentQuote(), pr = C.profit(q, state.resale);
    $("#summary .calc label strong").textContent = money(state.resale) + " c/u";
    var g = $('[data-tw="gain"]');
    g.textContent = q.qty ? (pr.gain >= 0 ? "+" : "") + money(pr.gain) : "$0";
    save();
  });

  drawer.addEventListener("change", function (e) {
    if (e.target.name === "delivery") {
      var form = $("#order-form");
      if (form) readCustomer(form);
      state.delivery = e.target.value;
      save();
      renderOrder();
    }
  });
  drawer.addEventListener("input", function (e) {
    var form = e.target.closest("form");
    if (form) readCustomer(form);
  });
  drawer.addEventListener("submit", submitOrder);

  $("#signup").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, err = $("#signup-error");
    err.hidden = true;
    if (!f.checkValidity()) {
      var bad = $(":invalid", f);
      err.textContent = "Completa el campo «" + $('label[for="' + bad.id + '"]', f).textContent + "».";
      err.hidden = false;
      bad.focus();
      return;
    }
    var v = function (n) { return f.elements[n].value.trim(); };
    window.open(wa(
      "Hola, quiero crear mi cuenta de distribuidor " + C.brand.name + ".\n\n" +
      "Nombre: " + v("name") + "\nWhatsApp: " + v("phone") + "\nMunicipio: " + v("zone") +
      "\nVenderé a: " + v("target") + "\nKit para empezar: " + v("kit")
    ), "_blank", "noopener");
    toast("¡Listo! Te abrimos WhatsApp para terminar tu alta");
  });

  // ---------- Animaciones ----------
  var header = $("#header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
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

  renderStatic();
  renderFinish();
  renderBuilder();

  // Cada vuelta de la animación muestra otra plataforma.
  $(".phone").addEventListener("animationiteration", function (e) {
    if (e.target !== e.currentTarget) return;
    heroIdx++;
    renderHeroCard();
  });

  if (finePointer && !reduceMotion) {
    tilt($("#stage"), $("#hero-tilt"), 12);
    $$(".c-item").forEach(function (item) { tilt(item, $(".tilt", item), 14); });
  }
})();
