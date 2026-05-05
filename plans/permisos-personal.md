# Plan: Implementar permisos correctos para el rol "personal"

## Resumen

Actualmente el rol `personal` tiene los mismos permisos que `admin` en el frontend, pero el guard de autenticación del panel admin (`requiereAutenticacion('admin')`) bloquea completamente su acceso. Este plan habilita acceso granular:

- **Personal** puede acceder al panel admin (excepto Usuarios y Configuración)
- **Personal** solo puede editar contenido del cual es autor
- **Admin** mantiene acceso total

---

## PARTE 1 — Acceso al panel admin para "personal"

### Archivos a modificar (cambiar `'admin'` → `'personal'`)

Cada archivo tiene un bloque `<script type="module">` con `await requiereAutenticacion('admin')` en la parte superior. Se cambia a `await requiereAutenticacion('personal')`.

| Archivo | Línea actual | Cambio |
|---------|-------------|--------|
| [`admin/index.html`](../admin/index.html:108) | `await requiereAutenticacion('admin');` (línea 110) | → `'personal'` |
| [`admin/wiki-editor.html`](../admin/wiki-editor.html:108) | `await requiereAutenticacion('admin');` (línea 108) | → `'personal'` |
| [`admin/faq-editor.html`](../admin/faq-editor.html:113) | `await requiereAutenticacion('admin');` (línea 113) | → `'personal'` |
| [`admin/noticias-editor.html`](../admin/noticias-editor.html:128) | `await requiereAutenticacion('admin');` (línea 128) | → `'personal'` |
| [`admin/documentos-editor.html`](../admin/documentos-editor.html:123) | `await requiereAutenticacion('admin');` (línea 123) | → `'personal'` |
| [`admin/calendario-editor.html`](../admin/calendario-editor.html:124) | `await requiereAutenticacion('admin');` (línea 124) | → `'personal'` |

### Archivos a NO modificar (mantener `'admin'`)

| Archivo | Razón |
|---------|-------|
| [`admin/usuarios.html`](../admin/usuarios.html:79) | Solo admin puede gestionar usuarios |
| [`admin/configuracion.html`](../admin/configuracion.html:117) | Solo admin puede cambiar configuración del sitio |

### Archivo adicional: [`admin/admin.js`](../admin/admin.js:1)

También tiene `await requiereAutenticacion('admin');` en la línea 1 (top-level) y línea 83 (dentro de `initAdmin()`). **Ambos** deben cambiarse a `'personal'`.

---

## PARTE 2 — Ocultar secciones restringidas en el sidebar

### Archivo a modificar: [`admin/admin.js`](../admin/admin.js)

En la función [`initAdmin()`](../admin/admin.js:81), después de obtener el usuario actual (línea 94: `return await getUsuarioActual()`), **antes del return** agregar la lógica para ocultar los links de "Usuarios" y "Configuración" si el rol es `personal`.

**Código a insertar** (antes de la línea 94):

```javascript
const usuarioActual = await getUsuarioActual();
if (usuarioActual?.perfil?.rol === 'personal') {
  const linkUsuarios = document.querySelector('.admin-sidebar a[href="/admin/usuarios.html"]');
  const linkConfig = document.querySelector('.admin-sidebar a[href="/admin/configuracion.html"]');
  if (linkUsuarios) linkUsuarios.closest('li').style.display = 'none';
  if (linkConfig) linkConfig.closest('li').style.display = 'none';
}
```

**Nota:** La función ya llama `await getUsuarioActual()` al final, así que debemos reestructurar ligeramente para usar el resultado antes del return.

---

## PARTE 3 — Botón "Editar" solo si es el autor

### 3a. Wiki — [`pages/wiki/wiki.js`](../pages/wiki/wiki.js)

En la función [`cargarArticulo()`](../pages/wiki/wiki.js:139), líneas 212-221:

**Código actual:**
```javascript
const rol = usuario?.perfil?.rol;
if (rol === 'personal' || rol === 'admin') {
  btnEditar.style.display = 'inline-flex';
  btnEditar.href = `/admin/wiki-editor.html?editar=${articuloId}`;
}
```

**Código nuevo:**
```javascript
const rol = usuario?.perfil?.rol;
const esAdmin = rol === 'admin';
const esAutor = rol === 'personal' && articulo.autor_id === usuario.id;
if (esAdmin || esAutor) {
  btnEditar.style.display = 'inline-flex';
  btnEditar.href = `/admin/wiki-editor.html?editar=${articuloId}`;
}
```

### 3b. Noticias — [`pages/noticias/noticias.js`](../pages/noticias/noticias.js)

