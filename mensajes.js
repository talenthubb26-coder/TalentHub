/* =========================================================
   TALENTHUB - MENSAJES.JS
   Lista de conversaciones y vista de hilo. Si una conversacion
   esta ligada a un encargo, muestra el estado del deposito
   protegido segun la regla: el cliente deposita el pago dentro
   de TalentHub antes de iniciar el encargo, y el dinero se
   libera al talento cuando el encargo se confirma como completado.
   ========================================================= */

let usuarioMensajes = null;
let conversacionActivaId = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioMensajes = TH_SHELL.montar('mensajes', 'Mensajes');
  if (!usuarioMensajes) return;

  pintarListaConversaciones();

  document.getElementById('mensajes-buscador').addEventListener('input', pintarListaConversaciones);

  document.getElementById('btn-volver-lista').addEventListener('click', function () {
    document.getElementById('mensajes-contenedor').classList.remove('mostrando-hilo');
  });

  document.getElementById('form-mensaje').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const input = document.getElementById('input-mensaje');
    const texto = input.value.trim();
    if (!texto || !conversacionActivaId) return;

    TH.agregarMensaje(conversacionActivaId, usuarioMensajes.id, texto);
    input.value = '';
    pintarHilo(conversacionActivaId, false);
    pintarListaConversaciones();
  });

  // Si llegamos con ?id= (por ejemplo desde "Contactar" en un perfil publico)
  const idInicial = new URLSearchParams(window.location.search).get('id');
  if (idInicial) abrirConversacion(idInicial);
});

function otroParticipante(conversacion) {
  const otroId = conversacion.participantes.find(function (id) { return id !== usuarioMensajes.id; });
  return TH.obtenerUsuarioPorId(otroId);
}

function nombreVisible(usuario) {
  if (!usuario) return 'Usuario de TalentHub';
  return usuario.tipo === 'negocio' ? (usuario.nombreEmpresa || usuario.nombre) : usuario.nombre;
}

function pintarListaConversaciones() {
  const texto = document.getElementById('mensajes-buscador').value.trim().toLowerCase();
  const contenedor = document.getElementById('mensajes-lista');
  let conversaciones = TH.obtenerConversaciones(usuarioMensajes.id);

  if (texto) {
    conversaciones = conversaciones.filter(function (c) {
      const otro = otroParticipante(c);
      return nombreVisible(otro).toLowerCase().includes(texto);
    });
  }

  contenedor.innerHTML = '';

  if (!conversaciones.length) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">No tienes conversaciones todavía. Escríbele a un talento o negocio desde su perfil.</p></div>';
    return;
  }

  conversaciones.forEach(function (conversacion) {
    const otro = otroParticipante(conversacion);
    const ultimo = conversacion.mensajes[conversacion.mensajes.length - 1];
    const noLeido = conversacion.noLeidoPara.includes(usuarioMensajes.id);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'conversacion-item' + (conversacion.id === conversacionActivaId ? ' activa' : '');
    boton.innerHTML =
      '<img src="' + TH.urlAvatar(otro ? otro.avatarSeed : 'TalentHub') + '" class="w-11 h-11 rounded-full shrink-0" alt="">' +
      '<div class="min-w-0 flex-1">' +
      '  <div class="flex items-center justify-between gap-2">' +
      '    <p class="font-display font-semibold text-sm truncate">' + nombreVisible(otro) + '</p>' +
      '    <span class="text-graytext text-[11px] shrink-0">' + (ultimo ? TH.formatearFechaRelativa(ultimo.fecha) : '') + '</span>' +
      '  </div>' +
      '  <div class="flex items-center justify-between gap-2 mt-0.5">' +
      '    <p class="text-graytext text-xs truncate">' + (ultimo ? ultimo.texto : 'Sin mensajes todavía') + '</p>' +
      (noLeido ? '    <span class="conversacion-item__punto"></span>' : '') +
      '  </div>' +
      '</div>';

    boton.addEventListener('click', function () { abrirConversacion(conversacion.id); });
    contenedor.appendChild(boton);
  });
}

function abrirConversacion(id) {
  const conversacion = TH.obtenerConversacionPorId(id);
  if (!conversacion || !conversacion.participantes.includes(usuarioMensajes.id)) return;

  conversacionActivaId = id;
  TH.marcarConversacionLeida(id, usuarioMensajes.id);

  document.getElementById('mensajes-vacio').classList.add('oculto');
  document.getElementById('mensajes-hilo').classList.remove('oculto');
  document.getElementById('mensajes-contenedor').classList.add('mostrando-hilo');

  pintarHilo(id, true);
  pintarListaConversaciones();
}

function pintarHilo(id, hacerScroll) {
  const conversacion = TH.obtenerConversacionPorId(id);
  if (!conversacion) return;
  const otro = otroParticipante(conversacion);

  document.getElementById('hilo-avatar').src = TH.urlAvatar(otro ? otro.avatarSeed : 'TalentHub');
  document.getElementById('hilo-nombre').textContent = nombreVisible(otro);
  document.getElementById('hilo-meta').textContent = otro && otro.tipo === 'negocio' ? (otro.categoriaEmpresa || 'Negocio en TalentHub') : (otro ? 'Nivel ' + TH.calcularProgresoNivel(otro.xp).nivel : '');

  pintarAvisoDeposito(conversacion);

  const cuerpo = document.getElementById('mensajes-cuerpo');
  cuerpo.innerHTML = '';
  conversacion.mensajes.forEach(function (mensaje) {
    const esPropio = mensaje.autorId === usuarioMensajes.id;
    const envoltorio = document.createElement('div');
    envoltorio.style.display = 'flex';
    envoltorio.style.flexDirection = 'column';
    envoltorio.style.alignItems = esPropio ? 'flex-end' : 'flex-start';
    envoltorio.innerHTML =
      '<div class="mensaje-burbuja ' + (esPropio ? 'mensaje-burbuja--propio' : 'mensaje-burbuja--otro') + '">' + mensaje.texto + '</div>' +
      '<span class="mensaje-hora">' + TH.formatearFechaRelativa(mensaje.fecha) + '</span>';
    cuerpo.appendChild(envoltorio);
  });

  if (hacerScroll !== false) {
    requestAnimationFrame(function () { cuerpo.scrollTop = cuerpo.scrollHeight; });
  } else {
    cuerpo.scrollTop = cuerpo.scrollHeight;
  }
}

