/*
 * Catálogo de TAKTO Pay (cobro sin efectivo para máquinas).
 * Lo usan pay/index.html (window.PAY) y api/checkout.js (require).
 * El número de WhatsApp se toma de catalog.js para no repetirlo.
 *
 * Para cambiar precios o paquetes, edita solo este archivo.
 */
(function (root) {
  var base = typeof module !== "undefined" && module.exports ? require("./catalog.js") : root.CATALOG;

  var brand = {
    name: "TAKTO Pay",
    whatsapp: base.brand.whatsapp,
    currency: "MXN",
  };

  // Lo que trae cada kit.
  var kit = [
    "Terminal con pantalla táctil para tarjeta, NFC, Apple Pay y Google Pay",
    "Aceptador de billetes mexicanos",
    "Antena de señal celular",
    "Cableado para tu máquina",
    "Placa de montaje y guía de instalación",
  ];

  var packages = [
    {
      id: "equipo",
      name: "Solo equipo",
      price: 9490,
      min: 1,
      install: false,
      pitch: "Para quien ya sabe instalar. Te lo mandamos listo para conectar.",
      features: ["Kit completo de cobro", "Guía de instalación en español", "Soporte por WhatsApp", "Garantía de 3 meses"],
    },
    {
      id: "instalado",
      name: "Instalado y configurado",
      price: 11490,
      min: 1,
      install: true,
      featured: true,
      pitch: "Llegamos a tu máquina, la dejamos cobrando y te enseñamos a usarla.",
      features: ["Kit completo de cobro", "Instalación en tu máquina en la ZMG", "Precios y créditos configurados", "Prueba con tarjeta, celular y billete", "Capacitación de 30 minutos", "Garantía de 6 meses"],
    },
    {
      id: "flotilla",
      name: "Flotilla",
      price: 10490,
      min: 3,
      install: true,
      pitch: "Para plazas, arcades y operadores con varias máquinas.",
      features: ["Desde 3 kits, precio por equipo", "Instalación en todas tus máquinas", "Configuración por máquina", "Soporte prioritario", "Garantía de 6 meses"],
    },
  ];

  // Las opciones de entrega solo aplican a "Solo equipo"; los demás incluyen instalación en la ZMG.
  var delivery = [
    { id: "zmg", name: "Entrega en la ZMG", detail: "24 a 72 h", cost: 0 },
    { id: "pickup", name: "Recoger en punto de entrega", detail: "Te compartimos la ubicación por WhatsApp", cost: 0 },
    { id: "nacional", name: "Envío a todo México", detail: "3 a 6 días hábiles", cost: 299 },
  ];

  // Tipos de máquina para la calculadora: precio por uso y usos al día típicos.
  var machines = [
    { id: "grua", name: "Grúa de peluches", price: 20, uses: 40 },
    { id: "vending", name: "Vending de snacks o bebidas", price: 25, uses: 30 },
    { id: "lavanderia", name: "Lavadora o secadora", price: 60, uses: 12 },
    { id: "autolavado", name: "Autolavado", price: 80, uses: 15 },
    { id: "cafe", name: "Máquina de café", price: 35, uses: 25 },
    { id: "arcade", name: "Arcade o coin pusher", price: 15, uses: 60 },
  ];

  function getPackage(id) {
    for (var i = 0; i < packages.length; i++) if (packages[i].id === id) return packages[i];
    return packages[1];
  }

  function getDelivery(id) {
    for (var i = 0; i < delivery.length; i++) if (delivery[i].id === id) return delivery[i];
    return delivery[0];
  }

  function quote(packageId, qty, deliveryId) {
    var pkg = getPackage(packageId);
    var n = Math.max(1, Math.min(50, parseInt(qty, 10) || 1));
    var error = n < pkg.min ? pkg.name + " es desde " + pkg.min + " kits." : null;
    var d = pkg.install ? { id: "instalacion", name: "Instalación en la ZMG", detail: "Incluida", cost: 0 } : getDelivery(deliveryId);
    var subtotal = pkg.price * n;
    return { pkg: pkg, qty: n, unit: pkg.price, subtotal: subtotal, delivery: d, shipping: d.cost, total: subtotal + d.cost, error: error };
  }

  /*
   * Estimación de ventas extra al mes por aceptar tarjeta y celular.
   * extraPct: porcentaje de ventas nuevas (clientes que antes se iban sin jugar o comprar).
   */
  function estimate(uses, price, extraPct, kitPrice) {
    var monthly = uses * price * 30;
    var extra = monthly * (extraPct / 100);
    return { monthly: monthly, extra: extra, months: extra > 0 ? kitPrice / extra : Infinity };
  }

  var pay = {
    brand: brand, kit: kit, packages: packages, delivery: delivery, machines: machines,
    getPackage: getPackage, getDelivery: getDelivery, quote: quote, estimate: estimate, formatMoney: base.formatMoney,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = pay;
  else root.PAY = pay;
})(this);
