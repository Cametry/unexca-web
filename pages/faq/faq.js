import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { mostrarCarga, incluirComponente, setAnioActual, sanitizar, mostrarError, ocultarError } from '/assets/js/utils.js';

/* ─── Estado ──────────────────────────────────── */
let todasLasPreguntas = [];   // { categoria, pregunta, respuesta, itemEl }
let categoriasData = [];      // { id, nombre, icono }

/* ─── Inicialización ──────────────────────────── */

async function init() {
  await incluirComponente('#navbar-placeholder', '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');
  await actualizarNavbar();
  setAnioActual();
  mostrarCarga(true);
  await cargarFAQ();
  mostrarCarga(false);
}

/* ─── Cargar datos desde Supabase ─────────────── */

async function cargarFAQ() {
  ocultarError();
  const contenedor = document.getElementById('faq-contenedor');
  const vacio = document.getElementById('faq-vacio');
  const contador = document.getElementById('faq-contador');
  const sinResultados = document.getElementById('faq-sin-resultados');
  const acciones = document.getElementById('faq-acciones');

  try {
    // 1. Obtener categorías ordenadas
    const { data: categorias, error: errCat } = await supabase
      .from('faq_categorias')
      .select('id, nombre, icono, orden')
      .order('orden', { ascending: true });

    if (errCat) throw errCat;

    // 2. Obtener preguntas publicadas ordenadas
    const { data: preguntas, error: errPreg } = await supabase
      .from('faq_preguntas')
      .select('id, categoria_id, pregunta, respuesta, orden')
      .eq('publicado', true)
      .order('orden', { ascending: true });

    if (errPreg) throw errPreg;

    // 3. Validar vacío
    if (!categorias || categorias.length === 0) {
      contenedor.innerHTML = '';
      vacio.style.display = 'block';
      contador.style.display = 'none';
      sinResultados.style.display = 'none';
      acciones.style.display = 'none';
      return;
    }

    vacio.style.display = 'none';
    categoriasData = categorias;

    // 4. Agrupar preguntas por categoría
    const mapaPreguntas = {};
    if (preguntas) {
      preguntas.forEach(p => {
        if (!mapaPreguntas[p.categoria_id]) {
          mapaPreguntas[p.categoria_id] = [];
        }
        mapaPreguntas[p.categoria_id].push(p);
      });
    }

    // 5. Renderizar
    todasLasPreguntas = [];
    contenedor.innerHTML = categorias.map(cat => {
      const preguntasCat = mapaPreguntas[cat.id] || [];

      if (preguntasCat.length === 0) return '';

      const itemsHtml = preguntasCat.map(p => {
        const idUnico = `faq-item-${p.id}`;
        todasLasPreguntas.push({
          categoria: cat.nombre,
          pregunta: p.pregunta,
          respuesta: p.respuesta,
          idUnico
        });
        return `
          <div class="acordeon-item" data-faq-id="${idUnico}">
            <button class="acordeon-header" aria-expanded="false" aria-controls="${idUnico}-contenido">
              ${sanitizar(p.pregunta)}
            </button>
            <div class="acordeon-contenido" id="${idUnico}-contenido" role="region">
              <p>${sanitizar(p.respuesta)}</p>
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="faq-categoria" data-categoria-id="${cat.id}">
          <h2 class="faq-categoria-titulo">
            <span class="faq-categoria-icono">${sanitizar(cat.icono || '📄')}</span>
            ${sanitizar(cat.nombre)}
          </h2>
          ${itemsHtml}
        </section>
      `;
    }).join('');

    // 6. Mostrar contador
    const total = todasLasPreguntas.length;
    contador.textContent = total === 1
      ? '1 pregunta disponible'
      : `${total} preguntas disponibles`;
    contador.style.display = 'block';
    sinResultados.style.display = 'none';

    // 7. Verificar rol para botón "Agregar pregunta"
    try {
      const usuario = await getUsuarioActual();
      const rol = usuario?.perfil?.rol;
      if (rol === 'personal' || rol === 'admin') {
        acciones.style.display = 'block';
      } else {
        acciones.style.display = 'none';
      }
    } catch {
      acciones.style.display = 'none';
    }

    // 8. Vincular eventos de acordeón
    document.querySelectorAll('.acordeon-header').forEach(btn => {
      btn.addEventListener('click', function () {
        const item = this.closest('.acordeon-item');
        const isOpen = item.classList.contains('abierto');
        // Cerrar otros abiertos en la misma categoría
        const siblings = item.closest('.faq-categoria').querySelectorAll('.acordeon-item.abierto');
        siblings.forEach(s => {
          if (s !== item) {
            s.classList.remove('abierto');
            s.querySelector('.acordeon-header').setAttribute('aria-expanded', 'false');
          }
        });
        // Toggle actual
        item.classList.toggle('abierto');
        this.setAttribute('aria-expanded', !isOpen);
      });
    });

    // 9. Vincular búsqueda en tiempo real
    const buscador = document.getElementById('buscador-faq');
    if (buscador) {
      buscador.addEventListener('input', filtrarPreguntas);
    }

  } catch (e) {
    console.error('Error al cargar FAQ:', e);
    mostrarError('Ocurrió un error al cargar las preguntas frecuentes. Intenta de nuevo más tarde.');
  }
}

/* ─── Filtro en tiempo real (cliente) ─────────── */

function filtrarPreguntas() {
  const buscador = document.getElementById('buscador-faq');
  const termino = (buscador?.value || '').toLowerCase().trim();
  const contenedor = document.getElementById('faq-contenedor');
  const sinResultados = document.getElementById('faq-sin-resultados');
  const contador = document.getElementById('faq-contador');

  if (!termino) {
    // Restaurar todo
    document.querySelectorAll('.faq-categoria').forEach(cat => { cat.style.display = ''; });
    document.querySelectorAll('.acordeon-item').forEach(item => { item.style.display = ''; });
    sinResultados.style.display = 'none';
    const total = todasLasPreguntas.length;
    contador.textContent = total === 1 ? '1 pregunta disponible' : `${total} preguntas disponibles`;
    contador.style.display = 'block';
    return;
  }

  let visibles = 0;

  document.querySelectorAll('.faq-categoria').forEach(cat => {
    let categoriaTieneVisibles = false;

    cat.querySelectorAll('.acordeon-item').forEach(item => {
      const idUnico = item.dataset.faqId;
      const datos = todasLasPreguntas.find(p => p.idUnico === idUnico);
      if (!datos) return;

      const texto = `${datos.pregunta} ${datos.respuesta} ${datos.categoria}`.toLowerCase();
      const coincide = texto.includes(termino);

      item.style.display = coincide ? '' : 'none';
      if (coincide) {
        categoriaTieneVisibles = true;
        visibles++;
      }
    });

    cat.style.display = categoriaTieneVisibles ? '' : 'none';
  });

  if (visibles === 0) {
    sinResultados.style.display = 'block';
    contador.style.display = 'none';
  } else {
    sinResultados.style.display = 'none';
    contador.textContent = visibles === 1
      ? '1 pregunta encontrada'
      : `${visibles} preguntas encontradas`;
    contador.style.display = 'block';
  }
}

/* ─── Arranque ────────────────────────────────── */

init().catch(console.error);
