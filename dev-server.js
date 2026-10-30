/*
 * Servidor local sin dependencias: publica el sitio con build.js y sirve public/
 * y la ruta /api/checkout igual que en Vercel.
 *   MP_ACCESS_TOKEN=TEST-... node dev-server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

process.env.SITE_URL = process.env.SITE_URL || "http://localhost:" + (process.env.PORT || 3000);
require("./build.js")();
const checkout = require("./api/checkout.js");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".mp4": "video/mp4", ".ttf": "font/ttf", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };

function withHelpers(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); return res; };
  return res;
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/checkout") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => { req.body = body; checkout(req, withHelpers(res)); });
    return;
  }
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) { res.statusCode = 404; return res.end("No encontrado"); }
  if (url.pathname.endsWith("/")) file = path.join(file, "index.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return fs.readFile(path.join(ROOT, "404.html"), (e, page) => { res.setHeader("Content-Type", TYPES[".html"]); res.end(page || "No encontrado"); });
    }
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
    res.end(data);
  });
}).listen(PORT, () => console.log(`Tienda en http://localhost:${PORT}`));
