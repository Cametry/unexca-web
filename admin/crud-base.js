/* ─────────────────────────────────────────────
   crud-base.js — Base CRUD para editores admin
   Uso: import { crearCRUD } y llamar con config
   ───────────────────────────────────────────── */

import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual } from '/assets/js/auth.js';

/* ─── Toast system (H7) ──────────────────── */
let toastActivo = false;

export function mostrarToast(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('toast-contenedor');
  if (!contenedor) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensaje;
  toast.setAttribute('role', 'alert');
  contenedor.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ─── Paginación (H6) ───────────────────── */
function crearPaginacion(containerId, { paginaActual, totalPaginas, onCambio }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="paginacion">';

  // Anterior
  html += `<button class="btn btn-sm pag-btn" data-pagina="${paginaActual - 1}" ${paginaActual <= 1 ? 'disabled' : ''}>
    &laquo; Anterior
  </button>`;

  // Números
  const inicio = Math.max(1, paginaActual - 2);
  const fin = Math.min(totalPaginas, paginaActual + 2);

  if (inicio > 1) {
    html += `<button class="btn btn-sm pag-btn" data-pagina="1">1</button>`;
    if (inicio > 2) html += '<span class="pag-ellipsis">...</span>';
  }

  for (let i = inicio; i <= fin; i++) {
    html += `<button class="btn btn-sm pag-btn ${i === paginaActual ? 'pag-btn--activo' : ''}" data-pagina="${i}">${i}</button>`;
  }

  if (fin < totalPaginas) {
    if (fin < totalPaginas - 1) html += '<span class="pag-ellipsis">...</span>';
    html += `<button class="btn btn-sm pag-btn" data-pagina="${totalPaginas}">${totalPaginas}</button>`;
  }

  // Siguiente
  html += `<button class="btn btn-sm pag-btn" data-pagina="${paginaActual + 1}" ${paginaActual >= totalPaginas ? 'disabled' : ''}>
    Siguiente &raquo;
  </button>`;

  html += '</div>';
  container.innerHTML = html;

  // Eventos
  container.querySelectorAll('.pag-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const pagina = parseInt(btn.dataset.pagina, 10);
      if (!isNaN(pagina) && pagina !== paginaActual) {
        onCambio(pagina);
      }
    });
  });
}

