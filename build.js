/*
 * Publica el sitio en public/, la carpeta que sirve Vercel:
 * - Inicio y una página por ciudad (/tarjetas-nfc/<ciudad>/) ya armadas para Google.
 * - Datos estructurados (productos, preguntas, negocio), sitemap.xml y robots.txt.
 *
 * Dirección del sitio: SITE_URL, o la de producción de Vercel, o brand.url de catalog.js.
 * Verificación de Google Search Console: GOOGLE_SITE_VERIFICATION (opcional).
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "public");

global.window = {};
const C = (window.CATALOG = require("./assets/js/catalog.js"));
require("./assets/js/cards.js");
const V = require("./assets/js/views.js");
const esc = V.esc;

const SITE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : C.brand.url)
).replace(/\/$/, "");

const minRetail = Math.min(...C.products.map((p) => p.retail));
const minWholesale = Math.min(...C.products.map((p) => p.wholesale));

function jsonld(objects) {
  return objects.map((o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, "\\u003c") + "</script>").join("\n  ");
}

function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE + "/#org",
    name: C.brand.name,
    url: SITE + "/",
    logo: SITE + "/assets/img/marca/og.jpg",
    description: "Venta de tarjetas NFC para reseñas de Google, redes sociales y presentación, en menudeo y mayoreo, con envíos a todo México.",
    telephone: C.brand.phoneDisplay.replace(/\s/g, ""),
    address: { "@type": "PostalAddress", addressLocality: C.brand.city, addressRegion: C.brand.state, addressCountry: "MX" },
    areaServed: { "@type": "Country", name: "México" },
    contactPoint: { "@type": "ContactPoint", telephone: C.brand.phoneDisplay.replace(/\s/g, ""), contactType: "sales", areaServed: "MX", availableLanguage: "es" },
  };
}

function productsLd(pageUrl) {
  return C.products.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short + " " + p.material + " con chip NFC NTAG213. Menudeo desde 1 pieza y mayoreo desde " + C.wholesaleFrom + " piezas.",
    sku: "TAKTO-" + p.id.toUpperCase(),
    brand: { "@type": "Brand", name: C.brand.name },
    material: p.material,
    image: p.variants.map((v) => SITE + "/assets/img/marca/tarjeta-" + p.id + "-" + v.id + ".png"),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: C.brand.currency,
      lowPrice: p.wholesale,
      highPrice: p.retail,
      offerCount: 2,
      availability: p.stock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: pageUrl + "#" + p.id,
      seller: { "@id": SITE + "/#org" },
    },
  }));
}

function faqLd(extra) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: V.FAQ.concat(extra || []).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

function render(template, page) {
  let html = template;
  const fields = {
    TITLE: page.title,
    DESCRIPTION: page.description,
    CANONICAL: page.url,
    SITE: SITE,
    EYEBROW: page.eyebrow,
    LEAD: page.lead,
    WHATSAPP: C.brand.whatsapp,
    PHONE: C.brand.phoneDisplay,
    FREE: String(C.freeShippingFrom),
    WHOLESALE: String(C.wholesaleFrom),
    VERIFY: process.env.GOOGLE_SITE_VERIFICATION ? '<meta name="google-site-verification" content="' + esc(process.env.GOOGLE_SITE_VERIFICATION) + '">' : "",
  };
  for (const [k, v] of Object.entries(fields)) html = html.split("{{" + k + "}}").join(k === "VERIFY" ? v : esc(v));
  html = html.replace("{{H1}}", page.h1).replace("{{JSONLD}}", jsonld(page.ld));
  html = html
    .replace("<!--@products-->", V.products())
    .replace("<!--@faq-->", V.faq() + (page.faq || []).map((f) => "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>").join(""))
    .replace("<!--@cities-->", V.cityLinks(page.city, "/"))
    .replace("<!--@local-->", page.local || "");
  return html;
}

function h1Lines(a, b) {
  return ['<span class="line"><span>' + a + "</span></span>", '<span class="line"><span class="hl">' + b + "</span></span>"].join(" ");
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT);
  for (const f of ["gracias.html", "pay", "assets"]) fs.cpSync(path.join(ROOT, f), path.join(OUT, f), { recursive: true });

  const template = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const urls = [];

  // Inicio
  const home = SITE + "/";
  fs.writeFileSync(path.join(OUT, "index.html"), render(template, {
    url: home,
    title: "Tarjetas NFC para Reseñas de Google | Menudeo y Mayoreo | TAKTO",
    description: "Tarjetas NFC de plástico, metálicas y de papel para reseñas de Google, Instagram, WhatsApp, TikTok y Facebook. Desde " + C.formatMoney(minRetail) + ", mayoreo desde " + C.formatMoney(minWholesale) + ". Envíos a todo México.",
    eyebrow: "Plástico · Metal · Papel",
    h1: h1Lines("Tarjetas NFC.", "Acerca el celular y listo."),
    lead: "Tarjetas con chip NFC para Google, Instagram y WhatsApp. Te llegan programadas.",
    city: null,
    ld: [organization(), { "@context": "https://schema.org", "@type": "WebSite", name: C.brand.name, url: home, inLanguage: "es-MX" }, ...productsLd(home), faqLd()],
  }));
  urls.push({ loc: home, priority: "1.0" });

  // Una página por ciudad
  for (const c of V.CITIES) {
    const url = SITE + "/tarjetas-nfc/" + c.slug + "/";
    const local =
      '<section class="section light local" id="local"><div class="container local-box">' +
      "<h2>Tarjetas NFC en " + esc(c.name) + ", " + esc(c.state) + "</h2>" +
      '<ul class="local-facts">' +
      "<li><strong>" + esc(c.days) + "</strong><span>Entrega</span></li>" +
      "<li><strong>Gratis</strong><span>Envío desde " + C.freeShippingFrom + " piezas</span></li>" +
      "<li><strong>" + C.formatMoney(minWholesale) + "</strong><span>Mayoreo desde " + C.wholesaleFrom + "</span></li></ul>" +
      '<p class="muted">' + esc(c.focus) + "</p></div></section>";
    const faq = [
      { q: "¿Hacen envíos de tarjetas NFC a " + c.name + "?", a: "Sí. Enviamos a " + c.name + ", " + c.state + " en " + c.days + ". El envío es gratis desde " + C.freeShippingFrom + " piezas." },
      { q: "¿Puedo revender tarjetas NFC en " + c.name + "?", a: "Sí. Desde " + C.wholesaleFrom + " piezas de un mismo producto pagas precio de mayoreo y te damos el video para configurarlas para cada cliente." },
    ];
    fs.mkdirSync(path.join(OUT, "tarjetas-nfc", c.slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, "tarjetas-nfc", c.slug, "index.html"), render(template, {
      url,
      title: "Tarjetas NFC en " + c.name + " | Reseñas de Google y Mayoreo | TAKTO",
      description: "Venta de tarjetas NFC en " + c.name + ", " + c.state + ": reseñas de Google, Instagram, WhatsApp y tarjetas metálicas. Desde " + C.formatMoney(minRetail) + ", mayoreo desde " + C.wholesaleFrom + " piezas. Entrega en " + c.days + ".",
      eyebrow: "Tarjetas NFC · " + c.state,
      h1: h1Lines("Tarjetas NFC en " + esc(c.name) + ".", "Acerca el celular y listo."),
      lead: "Acerca el celular y se abre tu Google, Instagram o WhatsApp. Entrega en " + c.days + ".",
      city: c.slug,
      local,
      faq,
      ld: [
        organization(),
        ...productsLd(url),
        faqLd(faq),
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Tarjetas NFC", item: home },
            { "@type": "ListItem", position: 2, name: "Tarjetas NFC en " + c.name, item: url },
          ],
        },
      ],
    }));
    urls.push({ loc: url, priority: "0.8" });
  }
  urls.push({ loc: SITE + "/pay/", priority: "0.6" });

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => "  <url><loc>" + u.loc + "</loc><lastmod>" + today + "</lastmod><priority>" + u.priority + "</priority></url>").join("\n") +
    "\n</urlset>\n");
  fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nAllow: /\nDisallow: /gracias.html\n\nSitemap: " + SITE + "/sitemap.xml\n");
  fs.writeFileSync(path.join(OUT, "404.html"),
    '<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">' +
    '<title>Página no encontrada · TAKTO</title><link rel="stylesheet" href="/assets/css/takto.css"></head><body><section class="section final" style="min-height:100vh;display:flex;align-items:center">' +
    '<div class="container"><h1>Esta página <span class="hl">no existe.</span></h1><p class="lead" style="margin:0 auto 24px">Pero nuestras tarjetas NFC sí.</p>' +
    '<a class="btn btn-primary" href="/">Ver tarjetas NFC</a></div></section></body></html>');

  console.log("Sitio listo en public/ (" + urls.length + " páginas, " + SITE + ")");
}

module.exports = build;
if (require.main === module) build();
