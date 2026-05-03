import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { mostrarCarga, incluirComponente, setAnioActual, mostrarError, ocultarError, initHamburguesa } from '/assets/js/utils.js';

console.log('✅ auth.js cargado correctamente');

/* ─── Traducción de errores de Supabase al español ─── */
const ERRORES_SUPABASE = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Debes verificar tu correo antes de iniciar sesión.',
  'User already registered': 'Ya existe una cuenta con este correo.',
  'Password should be at least 6 characters': 'La contraseña debe tener mínimo 6 caracteres.',
};

function traducirError(error) {
  if (!error) return 'Ocurrió un error inesperado. Intenta de nuevo.';
  const mensaje = error.message || error.error_description || String(error);
  for (const [inglés, español] of Object.entries(ERRORES_SUPABASE)) {
    if (mensaje.includes(inglés)) return español;
  }
  return mensaje;
}

/* ─── LOGIN ─────────────────────────────────────── */
async function ejecutarLogin() {
  const btn = document.getElementById('btn-login');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    ocultarError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      mostrarError('Por favor completa todos los campos.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Iniciando sesión...';
    mostrarCarga(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    mostrarCarga(false);
    btn.disabled = false;
    btn.textContent = 'Iniciar Sesión';

    if (error) {
      mostrarError(traducirError(error));
      return;
    }

    if (data?.user) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/index.html';
      window.location.href = redirect;
    }
  });
}

/* ─── REGISTRO ──────────────────────────────────── */
async function ejecutarRegistro() {
  const btn = document.getElementById('btn-registro');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    ocultarError();

    const nombreCompleto = document.getElementById('nombre-completo').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;

    if (!nombreCompleto || !email || !password || !confirmarPassword) {
      mostrarError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmarPassword) {
      mostrarError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      mostrarError('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';
    mostrarCarga(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_completo: nombreCompleto },
        emailRedirectTo: window.location.origin + '/pages/auth/login.html',
      },
    });

    mostrarCarga(false);
    btn.disabled = false;
    btn.textContent = 'Crear Cuenta';

    if (error) {
      mostrarError(traducirError(error));
      return;
    }

    if (data?.user) {
      document.getElementById('form-registro').style.display = 'none';
      const alertaExito = document.getElementById('alerta-exito');
      if (alertaExito) {
        alertaExito.textContent = 'Revisa tu correo para verificar tu cuenta.';
        alertaExito.style.display = 'block';
      }
    }
  });
}

/* ─── RECUPERAR CONTRASEÑA ──────────────────────── */
async function ejecutarRecuperar() {
  const btn = document.getElementById('btn-recuperar');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    ocultarError();

    const email = document.getElementById('email').value.trim();

    if (!email) {
      mostrarError('Por favor ingresa tu correo electrónico.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    mostrarCarga(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/login.html`,
    });

    mostrarCarga(false);
    btn.disabled = false;
    btn.textContent = 'Enviar enlace de recuperación';

    if (error) {
      mostrarError(traducirError(error));
      return;
    }

    document.getElementById('form-recuperar').style.display = 'none';
    const alertaExito = document.getElementById('alerta-exito');
    if (alertaExito) {
      alertaExito.textContent = 'Revisa tu correo para restablecer tu contraseña.';
      alertaExito.style.display = 'block';
    }
  });
}

/* ─── DETECCIÓN DE PÁGINA Y EJECUCIÓN ───────────── */
function ejecutarModulo() {
  const path = window.location.pathname;
  console.log('📍 path detectado:', path);

  const esLogin = path.includes('login');
  const esRegistro = path.includes('registro');
  const esRecuperar = path.includes('recuperar');

  console.log('🔎 esLogin:', esLogin, '| esRegistro:', esRegistro, '| esRecuperar:', esRecuperar);

  if (esLogin) return ejecutarLogin();
  if (esRegistro) return ejecutarRegistro();
  if (esRecuperar) return ejecutarRecuperar();

  console.warn('⚠️ No se detectó ninguna página de auth');
}

/* ─── INIT ──────────────────────────────────────── */
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

init().catch(console.error);
