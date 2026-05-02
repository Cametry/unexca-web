# Plan de Fusión — Nuevo Diseño Visual UNEXCA

## Resumen de Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `assets/css/base.css` | REEMPLAZAR con nuevo diseño + mantener clases legacy |
| `assets/css/layout.css` | REEMPLAZAR con nuevo diseño + mantener clases legacy |
| `assets/css/components.css` | REEMPLAZAR con nuevo diseño + mantener clases legacy |
| `index.html` | REESCRIBIR: estructura nueva + scripts actuales |
| `components/navbar.html` | REESCRIBIR: diseño nuevo + IDs actuales + barra-aviso |
| `components/footer.html` | REESCRIBIR: diseño nuevo + IDs actuales |

---

## 1. `assets/css/base.css` — Fusión

### Usar del nuevo diseño (reemplazar):
- **`:root` variables**: Las del nuevo diseño son más completas. Incluyen:
  - `--color-fondo-2`, `--color-borde-suave`
  - `--color-tipo-graduacion`, `--color-tipo-evento`
  - Capas de transparencia: `--capa-clara-*`, `--capa-azul-*`
  - Textos sobre oscuro: `--color-texto-claro-*`
  - `--fuente-sans`, `--fuente-display`, `--fuente-mono`
  - `--radio-xl`, `--s20`
  - Sombras mejoradas: `--sombra-xl`
  - `--ancho-max: 1240px`, `--alto-navbar: 72px`
  - Transiciones con cubic-bezier
- **Reset CSS**: Usar el del nuevo diseño (más limpio, incluye `button` reset)
- **Tipografía**: Usar la del nuevo diseño (incluye `.eyebrow` utility)
- **`prefers-reduced-motion`**: Mantener del nuevo diseño

### Mantener del actual (legacy):
- **`.spinner`** y **`.spinner--activo`** y **`.spinner__circulo`** con `@keyframes giro` — el JS actual (`utils.js`) usa `mostrarCarga()` que manipula `#spinner` con clases `spinner--activo` y estilos inline `display:flex/none`
- **`.container`** — el nuevo diseño ya tiene su propio `.container` en layout.css, pero mantener por si acaso (el nuevo layout.css también lo define)

### Conclusión base.css:
→ Usar el nuevo `base.css` como base, y **agregar** al final las clases `.spinner`, `.spinner--activo`, `.spinner__circulo` y `@keyframes giro` del actual.

---

## 2. `assets/css/layout.css` — Fusión

### Usar del nuevo diseño (reemplazar):
- **`.container`** — nuevo diseño (1240px, padding responsive)
- **`.announce-bar`** y relacionados (`.announce-row`, `.announce-tag`, `.announce-text`, `.announce-link`) — NUEVO
- **`.navbar`** — glassmorphism con backdrop-filter, nuevo layout
- **`.nav-row`**, **`.nav-brand`**, **`.nav-brand-mark`**, **`.nav-brand-text`**, **`.nav-brand-name`**, **`.nav-brand-sub`**
- **`.nav-menu`** — oculto por defecto, visible en ≥1024px
- **`.nav-link`** — nuevo estilo con hover, `.is-active` con underline
- **`.nav-actions`**, **`.nav-search`**, **`.nav-user`**, **`.nav-avatar`**, **`.nav-user-info`**, **`.nav-user-name`**, **`.nav-user-role`**, **`.nav-user-chev`**
- **`.nav-burger`** — visible <1024px
- **`.drawer-backdrop`**, **`.drawer`**, **`.drawer-head`**, **`.drawer-close`**, **`.drawer-body`**, **`.drawer-link`**, **`.drawer-icon`**, **`.drawer-foot`** — NUEVO drawer móvil
- **`.footer`** — nuevo diseño con `::before` gradient, nuevo grid (2fr 1fr 1fr)
- **`.footer-brand-row`**, **`.footer-mark`**, **`.footer-brand-text`**, **`.footer-brand-name`**, **`.footer-brand-sub`**, **`.footer-desc`**, **`.footer-meta`**, **`.footer-meta-item`**
- **`.footer-h`**, **`.footer-list`** (con `::before` hover effect)
- **`.social-list`**, **`.social-link`**, **`.social-icon`**, **`.social-handle`**
- **`.footer-copy`**, **`.footer-copy-row`**, **`.footer-copy-links`**

