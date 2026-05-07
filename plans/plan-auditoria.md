# Plan de Implementación — Hallazgos de Auditoría

> Basado en [`auditoria.md`](../auditoria.md) — 8 hallazgos (2 media, 6 baja)

---

## Resumen

| ID | Hallazgo | Grav. | Tipo | Prioridad |
|---|---|---|---|---|
| H1 | CSS inline en páginas auth | 🟡 Media | CSS | Alta |
| H2 | Auth pages sin componentes compartidos | 🟢 Baja | HTML | Baja |
| H3 | `components.css` secciones legacy | 🟢 Baja | CSS | Baja |
| H4 | Falta CSS de print | 🟢 Baja | CSS | Baja |
| H5 | Lógica CRUD duplicada en admin | 🟡 Media | JS | Alta |
| H6 | Sin paginación en tablas admin | 🟢 Baja | JS | Baja |
| H7 | Sin notificaciones toast post-CRUD | 🟢 Baja | JS | Baja |
| H8 | Sin seed data para wiki/FAQ/noticias/docs | 🟢 Baja | SQL | Baja |

---

## Prioridad Alta

### 1. H1 — Refactorizar CSS inline de páginas auth

**Archivos afectados:**
- [`pages/auth/login.html`](../pages/auth/login.html:16) — `<style>` inline ~77 líneas
- [`pages/auth/registro.html`](../pages/auth/registro.html:16) — mismo bloque
- [`pages/auth/recuperar-contrasena.html`](../pages/auth/recuperar-contrasena.html:16) — mismo bloque

**Qué hacer:**
1. Crear [`assets/css/auth.css`](../assets/css/auth.css) con las clases `.auth-pagina`, `.auth-card`, `.auth-logo`, `.auth-titulo`, `.auth-subtitulo`, `.auth-enlace`, `.auth-divisor`, `.btn-full` y el media query `@media (max-width: 480px)`.
2. En cada HTML auth, reemplazar el bloque `<style>...</style>` con `<link rel="stylesheet" href="/assets/css/auth.css">`.
3. Verificar que no haya conflictos con clases existentes en `components.css`.

**Criterio de éxito:** 3 HTML auth sin CSS inline, todo el estilo auth en `auth.css`.

---

### 2. H5 — Centralizar lógica CRUD del admin

**Archivos afectados:**
- [`admin/wiki-editor.html`](../admin/wiki-editor.html) — script ~255 líneas con CRUD
- [`admin/noticias-editor.html`](../admin/noticias-editor.html) — patrón similar
- [`admin/faq-editor.html`](../admin/faq-editor.html) — patrón similar
- [`admin/documentos-editor.html`](../admin/documentos-editor.html) — patrón similar
- [`admin/calendario-editor.html`](../admin/calendario-editor.html) — patrón similar

**Qué hacer:**
1. Crear [`admin/crud-base.js`](../admin/crud-base.js) con funciones genéricas reutilizables:
   - `crearCRUD(config)` — fábrica que recibe config con: `tabla`, `campos`, `formId`, `tablaId`, `plantillaFila`, `cargarSelects?`, `filtroPersonal?`
   - Internamente implementa: `cargarRegistros()`, `crear()`, `editar(id)`, `eliminar(id)`, `mostrarFormulario()`, `ocultarFormulario()`
   - Helper `mostrarMensaje(texto, tipo)` con auto-ocultación (esto también cubre H7)
2. Refactorizar cada `*-editor.html` para:
   - Importar `crearCRUD` desde `crud-base.js`
   - Llamar `crearCRUD({ tabla: 'wiki_articulos', ... })` con config específica
   - Eliminar lógica CRUD duplicada (~200 líneas por editor)

**Criterio de éxito:** Cada editor admin reduce ~200 líneas de JS, toda lógica CRUD centralizada en `crud-base.js`.

---

## Prioridad Baja

