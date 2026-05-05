# Plan: Dos correcciones de permisos para el rol "personal"

## Contexto

El plan anterior [`plans/permisos-personal.md`](plans/permisos-personal.md) ya implementó:
- Cambio de `requiereAutenticacion('admin')` → `'personal'` en todos los admin editors
- Sidebar oculta links de Usuarios y Configuración para `personal`
- RLS policies en [`supabase/rls-personal.sql`](supabase/rls-personal.sql)

**Faltan 2 correcciones** que este plan cubre.

---

## FIX 1 — Mostrar botón "Admin" en navbar para personal

### Archivo: [`assets/js/auth.js`](assets/js/auth.js)

**Ubicación:** Función [`actualizarNavbar()`](assets/js/auth.js:30), línea 41.

**Código actual:**
```javascript
if (linkAdmin) linkAdmin.style.display = usuario.perfil?.rol === 'admin' ? 'inline' : 'none';
```

**Código nuevo:**
```javascript
if (linkAdmin) linkAdmin.style.display = (usuario.perfil?.rol === 'admin' || usuario.perfil?.rol === 'personal') ? 'inline' : 'none';
```

**Efecto:** El rol `personal` ahora verá el enlace "Admin" en la navbar que lleva al panel de administración.

---

## FIX 2 — Filtrar contenido por autor en panel admin

### Patrón común para los 3 archivos

En cada editor, la función que carga la lista de registros debe:
1. Obtener el usuario actual con `getUsuarioActual()`
2. Si el rol es `personal`, agregar `.eq('autor_id', usuario.id)` a la query
3. Si el rol es `admin`, no filtrar (mostrar todo)

### 2a. [`admin/wiki-editor.html`](admin/wiki-editor.html)

**Función a modificar:** [`cargarArticulos()`](admin/wiki-editor.html:172)

**Código actual (líneas 172-210):**
```javascript
async function cargarArticulos() {
  try {
    const { data, error } = await supabase
      .from('wiki_articulos')
      .select('*, wiki_categorias(nombre)')
      .order('creado_en', { ascending: false });
    // ... resto
  }
}
```

**Código nuevo:**
```javascript
async function cargarArticulos() {
  try {
    const usuario = await getUsuarioActual();
    const esPersonal = usuario?.perfil?.rol === 'personal';

    let query = supabase
      .from('wiki_articulos')
      .select('*, wiki_categorias(nombre)')
      .order('creado_en', { ascending: false });

    if (esPersonal) {
      query = query.eq('autor_id', usuario.id);
    }

    const { data, error } = await query;
    // ... resto igual
  }
}
```

### 2b. [`admin/noticias-editor.html`](admin/noticias-editor.html)

**Función a modificar:** [`cargarNoticias()`](admin/noticias-editor.html:170)

**Código actual (líneas 170-208):**
```javascript
async function cargarNoticias() {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('creado_en', { ascending: false });
    // ... resto
  }
}
```

**Código nuevo:** Mismo patrón que wiki, usando tabla `noticias`.

### 2c. [`admin/faq-editor.html`](admin/faq-editor.html)

**Función a modificar:** [`cargarPreguntas()`](admin/faq-editor.html:178)

**Código actual (líneas 178-216):**
```javascript
async function cargarPreguntas() {
  try {
    const { data, error } = await supabase
      .from('faq_preguntas')
      .select('*, faq_categorias(nombre)')
      .order('creado_en', { ascending: false });
    // ... resto
  }
}
```

**Código nuevo:** Mismo patrón que wiki, usando tabla `faq_preguntas`.

---

## Consideraciones adicionales

### Botones Editar/Eliminar
Como los datos ya vienen filtrados por `autor_id` desde la query, los botones de Editar y Eliminar en las tablas solo aparecerán para los registros del usuario `personal`. No se necesita lógica adicional en el renderizado de la tabla.

### Seguridad (RLS)
Las políticas RLS en [`supabase/rls-personal.sql`](supabase/rls-personal.sql) ya protegen las tablas a nivel de base de datos. Este filtro en el frontend es una capa adicional de UX para que el usuario `personal` solo vea sus propios registros.

### Dependencia
`getUsuarioActual()` ya está importado en los 3 archivos (línea de import). No se necesita agregar imports.

---

## Resumen de cambios

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | [`assets/js/auth.js`](assets/js/auth.js:41) | Condición `rol === 'admin'` → `rol === 'admin' \|\| rol === 'personal'` |
| 2 | [`admin/wiki-editor.html`](admin/wiki-editor.html:172) | Filtrar `cargarArticulos()` por `autor_id` si es personal |
| 3 | [`admin/noticias-editor.html`](admin/noticias-editor.html:170) | Filtrar `cargarNoticias()` por `autor_id` si es personal |
| 4 | [`admin/faq-editor.html`](admin/faq-editor.html:178) | Filtrar `cargarPreguntas()` por `autor_id` si es personal |
