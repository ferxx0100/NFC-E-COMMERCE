# TapReview MX — Tienda de placas NFC

Tienda en línea (en español, precios en MXN) para vender placas y tarjetas NFC de reseñas y redes sociales: Google, Instagram, TikTok, Facebook, WhatsApp, Tripadvisor o cualquier enlace.

Sitio estático sin dependencias + una función de servidor para cobrar con **Mercado Pago Checkout Pro**. También permite hacer el pedido por **WhatsApp**.

## Qué incluye

| Página | Contenido |
| --- | --- |
| `index.html` | Portada: beneficios, cómo funciona, productos, plataformas, precios por mayoreo, preguntas frecuentes |
| `producto.html?id=…` | Detalle con vista previa en vivo de la placa, plataforma, enlace a programar, nombre del negocio, cantidad con descuento por volumen |
| `carrito.html` | Carrito, barra de envío gratis, datos de envío (32 estados), pago con Mercado Pago o pedido por WhatsApp |
| `gracias.html` | Resultado del pago (aprobado / pendiente / rechazado) |
| `api/checkout.js` | Crea la preferencia de pago en Mercado Pago **recalculando los precios en el servidor** |

## Personalizar

Todo se edita en **`assets/js/catalog.js`**:

- `config.storeName`: nombre de la tienda
- `config.whatsapp`: tu número (formato `521` + 10 dígitos, sin `+`)
- `config.freeShippingFrom` / `config.shippingCost`: envío
- `tiers`: descuentos por volumen
- `products`: nombre, precio, precio tachado, fotos, características
- `platforms`: textos y colores de cada plataforma

Las fotos están en `assets/img/`. Las frases de la portada y las preguntas frecuentes están en `index.html`.

## Correr en local

```bash
npm run dev
```

Abre http://localhost:3000. Para probar el pago usa un access token de prueba:

```bash
MP_ACCESS_TOKEN=TEST-xxxx npm run dev
```

## Publicar (Vercel)

1. Importa el repositorio en vercel.com (no hace falta paso de build).
2. En *Settings → Environment Variables* agrega:
   - `MP_ACCESS_TOKEN`: tu access token de Mercado Pago (*Tus integraciones → Credenciales*)
   - `SITE_URL`: la URL pública, p. ej. `https://tapreview.mx`
3. Publica. Mercado Pago regresa al cliente a `gracias.html`.

Los datos de cada pedido (enlace a programar, nombre del negocio, dirección) quedan en el campo `metadata` del pago en Mercado Pago.

## Siguientes pasos sugeridos

- Webhook de Mercado Pago (`notification_url`) para recibir los pedidos por correo o guardarlos en una base de datos.
- Fotos propias de cada plataforma (la imagen de WhatsApp actual está en francés).
- Aviso de privacidad y términos y condiciones (obligatorios en México para tiendas en línea).
