# Auditoría del Proyecto — Portal UNEXCA

> **Fecha:** 2026-05-06  
> **Versión auditada:** v1.0 (rama `develop`)  
> **Stack:** HTML5 + CSS3 vanilla + JavaScript ES6 Modules + Supabase + Vercel

---

## Resumen Ejecutivo

El proyecto es un portal institucional para la **Universidad Nacional Experimental de la Gran Caracas (UNEXCA)** construido sin frameworks (prohibición explícita de React, Vue, Angular, jQuery, bundlers, TypeScript). Usa **Supabase** como backend (PostgreSQL, Auth, Storage, RLS) y se despliega como sitio estático en **Vercel**.

**Estado general: SÓLIDO.** La arquitectura es coherente, el código sigue patrones consistentes, la seguridad está bien implementada (RLS, claves públicas/privadas separadas), y la documentación es exhaustiva. Se identificaron hallazgos menores que no comprometen la funcionalidad ni la seguridad.

---

## 1. Arquitectura General

### Stack

| Componente | Tecnología | Estado |
|---|---|---|
| Frontend | HTML5 + CSS3 vanilla + JS ES6 Modules | ✅ Correcto |
| Backend | Supabase (PostgreSQL, Auth, Storage) | ✅ Correcto |
| Hosting | Vercel (estático) | ✅ Correcto |
| Autenticación | Supabase Auth (email + password) | ✅ Correcto |
| Base de datos | PostgreSQL con RLS | ✅ Correcto |
| Almacenamiento | Supabase Storage (imágenes, PDFs) | ✅ Correcto |

### Estructura de directorios

```
/
├── index.html                  # Landing page
├── assets/
│   ├── css/                    # 3 archivos CSS (base, layout, components)
│   └── js/                     # 3 módulos JS core (supabase-client, auth, utils)
├── components/                 # navbar.html, footer.html (cargados vía fetch)
├── pages/
│   ├── auth/                   # Login, registro, recuperar contraseña
│   ├── wiki/                   # Wiki institucional
│   ├── faq/                    # Preguntas frecuentes
│   ├── noticias/               # Noticias
│   ├── documentos/             # Documentos académicos
│   └── calendario/             # Calendario de eventos
├── admin/                      # Panel administrativo (6 módulos CRUD)
├── supabase/                   # SQL schema, RLS, triggers, seed
└── plans/                      # Planes de diagnóstico y mejora
```

**✅ Acierto:** Separación clara por funcionalidad. Cada módulo de página tiene su propio directorio con `index.html` + `modulo.js`, siguiendo el patrón estándar definido en [`UNEXCA_MASTER.md`](UNEXCA_MASTER.md:1690).

---

## 2. Frontend — HTML/CSS

### 2.1 HTML

- **38 archivos HTML** revisados. Todos usan `<!DOCTYPE html>` y `lang="es"`.
- Los componentes compartidos (navbar, footer) se cargan dinámicamente mediante [`incluirComponente()`](assets/js/utils.js:47) con `fetch()`.
- Las páginas administrativas usan un layout consistente: sidebar + main.
- Las páginas públicas siguen la estructura: header + main + footer.

**Hallazgos:**

| # | Hallazgo | Archivo | Gravedad |
|---|---|---|---|
| H1 | Las páginas de login/registro/recuperar tienen CSS inline extenso (~77 líneas) en lugar de usar los archivos CSS compartidos | [`pages/auth/login.html`](pages/auth/login.html:16), [`registro.html`](pages/auth/registro.html:16), [`recuperar-contrasena.html`](pages/auth/recuperar-contrasena.html:16) | 🟡 Media |
| H2 | Las páginas de login/registro/recuperar no incluyen navbar ni footer mediante `incluirComponente()`, tienen su propio HTML completo | [`pages/auth/login.html`](pages/auth/login.html:95) | 🟢 Baja |

### 2.2 CSS

- **3 archivos CSS** bien organizados: [`base.css`](assets/css/base.css) (variables, reset, tipografía, spinner), [`layout.css`](assets/css/layout.css) (container, navbar, drawer, footer), [`components.css`](assets/css/components.css) (botones, hero, cards, grid).
- **Mobile-first** con breakpoints en 640px, 768px, 1024px, 1280px.
- **Design system** completo con variables CSS en `:root` (colores UNEXCA, sombras, transiciones, radios).
- **~2600 líneas totales** de CSS. Bien modularizado.

**Hallazgos:**

