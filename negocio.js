/* =========================================================
   TALENTHUB - NEGOCIO.JS
   Panel principal para cuentas de tipo negocio: encargos propios,
   postulantes recibidos, explorador de talentos, contacto real y
   lista de talentos guardados.
   ========================================================= */

let usuarioNegocio = null;
let talentoContactadoId = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioNegocio = TH_SHELL.montar('negocio', 'Panel de negocio');
  if (!usuarioNegocio) return;

  if (usuarioNegocio.tipo !== 'negocio') {
    window.location.href = 'dashboard.html';
    return;
  }

  pintarCabecera();
  pintarMisEncargos();
  pintarExploradorTalentos();
  inicializarModalGuardados();
  inicializarModalContactar();
});

function pintarCabecera() {
  document.getElementById('negocio-nombre').textContent = usuarioNegocio.nombreEmpresa || usuarioNegocio.nombre;
  document.getElementById('negocio-categoria').textContent = (usuarioNegocio.categoriaEmpresa || '') + (usuarioNegocio.ciudad ? ' · ' + usuarioNegocio.ciudad : '');

  const idsEncargos = TH.obtenerEncargos().filter(function (e) { return e.autorId === usuarioNegocio.id; }).map(function (e) { return e.id; });
  const postulaciones = TH.obtenerPostulaciones().filter(function (p) { return idsEncargos.includes(p.encargoId); });
  const cuposUsados = TH.contarEncargosActivosNegocio(usuarioNegocio.id);

  if (usuarioNegocio.premium) {
    document.getElementById('negocio-stat-activos').textContent = cuposUsados;
    document.getElementById('negocio-stat-activos-label').textContent = 'Encargos activos (ilimitado)';
  } else {
    document.getElementById('negocio-stat-activos').textContent = cuposUsados + '/' + TH.LIMITE_ENCARGOS_ESTANDAR;
    document.getElementById('negocio-stat-activos-label').textContent = 'Encargos activos';
  }
  document.getElementById('negocio-stat-postulantes').textContent = postulaciones.length;
  document.getElementById('negocio-stat-guardados').textContent = (usuarioNegocio.talentosGuardados || []).length;

  document.getElementById('negocio-promo-premium').classList.toggle('oculto', !!usuarioNegocio.premium);
}

function pintarMisEncargos() {
  const contenedor = document.getElementById('negocio-encargos');
  const misEncargos = TH.obtenerEncargos().filter(function (e) { return e.autorId === usuarioNegocio.id && e.estado !== 'Eliminado'; });
  contenedor.innerHTML = '';

  if (!misEncargos.length) {
    contenedor.innerHTML = '<div class="th-vacio"><img src="assets/img/mascota-talenthub.png" class="w-16 mx-auto mb-3" alt=""><p class="text-graytext text-sm">Todavía no publicaste ningún encargo.</p></div>';
    return;
  }

  misEncargos.forEach(function (encargo) {
    const postulaciones = TH.obtenerPostulaciones().filter(function (p) { return p.encargoId === encargo.id; });
    const vigente = TH.estaEncargoVigente(encargo);
    const estadoTexto = vigente ? 'Abierto' : 'Caducado';
    const fila = document.createElement('div');
    fila.className = 'th-tarjeta p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3';
    fila.innerHTML =
      '<div class="min-w-0">' +
      '  <div class="flex items-center gap-2 flex-wrap mb-1.5"><span class="th-etiqueta th-etiqueta--purple">' + encargo.categoria + '</span><span class="th-etiqueta th-etiqueta--' + (vigente ? 'verde' : 'navy') + '">' + estadoTexto + '</span></div>' +
      '  <p class="font-display font-semibold text-sm">' + encargo.titulo + '</p>' +
      '  <p class="text-graytext text-xs mt-1">S/ ' + encargo.presupuestoMin + ' - ' + encargo.presupuestoMax + ' · Hasta el ' + formatearFechaCorta(encargo.fechaLimite) + ' · ' + postulaciones.length + ' postulación(es)</p>' +
      '</div>' +
      '<div class="flex gap-2 shrink-0">' +
      '  <button type="button" class="btn-ver-postulantes border-2 border-navy/15 text-navy font-display text-xs font-semibold px-4 py-2.5 rounded-full hover:border-navy/35 transition-colors duration-300" data-id="' + encargo.id + '">Ver postulantes</button>' +
      '  <button type="button" class="btn-eliminar-encargo border-2 border-[#E38A8A] text-[#C0392B] font-display text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#FFF3F3] transition-colors duration-300" data-id="' + encargo.id + '">Eliminar</button>' +
      '</div>';
    contenedor.appendChild(fila);
  });

  contenedor.querySelectorAll('.btn-eliminar-encargo').forEach(function (boton) {
    boton.addEventListener('click', function () {
      if (!window.confirm('¿Eliminar este encargo? El cupo que ocupa quedará bloqueado 24 horas antes de poder usarse para publicar uno nuevo.')) return;
      TH.eliminarEncargo(boton.getAttribute('data-id'));
      THUI.mostrarToast('Encargo eliminado. El cupo se liberará en 24 horas.', 'info');
      pintarCabecera();
      pintarMisEncargos();
    });
  });

  contenedor.querySelectorAll('.btn-ver-postulantes').forEach(function (boton) {
    boton.addEventListener('click', function () { mostrarPostulantes(boton.getAttribute('data-id')); });
  });
}

