# 🧁 Coco's Bakery · Pastelería de Fantasía

Sitio web oficial de **Coco's Bakery**, pastelería artesanal y repostería mágica de fantasía hecha con cariño.

---

## 📅 Última Actualización · Noviembre 2026

### 🎀 Revamp Visual Completo
* **Nuevo Sistema de Diseño:** Paleta delicada de repostería mágica (crema de vainilla `#FFF9F5`, rosa pastel empolvado `#FCE8EB` / `#F7C6D0`, detalles en oro vintage `#D4AF37` y chocolate cálido `#3D2319`).
* **Adiós al Neo-brutalismo:** Se eliminó la cuadrícula arenosa de fondo y los bordes toscos; se incorporaron sombras suaves multicapa (*marshmallow & cream*), marcos festoneados de encaje y tipografía refinada (*Cormorant Garamond* y *Nunito Sans*).
* **Marquee Infinito Animado:** Marquesina continua y fluida con especialidades, tacitas de té, coronas y destellos.
* **Catálogo Apetitoso:** Se reemplazaron las formas geométricas abstractas por tarjetas con fotografías reales de pastelería en alta definición, etiquetas de categoría y botón directo para consultar y pedir por **WhatsApp**.

---

### 👑 Nuevo Panel de Administración Interactivo
* **Área Privada (`admin.html`):** Pantalla de ingreso protegida con clave personalizada (`coco`).
* **Gestión Completa de Productos (CRUD en tiempo real):**
  * **Agregar nuevos dulces:** Nombre, categoría (Tortas, Galletitas, Dulces, Especiales), precio referencial, descripción y fotografía.
  * **Soporte de Fotos:** Subida directa de archivos desde la computadora (con vista previa inmediata) o mediante enlaces web (URLs).
  * **Edición y Eliminación:** Botón de edición `✎` para modificar cualquier dato de productos existentes y botón `✕` con confirmación de borrado.
  * **Sincronización Automática:** Todo cambio guardado en el panel se actualiza al instante en la tienda (`index.html` y `catalogo.html`) mediante persistencia local en el navegador.

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