### 3. H6 — Paginación en tablas admin

**Archivos afectados:** [`admin/crud-base.js`](../admin/crud-base.js) (nuevo), todos los `*-editor.html`

**Qué hacer:**
1. En `crud-base.js`, agregar paginación con `LIMIT`/`OFFSET` de Supabase:
   - Estado: `paginaActual`, `limite` (default 20), `totalRegistros`
   - Función `cargarPagina(pagina)` que calcula offset y ejecuta query
   - Renderizar controles de paginación (anterior/siguiente/números) en el DOM
2. Cada editor hereda paginación automáticamente al usar `crud-base.js`.

**Criterio de éxito:** Tablas admin con controles de paginación, queries con LIMIT/OFFSET.

---

### 4. H7 — Notificaciones toast post-CRUD

**Archivos afectados:** [`admin/crud-base.js`](../admin/crud-base.js) (nuevo)

**Qué hacer:**
1. En `crud-base.js`, implementar sistema de toast:
   - Función `mostrarToast(mensaje, tipo)` con `'exito' | 'error' | 'info'`
   - Toast flotante en esquina superior derecha, auto-destrucción tras 3s
   - Animación CSS de entrada/salida
2. Reemplazar `mostrarMensaje()` existente por `mostrarToast()`.
3. Agregar estilos toast en [`admin/admin.css`](../admin/admin.css).

**Criterio de éxito:** Operaciones CRUD muestran toast visual, no solo texto en mensaje estático.

---

### 5. H3 — Limpiar CSS legacy

**Archivos afectados:**
- [`assets/css/components.css`](../assets/css/components.css) — ~927 líneas legacy (líneas 911-1838)
- [`assets/css/layout.css`](../assets/css/layout.css) — ~97 líneas legacy (líneas 726-822)

**Qué hacer:**
1. Auditar cada sección LEGACY en `components.css`:
   - `LEGACY: Botones` (`.btn-sm`, `.btn-peligro`) — verificar si se usan en admin (`.btn-peligro` sí se usa en botones eliminar)
   - `LEGACY: Tarjetas` (`.card`, `.card-titulo`, etc.) — verificar uso en páginas públicas
   - `LEGACY: Grilla de tarjetas` (`.grid-tarjetas`) — verificar uso
   - `LEGACY: Formularios` (`.form-grupo`, `.form-input`) — **se usan extensamente**, NO eliminar
   - `LEGACY: Alertas` (`.alerta`, `.alerta-error`, etc.) — verificar uso
   - `LEGACY: Badge de rol` (`.badge-rol`) — verificar uso en admin
   - `LEGACY: Acordeón` (`.acordeon-item`, etc.) — verificar uso en FAQ
   - `LEGACY: Noticias` (`.filtros-noticias`, `.card--noticia`, etc.) — verificar uso
   - `LEGACY: Calendario` (`.calendario-encabezado`, `.evento-card`, etc.) — verificar uso
   - `LEGACY: Hero acciones` (`.hero-acciones`) — verificar uso
2. En `layout.css`:
   - `LEGACY: Clases del navbar` — verificar si JS las referencia
   - `LEGACY: Botones de redes sociales` — verificar uso en footer
   - `LEGACY: Botones sobre fondos oscuros` — verificar uso
3. **Regla:** Si una clase legacy se usa en algún HTML/JS, renombrar sección de "LEGACY" a "ACTIVE" y mantener. Si no se usa, eliminar.
4. Dejar comentario `/* LEGACY — no eliminado: usado en [archivo:linea] */` para las que se mantienen.

**Criterio de éxito:** Reducción de ~300-500 líneas CSS legacy eliminadas, sin romper estilos existentes.

---

### 6. H4 — Agregar CSS de print

**Archivo nuevo:** [`assets/css/print.css`](../assets/css/print.css)