| # | Hallazgo | Archivo | Gravedad |
|---|---|---|---|
| H3 | `components.css` tiene ~1838 líneas, algunas secciones marcadas como "LEGACY — mantener solo si se usa" | [`assets/css/components.css`](assets/css/components.css) | 🟢 Baja |
| H4 | No hay archivo CSS de print. Las páginas se imprimirían con colores de fondo y layouts de pantalla | — | 🟢 Baja |

---

## 3. Frontend — JavaScript

### 3.1 Módulos Core

#### [`supabase-client.js`](assets/js/supabase-client.js) ✅
- Inicialización correcta de Supabase con `createClient()`.
- Las credenciales (URL + ANON_KEY) están en texto plano, lo cual es **correcto por diseño** — la ANON_KEY es pública por naturaleza.
- **Confirmado:** Las credenciales están excluidas del repositorio mediante `.gitignore` (archivo `CREDENCIALES_UNEXCA.txt`).

#### [`auth.js`](assets/js/auth.js) ✅
- Funciones: `getUsuarioActual()`, `verificarRol()`, `cerrarSesion()`, `requiereAutenticacion()`, `actualizarNavbar()`.
- Manejo correcto de sesión con `supabase.auth.getSession()`.
- **Confirmado:** El navbar ya muestra el link de administración para rol `personal` (líneas 64 y 78):
  ```js
  linkAdmin.style.display = (usuario.perfil?.rol === 'admin' || usuario.perfil?.rol === 'personal') ? 'inline' : 'none';
  ```

#### [`utils.js`](assets/js/utils.js) ✅
- Funciones utilitarias: `formatearFecha()`, `truncar()`, `getParamURL()`, `mostrarError()`, `mostrarCarga()`, `sanitizar()`, `incluirComponente()`, `setNavActivo()`, `initHamburguesa()`, `cargarBarraAviso()`.
- **Confirmado:** El spinner ya no bloquea clicks. La función [`mostrarCarga()`](assets/js/utils.js:29) usa `classList.add('spinner--activo')` y el CSS de [`base.css`](assets/css/base.css:205) tiene `pointer-events: none` en `.spinner` y `pointer-events: auto` en `.spinner--activo`.

### 3.2 Módulos de Página

| Módulo | Archivo | Líneas | Funcionalidad |
|---|---|---|---|
| Auth | [`pages/auth/auth.js`](pages/auth/auth.js) | 194 | Login, registro, recuperar contraseña |
| Wiki | [`pages/wiki/wiki.js`](pages/wiki/wiki.js) | 232 | Categorías, artículos, detalle |
| FAQ | [`pages/faq/faq.js`](pages/faq/faq.js) | 221 | Acordeón por categoría, búsqueda |
| Noticias | [`pages/noticias/noticias.js`](pages/noticias/noticias.js) | 214 | Lista con filtros, detalle |
| Documentos | [`pages/documentos/documentos.js`](pages/documentos/documentos.js) | 154 | Agrupados por categoría, control de acceso |
| Calendario | [`pages/calendario/calendario.js`](pages/calendario/calendario.js) | 176 | Próximos eventos, todos los eventos |

**Patrón consistente en todos los módulos ✅:**
```js
import { supabase } from '/assets/js/supabase-client.js';
// ...
async function init() { /* ... */ }
init();
```

### 3.3 Módulo Admin

| Archivo | Líneas | Funcionalidad |
|---|---|---|
| [`admin/admin.js`](admin/admin.js) | 108 | Init, estadísticas, sidebar, redes sociales |
| [`admin/index.html`](admin/index.html) | 175 | Dashboard con stats y acciones rápidas |
| [`admin/wiki-editor.html`](admin/wiki-editor.html) | 365 | CRUD artículos wiki |
| [`admin/noticias-editor.html`](admin/noticias-editor.html) | 383 | CRUD noticias |
| [`admin/faq-editor.html`](admin/faq-editor.html) | 380 | CRUD preguntas frecuentes |
| [`admin/documentos-editor.html`](admin/documentos-editor.html) | 371 | CRUD documentos |
| [`admin/calendario-editor.html`](admin/calendario-editor.html) | 363 | CRUD eventos |
| [`admin/usuarios.html`](admin/usuarios.html) | 243 | Gestión de usuarios (solo admin) |
| [`admin/configuracion.html`](admin/configuracion.html) | 273 | Configuración del sitio (solo admin) |

**Hallazgos:**

