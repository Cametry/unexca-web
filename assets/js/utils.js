import { supabase } from './supabase-client.js';

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
  if (!el) return;
  if (mostrar) {
    el.classList.add('spinner--activo');
    el.style.display = 'flex';
  } else {
    el.classList.remove('spinner--activo');
    el.style.display = 'none';
  }
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

export function initHamburguesa() {
  const hamburguesa = document.getElementById('btn-hamburguesa');
  if (!hamburguesa) return;

  // ─── Admin pages: hamburger controls admin sidebar ───
  if (window.location.pathname.startsWith('/admin')) {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (!sidebar) return;

    hamburguesa.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      if (overlay) overlay.classList.toggle('visible');
      document.body.style.overflow =
        sidebar.classList.contains('active') ? 'hidden' : '';
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
      });
    }
    return;
  }

  // ─── Non-admin pages: original drawer logic ───
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('btn-cerrar-drawer');
  if (!hamburguesa || !drawer) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('aria-hidden', 'false');
    hamburguesa.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-hidden', 'true');
    hamburguesa.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburguesa.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

/**
 * Carga dinámicamente la barra de aviso superior desde Supabase.
 * Consulta las claves 'aviso_activo' y 'aviso_texto' en configuracion_sitio.
 * Si aviso_activo = 'true' y hay texto, muestra #barra-aviso con el contenido.
 */
export async function cargarBarraAviso() {
  try {
    const { data, error } = await supabase
      .from('configuracion_sitio')
      .select('clave, valor')
      .in('clave', ['aviso_activo', 'aviso_texto']);

    if (error) throw error;

    const mapa = {};
    if (data) {
      data.forEach(row => { mapa[row.clave] = row.valor; });
    }

    const activo = mapa['aviso_activo'] === 'true';
    const texto = (mapa['aviso_texto'] || '').trim();

    const barra = document.getElementById('barra-aviso');
    const textoEl = document.getElementById('aviso-texto');

    if (activo && texto && barra && textoEl) {
      textoEl.textContent = texto;
      barra.style.display = 'block';
    }
  } catch (e) {
    console.error('Error al cargar barra de aviso:', e);
  }
}
