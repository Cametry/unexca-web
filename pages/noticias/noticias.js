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

  if (path.endsWith('noticia.html') || path.endsWith('noticia/') || path.endsWith('noticia')) {
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
      const categoria = sanitizar(n.categoria);
      const categoriaLower = categoria.toLowerCase();
      const badgeClass = `news-badge news-badge--${categoriaLower}`;

      return `
        <a href="/pages/noticias/noticia?id=${n.id}" class="news-card">
          <div class="news-cover">
            ${n.portada_url ? `<img src="${sanitizar(n.portada_url)}" alt="${sanitizar(n.titulo)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : ''}
            <span class="${badgeClass}">${categoria}</span>
            <span class="news-cover-mark"></span>
          </div>
          <div class="news-body">
            <div class="news-meta">
              <span>${formatearFecha(n.publicado_en)}</span>
            </div>
            <h3 class="news-title">${sanitizar(n.titulo)}</h3>
            <p class="news-resumen">${sanitizar(truncar(n.resumen, 150))}</p>
            <div class="news-foot">
              <span>Leer más</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
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
  console.log('[cargarNoticia] ID recibido:', noticiaId);

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

    console.log('[cargarNoticia] Data de Supabase:', noticia);
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
    if (badgeEl) {
      badgeEl.textContent = noticia.categoria;
      badgeEl.className = 'badge badge--' + (noticia.categoria || '').toLowerCase();
    }

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
    if (contenidoEl) {
      const contenidoFormateado = (noticia.contenido || '')
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
      contenidoEl.innerHTML = contenidoFormateado;
    }

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
        btnEditar.href = `/admin/noticias-editor.html?editar=${noticiaId}`;
      }
    }
  } catch (e) {
    console.error('Error al cargar la noticia:', e);
    mostrarError('Ocurrió un error al cargar la noticia. Intenta de nuevo más tarde.');
  }
}

/* ─── Arranque ───────────────────────────────── */

init().catch(console.error);
