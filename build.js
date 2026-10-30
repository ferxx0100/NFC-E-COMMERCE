/* Copia los archivos del sitio a public/, la carpeta que Vercel publica. */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "public");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const f of ["index.html", "gracias.html", "assets"]) {
  fs.cpSync(path.join(__dirname, f), path.join(out, f), { recursive: true });
}
console.log("Sitio listo en public/");
