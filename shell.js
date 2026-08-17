/* =========================================================
   TALENTHUB - SHELL.JS
   Construye la estructura de navegacion compartida por todas las
   paginas internas de la aplicacion (todo excepto index.html,
   login.html y registro.html): la barra lateral de escritorio, la
   barra superior y la navegacion inferior movil.
   Debe cargarse despues de store.js y ui.js, y cada pagina debe
   llamar a TH_SHELL.montar('id-de-pagina') dentro de su propio
   script para dibujar el shell y exigir sesion activa.
   ========================================================= */

const TH_SHELL = (function () {

  const ENLACES_TALENTO = [
    { id: 'dashboard', href: 'dashboard.html', icono: 'icon-home', texto: 'Inicio' },
    { id: 'muro', href: 'muro.html', icono: 'icon-layout-grid', texto: 'Muro de encargos' },
    { id: 'explorador', href: 'explorador.html', icono: 'icon-search', texto: 'Explorador de talentos' },
    { id: 'mensajes', href: 'mensajes.html', icono: 'icon-message-circle', texto: 'Mensajes' },
    { id: 'comunidades', href: 'comunidades.html', icono: 'icon-users', texto: 'Comunidades' },
    { id: 'aprendizaje', href: 'aprendizaje.html', icono: 'icon-book-open', texto: 'Aprendizaje' },
    { id: 'perfil', href: 'perfil.html', icono: 'icon-badge', texto: 'Mi perfil' }
  ];

  const ENLACES_NEGOCIO = [
    { id: 'negocio', href: 'negocio.html', icono: 'icon-home', texto: 'Panel de negocio' },
    { id: 'muro', href: 'muro.html', icono: 'icon-layout-grid', texto: 'Muro de encargos' },
    { id: 'publicar-encargo', href: 'publicar-encargo.html', icono: 'icon-plus', texto: 'Publicar encargo' },
    { id: 'explorador', href: 'explorador.html', icono: 'icon-search', texto: 'Explorador de talentos' },
    { id: 'mensajes', href: 'mensajes.html', icono: 'icon-message-circle', texto: 'Mensajes' },
    { id: 'comunidades', href: 'comunidades.html', icono: 'icon-users', texto: 'Comunidades' }
  ];

  const ENLACES_MOVIL_TALENTO = [
    { id: 'dashboard', href: 'dashboard.html', icono: 'icon-home', texto: 'Inicio' },
    { id: 'muro', href: 'muro.html', icono: 'icon-layout-grid', texto: 'Encargos' },
    { id: 'mensajes', href: 'mensajes.html', icono: 'icon-message-circle', texto: 'Mensajes' },
    { id: 'comunidades', href: 'comunidades.html', icono: 'icon-users', texto: 'Comunidad' },
    { id: 'perfil', href: 'perfil.html', icono: 'icon-badge', texto: 'Perfil' }
  ];

  const ENLACES_MOVIL_NEGOCIO = [
    { id: 'negocio', href: 'negocio.html', icono: 'icon-home', texto: 'Inicio' },
    { id: 'muro', href: 'muro.html', icono: 'icon-layout-grid', texto: 'Encargos' },
    { id: 'explorador', href: 'explorador.html', icono: 'icon-search', texto: 'Explorar' },
    { id: 'mensajes', href: 'mensajes.html', icono: 'icon-message-circle', texto: 'Mensajes' },
    { id: 'comunidades', href: 'comunidades.html', icono: 'icon-users', texto: 'Comunidad' }
  ];

  function icono(nombre, tamano) {
    const t = tamano || 20;
    return '<svg width="' + t + '" height="' + t + '"><use href="assets/icons/sprite.svg#' + nombre + '"></use></svg>';
  }

  function construirSidebar(paginaActual, usuario) {
    const esNegocio = usuario.tipo === 'negocio';
    const enlaces = esNegocio ? ENLACES_NEGOCIO : ENLACES_TALENTO;
    const progreso = esNegocio ? null : TH.calcularProgresoNivel(usuario.xp);

    let html = '';
    html += '<div class="th-sidebar__logo">';
    html += '  <a href="' + (esNegocio ? 'negocio.html' : 'dashboard.html') + '"><img src="assets/logo/logo-light.svg" alt="TalentHub" class="h-8 w-auto"></a>';
    html += '  <button type="button" class="th-sidebar__cerrar lg:hidden" id="btn-cerrar-sidebar" aria-label="Cerrar menú">' + icono('icon-close', 20) + '</button>';
    html += '</div>';

    html += '<nav class="th-sidebar__nav" aria-label="Navegación principal">';
    enlaces.forEach(function (enlace) {
      const activo = enlace.id === paginaActual ? ' activo' : '';
      html += '<a href="' + enlace.href + '" class="th-sidebar__enlace' + activo + '">' + icono(enlace.icono) + '<span>' + enlace.texto + '</span>';
      if (enlace.id === 'mensajes' && typeof TH.contarConversacionesNoLeidas === 'function') {
        const noLeidosMsj = TH.contarConversacionesNoLeidas(usuario.id);
        if (noLeidosMsj > 0) html += '<span class="th-badge-num">' + noLeidosMsj + '</span>';
      }
      html += '</a>';
    });
    html += '</nav>';

    html += '<div class="th-sidebar__extra">';
    html += '  <a href="notificaciones.html" class="th-sidebar__enlace' + (paginaActual === 'notificaciones' ? ' activo' : '') + '">' + icono('icon-bell') + '<span>Notificaciones</span>';
    const noLeidas = TH.contarNoLeidas(usuario.id);
    if (noLeidas > 0) html += '<span class="th-badge-num">' + noLeidas + '</span>';
    html += '</a>';
    html += '  <a href="configuracion.html" class="th-sidebar__enlace' + (paginaActual === 'configuracion' ? ' activo' : '') + '">' + icono('icon-settings') + '<span>Configuración</span></a>';
    html += '  <a href="index.html" class="th-sidebar__enlace">' + icono('icon-arrow-left') + '<span>Volver a la landing</span></a>';
    html += '</div>';

    html += '<div class="th-sidebar__usuario">';
    html += '  <a href="' + (esNegocio ? 'negocio.html' : 'perfil.html') + '" class="flex items-center gap-3 min-w-0">';
    html += '    <img src="' + TH.urlAvatar(usuario.avatarSeed) + '" alt="" class="w-10 h-10 rounded-full bg-white/10 shrink-0">';
    html += '    <span class="min-w-0">';
    html += '      <span class="block text-sm font-semibold text-white truncate">' + usuario.nombre + '</span>';
    html += '      <span class="block text-xs text-white/55">' + (esNegocio ? (usuario.nombreEmpresa || 'Cuenta de negocio') : ('Nivel ' + progreso.nivel)) + '</span>';
    html += '    </span>';
    html += '  </a>';
    html += '  <button type="button" id="btn-cerrar-sesion" class="th-sidebar__salir" aria-label="Cerrar sesión" title="Cerrar sesión">' + icono('icon-log-out', 18) + '</button>';
    html += '</div>';

    return html;
  }

  function construirTopbar(titulo, usuario) {
    let html = '';
    html += '<button type="button" id="btn-abrir-sidebar" class="th-topbar__hamburguesa lg:hidden" aria-label="Abrir menú">' + icono('icon-menu', 22) + '</button>';
    html += '<h1 class="th-topbar__titulo">' + titulo + '</h1>';
    html += '<div class="th-topbar__acciones">';
    html += '  <a href="notificaciones.html" class="th-topbar__icono" aria-label="Notificaciones">' + icono('icon-bell', 20);
    const noLeidas = TH.contarNoLeidas(usuario.id);
    if (noLeidas > 0) html += '<span class="th-badge-punto"></span>';
    html += '  </a>';
    html += '  <img src="' + TH.urlAvatar(usuario.avatarSeed) + '" alt="Avatar de ' + usuario.nombre + '" class="w-9 h-9 rounded-full hidden sm:block">';
    html += '</div>';
    return html;
  }

  function construirNavMovil(paginaActual, usuario) {
    const enlaces = usuario.tipo === 'negocio' ? ENLACES_MOVIL_NEGOCIO : ENLACES_MOVIL_TALENTO;
    let html = '';
    enlaces.forEach(function (enlace) {
      const activo = enlace.id === paginaActual ? ' activo' : '';
      html += '<a href="' + enlace.href + '" class="th-navmovil__enlace' + activo + '">' + icono(enlace.icono, 21) + '<span>' + enlace.texto + '</span></a>';
    });
    return html;
  }

  /**
   * Dibuja el shell completo dentro de una pagina interna y exige que
   * exista una sesion activa (redirige a login.html si no la hay).
   * Devuelve el usuario actual para que la pagina lo use.
   */
  function montar(paginaActual, tituloTopbar) {
    const usuario = TH.requerirSesion();
    if (!usuario) return null;

    const nodoSidebar = document.getElementById('th-sidebar');
    const nodoTopbar = document.getElementById('th-topbar');
    const nodoMovil = document.getElementById('th-mobile-nav');

    if (nodoSidebar) nodoSidebar.innerHTML = construirSidebar(paginaActual, usuario);
    if (nodoTopbar) nodoTopbar.innerHTML = construirTopbar(tituloTopbar || '', usuario);
    if (nodoMovil) nodoMovil.innerHTML = construirNavMovil(paginaActual, usuario);

    // Apertura y cierre del menu lateral en movil
    const overlay = document.getElementById('th-sidebar-overlay');
    const botonAbrir = document.getElementById('btn-abrir-sidebar');
    const botonCerrar = document.getElementById('btn-cerrar-sidebar');

    function abrirSidebarMovil() {
      nodoSidebar.classList.add('th-sidebar--abierta');
      if (overlay) overlay.classList.add('activo');
    }
    function cerrarSidebarMovil() {
      nodoSidebar.classList.remove('th-sidebar--abierta');
      if (overlay) overlay.classList.remove('activo');
    }
    if (botonAbrir) botonAbrir.addEventListener('click', abrirSidebarMovil);
    if (botonCerrar) botonCerrar.addEventListener('click', cerrarSidebarMovil);
    if (overlay) overlay.addEventListener('click', cerrarSidebarMovil);

    // Cerrar sesion
    const botonSalir = document.getElementById('btn-cerrar-sesion');
    if (botonSalir) {
      botonSalir.addEventListener('click', function () {
        TH.cerrarSesion();
        window.location.href = 'index.html';
      });
    }

    return usuario;
  }

  return { montar: montar, icono: icono };
})();
