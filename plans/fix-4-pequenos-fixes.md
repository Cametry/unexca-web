# Plan: 4 Pequeños Fixes — Portal Web UNEXCA

## FIX 1 — Renombrar botón "Admin" a "Panel"

### Archivos afectados

1. [`components/navbar.html`](../components/navbar.html:37) — Línea 37
2. [`assets/js/auth.js`](../assets/js/auth.js:40) — Línea 40-41

### Cambios necesarios

**A) [`components/navbar.html`](../components/navbar.html:37) — Línea 37**
- Cambiar el `textContent` del enlace `#link-admin` de `"Admin"` a `"Panel"`

```diff
- <a href="/admin/" id="link-admin" class="btn btn-claro btn-sm" style="display:none">Admin</a>
+ <a href="/admin/" id="link-admin" class="btn btn-claro btn-sm" style="display:none">Panel</a>
```

**B) [`assets/js/auth.js`](../assets/js/auth.js:40) — Línea 40-41**
- No hay texto hardcodeado en JS, solo controla el `display`. No requiere cambios.
- Confirmación: la línea 40-41 solo hace `linkAdmin.style.display = ...`, no toca `textContent`.

---

## FIX 2 — Color de evento no respeta el asignado en home

### Archivo afectado

[`index.html`](../index.html:325) — Función `cargarEventos()`, líneas 325-370

### HTML actual generado (líneas 351-368)

```javascript
lista.innerHTML = data.map(e => {
  const day = new Date(e.fecha_inicio).getDate();
  const month = new Date(e.fecha_inicio).toLocaleDateString('es-VE', { month: 'short' }).toUpperCase();
  const tipoClass = e.tipo ? 'event-item--' + e.tipo.toLowerCase() : '';
  return `
    <a href="/pages/calendario/" class="event-item ${tipoClass}">
      <div class="event-date">
        <div class="event-date-day">${day}</div>
        <div class="event-date-month">${month}</div>
      </div>
      <div class="event-info">
        <h3 class="event-title">${e.titulo}</h3>
        ${e.descripcion ? `<p class="event-desc">${truncar(e.descripcion, 100)}</p>` : ''}
      </div>
      <span class="event-type ${tipoClass ? 'event-type--' + e.tipo.toLowerCase() : ''}">${e.tipo || 'Evento'}</span>
    </a>
  `;
}).join('');
```

### Problema

El `border-left` del `.event-item` usa clases CSS fijas como `.event-item--inscripcion` (definidas en [`components.css`](../assets/css/components.css:641-663)), que tienen colores hardcodeados. El campo `ev.color` de la BD se ignora completamente.

### Cambio necesario

Reemplazar la clase `tipoClass` fija por un `style` inline que use `e.color`:

```diff
- <a href="/pages/calendario/" class="event-item ${tipoClass}">
+ <a href="/pages/calendario/" class="event-item" style="border-left: 4px solid ${e.color || '#022A6F'}">
```

Y eliminar la variable `tipoClass` ya que no se usará más (o mantenerla solo para el badge si se desea).

**Nota:** También aplicar el mismo cambio en la función `getEventosPlaceholder()` (líneas 372-390) para mantener consistencia, aunque los placeholders no tienen color dinámico.

---

## FIX 3 — Badge "Inscripción" casi invisible

### Archivo afectado

[`assets/css/components.css`](../assets/css/components.css:721-749)

### Estilos actuales de todos los `.event-type--*`

```css
.event-type--inscripcion {   /* línea 721 */
  background: var(--capa-azul-10);
  color: var(--color-primario);
}

.event-type--clases {        /* línea 726 */
  background: rgba(26, 122, 60, 0.12);
  color: var(--color-exito);
}

.event-type--examen {        /* línea 731 */
  background: rgba(193, 120, 0, 0.12);
  color: var(--color-advertencia);
}

.event-type--feriado {       /* línea 736 */
  background: rgba(192, 57, 43, 0.10);
  color: var(--color-error);
}

.event-type--graduacion {    /* línea 741 */
  background: rgba(106, 79, 182, 0.12);
  color: var(--color-tipo-graduacion);
}

.event-type--general {       /* línea 746 */
  background: rgba(72, 89, 126, 0.12);
  color: var(--color-primario-light);
}
```

