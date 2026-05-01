# UNEXCA_AI_CONTEXT.md
> **INSTRUCCIÓN PARA IA:** Este archivo es tu contexto operativo completo. Léelo íntegro antes de generar cualquier código, archivo o respuesta sobre este proyecto. Contiene especificaciones exactas, código base real y reglas de cumplimiento obligatorio. No asumas nada que no esté aquí.

---

## [META] IDENTIDAD DEL PROYECTO

```yaml
nombre: Portal Web Institucional UNEXCA
cliente: Universidad Nacional Experimental de la Gran Caracas (Venezuela)
idioma_ui: español (es-VE)
version: 1.0.0
estado: en_desarrollo
objetivo_principal: portal universitario público con panel de administración
objetivo_secundario: pasar materia Proyecto Sociotecnológico II (UNEXCA, 3er semestre Informática)
desarrollador: puede ser 1 persona o equipo de hasta 6
dominio_temporal: unexca.vercel.app | unexca.netlify.app
```

---

## [STACK] TECNOLOGÍAS — DEFINITIVAS E INAMOVIBLES

```yaml
frontend:
  estructura: HTML5 semántico
  estilos: CSS3 puro (variables CSS + Flexbox + Grid)
  logica: JavaScript ES6+ vanilla (SIN React, SIN Vue, SIN Angular, SIN jQuery)
  modulos: ES Modules nativos (import/export con type="module")

backend:
  tipo: BaaS (Backend as a Service)
  proveedor: Supabase
  db: PostgreSQL (vía Supabase)
  auth: Supabase Auth (email + contraseña + verificación por correo)
  storage: Supabase Storage (PDFs, imágenes)
  sdk: "@supabase/supabase-js" vía CDN ESM

hosting:
  proveedor: Vercel o Netlify
  tipo: estático (sin SSR, sin build step, sin bundler)
  ci_cd: automático desde GitHub push a main

control_versiones: Git + GitHub

herramientas_desarrollo:
  editor: Visual Studio Code
  node_uso: SOLO herramientas locales (no es backend)
```

**REGLA ABSOLUTA:** Nunca sugerir frameworks JS. Nunca sugerir bundlers (webpack, vite, parcel). Nunca sugerir TypeScript. El código debe funcionar directamente en el navegador sin proceso de build.

---

## [SUPABASE] INICIALIZACIÓN Y CLIENTE

```javascript
// ARCHIVO: assets/js/supabase-client.js
// ÚNICO lugar donde se inicializa Supabase. TODOS los módulos importan desde aquí.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Estas constantes son PÚBLICAS por diseño (anon key). La seguridad la da RLS.
const SUPABASE_URL     = 'TU_SUPABASE_URL';      // https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY'; // eyJhbGci...

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Importación en cualquier otro archivo JS:**
```javascript
import { supabase } from '/assets/js/supabase-client.js';
```

---

## [ROLES] SISTEMA DE ACCESO

```yaml
roles_autenticados:
  - id: admin
    descripcion: Control total. Gestiona usuarios, contenido y configuración.
    valor_db: 'admin'
  - id: personal
    descripcion: Empleados/docentes. Publican y editan contenido.
    valor_db: 'personal'
  - id: estudiante
    descripcion: Usuarios registrados. Solo lectura extendida y descarga de docs.
    valor_db: 'estudiante'

estado_publico:
  id: visitante
  descripcion: No autenticado. Lectura de contenido público solamente.
  implementacion: ausencia de sesión activa (no existe en DB)

jerarquia_numerica:
  estudiante: 1
  personal: 2
  admin: 3

registro:
  tipo: libre (autoregistro)
  verificacion: email obligatorio
  rol_asignado_automaticamente: 'estudiante'
  cambio_de_rol: solo el admin puede cambiarlo desde el panel

campo_db: tabla 'perfiles', columna 'rol' TEXT CHECK IN ('estudiante','personal','admin')
```

---

## [DB] ESQUEMA COMPLETO — PostgreSQL / Supabase

### Ejecutar en orden en Supabase SQL Editor:

#### PASO 1: Tablas (`01_schema.sql`)

```sql
-- TABLA: perfiles (extiende auth.users)
CREATE TABLE public.perfiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  email           TEXT NOT NULL,
  rol             TEXT NOT NULL DEFAULT 'estudiante'
                  CHECK (rol IN ('estudiante', 'personal', 'admin')),
  avatar_url      TEXT,
  activo          BOOLEAN DEFAULT true,
  creado_en       TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: wiki_categorias
