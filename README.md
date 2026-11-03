# TAKTO — Tarjetas NFC y cobro sin efectivo (Guadalajara)

Dos tiendas en el mismo repositorio, con las imágenes compartidas en `assets/img/`:

| Tienda | Dirección | Archivos |
| --- | --- | --- |
| **TAKTO**: tarjetas NFC para reseñas y redes, con programa de reventa | `/` | `index.html`, `assets/js/catalog.js`, `assets/js/app.js` |
| **TAKTO Pay**: kit de cobro con tarjeta, NFC y billetes para máquinas | `/pay/` | `pay/index.html`, `assets/js/pay-catalog.js`, `assets/js/pay.js` |

Sin dependencias: HTML, CSS y JavaScript, más una función de servidor (`api/checkout.js`) que cobra con **Mercado Pago** en las dos tiendas. También se puede pedir por **WhatsApp**.

## TAKTO (tarjetas NFC)

Página corta pensada para vender y para aparecer en Google:

1. **Portada que explica NFC**: un iPhone se acerca a la tarjeta, lee el chip NFC (aparece el aviso "Etiqueta NFC") y abre Google, Instagram, WhatsApp, Facebook o TikTok, con 3 pasos que se iluminan al ritmo de la animación.
2. **Productos** (todos con chip NFC). Al pasar el mouse dan vuelta y muestran la **foto real** (`assets/img/productos/`). Precios en MXN:

   | Producto | Precio | Personalización |
   | --- | --- | --- |
   | Reseñas de Google (plástico, negra o blanca) | $199 por pieza · **$99 c/u desde 20** | — |
   | Redes sociales (Instagram, WhatsApp, Facebook, TikTok) | $199 por pieza · **$99 c/u desde 20** | — |
   | Lisa de plástico (negra o blanca) | $49 por pieza · **paquete de 10 por $399** ($39.90 c/u desde 10) | En blanco o con nombre |
   | Metálica (negra, plata, dorada) | **$399 por pieza, un solo precio** (sin mayoreo) | En blanco, con nombre o con logo |
   | Cartón negro ×100 | **Solo paquete de 100 tarjetas por $499** (el carrito cuenta paquetes) | En blanco, con nombre o con logo (aplica a todo el paquete) |

   - El mayoreo de Google y redes es desde 20 piezas **de un mismo producto** (se pueden mezclar diseños o colores).
   - **Con nombre:** hasta 40 caracteres; se ve en la tarjeta al instante y llega en el pedido.
   - **Con logo** (metálica y cartón): no se guarda ningún archivo en el servidor. El cliente puede subir su logo solo para **ver la vista previa** en la tarjeta (se queda en su navegador; se guarda ahí solo si pesa menos de 200 KB) y se le avisa: "Después de pagar nos mandas tu logo por WhatsApp (PNG o PDF)". En Mercado Pago (título del artículo y `metadata.logos`) y en el mensaje de WhatsApp queda "con logo (lo envía por WhatsApp)".
3. Cómo funciona NFC, qué te llevas, para quién, preguntas frecuentes y ciudades.

Reglas: envío gratis desde 3 tarjetas en todo el pedido; cuenta tarjetas reales, así que un paquete de cartón (100 tarjetas) ya va con envío gratis.

## Entrega y pago en la página

El cliente paga ahí mismo con **Mercado Pago** (tarjeta, OXXO, SPEI o saldo) y elige en el carrito:

| Opción | Costo | Qué pide |
| --- | --- | --- |
| **Recoger en Guadalajara** (Guadalajara, Zapopan, Tlaquepaque, Tonalá, Tlajomulco, El Salto) | Siempre $0 | Nombre y WhatsApp. Coordinamos punto y hora por WhatsApp. |
| **Envío a toda la República** | $99, gratis desde 3 tarjetas | Dirección completa (calle, CP, ciudad y estado) |

