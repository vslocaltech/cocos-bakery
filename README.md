# 🧁 Coco's Bakery · Pastelería de Fantasía

Sitio web oficial de **Coco's Bakery**, pastelería artesanal y repostería mágica de fantasía hecha con cariño.

---

## 📅 Última Actualización · Noviembre 2026

### 🎀 Revamp Visual Completo
* **Nuevo Sistema de Diseño:** Paleta delicada de repostería mágica (crema de vainilla `#FFF9F5`, rosa pastel empolvado `#FCE8EB` / `#F7C6D0`, detalles en oro vintage `#D4AF37` y chocolate cálido `#3D2319`).
* **Adiós al Neo-brutalismo:** Se eliminó la cuadrícula arenosa de fondo y los bordes toscos; se incorporaron sombras suaves multicapa (*marshmallow & cream*), marcos festoneados de encaje y tipografía refinada (*Cormorant Garamond* y *Nunito Sans*).
* **Marquee Infinito Animado:** Marquesina continua y fluida con especialidades, tacitas de té, coronas y destellos.
* **Hero y Lazos Proporcionados:** Lazos decorativos fijados directamente al marco circular del logo de Coco para mantener armonía en cualquier pantalla.
* **Sección Historia Cálida:** Fotografía ambiental de pastelería artesanal combinada con el sello de Coco superpuesto.
* **Modal de Producto:** Ventana emergente con fotografía ampliada en alta resolución, ingredientes y botón de pedido al hacer clic en cualquier dulce.
* **Etiquetas Destacadas (Tags):** Badges dorados como *"Más pedido"*, *"Favorito"* o *"Personalizable"* en las tarjetas.
* **Botón Flotante de WhatsApp:** Acceso rápido y persistente con tooltip en la esquina inferior derecha.
* **Identidad y Favicon Oficiales:** Logotipo tipográfico, isotipo de Coco, sello circular dorado, sello monocromático artesanal, trama rosa suave, `favicon.ico`, `apple-touch-icon` y tarjeta Open Graph (`og-image.jpg`).

---

### 🛍️ Nuevo Sistema de Carrito de Compras & Checkout WhatsApp
* **Canastita Dulce Persistente:** Botón de carrito en el encabezado con contador animado en tiempo real (`localStorage: cocosCart`).
* **Botones "Agregar 🛍️" en Tarjetas y Modal:** Posibilidad de sumar productos directamente desde la grilla o ajustando la cantidad en el modal de detalles.
* **Panel Lateral Deslizable (Cart Drawer):**
  * Control de cantidades (`+` y `-`), cálculo automático de subtotales y total general.
  * Formulario de entrega: Selección entre *Retiro en taller* o *Envío a domicilio* (con campo dinámico de dirección).
  * Opciones de pago: *Transferencia / Mercado Pago* (con Alias para copiar al portapapeles) o *Efectivo*.
  * Campo para aclaraciones o dedicatorias especiales.
* **Generador de Pedido a WhatsApp:** Envío estructurado del pedido directo al número oficial **+54 3442 472867** (`5493442472867`), detallando items, cantidades, precios, nombre del cliente y método de entrega.

---

### 👑 Panel de Administración Interactivo (Cloudflare Pages + KV)
* **Área Privada (`admin.html`):** En producción (Cloudflare Pages), la contraseña se valida 100% en el servidor (`functions/api/[[path]].js`) usando la variable secreta `ADMIN_PASSWORD` + cookie de sesión `HttpOnly` firmada con `SESSION_SECRET` (HMAC-SHA256) y protección contra fuerza bruta. Además podés cambiar la contraseña desde **🔑 Clave** (guardada en `COCOS_KV` con PBKDF2-SHA256).
* **Catálogo Global en Cloudflare KV (`COCOS_KV`):** Cualquier producto agregado, editado, eliminado o marcado como favorito se guarda en Cloudflare KV y se refleja al instante para todos los clientes desde cualquier dispositivo. En pruebas locales (`iniciar_sitio.bat`), hace fallback automático a `localStorage`.
* **Gestión Completa de Productos (CRUD en tiempo real):**
  * **Agregar y Editar Dulces:** Nombre, categoría, etiqueta/tag personalizada de texto libre (con sugerencias rápidas), precio referencial, descripción, favorito en página principal y fotografía.
  * **Favoritos en Portada:** Selector dedicado (`Favorito en página principal ♥`) al crear/editar o con un clic en la lista para elegir qué dulces aparecen en la sección *"Pequeños favoritos"* del inicio.
  * **Buscador en Tiempo Real y Contador:** Filtro dinámico por nombre o categoría en la lista y conteo de dulces publicados.
  * **Botón Restaurar Ejemplos:** Reinicio rápido a los 6 productos iniciales con un clic.
  * **Soporte de Fotos con Optimización Automática:** Subida directa de archivos locales (comprimidos automáticamente en canvas) o mediante enlaces web (URLs).

---

## 🚀 Cómo Iniciar el Proyecto en Local

### Opción 1: Lanzador automático (Recomendado para Windows)
Simplemente hacé doble clic en el archivo:
```
iniciar_sitio.bat
```
El script detectará automáticamente si tenés instalado Python o Node.js, levantará un servidor local en el puerto `3000` y abrirá automáticamente tu navegador en `http://localhost:3000/index.html`.

### Opción 2: Manualmente desde la terminal
Con **Python**:
```bash
python -m http.server 3000
```
O con **Node.js**:
```bash
npx serve -l 3000 .
```
Luego abrí en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 🗝️ Cómo Acceder al Panel de Administración

El panel está resguardado para la pastelera a través de tres vías:
1. **Acceso directo por URL:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
2. **Atajo secreto de teclado:** Presioná `Ctrl + Shift + A` (o `Cmd + Shift + A`) desde cualquier página.
3. **El corazón secreto:** Hacé clic en el corazón rosa **`♥`** ubicado en el pie de página (*footer*) de Inicio o Catálogo.
* La contraseña se gestiona y puede modificarse directamente desde el botón **🔑 Clave** dentro del panel de administración.

---

## 📁 Estructura del Proyecto

```text
cocos-bakery/
├── favicon.ico                  # Favicon oficial de Coco's Bakery
├── assets/
│   └── brand/                   # Logos, isotipo, sellos, trama, íconos y OG image oficiales
├── functions/
│   └── api/
│       └── [[path]].js          # Cloudflare Pages Functions API (KV + Auth server-side)
├── index.html                   # Página principal (Hero, Marquee, Favoritos, Historia, Redes)
├── catalogo.html                # Catálogo de dulces con filtros y pedidos WhatsApp
├── admin.html                   # Panel privado de gestión de carta y productos
├── script.js                    # Motor interactivo: API/KV, carrito, CRUD, filtros y eventos
├── styles.css                   # Hoja de estilos con el design system pastel de fantasía
├── iniciar_sitio.bat            # Script lanzador del servidor local en 1 clic
└── README.md                    # Documentación y registro de actualizaciones
```

---
*Hecho con amor y una pizca de magia · Coco's Bakery 2026* ♡
