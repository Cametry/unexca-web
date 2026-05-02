-- ============================================================
-- 04_seed.sql — Datos de prueba para desarrollo
-- ============================================================
-- Fecha: 2026-05-01
-- Nota: Las fechas están en 2026 para que sean visibles
--       con la fecha actual del sistema (2026-05-01).
-- ============================================================

-- ─── Calendario de eventos ──────────────────────────────────

INSERT INTO public.calendario_eventos (titulo, descripcion, fecha_inicio, fecha_fin, tipo, color) VALUES
  ('Inicio de Inscripciones','Apertura del período','2026-07-15','2026-07-31','Inscripción','#022A6F'),
  ('Inicio de Clases',       'Comienzo del semestre','2026-08-18',NULL,       'Clases',     '#1A7A3C'),
  ('Exámenes Finales',       'Semana de exámenes',   '2026-11-17','2026-11-28','Examen',    '#C17800');
