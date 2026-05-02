// ─────────────────────────────────────────────
// ui.js — Drawer móvil. Sin dependencias.
// Importar como: <script type="module" src="/assets/js/ui.js"></script>
// ─────────────────────────────────────────────

export function inicializarDrawer() {
  const btnAbrir   = document.getElementById('btn-hamburguesa');
  const btnCerrar  = document.getElementById('btn-cerrar-drawer');
  const drawer     = document.getElementById('drawer');
  const backdrop   = document.getElementById('drawer-backdrop');
  if (!drawer || !backdrop) return;

  const abrir = () => {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnAbrir?.setAttribute('aria-expanded', 'true');
  };
  const cerrar = () => {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    btnAbrir?.setAttribute('aria-expanded', 'false');
  };

  btnAbrir?.addEventListener('click', abrir);
  btnCerrar?.addEventListener('click', cerrar);
  backdrop.addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrar();
  });
}

export function setAnioActual(idElemento = 'anio-actual') {
  const el = document.getElementById(idElemento);
  if (el) el.textContent = new Date().getFullYear();
}

// Auto-init si el script se carga directamente
inicializarDrawer();
setAnioActual();
