# TAKTO — Tarjetas NFC y cobro sin efectivo (Guadalajara)

Dos tiendas en el mismo repositorio, con las imágenes compartidas en `assets/img/`:

| Tienda | Dirección | Archivos |
| --- | --- | --- |
| **TAKTO**: tarjetas NFC para reseñas y redes, con programa de reventa | `/` | `index.html`, `assets/js/catalog.js`, `assets/js/app.js` |
| **TAKTO Pay**: kit de cobro con tarjeta, NFC y billetes para máquinas | `/pay/` | `pay/index.html`, `assets/js/pay-catalog.js`, `assets/js/pay.js` |

Sin dependencias: HTML, CSS y JavaScript, más una función de servidor (`api/checkout.js`) que cobra con **Mercado Pago** en las dos tiendas. También se puede pedir por **WhatsApp**.

## TAKTO (tarjetas NFC)

Página corta pensada para vender y para aparecer en Google:

1. **Portada**: un celular se acerca a la tarjeta y abre Google, Instagram, WhatsApp, Facebook o TikTok.
2. **Productos**, cada uno con **dos precios** (menudeo y mayoreo desde 20 piezas) y tarjetas que giran en 3D:
   - Reseñas de Google (PVC, negra o blanca) · en stock
   - Redes sociales: Instagram, WhatsApp, Facebook y TikTok (PVC) · en stock
   - Lisa o con tu logo (PVC negra o blanca) · en stock; con logo desde 20 piezas
   - Metálica (negra, plata o dorada) · bajo pedido
   - Papel negro · bajo pedido
3. Cómo funciona NFC, qué te llevas, para quién, preguntas frecuentes y ciudades.

Reglas: mayoreo desde 20 piezas de un mismo producto (se pueden mezclar diseños o colores) y envío gratis desde 3 piezas.

## SEO: cómo está preparado para Google

- `build.js` publica la página **ya armada** (Google lee todo el contenido sin depender de JavaScript).
- **Una página por ciudad** en `/tarjetas-nfc/<ciudad>/` (30 ciudades) con título, descripción, tiempo de entrega y preguntas propias. La lista está en `CITIES` de `assets/js/views.js`.
- **Datos estructurados**: negocio (Organization), productos con sus dos precios (Product + AggregateOffer), preguntas frecuentes (FAQPage) y ruta de navegación en ciudades (BreadcrumbList).
- `sitemap.xml`, `robots.txt`, URL canónica, Open Graph y página 404.
- Títulos y textos con las búsquedas principales: "tarjetas NFC", "tarjeta NFC reseñas Google", "tarjetas NFC mayoreo", "tarjetas NFC en <ciudad>".

Pasos que tienes que hacer tú (sin esto Google tarda mucho más en encontrarte):

1. **Dominio propio** (por ejemplo `takto.mx`) conectado en Vercel, y la variable `SITE_URL` con esa dirección.
2. **Google Search Console**: agrega el dominio, pon el código en la variable `GOOGLE_SITE_VERIFICATION` de Vercel y envía `https://tu-dominio/sitemap.xml`.
3. **Perfil de Negocio de Google** en Guadalajara como negocio que da servicio a domicilio, y pide reseñas a tus primeros clientes (con tu propia tarjeta NFC).
4. Mismo nombre y WhatsApp en Instagram, Facebook, TikTok y directorios; enlaza siempre a tu sitio.

## Cambiar precios, productos, ciudades y número

| Qué | Dónde |
| --- | --- |
| WhatsApp, nombre y dirección del sitio | `brand` en `assets/js/catalog.js` |
| Desde cuántas piezas es mayoreo / envío gratis | `wholesaleFrom` / `freeShippingFrom` en `catalog.js` |
| Productos, precios de menudeo y mayoreo, colores | `products` en `catalog.js` |
| Preguntas frecuentes, giros y ciudades | `FAQ`, `SECTORS` y `CITIES` en `assets/js/views.js` |
| Dibujo de las tarjetas | `assets/js/cards.js` |

Tipografía: Instrument Serif (incluida en `assets/fonts/`, licencia OFL) para títulos e Inter para el texto.

## Imágenes de la marca

Las tarjetas se dibujan con código (`assets/js/cards.js`), así que cambian solas al editar `catalog.js`. Las imágenes listas para redes sociales están en `assets/img/marca/`:

- `post-*.jpg` (1080 × 1350, formato Instagram): uno por tarjeta y `post-productos.jpg` con toda la línea
- `tarjeta-*.png` con fondo transparente, una por producto y color (también las usa Google en los datos de producto)
- `reel-que-es-nfc.mp4` (1080 × 1920, 36 s) para Reels, TikTok y estados de WhatsApp
- `og.jpg` para cuando se comparte el enlace

Las fotos y el video de TAKTO Pay están en `assets/img/pay/`.

Para regenerarlas después de cambiar textos o colores:

```bash
npm i -D playwright
```

```bash
npx playwright install chromium
```

```bash
node tools/exportar-imagenes.js
```

El video necesita `ffmpeg` instalado.

## TAKTO Pay (cobro para máquinas)

- Calculadora de ventas extra según el tipo de máquina.
- Tres paquetes: solo equipo, instalado y configurado, y flotilla (desde 3).
- Precios, paquetes, contenido del kit y tipos de máquina en **`assets/js/pay-catalog.js`**. El WhatsApp se toma de `catalog.js`.

## Correr en local

```bash
npm run dev
```

Publica el sitio en `public/` y lo abre en http://localhost:3000 (incluidas las páginas de ciudad).

## Publicar en Vercel

Se publica sola cada vez que hay cambios en la rama `main`. Para cobrar en línea agrega en *Settings → Environment Variables*:

- `MP_ACCESS_TOKEN`: access token de Mercado Pago
- `SITE_URL`: la URL pública

Los datos de cada pedido quedan en el campo `metadata` del pago en Mercado Pago.

## Pendientes sugeridos

- Cuentas reales de distribuidor con historial de compras (por ejemplo con Supabase).
- Fotos reales de las tarjetas en stock.
- Aviso de privacidad y términos y condiciones.
- Revisar en el IMPI que el nombre de la marca esté disponible antes de registrarla.