### Mantener del actual (legacy) — clases que el JS/admin pueden usar:
- **`.navbar-usuario`** — usado por `auth.js` → `actualizarNavbar()` setea `divUsuario.style.display = 'flex'`
- **`.navbar-saludo`** — usado para `#navbar-nombre-usuario`
- **`.navbar-hamburguesa`** — usado por `initHamburguesa()` en utils.js (busca `#btn-hamburguesa` y toggle `navbar-menu--abierto`)
- **`.navbar-menu--abierto`** — toggle class para menú móvil
- **`.navbar-contenido`** — clase en el div contenedor del navbar actual
- **`.navbar-logo`** — clase del logo actual
- **`.navbar-acciones`** — clase del contenedor de acciones
- **`.btn-red-social`** — usado por `cargarRedesSociales()` en index.html
- **`.redes-sociales`** — contenedor de redes
- **`.hero .btn-secundario`** — hover sobre fondo oscuro
- **`.navbar .btn-secundario`** — hover sobre navbar oscuro

### Conclusión layout.css:
→ Usar el nuevo `layout.css` como base, y **agregar** al final las clases legacy que el JS actual necesita.

---

## 3. `assets/css/components.css` — Fusión

### Usar del nuevo diseño (reemplazar):
- **`.btn`** — nuevo estilo con `gap`, `white-space:nowrap`
- **`.btn-lg`** — nuevo
- **`.btn-primario`** — usa `--color-primario-dark` como bg
- **`.btn-secundario`** — nuevo estilo
- **`.btn-fantasma`**, **`.btn-claro`**, **`.btn-secundario-oscuro`** — NUEVOS
- **`.ico`**, **`.ico-sm`**, **`.ico-lg`** — NUEVOS (SVG icons)
- **`.hero`** — nuevo diseño asimétrico
- **`.hero-grid`**, **`.hero-text`**, **`.hero-eyebrow`**, **`.hero-title`**, **`.hero-sub`**, **`.hero-cta`**
- **`.hero-roles`**, **`.role-chip`**, **`.role-chip-dot`**, **`.role-chip--estudiante/personal/visitante`**, **`.role-chip-label`**, **`.role-chip-meta`**
- **`.hero-image`**, **`.hero-image-watermark`**, **`.hero-image-tag`**, **`.hero-image-title`**, **`.hero-image-cards`**, **`.hc-card`**, **`.hc-card-date`**, **`.hc-card-title`**
- **`.section`**, **`.section-alt`**, **`.section-head`**, **`.section-head-left`**, **`.section-eyebrow`**, **`.section-title`**, **`.section-sub`**, **`.section-link`**
- **`.news-grid`**, **`.news-card`**, **`.news-cover`**, **`.news-cover-bg-*`**, **`.news-cover-mark`**
- **`.news-badge`**, **`.news-badge--*`**
- **`.news-body`**, **`.news-meta`**, **`.news-title`**, **`.news-resumen`**, **`.news-foot`**
- **`.events-list`**, **`.event-item`**, **`.event-item--*`** (colores por tipo)
- **`.event-date`**, **`.event-date-day`**, **`.event-date-month`**
- **`.event-info`**, **`.event-title`**, **`.event-desc`**
- **`.event-type`**, **`.event-type--*`**
- **`.qa-grid`**, **`.qa-card`** (con `::before` accent bar), **`.qa-icon`**, **`.qa-info`**, **`.qa-title`**, **`.qa-desc`**, **`.qa-arrow`**
- **`.badge`** — nuevo estilo (mono font, más compacto)
- **`.badge-admin`**, **`.badge-personal`**, **`.badge-estudiante`**

### Mantener del actual (legacy):
- **`.btn-sm`** — usado en navbar (`btn btn-secundario btn-sm`)
- **`.btn-peligro`** — usado en admin
- **`.card`**, **`.card:hover`**, **`.card-titulo`**, **`.card-texto`**, **`.card-imagen`**, **`.card-body`**, **`.card-footer`** — usado por JS dinámico (`cargarNoticias`, `cargarEventos`)
- **`.grid-tarjetas`** — clase en `#noticias-grid`
- **`.form-grupo`**, **`.form-input`**, **`.form-input--error`**, **`.form-ayuda`** — usado en páginas auth y admin
- **`.alerta`**, **`.alerta-error`**, **`.alerta-exito`**, **`.alerta-info`** — usado por JS (`#noticias-error`, `#eventos-error`)
- **`.badge-rol`** — usado en JS dinámico (`badge badge-rol badge-estudiante`)
- **`.acordeon-*`** — usado en FAQ
- **`.miga-pan`** — usado en wiki
- **`.card--categoria`**, **`.categoria-icono`**, **`.categoria-contador`** — wiki
- **`.card--articulo`** — wiki
- **`.wiki-*`** — todas las clases de wiki
- **`.vacio`** — estado vacío
- **`.filtros-noticias`**, **`.filtro-categoria`** — noticias
- **`.card--noticia`**, **`.card-imagen-placeholder`** — noticias
- **`.noticia-*`** — todas las clases de página de noticia individual
- **`.calendario-*`** — todas las clases de calendario
- **`.evento-card`**, **`.evento-barra`**, **`.evento-contenido`**, **`.evento-encabezado`**, **`.evento-titulo`**, **`.evento-fechas`**, **`.evento-fecha-sep`**, **`.evento-descripcion`**, **`.badge-evento`**
- **`.hero--wiki`** — hero reducido para wiki
- **`.hero-acciones`** — usado en hero actual

