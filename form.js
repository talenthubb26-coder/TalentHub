/* =========================================================
   TALENTHUB - FORM.JS
   Validacion del formulario de contacto final, en JavaScript
   puro y sin backend. Valida nombre, correo y mensaje, muestra
   mensajes de error puntuales y un mensaje de exito al enviar.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('formulario-contacto');
  if (!formulario) return;

  const campoNombre = document.getElementById('campo-nombre');
  const campoCorreo = document.getElementById('campo-correo');
  const campoMensaje = document.getElementById('campo-mensaje');
  const mensajeExito = document.getElementById('mensaje-exito');

  const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombreValido = validarCampo(campoNombre, campoNombre.value.trim().length >= 3);
    const correoValido = validarCampo(campoCorreo, expresionCorreo.test(campoCorreo.value.trim()));
    const mensajeValido = validarCampo(campoMensaje, campoMensaje.value.trim().length >= 10);

    const formularioValido = nombreValido && correoValido && mensajeValido;

    if (formularioValido) {
      mostrarExito();
      formulario.reset();
    } else {
      mensajeExito.classList.add('hidden');
    }
  });

  // Revalida cada campo mientras el usuario escribe, para retirar el
  // error apenas el dato se vuelve valido (mejor experiencia de uso).
  campoNombre.addEventListener('input', function () {
    if (campoNombre.value.trim().length >= 3) quitarError(campoNombre);
  });
  campoCorreo.addEventListener('input', function () {
    if (expresionCorreo.test(campoCorreo.value.trim())) quitarError(campoCorreo);
  });
  campoMensaje.addEventListener('input', function () {
    if (campoMensaje.value.trim().length >= 10) quitarError(campoMensaje);
  });

  /**
   * Marca visualmente un campo como valido o invalido segun la
   * condicion recibida y muestra u oculta su mensaje de error asociado.
   * Devuelve la condicion para poder combinarla en la validacion general.
   */
  function validarCampo(campo, condicion) {
    const idError = 'error-' + campo.name;
    const mensajeError = document.getElementById(idError);

    if (condicion) {
      quitarError(campo);
    } else {
      campo.classList.add('campo-error');
      if (mensajeError) mensajeError.classList.add('campo-error-visible');
    }
    return condicion;
  }

  /**
   * Quita el estado de error visual de un campo especifico.
   */
  function quitarError(campo) {
    campo.classList.remove('campo-error');
    const mensajeError = document.getElementById('error-' + campo.name);
    if (mensajeError) mensajeError.classList.remove('campo-error-visible');
  }

  /**
   * Muestra el mensaje de confirmacion de envio y lo oculta
   * automaticamente pasados unos segundos.
   */
  function mostrarExito() {
    mensajeExito.classList.remove('hidden');
    setTimeout(function () {
      mensajeExito.classList.add('hidden');
    }, 6000);
  }
});
