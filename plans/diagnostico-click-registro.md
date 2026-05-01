# Diagnóstico: Click en botón de registro no dispara callback

## Análisis de código

### 1. [`pages/auth/auth.js`](pages/auth/auth.js) — Flujo de `ejecutarRegistro()`

La función se ejecuta correctamente (línea 65 confirma con `console.log`). El botón `btn-registro` se encuentra (línea 67). El `addEventListener` se adjunta en la línea 70.

**Problema identificado:** El callback es `async` pero **nunca se ejecuta** al hacer click.

### 2. [`pages/auth/registro.html`](pages/auth/registro.html) — Estructura HTML

- El botón está en la línea 129: `<button type="button" id="btn-registro" ...>`
- Está dentro de `<form id="form-registro">` (línea 108)
- El formulario tiene `novalidate`, correcto.
- `type="button"` evita el submit del form, correcto.
- **No hay elementos posicionados encima del botón** dentro del `.auth-card`.

### 3. 🚨 **Causa raíz: El spinner bloquea el click**

El spinner (`#spinner`) está definido en [`assets/css/base.css`](assets/css/base.css:207-218):

```css
.spinner {
  position: fixed;
  inset: 0;           /* cubre toda la pantalla */
  z-index: 9999;       /* por encima de TODO */
  background-color: rgba(255, 255, 255, 0.8);
  visibility: hidden;
  opacity: 0;
  transition: opacity var(--t), visibility var(--t);
}
```

Y en [`assets/js/utils.js`](assets/js/utils.js:27-30), `mostrarCarga()` hace:

```js
export function mostrarCarga(mostrar) {
  const el = document.getElementById('spinner');
  if (el) el.style.display = mostrar ? 'flex' : 'none';
}
```

**El problema:** En [`pages/auth/auth.js`](pages/auth/auth.js:187-189), dentro de `init()`:

```js
mostrarCarga(true);      // spinner.display = 'flex' → CUBRE TODA LA PÁGINA
await ejecutarModulo();  // se adjunta el event listener
mostrarCarga(false);     // spinner.display = 'none'
```

El spinner se muestra **mientras se ejecuta `ejecutarModulo()`**. Aunque luego se oculta (`display: none`), el problema es que durante la carga inicial el spinner está visible con `z-index: 9999` y `inset: 0`, cubriendo todo.

**Pero el verdadero problema es otro:** Revisando el flujo de `init()`:

1. `mostrarCarga(true)` — spinner visible, cubre todo
2. `await ejecutarModulo()` — esto llama a `ejecutarRegistro()` que adjunta el listener
3. `mostrarCarga(false)` — spinner se oculta

Esto funciona correctamente porque el listener se adjunta y luego el spinner se oculta. **Sin embargo**, si `mostrarCarga(true)` se llama **después** de que el usuario ya hizo click, o si hay una condición de carrera...

**Análisis más profundo:** El problema REAL es que `mostrarCarga(true)` se llama en `init()` línea 187, ANTES de `ejecutarModulo()`. El spinner con `display: flex`, `position: fixed`, `inset: 0` y `z-index: 9999` se superpone a TODA la página. Luego `ejecutarModulo()` se ejecuta y adjunta el listener. Luego `mostrarCarga(false)` oculta el spinner.

**Pero** — si por alguna razón el spinner se queda visible (por ejemplo, si `mostrarCarga(false)` no se ejecuta debido a un error, o si hay un problema de async), el spinner estaría interceptando todos los clicks.

**Sin embargo**, el escenario más probable es que **el spinner se muestra y se oculta correctamente**, y el problema está en otra parte.

### 4. 🔍 Otra posibilidad: El formulario intercepta el submit

Aunque el botón tiene `type="button"`, está dentro de un `<form>`. Si por alguna razón el formulario captura el evento (por ejemplo, si alguien presiona Enter en un input), el formulario podría hacer submit y recargar la página antes de que el click del botón se procese.

### 5. 🎯 **Causa más probable: Error silencioso en `mostrarCarga` o en el flujo async**

Revisando de nuevo: `mostrarCarga(true)` en línea 187 establece `display: flex` en el spinner. El spinner tiene `position: fixed; inset: 0; z-index: 9999`. Esto significa que **el spinner cubre completamente la página** mientras se ejecuta `ejecutarModulo()`.

Si `ejecutarModulo()` tarda lo suficiente (por ejemplo, si `incluirComponente` para navbar o footer tiene latencia), el usuario podría ver la página pero el spinner aún está visible y **bloqueando todos los clicks**.

**Pero el flujo es:** `mostrarCarga(true)` → `await ejecutarModulo()` → `mostrarCarga(false)`. El `await` asegura que primero se adjunte el listener y luego se oculte el spinner. Esto debería funcionar.

