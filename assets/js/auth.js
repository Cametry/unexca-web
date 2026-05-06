import { supabase } from './supabase-client.js';

export async function getUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await supabase
    .from('perfiles').select('*').eq('id', user.id).single();
  return { ...user, perfil };
}

export async function verificarRol(rolMinimo) {
  const usuario = await getUsuarioActual();
  if (!usuario) return false;
  const j = { estudiante: 1, personal: 2, admin: 3 };
  return j[usuario.perfil?.rol] >= j[rolMinimo];
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

export async function requiereAutenticacion(rolMinimo = 'estudiante') {
  const ok = await verificarRol(rolMinimo);
  if (!ok) {
    window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

export async function actualizarNavbar() {
  const usuario = await getUsuarioActual();
  const btnLogin = document.getElementById('btn-login-nav');
  const divUsuario = document.getElementById('navbar-usuario');

  /* ─── Elementos del drawer ─── */
  const drawerUserActions = document.getElementById('drawer-user-actions');
  const drawerGreeting = document.getElementById('drawer-user-greeting');
  const drawerLinkAdmin = document.getElementById('drawer-link-admin');
  const drawerBtnLogout = document.getElementById('drawer-btn-logout');
  const drawerFoot = document.getElementById('drawer-foot');
  const drawerBtnLogin = document.getElementById('drawer-btn-login');
  const drawerBtnRegistro = document.getElementById('drawer-btn-registro');

  if (!usuario) {
    /* ─── LOGOUT ─── */
    if (btnLogin) btnLogin.style.display = '';
    if (divUsuario) divUsuario.style.display = 'none';

    /* Drawer: ocultar sección usuario, mostrar login/register */
    if (drawerUserActions) drawerUserActions.style.display = 'none';
    if (drawerFoot) drawerFoot.style.display = '';
    if (drawerBtnLogin) drawerBtnLogin.style.display = '';
    if (drawerBtnRegistro) drawerBtnRegistro.style.display = '';
    return;
  }

  /* ─── LOGIN ─── */
  if (btnLogin) btnLogin.style.display = 'none';
  if (divUsuario) {
    divUsuario.style.display = 'flex';
    const spanNombre = document.getElementById('navbar-nombre-usuario');
    if (spanNombre) spanNombre.textContent = usuario.perfil?.nombre_completo || usuario.email;
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) linkAdmin.style.display = (usuario.perfil?.rol === 'admin' || usuario.perfil?.rol === 'personal') ? 'inline' : 'none';
  }

  /* Drawer: mostrar sección usuario, ocultar login/register */
  if (drawerUserActions) drawerUserActions.style.display = 'flex';
  if (drawerFoot) drawerFoot.style.display = 'none';
  if (drawerBtnLogin) drawerBtnLogin.style.display = 'none';
  if (drawerBtnRegistro) drawerBtnRegistro.style.display = 'none';

  if (drawerGreeting) {
    drawerGreeting.textContent = usuario.perfil?.nombre_completo || usuario.email;
  }
  if (drawerLinkAdmin) {
    drawerLinkAdmin.style.display = (usuario.perfil?.rol === 'admin' || usuario.perfil?.rol === 'personal') ? 'flex' : 'none';
  }

  /* Eventos (solo una vez) */
  document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);
  drawerBtnLogout?.addEventListener('click', cerrarSesion);
}
