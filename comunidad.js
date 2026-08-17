/* =========================================================
   TALENTHUB - COMUNIDAD.JS
   Logica de la pagina interna de una comunidad: publicaciones,
   comentarios, reacciones, canales simples y reportes.
   ========================================================= */

let usuarioComunidad = null;
let comunidadActual = null;
let canalActivo = 'general';
let publicacionAReportar = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioComunidad = TH_SHELL.montar('comunidades', 'Comunidad');
  if (!usuarioComunidad) return;

  const id = new URLSearchParams(window.location.search).get('id');
  comunidadActual = TH.obtenerComunidadPorId(id);

  if (!comunidadActual) {
    document.getElementById('comunidad-no-encontrada').classList.remove('oculto');
    return;
  }

  document.getElementById('comunidad-contenido').classList.remove('oculto');
  pintarCabecera();
  pintarPublicaciones();
  inicializarCanales();
  inicializarPublicar();
  inicializarReporte();
});

function estaUnidoComunidad() {
  return (usuarioComunidad.comunidadesUnidas || []).includes(comunidadActual.id);
}

function pintarCabecera() {
  const c = comunidadActual;
  const icono = document.getElementById('comunidad-icono');
  icono.className = 'comunidad-icono w-14 h-14 comunidad-icono--' + c.color;
  document.getElementById('comunidad-nombre').textContent = c.nombre;
  document.getElementById('comunidad-meta').textContent = c.categoria + ' · ' + c.miembros.toLocaleString('es-PE') + ' miembros';
  document.getElementById('comunidad-reglas').textContent = c.reglas || 'Sé respetuoso y colabora con la comunidad.';

  actualizarBotonUnirse();
}

function actualizarBotonUnirse() {
  const unido = estaUnidoComunidad();
  const boton = document.getElementById('btn-unirse-comunidad');
  boton.textContent = unido ? 'Ya eres miembro' : 'Unirme a la comunidad';
  boton.className = 'font-display text-sm font-semibold px-6 py-3 rounded-full transition-colors duration-300 shrink-0 ' + (unido ? 'bg-grayxl text-navy' : 'bg-purple text-white hover:bg-purple-dark');
  boton.onclick = function () {
    const lista = usuarioComunidad.comunidadesUnidas || [];
    if (unido) {
      TH.actualizarUsuario(usuarioComunidad.id, { comunidadesUnidas: lista.filter(function (x) { return x !== comunidadActual.id; }) });
      TH.ajustarMiembrosComunidad(comunidadActual.id, -1);
    } else {
      TH.actualizarUsuario(usuarioComunidad.id, { comunidadesUnidas: lista.concat([comunidadActual.id]) });
      TH.ajustarMiembrosComunidad(comunidadActual.id, 1);
      THUI.mostrarToast('Te uniste a ' + comunidadActual.nombre + '.', 'exito');
    }
    usuarioComunidad = TH.obtenerUsuarioPorId(usuarioComunidad.id);
    comunidadActual = TH.obtenerComunidadPorId(comunidadActual.id);
    pintarCabecera();
  };
}

function inicializarCanales() {
  document.querySelectorAll('.canal-enlace').forEach(function (enlace) {
    enlace.addEventListener('click', function (evento) {
      evento.preventDefault();
      document.querySelectorAll('.canal-enlace').forEach(function (e) { e.classList.remove('activo'); });
      enlace.classList.add('activo');
      canalActivo = enlace.getAttribute('data-canal');
      pintarPublicaciones();
    });
  });
}

