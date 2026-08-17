/* =========================================================
   TALENTHUB - NOTIFICACIONES.JS
   Lista de notificaciones del usuario, con opcion de marcarlas
   como leidas individualmente o todas a la vez.
   ========================================================= */

let usuarioNotificaciones = null;

const ICONOS_NOTIFICACION = {
  perfil: 'icon-eye', comunidad: 'icon-message-circle', postulacion: 'icon-send',
  xp: 'icon-trending-up', nivel: 'icon-badge', encargo: 'icon-briefcase'
};

document.addEventListener('DOMContentLoaded', function () {
  usuarioNotificaciones = TH_SHELL.montar('notificaciones', 'Notificaciones');
  if (!usuarioNotificaciones) return;

  pintarNotificaciones();

  document.getElementById('btn-marcar-leidas').addEventListener('click', function () {
    TH.marcarTodasLeidas(usuarioNotificaciones.id);
    pintarNotificaciones();
    THUI.mostrarToast('Todas las notificaciones fueron marcadas como leídas.', 'exito');
  });
});

function pintarNotificaciones() {
  const contenedor = document.getElementById('notificaciones-lista');
  const notificaciones = TH.obtenerNotificaciones(usuarioNotificaciones.id);
  contenedor.innerHTML = '';

  if (!notificaciones.length) {
    contenedor.innerHTML = '<div class="th-vacio"><img src="assets/img/mascota-talenthub.png" class="w-16 mx-auto mb-3" alt=""><p class="text-graytext text-sm">No tienes notificaciones todavía.</p></div>';
    return;
  }

  notificaciones.forEach(function (n) {
    const fila = document.createElement('button');
    fila.type = 'button';
    fila.className = 'dash-fila-actividad w-full text-left' + (!n.leida ? ' bg-[#FAF9FF]' : '');
    fila.innerHTML =
      '<div class="dash-fila-actividad__icono"><svg width="17" height="17"><use href="assets/icons/sprite.svg#' + (ICONOS_NOTIFICACION[n.tipo] || 'icon-bell') + '"></use></svg></div>' +
      '<div class="min-w-0 flex-1">' +
      '  <p class="text-sm text-navy leading-snug">' + n.texto + '</p>' +
      '  <p class="text-graytext text-xs mt-1">' + TH.formatearFechaRelativa(n.fecha) + '</p>' +
      '</div>' +
      (!n.leida ? '<span class="w-2 h-2 rounded-full bg-purple mt-1.5 shrink-0"></span>' : '');

    fila.addEventListener('click', function () {
      if (!n.leida) {
        TH.marcarNotificacionLeida(n.id);
        pintarNotificaciones();
      }
    });
    contenedor.appendChild(fila);
  });
}