**Conclusión:** La causa más probable es que **el spinner con `z-index: 9999` está cubriendo el botón** durante el breve período entre que se muestra la página y se oculta el spinner. Si el usuario hace click en ese instante, el click es interceptado por el spinner.

## Cambios propuestos

### A. Agregar `pointer-events: none` al spinner cuando está oculto

En [`assets/css/base.css`](assets/css/base.css:207-218), agregar `pointer-events: none` al `.spinner` por defecto, y `pointer-events: auto` solo cuando está activo:

```css
.spinner {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;        /* ← AGREGAR: no bloquea clicks cuando oculto */
  transition: opacity var(--t), visibility var(--t);
}

.spinner--activo {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;        /* ← AGREGAR: bloquea clicks solo cuando visible */
}
```

### B. Agregar console.log de diagnóstico en `ejecutarRegistro()`

En [`pages/auth/auth.js`](pages/auth/auth.js:64-119), modificar `ejecutarRegistro()`:

```js
async function ejecutarRegistro() {
  console.log('🔍 ejecutarRegistro() llamado');
  const btn = document.getElementById('btn-registro');
  console.log('🔘 botón encontrado:', btn);
  if (!btn) return;

  btn.addEventListener('click', async () => {
    console.log('🖱️ CLICK DETECTADO en btn-registro');  // ← DIAGNÓSTICO 1
    ocultarError();

    const nombreCompleto = document.getElementById('nombre-completo').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;

    console.log('📝 Campos:', { nombreCompleto, email, password: '***', confirmarPassword: '***' }); // ← DIAGNÓSTICO 2

    if (!nombreCompleto || !email || !password || !confirmarPassword) {
      console.log('❌ Validación: campos incompletos');  // ← DIAGNÓSTICO 3
      mostrarError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmarPassword) {
      console.log('❌ Validación: contraseñas no coinciden');  // ← DIAGNÓSTICO 4
      mostrarError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      console.log('❌ Validación: contraseña muy corta');  // ← DIAGNÓSTICO 5
      mostrarError('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    console.log('✅ Validaciones pasadas, llamando a supabase.auth.signUp()...');  // ← DIAGNÓSTICO 6
    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';
    mostrarCarga(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombreCompleto } },
    });

    console.log('📡 Respuesta de signUp:', { data, error });  // ← DIAGNÓSTICO 7

    mostrarCarga(false);
    btn.disabled = false;
    btn.textContent = 'Crear Cuenta';

    if (error) {
      console.log('❌ Error en signUp:', error);  // ← DIAGNÓSTICO 8
      mostrarError(traducirError(error));
      return;
    }

    if (data?.user) {
      console.log('✅ Usuario creado:', data.user.email);  // ← DIAGNÓSTICO 9
      document.getElementById('form-registro').style.display = 'none';
      const alertaExito = document.getElementById('alerta-exito');
      if (alertaExito) {
        alertaExito.textContent = 'Revisa tu correo para verificar tu cuenta.';
        alertaExito.style.display = 'block';
      }
    }
  });
}
```

### C. Verificar que el spinner no esté bloqueando (solución definitiva)

Además del `pointer-events`, se puede cambiar `mostrarCarga()` en [`assets/js/utils.js`](assets/js/utils.js:27-30) para usar la clase `spinner--activo` en lugar de `style.display`, lo cual es más consistente con el CSS:

```js
export function mostrarCarga(mostrar) {
  const el = document.getElementById('spinner');
  if (el) {
    if (mostrar) {
      el.classList.add('spinner--activo');
      el.style.display = 'flex';
    } else {
      el.classList.remove('spinner--activo');
      el.style.display = 'none';
    }
  }
}
```

## Resumen de causas posibles

| # | Causa | Probabilidad | Solución |
|---|-------|-------------|----------|
| 1 | **Spinner cubre el botón** (z-index: 9999, inset: 0) bloqueando clicks | 🔴 Alta | Agregar `pointer-events: none` al spinner cuando oculto |
| 2 | Error silencioso en `mostrarCarga()` que deja el spinner visible | 🟡 Media | Agregar diagnóstico en console.log |
| 3 | El formulario intercepta el evento (submit) | 🟢 Baja | Ya tiene `type="button"`, confirmar con diagnóstico |
| 4 | El callback async lanza error antes del primer console.log | 🟢 Baja | Agregar console.log como primera línea del callback |

## Archivos a modificar

1. [`assets/css/base.css`](assets/css/base.css:207-218) — Agregar `pointer-events: none/auto`
2. [`pages/auth/auth.js`](pages/auth/auth.js:64-119) — Agregar console.log de diagnóstico
3. [`assets/js/utils.js`](assets/js/utils.js:27-30) — (Opcional) Mejorar `mostrarCarga()` para usar clases CSS
