-- ============================================================
-- 03_triggers.sql — Triggers automáticos
-- Portal Web UNEXCA v1.0
-- ============================================================

-- Auto-crear perfil al registrarse
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

-- Auto-actualizar campo actualizado_en
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ts_perfiles
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER ts_wiki
  BEFORE UPDATE ON public.wiki_articulos
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();