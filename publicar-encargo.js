/* =========================================================
   TALENTHUB - PUBLICAR-ENCARGO.JS
   Formulario de publicacion de encargos, exclusivo para cuentas
   de tipo negocio.
   ========================================================= */

let usuarioPublicar = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioPublicar = TH_SHELL.montar('publicar-encargo', 'Publicar encargo');
  if (!usuarioPublicar) return;

  if (usuarioPublicar.tipo !== 'negocio') {
    window.location.href = 'dashboard.html';
    return;
  }

  if (haAlcanzadoElLimite()) {
    document.getElementById('limite-numero-encargos').textContent = TH.LIMITE_ENCARGOS_ESTANDAR;
    THUI.abrirModal('modal-limite-encargos');
    document.getElementById('form-publicar-encargo').classList.add('oculto');
  }

  document.getElementById('form-publicar-encargo').addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (haAlcanzadoElLimite()) {
      document.getElementById('limite-numero-encargos').textContent = TH.LIMITE_ENCARGOS_ESTANDAR;
      THUI.abrirModal('modal-limite-encargos');
      return;
    }

    const titulo = document.getElementById('pe-titulo').value.trim();
    const descripcion = document.getElementById('pe-descripcion').value.trim();
    if (!titulo || !descripcion) {
      THUI.mostrarToast('Completa al menos el título y la descripción.', 'error');
      return;
    }

    const min = parseInt(document.getElementById('pe-presupuesto-min').value, 10) || 0;
    const max = parseInt(document.getElementById('pe-presupuesto-max').value, 10) || min;

    TH.crearEncargo({
      titulo: titulo,
      descripcion: descripcion,
      categoria: document.getElementById('pe-categoria').value,
      modalidad: document.getElementById('pe-modalidad').value,
      presupuestoMin: min,
      presupuestoMax: Math.max(min, max),
      ubicacion: document.getElementById('pe-ubicacion').value.trim(),
      fechaLimite: document.getElementById('pe-fecha-limite').value || new Date(Date.now() + 12096e5).toISOString().slice(0, 10),
      habilidades: document.getElementById('pe-habilidades').value.split(',').map(function (h) { return h.trim(); }).filter(Boolean),
      nivelRecomendado: parseInt(document.getElementById('pe-nivel').value, 10),
      autorId: usuarioPublicar.id
    });

    THUI.abrirModal('modal-encargo-publicado');
  });
});

function haAlcanzadoElLimite() {
  if (usuarioPublicar.premium) return false;
  return TH.contarEncargosActivosNegocio(usuarioPublicar.id) >= TH.LIMITE_ENCARGOS_ESTANDAR;
}