**Qué hacer:**
1. Crear `print.css` con:
   - Ocultar navbar, footer, sidebar, botones, formularios
   - Mostrar colores de fondo en blanco/negro
   - Ajustar tipografía para papel
   - Mostrar URLs de enlaces
   - Break pages para contenido largo
2. Agregar `<link rel="stylesheet" href="/assets/css/print.css" media="print">` en páginas donde aplique (wiki, noticias).

**Criterio de éxito:** Páginas imprimen limpias sin navbar/footer/botones.

---

### 7. H8 — Seed data para todos los módulos

**Archivo afectado:** [`supabase/04_seed.sql`](../supabase/04_seed.sql)

**Qué hacer:**
1. Agregar seed data para:
   - `wiki_categorias` (3-4 categorías: Académico, Administrativo, Estudiantil, Tecnología)
   - `wiki_articulos` (2-3 artículos por categoría)
   - `faq_categorias` (3 categorías: General, Académico, Técnico)
   - `faq_preguntas` (2-3 preguntas por categoría)
   - `noticias` (3-4 noticias con fechas variadas)
   - `documentos` (3-4 documentos con distintos niveles de acceso)
2. Usar `autor_id` de un usuario de prueba (comentar que requiere ID real).

**Criterio de éxito:** Base de datos inicia con datos de prueba en todos los módulos.

---

### 8. H2 — Auth pages usen componentes compartidos

**Archivos afectados:**
- [`pages/auth/login.html`](../pages/auth/login.html)
- [`pages/auth/registro.html`](../pages/auth/registro.html)
- [`pages/auth/recuperar-contrasena.html`](../pages/auth/recuperar-contrasena.html)

**Qué hacer:**
1. Verificar si ya usan `incluirComponente()` — login.html tiene `<div id="navbar-placeholder">` y `<div id="footer-placeholder">`, y `auth.js` llama a `incluirComponente()`.
2. Si ya funciona, marcar H2 como **no aplica** (falso positivo de auditoría).
3. Si no funciona, agregar las llamadas a `incluirComponente('navbar')` y `incluirComponente('footer')` en `auth.js`.

**Criterio de éxito:** Auth pages muestran navbar y footer igual que el resto del sitio.

---

## Orden de Ejecución Sugerido

```
Fase 1 — Prioridad Alta (refactor mayor)
  [ ] H1  → auth.css
  [ ] H5  → crud-base.js (incluye H6 + H7)

Fase 2 — CSS cleanup
  [ ] H3  → limpiar legacy
  [ ] H4  → print.css

Fase 3 — Datos y detalles
  [ ] H8  → seed data
  [ ] H2  → verificar componentes auth
```

## Preguntas / Notas

1. **H2:** Las auth pages ya tienen `navbar-placeholder` y `footer-placeholder` en HTML, y `auth.js` importa `incluirComponente`. ¿Confirma que navbar/footer ya se renderizan correctamente? Si sí, H2 es falso positivo y se omite.

2. **H3 (legacy):** Algunas clases legacy como `.form-grupo`, `.form-input`, `.alerta`, `.btn-peligro` se usan activamente en admin y páginas públicas. La recomendación es **no eliminar** las que están en uso, solo renombrar su etiqueta LEGACY. ¿Prefiere limpieza agresiva (eliminar no usadas) o conservadora (solo re-etiquetar)?

3. **H5 (CRUD base):** ¿Quiere que `crud-base.js` sea un refactor completo que reemplace TODO el JS inline de los editores, o una extracción parcial donde cada editor mantenga su lógica específica (categorías, campos únicos) y solo delegue operaciones base (cargar/crear/editar/eliminar)?

4. **H6 (paginación):** ¿Implementar paginación estilo "cargar más" (infinite scroll) o paginación clásica con números de página?

5. **Seed data (H8):** Los inserts necesitan `autor_id` real de un usuario existente. ¿Usar un UUID placeholder comentado o crear un usuario de prueba en el seed?
