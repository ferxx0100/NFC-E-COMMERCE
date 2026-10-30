# TAKTO — Tarjetas NFC y cobro sin efectivo (Guadalajara)

Dos tiendas en el mismo repositorio, con las imágenes compartidas en `assets/img/`:

| Tienda | Dirección | Archivos |
| --- | --- | --- |
| **TAKTO**: tarjetas NFC para reseñas y redes, con programa de reventa | `/` | `index.html`, `assets/js/catalog.js`, `assets/js/app.js` |
| **TAKTO Pay**: kit de cobro con tarjeta, NFC y billetes para máquinas | `/pay/` | `pay/index.html`, `assets/js/pay-catalog.js`, `assets/js/pay.js` |

Sin dependencias: HTML, CSS y JavaScript, más una función de servidor (`api/checkout.js`) que cobra con **Mercado Pago** en las dos tiendas. También se puede pedir por **WhatsApp**.

## TAKTO (tarjetas NFC)

- **Portada animada**: un celular se acerca a la tarjeta y abre la reseña de Google, Instagram, WhatsApp, TikTok o Facebook.
- **¿Qué es NFC?**: explicación en 3 pasos animados y datos del chip.
- **4 productos**: tarjetas para reseñas y redes (PVC negro con logo, en stock), metálica (plata, dorada y negra), papel negro y PVC con el logo de la empresa (negra o blanca). Las tres últimas son bajo pedido.
- **Menudeo y mayoreo**: de 1 a 19 piezas precio normal; desde 20 piezas de un mismo producto, precio de mayoreo (se pueden mezclar plataformas o colores). Más descuento en 50 y 100.
- **Envío gratis desde 3 piezas**; con menos cuesta $99, o se recoge en Guadalajara.
- **Para quién**: hoteles, restaurantes y bares, escuelas, consultorios, salones y profesionistas.
- **Video de configuración incluido** en cada compra (hay que grabarlo y mandarlo después de la venta).

## Cambiar precios, productos y número

Todo está en **`assets/js/catalog.js`**:

| Qué | Dónde |
| --- | --- |
| WhatsApp y nombre de la marca | `brand` |
| Desde cuántas piezas es mayoreo | `wholesaleFrom` |
| Desde cuántas piezas el envío es gratis | `freeShippingFrom` |
| Productos, precio de menudeo, precios de mayoreo y variantes | `products` |
| Costo de envío | `delivery` |

Las tarjetas se dibujan en `assets/js/cards.js`. Tipografía: Instrument Serif (incluida en `assets/fonts/`, licencia OFL) para títulos e Inter para el texto.

## Imágenes de la marca

Las tarjetas se dibujan con código (`assets/js/cards.js`), así que cambian solas al editar `catalog.js`. Las imágenes listas para redes sociales están en `assets/img/marca/`:

- `post-*.jpg` (1080 × 1350, formato Instagram): uno por plataforma, uno por producto y `post-productos.jpg` con toda la línea
- `tarjeta-*.png` con fondo transparente, una por producto y variante
- `reel-que-es-nfc.mp4` (1080 × 1920, 30 s) para Reels, TikTok y estados de WhatsApp
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

Abre http://localhost:3000.

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
