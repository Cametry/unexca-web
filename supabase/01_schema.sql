-- ============================================================
-- 01_schema.sql — Creación de tablas
-- Portal Web UNEXCA v1.0
-- ============================================================

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

CREATE TABLE public.wiki_categorias (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  icono       TEXT DEFAULT '📄',
  orden       INTEGER DEFAULT 0,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE public.faq_categorias (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  icono  TEXT DEFAULT '❓',
  orden  INTEGER DEFAULT 0
);

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
  ('descripcion_sitio','Portal oficial de la Universidad Nacional Experimental de la Gran Caracas','SEO descripción'),
  ('aviso_activo',     'false',                                  'Activa/desactiva la barra de aviso superior'),
  ('aviso_texto',      '',                                       'Texto que aparece en la barra de aviso superior');