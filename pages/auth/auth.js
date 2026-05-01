import { supabase } from '/assets/js/supabase-client.js';
import { getUsuarioActual, actualizarNavbar } from '/assets/js/auth.js';
import { mostrarCarga, incluirComponente, setAnioActual, mostrarError, ocultarError } from '/assets/js/utils.js';

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
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      mostrarError('Por favor completa todos los campos.');
      return;
    }

    mostrarCarga(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      mostrarError(traducirError(error));
      mostrarCarga(false);
      return;
    }

    if (data?.user) {
      // Redirigir al index o a la página que solicitó login
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/index.html';
      window.location.href = redirect;
    }

    mostrarCarga(false);
  });
}

/* ─── REGISTRO ──────────────────────────────────── */
async function ejecutarRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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

    mostrarCarga(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_completo: nombreCompleto },
      },
    });

    if (error) {
      mostrarError(traducirError(error));
      mostrarCarga(false);
      return;
    }

    if (data?.user) {
      // Ocultar formulario y mostrar mensaje de éxito
      form.style.display = 'none';
      const alertaExito = document.getElementById('alerta-exito');
      if (alertaExito) {
        alertaExito.textContent = 'Revisa tu correo para verificar tu cuenta.';
        alertaExito.style.display = 'block';
      }
    }

    mostrarCarga(false);
  });
}

/* ─── RECUPERAR CONTRASEÑA ──────────────────────── */
async function ejecutarRecuperar() {
  const form = document.getElementById('form-recuperar');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarError();

    const email = document.getElementById('email').value.trim();

    if (!email) {
      mostrarError('Por ingresa tu correo electrónico.');
      return;
    }

    mostrarCarga(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/login.html`,
    });

    if (error) {
      mostrarError(traducirError(error));
      mostrarCarga(false);
      return;
    }

    // Ocultar formulario y mostrar mensaje de éxito
    form.style.display = 'none';
    const alertaExito = document.getElementById('alerta-exito');
    if (alertaExito) {
      alertaExito.textContent = 'Revisa tu correo para restablecer tu contraseña.';
      alertaExito.style.display = 'block';
    }

    mostrarCarga(false);
  });
}

/* ─── DETECCIÓN DE PÁGINA Y EJECUCIÓN ───────────── */
function ejecutarModulo() {
  const path = window.location.pathname;

  if (path.includes('login.html')) {
    return ejecutarLogin();
  }

  if (path.includes('registro.html')) {
    return ejecutarRegistro();
  }

  if (path.includes('recuperar-contrasena.html')) {
    return ejecutarRecuperar();
  }
}

/* ─── INIT ──────────────────────────────────────── */
async function init() {
  await incluirComponente('#navbar-placeholder', '/components/navbar.html');
  await incluirComponente('#footer-placeholder', '/components/footer.html');
  await actualizarNavbar();
  setAnioActual();

  mostrarCarga(true);
  await ejecutarModulo();
  mostrarCarga(false);
}

init().catch(console.error);