### Problema

`.event-type--inscripcion` usa `var(--capa-azul-10)` como fondo, que es un azul muy tenue (10% de opacidad). Sobre fondo blanco es casi invisible.

### Cambio necesario

Reemplazar `.event-type--inscripcion` con un fondo sólido visible:

```diff
 .event-type--inscripcion {
-  background: var(--capa-azul-10);
-  color: var(--color-primario);
+  background: #022A6F;
+  color: #FFFFFF;
 }
```

---

## FIX 4 — Filtrar por autor en calendario y documentos

### Archivos afectados

1. [`admin/calendario-editor.html`](../admin/calendario-editor.html:165) — Función `cargarEventos()`
2. [`admin/documentos-editor.html`](../admin/documentos-editor.html:164) — Función `cargarDocumentos()`

### Patrón existente (referencia)

En [`admin/wiki-editor.html`](../admin/wiki-editor.html:172-184), [`admin/faq-editor.html`](../admin/faq-editor.html:178-190), y [`admin/noticias-editor.html`](../admin/noticias-editor.html:170-182):

```javascript
async function cargarX() {
  try {
    const usuario = await getUsuarioActual();
    const esPersonal = usuario?.perfil?.rol === 'personal';

    let query = supabase
      .from('tabla')
      .select('*')
      .order('creado_en', { ascending: false });

    if (esPersonal) {
      query = query.eq('autor_id', usuario.id);
    }

    const { data, error } = await query;
    // ... resto igual
  }
}
```

### Cambios necesarios

**A) [`admin/calendario-editor.html`](../admin/calendario-editor.html:165-199)**

La tabla `calendario_eventos` usa el campo `creado_por` (confirmado en línea 294: `creado_por: user.id`).

Modificar `cargarEventos()`:

```diff
     async function cargarEventos() {
       try {
+        const usuario = await getUsuarioActual();
+        const esPersonal = usuario?.perfil?.rol === 'personal';
+
+        let query = supabase
           .from('calendario_eventos')
           .select('*')
           .order('fecha_inicio', { ascending: false });
+
+        if (esPersonal) {
+          query = query.eq('creado_por', usuario.id);
+        }
+
+        const { data, error } = await query;
-        const { data, error } = await supabase
-          .from('calendario_eventos')
-          .select('*')
-          .order('fecha_inicio', { ascending: false });
```

**B) [`admin/documentos-editor.html`](../admin/documentos-editor.html:164-203)**

La tabla `documentos` usa el campo `subido_por` (confirmado en línea 302: `subido_por: user.id`).

Modificar `cargarDocumentos()`:

```diff
     async function cargarDocumentos() {
       try {
+        const usuario = await getUsuarioActual();
+        const esPersonal = usuario?.perfil?.rol === 'personal';
+
+        let query = supabase
           .from('documentos')
           .select('*')
           .order('creado_en', { ascending: false });
+
+        if (esPersonal) {
+          query = query.eq('subido_por', usuario.id);
+        }
+
+        const { data, error } = await query;
-        const { data, error } = await supabase
-          .from('documentos')
-          .select('*')
-          .order('creado_en', { ascending: false });
```

---

## Resumen de cambios

| Fix | Archivo | Tipo de cambio |
|-----|---------|---------------|
| 1 | `components/navbar.html:37` | Texto: "Admin" → "Panel" |
| 2 | `index.html:355-356` | CSS clase fija → style inline con `e.color` |
| 3 | `assets/css/components.css:721-724` | Fondo/badge de inscripción a sólido visible |
| 4 | `admin/calendario-editor.html:165-171` | Agregar filtro por `creado_por` si es personal |
| 4 | `admin/documentos-editor.html:164-171` | Agregar filtro por `subido_por` si es personal |