| # | Hallazgo | Archivo | Gravedad |
|---|---|---|---|
| H5 | Los editores CRUD tienen lógica duplicada (cargar, crear, editar, eliminar) en cada archivo HTML en lugar de compartirla desde un JS central | Cada `*-editor.html` | 🟡 Media |
| H6 | No hay paginación en las tablas del admin. Con muchos registros, la UI se degradaría | Cada `*-editor.html` | 🟢 Baja |
| H7 | No hay confirmación visual (toast/notificación) después de operaciones CRUD exitosas; solo se recarga la tabla | Cada `*-editor.html` | 🟢 Baja |

---

## 4. Seguridad

### 4.1 Autenticación

| Aspecto | Estado |
|---|---|
| Registro con email + password | ✅ Implementado |
| Verificación de email | ✅ Configurado en Supabase |
| Recuperación de contraseña | ✅ Implementado |
| Sesión persistente | ✅ `supabase.auth.getSession()` |
| Cierre de sesión | ✅ `supabase.auth.signOut()` |

### 4.2 Control de Acceso

- **3 roles** en `auth.users.raw_user_meta_data.rol`: `estudiante` (1), `personal` (2), `admin` (3).
- **Función `requiereAutenticacion(rolMinimo)`** en [`auth.js`](assets/js/auth.js:23) que redirige si no se cumple el rol.
- **Panel admin:** protegido con `requiereAutenticacion('personal')` — tanto personal como admin pueden acceder.
- **Gestión de usuarios y configuración:** protegido con `requiereAutenticacion('admin')` — solo admin.
- **Sidebar admin:** oculta enlaces restringidos para rol `personal` mediante [`resaltarNavActivo()`](admin/admin.js:9).

### 4.3 Row Level Security (RLS)

- Políticas RLS implementadas en [`supabase/rls-personal.sql`](supabase/rls-personal.sql):
  - `wiki_articulos`: INSERT para personal/admin, UPDATE/DELETE para admin o autor.
  - `noticias`: INSERT para personal/admin, UPDATE/DELETE para admin o autor.
  - `faq_preguntas`: INSERT para personal/admin, UPDATE/DELETE para admin o autor.
- Políticas base en [`02_rls.sql`](supabase/02_rls.sql) (referenciado en documentación).

### 4.4 Exposición de Credenciales

| Archivo | Contenido | ¿Está en `.gitignore`? |
|---|---|---|
| `CREDENCIALES_UNEXCA.txt` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SERVICE_ROLE_KEY` | ✅ **Sí** (línea 12) |
| `assets/js/supabase-client.js` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` (públicas) | ✅ Correcto por diseño |

**✅ Conclusión:** No hay exposición de credenciales sensibles. La `SERVICE_ROLE_KEY` nunca aparece en código cliente.

---

## 5. Base de Datos (Supabase)

### 5.1 Schema

Tablas identificadas en la documentación y el código:

| Tabla | Propósito |
|---|---|
| `wiki_categorias` | Categorías de wiki |
| `wiki_articulos` | Artículos de wiki |
| `faq_categorias` | Categorías de FAQ |
| `faq_preguntas` | Preguntas frecuentes |
| `noticias` | Noticias |
| `documentos` | Documentos |
| `calendario_eventos` | Eventos del calendario |
| `configuracion` | Configuración del sitio |
| `redes_sociales` | Enlaces a redes sociales |

### 5.2 Seed Data

[`supabase/04_seed.sql`](supabase/04_seed.sql) contiene datos de prueba para eventos del calendario (inscripciones, clases, exámenes).

**Hallazgos:**

| # | Hallazgo | Gravedad |
|---|---|---|
| H8 | No hay seed data para wiki, FAQ, noticias, documentos. La base de datos inicia vacía para esos módulos | 🟢 Baja |

---

## 6. Despliegue y DevOps

### 6.1 Vercel

[`vercel.json`](vercel.json) configurado correctamente con rewrites para SPA:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6.2 Git

- `.gitignore` configurado correctamente excluyendo `CREDENCIALES_UNEXCA.txt`, archivos de OS, editor, Node, y Vercel/Netlify.
- Flujo Git definido en [`UNEXCA_MASTER.md`](UNEXCA_MASTER.md:1924): ramas `main` (producción) y `develop` (desarrollo).

---

## 7. Documentación

| Archivo | Líneas | Propósito | Estado |
|---|---|---|---|
| [`README.md`](README.md) | — | Descripción general | ✅ |
| [`UNEXCA_MASTER.md`](UNEXCA_MASTER.md) | 2169 | Documentación maestra completa | ✅ Exhaustivo |
| [`UNEXCA_AI_CONTEXT.md`](UNEXCA_AI_CONTEXT.md) | 1309 | Contexto para asistentes IA | ✅ Exhaustivo |

