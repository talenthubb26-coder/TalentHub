/* =========================================================
   TALENTHUB - ENCARGO.JS
   Muestra el detalle de un encargo (leido por ?id= en la URL) y
   gestiona el flujo de postulacion.
   ========================================================= */

let usuarioEncargo = null;
let encargoActual = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioEncargo = TH_SHELL.montar('muro', 'Detalle del encargo');
  if (!usuarioEncargo) return;

  const idEncargo = new URLSearchParams(window.location.search).get('id');
  encargoActual = TH.obtenerEncargoPorId(idEncargo);

  if (!encargoActual) {
    document.getElementById('encargo-contenido').innerHTML =
      '<div class="th-vacio"><h2 class="font-display font-semibold text-lg">No encontramos este encargo</h2><p class="text-graytext text-sm mt-2">Puede que ya no esté disponible.</p></div>';
    return;
  }

  renderizarDetalle();
  inicializarAcciones();
});

function renderizarDetalle() {
  const e = encargoActual;
  const autor = TH.obtenerUsuarioPorId(e.autorId);
  const yaPostulo = TH.yaPostuloA(usuarioEncargo.id, e.id);
  const esNegocio = usuarioEncargo.tipo === 'negocio';
  const estaGuardado = (usuarioEncargo.encargosGuardados || []).includes(e.id);

  document.getElementById('encargo-contenido').innerHTML =
    '<div class="th-tarjeta p-6 md:p-9">' +
    '  <div class="flex items-center justify-between gap-3 flex-wrap mb-4">' +
    '    <span class="th-etiqueta th-etiqueta--purple">' + e.categoria + '</span>' +
    '    <span class="th-etiqueta th-etiqueta--navy">Nivel recomendado: ' + e.nivelRecomendado + '</span>' +
    '  </div>' +
    '  <h1 class="font-display font-bold text-2xl md:text-3xl leading-tight">' + e.titulo + '</h1>' +

    '  <div class="flex items-center gap-3 mt-5">' +
    '    <img src="' + TH.urlAvatar(autor ? autor.avatarSeed : 'TalentHub') + '" class="w-11 h-11 rounded-full" alt="">' +
    '    <div><p class="font-display font-semibold text-sm">' + (autor ? (autor.nombreEmpresa || autor.nombre) : 'TalentHub') + '</p>' +
    '    <p class="text-graytext text-xs">' + (autor ? autor.ciudad : '') + '</p></div>' +
    '  </div>' +

    '  <div class="grid sm:grid-cols-3 gap-4 mt-7 pt-7 border-t border-[#EEF0F7]">' +
    '    <div><p class="text-graytext text-xs mb-1">Presupuesto</p><p class="font-display font-bold text-navy">S/ ' + e.presupuestoMin + ' - ' + e.presupuestoMax + '</p></div>' +
    '    <div><p class="text-graytext text-xs mb-1">Modalidad</p><p class="font-semibold text-sm">' + e.modalidad + (e.ubicacion ? ' · ' + e.ubicacion : '') + '</p></div>' +
    '    <div><p class="text-graytext text-xs mb-1">Fecha límite</p><p class="font-semibold text-sm">' + new Date(e.fechaLimite + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p></div>' +
    '  </div>' +

    '  <div class="mt-7 pt-7 border-t border-[#EEF0F7]">' +
    '    <h2 class="font-display font-semibold text-base mb-2">Descripción completa</h2>' +
    '    <p class="text-graytext leading-relaxed">' + e.descripcion + '</p>' +
    '  </div>' +

    '  <div class="mt-7 pt-7 border-t border-[#EEF0F7]">' +
    '    <h2 class="font-display font-semibold text-base mb-3">Habilidades necesarias</h2>' +
    '    <div class="flex flex-wrap gap-2">' + (e.habilidades || []).map(function (h) { return '<span class="th-etiqueta th-etiqueta--navy">' + h + '</span>'; }).join('') + '</div>' +
    '  </div>' +

    '  <div class="mt-8 flex flex-wrap gap-3">' +
    (esNegocio
      ? '<p class="text-graytext text-sm">Las cuentas de negocio no pueden postularse a encargos.</p>'
      : '<button type="button" id="btn-postularme" class="inline-flex items-center gap-2 bg-purple text-white font-display text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-purple-dark transition-colors duration-300 disabled:opacity-50" ' + (yaPostulo ? 'disabled' : '') + '>' + (yaPostulo ? 'Ya te postulaste' : 'Postularme') + '</button>'
    ) +
    '    <button type="button" id="btn-guardar-encargo" class="inline-flex items-center gap-2 font-display text-sm font-semibold px-6 py-3.5 rounded-full transition-colors duration-300 ' + (estaGuardado ? 'bg-grayxl text-navy' : 'border-2 border-navy/15 text-navy hover:border-navy/35') + '"><svg width="16" height="16"><use href="assets/icons/sprite.svg#' + (estaGuardado ? 'icon-check' : 'icon-bookmark') + '"></use></svg> ' + (estaGuardado ? 'Guardado' : 'Guardar') + '</button>' +
    '    <button type="button" id="btn-compartir-encargo" class="inline-flex items-center gap-2 border-2 border-navy/15 text-navy font-display text-sm font-semibold px-6 py-3.5 rounded-full hover:border-navy/35 transition-colors duration-300"><svg width="16" height="16"><use href="assets/icons/sprite.svg#icon-share"></use></svg> Compartir</button>' +
    '  </div>' +
    '</div>';
}

function inicializarAcciones() {
  const botonPostularme = document.getElementById('btn-postularme');
  if (botonPostularme) {
    botonPostularme.addEventListener('click', function () {
      const select = document.getElementById('post-proyecto');
      select.innerHTML = '<option value="">No adjuntar proyecto</option>';
      (usuarioEncargo.portafolio || []).forEach(function (p) {
        const opcion = document.createElement('option');
        opcion.value = p.id;
        opcion.textContent = p.titulo;
        select.appendChild(opcion);
      });
      document.getElementById('post-mensaje').value = '';
      THUI.abrirModal('modal-postular');
    });
  }

  document.getElementById('btn-guardar-encargo').addEventListener('click', function () {
    const lista = usuarioEncargo.encargosGuardados || [];
    const yaGuardado = lista.includes(encargoActual.id);

    TH.actualizarUsuario(usuarioEncargo.id, {
      encargosGuardados: yaGuardado ? lista.filter(function (id) { return id !== encargoActual.id; }) : lista.concat([encargoActual.id])
    });
    usuarioEncargo = TH.obtenerUsuarioPorId(usuarioEncargo.id);

    THUI.mostrarToast(yaGuardado ? 'Quitaste el encargo de guardados.' : 'Encargo guardado y fijado en el muro.', 'exito');
    renderizarDetalle();
    inicializarAcciones();
  });

  document.getElementById('btn-compartir-encargo').addEventListener('click', function () {
    THUI.mostrarToast('Enlace del encargo copiado (demostración).', 'exito');
  });

  document.getElementById('form-postular').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const mensajePostulacion = document.getElementById('post-mensaje').value.trim();

    TH.crearPostulacion({
      encargoId: encargoActual.id,
      userId: usuarioEncargo.id,
      mensaje: mensajePostulacion,
      proyectoId: document.getElementById('post-proyecto').value
    });

    // Registra la postulacion como un mensaje enviado en la bandeja de Mensajes
    const conversacion = TH.obtenerOCrearConversacion(usuarioEncargo.id, encargoActual.autorId, encargoActual.id);
    TH.agregarMensaje(conversacion.id, usuarioEncargo.id,
      'Me postulé a tu encargo "' + encargoActual.titulo + '".' + (mensajePostulacion ? ' ' + mensajePostulacion : ''));

    TH.crearNotificacion(usuarioEncargo.id, 'Tu postulación a "' + encargoActual.titulo + '" fue recibida.', 'postulacion');

    const resultado = TH.otorgarXP(usuarioEncargo.id, TH.XP_ACCIONES.POSTULACION, 'postularte a un encargo');
    usuarioEncargo = TH.obtenerUsuarioPorId(usuarioEncargo.id);

    THUI.cerrarModal('modal-postular');
    document.getElementById('texto-xp-postulacion').textContent = '+' + TH.XP_ACCIONES.POSTULACION + ' XP por postularte';
    THUI.abrirModal('modal-postulacion-exito');

    renderizarDetalle();
    inicializarAcciones();

    if (resultado && resultado.subioNivel) {
      setTimeout(function () { THUI.mostrarToast('¡Subiste al Nivel ' + resultado.nivelNuevo + '!', 'exito'); }, 700);
    }
  });
}
