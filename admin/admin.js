await requiereAutenticacion('admin');

import { supabase } from '/assets/js/supabase-client.js';
import { requiereAutenticacion, getUsuarioActual, actualizarNavbar, cerrarSesion } from '/assets/js/auth.js';
import { formatearFecha, mostrarCarga, incluirComponente, setAnioActual, sanitizar, initHamburguesa } from '/assets/js/utils.js';

/* ─── Resaltar enlace activo en la barra lateral ─── */

export function resaltarNavActivo() {
  try {
    const enlaces = document.querySelectorAll('.admin-sidebar a');
    const rutaActual = window.location.pathname;
    enlaces.forEach(enlace => {
      enlace.classList.remove('activo');
      if (enlace.getAttribute('href') === rutaActual) {
        enlace.classList.add('activo');
      }
    });
  } catch (e) {
    console.error('Error en resaltarNavActivo:', e);
  }
}

/* ─── Cargar estadísticas del dashboard ─────────── */

export async function cargarEstadisticas() {
  try {
    const [usuarios, wiki, faq, noticias] = await Promise.all([
      supabase.from('perfiles').select('*', { count: 'exact', head: true }),
      supabase.from('wiki_articulos').select('*', { count: 'exact', head: true }).eq('publicado', true),
      supabase.from('faq_preguntas').select('*', { count: 'exact', head: true }).eq('publicado', true),
      supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('publicado', true),
    ]);

    return {
      totalUsuarios: usuarios.count ?? 0,
      totalWiki: wiki.count ?? 0,
      totalFaq: faq.count ?? 0,
      totalNoticias: noticias.count ?? 0,
    };
  } catch (e) {
    console.error('Error al cargar estadísticas:', e);
    return { totalUsuarios: 0, totalWiki: 0, totalFaq: 0, totalNoticias: 0 };
  }
}

/* ─── Cargar redes sociales en el footer ────────── */

export async function cargarRedesSociales() {
  try {
    const { data, error } = await supabase
      .from('configuracion_sitio')
      .select('clave, valor')
      .in('clave', ['instagram_url', 'whatsapp_url', 'telegram_url']);

    if (error) throw error;

    const contenedor = document.getElementById('redes-botones');
    if (!contenedor) return;

    const mapa = {};
    if (data) data.forEach(item => { mapa[item.clave] = item.valor; });

    const redes = [
      { url: mapa['instagram_url'], icono: 'fab fa-instagram', label: 'Instagram' },
      { url: mapa['whatsapp_url'], icono: 'fab fa-whatsapp', label: 'WhatsApp' },
      { url: mapa['telegram_url'], icono: 'fab fa-telegram', label: 'Telegram' },
    ];

    contenedor.innerHTML = redes
      .filter(r => r.url)
      .map(r => `<a href="${sanitizar(r.url)}" target="_blank" rel="noopener noreferrer" class="btn-red-social" aria-label="${r.label}"><i class="${r.icono}"></i></a>`)
      .join('');
  } catch (e) {
    console.error('Error al cargar redes sociales:', e);
  }
}

/* ─── Inicialización del panel de administración ── */

export async function initAdmin() {
  try {
    await requiereAutenticacion('admin');

    await incluirComponente('#navbar-placeholder', '/components/navbar.html');
    await incluirComponente('#footer-placeholder', '/components/footer.html');

    await actualizarNavbar();
    setAnioActual();
    resaltarNavActivo();
    cargarRedesSociales();
    initHamburguesa();

    return await getUsuarioActual();
  } catch (e) {
    console.error('Error en initAdmin:', e);
  }
}
