import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { formatearFecha, truncar, getParamURL, mostrarCarga, incluirComponente, setAnioActual, sanitizar, mostrarError, ocultarError, initHamburguesa } from '/assets/js/utils.js';

/* ─── Inicialización ─────────────────────────── */

async function init() {
  await incluirComponente('#navbar-placeholder', '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');
  await actualizarNavbar();
  initHamburguesa();
  setAnioActual();
  mostrarCarga(true);
  await ejecutarModulo();
  mostrarCarga(false);
}

/* ─── Detección de página ────────────────────── */

async function ejecutarModulo() {
  const path = window.location.pathname;

  if (path.endsWith('noticia.html') || path.endsWith('noticia/')) {
    await cargarNoticia();
  } else {
    await cargarNoticias(null);
    iniciarFiltros();
  }
}

/* ─── Página principal: Listado de noticias ──── */

async function cargarNoticias(categoria = null) {
  ocultarError();
  const contenedor = document.getElementById('noticias-grid');
  const sinResultados = document.getElementById('sin-resultados');

  if (!contenedor) return;

  try {
    let query = supabase
      .from('noticias')
      .select('id, titulo, resumen, portada_url, categoria, publicado_en')
      .eq('publicado', true);

    if (categoria !== null) {
      query = query.eq('categoria', categoria);
    }

    const { data: noticias, error } = await query
      .order('publicado_en', { ascending: false })
      .limit(12);

    if (error) throw error;

    if (!noticias || noticias.length === 0) {
      contenedor.innerHTML = '';
      sinResultados.style.display = 'block';
      return;
    }

    sinResultados.style.display = 'none';
    contenedor.innerHTML = noticias.map(n => {
      const portadaHtml = n.portada_url
        ? `<img class="card-imagen" src="${sanitizar(n.portada_url)}" alt="${sanitizar(n.titulo)}" loading="lazy">`
        : `<div class="card-imagen-placeholder"><span class="badge badge-categoria">${sanitizar(n.categoria)}</span></div>`;

      return `
        <a href="/pages/noticias/noticia?id=${n.id}" class="card card--noticia">
          ${portadaHtml}
          <div class="card-body">
            <span class="badge badge-categoria">${sanitizar(n.categoria)}</span>
            <h3 class="card-titulo">${sanitizar(n.titulo)}</h3>
            <p class="card-texto">${sanitizar(truncar(n.resumen, 150))}</p>
            <span class="card-fecha">${formatearFecha(n.publicado_en)}</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (e) {
    console.error('Error al cargar noticias:', e);
    mostrarError('Ocurrió un error al cargar las noticias. Intenta de nuevo más tarde.');
  }
}

/* ─── Filtros por categoría ──────────────────── */

function iniciarFiltros() {
  const botones = document.querySelectorAll('.filtro-categoria');
  if (!botones.length) return;

  botones.forEach(btn => {
    btn.addEventListener('click', async () => {
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      const categoria = btn.dataset.categoria;
      mostrarCarga(true);
      await cargarNoticias(categoria === 'null' ? null : categoria);
      mostrarCarga(false);
    });
  });
}

/* ─── Página de noticia individual ───────────── */

async function cargarNoticia() {
  ocultarError();
  const noticiaId = getParamURL('id');

  if (!noticiaId) {
    mostrarError('No se especificó una noticia.');
    return;
  }

  try {
    const { data: noticia, error } = await supabase
      .from('noticias')
      .select('*')
      .eq('id', noticiaId)
      .eq('publicado', true)
      .single();

    if (error) throw error;

    if (!noticia) {
      mostrarError('La noticia no existe o no está disponible.');
      return;
    }

    // Obtener nombre del autor
    let autorNombre = 'Desconocido';
    if (noticia.autor_id) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre_completo')
        .eq('id', noticia.autor_id)
        .single();
      if (perfil) autorNombre = perfil.nombre_completo;
    }

    // Portada
    const portadaEl = document.getElementById('noticia-portada');
    if (portadaEl) {
      if (noticia.portada_url) {
        portadaEl.innerHTML = `<img src="${sanitizar(noticia.portada_url)}" alt="${sanitizar(noticia.titulo)}" class="noticia-portada-img">`;
      }
    }

    // Badge
    const badgeEl = document.getElementById('noticia-badge');
    if (badgeEl) badgeEl.textContent = noticia.categoria;

    // Título
    const tituloEl = document.getElementById('noticia-titulo');
    if (tituloEl) tituloEl.textContent = noticia.titulo;

    // Metadatos
    const autorEl = document.getElementById('noticia-autor');
    if (autorEl) autorEl.textContent = `Por: ${autorNombre}`;

    const fechaEl = document.getElementById('noticia-fecha');
    if (fechaEl) fechaEl.textContent = formatearFecha(noticia.publicado_en);

    // Contenido
    const contenidoEl = document.getElementById('contenido-noticia');
    if (contenidoEl) contenidoEl.innerHTML = noticia.contenido || '';

    // Breadcrumb
    const migaEl = document.getElementById('miga-noticia');
    if (migaEl) migaEl.textContent = noticia.titulo;

    // Botón editar — visible solo si rol IN (personal, admin)
    const btnEditar = document.getElementById('btn-editar');
    if (btnEditar) {
      const usuario = await getUsuarioActual();
      const rol = usuario?.perfil?.rol;
      if (rol === 'personal' || rol === 'admin') {
        btnEditar.style.display = 'inline-flex';
        btnEditar.href = `/pages/noticias/editar?id=${noticiaId}`;
      }
    }
  } catch (e) {
    console.error('Error al cargar la noticia:', e);
    mostrarError('Ocurrió un error al cargar la noticia. Intenta de nuevo más tarde.');
  }
}

/* ─── Arranque ───────────────────────────────── */

init().catch(console.error);
