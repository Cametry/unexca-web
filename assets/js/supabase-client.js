// ARCHIVO: assets/js/supabase-client.js
// ÚNICO lugar donde se inicializa Supabase. TODOS los módulos importan desde aquí.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Estas constantes son PÚBLICAS por diseño (anon key). La seguridad la da RLS.
const SUPABASE_URL = 'https://hfxxudfnsvfkpcvtdjhc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_k6OaHsqAXI_H7fhmlefKbA_QXJ9QEok';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