function pintarAvisoDeposito(conversacion) {
  const contenedor = document.getElementById('hilo-deposito');

  if (!conversacion.encargoId && !conversacion.deposito) {
    contenedor.classList.add('oculto');
    return;
  }

  const encargo = conversacion.encargoId ? TH.obtenerEncargoPorId(conversacion.encargoId) : null;
  const deposito = conversacion.deposito;
  const esNegocio = usuarioMensajes.tipo === 'negocio';

  contenedor.classList.remove('oculto');

  if (!deposito) {
    contenedor.className = 'mx-4 mt-4 p-3.5 rounded-xl border flex items-start gap-3 bg-gold/10 border-gold/40';
    contenedor.innerHTML =
      '<svg width="18" height="18" class="text-navy mt-0.5 shrink-0"><use href="assets/icons/sprite.svg#icon-lock"></use></svg>' +
      '<div class="min-w-0">' +
      '  <p class="font-display font-semibold text-xs">Depósito pendiente' + (encargo ? ' · ' + encargo.titulo : '') + '</p>' +
      '  <p class="text-graytext text-xs mt-1 leading-relaxed">El cliente debe depositar el pago dentro de TalentHub antes de iniciar el encargo. El dinero queda protegido hasta que el trabajo se entregue y se confirme como completado.</p>' +
      (esNegocio ? '  <button type="button" id="btn-simular-deposito" class="mt-2 bg-navy text-white text-xs font-display font-semibold px-4 py-2 rounded-full">Simular depósito de S/ ' + (encargo ? encargo.presupuestoMin : 50) + '</button>' : '') +
      '</div>';

    const botonDepositar = document.getElementById('btn-simular-deposito');
    if (botonDepositar) {
      botonDepositar.addEventListener('click', function () {
        TH.registrarDepositoConversacion(conversacion.id, encargo ? encargo.presupuestoMin : 50);
        TH.agregarMensaje(conversacion.id, usuarioMensajes.id, 'Realicé el depósito para este encargo. El pago queda protegido en TalentHub hasta que confirmemos la entrega.');
        pintarHilo(conversacion.id, true);
        pintarListaConversaciones();
        THUI.mostrarToast('Depósito simulado y protegido.', 'exito');
      });
    }
  } else if (deposito.estado === 'protegido') {
    contenedor.className = 'mx-4 mt-4 p-3.5 rounded-xl border flex items-start gap-3 bg-[#1C8F5B]/10 border-[#1C8F5B]/30';
    contenedor.innerHTML =
      '<svg width="18" height="18" class="text-[#1C8F5B] mt-0.5 shrink-0"><use href="assets/icons/sprite.svg#icon-shield-check"></use></svg>' +
      '<div class="min-w-0">' +
      '  <p class="font-display font-semibold text-xs">Depósito protegido: S/ ' + deposito.monto.toFixed(2) + '</p>' +
      '  <p class="text-graytext text-xs mt-1 leading-relaxed">El dinero está resguardado en TalentHub y se liberará al talento cuando el negocio confirme que el encargo fue completado.</p>' +
      (esNegocio ? '  <button type="button" id="btn-liberar-deposito" class="mt-2 bg-navy text-white text-xs font-display font-semibold px-4 py-2 rounded-full">Confirmar entrega y liberar pago</button>' : '') +
      '</div>';

    const botonLiberar = document.getElementById('btn-liberar-deposito');
    if (botonLiberar) {
      botonLiberar.addEventListener('click', function () {
        TH.liberarDepositoConversacion(conversacion.id);
        TH.agregarMensaje(conversacion.id, usuarioMensajes.id, 'Confirmé la entrega del encargo. El pago ya fue liberado, ¡gracias por tu trabajo!');
        const talentoId = conversacion.participantes.find(function (id) { return id !== usuarioMensajes.id; });
        if (talentoId) TH.crearNotificacion(talentoId, 'Tu pago de S/ ' + deposito.monto.toFixed(2) + ' fue liberado. ¡Encargo completado!', 'encargo');
        pintarHilo(conversacion.id, true);
        pintarListaConversaciones();
        THUI.mostrarToast('Pago liberado al talento.', 'exito');
      });
    }
  } else {
    contenedor.className = 'mx-4 mt-4 p-3.5 rounded-xl border flex items-start gap-3 bg-navy/5 border-navy/10';
    contenedor.innerHTML =
      '<svg width="18" height="18" class="text-navy mt-0.5 shrink-0"><use href="assets/icons/sprite.svg#icon-check-circle"></use></svg>' +
      '<div class="min-w-0"><p class="font-display font-semibold text-xs">Pago liberado: S/ ' + deposito.monto.toFixed(2) + '</p>' +
      '<p class="text-graytext text-xs mt-1">Este encargo ya fue completado y pagado.</p></div>';
  }
}
