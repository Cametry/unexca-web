import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { formatearFecha, mostrarCarga, incluirComponente, setAnioActual, sanitizar, mostrarError, ocultarError, initHamburguesa } from '/assets/js/utils.js';

/* ─── Helpers ─────────────────────────────── */

/**
 * Obtiene la fecha de hoy en formato ISO (YYYY-MM-DD).
 * @returns {string}
 */
function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Obtiene el primer día del año actual en formato ISO.
 * @returns {string}
 */
function inicioAnioISO() {
  return `${new Date().getFullYear()}-01-01`;
}

/**
 * Obtiene el último día del año actual en formato ISO.
 * @returns {string}
 */
function finAnioISO() {
  return `${new Date().getFullYear()}-12-31`;
}

/**
 * Renderiza un evento individual como tarjeta con línea de color lateral.
 * @param {Object} ev - Objeto evento de la base de datos.
 * @returns {string} HTML del evento.
 */
function renderEvento(ev) {
  const titulo = sanitizar(ev.titulo);
  const descripcion = ev.descripcion ? sanitizar(ev.descripcion) : '';
  const color = ev.color || '#022A6F';
  const tipo = sanitizar(ev.tipo || 'General');

  let fechasHtml = `<span class="evento-fecha">${formatearFecha(ev.fecha_inicio)}</span>`;
  if (ev.fecha_fin) {
    fechasHtml += ` <span class="evento-fecha-sep">—</span> <span class="evento-fecha">${formatearFecha(ev.fecha_fin)}</span>`;
  }

  return `
    <div class="evento-card">
      <div class="evento-barra" style="background-color:${color}"></div>
      <div class="evento-contenido">
        <div class="evento-encabezado">
          <span class="badge badge-evento">${tipo}</span>
          <h3 class="evento-titulo">${titulo}</h3>
        </div>
        <div class="evento-fechas">${fechasHtml}</div>
        ${descripcion ? `<p class="evento-descripcion">${descripcion}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Renderiza el estado vacío para una sección.
 * @param {string} mensaje - Texto a mostrar.
 * @returns {string} HTML del estado vacío.
 */
function renderVacio(mensaje) {
  return `
    <div class="vacio">
      <p>${mensaje}</p>
    </div>
  `;
}

/* ─── Carga de eventos ────────────────────── */

async function cargarEventos() {
  ocultarError();
  const contenedorProximos = document.getElementById('proximos-eventos');
  const contenedorTodos = document.getElementById('todos-eventos');
  const vacioProximos = document.getElementById('proximos-vacio');
  const vacioTodos = document.getElementById('todos-vacio');

  if (!contenedorProximos || !contenedorTodos) return;

  try {
    const hoy = hoyISO();
    const inicioAnio = inicioAnioISO();
    const finAnio = finAnioISO();

    const [resultadoProximos, resultadoTodos] = await Promise.all([
      supabase
        .from('calendario_eventos')
        .select('*')
        .gte('fecha_inicio', hoy)
        .order('fecha_inicio', { ascending: true })
        .limit(5),
      supabase
        .from('calendario_eventos')
        .select('*')
        .gte('fecha_inicio', inicioAnio)
        .lte('fecha_inicio', finAnio)
        .order('fecha_inicio', { ascending: true })
    ]);

    if (resultadoProximos.error) throw resultadoProximos.error;
    if (resultadoTodos.error) throw resultadoTodos.error;

    const proximos = resultadoProximos.data;
    const todos = resultadoTodos.data;

    console.log('📅 Próximos eventos:', proximos);
    console.log('📅 Todos los eventos:', todos);

    /* ─── Próximos eventos ─── */
    if (!proximos || proximos.length === 0) {
      contenedorProximos.innerHTML = '';
      vacioProximos.style.display = 'block';
    } else {
      vacioProximos.style.display = 'none';
      contenedorProximos.innerHTML = proximos.map(renderEvento).join('');
    }

    /* ─── Todos los eventos del año ─── */
    if (!todos || todos.length === 0) {
      contenedorTodos.innerHTML = '';
      vacioTodos.style.display = 'block';
    } else {
      vacioTodos.style.display = 'none';
      contenedorTodos.innerHTML = todos.map(renderEvento).join('');
    }
  } catch (e) {
    console.error('Error al cargar eventos:', e);
    mostrarError('Ocurrió un error al cargar el calendario. Intenta de nuevo más tarde.');
  }
}

/* ─── Botón "Agregar evento" ──────────────── */

async function mostrarBotonAgregar() {
  const btn = document.getElementById('btn-agregar-evento');
  if (!btn) return;

  try {
    const usuario = await getUsuarioActual();
    const rol = usuario?.perfil?.rol;
    if (rol === 'personal' || rol === 'admin') {
      btn.style.display = 'inline-flex';
      btn.href = '/admin/calendario-editor.html';
    }
  } catch (e) {
    // Si no hay sesión, el botón permanece oculto
  }
}

/* ─── Inicialización ──────────────────────── */

async function init() {
  await incluirComponente('#navbar-placeholder', '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');
  await actualizarNavbar();
  initHamburguesa();
  setAnioActual();
  mostrarCarga(true);
  await Promise.all([
    cargarEventos(),
    mostrarBotonAgregar()
  ]);
  mostrarCarga(false);
}

init().catch(console.error);
