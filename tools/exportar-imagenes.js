/*
 * Genera las imágenes PNG de la marca en assets/img/marca/ a partir de
 * tools/imagenes.html (mismas tarjetas que la página).
 *
 * Requiere Playwright:  npm i -D playwright && npx playwright install chromium
 * Uso:                  node tools/exportar-imagenes.js
 */
const path = require("path");
const { chromium } = require("playwright");
const C = require("../assets/js/catalog.js");

const OUT = path.join(__dirname, "..", "assets", "img", "marca");
const page = (q) => "file://" + path.join(__dirname, "imagenes.html") + "?" + q;

(async () => {
  const browser = await chromium.launch();
  const shots = [
    ...C.platforms.map((p) => ({ q: `art=card&id=${p.id}`, file: `tarjeta-${p.id}.png`, w: 1284, h: 810, transparent: true })),
    ...C.platforms.map((p) => ({ q: `art=post&id=${p.id}`, file: `post-${p.id}.jpg`, w: 1080, h: 1350 })),
    { q: "art=kit", file: "post-kit-7.jpg", w: 1080, h: 1350 },
    { q: "art=og", file: "og.jpg", w: 1200, h: 630 },
  ];
  for (const s of shots) {
    const p = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await p.goto(page(s.q));
    await p.evaluate(() => document.fonts.ready);
    const jpg = s.file.endsWith(".jpg");
    await p.screenshot({ path: path.join(OUT, s.file), omitBackground: !!s.transparent, type: jpg ? "jpeg" : "png", quality: jpg ? 90 : undefined });
    await p.close();
    console.log("✓", s.file);
  }
  await browser.close();
})();