function pintarPublicaciones() {
  const contenedor = document.getElementById('comunidad-publicaciones');
  contenedor.innerHTML = '';

  const publicaciones = (comunidadActual.publicaciones || []).filter(function (p) {
    return (p.canal || 'general') === canalActivo;
  });

  if (!publicaciones.length) {
    contenedor.innerHTML = '<div class="th-vacio"><img src="assets/img/mascota-talenthub.png" class="w-16 mx-auto mb-3" alt=""><p class="text-graytext text-sm">Todavía no hay publicaciones en este canal. ¡Sé el primero en escribir algo!</p></div>';
    return;
  }

  publicaciones.forEach(function (publicacion) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'publicacion-tarjeta';

    let comentariosHtml = (publicacion.comentarios || []).map(function (c) {
      return '<div class="flex gap-2.5 mt-3"><img src="' + TH.urlAvatar(c.avatarSeed || c.autor) + '" class="w-7 h-7 rounded-full shrink-0" alt="">' +
        '<div class="bg-grayxl rounded-xl px-3 py-2"><p class="text-xs font-semibold">' + c.autor + '</p><p class="text-xs text-graytext">' + c.texto + '</p></div></div>';
    }).join('');

    const totalLikes = (publicacion.likesBase || 0) + (publicacion.likedBy || []).length;
    const leGusta = (publicacion.likedBy || []).includes(usuarioComunidad.id);

    tarjeta.innerHTML =
      '<div class="flex items-center gap-3">' +
      '  <img src="' + TH.urlAvatar(publicacion.avatarSeed || publicacion.autor) + '" class="w-10 h-10 rounded-full shrink-0" alt="">' +
      '  <div class="min-w-0"><p class="font-display font-semibold text-sm truncate">' + publicacion.autor + '</p><p class="text-graytext text-xs">' + TH.formatearFechaRelativa(publicacion.fecha) + '</p></div>' +
      '</div>' +
      '<p class="text-navy text-sm leading-relaxed mt-3">' + publicacion.contenido + '</p>' +
      '<div class="flex items-center gap-4 mt-4 pt-3 border-t border-[#EEF0F7]">' +
      '  <button type="button" class="btn-like flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ' + (leGusta ? 'text-red-500' : 'text-graytext hover:text-purple') + '" data-id="' + publicacion.id + '"><svg width="15" height="15"><use href="assets/icons/sprite.svg#' + (leGusta ? 'icon-heart-filled' : 'icon-heart') + '"></use></svg> ' + totalLikes + '</button>' +
      '  <button type="button" class="btn-comentar flex items-center gap-1.5 text-graytext text-xs font-semibold hover:text-purple transition-colors duration-300"><svg width="15" height="15"><use href="assets/icons/sprite.svg#icon-comment"></use></svg> Comentar</button>' +
      '  <button type="button" class="btn-reportar flex items-center gap-1.5 text-graytext text-xs font-semibold hover:text-[#C0392B] transition-colors duration-300 ml-auto" data-id="' + publicacion.id + '"><svg width="15" height="15"><use href="assets/icons/sprite.svg#icon-flag"></use></svg> Reportar</button>' +
      '</div>' +
      '<div class="comentarios-lista">' + comentariosHtml + '</div>' +
      '<form class="form-comentario oculto flex gap-2 mt-3">' +
      '  <input type="text" class="th-input" placeholder="Escribe un comentario..." style="padding:8px 12px;font-size:13px;">' +
      '  <button type="submit" class="bg-navy text-white text-xs font-display font-semibold px-4 rounded-full shrink-0">Enviar</button>' +
      '</form>';

    contenedor.appendChild(tarjeta);

    tarjeta.querySelector('.btn-like').addEventListener('click', function () {
      const resultado = TH.reaccionarPublicacion(comunidadActual.id, publicacion.id, usuarioComunidad.id);
      comunidadActual = TH.obtenerComunidadPorId(comunidadActual.id);
      this.className = 'btn-like flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ' + (resultado.leGusta ? 'text-red-500' : 'text-graytext hover:text-purple');
      this.innerHTML = '<svg width="15" height="15"><use href="assets/icons/sprite.svg#' + (resultado.leGusta ? 'icon-heart-filled' : 'icon-heart') + '"></use></svg> ' + resultado.total;
    });

    tarjeta.querySelector('.btn-comentar').addEventListener('click', function () {
      tarjeta.querySelector('.form-comentario').classList.toggle('oculto');
    });

    tarjeta.querySelector('.btn-reportar').addEventListener('click', function () {
      publicacionAReportar = publicacion.id;
      document.getElementById('form-reportar').reset();
      THUI.abrirModal('modal-reportar');
    });

    tarjeta.querySelector('.form-comentario').addEventListener('submit', function (evento) {
      evento.preventDefault();
      const input = this.querySelector('input');
      const texto = input.value.trim();
      if (!texto) return;
      TH.agregarComentario(comunidadActual.id, publicacion.id, { autor: usuarioComunidad.nombre, avatarSeed: usuarioComunidad.avatarSeed, texto: texto });
      comunidadActual = TH.obtenerComunidadPorId(comunidadActual.id);
      input.value = '';
      pintarPublicaciones();
    });
  });
}

function inicializarPublicar() {
  document.getElementById('form-publicacion').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const input = document.getElementById('input-publicacion');
    const contenido = input.value.trim();
    if (!contenido) return;

    TH.agregarPublicacion(comunidadActual.id, {
      autor: usuarioComunidad.nombre,
      avatarSeed: usuarioComunidad.avatarSeed,
      contenido: contenido,
      canal: canalActivo
    });
    comunidadActual = TH.obtenerComunidadPorId(comunidadActual.id);
    input.value = '';
    pintarPublicaciones();

    const resultado = TH.otorgarXP(usuarioComunidad.id, TH.XP_ACCIONES.ACTIVIDAD_COMUNIDAD, 'participar en una comunidad');
    usuarioComunidad = TH.obtenerUsuarioPorId(usuarioComunidad.id);
    THUI.mostrarToast('Publicación creada. +' + TH.XP_ACCIONES.ACTIVIDAD_COMUNIDAD + ' XP por participar.', 'exito');
    if (resultado && resultado.subioNivel) {
      setTimeout(function () { THUI.mostrarToast('¡Subiste al Nivel ' + resultado.nivelNuevo + '!', 'exito'); }, 700);
    }
  });
}

function inicializarReporte() {
  document.getElementById('form-reportar').addEventListener('submit', function (evento) {
    evento.preventDefault();
    THUI.cerrarModal('modal-reportar');
    THUI.mostrarToast('Reporte recibido. Nuestro equipo revisará la situación.', 'info');
    publicacionAReportar = null;
  });
}
