/* =========================================================
   TALENTHUB - DASHBOARD.JS
   Llena el panel principal con los datos del usuario que inicio
   sesion: nivel, XP, accesos rapidos, encargos recomendados,
   comunidades, cursos, actividad reciente e insignias.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const usuario = TH_SHELL.montar('dashboard', 'Inicio');
  if (!usuario) return;

  if (usuario.tipo === 'negocio') {
    window.location.href = 'negocio.html';
    return;
  }

  pintarSaludoYNivel(usuario);
  pintarAccesosYTip(usuario);
  pintarEncargosRecomendados(usuario);
  pintarComunidadesRecomendadas();
  pintarCursosRecomendados();
  pintarActividadReciente(usuario);
  pintarInsignias(usuario);
});

function pintarSaludoYNivel(usuario) {
  const primerNombre = usuario.nombre.split(' ')[0];
  document.getElementById('saludo-nombre').textContent = 'Hola, ' + primerNombre;
  document.getElementById('dash-avatar').src = TH.urlAvatar(usuario.avatarSeed);
  document.getElementById('dash-avatar').alt = 'Avatar de ' + usuario.nombre;

  const progreso = TH.calcularProgresoNivel(usuario.xp);
  document.getElementById('dash-nivel-etiqueta').textContent = 'Nivel ' + progreso.nivel;
  document.getElementById('dash-xp-texto').textContent = usuario.xp.toLocaleString('es-PE') + ' XP';
  document.getElementById('dash-barra-xp').style.width = progreso.porcentaje + '%';
  document.getElementById('dash-xp-faltante').textContent = 'Te faltan ' + progreso.xpFaltante + ' XP para alcanzar el Nivel ' + (progreso.nivel + 1);

  const contenedorTalentos = document.getElementById('dash-talentos');
  (usuario.talentos || []).slice(0, 4).forEach(function (t) {
    const chip = document.createElement('span');
    chip.className = 'th-etiqueta bg-white/10 text-white';
    chip.textContent = t;
    contenedorTalentos.appendChild(chip);
  });
}

function pintarAccesosYTip(usuario) {
  if (!usuario.bio || usuario.bio.trim() === '') {
    document.getElementById('dash-tip-perfil').classList.remove('oculto');
  }
  if (!usuario.premium) {
    document.getElementById('dash-promo-premium').classList.remove('oculto');
  }
}

function pintarEncargosRecomendados(usuario) {
  const contenedor = document.getElementById('dash-encargos');
  const talentosUsuario = (usuario.talentos || []).map(function (t) { return t.toLowerCase(); });

  let encargos = TH.obtenerEncargos().filter(TH.estaEncargoVigente);
  encargos.sort(function (a, b) {
    const puntajeA = talentosUsuario.some(function (t) { return a.categoria.toLowerCase().includes(t) || t.includes(a.categoria.toLowerCase()); }) ? 1 : 0;
    const puntajeB = talentosUsuario.some(function (t) { return b.categoria.toLowerCase().includes(t) || t.includes(b.categoria.toLowerCase()); }) ? 1 : 0;
    return puntajeB - puntajeA;
  });

  encargos.slice(0, 3).forEach(function (encargo) {
    const autor = TH.obtenerUsuarioPorId(encargo.autorId);
    const tarjeta = document.createElement('a');
    tarjeta.href = 'encargo.html?id=' + encargo.id;
    tarjeta.className = 'th-tarjeta p-5 block hover:shadow-[var(--shadow-soft)] transition-shadow duration-300';
    tarjeta.innerHTML =
      '<span class="th-etiqueta th-etiqueta--purple">' + encargo.categoria + '</span>' +
      '<h3 class="font-display font-semibold text-[15px] mt-3 leading-snug">' + encargo.titulo + '</h3>' +
      '<p class="text-graytext text-xs mt-2">' + (autor ? (autor.nombreEmpresa || autor.nombre) : 'TalentHub') + '</p>' +
      '<p class="font-display font-semibold text-sm mt-3 text-navy">S/ ' + encargo.presupuestoMin + ' - S/ ' + encargo.presupuestoMax + '</p>';
    contenedor.appendChild(tarjeta);
  });

  if (!encargos.length) {
    contenedor.innerHTML = '<p class="text-graytext text-sm">Todavía no hay encargos disponibles.</p>';
  }
}

function pintarComunidadesRecomendadas() {
  const contenedor = document.getElementById('dash-comunidades');
  const comunidades = TH.obtenerComunidades().slice(0, 3);

  comunidades.forEach(function (comunidad) {
    const fila = document.createElement('a');
    fila.href = 'comunidad.html?id=' + comunidad.id;
    fila.className = 'th-tarjeta dash-mini-tarjeta hover:shadow-[var(--shadow-soft)] transition-shadow duration-300';
    fila.innerHTML =
      '<div class="w-11 h-11 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0"><svg width="20" height="20"><use href="assets/icons/sprite.svg#icon-users"></use></svg></div>' +
      '<div class="min-w-0 flex-1">' +
      '  <p class="font-display font-semibold text-sm truncate">' + comunidad.nombre + '</p>' +
      '  <p class="text-graytext text-xs">' + comunidad.miembros.toLocaleString('es-PE') + ' miembros</p>' +
      '</div>' +
      '<svg width="16" height="16" class="text-graytext/50 shrink-0"><use href="assets/icons/sprite.svg#icon-arrow-right"></use></svg>';
    contenedor.appendChild(fila);
  });
}

function pintarCursosRecomendados() {
  const contenedor = document.getElementById('dash-cursos');
  const cursos = TH.obtenerCursos().filter(function (c) { return !TH.cursoEstaCompletado(c.id); }).slice(0, 3);

  cursos.forEach(function (curso) {
    const fila = document.createElement('a');
    fila.href = 'aprendizaje.html?id=' + curso.id;
    fila.className = 'th-tarjeta dash-mini-tarjeta hover:shadow-[var(--shadow-soft)] transition-shadow duration-300';
    fila.innerHTML =
      '<div class="w-11 h-11 rounded-xl bg-gold/25 text-navy flex items-center justify-center shrink-0"><svg width="20" height="20"><use href="assets/icons/sprite.svg#icon-book-open"></use></svg></div>' +
      '<div class="min-w-0 flex-1">' +
      '  <p class="font-display font-semibold text-sm truncate">' + curso.titulo + '</p>' +
      '  <p class="text-graytext text-xs">' + curso.duracion + ' · +' + curso.xp + ' XP</p>' +
      '</div>' +
      '<svg width="16" height="16" class="text-graytext/50 shrink-0"><use href="assets/icons/sprite.svg#icon-arrow-right"></use></svg>';
    contenedor.appendChild(fila);
  });

  if (!cursos.length) {
    contenedor.innerHTML = '<p class="text-graytext text-sm">Completaste todos los recursos disponibles. ¡Vuelve pronto por más!</p>';
  }
}

function pintarActividadReciente(usuario) {
  const contenedor = document.getElementById('dash-actividad');
  const notificaciones = TH.obtenerNotificaciones(usuario.id).slice(0, 5);

  const iconosPorTipo = { perfil: 'icon-eye', comunidad: 'icon-message-circle', postulacion: 'icon-send', xp: 'icon-trending-up', nivel: 'icon-badge', encargo: 'icon-briefcase' };

  if (!notificaciones.length) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">Todavía no tienes actividad reciente.</p></div>';
    return;
  }

  notificaciones.forEach(function (n) {
    const fila = document.createElement('div');
    fila.className = 'dash-fila-actividad';
    fila.innerHTML =
      '<div class="dash-fila-actividad__icono"><svg width="17" height="17"><use href="assets/icons/sprite.svg#' + (iconosPorTipo[n.tipo] || 'icon-bell') + '"></use></svg></div>' +
      '<div class="min-w-0">' +
      '  <p class="text-sm text-navy leading-snug">' + n.texto + '</p>' +
      '  <p class="text-graytext text-xs mt-1">' + TH.formatearFechaRelativa(n.fecha) + '</p>' +
      '</div>';
    contenedor.appendChild(fila);
  });
}

function pintarInsignias(usuario) {
  const contenedor = document.getElementById('dash-insignias');
  const insignias = usuario.insignias || [];

  if (!insignias.length) {
    contenedor.innerHTML = '<p class="text-graytext text-sm">Todavía no desbloqueas insignias. Completa acciones dentro de TalentHub para ganar tus primeras.</p>';
    return;
  }

  insignias.forEach(function (insignia) {
    const chip = document.createElement('span');
    chip.className = 'dash-insignia';
    chip.innerHTML = '<svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-badge"></use></svg>' + insignia;
    contenedor.appendChild(chip);
  });
}
