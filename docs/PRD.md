# 🧱 1️⃣ Estructura General de la App

## 🔻 Navegación principal (Bottom Tab)

Te recomiendo 4 tabs principales:

1. 🎨 **Colores**
2. 🧪 **Paletas**
3. 🧩 **Doodles**
4. 👤 **Perfil / Ajustes**

Es una app muy funcional, así que mejor **bottom tabs claras y directas**.

---

# 🎨 1. TAB: COLORES (Explorador de sprays)

## Objetivo

Explorar marcas → series → colores → detalles técnicos.

---

## 🖥 Pantalla 1: Selección de marca

Contenido:

* Grid de marcas (logos grandes):

  * Montana Colors
  * Loop
  * Molotow
  * Flame
  * AKA
  * etc.

Cada card:

* Logo
* Nº total de colores
* Tipo de spray (low pressure, high pressure…)

Acciones:

* Tap → Ir a series de esa marca

---

## 🖥 Pantalla 2: Series de la marca

Ejemplo: Montana → 94 / Hardcore / Water Based…

Contenido:

* Cards con:

  * Nombre de serie
  * Tipo acabado (mate, brillo, metalizado…)
  * Tipo de presión
  * Nº de colores

Acciones:
* Tap → Grid de colores
* Filtro rápido (solo low pressure / solo matte…)

---

## 🖥 Pantalla 3: Grid de colores

Aquí es donde el artista va a pasar tiempo.

Contenido:

* Grid visual tipo Pinterest (cuadrados grandes de color)
* Filtros:

  * Familia (rojos, azules, pieles, verdes…)
  * Luminosidad
  * Saturación
  * Opacidad
* Buscador por nombre o código

Cada color:

* Código (ej: RV-102)
* Nombre
* Swatch grande
* Icono para:

  * ⭐ Añadir a favoritos
  * ➕ Añadir a paleta

---

## 🖥 Pantalla 4: Detalle de color

* Swatch enorme
* Código + nombre
* Marca + serie
* Familia
* Similares dentro de la marca
* Similares en otras marcas (esto es muy potente)
* Botón: “Añadir a paleta”

---

# 🧪 2. TAB: PALETAS

Aquí es donde empieza lo interesante.

---

## 🖥 Pantalla 1: Mis paletas

Grid de paletas guardadas:

Cada paleta:

* Nombre
* Miniatura visual con 4-6 colores
* Marca principal
* Fecha creación

Botones:

* Crear nueva
* Importar desde imagen

---

## 🖥 Crear paleta (2 caminos)

### Opción A — Manual

1. Seleccionas marca o mezcla de marcas
2. Abres explorador
3. Añades colores
4. Ves preview en tiempo real

Extras muy potentes:

* Mostrar contraste entre colores
* Mostrar cómo quedarían outline/fill/3D/brillo
* Reordenar colores

---

### Opción B — Desde foto

Flujo:

1. Subes foto (muro, naturaleza, otra pieza…)
2. Detectas colores dominantes
3. La app:

   * Extrae 5-8 colores principales
   * Busca el color más cercano en la marca seleccionada
4. Te muestra:

   * Color original
   * Spray equivalente
   * Nivel de similitud %

Pantalla final:

* Guardar paleta
* Editar manualmente

---

# 🧩 3. TAB: DOODLES (Simulador de pieza en muro)

Esto es la feature diferencial 💣

---

## 🖥 Pantalla 1: Mis Doodles

* Lista de proyectos
* Miniatura combinada
* Nombre del spot
* Fecha

Botón: Nuevo doodle

---

## 🖥 Crear Doodle — Paso 1

Seleccionar:

* 📷 Imagen del muro
* 🖼 Imagen del boceto

---

## 🖥 Paso 2: Editor

Aquí necesitas algo potente pero simple.

Pantalla dividida en:

Fondo: muro
Capa superior: boceto

Controles:

### Transformaciones

* Escala
* Rotación
* Flip
* Perspectiva (muy importante)
* Ajuste libre por puntos

### Ajustes visuales

* Opacidad
* Modo de fusión (multiply, overlay…)
* Contraste
* Desaturar muro

### Guías

* Grid
* Líneas de fuga
* Centro
* Proporciones

---

## 🖥 Paso 3: Export

* Guardar imagen
* Exportar PNG
* Compartir
* Guardar como proyecto editable

---

# 👤 4. PERFIL / AJUSTES

Contenido:

* Mis favoritos
* Historial de colores usados
* Marcas preferidas
* Sistema de unidades
* Modo oscuro (muy importante para artistas)
* Backup en la nube

---

# 🧠 Arquitectura interna recomendada

Te lo organizo a nivel conceptual:

## Entidades principales

### Brand

* id
* name
* logo
* description

### Series

* id
* brandId
* description
* finishType
* pressureType
* colors[]

### Color

* id
* brandId
* seriesId
* hex
* rgb
* lab (importantísimo para similitud)
* family
* opacityLevel

### Palette

* id
* name
* colors[]
* createdAt

### Doodle

* id
* wallImage
* sketchImage
* transformData
* exportImage

---

# 🚀 Flujo típico de uso real

Un writer podría:

1. Crear paleta desde foto de referencia.
2. Ajustarla manualmente.
3. Guardarla.
4. Crear doodle en el muro real.
5. Ir a pintar con:

   * Lista de sprays exactos.
   * Referencia visual.

Eso es valor real en calle.

---

# 🔥 Features futuras (muy potentes)

Te dejo ideas premium:

* 📍 Guardar spots geolocalizados
* 🧾 Lista automática de compra
* 🧮 Calculadora de sprays necesarios por m²
* 🧠 AI que sugiere combinaciones “estilo old school / chrome / pastel / horrorcore”
* 🎨 Simulador 3D rápido
* 🔄 Comparador de equivalencias entre marcas
