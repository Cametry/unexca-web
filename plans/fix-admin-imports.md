# Plan: Corregir import de `requiereAutenticacion` en archivos admin

## Diagnóstico

### Problema

En varios archivos del panel de administración, la función `requiereAutenticacion` se usa **sin estar importada** en el `import` del script. Actualmente se usa como:

```js
await requiereAutenticacion('admin');
```

Pero `requiereAutenticacion` no aparece en la lista de `import { ... } from '/assets/js/auth.js'` de esos archivos.

### ¿Por qué funciona aparentemente?

En los módulos ES (`type="module"`), las declaraciones `await` a nivel superior (top-level await) se ejecutan **antes** de los `import`. Sin embargo, la función `requiereAutenticacion` no está en el scope del módulo porque no fue importada. Esto debería lanzar un `ReferenceError`.

**Sin embargo**, en [`admin/admin.js`](admin/admin.js:4) SÍ está correctamente importada:
```js
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar, cerrarSesion } from '/assets/js/auth.js';
```

Y [`initAdmin()`](admin/admin.js:78-94) llama a `requiereAutenticacion('admin')` internamente. Entonces, si los archivos llaman a `initAdmin()`, la autenticación se verifica a través de esa función. Pero el `await requiereAutenticacion('admin')` a nivel superior en cada archivo **fallaría** porque la función no está importada en ese módulo.

### Estado actual por archivo

| Archivo | `await requiereAutenticacion('admin')` | Import de `requiereAutenticacion` | ¿Funciona? |
|---------|----------------------------------------|-----------------------------------|------------|
| [`admin/admin.js`](admin/admin.js:1) | ✅ Línea 1 (top-level) | ✅ Línea 4 | ✅ Sí |
| [`admin/index.html`](admin/index.html:101-174) | ❌ No tiene | ❌ No importa de auth.js | ❌ No, pero usa `initAdmin()` que sí verifica |
| [`admin/usuarios.html`](admin/usuarios.html:77) | ✅ Línea 77 | ❌ Línea 80 no incluye `requiereAutenticacion` | ❌ ReferenceError |
| [`admin/wiki-editor.html`](admin/wiki-editor.html:106) | ✅ Línea 106 | ❌ Línea 109 no incluye `requiereAutenticacion` | ❌ ReferenceError |
| [`admin/faq-editor.html`](admin/faq-editor.html:111) | ✅ Línea 111 | ❌ Línea 114 no incluye `requiereAutenticacion` | ❌ ReferenceError |
| [`admin/noticias-editor.html`](admin/noticias-editor.html) | ❌ No tiene | ❌ No importa de auth.js | ❌ No, pero usa `initAdmin()` |
| [`admin/documentos-editor.html`](admin/documentos-editor.html:121) | ✅ Línea 121 | ❌ Línea 124 no incluye `requiereAutenticacion` | ❌ ReferenceError |
| [`admin/calendario-editor.html`](admin/calendario-editor.html:122) | ✅ Línea 122 | ❌ Línea 125 no incluye `requiereAutenticacion` | ❌ ReferenceError |
| [`admin/configuracion.html`](admin/configuracion.html:95) | ✅ Línea 95 | ❌ Línea 98 no incluye `requiereAutenticacion` | ❌ ReferenceError |

## Solución propuesta

### Cambio 1: Agregar `requiereAutenticacion` al import en cada archivo

En cada archivo que tiene `await requiereAutenticacion('admin')` pero no lo importa, agregarlo al import existente de `/assets/js/auth.js`.

### Cambio 2: Normalizar estructura `init()` con async

Para los archivos que NO tienen `await requiereAutenticacion('admin')` al inicio (index.html, noticias-editor.html), agregarlo dentro de una función `async function init()`.

### Cambios específicos por archivo

#### 1. [`admin/admin.js`](admin/admin.js:4) — ✅ Ya está correcto
No requiere cambios.

#### 2. [`admin/index.html`](admin/index.html:101-174) — Agregar import y `requiereAutenticacion`

```js
// ANTES (líneas 101-108):
<script type="module">
    import { supabase } from '/assets/js/supabase-client.js';
    import { initAdmin, cargarEstadisticas } from '/admin/admin.js';
    import { formatearFecha } from '/assets/js/utils.js';

    async function initDashboard() {
      try {
        await initAdmin();
        ...

// DESPUÉS:
<script type="module">
    import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
    import { supabase } from '/assets/js/supabase-client.js';
    import { initAdmin, cargarEstadisticas } from '/admin/admin.js';
    import { formatearFecha } from '/assets/js/utils.js';

    async function init() {
      await requiereAutenticacion('admin');
      await initAdmin();
      await initDashboard();
    }

    async function initDashboard() {
      try {
        ...
```

#### 3. [`admin/usuarios.html`](admin/usuarios.html:77-81) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 80):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

#### 4. [`admin/wiki-editor.html`](admin/wiki-editor.html:106-110) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 109):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

#### 5. [`admin/faq-editor.html`](admin/faq-editor.html:111-115) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 114):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

#### 6. [`admin/noticias-editor.html`](admin/noticias-editor.html) — Agregar import y `requiereAutenticacion`

Similar a index.html, agregar el import y la llamada a `requiereAutenticacion('admin')` dentro de `init()`.

#### 7. [`admin/documentos-editor.html`](admin/documentos-editor.html:121-125) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 124):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

#### 8. [`admin/calendario-editor.html`](admin/calendario-editor.html:122-126) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 125):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

#### 9. [`admin/configuracion.html`](admin/configuracion.html:95-99) — Agregar `requiereAutenticacion` al import

```js
// ANTES (línea 98):
import { initAdmin } from '/admin/admin.js';

// DESPUÉS:
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { initAdmin } from '/admin/admin.js';
```

## Resumen de cambios

| Archivo | Línea del script | Cambio |
|---------|-----------------|--------|
| `admin/index.html` | 101-174 | Agregar import `{ requiereAutenticacion, getUsuarioActual, actualizarNavbar }` y llamada a `await requiereAutenticacion('admin')` dentro de `init()` |
| `admin/usuarios.html` | 76-82 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
| `admin/wiki-editor.html` | 105-112 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
| `admin/faq-editor.html` | 110-117 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
| `admin/noticias-editor.html` | (ver script) | Agregar import y `await requiereAutenticacion('admin')` |
| `admin/documentos-editor.html` | 120-127 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
| `admin/calendario-editor.html` | 121-128 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
| `admin/configuracion.html` | 94-100 | Agregar `requiereAutenticacion, getUsuarioActual, actualizarNavbar` al import |
