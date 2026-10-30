# TAKTO — Tarjetas NFC premium (Guadalajara)

Página única de venta de tarjetas NFC negras para negocios, con programa de reventa por mayoreo, niveles con regalos y simulador de ganancias. Sin dependencias: HTML, CSS y JavaScript, más una función de servidor para cobrar con **Mercado Pago**. También se puede pedir por **WhatsApp**.

## Qué hace la página

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
| Precio para negocio (1 a 6) | `retail` |
| Niveles de mayoreo, precio por pieza y regalos | `tiers` |
| Precio sugerido de reventa | `resale` |
| Opciones y costos de entrega | `delivery` |

Los textos largos de la página están en `index.html`.

## Imágenes de la marca

Las tarjetas se dibujan con código (`assets/js/cards.js`), así que cambian solas al editar `catalog.js`. Las imágenes listas para redes sociales están en `assets/img/marca/`:

- `post-*.jpg` (1080 × 1350, formato Instagram) para cada diseño y el kit de 7
- `tarjeta-*.png` con fondo transparente
- `og.jpg` para cuando se comparte el enlace

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