CREATE TABLE public.wiki_categorias (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  icono       TEXT DEFAULT '📄',
  orden       INTEGER DEFAULT 0,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: wiki_articulos
CREATE TABLE public.wiki_articulos (
  id             SERIAL PRIMARY KEY,
  categoria_id   INTEGER NOT NULL REFERENCES wiki_categorias(id) ON DELETE CASCADE,
  titulo         TEXT NOT NULL,
  contenido      TEXT NOT NULL,
  autor_id       UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado      BOOLEAN DEFAULT false,
  vistas         INTEGER DEFAULT 0,
  creado_en      TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: faq_categorias
CREATE TABLE public.faq_categorias (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  icono  TEXT DEFAULT '❓',
  orden  INTEGER DEFAULT 0
);

-- TABLA: faq_preguntas
CREATE TABLE public.faq_preguntas (
  id           SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES faq_categorias(id) ON DELETE CASCADE,
  pregunta     TEXT NOT NULL,
  respuesta    TEXT NOT NULL,
  autor_id     UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado    BOOLEAN DEFAULT true,
  vistas       INTEGER DEFAULT 0,
  orden        INTEGER DEFAULT 0,
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: noticias
CREATE TABLE public.noticias (
  id           SERIAL PRIMARY KEY,
  titulo       TEXT NOT NULL,
  resumen      TEXT,
  contenido    TEXT NOT NULL,
  portada_url  TEXT,
  categoria    TEXT DEFAULT 'Noticia'
               CHECK (categoria IN ('Noticia','Anuncio','Taller','Curso','Evento')),
  autor_id     UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado    BOOLEAN DEFAULT false,
  destacado    BOOLEAN DEFAULT false,
  publicado_en TIMESTAMPTZ DEFAULT NOW(),
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: documentos
CREATE TABLE public.documentos (
  id            SERIAL PRIMARY KEY,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  archivo_url   TEXT NOT NULL,
  categoria     TEXT NOT NULL,
  carrera       TEXT,
  acceso_minimo TEXT DEFAULT 'estudiante'
                CHECK (acceso_minimo IN ('publico','estudiante','personal','admin')),
  subido_por    UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_en     TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: calendario_eventos
CREATE TABLE public.calendario_eventos (
  id           SERIAL PRIMARY KEY,
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE,
  tipo         TEXT DEFAULT 'General'
               CHECK (tipo IN ('Inscripción','Clases','Examen','Graduación','Feriado','General')),
  color        TEXT DEFAULT '#022A6F',
  creado_por   UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: configuracion_sitio (clave-valor)
CREATE TABLE public.configuracion_sitio (
  clave          TEXT PRIMARY KEY,
  valor          TEXT,
  descripcion    TEXT,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.configuracion_sitio (clave, valor, descripcion) VALUES
  ('instagram_url',    'https://www.instagram.com/unexca',     'URL de Instagram'),
  ('whatsapp_url',     'https://wa.me/584120000000',            'Enlace de WhatsApp'),
  ('telegram_url',     'https://t.me/unexca',                   'Canal de Telegram'),
  ('nombre_sitio',     'UNEXCA — Portal Institucional',         'Nombre del sitio'),
  ('descripcion_sitio','Portal oficial de la Universidad Nacional Experimental de la Gran Caracas', 'SEO descripción');
```

#### PASO 2: Row Level Security (`02_rls.sql`)

```sql
-- Activar RLS en todas las tablas
ALTER TABLE public.perfiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categorias     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articulos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categorias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_preguntas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_eventos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sitio ENABLE ROW LEVEL SECURITY;

-- Helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_rol_usuario()
RETURNS TEXT AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PERFILES
CREATE POLICY "perfiles_ver"        ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "perfiles_propio"     ON public.perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "perfiles_admin"      ON public.perfiles FOR ALL    USING (get_rol_usuario() = 'admin');

-- WIKI (lectura pública de publicados; escritura para personal+)
CREATE POLICY "wiki_art_leer"       ON public.wiki_articulos FOR SELECT USING (publicado = true);
CREATE POLICY "wiki_art_personal_ver" ON public.wiki_articulos FOR SELECT USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_insert"     ON public.wiki_articulos FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_update"     ON public.wiki_articulos FOR UPDATE USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_delete"     ON public.wiki_articulos FOR DELETE USING (get_rol_usuario() = 'admin');
CREATE POLICY "wiki_cat_leer"       ON public.wiki_categorias FOR SELECT USING (true);
CREATE POLICY "wiki_cat_escribir"   ON public.wiki_categorias FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- FAQ
CREATE POLICY "faq_preg_leer"       ON public.faq_preguntas FOR SELECT USING (publicado = true);
CREATE POLICY "faq_preg_personal"   ON public.faq_preguntas FOR ALL USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "faq_cat_leer"        ON public.faq_categorias FOR SELECT USING (true);
CREATE POLICY "faq_cat_escribir"    ON public.faq_categorias FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- NOTICIAS
CREATE POLICY "noticias_leer"       ON public.noticias FOR SELECT USING (publicado = true);
CREATE POLICY "noticias_personal"   ON public.noticias FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- DOCUMENTOS
CREATE POLICY "docs_publicos"       ON public.documentos FOR SELECT USING (acceso_minimo = 'publico');
CREATE POLICY "docs_estudiante"     ON public.documentos FOR SELECT USING (
  acceso_minimo = 'estudiante' AND auth.uid() IS NOT NULL
  AND get_rol_usuario() IN ('estudiante','personal','admin')
);
CREATE POLICY "docs_personal"       ON public.documentos FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- CALENDARIO
CREATE POLICY "cal_leer"            ON public.calendario_eventos FOR SELECT USING (true);
CREATE POLICY "cal_personal"        ON public.calendario_eventos FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- CONFIGURACION
CREATE POLICY "config_leer"         ON public.configuracion_sitio FOR SELECT USING (true);
CREATE POLICY "config_admin"        ON public.configuracion_sitio FOR ALL USING (get_rol_usuario() = 'admin');
```

#### PASO 3: Triggers (`03_triggers.sql`)

```sql
-- Auto-crear perfil al registrarse un nuevo usuario
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_completo, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
    NEW.email,
    'estudiante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_nuevo_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();

-- Auto-actualizar 'actualizado_en'
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ts_perfiles  BEFORE UPDATE ON public.perfiles       FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
CREATE TRIGGER ts_wiki      BEFORE UPDATE ON public.wiki_articulos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
```

#### PASO 4: Datos iniciales (`04_seed.sql`)

```sql
INSERT INTO public.wiki_categorias (nombre, descripcion, icono, orden) VALUES
  ('La Universidad',      'Historia, misión, visión y valores',              '🏛', 1),
  ('Carreras y Programas','Pregrado, postgrado e introductorio',             '📚', 2),
  ('Inscripciones',       'Proceso, requisitos y fechas',                    '📝', 3),
  ('Sedes',               'Ubicación y contacto de las sedes de UNEXCA',    '📍', 4),
  ('Reglamentos',         'Normativas y reglamentos institucionales',        '⚖️', 5);

INSERT INTO public.faq_categorias (nombre, icono, orden) VALUES
  ('Inscripción',         '📝', 1),
  ('Pagos y Aranceles',   '💰', 2),
  ('Documentos',          '📋', 3),
  ('Vida Estudiantil',    '🎓', 4);

INSERT INTO public.faq_preguntas (categoria_id, pregunta, respuesta, publicado) VALUES
  (1,'¿Cuáles son los requisitos para inscribirse?',
   'Cédula vigente, título de bachiller certificado, notas certificadas y 2 fotos carnet.',true),
  (1,'¿Cuándo son los períodos de inscripción?',
   'Se publican en el calendario académico. Generalmente enero-febrero y julio-agosto.',true),
  (3,'¿Qué documentos llevar el día de inscripción?',
   'Original y copia de: cédula, título de bachiller, notas certificadas y constancia de salud.',true);

INSERT INTO public.calendario_eventos (titulo, descripcion, fecha_inicio, fecha_fin, tipo, color) VALUES
  ('Inicio de Inscripciones','Apertura del período','2025-07-15','2025-07-31','Inscripción','#022A6F'),
  ('Inicio de Clases',       'Comienzo del semestre','2025-08-18',NULL,       'Clases',     '#1A7A3C'),
  ('Exámenes Finales',       'Semana de exámenes',   '2025-11-17','2025-11-28','Examen',    '#C17800');
```

---

## [FILES] ESTRUCTURA COMPLETA DE ARCHIVOS

```
unexca-web/
├── assets/
│   ├── css/
│   │   ├── base.css              [variables CSS, reset, tipografía]
│   │   ├── layout.css            [navbar, footer, contenedor global]
│   │   └── components.css        [botones, tarjetas, formularios, acordeón, badges]
│   ├── js/
│   │   ├── supabase-client.js    [init único de Supabase — importar desde aquí SIEMPRE]
│   │   ├── auth.js               [getUsuarioActual, verificarRol, cerrarSesion, requiereAutenticacion]
│   │   └── utils.js              [formatearFecha, truncar, getParamURL, mostrarError, mostrarCarga, sanitizar]
│   └── img/
│       ├── logo.png              [logo oficial UNEXCA — fondo blanco]
│       ├── logo-white.png        [logo UNEXCA — versión blanca para fondos oscuros]
│       └── favicon.ico
├── components/
│   ├── navbar.html               [nav reutilizable — cargado via fetch() en cada página]
│   └── footer.html               [footer reutilizable — cargado via fetch()]
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   ├── registro.html
│   │   ├── recuperar-contrasena.html
│   │   └── auth.js
│   ├── wiki/
│   │   ├── index.html            [listado de categorías]
│   │   ├── categoria.html        [artículos de una categoría — ?id=N]
│   │   ├── articulo.html         [artículo individual — ?id=N]
│   │   └── wiki.js
│   ├── faq/
│   │   ├── index.html
│   │   └── faq.js
│   ├── noticias/
│   │   ├── index.html
│   │   ├── noticia.html          [noticia individual — ?id=N]
│   │   └── noticias.js
│   ├── documentos/
│   │   ├── index.html
│   │   └── documentos.js
│   └── calendario/
│       ├── index.html
│       └── calendario.js
├── admin/
│   ├── index.html                [dashboard — stats generales]
│   ├── usuarios.html             [CRUD usuarios]
│   ├── wiki-editor.html          [CRUD wiki]
│   ├── faq-editor.html           [CRUD faq]
│   ├── noticias-editor.html      [CRUD noticias + subida de imagen]
│   ├── documentos-editor.html    [CRUD documentos + subida PDF]
│   ├── calendario-editor.html    [CRUD eventos]
│   ├── configuracion.html        [redes sociales, ajustes]
│   └── admin.js                  [guard de rol: requiereAutenticacion('admin')]
├── supabase/
│   ├── 01_schema.sql
│   ├── 02_rls.sql
│   ├── 03_triggers.sql
│   └── 04_seed.sql
├── index.html                    [página de inicio / landing]
├── 404.html
├── .env                          [NUNCA subir a Git]
├── .gitignore
├── vercel.json
└── README.md
```

---

## [CSS] SISTEMA DE DISEÑO COMPLETO

### Variables (`assets/css/base.css` — bloque `:root`)

```css
:root {
  /* PALETA OFICIAL (extraída del logo UNEXCA) */
  --color-primario:       #022A6F;   /* Azul universitario principal */
  --color-primario-dark:  #000C4D;   /* Azul muy oscuro — navbar, encabezados */
  --color-primario-light: #48597E;   /* Azul medio — texto secundario */
  --color-texto-base:     #161823;   /* Casi negro — texto principal */

  /* NEUTROS */
  --color-blanco:         #FFFFFF;
  --color-fondo:          #F5F7FA;   /* Fondo de páginas */
  --color-fondo-card:     #FFFFFF;
  --color-borde:          #D1D9E6;
  --color-texto-suave:    #48597E;
  --color-texto-muted:    #8A9BC0;

  /* ESTADOS */
  --color-exito:          #1A7A3C;
  --color-advertencia:    #C17800;
  --color-error:          #C0392B;

  /* ROLES */
  --color-rol-admin:      #022A6F;
  --color-rol-personal:   #C17800;
  --color-rol-estudiante: #1A7A3C;

  /* TIPOGRAFÍA */
  --fuente: 'Inter', 'Segoe UI', Arial, sans-serif;
  --texto-xs:   0.75rem;
  --texto-sm:   0.875rem;
  --texto-base: 1rem;
  --texto-lg:   1.125rem;
  --texto-xl:   1.25rem;
  --texto-2xl:  1.5rem;
  --texto-3xl:  1.875rem;
  --texto-4xl:  2.25rem;

  /* ESPACIADO (base 4px) */
  --s1:  4px;  --s2:  8px;  --s3:  12px; --s4:  16px;
  --s5:  20px; --s6:  24px; --s8:  32px; --s10: 40px;
  --s12: 48px; --s16: 64px;

  /* FORMA */
  --radio-sm:   4px;
  --radio-md:   8px;
  --radio-lg:   12px;
  --radio-full: 9999px;

  /* SOMBRAS */
  --sombra-sm: 0 1px 3px rgba(2,42,111,0.08);
  --sombra-md: 0 4px 12px rgba(2,42,111,0.12);
  --sombra-lg: 0 8px 24px rgba(2,42,111,0.16);

  /* TRANSICIONES */
  --t: 200ms ease;
  --t-lenta: 350ms ease;

  /* LAYOUT */
  --ancho-max:  1200px;
  --alto-navbar: 64px;
}
```

### Breakpoints (mobile-first)

```css
/* BASE = móvil (<640px) */
@media (min-width: 640px)  { /* sm  — tableta pequeña  */ }
@media (min-width: 768px)  { /* md  — tableta          */ }
@media (min-width: 1024px) { /* lg  — desktop pequeño  */ }
@media (min-width: 1280px) { /* xl  — desktop grande   */ }
```

### Clases CSS clave

```yaml
layout:
  .container: "max-width:var(--ancho-max); margin:0 auto; padding:0 var(--s4)"
  .grid-tarjetas: "display:grid; gap:var(--s6); 1col → 2col@sm → 3col@lg"

botones:
  .btn: base
  .btn-primario: fondo #022A6F, texto blanco
  .btn-secundario: borde #022A6F, fondo transparente
  .btn-peligro: fondo #C0392B

tarjetas:
  .card: "bg white, border-radius var(--radio-lg), border 1px var(--color-borde), sombra-sm"
  .card:hover: "sombra-md, translateY(-2px)"

formularios:
  .form-grupo: wrapper label+input
  .form-input: "border 1.5px var(--color-borde), focus→border #022A6F"

alertas:
  .alerta-error:   fondo #fef2f2, border-left rojo
  .alerta-exito:   fondo #f0fdf4, border-left verde
  .alerta-info:    fondo #eff6ff, border-left azul

badges:
  .badge-admin:      fondo #000C4D, texto blanco
  .badge-personal:   fondo #C17800, texto blanco
  .badge-estudiante: fondo #1A7A3C, texto blanco

acordeon:
  .acordeon-item: wrapper
  .acordeon-header: botón clickeable
  .acordeon-contenido: "max-height:0 → 500px cuando .abierto"
```

---

## [JS] ARCHIVOS BASE COMPLETOS

### `assets/js/auth.js`

```javascript
import { supabase } from './supabase-client.js';

export async function getUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await supabase
    .from('perfiles').select('*').eq('id', user.id).single();
  return { ...user, perfil };
}

export async function verificarRol(rolMinimo) {
  const usuario = await getUsuarioActual();
  if (!usuario) return false;
  const j = { estudiante: 1, personal: 2, admin: 3 };
  return j[usuario.perfil?.rol] >= j[rolMinimo];
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

export async function requiereAutenticacion(rolMinimo = 'estudiante') {
  const ok = await verificarRol(rolMinimo);
  if (!ok) {
    window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

export async function actualizarNavbar() {
  const usuario = await getUsuarioActual();
  const btnLogin = document.getElementById('btn-login-nav');
  const divUsuario = document.getElementById('navbar-usuario');
  if (!usuario) { btnLogin?.style && (btnLogin.style.display = 'block'); return; }
  if (btnLogin) btnLogin.style.display = 'none';
  if (divUsuario) {
    divUsuario.style.display = 'flex';
    const spanNombre = document.getElementById('navbar-nombre-usuario');
    if (spanNombre) spanNombre.textContent = usuario.perfil?.nombre_completo || usuario.email;
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) linkAdmin.style.display = usuario.perfil?.rol === 'admin' ? 'inline' : 'none';
  }
  document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);
}
```

### `assets/js/utils.js`

```javascript
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  return new Date(fechaISO).toLocaleDateString('es-VE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function truncar(texto, max = 150) {
  if (!texto || texto.length <= max) return texto || '';
  return texto.slice(0, max).trim() + '...';
}

export function getParamURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

export function mostrarError(mensaje, idContenedor = 'alerta-error') {
  const el = document.getElementById(idContenedor);
  if (el) { el.textContent = mensaje; el.style.display = 'block'; }
}

export function ocultarError(idContenedor = 'alerta-error') {
  const el = document.getElementById(idContenedor);
  if (el) el.style.display = 'none';
}

export function mostrarCarga(mostrar) {
  const el = document.getElementById('spinner');
  if (el) el.style.display = mostrar ? 'flex' : 'none';
}

export function sanitizar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

export async function incluirComponente(selector, ruta) {
  try {
    const res = await fetch(ruta);
    const html = await res.text();
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  } catch (e) { console.error('Error cargando componente:', ruta, e); }
}

export function setAnioActual(idElemento = 'anio-actual') {
  const el = document.getElementById(idElemento);
  if (el) el.textContent = new Date().getFullYear();
}
```

---

## [PATRON] ESTRUCTURA ESTÁNDAR DE CADA PÁGINA

### HTML (plantilla base obligatoria)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[descripción para SEO]">
  <title>[Título de la página] — UNEXCA</title>
  <link rel="icon" href="/assets/img/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <!-- CSS específico del módulo si aplica -->
</head>
<body>

  <div id="spinner" class="spinner" aria-hidden="true"></div>
  <div id="navbar-placeholder"></div>

  <main class="[nombre-pagina]-pagina">
    <div class="container">
      <div id="alerta-error" class="alerta alerta-error" style="display:none" role="alert"></div>
      <!-- CONTENIDO DE LA PÁGINA -->
    </div>
  </main>

  <div id="footer-placeholder"></div>

  <script type="module" src="[ruta-al-js-del-modulo].js"></script>
</body>
</html>
```

### JS (patrón base obligatorio)

```javascript
// [modulo].js — Patrón obligatorio para todos los módulos

import { supabase }                                 from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar }       from '/assets/js/auth.js';
import { formatearFecha, mostrarCarga,
         incluirComponente, setAnioActual,
         getParamURL, sanitizar }                   from '/assets/js/utils.js';

async function init() {
  // 1. Cargar componentes
  await incluirComponente('#navbar-placeholder',  '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');

  // 2. Actualizar estado de navbar (login/logout)
  await actualizarNavbar();

  // 3. Año actual en footer
  setAnioActual();

  // 4. Cargar contenido
  mostrarCarga(true);
  await cargarContenido();
  mostrarCarga(false);
}

async function cargarContenido() {
  // Lógica específica del módulo
}

// Lanzar
init().catch(console.error);
```

---

## [MODULOS] ESPECIFICACIONES DE CADA MÓDULO

### INDEX (Página de inicio)

```yaml
archivo: index.html + index.js
url: /
proposito: Landing page. Primera impresión del portal.
secciones:
  - hero: título, logo, subtítulo y CTA (Ver Wiki / Ver FAQ)
  - noticias_destacadas: últimas 3 noticias con destacado=true
  - eventos_proximos: próximos 3 eventos del calendario
  - acceso_rapido: grid de iconos enlazando a cada módulo
  - redes_sociales: botones cargados desde configuracion_sitio
queries_supabase:
  - noticias: SELECT id,titulo,resumen,portada_url,categoria,publicado_en FROM noticias WHERE publicado=true AND destacado=true ORDER BY publicado_en DESC LIMIT 3
  - eventos: SELECT titulo,fecha_inicio,tipo,color FROM calendario_eventos WHERE fecha_inicio >= NOW() ORDER BY fecha_inicio ASC LIMIT 3
  - redes: SELECT clave,valor FROM configuracion_sitio WHERE clave IN ('instagram_url','whatsapp_url','telegram_url')
```

### WIKI

```yaml
archivos: [wiki/index.html, wiki/categoria.html, wiki/articulo.html, wiki/wiki.js]
rutas:
  - /pages/wiki/                     → listado categorías
  - /pages/wiki/categoria.html?id=N  → artículos de categoría N
  - /pages/wiki/articulo.html?id=N   → artículo N completo

queries:
  index:
    - SELECT id,nombre,descripcion,icono,orden FROM wiki_categorias ORDER BY orden
    - (en join): contar artículos publicados por categoría

  categoria:
    - param: id (categoria_id)
    - SELECT id,titulo,actualizado_en FROM wiki_articulos WHERE categoria_id=? AND publicado=true ORDER BY creado_en DESC

  articulo:
    - param: id
    - SELECT wa.*,wc.nombre AS categoria_nombre,p.nombre_completo AS autor
      FROM wiki_articulos wa
      LEFT JOIN wiki_categorias wc ON wa.categoria_id=wc.id
      LEFT JOIN perfiles p ON wa.autor_id=p.id
      WHERE wa.id=? AND wa.publicado=true
    - UPDATE wiki_articulos SET vistas=vistas+1 WHERE id=?

acciones_por_rol:
  visitante:  leer artículos publicados
  estudiante: idem
  personal:   + ver borradores, crear/editar artículos
  admin:      + eliminar artículos y categorías

botones_condicionales:
  - "Editar artículo" — visible si rol IN (personal, admin)
  - "Nuevo artículo"  — visible si rol IN (personal, admin)
```

### FAQ

```yaml
archivos: [faq/index.html, faq/faq.js]
ruta: /pages/faq/

patron_ui: acordeón agrupado por categoría
busqueda: filtro en tiempo real por texto (sin petición a DB — filtra DOM)

query:
  - SELECT fc.*, array_agg(fp.* ORDER BY fp.orden) AS preguntas
    FROM faq_categorias fc
    LEFT JOIN faq_preguntas fp ON fp.categoria_id=fc.id AND fp.publicado=true
    GROUP BY fc.id ORDER BY fc.orden
  # Alternativa simple (2 queries):
  - SELECT * FROM faq_categorias ORDER BY orden
  - SELECT * FROM faq_preguntas WHERE publicado=true ORDER BY categoria_id, orden

acciones_por_rol:
  personal/admin: ver botones "Editar" en cada pregunta → redirige a /admin/faq-editor.html?id=N
```

### NOTICIAS

```yaml
archivos: [noticias/index.html, noticias/noticia.html, noticias/noticias.js]
rutas:
  - /pages/noticias/
  - /pages/noticias/noticia.html?id=N

queries:
  index:
    - SELECT id,titulo,resumen,portada_url,categoria,publicado_en FROM noticias
      WHERE publicado=true ORDER BY publicado_en DESC LIMIT 12
    - filtro_por_categoria: agregar .eq('categoria', valor) si param ?cat= presente

  noticia:
    - SELECT n.*,p.nombre_completo AS autor FROM noticias n
      LEFT JOIN perfiles p ON n.autor_id=p.id
      WHERE n.id=? AND n.publicado=true

ui_index:
  - grid responsive de tarjetas (.grid-tarjetas)
  - cada tarjeta: imagen portada, badge categoría, título, resumen truncado, fecha
  - filtros por categoría: botones pill sobre el grid (Todos | Noticia | Anuncio | Taller | Curso | Evento)
```

### DOCUMENTOS

```yaml
archivos: [documentos/index.html, documentos/documentos.js]
ruta: /pages/documentos/
acceso_minimo: estudiante (requiereAutenticacion('estudiante') al inicio del JS)

query:
  - SELECT * FROM documentos ORDER BY categoria, creado_en DESC

ui: agrupado por categoría, cada item: icono PDF, título, descripción, botón descargar (target="_blank")

storage_bucket: 'documentos' (configurar en Supabase Storage como bucket público o con signed URLs)
```

### CALENDARIO

```yaml
archivos: [calendario/index.html, calendario/calendario.js]
ruta: /pages/calendario/

query:
  - SELECT * FROM calendario_eventos ORDER BY fecha_inicio ASC

ui:
  - vista_lista: eventos agrupados por mes, con línea de color lateral (ev.color)
  - sección "Próximos eventos": filtrar fecha_inicio >= hoy
  - botón opcional: "Descargar PDF" (puede ser window.print() con estilos de impresión)
```

### REDES SOCIALES

```yaml
implementacion: SOLO botones de enlace (no widget/feed live de Instagram)
ubicacion: footer y opcionalmente sección en index.html
fuente_datos: tabla configuracion_sitio (claves: instagram_url, whatsapp_url, telegram_url)
abrir_en: target="_blank" rel="noopener noreferrer"
iconos: usar emojis (📷 💬 ✈️) o SVG simples; NO depender de librerías de iconos externas
```

### AUTH

```yaml
archivos: [auth/login.html, auth/registro.html, auth/recuperar-contrasena.html, auth/auth.js]

flujo_registro:
  1. Usuario llena: nombre_completo, email, contraseña (mínimo 6 chars)
  2. supabase.auth.signUp({ email, password, options:{ data:{ nombre_completo } } })
  3. Supabase envía email verificación automáticamente
  4. Trigger crea perfil con rol='estudiante'
  5. Mostrar: "Revisa tu correo para verificar tu cuenta"

flujo_login:
  1. supabase.auth.signInWithPassword({ email, password })
  2. Si ok → redirigir a redirect param o a /index.html
  3. Si error → mostrar mensaje en español

flujo_recuperar:
  1. supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://unexca.vercel.app/pages/auth/nueva-contrasena.html' })
  2. Mostrar: "Se envió un enlace a tu correo"

errores_comunes_supabase:
  'Invalid login credentials': 'Correo o contraseña incorrectos.'
  'Email not confirmed': 'Verifica tu correo antes de iniciar sesión.'
  'User already registered': 'Ya existe una cuenta con este correo.'
  'Password should be at least 6 characters': 'La contraseña debe tener mínimo 6 caracteres.'
```

### PANEL ADMIN

```yaml
archivos: [admin/*.html, admin/admin.js]
ruta: /admin/
guard: await requiereAutenticacion('admin') — primera línea de admin.js

paginas:
  index.html:
    - stats: count(perfiles), count(wiki_articulos WHERE publicado), count(faq_preguntas WHERE publicado), count(noticias WHERE publicado)
    - links rápidos a cada sección del admin

  usuarios.html:
    - tabla: nombre_completo, email, rol (select editable), activo (toggle), fecha registro
    - acción cambiar rol: UPDATE perfiles SET rol=? WHERE id=?
    - acción desactivar: UPDATE perfiles SET activo=false WHERE id=?

  wiki-editor.html:
    - lista de todos los artículos (publicados y borradores)
    - formulario crear/editar: categoria_id (select), titulo, contenido (textarea), publicado (checkbox)
    - acción eliminar con confirm()

  faq-editor.html:
    - lista de preguntas por categoría
    - formulario: categoria_id, pregunta, respuesta, orden, publicado

  noticias-editor.html:
    - lista de noticias
    - formulario: titulo, resumen, contenido, categoria, publicado, destacado
    - subida imagen portada: supabase.storage.from('noticias').upload(...)

  documentos-editor.html:
    - lista de documentos
    - formulario: titulo, descripcion, categoria, carrera, acceso_minimo
    - subida PDF: supabase.storage.from('documentos').upload(...)

  calendario-editor.html:
    - lista de eventos
    - formulario: titulo, descripcion, fecha_inicio, fecha_fin, tipo, color (input type="color")

  configuracion.html:
    - campos para cada clave de configuracion_sitio (instagram_url, whatsapp_url, telegram_url)
    - guardar: UPDATE configuracion_sitio SET valor=? WHERE clave=?
```

---

## [COMPONENTES] NAVBAR Y FOOTER

### Navbar HTML (components/navbar.html)

```html
<nav class="navbar" id="navbar">
  <div class="container navbar-contenido">
    <a href="/index.html" class="navbar-logo">
      <img src="/assets/img/logo-white.png" alt="UNEXCA" height="40">
    </a>
    <ul class="navbar-menu" id="navbar-menu" role="navigation">
      <li><a href="/pages/wiki/"       class="nav-link">Wiki</a></li>
      <li><a href="/pages/faq/"        class="nav-link">FAQ</a></li>
      <li><a href="/pages/noticias/"   class="nav-link">Noticias</a></li>
      <li><a href="/pages/documentos/" class="nav-link">Documentos</a></li>
      <li><a href="/pages/calendario/" class="nav-link">Calendario</a></li>
    </ul>
    <div class="navbar-acciones">
      <a href="/pages/auth/login.html" class="btn btn-secundario btn-sm" id="btn-login-nav">
        Iniciar Sesión
      </a>
      <div id="navbar-usuario" style="display:none" class="navbar-usuario">
        <span id="navbar-nombre-usuario" class="navbar-saludo"></span>
        <a href="/admin/" id="link-admin" class="btn btn-sm btn-primario" style="display:none">
          Admin
        </a>
        <button id="btn-logout" class="btn btn-sm btn-secundario">Salir</button>
      </div>
    </div>
    <button class="navbar-hamburguesa" id="btn-hamburguesa" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
```

### Footer HTML (components/footer.html)

```html
<footer class="footer">
  <div class="container footer-grid">
    <div class="footer-marca">
      <img src="/assets/img/logo-white.png" alt="UNEXCA" height="50">
      <p>Universidad Nacional Experimental<br>de la Gran Caracas</p>
    </div>
    <div class="footer-redes">
      <h4>Síguenos</h4>
      <div class="redes-botones" id="redes-botones">
        <!-- Cargado dinámicamente desde configuracion_sitio -->
      </div>
    </div>
    <div class="footer-links">
      <h4>Acceso Rápido</h4>
      <ul>
        <li><a href="/pages/wiki/">Wiki Institucional</a></li>
        <li><a href="/pages/faq/">Preguntas Frecuentes</a></li>
        <li><a href="/pages/calendario/">Calendario</a></li>
        <li><a href="/pages/documentos/">Documentos</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-copyright">
    <div class="container">
      <p>© <span id="anio-actual"></span> UNEXCA — Todos los derechos reservados</p>
    </div>
  </div>
</footer>
```

### Cargar redes sociales en footer (añadir al final del JS de cada página)

```javascript
async function cargarRedesSociales() {
  const { data } = await supabase
    .from('configuracion_sitio')
    .select('clave, valor')
    .in('clave', ['instagram_url', 'whatsapp_url', 'telegram_url']);

  const mapa = { instagram_url: '📷 Instagram', whatsapp_url: '💬 WhatsApp', telegram_url: '✈️ Telegram' };
  const contenedor = document.getElementById('redes-botones');
  if (contenedor && data) {
    contenedor.innerHTML = data
      .filter(r => r.valor)
      .map(r => `<a href="${r.valor}" class="btn-red-social" target="_blank" rel="noopener noreferrer">${mapa[r.clave]}</a>`)
      .join('');
  }
}
```

---

## [SUPABASE-CRUD] PATRONES DE OPERACIONES

```javascript
// ── LEER ──────────────────────────────────────────────
const { data, error } = await supabase
  .from('tabla')
  .select('col1, col2, tabla_relacionada(col)')
  .eq('campo', valor)
  .order('columna', { ascending: false })
  .limit(N);

// ── LEER UNO ──────────────────────────────────────────
const { data, error } = await supabase
  .from('tabla').select('*').eq('id', id).single();

// ── CREAR ─────────────────────────────────────────────
const { data, error } = await supabase
  .from('tabla').insert({ col1: val1, col2: val2 }).select().single();

// ── ACTUALIZAR ────────────────────────────────────────
const { error } = await supabase
  .from('tabla').update({ col: nuevoValor }).eq('id', id);

// ── ELIMINAR ──────────────────────────────────────────
const { error } = await supabase
  .from('tabla').delete().eq('id', id);

// ── SUBIR ARCHIVO ─────────────────────────────────────
async function subirArchivo(archivo, bucket, carpeta) {
  const nombre = `${Date.now()}-${archivo.name.replace(/\s/g, '_')}`;
  const { data, error } = await supabase.storage
    .from(bucket).upload(`${carpeta}/${nombre}`, archivo);
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
}

// ── CONTAR ────────────────────────────────────────────
const { count } = await supabase
  .from('tabla').select('*', { count: 'exact', head: true }).eq('campo', valor);
```

---

## [REGLAS] CONVENCIONES OBLIGATORIAS

### Nomenclatura

```yaml
archivos_html:     kebab-case        (wiki-articulo.html)
archivos_css:      kebab-case        (base-styles.css)
archivos_js:       camelCase         (wikiLoader.js)
variables_js:      camelCase         (let nombreUsuario)
funciones_js:      camelCase + verbo (getArticulos, crearUsuario)
clases_css:        kebab-case        (.card-noticia, .btn-primario)
tablas_sql:        snake_case        (wiki_articulos)
columnas_sql:      snake_case        (creado_en, autor_id)
ids_html:          kebab-case        (id="noticias-grid")
ramas_git:         tipo/descripcion  (feat/modulo-wiki)
commits_git:       tipo: descripcion (feat: agregar módulo FAQ)
```

### Tipos de commit

```
feat:     nueva funcionalidad
fix:      corrección de bug
style:    cambios CSS/diseño sin afectar lógica
db:       cambios en schema o datos
docs:     documentación
refactor: mejora de código sin cambiar comportamiento
chore:    mantenimiento
```

### Reglas de código irrompibles

```
1. NUNCA frameworks JS (React, Vue, Angular, jQuery)
2. NUNCA bundlers (webpack, vite, rollup, parcel)
3. NUNCA TypeScript
4. SIEMPRE type="module" en <script>
5. SIEMPRE importar supabase desde /assets/js/supabase-client.js
6. SIEMPRE manejar el caso error en cada query Supabase
7. SIEMPRE manejar el caso de 0 resultados (mostrar mensaje, no pantalla vacía)
8. SIEMPRE verificar rol antes de renderizar botones de edición
9. SIEMPRE var(--...) en CSS, nunca hex hardcodeado
10. SIEMPRE mobile-first en CSS
11. NUNCA SERVICE_ROLE_KEY en código frontend
12. NUNCA subir .env a Git
```

---

## [CONFIG] ARCHIVOS DE CONFIGURACIÓN

### `.gitignore`

```gitignore
.env
.env.local
.env.*.local
.DS_Store
Thumbs.db
node_modules/
npm-debug.log*
.vscode/settings.json
.idea/
.vercel/
.netlify/
```

### `vercel.json`

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1.html" }
  ]
}
```

### `.env` (plantilla — nunca subir)

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

> **Nota:** Para sitios estáticos sin build step, las credenciales van hardcodeadas en `supabase-client.js`. La ANON_KEY es pública por diseño. Esto es correcto y seguro gracias a RLS.

---

## [BUILD-ORDER] ORDEN DE CONSTRUCCIÓN CON DEPENDENCIAS

```
FASE 1 — Base de datos (prerequisito de todo lo demás)
  ✦ Crear proyecto en supabase.com
  ✦ Ejecutar 01_schema.sql en SQL Editor
  ✦ Ejecutar 02_rls.sql
  ✦ Ejecutar 03_triggers.sql
  ✦ Ejecutar 04_seed.sql
  ✦ Crear buckets en Storage: 'noticias' (imágenes) y 'documentos' (PDFs) — ambos públicos
  ✦ Copiar URL y ANON_KEY al supabase-client.js

FASE 2 — Repositorio y assets base (prerequisito del resto del frontend)
  ✦ Crear repositorio en GitHub
  ✦ Crear estructura de carpetas completa
  ✦ assets/css/base.css (con variables completas)
  ✦ assets/css/layout.css (navbar + footer + container)
  ✦ assets/css/components.css (todos los componentes)
  ✦ assets/js/supabase-client.js
  ✦ assets/js/auth.js
  ✦ assets/js/utils.js
  ✦ assets/img/ (logo.png, logo-white.png, favicon.ico)
  ✦ .gitignore, vercel.json, README.md

FASE 3 — Componentes globales (prerequisito del contenido)
  ✦ components/navbar.html
  ✦ components/footer.html
  ✦ Verificar que incluirComponente() funciona en una página de prueba

FASE 4 — Autenticación (prerequisito del panel admin y docs)
  ✦ pages/auth/login.html + auth.js (función login)
  ✦ pages/auth/registro.html (función registro)
  ✦ pages/auth/recuperar-contrasena.html
  ✦ Probar los 3 roles con cuentas reales

FASE 5 — Página de inicio
  ✦ index.html (hero + noticias destacadas + eventos próximos + redes)

FASE 6 — Módulos de contenido (se pueden hacer en paralelo)
  ✦ pages/wiki/ (index → categoria → articulo)
  ✦ pages/faq/ (acordeón con búsqueda)
  ✦ pages/noticias/ (listado + vista individual)
  ✦ pages/documentos/ (con guard de autenticación)
  ✦ pages/calendario/ (lista de eventos)

FASE 7 — Panel de administración
  ✦ admin/index.html (dashboard con stats)
  ✦ admin/wiki-editor.html
  ✦ admin/faq-editor.html
  ✦ admin/noticias-editor.html (con subida de imagen)
  ✦ admin/documentos-editor.html (con subida de PDF)
  ✦ admin/calendario-editor.html
  ✦ admin/usuarios.html
  ✦ admin/configuracion.html

FASE 8 — QA y despliegue
  ✦ Probar responsividad en móvil, tableta y desktop
  ✦ Probar todos los flujos con los 3 roles
  ✦ Conectar GitHub → Vercel/Netlify
  ✦ Verificar deploy en URL pública
  ✦ Probar desde dispositivo móvil real
```

---

## [STATUS] ESTADO ACTUAL

```yaml
completado:
  - documentacion_maestra: true
  - esquema_db_definido: true
  - paleta_colores_definida: true
  - stack_definido: true

pendiente:
  - supabase_proyecto_creado: false
  - sql_ejecutado: false
  - repositorio_github: false
  - carpetas_creadas: false
  - base_css: false
  - layout_css: false
  - components_css: false
  - supabase_client_js: false
  - auth_js: false
  - utils_js: false
  - navbar_html: false
  - footer_html: false
  - index_html: false
  - auth_login: false
  - auth_registro: false
  - wiki_completo: false
  - faq_completo: false
  - noticias_completo: false
  - documentos_completo: false
  - calendario_completo: false
  - admin_completo: false
  - deploy_vercel_netlify: false
```

---

## [PROMPT] INSTRUCCIÓN ESTÁNDAR PARA SOLICITUDES A IA

Usar esta estructura al pedir ayuda a cualquier IA sobre este proyecto:

```
Proyecto: Portal Web UNEXCA (Venezuela)
Stack: HTML5 + CSS3 + JavaScript ES6 vanilla + Supabase (PostgreSQL) + Vercel
Contexto completo en: UNEXCA_AI_CONTEXT.md (adjunto o ya leído)

Tarea: [describir exactamente qué construir]
Archivo objetivo: [ruta exacta del archivo]
Tabla(s) Supabase involucrada(s): [nombre de tablas]
Rol mínimo requerido: [visitante|estudiante|personal|admin]

Restricciones:
- Sin frameworks JS
- Sin bundlers ni TypeScript
- Usar variables CSS del sistema de diseño (--color-primario, etc.)
- Importar siempre desde /assets/js/supabase-client.js
- Texto de UI en español (es-VE)
- Mobile-first
```

---

*UNEXCA_AI_CONTEXT.md — v1.0 — Proyecto Sociotecnológico II*
*Actualizar este archivo ante cualquier cambio de arquitectura, schema o convenciones.*
