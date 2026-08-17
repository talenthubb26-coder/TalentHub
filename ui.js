/* =========================================================
   TALENTHUB - UI.JS
   Utilidades de interfaz compartidas por todas las paginas de
   la aplicacion: modales, notificaciones flotantes (toasts) y
   pequenas ayudas de formato. No depende de store.js.
   ========================================================= */

const THUI = (function () {

  /**
   * Abre un modal por su id. El modal debe tener la clase "modal-overlay"
   * y estar oculto por defecto con la clase "oculto".
   */
  function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('oculto');
    document.body.classList.add('overflow-hidden');
    requestAnimationFrame(function () { modal.classList.add('activo'); });
  }

  function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('activo');
    document.body.classList.remove('overflow-hidden');
    setTimeout(function () { modal.classList.add('oculto'); }, 200);
  }

  /**
   * Conecta automaticamente todos los elementos con data-cerrar-modal
   * (botones de cerrar y el fondo oscuro) para que cierren su modal
   * contenedor al hacer clic.
   */
  function inicializarModales() {
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (evento) {
        if (evento.target === overlay) cerrarModal(overlay.id);
      });
    });
    document.querySelectorAll('[data-cerrar-modal]').forEach(function (boton) {
      boton.addEventListener('click', function () {
        cerrarModal(boton.getAttribute('data-cerrar-modal'));
      });
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.activo').forEach(function (m) { cerrarModal(m.id); });
      }
    });
  }

  /**
   * Muestra una notificacion flotante temporal en la esquina de la
   * pantalla. tipo puede ser "exito", "error" o "info".
   */
  function mostrarToast(mensaje, tipo) {
    let contenedor = document.getElementById('contenedor-toasts');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'contenedor-toasts';
      contenedor.className = 'contenedor-toasts';
      document.body.appendChild(contenedor);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (tipo || 'info');
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    requestAnimationFrame(function () { toast.classList.add('activo'); });

    setTimeout(function () {
      toast.classList.remove('activo');
      setTimeout(function () { toast.remove(); }, 250);
    }, 3800);
  }

  document.addEventListener('DOMContentLoaded', inicializarModales);

  return {
    abrirModal: abrirModal,
    cerrarModal: cerrarModal,
    mostrarToast: mostrarToast
  };
})();