function mostrarPostulantes(encargoId) {
  const encargo = TH.obtenerEncargoPorId(encargoId);
  const postulaciones = TH.obtenerPostulaciones().filter(function (p) { return p.encargoId === encargoId; });
  const contenedor = document.getElementById('lista-postulantes');
  contenedor.innerHTML = '';

  document.querySelector('#modal-postulantes h3').textContent = 'Postulantes a "' + encargo.titulo + '"';

  if (!postulaciones.length) {
    contenedor.innerHTML = '<p class="text-graytext text-sm">Todavía no hay postulaciones para este encargo.</p>';
  } else {
    postulaciones.forEach(function (postulacion) {
      const talento = TH.obtenerUsuarioPorId(postulacion.userId);
      if (!talento) return;
      const div = document.createElement('div');
      div.className = 'th-tarjeta p-4 flex gap-3';
      div.innerHTML =
        '<img src="' + TH.urlAvatar(talento.avatarSeed) + '" class="w-11 h-11 rounded-full shrink-0" alt="">' +
        '<div class="min-w-0 flex-1">' +
        '  <p class="font-display font-semibold text-sm">' + talento.nombre + '</p>' +
        '  <p class="text-graytext text-xs">Nivel ' + TH.calcularProgresoNivel(talento.xp).nivel + ' · ' + talento.ciudad + '</p>' +
        '  <p class="text-graytext text-sm mt-2 leading-relaxed">' + (postulacion.mensaje || 'Sin mensaje de presentación.') + '</p>' +
        '  <div class="flex gap-2 mt-3">' +
        '    <button type="button" class="btn-aceptar-postulante bg-purple text-white text-xs font-display font-semibold px-4 py-2 rounded-full">Aceptar</button>' +
        '    <a href="perfil-publico.html?id=' + talento.id + '" class="border-2 border-navy/15 text-navy text-xs font-display font-semibold px-4 py-2 rounded-full">Ver perfil</a>' +
        '  </div>' +
        '</div>';
      div.querySelector('.btn-aceptar-postulante').addEventListener('click', function () {
        THUI.mostrarToast('Aceptaste la postulación de ' + talento.nombre.split(' ')[0] + ' (demostración).', 'exito');
      });
      contenedor.appendChild(div);
    });
  }

  THUI.abrirModal('modal-postulantes');
}

