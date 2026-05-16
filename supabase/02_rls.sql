-- ============================================================
-- 02_rls.sql — Row Level Security
-- Portal Web UNEXCA v1.0
-- ============================================================

ALTER TABLE public.perfiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categorias     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articulos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categorias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_preguntas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_eventos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sitio ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_rol_usuario()
RETURNS TEXT AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PERFILES
CREATE POLICY "perfiles_ver"    ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "perfiles_propio" ON public.perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "perfiles_admin"  ON public.perfiles FOR ALL    USING (get_rol_usuario() = 'admin');

-- WIKI
CREATE POLICY "wiki_cat_leer"     ON public.wiki_categorias FOR SELECT USING (true);
CREATE POLICY "wiki_cat_escribir" ON public.wiki_categorias FOR ALL USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_leer"     ON public.wiki_articulos  FOR SELECT USING (publicado = true);
CREATE POLICY "wiki_art_personal_ver" ON public.wiki_articulos FOR SELECT USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_insert"   ON public.wiki_articulos  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "wiki_art_update"   ON public.wiki_articulos  FOR UPDATE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);
CREATE POLICY "wiki_art_delete"   ON public.wiki_articulos  FOR DELETE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);

-- FAQ
CREATE POLICY "faq_cat_leer"     ON public.faq_categorias FOR SELECT USING (true);
CREATE POLICY "faq_cat_escribir" ON public.faq_categorias FOR ALL USING (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "faq_leer"         ON public.faq_preguntas  FOR SELECT USING (publicado = true);
CREATE POLICY "faq_insert"       ON public.faq_preguntas  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "faq_update"       ON public.faq_preguntas  FOR UPDATE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);
CREATE POLICY "faq_delete"       ON public.faq_preguntas  FOR DELETE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);

-- NOTICIAS
CREATE POLICY "noticias_leer"    ON public.noticias FOR SELECT USING (publicado = true);
CREATE POLICY "noticias_insert"  ON public.noticias FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "noticias_update"  ON public.noticias FOR UPDATE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);
CREATE POLICY "noticias_delete"  ON public.noticias FOR DELETE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
);

-- DOCUMENTOS
CREATE POLICY "docs_publicos"   ON public.documentos FOR SELECT USING (acceso_minimo = 'publico');
CREATE POLICY "docs_estudiante" ON public.documentos FOR SELECT USING (
  acceso_minimo = 'estudiante' AND auth.uid() IS NOT NULL
  AND get_rol_usuario() IN ('estudiante','personal','admin')
);
CREATE POLICY "docs_personal"   ON public.documentos FOR ALL USING (get_rol_usuario() IN ('personal','admin'));

-- CALENDARIO
CREATE POLICY "cal_leer"     ON public.calendario_eventos FOR SELECT USING (true);
CREATE POLICY "cal_insert"   ON public.calendario_eventos FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal','admin'));
CREATE POLICY "cal_update"   ON public.calendario_eventos FOR UPDATE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND creado_por = auth.uid())
);
CREATE POLICY "cal_delete"   ON public.calendario_eventos FOR DELETE USING (
  get_rol_usuario() = 'admin' OR (get_rol_usuario() = 'personal' AND creado_por = auth.uid())
);

-- CONFIGURACION
CREATE POLICY "config_leer"  ON public.configuracion_sitio FOR SELECT USING (true);
CREATE POLICY "config_admin" ON public.configuracion_sitio FOR ALL USING (get_rol_usuario() = 'admin');