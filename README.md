# UNEXCA — Portal Web Institucional

Portal oficial de la Universidad Nacional Experimental de la Gran Caracas. Desarrollado como proyecto para la materia **Proyecto Sociotecnológico II** (3er semestre de Informática).

---

## 🚀 Stack Tecnológico

| Tecnología | Detalle |
|------------|---------|
| **Frontend** | HTML5 semántico + CSS3 puro (variables CSS, Flexbox, Grid) + JavaScript ES6 vanilla |
| **Backend** | Supabase (PostgreSQL, Autenticación, Storage) |
| **Hosting** | Vercel o Netlify (estático, sin build step) |
| **Sin frameworks JS, sin bundlers, sin TypeScript** | |

---

## 📁 Estructura del Proyecto

```
unexca-web/
├── assets/
│   ├── css/
│   │   ├── base.css              [variables CSS, reset, tipografía]
│   │   ├── layout.css            [navbar, footer, contenedor global]
│   │   └── components.css        [botones, tarjetas, formularios, acordeón, badges]
│   ├── js/
│   │   ├── supabase-client.js    [inicialización de Supabase]
│   │   ├── auth.js               [autenticación y control de roles]
│   │   └── utils.js              [utilidades generales]
│   └── img/                      [logo.png, logo-white.png, favicon.ico]
├── components/
│   ├── navbar.html               [barra de navegación reutilizable]
│   └── footer.html               [pie de página reutilizable]
├── pages/
│   ├── auth/                     [login, registro, recuperar contraseña]
│   ├── wiki/                     [wiki institucional]
│   ├── faq/                      [preguntas frecuentes]
│   ├── noticias/                 [noticias]
│   ├── documentos/               [documentos académicos]
│   └── calendario/               [calendario de eventos]
├── admin/                        [panel de administración]
├── supabase/                     [scripts SQL]
├── index.html                    [página de inicio]
├── 404.html
├── .gitignore
├── vercel.json
└── README.md
```

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/unexca-web.git
cd unexca-web
```

### 2. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecutar los scripts en orden:
   - `supabase/01_schema.sql`
   - `supabase/02_rls.sql`
   - `supabase/03_triggers.sql`
   - `supabase/04_seed.sql`
3. Crear **buckets** en Storage:
   - `noticias` (público) — para imágenes de portada.
   - `documentos` (público) — para archivos PDF.
4. Copiar la **URL del proyecto** y la **Anon Key** (publishable key) a [`assets/js/supabase-client.js`](assets/js/supabase-client.js).

### 3. Ejecutar localmente

Este proyecto **no requiere build step**. Simplemente abre [`index.html`](index.html) en tu navegador o usa un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server . -p 8000
```

Luego visita `http://localhost:8000`.

### 4. Desplegar en Vercel

1. Conectar el repositorio de GitHub a Vercel.
2. Configurar:
   - **Framework Preset:** Other
   - **Build Command:** (vacío)
   - **Output Directory:** (vacío)
3. Desplegar.

---

## 👥 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| **Visitante** | No autenticado. Solo lectura de contenido público. |
| **Estudiante** | Autenticado. Lectura extendida y descarga de documentos. |
| **Personal** | Empleados/docentes. Publican y editan contenido. |
| **Admin** | Control total. Gestiona usuarios, contenido y configuración. |

---

## 🔐 Variables de Entorno

Las credenciales de Supabase van directamente en [`assets/js/supabase-client.js`](assets/js/supabase-client.js):

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

> **Nota:** La Anon Key es pública por diseño. La seguridad se implementa mediante **Row Level Security (RLS)** en Supabase.

---

## 📄 Licencia

Proyecto académico — Universidad Nacional Experimental de la Gran Caracas (UNEXCA)