### Conclusión components.css:
→ Usar el nuevo `components.css` como base, y **agregar** al final TODAS las clases legacy del actual que no existen en el nuevo.

---

## 4. `index.html` — Reconstrucción

Estructura final:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Portal oficial de la Universidad Nacional Experimental de la Gran Caracas...">
  <title>UNEXCA — Portal Institucional</title>
  <link rel="icon" href="/assets/img/favicon.ico">
  <!-- Google Fonts: Inter + Fraunces + JetBrains Mono (del nuevo diseño) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
</head>
<body>
  <!-- Spinner (del actual) -->
  <div id="spinner" class="spinner" aria-hidden="true"></div>
  
  <!-- Navbar placeholder -->
  <div id="navbar-placeholder"></div>

  <main>
    <!-- HERO: diseño nuevo asimétrico -->
    <header class="hero" aria-label="Bienvenida">
      <div class="container hero-grid">
        <div class="hero-text">
          <!-- hero-eyebrow, hero-title, hero-sub, hero-cta, hero-roles -->
        </div>
        <div class="hero-image">
          <!-- hero-image-watermark, hero-image-tag, hero-image-title, hero-image-cards -->
        </div>
      </div>
    </header>

    <!-- NOTICIAS: diseño nuevo con section-head + news-grid -->
    <section class="section" aria-labelledby="h-noticias">
      <div class="container">
        <div class="section-head">
          <!-- eyebrow, title, section-link -->
        </div>
        <div class="news-grid" id="noticias-grid">
          <!-- Cargado dinámicamente desde Supabase -->
        </div>
        <div id="noticias-error" class="alerta alerta-info" style="display:none"></div>
      </div>
    </section>

    <!-- EVENTOS: diseño nuevo con events-list -->
    <section class="section section-alt" aria-labelledby="h-eventos">
      <div class="container">
        <div class="section-head">
          <!-- eyebrow, title, section-link -->
        </div>
        <div class="events-list" id="eventos-lista">
          <!-- Cargado dinámicamente desde Supabase -->
        </div>
        <div id="eventos-error" class="alerta alerta-info" style="display:none"></div>
      </div>
    </section>

    <!-- ACCESO RÁPIDO: diseño nuevo con qa-grid -->
    <section class="section" aria-labelledby="h-acceso">
      <div class="container">
        <div class="section-head">
          <!-- eyebrow, title -->
        </div>
        <div class="qa-grid">
          <!-- qa-cards para Wiki, FAQ, Noticias, Documentos, Calendario -->
        </div>
      </div>
    </section>
  </main>

  <!-- Footer placeholder -->
  <div id="footer-placeholder"></div>

  <!-- SCRIPT: exactamente el mismo del actual -->
  <script type="module">
    import { supabase } from '/assets/js/supabase-client.js';
    import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
    import { formatearFecha, truncar, mostrarCarga, incluirComponente, setAnioActual, initHamburguesa } from '/assets/js/utils.js';

    // ... mismas funciones: init(), cargarNoticias(), cargarEventos(), cargarRedesSociales()
  </script>
</body>
</html>
```

### Cambios clave en el script:
- `cargarNoticias()` genera HTML con clases NUEVAS: `news-card`, `news-cover`, `news-badge`, `news-body`, `news-meta`, `news-title`, `news-resumen`, `news-foot`
- `cargarEventos()` genera HTML con clases NUEVAS: `event-item`, `event-date`, `event-info`, `event-title`, `event-desc`, `event-type`
- Mantiene `#noticias-grid`, `#eventos-lista`, `#noticias-error`, `#eventos-error`, `#redes-botones`, `#anio-actual`

