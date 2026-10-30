# TAKTO — Tarjetas NFC y cobro sin efectivo (Guadalajara)

Dos tiendas en el mismo repositorio, con las imágenes compartidas en `assets/img/`:

| Tienda | Dirección | Archivos |
| --- | --- | --- |
| **TAKTO**: tarjetas NFC para reseñas y redes, con programa de reventa | `/` | `index.html`, `assets/js/catalog.js`, `assets/js/app.js` |
| **TAKTO Pay**: kit de cobro con tarjeta, NFC y billetes para máquinas | `/pay/` | `pay/index.html`, `assets/js/pay-catalog.js`, `assets/js/pay.js` |

Sin dependencias: HTML, CSS y JavaScript, más una función de servidor (`api/checkout.js`) que cobra con **Mercado Pago** en las dos tiendas. También se puede pedir por **WhatsApp**.

## TAKTO (tarjetas NFC)

- **Portada animada**: un celular se acerca a la tarjeta y abre la reseña de Google, el Instagram o el WhatsApp.
- **¿Qué es NFC?**: explicación en 3 pasos animados y comparación contra código QR.
- **6 materiales**: PVC negro (en stock), papel negro y metal negro, blanco, dorado y plateado (bajo pedido). Cada uno con su precio.
- **Colección de 7 tarjetas** (Google, Instagram, TikTok, Facebook, WhatsApp, Tripadvisor, Menú/Web) dibujadas en SVG, con inclinación 3D y animaciones.
- **Arma tu paquete**: el cliente elige cuántas de cada diseño. Dos modos:
  - *Para revender*: mayoreo desde 7 piezas. El precio baja por nivel y los regalos se desbloquean en vivo. Incluye simulador de ganancia.
  - *Para mi negocio*: de 1 a 6 piezas a precio público, entregadas programadas.
- **Niveles y regalos**: Arranque, Emprendedor, Negocio y Distribuidor.
- **Alta de distribuidor**: formulario que abre WhatsApp con los datos.
- **Bajo pedido**: placa acrílica, sticker y diseño con logo (cotización por WhatsApp).
- **Pedido**: entrega en la ZMG, recoger o envío nacional; pago con Mercado Pago o pedido por WhatsApp.

## Cambiar precios, regalos, textos y número

Todo está en **`assets/js/catalog.js`**:

| Qué | Dónde |
| --- | --- |
| Nombre de la marca y WhatsApp | `brand` |
| Diseños de tarjeta (textos y colores) | `platforms` |
| Materiales, sobreprecio y disponibilidad | `finishes`, `leadTime` |
| Precio para negocio (1 a 6) | `retail` |
| Niveles de mayoreo, precio por pieza y regalos | `tiers` |
| Precio sugerido de reventa | `resale` |
| Opciones y costos de entrega | `delivery` |

Los textos largos de la página están en `index.html`.

## Imágenes de la marca

Las tarjetas se dibujan con código (`assets/js/cards.js`), así que cambian solas al editar `catalog.js`. Las imágenes listas para redes sociales están en `assets/img/marca/`:

- `post-*.jpg` (1080 × 1350, formato Instagram) para cada diseño y el kit de 7
- `tarjeta-*.png` con fondo transparente
- `post-materiales.jpg` con los 6 materiales
- `reel-que-es-nfc.mp4` (1080 × 1920, 18 s) para Reels, TikTok y estados de WhatsApp
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