function construirTarjetaTalento(talento) {
  const guardado = (usuarioNegocio.talentosGuardados || []).includes(talento.id);
  const tarjeta = document.createElement('article');
  tarjeta.className = 'th-tarjeta p-5';
  tarjeta.innerHTML =
    '<a href="perfil-publico.html?id=' + talento.id + '" class="flex items-center gap-3 mb-3">' +
    '  <img src="' + TH.urlAvatar(talento.avatarSeed) + '" class="w-12 h-12 rounded-full" alt="">' +
    '  <div class="min-w-0"><p class="font-display font-semibold text-sm truncate">' + talento.nombre + '</p><p class="text-graytext text-xs">' + talento.ciudad + '</p></div>' +
    '</a>' +
    '<div class="flex flex-wrap gap-1.5 mb-3">' + (talento.talentos || []).slice(0, 3).map(function (t) { return '<span class="th-etiqueta th-etiqueta--navy">' + t + '</span>'; }).join('') + '</div>' +
    '<div class="flex items-center gap-3 text-xs text-graytext mb-4">' +
    '  <span class="flex items-center gap-1"><svg width="12" height="12" class="text-gold"><use href="assets/icons/sprite.svg#icon-star"></use></svg>' + (talento.valoracion || 0).toFixed(1) + '</span>' +
    '  <span>Nivel ' + TH.calcularProgresoNivel(talento.xp).nivel + '</span>' +
    '</div>' +
    '<div class="flex gap-2 mb-2">' +
    '  <a href="perfil-publico.html?id=' + talento.id + '" class="flex-1 text-center border-2 border-navy/15 text-navy font-display text-xs font-semibold py-2.5 rounded-full hover:border-navy/35 transition-colors duration-300">Ver perfil</a>' +
    '  <button type="button" class="btn-contactar-talento flex-1 bg-purple text-white font-display text-xs font-semibold py-2.5 rounded-full hover:bg-purple-dark transition-colors duration-300" data-id="' + talento.id + '">Contactar</button>' +
    '</div>' +
    '<button type="button" class="btn-guardar-talento w-full font-display text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 ' + (guardado ? 'bg-grayxl text-navy' : 'border-2 border-navy/15 text-navy hover:border-navy/35') + '" data-id="' + talento.id + '">' + (guardado ? 'Guardado' : 'Guardar') + '</button>';
  return tarjeta;
}

function pintarExploradorTalentos() {
  const contenedor = document.getElementById('negocio-talentos');
  const talentos = TH.obtenerUsuarios().filter(function (u) { return u.tipo === 'talento'; }).slice(0, 6);
  contenedor.innerHTML = '';

  talentos.forEach(function (talento) {
    contenedor.appendChild(construirTarjetaTalento(talento));
  });

  conectarBotonesTarjetas(contenedor);
}

function conectarBotonesTarjetas(contenedor) {
  contenedor.querySelectorAll('.btn-guardar-talento').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const id = boton.getAttribute('data-id');
      const lista = usuarioNegocio.talentosGuardados || [];
      const yaGuardado = lista.includes(id);
      TH.actualizarUsuario(usuarioNegocio.id, { talentosGuardados: yaGuardado ? lista.filter(function (x) { return x !== id; }) : lista.concat([id]) });
      usuarioNegocio = TH.obtenerUsuarioPorId(usuarioNegocio.id);
      pintarCabecera();
      pintarExploradorTalentos();
    });
  });

  contenedor.querySelectorAll('.btn-contactar-talento').forEach(function (boton) {
    boton.addEventListener('click', function () {
      abrirModalContactar(boton.getAttribute('data-id'));
    });
  });
}

/* ---------------------------------------------------------
   MODAL: TALENTOS GUARDADOS
   --------------------------------------------------------- */
function inicializarModalGuardados() {
  document.getElementById('btn-ver-guardados').addEventListener('click', function () {
    pintarListaGuardados();
    THUI.abrirModal('modal-guardados');
  });
}

