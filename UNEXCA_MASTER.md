# 🏛 UNEXCA — Portal Web Institucional
## Documentación Maestra del Proyecto

> **Para IAs:** Este documento es el contexto completo del proyecto. Con él puedes entender la arquitectura, generar código, construir módulos y continuar el desarrollo sin información adicional. Léelo completo antes de generar cualquier archivo.

> **Para humanos:** Este documento describe cada decisión técnica, cada archivo, cada tabla y cada patrón de código del proyecto. Si lo lees completo, puedes construir o continuar el proyecto desde cero.

---

## 📋 Tabla de Contenido

1. [Información del Proyecto](#1-información-del-proyecto)
2. [El Problema y La Solución](#2-el-problema-y-la-solución)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Roles de Usuario](#5-roles-de-usuario)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [Estructura de Carpetas](#7-estructura-de-carpetas)
8. [Diseño Visual y Sistema de Estilos](#8-diseño-visual-y-sistema-de-estilos)
9. [Base de Datos Completa](#9-base-de-datos-completa)
10. [Autenticación y Sesiones](#10-autenticación-y-sesiones)
11. [Documentación por Módulo](#11-documentación-por-módulo)
12. [Componentes Reutilizables](#12-componentes-reutilizables)
13. [Patrones de Código JavaScript](#13-patrones-de-código-javascript)
14. [Panel de Administración](#14-panel-de-administración)
15. [Despliegue](#15-despliegue)
16. [Flujo de Trabajo Git](#16-flujo-de-trabajo-git)
17. [Herramientas e IA](#17-herramientas-e-ia)
18. [Glosario](#18-glosario)
19. [Contexto para IAs](#19-contexto-para-ias)

---

## 1. Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Portal Web Institucional UNEXCA |
| **Universidad** | Universidad Nacional Experimental de la Gran Caracas (UNEXCA) |
| **País** | Venezuela |
| **Asignatura** | Proyecto Sociotecnológico II |
| **Carrera** | Informática — Tercer Semestre |
| **Desarrollador principal** | Estudiante del equipo (puede ser desarrollado por una sola persona) |
| **Equipo** | Hasta 6 personas |
| **Versión actual** | v1.0 (en desarrollo) |
| **Idioma** | Español (exclusivamente) |
| **Estado** | En desarrollo |

### Objetivo Doble

**Académico:** Entregar un sistema web funcional con los módulos requeridos, base de datos SQL y 3 roles de usuario.

**Producción:** La arquitectura está diseñada para que este mismo código pueda convertirse en el portal oficial real de UNEXCA sin reescribirse. Cada decisión técnica tiene esto en mente.

---

## 2. El Problema y La Solución

### Situación actual de UNEXCA

La universidad **no tiene página web oficial**. Su presencia digital se reduce a:
- Canal de Telegram
- Grupo de WhatsApp
- Cuenta de Instagram

Esto genera:
- Estudiantes y aspirantes sin fuente oficial de información
- Filas presenciales para preguntas que podrían responderse en línea
- Imagen institucional débil
- Dependencia total de plataformas de terceros (Instagram, WhatsApp)

### La solución: Este portal

Un sitio web institucional moderno, responsivo y con panel de administración que centraliza:
- Información oficial de la universidad (Wiki)
- Respuestas a preguntas frecuentes (FAQ)
- Noticias y anuncios
- Documentos institucionales en PDF
- Calendario académico
- Acceso a redes sociales oficiales

---

## 3. Stack Tecnológico

### Stack completo y definitivo

```
Frontend:     HTML5 + CSS3 + JavaScript (ES6+) — Vanilla, sin frameworks
Base de datos: Supabase (PostgreSQL + Auth + Storage)
Hosting:      Vercel o Netlify (gratuito, integrado con GitHub)
Control de versiones: Git + GitHub
Editor:       Visual Studio Code
```

### Por qué este stack es correcto para este proyecto

| Tecnología | Razón de elección |
|------------|-------------------|
| **HTML/CSS/JS Vanilla** | Sin frameworks que aprender. El equipo puede enfocarse en lógica de negocio, no en sintaxis de React/Vue. Suficientemente potente para este proyecto. |
| **Supabase** | Reemplaza un backend completo: da PostgreSQL (SQL real), autenticación por email, almacenamiento de archivos, y API REST automática. Gratuito para proyectos de este tamaño. |
| **Vercel/Netlify** | Deploy automático con cada `git push`. HTTPS gratis. Dominio temporal gratuito. Sin configurar servidores. |
| **Git + GitHub** | Control de versiones estándar. Permite colaboración y sirve como portafolio. |

### Lo que NO se usa y por qué

| Tecnología | Por qué NO |
|------------|-----------|
| XAMPP / PHP | Requiere servidor local. Supabase lo reemplaza con ventajas (cloud, gratuito, moderno). |
| React / Vue / Angular | Curva de aprendizaje alta innecesaria para este proyecto. |
| Node.js como backend | Supabase hace todo lo que haría un backend Node. Node solo se usa para herramientas locales. |
| MySQL local | Supabase es PostgreSQL en la nube, más fácil de configurar y usar en equipo. |

---

## 4. Arquitectura del Sistema

### Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                   │
│              Chrome / Firefox / Safari / Edge            │
└─────────────────────┬───────────────────────────────────┘
                      │ Carga el sitio
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  VERCEL / NETLIFY                        │
│          (Hosting estático — HTML/CSS/JS)                │
│   URL: https://unexca.vercel.app (o similar)            │
└─────────────────────┬───────────────────────────────────┘
                      │ JavaScript hace peticiones a la API
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     SUPABASE                            │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  PostgreSQL  │ │     Auth     │ │    Storage     │  │
│  │  (Base de   │ │  (Login /    │ │  (PDFs /       │  │
│  │   Datos)    │ │  Registro /  │ │   Imágenes)    │  │
│  │             │ │  Sesiones)   │ │                │  │
│  └──────────────┘ └──────────────┘ └────────────────┘  │
│              API REST automática + SDK JS               │
└─────────────────────────────────────────────────────────┘
```

### Flujo de una petición típica

```
1. Usuario abre https://unexca.vercel.app/pages/wiki/
2. El navegador descarga wiki/index.html, wiki.css, wiki.js
3. wiki.js se ejecuta:
   a. Inicializa el cliente Supabase con URL + clave pública
   b. Verifica si hay sesión activa (usuario logueado)
   c. Hace la consulta: supabase.from('wiki_articulos').select(...)
4. Supabase verifica las políticas RLS del usuario
5. Supabase devuelve JSON con los artículos
6. wiki.js genera el HTML de las tarjetas y lo inserta en el DOM
7. El usuario ve el contenido
```

### Principios de arquitectura

- **Sin backend propio:** Supabase es el backend. El frontend habla directo con Supabase.
- **Modular:** Cada sección del sitio es independiente (carpeta + CSS + JS propios).
- **Escalable:** Agregar un módulo nuevo = crear su carpeta, su tabla en Supabase, sus políticas RLS.
- **Seguro:** Las reglas de acceso viven en la base de datos (RLS), no en el frontend.

---

## 5. Roles de Usuario

El sistema tiene **3 roles autenticados** + 1 estado público:

### Visitante (no autenticado)
- No tiene cuenta.
- Puede leer: Wiki (secciones públicas), FAQ, Noticias públicas, Calendario básico.
- Puede ver botones de redes sociales.
- Puede acceder al formulario de registro.

### 🟢 Estudiante
- Cuenta registrada libremente (registro con email + verificación por correo).
- Acceso a todo lo que ve el Visitante, más:
  - Descarga de documentos institucionales (PDFs).
  - Contenido marcado como "solo estudiantes".
- **No puede** crear ni editar contenido.

### 🟡 Personal Universitario
- Cuenta creada/aprobada por el Administrador.
- Puede publicar y editar contenido:
  - Artículos de Wiki
  - Noticias y anuncios
  - Preguntas de FAQ
  - Documentos
  - Proponer eventos al calendario
- **No puede** gestionar usuarios ni configurar el sitio.

### 🔴 Administrador
- Control total del sistema.
- Puede hacer todo lo que hace el Personal, más:
  - Gestionar usuarios (ver, cambiar rol, desactivar).
  - Aprobar o rechazar cuentas de Personal.
  - Publicar/despublicar cualquier contenido.
  - Configurar redes sociales y ajustes del sitio.
  - Ver panel de administración completo.

### Cómo se gestiona el rol en Supabase

El rol se guarda en la tabla `perfiles` (columna `rol`). Los valores posibles son:
```
'estudiante' | 'personal' | 'admin'
```

El frontend verifica el rol así:
```javascript
const { data: { user } } = await supabase.auth.getUser();
const { data: perfil } = await supabase
  .from('perfiles')
  .select('rol')
  .eq('id', user.id)
  .single();

if (perfil.rol === 'admin') { /* mostrar opciones de admin */ }
```

---

## 6. Módulos del Sistema

### Módulos de la v1.0

| Módulo | Estado | Prioridad | Descripción |
|--------|--------|-----------|-------------|
| **Autenticación** | Pendiente | 🔴 Alta | Login, registro, sesiones, roles |
| **Wiki** | Pendiente | 🔴 Alta | Información institucional organizada |
| **FAQ** | Pendiente | 🔴 Alta | Preguntas y respuestas por categorías |
| **Noticias** | Pendiente | 🟡 Media | Blog de anuncios, eventos, cursos |
| **Documentos** | Pendiente | 🟡 Media | Repositorio de PDFs institucionales |
| **Calendario** | Pendiente | 🟡 Media | Fechas académicas importantes |
| **Redes Sociales** | Pendiente | 🟡 Media | Botones de enlace a Instagram, etc. |
| **Panel Admin** | Pendiente | 🔴 Alta | Gestión de contenido y usuarios |
| **Página de Inicio** | Pendiente | 🔴 Alta | Landing page del portal |

### Funcionalidades fuera de alcance (v1.0)

Las siguientes ideas son válidas para versiones futuras si la universidad adopta el portal, pero están **completamente fuera del alcance académico y del desarrollo inicial:**

- Aula virtual / LMS
- Sistema de notas o calificaciones
- Matrícula o inscripción en línea
- Chat en tiempo real
- Aplicación móvil nativa
- Correo institucional
- Integración con sistemas legados de la universidad
- Feed en vivo de Instagram (requiere API de Meta, compleja)

---

## 7. Estructura de Carpetas

### Árbol completo del proyecto

```
unexca-web/
│
├── assets/                         ← Recursos globales compartidos
│   ├── css/
│   │   ├── base.css                ← Variables CSS, reset, tipografía global
│   │   ├── layout.css              ← Navbar, footer, grid de páginas
│   │   └── components.css          ← Botones, tarjetas, badges, modales, alertas
│   ├── js/
│   │   ├── supabase-client.js      ← Inicialización única del cliente Supabase
│   │   ├── auth.js                 ← Funciones de autenticación reutilizables
│   │   └── utils.js                ← Funciones de utilidad (formatear fecha, etc.)
│   └── img/
│       ├── logo.png                ← Logo oficial UNEXCA
│       ├── logo-white.png          ← Versión blanca para fondo oscuro
│       └── favicon.ico             ← Ícono del navegador
│
├── components/                     ← Fragmentos HTML reutilizables
│   ├── navbar.html                 ← Barra de navegación principal
│   └── footer.html                 ← Pie de página con redes sociales
│
├── pages/                          ← Módulos del sitio (una carpeta por módulo)
│   │
│   ├── auth/                       ← Autenticación
│   │   ├── login.html
│   │   ├── registro.html
│   │   ├── recuperar-contrasena.html
│   │   └── auth.js
│   │
│   ├── wiki/                       ← Módulo Wiki
│   │   ├── index.html              ← Listado de categorías
│   │   ├── categoria.html          ← Artículos de una categoría
│   │   ├── articulo.html           ← Vista de un artículo individual
│   │   └── wiki.js                 ← Lógica del módulo
│   │
│   ├── faq/                        ← Módulo FAQ
│   │   ├── index.html              ← Todas las preguntas por categoría
│   │   └── faq.js
│   │
│   ├── noticias/                   ← Módulo Noticias
│   │   ├── index.html              ← Listado de noticias
│   │   ├── noticia.html            ← Noticia individual
│   │   └── noticias.js
│   │
│   ├── documentos/                 ← Centro de Documentos
│   │   ├── index.html
│   │   └── documentos.js
│   │
│   └── calendario/                 ← Calendario Académico
│       ├── index.html
│       └── calendario.js
│
├── admin/                          ← Panel de administración (acceso restringido)
│   ├── index.html                  ← Dashboard principal
│   ├── usuarios.html               ← Gestión de usuarios
│   ├── wiki-editor.html            ← CRUD de artículos Wiki
│   ├── faq-editor.html             ← CRUD de preguntas FAQ
│   ├── noticias-editor.html        ← CRUD de noticias
│   ├── documentos-editor.html      ← Subida y gestión de documentos
│   ├── calendario-editor.html      ← Gestión de eventos del calendario
│   ├── configuracion.html          ← Ajustes del sitio (redes sociales, etc.)
│   └── admin.js                    ← Lógica del panel (verificación de rol admin)
│
├── supabase/                       ← Scripts SQL para la base de datos
│   ├── 01_schema.sql               ← Creación de todas las tablas
│   ├── 02_rls.sql                  ← Políticas de Row Level Security
│   ├── 03_triggers.sql             ← Triggers automáticos (ej: crear perfil al registrarse)
│   └── 04_seed.sql                 ← Datos de ejemplo para desarrollo
│
├── index.html                      ← Página de inicio del portal
├── 404.html                        ← Página de error 404
├── .env                            ← Variables de entorno (NO subir a Git)
├── .gitignore                      ← Archivos ignorados por Git
├── vercel.json                     ← Configuración de rutas para Vercel
└── README.md                       ← Guía de instalación y primeros pasos
```

### Descripción de cada archivo importante

#### `assets/js/supabase-client.js`
Único lugar donde se inicializa Supabase. Todos los demás archivos JS importan desde aquí.

```javascript
// assets/js/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';    // Tu URL de proyecto
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'; // Tu clave pública (anon)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

> ⚠️ **Importante:** La `ANON_KEY` es pública y puede estar en el código frontend. Supabase usa RLS para proteger los datos. NUNCA pongas la `SERVICE_ROLE_KEY` en el frontend.

#### `assets/js/auth.js`
Funciones de autenticación reutilizables para todos los módulos.

```javascript
// assets/js/auth.js
import { supabase } from './supabase-client.js';

// Obtener el usuario y su perfil actual
export async function getUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, perfil };
}

// Verificar si el usuario tiene el rol mínimo requerido
export async function verificarRol(rolMinimo) {
  const usuario = await getUsuarioActual();
  if (!usuario) return false;

  const jerarquia = { 'estudiante': 1, 'personal': 2, 'admin': 3 };
  return jerarquia[usuario.perfil.rol] >= jerarquia[rolMinimo];
}

// Cerrar sesión
export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

// Redirigir si no está autenticado
export async function requiereAutenticacion(rolMinimo = 'estudiante') {
  const tieneAcceso = await verificarRol(rolMinimo);
  if (!tieneAcceso) {
    window.location.href = '/pages/auth/login.html?redirect=' + window.location.pathname;
  }
}
```

#### `assets/js/utils.js`
Funciones auxiliares de uso general.

```javascript
// assets/js/utils.js

// Formatear fecha a español venezolano
export function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-VE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// Truncar texto para previsualizaciones
export function truncar(texto, maxCaracteres = 150) {
  if (texto.length <= maxCaracteres) return texto;
  return texto.slice(0, maxCaracteres).trim() + '...';
}

// Obtener parámetro de la URL
export function getParamURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

// Mostrar mensaje de error en pantalla
export function mostrarError(mensaje) {
  const div = document.getElementById('mensaje-error');
  if (div) { div.textContent = mensaje; div.style.display = 'block'; }
}

// Mostrar spinner de carga
export function mostrarCarga(mostrar) {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = mostrar ? 'flex' : 'none';
}

// Sanitizar HTML básico para prevenir XSS
export function sanitizar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
```

#### `.env` (plantilla)
```env
# NUNCA subir este archivo a GitHub (.gitignore lo excluye)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

#### `vercel.json`
Necesario para que Vercel sirva correctamente las rutas.

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1.html" }
  ]
}
```

---

## 8. Diseño Visual y Sistema de Estilos

### Paleta de colores oficial

Basada en el logo oficial de UNEXCA (silhouette del skyline de Caracas).

```css
:root {
  /* ─── Colores principales (del logo oficial) ─── */
  --color-primario:      #022A6F;   /* Azul universitario principal */
  --color-primario-dark: #000C4D;   /* Azul muy oscuro (encabezados, navbar) */
  --color-primario-light:#48597E;   /* Azul medio (elementos secundarios) */
  --color-texto-oscuro:  #161823;   /* Casi negro (texto principal) */

  /* ─── Neutros ─── */
  --color-blanco:        #FFFFFF;
  --color-fondo:         #F5F7FA;   /* Fondo de páginas (gris muy suave) */
  --color-fondo-card:    #FFFFFF;   /* Fondo de tarjetas */
  --color-borde:         #D1D9E6;   /* Bordes suaves */
  --color-texto:         #161823;   /* Texto principal */
  --color-texto-suave:   #48597E;   /* Texto secundario / subtítulos */
  --color-texto-muy-suave: #8A9BC0; /* Texto de metadatos, fechas */

  /* ─── Colores de estado ─── */
  --color-exito:         #1A7A3C;   /* Verde (confirmación) */
  --color-advertencia:   #C17800;   /* Ámbar (advertencias) */
  --color-error:         #C0392B;   /* Rojo (errores) */
  --color-info:          #022A6F;   /* Azul (información) */

  /* ─── Colores de roles ─── */
  --color-rol-admin:     #022A6F;   /* Azul oscuro */
  --color-rol-personal:  #C17800;   /* Ámbar */
  --color-rol-estudiante:#1A7A3C;   /* Verde */

  /* ─── Tipografía ─── */
  --fuente-principal: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --fuente-mono:      'Fira Code', 'Courier New', monospace;

  --texto-xs:   0.75rem;    /*  12px */
  --texto-sm:   0.875rem;   /*  14px */
  --texto-base: 1rem;       /*  16px */
  --texto-lg:   1.125rem;   /*  18px */
  --texto-xl:   1.25rem;    /*  20px */
  --texto-2xl:  1.5rem;     /*  24px */
  --texto-3xl:  1.875rem;   /*  30px */
  --texto-4xl:  2.25rem;    /*  36px */

  /* ─── Espaciado (sistema de 8px) ─── */
  --esp-1: 4px;
  --esp-2: 8px;
  --esp-3: 12px;
  --esp-4: 16px;
  --esp-5: 20px;
  --esp-6: 24px;
  --esp-8: 32px;
  --esp-10: 40px;
  --esp-12: 48px;
  --esp-16: 64px;

  /* ─── Bordes ─── */
  --radio-sm:   4px;
  --radio-md:   8px;
  --radio-lg:   12px;
  --radio-xl:   16px;
  --radio-full: 9999px;

  /* ─── Sombras ─── */
  --sombra-sm:  0 1px 3px rgba(2, 42, 111, 0.08);
  --sombra-md:  0 4px 12px rgba(2, 42, 111, 0.12);
  --sombra-lg:  0 8px 24px rgba(2, 42, 111, 0.16);
  --sombra-xl:  0 16px 48px rgba(2, 42, 111, 0.20);

  /* ─── Transiciones ─── */
  --transicion: 200ms ease;
  --transicion-lenta: 350ms ease;

  /* ─── Layout ─── */
  --ancho-max: 1200px;
  --ancho-navbar: 100%;
  --alto-navbar: 64px;
}
```

### Breakpoints (responsividad)

```css
/* Mobile first — los estilos base son para móvil */

/* Tableta pequeña */
@media (min-width: 640px) { /* sm */ }

/* Tableta */
@media (min-width: 768px) { /* md */ }

/* Desktop pequeño */
@media (min-width: 1024px) { /* lg */ }

/* Desktop grande */
@media (min-width: 1280px) { /* xl */ }
```

### Estructura del `base.css`

```css
/* assets/css/base.css */

/* 1. Importar fuente */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* 2. Variables (pegar el bloque :root completo de arriba) */

/* 3. Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--fuente-principal);
  font-size: var(--texto-base);
  color: var(--color-texto);
  background-color: var(--color-fondo);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: var(--color-primario); text-decoration: none; }
a:hover { text-decoration: underline; }

/* 4. Utilidades de layout */
.container {
  max-width: var(--ancho-max);
  margin: 0 auto;
  padding: 0 var(--esp-4);
}
@media (min-width: 768px) {
  .container { padding: 0 var(--esp-8); }
}

/* 5. Tipografía */
h1 { font-size: var(--texto-4xl); font-weight: 700; color: var(--color-primario-dark); }
h2 { font-size: var(--texto-3xl); font-weight: 700; color: var(--color-primario); }
h3 { font-size: var(--texto-2xl); font-weight: 600; color: var(--color-texto); }
h4 { font-size: var(--texto-xl);  font-weight: 600; color: var(--color-texto); }
p  { margin-bottom: var(--esp-4); }

/* 6. Spinner de carga */
.spinner {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.8);
  place-items: center;
  z-index: 9999;
}
.spinner.activo { display: grid; }
.spinner::after {
  content: '';
  width: 40px; height: 40px;
  border: 4px solid var(--color-borde);
  border-top-color: var(--color-primario);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}
@keyframes girar { to { transform: rotate(360deg); } }
```

### Estructura del `components.css`

```css
/* assets/css/components.css */

/* ─── BOTONES ─── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--esp-2);
  padding: var(--esp-3) var(--esp-6);
  border-radius: var(--radio-md);
  font-weight: 600;
  font-size: var(--texto-sm);
  cursor: pointer;
  border: none;
  transition: all var(--transicion);
  text-decoration: none;
}
.btn-primario {
  background: var(--color-primario);
  color: var(--color-blanco);
}
.btn-primario:hover {
  background: var(--color-primario-dark);
  transform: translateY(-1px);
  box-shadow: var(--sombra-md);
}
.btn-secundario {
  background: transparent;
  color: var(--color-primario);
  border: 2px solid var(--color-primario);
}
.btn-secundario:hover { background: var(--color-fondo); }
.btn-peligro { background: var(--color-error); color: white; }

/* ─── TARJETAS ─── */
.card {
  background: var(--color-fondo-card);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde);
  padding: var(--esp-6);
  box-shadow: var(--sombra-sm);
  transition: box-shadow var(--transicion), transform var(--transicion);
}
.card:hover {
  box-shadow: var(--sombra-md);
  transform: translateY(-2px);
}

/* ─── BADGES DE ROL ─── */
.badge-rol {
  padding: 2px var(--esp-3);
  border-radius: var(--radio-full);
  font-size: var(--texto-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge-admin     { background: var(--color-primario-dark); color: white; }
.badge-personal  { background: var(--color-advertencia);   color: white; }
.badge-estudiante{ background: var(--color-exito);          color: white; }

/* ─── FORMULARIOS ─── */
.form-grupo { margin-bottom: var(--esp-5); }
.form-grupo label {
  display: block;
  margin-bottom: var(--esp-2);
  font-weight: 500;
  color: var(--color-texto);
}
.form-input {
  width: 100%;
  padding: var(--esp-3) var(--esp-4);
  border: 1.5px solid var(--color-borde);
  border-radius: var(--radio-md);
  font-size: var(--texto-base);
  font-family: var(--fuente-principal);
  transition: border-color var(--transicion), box-shadow var(--transicion);
  background: white;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primario);
  box-shadow: 0 0 0 3px rgba(2, 42, 111, 0.12);
}

/* ─── ALERTAS ─── */
.alerta {
  padding: var(--esp-4);
  border-radius: var(--radio-md);
  margin-bottom: var(--esp-4);
  font-size: var(--texto-sm);
  border-left: 4px solid;
}
.alerta-error   { background: #fef2f2; border-color: var(--color-error);       color: #7f1d1d; }
.alerta-exito   { background: #f0fdf4; border-color: var(--color-exito);       color: #14532d; }
.alerta-info    { background: #eff6ff; border-color: var(--color-primario);    color: var(--color-primario-dark); }

/* ─── ACORDEÓN (para FAQ) ─── */
.acordeon-item { border: 1px solid var(--color-borde); border-radius: var(--radio-md); margin-bottom: var(--esp-2); overflow: hidden; }
.acordeon-header {
  width: 100%;
  padding: var(--esp-4) var(--esp-5);
  background: white;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  font-family: var(--fuente-principal);
  font-size: var(--texto-base);
}
.acordeon-header:hover { background: var(--color-fondo); }
.acordeon-contenido {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transicion-lenta);
  padding: 0 var(--esp-5);
}
.acordeon-item.abierto .acordeon-contenido {
  max-height: 500px;
  padding: var(--esp-4) var(--esp-5);
}

/* ─── GRID DE TARJETAS ─── */
.grid-tarjetas {
  display: grid;
  gap: var(--esp-6);
  grid-template-columns: 1fr;
}
@media (min-width: 640px)  { .grid-tarjetas { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid-tarjetas { grid-template-columns: repeat(3, 1fr); } }
```

---

## 9. Base de Datos Completa

### Configuración en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre del proyecto: `unexca-portal`
3. Contraseña de base de datos: guardarla en lugar seguro
4. Región: más cercana (US East o Europe si no hay Sudamérica)
5. Copiar `Project URL` y `anon public key` al archivo `.env`

### Script SQL completo — Ejecutar en Supabase SQL Editor

#### `01_schema.sql` — Creación de tablas

```sql
-- ═══════════════════════════════════════════════
-- PORTAL UNEXCA — Schema de Base de Datos v1.0
-- Ejecutar en: Supabase → SQL Editor
-- ═══════════════════════════════════════════════

-- ─── TABLA: perfiles ───────────────────────────
-- Extiende la tabla auth.users de Supabase Auth
-- Se crea automáticamente cuando alguien se registra (via trigger)
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

-- ─── TABLA: wiki_categorias ────────────────────
CREATE TABLE public.wiki_categorias (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  icono       TEXT DEFAULT '📄',   -- Emoji o nombre de ícono
  orden       INTEGER DEFAULT 0,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: wiki_articulos ─────────────────────
CREATE TABLE public.wiki_articulos (
  id           SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES wiki_categorias(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  contenido    TEXT NOT NULL,       -- HTML o texto plano
  autor_id     UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado    BOOLEAN DEFAULT false,
  vistas       INTEGER DEFAULT 0,
  creado_en    TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: faq_categorias ─────────────────────
CREATE TABLE public.faq_categorias (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  icono  TEXT DEFAULT '❓',
  orden  INTEGER DEFAULT 0
);

-- ─── TABLA: faq_preguntas ──────────────────────
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

-- ─── TABLA: noticias ───────────────────────────
CREATE TABLE public.noticias (
  id           SERIAL PRIMARY KEY,
  titulo       TEXT NOT NULL,
  resumen      TEXT,
  contenido    TEXT NOT NULL,
  portada_url  TEXT,
  categoria    TEXT DEFAULT 'Noticia'
               CHECK (categoria IN ('Noticia', 'Anuncio', 'Taller', 'Curso', 'Evento')),
  autor_id     UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado    BOOLEAN DEFAULT false,
  destacado    BOOLEAN DEFAULT false,
  publicado_en TIMESTAMPTZ DEFAULT NOW(),
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: documentos ─────────────────────────
CREATE TABLE public.documentos (
  id           SERIAL PRIMARY KEY,
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  archivo_url  TEXT NOT NULL,       -- URL en Supabase Storage
  categoria    TEXT NOT NULL,
  carrera      TEXT,                -- NULL = aplica a todas las carreras
  acceso_minimo TEXT DEFAULT 'estudiante'
               CHECK (acceso_minimo IN ('publico', 'estudiante', 'personal', 'admin')),
  subido_por   UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: calendario_eventos ─────────────────
CREATE TABLE public.calendario_eventos (
  id           SERIAL PRIMARY KEY,
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE,                -- NULL = evento de un solo día
  tipo         TEXT DEFAULT 'General'
               CHECK (tipo IN ('Inscripción', 'Clases', 'Examen', 'Graduación', 'Feriado', 'General')),
  color        TEXT DEFAULT '#022A6F',
  creado_por   UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: configuracion_sitio ────────────────
-- Pares clave-valor para ajustes del portal
CREATE TABLE public.configuracion_sitio (
  clave         TEXT PRIMARY KEY,
  valor         TEXT,
  descripcion   TEXT,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales de configuración
INSERT INTO public.configuracion_sitio (clave, valor, descripcion) VALUES
  ('instagram_url',  'https://www.instagram.com/unexca',    'URL de Instagram'),
  ('whatsapp_url',   'https://wa.me/584120000000',           'Enlace de WhatsApp'),
  ('telegram_url',   'https://t.me/unexca',                  'Canal de Telegram'),
  ('nombre_sitio',   'UNEXCA — Portal Institucional',        'Nombre del sitio'),
  ('descripcion_sitio', 'Portal oficial de la Universidad Nacional Experimental de la Gran Caracas', 'Descripción para SEO');
```

#### `02_rls.sql` — Políticas de seguridad

```sql
-- ═══════════════════════════════════════════════
-- Row Level Security (RLS) — Quién puede hacer qué
-- ═══════════════════════════════════════════════

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

-- ─── Función helper: obtener rol del usuario actual ───
CREATE OR REPLACE FUNCTION public.get_rol_usuario()
RETURNS TEXT AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── POLÍTICAS: perfiles ──────────────────────
-- Cualquiera puede ver perfiles básicos
CREATE POLICY "perfiles_ver_publico" ON public.perfiles
  FOR SELECT USING (true);

-- El usuario puede actualizar su propio perfil
CREATE POLICY "perfiles_actualizar_propio" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

-- Solo admin puede cambiar roles
CREATE POLICY "perfiles_admin_total" ON public.perfiles
  FOR ALL USING (get_rol_usuario() = 'admin');

-- ─── POLÍTICAS: wiki ──────────────────────────
-- Lectura pública de artículos publicados
CREATE POLICY "wiki_leer_publicados" ON public.wiki_articulos
  FOR SELECT USING (publicado = true);

-- Personal y admin pueden ver todos (incluyendo borradores)
CREATE POLICY "wiki_personal_ver_todo" ON public.wiki_articulos
  FOR SELECT USING (get_rol_usuario() IN ('personal', 'admin'));

-- Personal y admin pueden crear y editar
CREATE POLICY "wiki_personal_escribir" ON public.wiki_articulos
  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal', 'admin'));

CREATE POLICY "wiki_personal_editar" ON public.wiki_articulos
  FOR UPDATE USING (get_rol_usuario() IN ('personal', 'admin'));

-- Solo admin puede eliminar
CREATE POLICY "wiki_admin_eliminar" ON public.wiki_articulos
  FOR DELETE USING (get_rol_usuario() = 'admin');

-- Wiki categorías: lectura pública, escritura para personal+
CREATE POLICY "wiki_cat_leer" ON public.wiki_categorias FOR SELECT USING (true);
CREATE POLICY "wiki_cat_escribir" ON public.wiki_categorias
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

-- ─── POLÍTICAS: FAQ ───────────────────────────
CREATE POLICY "faq_leer_publicadas" ON public.faq_preguntas
  FOR SELECT USING (publicado = true);

CREATE POLICY "faq_personal_total" ON public.faq_preguntas
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

CREATE POLICY "faq_cat_leer" ON public.faq_categorias FOR SELECT USING (true);
CREATE POLICY "faq_cat_escribir" ON public.faq_categorias
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

-- ─── POLÍTICAS: noticias ──────────────────────
CREATE POLICY "noticias_leer_publicadas" ON public.noticias
  FOR SELECT USING (publicado = true);

CREATE POLICY "noticias_personal_total" ON public.noticias
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

-- ─── POLÍTICAS: documentos ────────────────────
-- Documentos públicos: cualquiera puede ver
CREATE POLICY "docs_leer_publicos" ON public.documentos
  FOR SELECT USING (acceso_minimo = 'publico');

-- Documentos de estudiante: requieren autenticación
CREATE POLICY "docs_leer_estudiante" ON public.documentos
  FOR SELECT USING (
    acceso_minimo = 'estudiante'
    AND auth.uid() IS NOT NULL
    AND get_rol_usuario() IN ('estudiante', 'personal', 'admin')
  );

-- Escritura: personal y admin
CREATE POLICY "docs_personal_escribir" ON public.documentos
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

-- ─── POLÍTICAS: calendario ────────────────────
CREATE POLICY "cal_leer_publico" ON public.calendario_eventos
  FOR SELECT USING (true);

CREATE POLICY "cal_personal_escribir" ON public.calendario_eventos
  FOR ALL USING (get_rol_usuario() IN ('personal', 'admin'));

-- ─── POLÍTICAS: configuracion ─────────────────
CREATE POLICY "config_leer_publico" ON public.configuracion_sitio
  FOR SELECT USING (true);

CREATE POLICY "config_admin_escribir" ON public.configuracion_sitio
  FOR ALL USING (get_rol_usuario() = 'admin');
```

#### `03_triggers.sql` — Automatizaciones

```sql
-- ═══════════════════════════════════════════════
-- Triggers: Acciones automáticas en la BD
-- ═══════════════════════════════════════════════

-- ─── Trigger: crear perfil al registrarse ─────
-- Se ejecuta automáticamente cuando alguien se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_completo, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
    NEW.email,
    'estudiante'  -- Rol por defecto al registrarse
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_nuevo_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();

-- ─── Trigger: actualizar 'actualizado_en' ─────
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_perfiles_timestamp
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_wiki_timestamp
  BEFORE UPDATE ON public.wiki_articulos
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
```

#### `04_seed.sql` — Datos de prueba

```sql
-- ═══════════════════════════════════════════════
-- Datos de ejemplo para desarrollo
-- ═══════════════════════════════════════════════

-- Categorías de Wiki
INSERT INTO public.wiki_categorias (nombre, descripcion, icono, orden) VALUES
  ('La Universidad', 'Historia, misión, visión y valores de UNEXCA', '🏛', 1),
  ('Carreras y Programas', 'Información sobre pregrado, postgrado e introductorio', '📚', 2),
  ('Inscripciones', 'Proceso de inscripción, requisitos y fechas', '📝', 3),
  ('Sedes', 'Ubicación y contacto de las sedes de UNEXCA', '📍', 4),
  ('Reglamentos', 'Normativas y reglamentos institucionales', '⚖️', 5);

-- Categorías de FAQ
INSERT INTO public.faq_categorias (nombre, icono, orden) VALUES
  ('Inscripción', '📝', 1),
  ('Pagos y Aranceles', '💰', 2),
  ('Documentos Requeridos', '📋', 3),
  ('Vida Estudiantil', '🎓', 4),
  ('Postgrado', '🎓', 5);

-- Preguntas FAQ de ejemplo
INSERT INTO public.faq_preguntas (categoria_id, pregunta, respuesta, publicado) VALUES
  (1, '¿Cuáles son los requisitos para inscribirse?',
   'Para inscribirse en UNEXCA necesitas: cédula de identidad vigente, título de bachiller certificado, notas certificadas de bachillerato y 2 fotos tipo carnet.',
   true),
  (1, '¿Cuándo son los períodos de inscripción?',
   'Los períodos de inscripción se publican en el calendario académico oficial. Generalmente son en enero-febrero y julio-agosto.',
   true),
  (3, '¿Qué documentos debo llevar el día de la inscripción?',
   'Original y copia de: cédula de identidad, título de bachiller, notas certificadas y constancia de salud (emitida por un médico).',
   true);

-- Eventos de calendario de ejemplo
INSERT INTO public.calendario_eventos (titulo, descripcion, fecha_inicio, fecha_fin, tipo, color) VALUES
  ('Inicio de Inscripciones', 'Apertura del período de inscripción', '2025-07-15', '2025-07-31', 'Inscripción', '#022A6F'),
  ('Inicio de Clases', 'Comienzo del semestre académico', '2025-08-18', NULL, 'Clases', '#1A7A3C'),
  ('Período de Exámenes Finales', 'Semana de exámenes finales', '2025-11-17', '2025-11-28', 'Examen', '#C17800');
```

---

## 10. Autenticación y Sesiones

### Flujo de registro

```
Usuario llena el formulario (nombre, email, contraseña)
  ↓
supabase.auth.signUp({ email, password, options: { data: { nombre_completo } } })
  ↓
Supabase envía email de verificación
  ↓
El trigger 'trigger_nuevo_usuario' crea el perfil automáticamente con rol='estudiante'
  ↓
Usuario hace clic en el enlace del email
  ↓
Sesión activa — redirigir al inicio
```

### Flujo de login

```
Usuario llena email y contraseña
  ↓
supabase.auth.signInWithPassword({ email, password })
  ↓
Si correcto: Supabase devuelve session con access_token
  ↓
El SDK guarda el token en localStorage automáticamente
  ↓
Redirigir según el rol del usuario
```

### Código completo de la página de login

```html
<!-- pages/auth/login.html -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión — UNEXCA</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
</head>
<body>
  <main class="auth-pagina">
    <div class="auth-card card">
      <div class="auth-logo">
        <img src="/assets/img/logo.png" alt="Logo UNEXCA" height="60">
      </div>
      <h1 class="auth-titulo">Iniciar Sesión</h1>

      <div id="alerta-error" class="alerta alerta-error" style="display:none"></div>

      <div class="form-grupo">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" class="form-input"
               placeholder="tucorreo@email.com" autocomplete="email">
      </div>

      <div class="form-grupo">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" class="form-input"
               placeholder="••••••••" autocomplete="current-password">
      </div>

      <button id="btn-login" class="btn btn-primario" style="width:100%">
        Iniciar Sesión
      </button>

      <p class="auth-enlaces">
        <a href="/pages/auth/recuperar-contrasena.html">¿Olvidaste tu contraseña?</a>
        &nbsp;·&nbsp;
        <a href="/pages/auth/registro.html">Crear cuenta</a>
      </p>
    </div>
  </main>

  <script type="module" src="/pages/auth/auth.js"></script>
</body>
</html>
```

```javascript
// pages/auth/auth.js
import { supabase } from '/assets/js/supabase-client.js';
import { mostrarError } from '/assets/js/utils.js';

// Si ya hay sesión activa, redirigir al inicio
const { data: { session } } = await supabase.auth.getSession();
if (session) window.location.href = '/index.html';

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
  const email     = document.getElementById('email').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  if (!email || !contrasena) {
    mostrarError('Por favor completa todos los campos.');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Iniciando sesión...';

  const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });

  if (error) {
    const mensajes = {
      'Invalid login credentials': 'Correo o contraseña incorrectos.',
      'Email not confirmed': 'Debes verificar tu correo antes de iniciar sesión.',
    };
    document.getElementById('alerta-error').textContent =
      mensajes[error.message] || 'Error al iniciar sesión. Intenta de nuevo.';
    document.getElementById('alerta-error').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Iniciar Sesión';
    return;
  }

  window.location.href = '/index.html';
});
```

### Proteger una página según rol

```javascript
// Al inicio de cualquier JS que requiera autenticación:
import { requiereAutenticacion } from '/assets/js/auth.js';

// Requiere mínimo 'estudiante' (cualquier usuario logueado)
await requiereAutenticacion('estudiante');

// Requiere mínimo 'personal'
await requiereAutenticacion('personal');

// Requiere ser 'admin'
await requiereAutenticacion('admin');
```

---

## 11. Documentación por Módulo

### Módulo: Wiki Institucional

**Propósito:** Centralizar toda la información oficial de UNEXCA de forma organizada y fácil de navegar.

**Páginas:**

| Página | URL | Descripción |
|--------|-----|-------------|
| `wiki/index.html` | `/pages/wiki/` | Muestra todas las categorías como tarjetas |
| `wiki/categoria.html` | `/pages/wiki/categoria.html?id=1` | Lista artículos de una categoría |
| `wiki/articulo.html` | `/pages/wiki/articulo.html?id=5` | Muestra el contenido completo de un artículo |

**Lógica principal (`wiki.js`):**

```javascript
// pages/wiki/wiki.js
import { supabase } from '/assets/js/supabase-client.js';
import { getParamURL, formatearFecha } from '/assets/js/utils.js';

// ─── Cargar categorías (para wiki/index.html) ───
async function cargarCategorias() {
  const { data: categorias, error } = await supabase
    .from('wiki_categorias')
    .select('*, wiki_articulos(count)')
    .order('orden');

  if (error) { console.error(error); return; }

  const contenedor = document.getElementById('categorias-grid');
  contenedor.innerHTML = categorias.map(cat => `
    <a href="/pages/wiki/categoria.html?id=${cat.id}" class="card card-categoria">
      <span class="cat-icono">${cat.icono}</span>
      <h3>${cat.nombre}</h3>
      <p>${cat.descripcion || ''}</p>
      <span class="cat-conteo">${cat.wiki_articulos[0].count} artículos</span>
    </a>
  `).join('');
}

// ─── Cargar artículos de una categoría ─────────
async function cargarArticulos() {
  const categoriaId = getParamURL('id');
  if (!categoriaId) { window.location.href = '/pages/wiki/'; return; }

  const { data: articulos } = await supabase
    .from('wiki_articulos')
    .select('*, wiki_categorias(nombre)')
    .eq('categoria_id', categoriaId)
    .eq('publicado', true)
    .order('creado_en', { ascending: false });

  const contenedor = document.getElementById('articulos-lista');
  if (!articulos?.length) {
    contenedor.innerHTML = '<p>No hay artículos en esta categoría todavía.</p>';
    return;
  }
  contenedor.innerHTML = articulos.map(art => `
    <a href="/pages/wiki/articulo.html?id=${art.id}" class="card articulo-item">
      <h3>${art.titulo}</h3>
      <small>Actualizado: ${formatearFecha(art.actualizado_en)}</small>
    </a>
  `).join('');
}

// ─── Cargar artículo individual ─────────────────
async function cargarArticulo() {
  const id = getParamURL('id');
  if (!id) { window.location.href = '/pages/wiki/'; return; }

  // Incrementar vistas
  await supabase.rpc('incrementar_vistas', { tabla: 'wiki_articulos', registro_id: id });

  const { data: articulo } = await supabase
    .from('wiki_articulos')
    .select('*, wiki_categorias(nombre, id), perfiles(nombre_completo)')
    .eq('id', id)
    .eq('publicado', true)
    .single();

  if (!articulo) { window.location.href = '/pages/wiki/'; return; }

  document.title = `${articulo.titulo} — Wiki UNEXCA`;
  document.getElementById('titulo-articulo').textContent = articulo.titulo;
  document.getElementById('contenido-articulo').innerHTML = articulo.contenido;
  document.getElementById('fecha-actualizacion').textContent =
    formatearFecha(articulo.actualizado_en);
}

// Ejecutar según la página actual
const pagina = window.location.pathname;
if (pagina.includes('index'))    cargarCategorias();
if (pagina.includes('categoria')) cargarArticulos();
if (pagina.includes('articulo'))  cargarArticulo();
```

---

### Módulo: FAQ

**Propósito:** Responder las dudas más comunes de estudiantes sin que tengan que hacer filas o esperar.

**Patrón de acordeón (FAQ):**

```javascript
// pages/faq/faq.js
import { supabase } from '/assets/js/supabase-client.js';

async function cargarFAQ() {
  const { data: categorias } = await supabase
    .from('faq_categorias')
    .select(`
      *,
      faq_preguntas ( id, pregunta, respuesta, orden )
    `)
    .order('orden')
    .order('orden', { foreignTable: 'faq_preguntas' });

  const contenedor = document.getElementById('faq-contenedor');
  contenedor.innerHTML = categorias.map(cat => `
    <section class="faq-seccion">
      <h2>${cat.icono} ${cat.nombre}</h2>
      <div class="acordeon">
        ${cat.faq_preguntas.filter(p => p.publicado !== false).map(p => `
          <div class="acordeon-item" data-id="${p.id}">
            <button class="acordeon-header">
              ${p.pregunta}
              <span class="acordeon-icono">▼</span>
            </button>
            <div class="acordeon-contenido">
              <p>${p.respuesta}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');

  // Activar acordeón
  document.querySelectorAll('.acordeon-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acordeon-item');
      item.classList.toggle('abierto');
    });
  });
}

// Búsqueda en FAQ
document.getElementById('buscador-faq')?.addEventListener('input', (e) => {
  const termino = e.target.value.toLowerCase();
  document.querySelectorAll('.acordeon-item').forEach(item => {
    const pregunta = item.querySelector('.acordeon-header').textContent.toLowerCase();
    const respuesta = item.querySelector('.acordeon-contenido').textContent.toLowerCase();
    item.style.display = (pregunta.includes(termino) || respuesta.includes(termino))
      ? 'block' : 'none';
  });
});

cargarFAQ();
```

---

### Módulo: Noticias

**Estructura de `noticias/index.html`:** Grid de tarjetas con imagen, categoría, título, fecha y resumen.

**Estructura de `noticias/noticia.html`:** Vista completa con imagen de portada, contenido completo y metadatos.

```javascript
// pages/noticias/noticias.js (fragmento)
async function cargarNoticias() {
  const { data: noticias } = await supabase
    .from('noticias')
    .select('id, titulo, resumen, portada_url, categoria, publicado_en')
    .eq('publicado', true)
    .order('publicado_en', { ascending: false })
    .limit(12);

  const contenedor = document.getElementById('noticias-grid');
  contenedor.innerHTML = noticias.map(n => `
    <article class="card card-noticia">
      ${n.portada_url ? `<img src="${n.portada_url}" alt="${n.titulo}" class="noticia-imagen">` : ''}
      <div class="noticia-cuerpo">
        <span class="badge-categoria badge-${n.categoria.toLowerCase()}">${n.categoria}</span>
        <h3><a href="noticia.html?id=${n.id}">${n.titulo}</a></h3>
        <p>${n.resumen || ''}</p>
        <time>${formatearFecha(n.publicado_en)}</time>
      </div>
    </article>
  `).join('');
}
```

---

### Módulo: Documentos

```javascript
// pages/documentos/documentos.js (fragmento)
import { requiereAutenticacion } from '/assets/js/auth.js';

// Solo estudiantes y superiores pueden descargar
await requiereAutenticacion('estudiante');

async function cargarDocumentos() {
  const { data: documentos } = await supabase
    .from('documentos')
    .select('*')
    .order('creado_en', { ascending: false });

  // Agrupar por categoría
  const porCategoria = documentos.reduce((acc, doc) => {
    if (!acc[doc.categoria]) acc[doc.categoria] = [];
    acc[doc.categoria].push(doc);
    return acc;
  }, {});

  const contenedor = document.getElementById('documentos-contenedor');
  contenedor.innerHTML = Object.entries(porCategoria).map(([cat, docs]) => `
    <section>
      <h2>${cat}</h2>
      <div class="documentos-lista">
        ${docs.map(doc => `
          <div class="card documento-item">
            <div>
              <h4>📄 ${doc.titulo}</h4>
              <p>${doc.descripcion || ''}</p>
            </div>
            <a href="${doc.archivo_url}" target="_blank" class="btn btn-primario" download>
              Descargar PDF
            </a>
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');
}
cargarDocumentos();
```

---

### Módulo: Calendario

```javascript
// pages/calendario/calendario.js
async function cargarEventos() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];
  const finAnio  = new Date(ahora.getFullYear(), 11, 31).toISOString().split('T')[0];

  const { data: eventos } = await supabase
    .from('calendario_eventos')
    .select('*')
    .gte('fecha_inicio', inicioMes)
    .lte('fecha_inicio', finAnio)
    .order('fecha_inicio');

  // Renderizar lista de eventos próximos
  const contenedor = document.getElementById('eventos-lista');
  contenedor.innerHTML = eventos.map(ev => `
    <div class="evento-item" style="border-left: 4px solid ${ev.color}">
      <div class="evento-fecha">
        <strong>${formatearFecha(ev.fecha_inicio)}</strong>
        ${ev.fecha_fin ? ` → ${formatearFecha(ev.fecha_fin)}` : ''}
      </div>
      <div>
        <h4>${ev.titulo}</h4>
        <p>${ev.descripcion || ''}</p>
        <span class="badge-tipo">${ev.tipo}</span>
      </div>
    </div>
  `).join('');
}
cargarEventos();
```

---

## 12. Componentes Reutilizables

### Navbar (`components/navbar.html`)

```html
<nav class="navbar" id="navbar">
  <div class="container navbar-contenido">
    <!-- Logo -->
    <a href="/index.html" class="navbar-logo">
      <img src="/assets/img/logo.png" alt="UNEXCA" height="40">
    </a>

    <!-- Menú principal (desktop) -->
    <ul class="navbar-menu" id="navbar-menu">
      <li><a href="/pages/wiki/"        class="nav-link">Wiki</a></li>
      <li><a href="/pages/faq/"         class="nav-link">FAQ</a></li>
      <li><a href="/pages/noticias/"    class="nav-link">Noticias</a></li>
      <li><a href="/pages/documentos/"  class="nav-link">Documentos</a></li>
      <li><a href="/pages/calendario/"  class="nav-link">Calendario</a></li>
    </ul>

    <!-- Acciones de usuario -->
    <div class="navbar-acciones">
      <!-- Visible cuando NO hay sesión -->
      <a href="/pages/auth/login.html" class="btn btn-secundario" id="btn-login-nav">
        Iniciar Sesión
      </a>
      <!-- Visible cuando HAY sesión (oculto por defecto) -->
      <div class="navbar-usuario" id="navbar-usuario" style="display:none">
        <span id="navbar-nombre-usuario"></span>
        <a href="/admin/" id="link-admin" style="display:none">Panel Admin</a>
        <button id="btn-logout" class="btn btn-secundario">Salir</button>
      </div>
    </div>

    <!-- Hamburguesa (móvil) -->
    <button class="navbar-hamburguesa" id="btn-hamburguesa" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
```

```css
/* assets/css/layout.css — Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--color-primario-dark);
  height: var(--alto-navbar);
  box-shadow: var(--sombra-md);
}
.navbar-contenido {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--esp-6);
}
.navbar-menu {
  display: none;       /* Oculto en móvil */
  list-style: none;
  gap: var(--esp-4);
}
.nav-link {
  color: rgba(255,255,255,0.85);
  font-weight: 500;
  padding: var(--esp-2) var(--esp-3);
  border-radius: var(--radio-sm);
  transition: all var(--transicion);
}
.nav-link:hover, .nav-link.activo {
  color: white;
  background: rgba(255,255,255,0.15);
  text-decoration: none;
}
/* Desktop: mostrar menú, ocultar hamburguesa */
@media (min-width: 768px) {
  .navbar-menu { display: flex; }
  .navbar-hamburguesa { display: none; }
}
```

### Footer (`components/footer.html`)

```html
<footer class="footer">
  <div class="container footer-contenido">
    <div class="footer-logo">
      <img src="/assets/img/logo-white.png" alt="UNEXCA" height="50">
      <p>Universidad Nacional Experimental<br>de la Gran Caracas</p>
    </div>

    <div class="footer-redes">
      <h4>Síguenos</h4>
      <!-- Los enlaces se cargan dinámicamente desde Supabase -->
      <div id="redes-sociales">
        <a href="#" id="link-instagram" class="btn-red-social" target="_blank" rel="noopener">
          📷 Instagram
        </a>
        <a href="#" id="link-whatsapp" class="btn-red-social" target="_blank" rel="noopener">
          💬 WhatsApp
        </a>
        <a href="#" id="link-telegram" class="btn-red-social" target="_blank" rel="noopener">
          ✈️ Telegram
        </a>
      </div>
    </div>

    <div class="footer-links">
      <h4>Acceso Rápido</h4>
      <ul>
        <li><a href="/pages/wiki/">Wiki Institucional</a></li>
        <li><a href="/pages/faq/">Preguntas Frecuentes</a></li>
        <li><a href="/pages/calendario/">Calendario Académico</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-copyright">
    <p>© <span id="anio-actual"></span> UNEXCA — Todos los derechos reservados</p>
  </div>
</footer>
```

### Cómo incluir los componentes en HTML

Dado que el proyecto no usa un framework, los componentes se incluyen mediante JavaScript:

```javascript
// Función helper para incluir HTML desde archivos externos
async function incluirComponente(selector, rutaArchivo) {
  const respuesta = await fetch(rutaArchivo);
  const html = await respuesta.text();
  document.querySelector(selector).innerHTML = html;
}

// Usar al inicio de cada página:
await incluirComponente('#navbar-placeholder',  '/components/navbar.html');
await incluirComponente('#footer-placeholder', '/components/footer.html');
```

Cada página HTML incluye los placeholders:
```html
<div id="navbar-placeholder"></div>
<!-- ... contenido de la página ... -->
<div id="footer-placeholder"></div>
```

---

## 13. Patrones de Código JavaScript

### Patrón estándar para cualquier módulo

```javascript
// Toda página JS sigue esta estructura:

// 1. Importar dependencias
import { supabase } from '/assets/js/supabase-client.js';
import { getParamURL, formatearFecha, mostrarCarga } from '/assets/js/utils.js';
import { getUsuarioActual } from '/assets/js/auth.js';

// 2. Inicializar la página
async function init() {
  mostrarCarga(true);
  await cargarDatos();
  await ajustarPorRol();
  mostrarCarga(false);
}

// 3. Cargar datos desde Supabase
async function cargarDatos() {
  const { data, error } = await supabase
    .from('nombre_tabla')
    .select('columnas')
    .eq('condicion', valor)
    .order('columna');

  if (error) {
    console.error('Error cargando datos:', error);
    return;
  }

  renderizarDatos(data);
}

// 4. Renderizar HTML
function renderizarDatos(items) {
  const contenedor = document.getElementById('mi-contenedor');
  if (!items?.length) {
    contenedor.innerHTML = '<p>No hay contenido disponible.</p>';
    return;
  }
  contenedor.innerHTML = items.map(item => generarTarjeta(item)).join('');
}

// 5. Ajustar UI según rol del usuario
async function ajustarPorRol() {
  const usuario = await getUsuarioActual();
  const botonesAdmin = document.querySelectorAll('.solo-admin');
  botonesAdmin.forEach(btn => {
    btn.style.display = (usuario?.perfil.rol === 'admin') ? 'block' : 'none';
  });
}

// Ejecutar
init();
```

### CRUD con Supabase

```javascript
// ─── CREAR ────────────────────────────────────
const { data, error } = await supabase
  .from('wiki_articulos')
  .insert({
    titulo: 'Mi artículo',
    contenido: 'Contenido del artículo...',
    categoria_id: 1,
    publicado: false,
  })
  .select()   // Devolver el registro creado
  .single();

// ─── LEER ─────────────────────────────────────
const { data: articulos } = await supabase
  .from('wiki_articulos')
  .select(`
    id, titulo, contenido, creado_en,
    wiki_categorias ( nombre ),
    perfiles ( nombre_completo )
  `)
  .eq('publicado', true)
  .order('creado_en', { ascending: false })
  .limit(10);

// ─── ACTUALIZAR ───────────────────────────────
const { error } = await supabase
  .from('wiki_articulos')
  .update({ titulo: 'Nuevo título', publicado: true })
  .eq('id', articuloId);

// ─── ELIMINAR ─────────────────────────────────
const { error } = await supabase
  .from('wiki_articulos')
  .delete()
  .eq('id', articuloId);

// ─── SUBIR ARCHIVO ────────────────────────────
async function subirArchivo(archivo, carpeta) {
  const nombreArchivo = `${Date.now()}-${archivo.name}`;
  const { data, error } = await supabase.storage
    .from('documentos')               // Nombre del bucket en Supabase Storage
    .upload(`${carpeta}/${nombreArchivo}`, archivo);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;           // URL pública del archivo
}
```

---

## 14. Panel de Administración

### Estructura del panel

El panel (`/admin/`) es accesible **solo para el rol `admin`**. La primera línea de `admin.js` verifica esto:

```javascript
// admin/admin.js
import { requiereAutenticacion } from '/assets/js/auth.js';
await requiereAutenticacion('admin');
```

### Dashboard (`admin/index.html`)

Muestra estadísticas en tarjetas:
- Total de usuarios registrados
- Total de artículos publicados en Wiki
- Total de preguntas en FAQ
- Noticias publicadas este mes

```javascript
// Obtener estadísticas para el dashboard
async function cargarEstadisticas() {
  const [usuarios, articulos, preguntas, noticias] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }),
    supabase.from('wiki_articulos').select('*', { count: 'exact', head: true }).eq('publicado', true),
    supabase.from('faq_preguntas').select('*', { count: 'exact', head: true }).eq('publicado', true),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('publicado', true),
  ]);

  document.getElementById('stat-usuarios').textContent = usuarios.count;
  document.getElementById('stat-articulos').textContent = articulos.count;
  document.getElementById('stat-preguntas').textContent = preguntas.count;
  document.getElementById('stat-noticias').textContent = noticias.count;
}
```

### Gestión de usuarios (`admin/usuarios.html`)

Muestra tabla de todos los usuarios con opciones para:
- Ver nombre, email, rol y estado
- Cambiar el rol de un usuario
- Activar/desactivar una cuenta

```javascript
async function cambiarRolUsuario(usuarioId, nuevoRol) {
  const { error } = await supabase
    .from('perfiles')
    .update({ rol: nuevoRol })
    .eq('id', usuarioId);

  if (!error) {
    alert(`Rol actualizado a: ${nuevoRol}`);
    await cargarUsuarios(); // Recargar tabla
  }
}
```

---

## 15. Despliegue

### Opción A: Vercel (recomendado)

```bash
# 1. Instalar Vercel CLI (opcional, también se puede desde la web)
npm i -g vercel

# 2. Desde la raíz del proyecto
vercel login
vercel

# 3. En el panel de Vercel:
#    - Conectar con GitHub → seleccionar el repositorio
#    - Framework Preset: Other (no es React, no es Next)
#    - Build Command: dejar vacío
#    - Output Directory: . (raíz del proyecto)
```

**URL resultante:** `https://unexca-[hash].vercel.app`

Se puede personalizar en el panel de Vercel a algo como: `unexca.vercel.app`

### Opción B: Netlify

```
1. Ir a app.netlify.com → Add new site → Import from GitHub
2. Seleccionar el repositorio
3. Build command: (vacío)
4. Publish directory: . (raíz)
5. Deploy site
```

**URL resultante:** `https://unexca.netlify.app` (si el nombre está disponible)

### Variables de entorno en producción

En Vercel/Netlify, agregar las variables de entorno en el panel de configuración:
- `SUPABASE_URL` → tu URL del proyecto Supabase
- `SUPABASE_ANON_KEY` → tu clave pública

> ⚠️ Estas se leen desde `assets/js/supabase-client.js`. Para sitios estáticos sin proceso de build, las variables deben estar hardcodeadas en el archivo JS (la ANON_KEY es pública por diseño de Supabase). La SERVICE_ROLE_KEY nunca debe exponerse.

### Configurar dominio temporal

```
vercel.app:   unexca-portal.vercel.app
netlify.app:  unexca-nucleoaltagracia.netlify.app
```

Para el proyecto académico, cualquiera de estos es suficiente.

---

## 16. Flujo de Trabajo Git

### Configuración inicial del repositorio

```bash
# Crear repositorio en GitHub primero, luego:
git clone https://github.com/[usuario]/unexca-web.git
cd unexca-web

# Crear la estructura básica de carpetas
mkdir -p assets/css assets/js assets/img pages/auth pages/wiki \
  pages/faq pages/noticias pages/documentos pages/calendario \
  admin supabase components

# Primer commit
git add .
git commit -m "feat: estructura inicial del proyecto"
git push origin main
```

### Modelo de ramas

```
main         ← Producción (solo código probado)
  └── develop ← Integración (se hace merge aquí antes de ir a main)
        ├── feat/modulo-wiki
        ├── feat/modulo-faq
        ├── feat/autenticacion
        ├── feat/panel-admin
        └── fix/bug-que-sea
```

### Flujo de trabajo diario

```bash
# 1. Actualizar tu rama local
git checkout develop
git pull origin develop

# 2. Crear rama para tu funcionalidad
git checkout -b feat/modulo-wiki

# 3. Trabajar, guardar cambios
git add .
git commit -m "feat: agregar listado de categorías wiki"

# 4. Cuando termines, subir y hacer Pull Request a develop
git push origin feat/modulo-wiki
```

### Convención de commits

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
style:    Cambios de CSS/diseño (sin afectar lógica)
db:       Cambios en esquema o datos de la BD
docs:     Documentación
refactor: Mejora de código sin cambiar comportamiento
chore:    Tareas de mantenimiento (actualizar .gitignore, etc.)
```

### `.gitignore`

```gitignore
# Variables de entorno — NUNCA subir
.env
.env.local
.env.*.local

# Sistema operativo
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json
.idea/

# Node (si se usa)
node_modules/
npm-debug.log

# Vercel/Netlify
.vercel/
.netlify/
```

---

## 17. Herramientas e IA

### IAs disponibles para el desarrollo

| Herramienta | Tipo | Mejor para |
|-------------|------|-----------|
| **Claude Pro** | En línea (pago) | Diseño de arquitectura, código complejo, resolución de bugs difíciles, generación de componentes completos |
| **Gemini Pro** | En línea (pago) | Segunda opinión, generación de contenido en español, búsquedas con información reciente |
| **DeepSeek API** | En línea (pago, API) | Generación de código eficiente, alternativa a Claude para tareas de código puro |
| **Qwen 3.5 9B (Roo Code)** | Local en VSCode | Autocompletado en tiempo real, sugerencias inline sin internet |

### Cómo usar la IA de forma efectiva en este proyecto

**Prompt tipo para generar una página nueva:**
```
Tengo un proyecto web: Portal de UNEXCA (universidad venezolana).
Stack: HTML5 + CSS3 + JS Vanilla + Supabase (PostgreSQL).
Lee el UNEXCA_MASTER.md que te adjunto para contexto completo.

Genera la página completa: [nombre del módulo]
Tabla en Supabase: [nombre de la tabla]
Columnas relevantes: [lista de columnas]
Diseño: usa las variables CSS del base.css (ya definidas en el .md).
Incluye importaciones a supabase-client.js y utils.js.
```

**Prompt para debug:**
```
Tengo un error en el módulo [X] del Portal UNEXCA.
Stack: JS Vanilla + Supabase SDK.
El error es: [pegar error de consola]
Mi código actual: [pegar código]
¿Qué está mal y cómo lo arreglo?
```

### Extensiones recomendadas para VSCode

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",       // Formateo de código automático
    "ms-vscode.live-server",        // Servidor local para ver cambios en tiempo real
    "eamodio.gitlens",              // Historial de Git en el editor
    "bradlc.vscode-tailwindcss",    // (si usas Tailwind en el futuro)
    "formulahendry.auto-rename-tag" // Renombra el tag de cierre automáticamente
  ]
}
```

---

## 18. Glosario

| Término | Definición |
|---------|-----------|
| **API** | Canal de comunicación entre programas. Supabase expone una API que nuestro JavaScript usa para leer y escribir datos. |
| **BaaS** | Backend como Servicio. Supabase nos da base de datos, auth y archivos sin que programemos un servidor propio. |
| **CRUD** | Create, Read, Update, Delete. Las 4 operaciones básicas sobre datos. |
| **ES6+** | Versión moderna de JavaScript (2015 en adelante) con clases, arrow functions, async/await, módulos. |
| **Frontend** | Lo que ve el usuario: HTML, CSS y JavaScript en el navegador. |
| **Jamstack** | Arquitectura con frontend estático + APIs. Sin servidor propio. |
| **JSON** | Formato de datos. Cuando Supabase responde, devuelve JSON que JavaScript lee fácilmente. |
| **JWT** | Token de seguridad que Supabase usa para identificar al usuario logueado en cada petición. |
| **Módulo** | Sección independiente del sitio con su propia carpeta, CSS y JS. |
| **PostgreSQL** | Motor de base de datos SQL que usa Supabase internamente. |
| **RLS** | Row Level Security. Reglas en la BD que controlan quién puede ver o modificar cada fila. |
| **SDK** | Kit de código que simplifica usar una API. Supabase tiene un SDK para JavaScript. |
| **Seed** | Datos de ejemplo para poblar la base de datos durante el desarrollo. |
| **Trigger** | Función en la BD que se ejecuta automáticamente ante un evento (ej: crear perfil al registrarse). |
| **UUID** | ID único universal. Supabase lo usa para identificar usuarios. Ejemplo: `f47ac10b-58cc-4372-a567-0e02b2c3d479` |

---

## 19. Contexto para IAs

> Esta sección es especialmente útil para modelos de IA que leerán este documento para ayudar en el desarrollo.

### Resumen rápido del proyecto

- **Qué es:** Portal web institucional para UNEXCA (universidad en Venezuela). No tiene página web actualmente.
- **Stack:** HTML5 + CSS3 + JavaScript ES6+ (vanilla, sin frameworks) + Supabase (PostgreSQL/BaaS) + Vercel/Netlify.
- **Idioma de la UI:** Español venezolano exclusivamente.
- **Roles:** `admin`, `personal`, `estudiante` + visitante no autenticado.
- **Módulos:** Wiki, FAQ, Noticias, Documentos, Calendario, Redes Sociales, Panel Admin.
- **Colores principales:** `#022A6F` (azul universitario), `#000C4D` (azul oscuro), `#161823` (casi negro), `#FFFFFF` (blanco), `#48597E` (azul medio).
- **Base de datos:** Tablas en `public` schema de Supabase. Todas con RLS activado.

### Convenciones del proyecto que DEBES respetar

1. **Sin frameworks:** No generes código con React, Vue, Angular ni ningún framework JS.
2. **Módulos ES6:** Usa `import`/`export` con `type="module"` en los scripts.
3. **Supabase SDK vía CDN:** `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'`
4. **Variables CSS:** Usa siempre las variables del `:root` (ej: `var(--color-primario)`), nunca valores hexadecimales hardcodeados en CSS.
5. **Nomenclatura:** snake_case para SQL, camelCase para JS, kebab-case para CSS y archivos HTML.
6. **Español:** Todos los textos de la UI, comentarios y variables descriptivas en español.
7. **Mobile-first:** El CSS base es para móvil; desktop se define con `@media (min-width: ...)`.
8. **Siempre verificar rol** antes de mostrar botones de edición/eliminación en cualquier módulo.
9. **Siempre manejar el estado vacío:** Si una consulta devuelve 0 resultados, mostrar un mensaje, no una página en blanco.
10. **Siempre manejar errores:** Toda llamada a Supabase debe tener manejo de `error`.

### Archivos que SIEMPRE deben importarse en cada página JS

```javascript
import { supabase }           from '/assets/js/supabase-client.js';
import { getUsuarioActual }   from '/assets/js/auth.js';
import { formatearFecha, 
         getParamURL, 
         mostrarCarga }       from '/assets/js/utils.js';
```

### Estado actual del proyecto

| Item | Estado |
|------|--------|
| Documentación | ✅ Completa |
| Repositorio GitHub | ✅ Completa |
| Proyecto Supabase | ✅ Completa |
| Schema SQL | ✅ Completa |
| Estructura de carpetas | ✅ Completa |
| `base.css` | ✅ Completa |
| `layout.css` | ✅ Completa |
| `components.css` | ✅ Completa |
| `supabase-client.js` | ✅ Completa |
| `auth.js` | ✅ Completa |
| `utils.js` | ✅ Completa |
| Login / Registro | ✅ Completa |
| Módulo Wiki | ✅ Completa |
| Módulo FAQ | ✅ Completa |
| Módulo Noticias | ✅ Completa |
| Módulo Documentos | ✅ Completa |
| Módulo Calendario | ✅ Completa |
| Panel Admin | ✅ Completa |
| Página de inicio | ✅ Completa |
| Despliegue en Vercel/Netlify | ✅ Completa |

### Orden de construcción recomendado

```
1. Crear proyecto Supabase → ejecutar 01_schema.sql, 02_rls.sql, 03_triggers.sql, 04_seed.sql
2. Crear repositorio GitHub → estructura de carpetas
3. assets/css/base.css → assets/css/layout.css → assets/css/components.css
4. assets/js/supabase-client.js → assets/js/auth.js → assets/js/utils.js
5. components/navbar.html → components/footer.html
6. index.html (página de inicio)
7. pages/auth/ (login y registro)
8. pages/wiki/ (módulo completo)
9. pages/faq/
10. pages/noticias/
11. pages/documentos/
12. pages/calendario/
13. admin/ (panel completo)
14. Pruebas de responsividad
15. Despliegue en Vercel/Netlify
```

---

*Documento generado para el Proyecto Sociotecnológico II — UNEXCA*
*Versión 1.0 — 2025*
*Este documento es de referencia técnica completa. Cualquier cambio en la arquitectura debe reflejarse aquí.*