---

## 5. `components/navbar.html` — Reconstrucción

### Estructura:
```html
<!-- BARRA DE AVISO (nueva, oculta por defecto) -->
<div class="announce-bar" id="barra-aviso" style="display:none">
  <div class="container announce-row">
    <span class="announce-tag">Aviso</span>
    <span class="announce-text" id="aviso-texto"></span>
  </div>
</div>

<!-- NAVBAR con diseño nuevo -->
<nav class="navbar" id="navbar" aria-label="Navegación principal">
  <div class="container nav-row">
    <!-- Brand con logo -->
    <a href="/index.html" class="nav-brand" aria-label="UNEXCA — Inicio">
      <span class="nav-brand-mark">
        <img src="/assets/img/logo-white.png" alt="">
      </span>
      <span class="nav-brand-text">
        <span class="nav-brand-name">UNEXCA</span>
        <span class="nav-brand-sub">Portal Institucional</span>
      </span>
    </a>

    <!-- Menú de navegación -->
    <ul class="nav-menu" id="navbar-menu" role="navigation">
      <li><a href="/" class="nav-link is-active">Inicio</a></li>
      <li><a href="/pages/wiki/" class="nav-link">Wiki</a></li>
      <li><a href="/pages/noticias/" class="nav-link">Noticias</a></li>
      <li><a href="/pages/documentos/" class="nav-link">Documentos</a></li>
      <li><a href="/pages/calendario/" class="nav-link">Calendario</a></li>
      <li><a href="/pages/faq/" class="nav-link">FAQ</a></li>
    </ul>

    <!-- Acciones -->
    <div class="nav-actions">
      <!-- Login button (visible cuando no hay sesión) -->
      <a href="/pages/auth/login.html" class="btn btn-secundario-oscuro btn-sm" id="btn-login-nav">
        Iniciar Sesión
      </a>
      
      <!-- Usuario (visible cuando hay sesión) -->
      <div id="navbar-usuario" style="display:none" class="navbar-usuario">
        <span id="navbar-nombre-usuario" class="navbar-saludo"></span>
        <a href="/admin/" id="link-admin" class="btn btn-claro btn-sm" style="display:none">Admin</a>
        <button id="btn-logout" class="btn btn-claro btn-sm">Salir</button>
      </div>

      <!-- Hamburguesa -->
      <button type="button" class="nav-burger" id="btn-hamburguesa" aria-label="Abrir menú" aria-expanded="false" aria-controls="drawer">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10"></path>
        </svg>
      </button>
    </div>
  </div>
</nav>

<!-- DRAWER MÓVIL -->
<div class="drawer-backdrop" id="drawer-backdrop" aria-hidden="true"></div>
<aside class="drawer" id="drawer" aria-label="Menú móvil" aria-hidden="true">
  <!-- drawer-head, drawer-body con enlaces, drawer-foot con login/registro -->
</aside>
```

### IDs preservados del actual:
- `#btn-login-nav` → enlace de login
- `#navbar-usuario` → contenedor del usuario (display:none por defecto)
- `#navbar-nombre-usuario` → nombre del usuario
- `#link-admin` → enlace al admin
- `#btn-logout` → botón de cerrar sesión
- `#btn-hamburguesa` → botón hamburguesa
- `#navbar-menu` → menú de navegación
- `#barra-aviso` → NUEVO, oculto por defecto

### Nota sobre `initHamburguesa()`:
La función actual busca `#btn-hamburguesa` y `#navbar-menu`, y togglea `navbar-menu--abierto`. En el nuevo diseño, el menú móvil es un drawer lateral. Habrá que actualizar `initHamburguesa()` para que también maneje el drawer (toggle `is-open` en `#drawer` y `#drawer-backdrop`), o mantener compatibilidad. **Opción recomendada**: actualizar `initHamburguesa()` para que maneje el nuevo drawer.

---

## 6. `components/footer.html` — Reconstrucción

