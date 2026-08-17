/* =========================================================
   TALENTHUB - PLANES.JS
   Pagina de planes/suscripcion. El contenido y el flujo de pago
   se adaptan segun el tipo de cuenta: Plan Plus para talentos,
   Plan Empresas para negocios. Simulacion sin pagos reales.
   ========================================================= */

let usuarioPlanes = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioPlanes = TH_SHELL.montar('planes', 'Planes');
  if (!usuarioPlanes) return;

  const esNegocio = usuarioPlanes.tipo === 'negocio';

  document.getElementById(esNegocio ? 'planes-encabezado-negocio' : 'planes-encabezado-talento').classList.remove('oculto');
  document.getElementById(esNegocio ? 'planes-negocio' : 'planes-talento').classList.remove('oculto');

  actualizarEstadoBotones();
  inicializarModalPago();

  const botonPremium = esNegocio ? document.getElementById('btn-plan-empresas') : document.getElementById('btn-plan-premium');
  botonPremium.addEventListener('click', function () {
    if (usuarioPlanes.premium) return;
    abrirModalPago();
  });
});

function abrirModalPago() {
  document.getElementById('form-pago-premium').reset();
  const esNegocio = usuarioPlanes.tipo === 'negocio';

  document.getElementById('titulo-pago-premium').textContent = esNegocio ? 'Pago del Plan Empresas' : 'Pago del Plan Premium';
  document.getElementById('descripcion-pago-premium').textContent = esNegocio ? 'S/ 39.90 al mes. Puedes cancelar cuando quieras.' : 'S/ 20.00 al mes. Puedes cancelar cuando quieras.';
  document.getElementById('btn-pagar-confirmar').textContent = esNegocio ? 'Pagar S/ 39.90 y activar Empresas' : 'Pagar S/ 20.00 y activar Premium';

  const metodos = usuarioPlanes.metodosPago || [];
  const contenedorGuardado = document.getElementById('pago-metodo-guardado');
  const select = document.getElementById('pago-select-metodo');

  if (metodos.length) {
    contenedorGuardado.classList.remove('oculto');
    select.innerHTML = metodos.map(function (m) { return '<option value="' + m.id + '">' + m.marca + ' •••• ' + m.ultimos4 + '</option>'; }).join('') +
      '<option value="">Usar una tarjeta nueva</option>';
  } else {
    contenedorGuardado.classList.add('oculto');
  }

  THUI.abrirModal('modal-pago-premium');
}

function inicializarModalPago() {
  document.getElementById('form-pago-premium').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const esNegocio = usuarioPlanes.tipo === 'negocio';

    const select = document.getElementById('pago-select-metodo');
    const usaMetodoGuardado = select && select.value;

    if (!usaMetodoGuardado) {
      const numero = document.getElementById('pago-numero').value.replace(/\s/g, '');
      if (numero.length < 4) {
        THUI.mostrarToast('Ingresa un número de tarjeta de prueba válido.', 'error');
        return;
      }
      const nuevoMetodo = { id: TH.generarId('mp'), marca: document.getElementById('pago-marca').value, ultimos4: numero.slice(-4) };
      TH.actualizarUsuario(usuarioPlanes.id, { metodosPago: (usuarioPlanes.metodosPago || []).concat([nuevoMetodo]) });
      usuarioPlanes = TH.obtenerUsuarioPorId(usuarioPlanes.id);
    }

    TH.actualizarUsuario(usuarioPlanes.id, { premium: true });
    usuarioPlanes = TH.obtenerUsuarioPorId(usuarioPlanes.id);
    TH.crearNotificacion(usuarioPlanes.id, esNegocio ? 'Tu pago de S/ 39.90 fue procesado. Activaste el Plan Empresas.' : 'Tu pago de S/ 20.00 fue procesado. Activaste el Plan Premium.', 'nivel');

    THUI.cerrarModal('modal-pago-premium');
    actualizarEstadoBotones();

    document.getElementById('titulo-premium-activado').textContent = esNegocio ? '¡Ahora tienes el Plan Empresas!' : '¡Ahora eres Premium!';
    document.getElementById('descripcion-premium-activado').textContent = esNegocio
      ? 'Ya puedes publicar encargos sin límite y destacar tus talentos guardados en este prototipo.'
      : 'Desbloqueaste todas las decoraciones y beneficios del Plan Premium en este prototipo.';
    THUI.abrirModal('modal-premium-activado');
  });
}

function actualizarEstadoBotones() {
  const esNegocio = usuarioPlanes.tipo === 'negocio';
  const botonEstandar = document.getElementById(esNegocio ? 'btn-plan-estandar-negocio' : 'btn-plan-estandar');
  const botonPremium = document.getElementById(esNegocio ? 'btn-plan-empresas' : 'btn-plan-premium');

  if (usuarioPlanes.premium) {
    botonEstandar.textContent = esNegocio ? 'Cambiar a Estándar' : 'Cambiar a Estándar';
    botonPremium.textContent = 'Plan actual';
    botonPremium.disabled = true;
    botonPremium.classList.add('opacity-60');

    botonEstandar.onclick = function () {
      TH.actualizarUsuario(usuarioPlanes.id, { premium: false });
      usuarioPlanes = TH.obtenerUsuarioPorId(usuarioPlanes.id);
      THUI.mostrarToast('Volviste al Plan Estándar.', 'info');
      actualizarEstadoBotones();
    };
  } else {
    botonEstandar.textContent = esNegocio ? 'Elegir Estándar' : 'Plan actual';
    botonEstandar.disabled = !esNegocio;
    botonEstandar.classList.toggle('opacity-60', !esNegocio);
    botonEstandar.onclick = null;
    botonPremium.disabled = false;
    botonPremium.classList.remove('opacity-60');
    botonPremium.textContent = esNegocio ? 'Mejorar a Empresas' : 'Mejorar a Premium';
  }
}
