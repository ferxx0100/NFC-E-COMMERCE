/* TAKTO Pay: máquinas, calculadora, paquetes y pedido. */
(function () {
  var P = window.PAY;
  var CARDS = window.CARDS;
  var KEY = "taktopay_state_v1";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = P.formatMoney;
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function wa(text) {
    return "https://wa.me/" + P.brand.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  var state = { machine: P.machines[0].id, uses: P.machines[0].uses, price: P.machines[0].price, extra: 20, pkg: "instalado", qty: 1, delivery: "zmg", customer: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch (e) {}
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- Contenido ----------
  var markSvg = '<svg viewBox="-6 -21 30 42" aria-hidden="true">' + CARDS.mark(0, 0, 1, "currentColor") + "</svg>";
  $$("[data-mark]").forEach(function (el) { el.innerHTML = markSvg; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("[data-wa]").forEach(function (el) { el.href = wa("Hola, quiero información de " + P.brand.name); el.target = "_blank"; el.rel = "noopener"; });
  $$("[data-wa-ask]").forEach(function (el) {
    el.href = wa("Hola, quiero saber si el kit de " + P.brand.name + " funciona con mi máquina. Les mando foto del monedero.");
    el.target = "_blank"; el.rel = "noopener";
  });
  var cheapest = Math.min.apply(null, P.packages.map(function (p) { return p.price; }));
  $$("[data-from]").forEach(function (el) { el.textContent = "Desde " + money(cheapest); });

  var words = ["Tarjeta de crédito", "Débito", "NFC", "Apple Pay", "Google Pay", "Billetes MXN", "Reloj inteligente"];
  var track = words.map(function (w) { return '<span>' + w + "</span>"; }).join("");
  $("#marquee").innerHTML = track + track + track;

  $("#machines").innerHTML = P.machines.map(function (m) {
    return '<div class="machine"><strong>' + esc(m.name) + "</strong><span>Típico: " + money(m.price) + " por uso</span></div>";
  }).join("");

  $("#kit").innerHTML = P.kit.map(function (k) {
    return '<li><span class="ic">' + check + "</span><div><strong>" + esc(k) + "</strong></div></li>";
  }).join("");

  $("#packages").innerHTML = P.packages.map(function (p) {
    return '<div class="tier' + (p.featured ? " featured" : "") + '">' +
      '<span class="qty">' + esc(p.name) + (p.min > 1 ? " · desde " + p.min + " kits" : "") + "</span>" +
      '<div class="price">' + money(p.price) + " <small>por kit</small></div>" +
      '<div class="inv">' + esc(p.pitch) + "</div>" +
      "<ul>" + p.features.map(function (f) { return "<li>" + check + "<span>" + esc(f) + "</span></li>"; }).join("") + "</ul>" +
      '<button class="btn ' + (p.featured ? "btn-primary" : "btn-line") + '" type="button" data-buy="' + p.id + '" style="margin-top:auto">Lo quiero</button></div>';
  }).join("");

  // ---------- Calculadora ----------
  var machineSel = $("#c-machine");
  machineSel.innerHTML = P.machines.map(function (m) { return '<option value="' + m.id + '">' + esc(m.name) + "</option>"; }).join("");

  function renderCalc() {
    machineSel.value = state.machine;
    $("#c-uses").value = state.uses;
    $("#c-price").value = state.price;
    $("#c-extra").value = state.extra;
    $('[data-out="uses"]').textContent = state.uses + " al día";
    $('[data-out="price"]').textContent = money(state.price);
    $('[data-out="extra"]').textContent = "+" + state.extra + "%";

    var kitPrice = P.getPackage("instalado").price;
    var e = P.estimate(state.uses, state.price, state.extra, kitPrice);
    var months = isFinite(e.months) ? (e.months < 1 ? "menos de 1 mes" : e.months.toFixed(1).replace(".0", "") + " meses") : "—";
    $("#calc-result").innerHTML =
      "<h3>Tu estimación</h3>" +
      '<div class="muted" style="font-size:.92rem">Hoy vendes cerca de ' + money(e.monthly) + " al mes</div>" +
      '<div class="sum-total" style="border:0;margin-top:22px"><span>Ventas extra al mes</span><strong style="color:var(--ok)">+' + money(e.extra) + "</strong></div>" +
      '<div class="sum-rows">' +
      "<div><span>Ventas extra al año</span><strong>+" + money(e.extra * 12) + "</strong></div>" +
      "<div><span>El kit instalado se paga en</span><strong>" + months + "</strong></div></div>" +
      '<p class="fine">Estimación antes de comisiones del servicio de cobro. Depende del tráfico y la ubicación de tu máquina.</p>' +
      '<button class="btn btn-primary btn-block" type="button" data-buy="instalado">Quiero mi kit instalado</button>';
    save();
  }

  machineSel.addEventListener("change", function () {
    var m = P.machines.filter(function (x) { return x.id === machineSel.value; })[0];
    state.machine = m.id; state.uses = m.uses; state.price = m.price;
    renderCalc();
  });
  ["uses", "price", "extra"].forEach(function (k) {
    $("#c-" + k).addEventListener("input", function (e) { state[k] = +e.target.value; renderCalc(); });
  });

  // ---------- Pedido ----------
  var drawer = $("#drawer"), overlay = $(".overlay");

  function openOrder(pkgId) {
    state.pkg = pkgId;
    var pkg = P.getPackage(pkgId);
    if (state.qty < pkg.min) state.qty = pkg.min;
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
    var q = P.quote(state.pkg, state.qty, state.delivery);
    var needsAddress = q.pkg.install || state.delivery !== "pickup";
    var html =
      '<div class="d-block" style="border:0;margin:0;padding:0"><span class="lbl">Paquete</span>' +
      P.packages.map(function (p) {
        return '<label class="radio"><input type="radio" name="pkg" value="' + p.id + '"' + (p.id === q.pkg.id ? " checked" : "") + ">" +
          "<span><strong>" + esc(p.name) + "</strong><small>" + esc(p.pitch) + "</small></span><em>" + money(p.price) + "</em></label>";
      }).join("") + "</div>" +
      '<div class="d-block"><span class="lbl">Cantidad de kits</span>' +
      '<div class="stepper"><button type="button" data-q="-1" aria-label="Menos">−</button><input type="number" id="o-qty" min="1" max="50" value="' + q.qty + '" aria-label="Cantidad"><button type="button" data-q="1" aria-label="Más">+</button></div></div>';

    if (!q.pkg.install) {
      html += '<div class="d-block"><span class="lbl">Entrega</span>' + P.delivery.map(function (d) {
        return '<label class="radio"><input type="radio" name="delivery" value="' + d.id + '"' + (state.delivery === d.id ? " checked" : "") + ">" +
          "<span><strong>" + esc(d.name) + "</strong><small>" + esc(d.detail) + "</small></span><em>" + (d.cost ? money(d.cost) : "Gratis") + "</em></label>";
      }).join("") + "</div>";
    }

    html += '<form id="order-form" novalidate><div class="d-block"><span class="lbl">Tus datos</span><div class="form-grid">' +
      field("name", "Nombre completo", "text", true, 'autocomplete="name" required') +
      field("phone", "WhatsApp", "tel", false, 'autocomplete="tel" inputmode="tel" pattern="[0-9 +]{10,16}" required') +
      field("email", "Correo", "email", false, 'autocomplete="email" required') +
      (needsAddress
        ? field("street", q.pkg.install ? "Dirección donde está la máquina" : "Calle y número", "text", true, "required") +
          field("colonia", "Colonia", "text", false, "required") +
          field("zip", "Código postal", "text", false, 'inputmode="numeric" pattern="[0-9]{5}" required') +
          field("city", "Municipio / ciudad", "text", true, "required")
        : "") +
      '<div class="full"><label for="o-machine">¿Qué máquina es? (marca o tipo)</label><input id="o-machine" name="machine" type="text" value="' + esc(state.customer.machine || "") + '" placeholder="Ej. grúa de peluches, lavadora Speed Queen"></div>' +
      "</div></div>" +
      '<div class="d-block"><div class="sum-rows" style="margin:0 0 14px">' +
      "<div><span>" + q.qty + " × " + esc(q.pkg.name) + "</span><strong>" + money(q.subtotal) + "</strong></div>" +
      "<div><span>" + esc(q.delivery.name) + "</span><strong>" + (q.shipping ? money(q.shipping) : q.pkg.install ? "Incluida" : "Gratis") + "</strong></div></div>" +
      '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>" +
      (q.error ? '<p class="form-error">' + esc(q.error) + "</p>" : "") +
      '<div class="pay"><button class="btn btn-primary btn-block" type="submit" data-pay="mp"' + (q.error ? " disabled" : "") + ">Pagar con Mercado Pago</button>" +
      '<button class="btn btn-wa btn-block" type="submit" data-pay="wa">Pedir por WhatsApp</button></div>' +
      '<p class="form-error" id="order-error" hidden></p>' +
      '<p class="form-note">La activación del servicio de cobro de la terminal se contrata aparte. Te contactamos para agendar la instalación.</p></div></form>';
    $("#drawer-body").innerHTML = html;
  }

  function readCustomer() {
    var form = $("#order-form");
    if (!form) return state.customer;
    $$("input", form).forEach(function (el) { if (el.name) state.customer[el.name] = el.value.trim(); });
    save();
    return state.customer;
  }

  drawer.addEventListener("change", function (e) {
    if (e.target.name === "pkg" || e.target.name === "delivery") {
      readCustomer();
      state[e.target.name] = e.target.value;
      var pkg = P.getPackage(state.pkg);
      if (state.qty < pkg.min) state.qty = pkg.min;
      renderOrder();
    } else if (e.target.id === "o-qty") {
      readCustomer();
      state.qty = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
      renderOrder();
    }
  });
  drawer.addEventListener("input", function (e) { if (e.target.closest("#order-form")) readCustomer(); });
  drawer.addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]");
    if (!b) return;
    readCustomer();
    state.qty = Math.max(1, Math.min(50, state.qty + +b.dataset.q));
    renderOrder();
  });

  drawer.addEventListener("submit", function (e) {
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
    var q = P.quote(state.pkg, state.qty, state.delivery);
    if (method === "wa") {
      var where = c.street ? c.street + ", Col. " + c.colonia + ", CP " + c.zip + ", " + c.city : "Recojo en punto de entrega";
      window.open(wa(
        "Hola, quiero hacer este pedido de " + P.brand.name + ":\n\n" +
        "• " + q.qty + " × " + q.pkg.name + " (" + money(q.unit) + " c/u)\n" +
        q.delivery.name + ": " + (q.shipping ? money(q.shipping) : "incluida") + "\nTotal: " + money(q.total) +
        "\n\nNombre: " + c.name + "\nWhatsApp: " + c.phone + "\nCorreo: " + c.email + "\nDirección: " + where +
        (c.machine ? "\nMáquina: " + c.machine : "")
      ), "_blank", "noopener");
      return;
    }
    var btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "Conectando con Mercado Pago…";
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store: "pay", package: state.pkg, qty: state.qty, delivery: state.delivery, customer: c }),
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error); return j; }); })
      .then(function (j) { location.href = j.init_point; })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "Pagar con Mercado Pago";
        err.textContent = "El pago en línea no está disponible en este momento. Haz tu pedido por WhatsApp y te mandamos tu liga de pago.";
        err.hidden = false;
      });
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.buy) openOrder(t.dataset.buy);
    else if (t.hasAttribute("data-close-order")) closeOrder();
    else if (t.classList.contains("menu-btn")) {
      var open = document.body.classList.toggle("nav-open");
      t.setAttribute("aria-expanded", open);
    }
    if (t.closest(".nav")) document.body.classList.remove("nav-open");
  });
  overlay.addEventListener("click", closeOrder);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOrder(); });

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

  renderCalc();
})();
