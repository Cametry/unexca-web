# Plan de Implementación — Hallazgos de Auditoría

> Basado en [`auditoria.md`](../auditoria.md) — 8 hallazgos (2 media, 6 baja)
> **Feedback aplicado:** H2 falso positivo (omitir), H8 omitido, H3 conservador, H5 extracción parcial, H6 paginación clásica

---

## Resumen

| ID | Hallazgo | Grav. | Tipo | Prioridad | Acción |
|---|---|---|---|---|---|
| H1 | CSS inline en páginas auth | 🟡 Media | CSS | Alta | Refactorizar a `auth.css` |
| H2 | Auth pages sin componentes compartidos | 🟢 Baja | HTML | — | **Falso positivo** — ya funciona correctamente. Omitir |
| H3 | `components.css` secciones legacy | 🟢 Baja | CSS | Baja | Limpieza conservadora |
| H4 | Falta CSS de print | 🟢 Baja | CSS | Baja | Crear `print.css` |
| H5 | Lógica CRUD duplicada en admin | 🟡 Media | JS | Alta | Extraer base a `crud-base.js` |
| H6 | Sin paginación en tablas admin | 🟢 Baja | JS | Baja | Paginación clásica en `crud-base.js` |
| H7 | Sin notificaciones toast post-CRUD | 🟢 Baja | JS | Baja | Toast en `crud-base.js` |
| H8 | Sin seed data para wiki/FAQ/noticias/docs | 🟢 Baja | SQL | — | **Omitido** — requiere explicación adicional |

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

### 2. H5 — Centralizar lógica CRUD del admin (extracción parcial)

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
2. Cada editor **mantiene su lógica específica** (cargar categorías propias, campos únicos, validaciones particulares) y solo **delega operaciones base** (cargar/crear/editar/eliminar) a `crud-base.js`.
3. Refactorizar cada `*-editor.html` para importar `crearCRUD` y reducir ~150-200 líneas de JS duplicado por editor.

**Criterio de éxito:** Cada editor admin reduce ~150-200 líneas de JS, lógica CRUD base centralizada, lógica específica permanece en cada editor.

---

## Prioridad Baja

### 3. H6 — Paginación clásica en tablas admin

**Archivos afectados:** [`admin/crud-base.js`](../admin/crud-base.js) (nuevo), todos los `*-editor.html`

**Qué hacer:**
1. En `crud-base.js`, agregar paginación clásica con `LIMIT`/`OFFSET` de Supabase:
   - Estado: `paginaActual`, `limite` (default 20), `totalRegistros`
   - Función `cargarPagina(pagina)` que calcula offset y ejecuta query
   - Renderizar controles de paginación con números de página (anterior/1/2/3.../siguiente)
2. Cada editor hereda paginación automáticamente al usar `crud-base.js`.

**Criterio de éxito:** Tablas admin con controles de paginación numérica, queries con LIMIT/OFFSET.

---

### 4. H7 — Notificaciones toast post-CRUD

**Archivos afectados:** [`admin/crud-base.js`](../admin/crud-base.js) (nuevo), [`admin/admin.css`](../admin/admin.css)

**Qué hacer:**
1. En `crud-base.js`, implementar sistema de toast:
   - Función `mostrarToast(mensaje, tipo)` con `'exito' | 'error' | 'info'`
   - Toast flotante en esquina superior derecha, auto-destrucción tras 3s
   - Animación CSS de entrada/salida
2. Reemplazar `mostrarMensaje()` existente por `mostrarToast()`.
3. Agregar estilos toast en [`admin/admin.css`](../admin/admin.css).

**Criterio de éxito:** Operaciones CRUD muestran toast visual animado, no solo texto en mensaje estático.

---

### 5. H3 — Limpiar CSS legacy (enfoque conservador)

**Archivos afectados:**
- [`assets/css/components.css`](../assets/css/components.css) — ~927 líneas legacy (líneas 911-1838)
- [`assets/css/layout.css`](../assets/css/layout.css) — ~97 líneas legacy (líneas 726-822)

**Qué hacer:**
1. Auditar cada sección LEGACY en `components.css`:
   - `LEGACY: Botones` (`.btn-sm`, `.btn-peligro`) — `.btn-peligro` se usa en admin (botones eliminar). Mantener, re-etiquetar
   - `LEGACY: Tarjetas` (`.card`, `.card-titulo`, etc.) — verificar uso en páginas públicas
   - `LEGACY: Grilla de tarjetas` (`.grid-tarjetas`) — verificar uso
   - `LEGACY: Formularios` (`.form-grupo`, `.form-input`) — **se usan extensamente**, re-etiquetar, NO eliminar
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
3. **Regla conservadora:** Si una clase legacy se usa en algún HTML/JS, renombrar sección de "LEGACY" a "ACTIVE" y mantener. Si no se usa, eliminar.
4. Dejar comentario `/* usado en [archivo:linea] */` para las que se mantienen.

**Criterio de éxito:** Reducción de líneas CSS legacy eliminadas (solo las no usadas), sin romper estilos existentes.

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

## Orden de Ejecución Sugerido

```
Fase 1 — Prioridad Alta (refactor mayor)
  [ ] H1  → auth.css
  [ ] H5  → crud-base.js (incluye H6 + H7)

Fase 2 — CSS cleanup
  [ ] H3  → limpiar legacy
  [ ] H4  → print.css
```

## Notas

- **H2:** Falso positivo. Auth pages ya cargan navbar/footer correctamente mediante `incluirComponente()`. No requiere acción.
- **H8:** Omitido. Pendiente de explicación detallada para decidir implementación futura.
- **H5:** Extracción parcial. Cada editor mantiene su lógica específica (categorías, campos únicos) y delega solo operaciones base.
- **H6:** Paginación clásica con números de página, no infinite scroll.
- **H3:** Enfoque conservador. Solo eliminar lo genuinamente no usado. Re-etiquetar lo que está en uso.