### Estructura (diseño nuevo):
```html
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <!-- Columna 1: Marca -->
      <div>
        <div class="footer-brand-row">
          <span class="footer-mark">
            <img src="/assets/img/logo-white.png" alt="">
          </span>
          <span class="footer-brand-text">
            <span class="footer-brand-name">UNEXCA</span>
            <span class="footer-brand-sub">Portal Institucional</span>
          </span>
        </div>
        <p class="footer-desc">Universidad Nacional Experimental de la Gran Caracas...</p>
        <div class="footer-meta">
          <span class="footer-meta-item"><span class="dot"></span> 5 sedes en Caracas</span>
          <span class="footer-meta-item"><span class="dot"></span> +8.000 estudiantes</span>
        </div>
      </div>

      <!-- Columna 2: Redes Sociales -->
      <div>
        <h4 class="footer-h">Síguenos</h4>
        <div class="social-list" id="redes-botones">
          <!-- Cargado dinámicamente desde configuracion_sitio -->
        </div>
      </div>

      <!-- Columna 3: Acceso Rápido -->
      <div>
        <h4 class="footer-h">Acceso rápido</h4>
        <ul class="footer-list">
          <li><a href="/pages/wiki/">Wiki institucional</a></li>
          <li><a href="/pages/faq/">Preguntas frecuentes</a></li>
          <li><a href="/pages/noticias/">Noticias y anuncios</a></li>
          <li><a href="/pages/documentos/">Centro de documentos</a></li>
          <li><a href="/pages/calendario/">Calendario académico</a></li>
          <li><a href="/pages/auth/login.html">Iniciar sesión</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-copy">
    <div class="container footer-copy-row">
      <span>© <span id="anio-actual"></span> UNEXCA — Todos los derechos reservados.</span>
      <div class="footer-copy-links">
        <a href="#">Términos</a>
        <a href="#">Privacidad</a>
        <a href="#">Accesibilidad</a>
        <a href="#">Contacto</a>
      </div>
    </div>
  </div>
</footer>
```

### IDs preservados:
- `#redes-botones` → dentro de `.social-list`
- `#anio-actual` → dentro del copyright

---

## 7. `assets/js/utils.js` — Actualización de `initHamburguesa()`

La función actual togglea `navbar-menu--abierto` en `#navbar-menu`. Con el nuevo drawer, debe:

```javascript
export function initHamburguesa() {
  const hamburguesa = document.getElementById('btn-hamburguesa');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('btn-cerrar-drawer');
  
  function openDrawer() {
    drawer?.classList.add('is-open');
    backdrop?.classList.add('is-open');
    backdrop?.setAttribute('aria-hidden', 'false');
    drawer?.setAttribute('aria-hidden', 'false');
    hamburguesa?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  
  function closeDrawer() {
    drawer?.classList.remove('is-open');
    backdrop?.classList.remove('is-open');
    backdrop?.setAttribute('aria-hidden', 'true');
    drawer?.setAttribute('aria-hidden', 'true');
    hamburguesa?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  
  hamburguesa?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer?.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });
  
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
}
```

---

## Resumen de Clases Legacy a Mantener en CSS

### En base.css (agregar al final):
- `.spinner`, `.spinner--activo`, `.spinner__circulo`, `@keyframes giro`

### En layout.css (agregar al final):
- `.navbar-usuario` (display flex, gap)
- `.navbar-saludo` (color blanco, font-size sm)
- `.navbar-hamburguesa` (display none, spans)
- `.navbar-menu--abierto` (transform translateX(0))
- `.navbar-contenido` (flex, space-between)
- `.navbar-logo` (flex, align center)
- `.navbar-acciones` (flex, gap)
- `.btn-red-social` (para footer redes)
- `.redes-sociales` (flex, gap, center)
- `.hero .btn-secundario` (hover sobre oscuro)
- `.navbar .btn-secundario` (hover sobre oscuro)

### En components.css (agregar al final):
- `.btn-sm`, `.btn-peligro`
- `.card`, `.card:hover`, `.card-titulo`, `.card-texto`, `.card-imagen`, `.card-body`, `.card-footer`
- `.grid-tarjetas` y sus media queries
- `.form-grupo`, `.form-input`, `.form-input--error`, `.form-ayuda`
- `.alerta`, `.alerta-error`, `.alerta-exito`, `.alerta-info`
- `.badge-rol`
- `.acordeon-*` (todo)
- `.miga-pan` (todo)
- `.card--categoria`, `.categoria-icono`, `.categoria-contador`
- `.card--articulo`
- `.wiki-*` (todo)
- `.vacio`
- `.filtros-noticias`, `.filtro-categoria`
- `.card--noticia`, `.card-imagen-placeholder`
- `.noticia-*` (todo)
- `.calendario-*` (todo)
- `.evento-card`, `.evento-barra`, `.evento-contenido`, `.evento-encabezado`, `.evento-titulo`, `.evento-fechas`, `.evento-fecha-sep`, `.evento-descripcion`, `.badge-evento`
- `.hero--wiki`
- `.hero-acciones`