- Zona, municipios y nota de recolección: `pickup` en `assets/js/catalog.js`. Opciones y costo: `delivery`.
- `api/checkout.js` vuelve a calcular todo: una opción desconocida se cobra como envío, recoger nunca cobra envío, y si es envío sin dirección o sin CP de 5 dígitos responde 400 antes de llamar a Mercado Pago.
- En Mercado Pago, cada artículo de un pedido para recoger dice "Recoger en Guadalajara" y `metadata.delivery` lo repite.
- `gracias.html` dice "recoges en Guadalajara" o "preparamos tu envío" según lo que eligió el cliente.

## "¿Qué quieres que abra tu tarjeta?"

Arriba del apartado se avisa: "Nosotros te las configuramos con tu enlace, o si prefieres te mandamos un video corto para que las configures tú." (también en la pregunta frecuente "¿Llegan programadas?").

En el carrito, por cada tarjeta (o con "Todas igual"), el cliente elige a dónde se programa: Reseñas de Google, Instagram, Facebook, TikTok, WhatsApp, página web/menú/tienda, tarjeta de contacto (vCard), otro o "Aún no sé / la programo yo con el video", y escribe su enlace, usuario o número. Cada opción trae ejemplo y ayuda (por ejemplo, cómo sacar el enlace de reseñas de Google).

- Opciones y textos de ayuda: `programTargets` en `catalog.js`.
- Se guarda en el navegador y se manda al servidor, que lo limpia (máx. 40 líneas y 300 caracteres por enlace) y lo deja en `metadata.programming` del pago. También va en el mensaje de WhatsApp.
- Carritos guardados con el campo viejo "Enlace para programarlas" pasan solos a "Todas igual → Otro".

## SEO: cómo está preparado para Google

- `build.js` publica la página **ya armada** (Google lee todo el contenido sin depender de JavaScript).
- **Una página por ciudad** en `/tarjetas-nfc/<ciudad>/` (30 ciudades) con título, descripción, tiempo de entrega y preguntas propias. La lista está en `CITIES` de `assets/js/views.js`.
- **Datos estructurados**: negocio (Organization), productos con su regla de precio real (Product + AggregateOffer: dos precios con mayoreo, uno solo en la metálica y el paquete de cartón), preguntas frecuentes (FAQPage) y ruta de navegación en ciudades (BreadcrumbList).
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
| Desde cuántas piezas es mayoreo / envío gratis (en tarjetas) | `wholesaleFrom` / `freeShippingFrom` en `catalog.js` |
| Costo de envío, opción de recoger y su zona | `delivery` y `pickup` en `catalog.js` |
| Destinos para programar las tarjetas | `programTargets` en `catalog.js` |
| Productos, precios, colores y personalización | `products` en `catalog.js`: `retail`, `wholesale` (`null` = un solo precio), `wholesaleFrom`, `pack` (mayoreo mostrado como paquete), `packOf` (se vende por paquete de N tarjetas) y `customModes` (`blank`, `name`, `logo`) |
| Preguntas frecuentes, giros y ciudades | `FAQ`, `SECTORS` y `CITIES` en `assets/js/views.js` |
| Dibujo de las tarjetas | `assets/js/cards.js` |

Tipografía: Outfit (incluida en `assets/fonts/`, licencia OFL). Fondo claro para que resalten las tarjetas.

## Imágenes de la marca

Las tarjetas se dibujan con código (`assets/js/cards.js`), así que cambian solas al editar `catalog.js`. Las imágenes listas para redes sociales están en `assets/img/marca/`:

- `post-*.jpg` (1080 × 1350, formato Instagram): uno por tarjeta y `post-productos.jpg` con toda la línea
- `tarjeta-*.png` con fondo transparente, una por producto y color (también las usa Google en los datos de producto)
- `reel-que-es-nfc.mp4` (1080 × 1920, 36 s) para Reels, TikTok y estados de WhatsApp
- `promo-revende-nfc.mp4` (1080 × 1350, 18 s) para grupos de Facebook: "gana dinero vendiendo tarjetas NFC"
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

## Marketing

Guiones para grupos de Facebook y video de 20 segundos: `marketing/facebook-y-video.md`.

## Revisar si Mercado Pago está listo

Abre `https://tu-sitio/api/checkout` en el navegador: dice si falta la clave `MP_ACCESS_TOKEN` o si está en modo prueba o producción.

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