En la función [`cargarNoticia()`](../pages/noticias/noticias.js:116), líneas 194-203:

**Mismo cambio que wiki** — reemplazar la condición `rol === 'personal' || rol === 'admin'` por `esAdmin || esAutor`.

### 3c. FAQ — [`pages/faq/faq.js`](../pages/faq/faq.js)

En la función [`cargarFAQ()`](../pages/faq/faq.js:24), líneas 121-131:

**NO CAMBIAR.** El botón "Agregar pregunta" debe seguir visible para cualquier `personal` o `admin`. La lógica actual es correcta:
```javascript
if (rol === 'personal' || rol === 'admin') {
  acciones.style.display = 'block';
}
```

### 3d. Calendario — [`pages/calendario/calendario.js`](../pages/calendario/calendario.js)

En la función [`mostrarBotonAgregar()`](../pages/calendario/calendario.js:144), líneas 144-158:

**NO CAMBIAR.** El botón "Agregar evento" debe seguir visible para cualquier `personal` o `admin`. La lógica actual es correcta:
```javascript
if (rol === 'personal' || rol === 'admin') {
  btn.style.display = 'inline-flex';
}
```

---

## PARTE 4 — RLS en Supabase

### Archivo a crear: [`supabase/rls-personal.sql`](../supabase/rls-personal.sql)

SQL para ejecutar en el SQL Editor de Supabase. Este es el **respaldo de seguridad** más importante — aunque el frontend oculte botones, la base de datos debe rechazar operaciones no autorizadas.

**Políticas necesarias:**

| Tabla | Operación | Regla |
|-------|-----------|-------|
| `wiki_articulos` | UPDATE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |
| `wiki_articulos` | DELETE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |
| `noticias` | INSERT | admin o personal |
| `noticias` | UPDATE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |
| `noticias` | DELETE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |
| `faq_preguntas` | INSERT | admin o personal |
| `faq_preguntas` | UPDATE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |
| `faq_preguntas` | DELETE | admin=siempre OK; personal=solo si `autor_id = auth.uid()` |

Asume la existencia de una función `get_rol_usuario()` en Supabase que retorna el rol del usuario autenticado.

---

## Resumen de archivos modificados

| # | Archivo | Tipo de cambio |
|---|---------|---------------|
| 1 | [`admin/index.html`](../admin/index.html) | Cambiar `'admin'` → `'personal'` en `requiereAutenticacion()` |
| 2 | [`admin/wiki-editor.html`](../admin/wiki-editor.html) | Cambiar `'admin'` → `'personal'` |
| 3 | [`admin/faq-editor.html`](../admin/faq-editor.html) | Cambiar `'admin'` → `'personal'` |
| 4 | [`admin/noticias-editor.html`](../admin/noticias-editor.html) | Cambiar `'admin'` → `'personal'` |
| 5 | [`admin/documentos-editor.html`](../admin/documentos-editor.html) | Cambiar `'admin'` → `'personal'` |
| 6 | [`admin/calendario-editor.html`](../admin/calendario-editor.html) | Cambiar `'admin'` → `'personal'` |
| 7 | [`admin/admin.js`](../admin/admin.js) | Cambiar `'admin'` → `'personal'` (2 ocurrencias) + agregar lógica de ocultar sidebar |
| 8 | [`pages/wiki/wiki.js`](../pages/wiki/wiki.js) | Cambiar condición del botón "Editar" a `esAdmin \|\| esAutor` |
| 9 | [`pages/noticias/noticias.js`](../pages/noticias/noticias.js) | Cambiar condición del botón "Editar" a `esAdmin \|\| esAutor` |
| 10 | [`supabase/rls-personal.sql`](../supabase/rls-personal.sql) | **Nuevo archivo** con políticas RLS |

## Archivos que NO se modifican

| Archivo | Razón |
|---------|-------|
| [`admin/usuarios.html`](../admin/usuarios.html) | Solo admin |
| [`admin/configuracion.html`](../admin/configuracion.html) | Solo admin |
| [`pages/faq/faq.js`](../pages/faq/faq.js) | Ya permite a cualquier personal/admin agregar preguntas |
| [`pages/calendario/calendario.js`](../pages/calendario/calendario.js) | Ya permite a cualquier personal/admin agregar eventos |
| [`pages/documentos/documentos.js`](../pages/documentos/documentos.js) | No tiene botón "Editar" individual |
| [`assets/js/auth.js`](../assets/js/auth.js) | La función `requiereAutenticacion()` y `verificarRol()` ya soportan la jerarquía correctamente |