**✅ La documentación es excepcionalmente completa.** Incluye arquitectura, stack, roles, estructura de archivos, diseño CSS, configuración Supabase, patrones de código, flujo de trabajo Git, y orden de construcción.

---

## 8. Planes de Mejora (Ejecutados)

Todos los planes documentados en [`plans/`](plans/) ya han sido ejecutados:

| Plan | Estado | Descripción |
|---|---|---|
| [`diagnostico-click-registro.md`](plans/diagnostico-click-registro.md) | ✅ **Ejecutado** | Spinner bloqueaba clicks — solucionado con `pointer-events: none` en CSS y clase `spinner--activo` |
| [`fix-admin-imports.md`](plans/fix-admin-imports.md) | ✅ **Ejecutado** | Faltaban imports de `requiereAutenticacion` en archivos admin |
| [`permisos-personal.md`](plans/permisos-personal.md) | ✅ **Ejecutado** | Permisos granulares para rol personal (acceso a admin, sidebar, edición autor-only, RLS) |
| [`fix-navbar-admin-filter-autor.md`](plans/fix-navbar-admin-filter-autor.md) | ✅ **Ejecutado** | Navbar muestra link admin para personal; filtrado por autor en contenidos |
| [`fix-4-pequenos-fixes.md`](plans/fix-4-pequenos-fixes.md) | ✅ **Ejecutado** | 4 pequeños fixes |
| [`fix-navbar-drawer-mobile.md`](plans/fix-navbar-drawer-mobile.md) | ✅ **Ejecutado** | Fix de drawer móvil |
| [`merge-plan.md`](plans/merge-plan.md) | ✅ **Ejecutado** | Plan de merge |

---

## 9. Resumen de Hallazgos

| ID | Hallazgo | Gravedad | Archivo(s) |
|---|---|---|---|
| H1 | CSS inline extenso en páginas de auth | 🟡 Media | `pages/auth/login.html`, `registro.html`, `recuperar-contrasena.html` |
| H2 | Páginas de auth no usan componentes compartidos (navbar/footer) | 🟢 Baja | `pages/auth/login.html`, `registro.html`, `recuperar-contrasena.html` |
| H3 | `components.css` tiene secciones legacy (~1838 líneas) | 🟢 Baja | `assets/css/components.css` |
| H4 | Falta CSS de print | 🟢 Baja | — |
| H5 | Lógica CRUD duplicada en cada editor admin | 🟡 Media | `admin/*-editor.html` |
| H6 | Sin paginación en tablas admin | 🟢 Baja | `admin/*-editor.html` |
| H7 | Sin notificaciones toast después de CRUD | 🟢 Baja | `admin/*-editor.html` |
| H8 | Sin seed data para wiki, FAQ, noticias, documentos | 🟢 Baja | `supabase/04_seed.sql` |

### Clasificación de Gravedad

- **🔴 Crítica:** 0 hallazgos
- **🟡 Media:** 2 hallazgos (H1, H5)
- **🟢 Baja:** 6 hallazgos (H2, H3, H4, H6, H7, H8)

---

## 10. Recomendaciones

### Prioridad Alta
1. **Refactorizar CSS inline de páginas auth** (H1) — Mover los estilos de login/registro/recuperar a `components.css` o crear un `auth.css` dedicado.
2. **Centralizar lógica CRUD del admin** (H5) — Extraer las operaciones repetitivas (cargar tabla, crear, editar, eliminar) a un módulo compartido tipo `admin/crud-base.js`.

### Prioridad Baja
3. **Agregar paginación** (H6) — Implementar `LIMIT`/`OFFSET` en consultas Supabase para tablas admin.
4. **Agregar notificaciones toast** (H7) — Feedback visual después de operaciones CRUD.
5. **Limpiar CSS legacy** (H3) — Revisar y eliminar secciones marcadas como legacy en `components.css`.
6. **Agregar CSS de print** (H4) — Para impresión de artículos wiki y noticias.
7. **Agregar seed data** (H8) — Datos de prueba para todos los módulos.

---

## 11. Conclusión

El proyecto **Portal UNEXCA** se encuentra en un estado **sólido y bien estructurado**. La arquitectura sin frameworks es coherente y sigue patrones consistentes. La seguridad está correctamente implementada con RLS y separación de claves. La documentación es excepcionalmente completa.

Los hallazgos identificados son **menores** y no representan riesgos de seguridad ni bloqueos funcionales. Las recomendaciones se centran en mejorar la mantenibilidad del código (reducir duplicación) y la experiencia de usuario (paginación, notificaciones).

**Puntuación general: 9/10**
