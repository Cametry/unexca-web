import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { formatearFecha, mostrarCarga, incluirComponente, setAnioActual, getParamURL, sanitizar, mostrarError, ocultarError, initHamburguesa } from '/assets/js/utils.js';

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

  if (path.endsWith('categoria.html') || path.endsWith('categoria/') || path.endsWith('categoria')) {
    await cargarArticulos();
  } else if (path.endsWith('articulo.html') || path.endsWith('articulo/') || path.endsWith('articulo')) {
    await cargarArticulo();
  } else {
    await cargarCategorias();
  }
}

/* ─── Página principal: Categorías ───────────── */

async function cargarCategorias() {
  ocultarError();
  const contenedor = document.getElementById('categorias-contenedor');
  const sinResultados = document.getElementById('sin-resultados');

  try {
    // Obtener todas las categorías ordenadas con conteo de artículos
    const { data: categorias, error } = await supabase
      .from('wiki_categorias')
      .select('id, nombre, descripcion, icono, orden, wiki_articulos(count)')
      .order('orden', { ascending: true });

    if (error) throw error;

    if (!categorias || categorias.length === 0) {
      contenedor.innerHTML = '';
      sinResultados.style.display = 'block';
      return;
    }

    sinResultados.style.display = 'none';
    contenedor.innerHTML = categorias.map(cat => {
      const totalArticulos = cat.wiki_articulos?.[0]?.count || 0;
      return `
        <a href="/pages/wiki/categoria?id=${cat.id}" class="card card--categoria">
          <div class="card-body">
            <div class="categoria-icono">${sanitizar(cat.icono || '📁')}</div>
            <h3 class="card-titulo">${sanitizar(cat.nombre)}</h3>
            <p class="card-texto">${sanitizar(cat.descripcion || '')}</p>
            <span class="categoria-contador">${totalArticulos} artículo${totalArticulos !== 1 ? 's' : ''}</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (e) {
    console.error('Error al cargar categorías:', e);
    mostrarError('Ocurrió un error al cargar las categorías. Intenta de nuevo más tarde.');
  }
}

/* ─── Página de categoría: Artículos ─────────── */

async function cargarArticulos() {
  ocultarError();
  const categoriaId = getParamURL('id');
  const contenedor = document.getElementById('articulos-contenedor');
  const sinResultados = document.getElementById('sin-resultados');
  const tituloEl = document.getElementById('categoria-titulo');
  const descripcionEl = document.getElementById('categoria-descripcion');
  const migaEl = document.getElementById('miga-categoria');

  if (!categoriaId) {
    mostrarError('No se especificó una categoría.');
    return;
  }

  try {
    // Obtener datos de la categoría
    const { data: categoria, error: errCat } = await supabase
      .from('wiki_categorias')
      .select('nombre, descripcion')
      .eq('id', categoriaId)
      .single();

    if (errCat) throw errCat;

    if (categoria) {
      tituloEl.textContent = categoria.nombre;
      descripcionEl.textContent = categoria.descripcion || '';
      if (migaEl) migaEl.textContent = categoria.nombre;
    }

    // Obtener artículos publicados de la categoría
    const { data: articulos, error: errArts } = await supabase
      .from('wiki_articulos')
      .select('id, titulo, actualizado_en')
      .eq('categoria_id', categoriaId)
      .eq('publicado', true)
      .order('creado_en', { ascending: false });

    if (errArts) throw errArts;

    if (!articulos || articulos.length === 0) {
      contenedor.innerHTML = '';
      sinResultados.style.display = 'block';
      return;
    }

    sinResultados.style.display = 'none';
    contenedor.innerHTML = articulos.map(art => `
      <a href="/pages/wiki/articulo?id=${art.id}" class="card card--articulo">
        <div class="card-body">
          <h3 class="card-titulo">${sanitizar(art.titulo)}</h3>
          <p class="card-texto">Última actualización: ${formatearFecha(art.actualizado_en)}</p>
        </div>
      </a>
    `).join('');
  } catch (e) {
    console.error('Error al cargar artículos:', e);
    mostrarError('Ocurrió un error al cargar los artículos. Intenta de nuevo más tarde.');
  }
}

/* ─── Página de artículo individual ──────────── */

async function cargarArticulo() {
  ocultarError();
  const articuloId = getParamURL('id');

  if (!articuloId) {
    mostrarError('No se especificó un artículo.');
    return;
  }

  try {
    // Obtener artículo
    const { data: articulo, error } = await supabase
      .from('wiki_articulos')
      .select('id, titulo, contenido, publicado, vistas, creado_en, actualizado_en, categoria_id, autor_id')
      .eq('id', articuloId)
      .eq('publicado', true)
      .single();

    if (error) throw error;

    if (!articulo) {
      mostrarError('El artículo no existe o no está disponible.');
      return;
    }

    // Obtener nombre de la categoría
    const { data: categoria } = await supabase
      .from('wiki_categorias')
      .select('nombre')
      .eq('id', articulo.categoria_id)
      .single();

    // Obtener nombre del autor
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre_completo')
      .eq('id', articulo.autor_id)
      .single();

    // Incrementar vistas
    await supabase
      .from('wiki_articulos')
      .update({ vistas: (articulo.vistas || 0) + 1 })
      .eq('id', articuloId);

    // Renderizar contenido
    const categoriaNombre = categoria?.nombre || 'Categoría';
    const autorNombre = perfil?.nombre_completo || 'Desconocido';

    document.getElementById('articulo-titulo').textContent = articulo.titulo;
    document.getElementById('articulo-autor').textContent = `Por: ${autorNombre}`;
    document.getElementById('articulo-fecha').textContent = `Actualizado: ${formatearFecha(articulo.actualizado_en)}`;
    const contenidoFormateado = (articulo.contenido || '')
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
    document.getElementById('contenido-articulo').innerHTML = contenidoFormateado;

    // Breadcrumb
    const migaCat = document.getElementById('miga-categoria');
    if (migaCat) {
      migaCat.innerHTML = `<a href="/pages/wiki/categoria?id=${articulo.categoria_id}">${sanitizar(categoriaNombre)}</a>`;;
    }
    const migaArt = document.getElementById('miga-articulo');
    if (migaArt) migaArt.textContent = articulo.titulo;

    // Botón volver a categoría
    const btnVolver = document.getElementById('btn-volver-categoria');
    if (btnVolver) {
      btnVolver.href = `/pages/wiki/categoria?id=${articulo.categoria_id}`;
    }

    // Botón editar — visible solo si admin, o personal Y autor del artículo
    const btnEditar = document.getElementById('btn-editar');
    if (btnEditar) {
      const usuario = await getUsuarioActual();
      const rol = usuario?.perfil?.rol;
      const esAdmin = rol === 'admin';
      const esAutor = rol === 'personal' && articulo.autor_id === usuario.id;
      if (esAdmin || esAutor) {
        btnEditar.style.display = 'inline-flex';
        btnEditar.href = `/admin/wiki-editor.html?editar=${articuloId}`;
      }
    }
  } catch (e) {
    console.error('Error al cargar el artículo:', e);
    mostrarError('Ocurrió un error al cargar el artículo. Intenta de nuevo más tarde.');
  }
}

/* ─── Arranque ───────────────────────────────── */

init().catch(console.error);
