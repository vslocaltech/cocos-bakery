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
* **Favicon Temático SVG:** Icono `🧁` en la pestaña del navegador sin requerir archivos externos.

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

### 👑 Panel de Administración Interactivo
* **Área Privada (`admin.html`):** Pantalla de ingreso protegida con clave (`coco`).
* **Gestión Completa de Productos (CRUD en tiempo real):**
  * **Agregar y Editar Dulces:** Nombre, categoría, etiquetas destacadas, precio referencial, descripción y fotografía.
  * **Buscador en Tiempo Real y Contador:** Filtro dinámico por nombre o categoría en la lista y conteo de dulces publicados.
  * **Botón Restaurar Ejemplos:** Reinicio rápido a los 6 productos iniciales con un clic.
  * **Soporte de Fotos:** Subida directa de archivos locales (con vista previa inmediata) o mediante enlaces web (URLs).
  * **Sincronización Automática:** Todo cambio guardado se actualiza al instante en la tienda (`index.html` y `catalogo.html`).

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
* **Clave de acceso inicial:** `coco`

---

## 📁 Estructura del Proyecto

```text
cocos-bakery/
├── assets/
│   └── cocos-bakery-mark.jpg    # Logo e isotipo oficial de Coco's Bakery
├── index.html                   # Página principal (Hero, Marquee, Favoritos, Historia, Redes)
├── catalogo.html                # Catálogo de dulces con filtros y pedidos WhatsApp
├── admin.html                   # Panel privado de gestión de carta y productos
├── script.js                    # Motor interactivo: CRUD, filtros, eventos y animaciones
├── styles.css                   # Hoja de estilos con el design system pastel de fantasía
├── iniciar_sitio.bat            # Script lanzador del servidor local en 1 clic
└── README.md                    # Documentación y registro de actualizaciones
```

---
*Hecho con amor y una pizca de magia · Coco's Bakery 2026* ♡