function pintarListaGuardados() {
  const contenedor = document.getElementById('lista-guardados');
  const ids = usuarioNegocio.talentosGuardados || [];
  const talentos = ids.map(function (id) { return TH.obtenerUsuarioPorId(id); }).filter(Boolean);
  contenedor.innerHTML = '';

  if (!talentos.length) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">Todavía no guardaste ningún talento. Explóralos y guarda los que te interesen.</p></div>';
    return;
  }

  talentos.forEach(function (talento) {
    const fila = document.createElement('div');
    fila.className = 'flex items-center justify-between gap-3 py-2.5 px-1 border-b border-[#EEF0F7] last:border-0';
    fila.innerHTML =
      '<a href="perfil-publico.html?id=' + talento.id + '" class="flex items-center gap-3 min-w-0 flex-1">' +
      '  <img src="' + TH.urlAvatar(talento.avatarSeed) + '" class="w-10 h-10 rounded-full shrink-0" alt="">' +
      '  <div class="min-w-0"><p class="font-display font-semibold text-sm truncate">' + talento.nombre + '</p><p class="text-graytext text-xs truncate">' + (talento.talentos && talento.talentos[0] ? talento.talentos[0] : '') + '</p></div>' +
      '</a>' +
      '<button type="button" class="btn-quitar-guardado shrink-0 text-[#C0392B] text-xs font-display font-semibold px-3 py-1.5" data-id="' + talento.id + '">Quitar</button>';
    contenedor.appendChild(fila);
  });

  contenedor.querySelectorAll('.btn-quitar-guardado').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const id = boton.getAttribute('data-id');
      const lista = usuarioNegocio.talentosGuardados || [];
      TH.actualizarUsuario(usuarioNegocio.id, { talentosGuardados: lista.filter(function (x) { return x !== id; }) });
      usuarioNegocio = TH.obtenerUsuarioPorId(usuarioNegocio.id);
      pintarCabecera();
      pintarExploradorTalentos();
      pintarListaGuardados();
    });
  });
}

/* ---------------------------------------------------------
   MODAL: CONTACTAR TALENTO (mensaje real + proyecto opcional)
   --------------------------------------------------------- */
function abrirModalContactar(talentoId) {
  const talento = TH.obtenerUsuarioPorId(talentoId);
  if (!talento) return;
  talentoContactadoId = talentoId;

  document.getElementById('titulo-contactar-talento').textContent = 'Escribirle a ' + talento.nombre.split(' ')[0];
  document.getElementById('form-contactar-talento').reset();

  const select = document.getElementById('nt-proyecto');
  select.innerHTML = '<option value="">No referenciar ningún proyecto</option>';
  (talento.portafolio || []).forEach(function (p) {
    const opcion = document.createElement('option');
    opcion.value = p.id;
    opcion.textContent = p.titulo;
    select.appendChild(opcion);
  });

  THUI.abrirModal('modal-contactar-talento');
}

function inicializarModalContactar() {
  document.getElementById('form-contactar-talento').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const talento = TH.obtenerUsuarioPorId(talentoContactadoId);
    if (!talento) return;

    const mensaje = document.getElementById('nt-mensaje').value.trim();
    const idProyecto = document.getElementById('nt-proyecto').value;
    const proyecto = idProyecto ? (talento.portafolio || []).find(function (p) { return p.id === idProyecto; }) : null;

    let texto = mensaje || ('Hola, tu negocio ' + (usuarioNegocio.nombreEmpresa || usuarioNegocio.nombre) + ' está interesado en tu talento.');
    if (proyecto) texto += ' (Sobre tu proyecto: "' + proyecto.titulo + '")';

    const conversacion = TH.obtenerOCrearConversacion(usuarioNegocio.id, talento.id, null);
    TH.agregarMensaje(conversacion.id, usuarioNegocio.id, texto);

    THUI.cerrarModal('modal-contactar-talento');
    THUI.mostrarToast('Mensaje enviado a ' + talento.nombre.split(' ')[0] + '.', 'exito');
    setTimeout(function () { window.location.href = 'mensajes.html?id=' + conversacion.id; }, 500);
  });
}

function formatearFechaCorta(fechaISO) {
  return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}
