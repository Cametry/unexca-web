-- ============================================================
-- RLS Policies: Rol "personal" con edición solo por autor
-- ============================================================
-- Ejecutar en Supabase SQL Editor
-- Requiere que exista la función: get_rol_usuario()
-- ============================================================

-- ============================================================
-- WIKI: wiki_articulos
-- ============================================================

-- Personal puede INSERTAR (cualquier personal/admin)
DROP POLICY IF EXISTS "wiki_art_insert" ON public.wiki_articulos;
CREATE POLICY "wiki_art_insert" ON public.wiki_articulos
  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal', 'admin'));

-- Personal solo puede UPDATE sus propios artículos; admin puede todo
DROP POLICY IF EXISTS "wiki_art_update" ON public.wiki_articulos;
CREATE POLICY "wiki_art_update" ON public.wiki_articulos
  FOR UPDATE USING (
    get_rol_usuario() = 'admin'
    OR (
      get_rol_usuario() = 'personal'
      AND autor_id = auth.uid()
    )
  );

-- Personal solo puede DELETE sus propios artículos; admin puede todo
DROP POLICY IF EXISTS "wiki_art_delete" ON public.wiki_articulos;
CREATE POLICY "wiki_art_delete" ON public.wiki_articulos
  FOR DELETE USING (
    get_rol_usuario() = 'admin'
    OR (
      get_rol_usuario() = 'personal'
      AND autor_id = auth.uid()
    )
  );

-- ============================================================
-- NOTICIAS
-- ============================================================

DROP POLICY IF EXISTS "noticias_personal_insert" ON public.noticias;
CREATE POLICY "noticias_personal_insert" ON public.noticias
  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal', 'admin'));

DROP POLICY IF EXISTS "noticias_personal_update" ON public.noticias;
CREATE POLICY "noticias_personal_update" ON public.noticias
  FOR UPDATE USING (
    get_rol_usuario() = 'admin'
    OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
  );

DROP POLICY IF EXISTS "noticias_personal_delete" ON public.noticias;
CREATE POLICY "noticias_personal_delete" ON public.noticias
  FOR DELETE USING (
    get_rol_usuario() = 'admin'
    OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
  );

-- ============================================================
-- FAQ: faq_preguntas
-- ============================================================

DROP POLICY IF EXISTS "faq_preg_insert" ON public.faq_preguntas;
CREATE POLICY "faq_preg_insert" ON public.faq_preguntas
  FOR INSERT WITH CHECK (get_rol_usuario() IN ('personal', 'admin'));

DROP POLICY IF EXISTS "faq_preg_update" ON public.faq_preguntas;
CREATE POLICY "faq_preg_update" ON public.faq_preguntas
  FOR UPDATE USING (
    get_rol_usuario() = 'admin'
    OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
  );

DROP POLICY IF EXISTS "faq_preg_delete" ON public.faq_preguntas;
CREATE POLICY "faq_preg_delete" ON public.faq_preguntas
  FOR DELETE USING (
    get_rol_usuario() = 'admin'
    OR (get_rol_usuario() = 'personal' AND autor_id = auth.uid())
  );
