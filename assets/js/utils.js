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
  const menu = document.getElementById('navbar-menu');
  if (!hamburguesa || !menu) return;

  hamburguesa.addEventListener('click', function (e) {
    e.stopPropagation();
    const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
    menu.classList.toggle('navbar-menu--abierto');
    this.classList.toggle('activo');
    this.setAttribute('aria-expanded', expanded);

    // Lock body scroll when menu is open
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Cerrar menú al hacer clic en un enlace
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('navbar-menu--abierto');
      hamburguesa.classList.remove('activo');
      hamburguesa.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // Restore scroll
    });
  });
}