/* ─── Fábrica CRUD ───────────────────────── */
export function crearCRUD(config) {
  const {
    tabla,              // nombre tabla en Supabase
    formId,             // ID del div editor-form
    tablaId,            // ID del tbody
    formTituloId,       // ID del h2 del form
    idInputId,          // ID del input hidden para ID
    btnNuevoId,         // ID del botón "+ Nuevo"
    btnGuardarId,       // ID del botón Guardar
    btnCancelarId,      // ID del botón Cancelar
    mensajeId,          // ID del div admin-mensaje (legacy, se reemplaza por toast)
    paginacionId,       // ID del div para controles de paginación
    limite = 20,        // registros por página
    selectQuery,        // string: select de Supabase ej. '*, wiki_categorias(nombre)'
    orderBy,            // { columna: 'creado_en', direccion: 'asc'|'desc' }
    filtroPersonal,     // { columna: 'autor_id' } — columna para filtrar por usuario
    cargarSelects,      // async fn(config) — carga options en selects del form
    obtenerDataForm,    // fn() → objeto con datos del formulario
    rellenarForm,       // fn(data) — rellena formulario con datos para editar
    limpiarForm,        // fn() — resetea formulario a valores por defecto
    validarForm,        // fn(data) → string|null — valida, devuelve error o null
    plantillaFila,      // fn(item) → string HTML para una fila de tabla
    nombreSingular,     // string: "artículo", "noticia", etc.
    nombrePlural,       // string: "artículos", "noticias", etc.
    insertExtra,        // fn(user) → objeto con campos extra al insertar
    updateExtra,        // fn(data) → objeto con campos extra al actualizar
  } = config;

  /* ─── State ─────────────────────────────── */
  let modoEdicion = false;
  let editandoId = null;
  let paginaActual = 1;
  let totalRegistros = 0;

  /* ─── DOM refs ──────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const editorForm = $(formId);
  const formTituloEl = $(formTituloId);
  const idInput = $(idInputId);
  const btnNuevo = $(btnNuevoId);
  const btnGuardar = $(btnGuardarId);
  const btnCancelar = $(btnCancelarId);
  const tablaBody = $(tablaId);
  const mensajeEl = $(mensajeId);

  /* ─── Helpers ───────────────────────────── */
  function mostrarMensajeLegacy(texto, tipo) {
    if (mensajeEl) {
      mensajeEl.textContent = texto;
      mensajeEl.className = 'admin-mensaje ' + tipo;
      setTimeout(() => {
        mensajeEl.className = 'admin-mensaje';
        mensajeEl.textContent = '';
      }, 3000);
    }
    // También mostrar toast
    mostrarToast(texto, tipo);
  }

  /* ─── Cargar registros con paginación ───── */
  async function cargarRegistros(pagina = 1) {
    try {
      const usuario = await getUsuarioActual();
      const esPersonal = usuario?.perfil?.rol === 'personal';

      const offset = (pagina - 1) * limite;

      // Query para contar total
      let countQuery = supabase.from(tabla).select('*', { count: 'exact', head: true });
      if (esPersonal && filtroPersonal) {
        countQuery = countQuery.eq(filtroPersonal.columna, usuario.id);
      }
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      totalRegistros = count || 0;
      const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));

      // Query para datos
      let query = supabase
        .from(tabla)
        .select(selectQuery || '*')
        .order(orderBy?.columna || 'creado_en', { ascending: orderBy?.direccion === 'asc' ? true : false });

      if (esPersonal && filtroPersonal) {
        query = query.eq(filtroPersonal.columna, usuario.id);
      }

      const { data, error } = await query.range(offset, offset + limite - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        const colspan = plantillaFila ? 5 : 1;
        tablaBody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No hay ${nombrePlural || 'registros'} aún</td></tr>`;
      } else {
        tablaBody.innerHTML = data.map(item => plantillaFila(item)).join('');
      }

      // Paginación
      if (paginacionId) {
        crearPaginacion(paginacionId, {
          paginaActual: pagina,
          totalPaginas,
          onCambio: (nuevaPag) => {
            paginaActual = nuevaPag;
            cargarRegistros(nuevaPag);
          }
        });
      }

      paginaActual = pagina;
    } catch (err) {
      console.error(`Error al cargar ${nombrePlural || 'registros'}:`, err);
      const colspan = plantillaFila ? 5 : 1;
      tablaBody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state error">Error al cargar los datos: ${err.message}</td></tr>`;
    }
  }

  /* ─── Mostrar / Ocultar formulario ──────── */
  function mostrarFormulario() {
    editorForm.style.display = 'block';
  }

  function ocultarFormulario() {
    editorForm.style.display = 'none';
    formTituloEl.textContent = `Crear ${nombreSingular || 'Registro'}`;
    idInput.value = '';
    if (limpiarForm) limpiarForm();
    modoEdicion = false;
    editandoId = null;
  }

  /* ─── Nuevo ─────────────────────────────── */
  btnNuevo.addEventListener('click', () => {
    ocultarFormulario();
    modoEdicion = false;
    mostrarFormulario();
  });

  /* ─── Cancelar ──────────────────────────── */
  btnCancelar.addEventListener('click', ocultarFormulario);

  /* ─── Editar (event delegation) ─────────── */
  tablaBody.addEventListener('click', async (e) => {
    const btnEditar = e.target.closest('.btn-editar');
    if (!btnEditar) return;

    const id = btnEditar.dataset.id;
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`${nombreSingular || 'Registro'} no encontrado`);

      idInput.value = data.id;
      if (rellenarForm) rellenarForm(data);
      modoEdicion = true;
      editandoId = data.id;
      formTituloEl.textContent = `Editar ${nombreSingular || 'Registro'}`;
      mostrarFormulario();
    } catch (err) {
      console.error(`Error al cargar ${nombreSingular || 'registro'}:`, err);
      mostrarMensajeLegacy(`Error al cargar ${nombreSingular || 'el registro'}: ${err.message}`, 'error');
    }
  });

  /* ─── Guardar ───────────────────────────── */
  btnGuardar.addEventListener('click', async () => {
    try {
      const data = obtenerDataForm ? obtenerDataForm() : {};

      // Validar
      if (validarForm) {
        const error = validarForm(data);
        if (error) {
          mostrarMensajeLegacy(error, 'error');
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!modoEdicion) {
        const insertData = {
          ...data,
          ...(insertExtra ? insertExtra(user) : {}),
          autor_id: user.id
        };

        const { error } = await supabase
          .from(tabla)
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        mostrarMensajeLegacy(`${nombreSingular || 'Registro'} creado exitosamente`, 'exito');
      } else {
        let updateData = { ...data };
        if (updateExtra) {
          updateData = { ...updateData, ...updateExtra(data) };
        }

        const { error } = await supabase
          .from(tabla)
          .update(updateData)
          .eq('id', editandoId);

        if (error) throw error;
        mostrarMensajeLegacy(`${nombreSingular || 'Registro'} actualizado exitosamente`, 'exito');
      }

      ocultarFormulario();
      await cargarRegistros(1);
    } catch (err) {
      console.error(`Error al guardar ${nombreSingular || 'registro'}:`, err);
      mostrarMensajeLegacy(`Error al guardar ${nombreSingular || 'el registro'}: ${err.message}`, 'error');
    }
  });

  /* ─── Eliminar (event delegation) ───────── */
  tablaBody.addEventListener('click', async (e) => {
    const btnEliminar = e.target.closest('.btn-eliminar');
    if (!btnEliminar) return;

    const id = btnEliminar.dataset.id;
    if (!confirm(`¿Seguro que deseas eliminar ${nombreSingular || 'este registro'}?`)) return;

    try {
      const { error } = await supabase
        .from(tabla)
        .delete()
        .eq('id', id);

      if (error) throw error;
      mostrarMensajeLegacy(`${nombreSingular || 'Registro'} eliminado exitosamente`, 'exito');
      await cargarRegistros(paginaActual);
    } catch (err) {
      console.error(`Error al eliminar ${nombreSingular || 'registro'}:`, err);
      mostrarMensajeLegacy(`Error al eliminar ${nombreSingular || 'el registro'}: ${err.message}`, 'error');
    }
  });

  /* ─── Init ──────────────────────────────── */
  return {
    async init() {
      if (cargarSelects) await cargarSelects(config);
      await cargarRegistros(1);
    },
    recargar() {
      return cargarRegistros(paginaActual);
    }
  };
}
