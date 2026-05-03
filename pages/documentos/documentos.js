import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar, requiereAutenticacion } from '/assets/js/auth.js';
import { mostrarCarga, incluirComponente, setAnioActual, sanitizar, mostrarError, initHamburguesa } from '/assets/js/utils.js';

/**
 * Renderiza un mensaje de estado vacío para una categoría.
 * @param {string} categoria - Nombre de la categoría.
 * @returns {string} HTML del estado vacío.
 */
function renderVacio(categoria) {
  return `
    <div class="doc-empty">
      <span class="doc-empty-icon">📂</span>
      <p>No hay documentos disponibles en la categoría <strong>${sanitizar(categoria)}</strong>.</p>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de documento individual.
 * @param {Object} doc - Objeto documento de la base de datos.
 * @returns {string} HTML de la tarjeta.
 */
function renderDocumentoCard(doc) {
  const titulo = sanitizar(doc.titulo);
  const descripcion = doc.descripcion ? sanitizar(doc.descripcion) : '';
  const url = doc.archivo_url;
  const categoria = doc.categoria ? sanitizar(doc.categoria) : 'General';
  const acceso = doc.acceso_minimo || 'publico';
  const accesoLower = acceso.toLowerCase();

  return `
    <div class="doc-card">
      <div class="doc-card-header">
        <span class="doc-icon">📄</span>
        <div class="doc-info">
          <h3>${titulo}</h3>
          ${descripcion ? `<p>${descripcion}</p>` : ''}
          <div class="doc-badges">
            <span class="doc-badge doc-badge--categoria">${categoria}</span>
            <span class="doc-badge doc-badge--${accesoLower}">${acceso}</span>
          </div>
        </div>
      </div>
      <div class="doc-card-footer">
        <a href="${url}" target="_blank" download class="btn btn-primario btn-sm">Descargar PDF</a>
      </div>
    </div>
  `;
}

/**
 * Renderiza una sección de categoría con sus documentos.
 * @param {string} categoria - Nombre de la categoría.
 * @param {Array} documentos - Lista de documentos en esa categoría.
 * @returns {string} HTML de la sección.
 */
function renderCategoria(categoria, documentos) {
  const docsHtml = documentos.length > 0
    ? documentos.map(renderDocumentoCard).join('')
    : renderVacio(categoria);

  return `
    <section class="doc-section">
      <h2 class="doc-section-title">${sanitizar(categoria)}</h2>
      <div class="doc-grid">
        ${docsHtml}
      </div>
    </section>
  `;
}

/**
 * Agrupa los documentos por categoría usando reduce.
 * @param {Array} documentos - Lista plana de documentos.
 * @returns {Object} Objeto con categorías como claves y arrays de documentos como valores.
 */
function agruparPorCategoria(documentos) {
  return documentos.reduce((grupos, doc) => {
    const cat = doc.categoria || 'Sin categoría';
    if (!grupos[cat]) {
      grupos[cat] = [];
    }
    grupos[cat].push(doc);
    return grupos;
  }, {});
}

/**
 * Carga los documentos desde Supabase y los renderiza agrupados por categoría.
 */
async function cargarDocumentos() {
  const contenedor = document.getElementById('documentos-contenedor');
  const alertaError = document.getElementById('alerta-error');

  if (!contenedor) return;

  try {
    const { data: documentos, error } = await supabase
      .from('documentos')
      .select('*')
      .order('categoria', { ascending: true })
      .order('creado_en', { ascending: false });

    if (error) throw error;

    if (!documentos || documentos.length === 0) {
      contenedor.innerHTML = `
        <div class="doc-empty">
          <span class="doc-empty-icon">📂</span>
          <p>No hay documentos disponibles en este momento. Vuelve más tarde.</p>
        </div>
      `;
      return;
    }

    const agrupados = agruparPorCategoria(documentos);
    const categoriasHtml = Object.keys(agrupados).map(cat =>
      renderCategoria(cat, agrupados[cat])
    ).join('');

    contenedor.innerHTML = categoriasHtml;
  } catch (err) {
    console.error('Error al cargar documentos:', err);
    if (alertaError) {
      mostrarError('alerta-error', 'No se pudieron cargar los documentos. Intenta de nuevo más tarde.');
    }
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="doc-empty">
          <span class="doc-empty-icon">⚠️</span>
          <p>Ocurrió un error al cargar los documentos. Por favor, recarga la página.</p>
        </div>
      `;
    }
  }
}

/**
 * Inicialización del módulo de documentos.
 */
async function init() {
  await requiereAutenticacion('estudiante');
  await incluirComponente('#navbar-placeholder', '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');
  await actualizarNavbar();
  initHamburguesa();
  setAnioActual();
  mostrarCarga(true);
  await cargarDocumentos();
  mostrarCarga(false);
}

init().catch(console.error);
