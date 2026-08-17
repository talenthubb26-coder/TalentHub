/* =========================================================
   TALENTHUB - CONFIGURACION.JS
   Ajustes de cuenta: datos basicos, contraseña (demostrativa),
   privacidad, seguridad para menores y reinicio de datos.
   ========================================================= */

let usuarioConfig = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioConfig = TH_SHELL.montar('configuracion', 'Configuración');
  if (!usuarioConfig) return;

  document.getElementById('cfg-nombre').value = usuarioConfig.nombre || '';
  document.getElementById('cfg-correo').value = usuarioConfig.correo || '';
  document.getElementById('priv-edad').checked = !!usuarioConfig.mostrarEdad;
  document.getElementById('cfg-plan-actual').textContent = usuarioConfig.premium ? 'Estás en el Plan Premium.' : 'Estás en el Plan Estándar.';

  if (usuarioConfig.esMenor) {
    document.getElementById('seccion-menores').classList.remove('oculto');
  }

  document.getElementById('form-datos-basicos').addEventListener('submit', function (evento) {
    evento.preventDefault();
    TH.actualizarUsuario(usuarioConfig.id, {
      nombre: document.getElementById('cfg-nombre').value.trim() || usuarioConfig.nombre,
      correo: document.getElementById('cfg-correo').value.trim() || usuarioConfig.correo
    });
    usuarioConfig = TH.obtenerUsuarioPorId(usuarioConfig.id);
    THUI.mostrarToast('Tus datos se actualizaron correctamente.', 'exito');
  });

  document.getElementById('form-clave').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const actual = document.getElementById('cfg-clave-actual').value;
    const nueva = document.getElementById('cfg-clave-nueva').value;

    if (actual !== usuarioConfig.password) {
      THUI.mostrarToast('Tu contraseña actual no coincide.', 'error');
      return;
    }
    if (nueva.length < 6) {
      THUI.mostrarToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    TH.actualizarUsuario(usuarioConfig.id, { password: nueva });
    usuarioConfig = TH.obtenerUsuarioPorId(usuarioConfig.id);
    document.getElementById('form-clave').reset();
    THUI.mostrarToast('Contraseña actualizada correctamente.', 'exito');
  });

  document.getElementById('priv-edad').addEventListener('change', function () {
    TH.actualizarUsuario(usuarioConfig.id, { mostrarEdad: this.checked });
    usuarioConfig = TH.obtenerUsuarioPorId(usuarioConfig.id);
    THUI.mostrarToast('Preferencia de privacidad actualizada.', 'info');
  });

  document.getElementById('btn-reiniciar-demo').addEventListener('click', function () {
    if (!window.confirm('¿Restablecer todos los datos de demostración de TalentHub? Esto no afecta tu sesión actual.')) return;
    TH.reiniciarDatosDemo();
    THUI.mostrarToast('Los datos de demostración fueron restablecidos.', 'exito');
  });

  document.getElementById('btn-cerrar-sesion-config').addEventListener('click', function () {
    TH.cerrarSesion();
    window.location.href = 'index.html';
  });

  pintarMetodosPago();
  inicializarModalTarjeta();
});

/* ---------------------------------------------------------
   PAGOS Y SEGURIDAD
   --------------------------------------------------------- */
function pintarMetodosPago() {
  const contenedor = document.getElementById('lista-metodos-pago');
  const metodos = usuarioConfig.metodosPago || [];
  contenedor.innerHTML = '';

  if (!metodos.length) {
    contenedor.innerHTML = '<p class="text-graytext text-sm">Todavía no agregaste ningún método de pago.</p>';
    return;
  }

  metodos.forEach(function (metodo) {
    const fila = document.createElement('div');
    fila.className = 'flex items-center justify-between gap-3 border border-[#ECEEF6] rounded-xl p-4';
    fila.innerHTML =
      '<div class="flex items-center gap-3">' +
      '  <div class="w-11 h-8 rounded-md bg-navy text-white flex items-center justify-center"><svg width="16" height="16"><use href="assets/icons/sprite.svg#icon-credit-card"></use></svg></div>' +
      '  <p class="font-medium text-sm">' + metodo.marca + ' •••• ' + metodo.ultimos4 + '</p>' +
      '</div>' +
      '<div class="flex items-center gap-4">' +
      '  <button type="button" class="btn-eliminar-metodo text-[#C0392B] text-xs font-display font-semibold" data-id="' + metodo.id + '">Eliminar</button>' +
      '</div>';
    contenedor.appendChild(fila);
  });

  contenedor.querySelectorAll('.btn-eliminar-metodo').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const id = boton.getAttribute('data-id');
      TH.actualizarUsuario(usuarioConfig.id, { metodosPago: (usuarioConfig.metodosPago || []).filter(function (m) { return m.id !== id; }) });
      usuarioConfig = TH.obtenerUsuarioPorId(usuarioConfig.id);
      pintarMetodosPago();
      THUI.mostrarToast('Método de pago eliminado.', 'info');
    });
  });
}

function inicializarModalTarjeta() {
  document.getElementById('btn-agregar-tarjeta').addEventListener('click', function () {
    document.getElementById('form-agregar-tarjeta').reset();
    THUI.abrirModal('modal-agregar-tarjeta');
  });

  document.getElementById('form-agregar-tarjeta').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const numero = document.getElementById('tj-numero').value.replace(/\s/g, '');
    const ultimos4 = numero.slice(-4) || '0000';

    const nuevoMetodo = { id: TH.generarId('mp'), marca: document.getElementById('tj-marca').value, ultimos4: ultimos4 };
    TH.actualizarUsuario(usuarioConfig.id, { metodosPago: (usuarioConfig.metodosPago || []).concat([nuevoMetodo]) });
    usuarioConfig = TH.obtenerUsuarioPorId(usuarioConfig.id);

    THUI.cerrarModal('modal-agregar-tarjeta');
    THUI.mostrarToast('Tarjeta agregada correctamente.', 'exito');
    pintarMetodosPago();
  });
}
