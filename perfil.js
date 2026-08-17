/* =========================================================
   TALENTHUB - PERFIL.JS
   Logica de perfil.html: pestañas, edicion de perfil, portafolio,
   personalizacion (marcos, puntos, plan) y valoraciones. Todo se
   guarda en localStorage a traves de store.js.
   ========================================================= */

const MARCOS_AVATAR = [
  { id: 'clasico', nombre: 'Clásico', color: '#0B1E4F', requisito: null },
  { id: 'dorado', nombre: 'Dorado', color: '#E9E45C', requisito: 'nivel3' },
  { id: 'neon', nombre: 'Neón', color: '#7C5CFF', requisito: 'puntos150' },
  { id: 'premium', nombre: 'Premium', color: 'linear-gradient(135deg,#7C5CFF,#E9E45C)', requisito: 'premium' }
];

const VALORACIONES_EJEMPLO = [
  { autor: 'Café Central', avatarSeed: 'CafeCentral', texto: 'Excelente trabajo, entregó antes de lo acordado y con muy buena comunicación.', estrellas: 5, fecha: '2026-07-20' },
  { autor: 'Textiles del Sur', avatarSeed: 'TextilesSur', texto: 'Muy responsable y con mucho talento. Repetiríamos sin dudarlo.', estrellas: 5, fecha: '2026-06-02' },
  { autor: 'Ana Paucar', avatarSeed: 'Ana', texto: 'Buen trabajo en general, aunque el tiempo de entrega podría mejorar un poco.', estrellas: 4, fecha: '2026-04-14' }
];

let usuarioActual = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioActual = TH_SHELL.montar('perfil', 'Mi perfil');
  if (!usuarioActual) return;

  if (usuarioActual.tipo === 'negocio') {
    window.location.href = 'negocio.html';
    return;
  }

  pintarCabecera();
  pintarBanner();
  pintarPortafolio();
  pintarSobreMi();
  pintarServicios();
  pintarPersonalizacion();
  pintarValoraciones();
  inicializarTabs();
  inicializarModalEditarPerfil();
  inicializarModalAgregarProyecto();
  inicializarModalServicio();
  inicializarAccionesRapidas();
  inicializarModalSeguidores();
});

const BANNERS_PERFIL = [
  { id: 'aurora', nombre: 'Aurora' },
  { id: 'atardecer', nombre: 'Atardecer' },
  { id: 'medianoche', nombre: 'Medianoche' },
  { id: 'electrico', nombre: 'Eléctrico' }
];

function pintarBanner() {
  const claveBanner = usuarioActual.bannerPerfil || 'aurora';
  const portada = document.getElementById('perfil-portada');
  portada.className = 'perfil-portada perfil-portada--' + claveBanner;

  const contenedor = document.getElementById('perfil-banners');
  contenedor.innerHTML = '';
  BANNERS_PERFIL.forEach(function (banner) {
    const opcion = document.createElement('div');
    opcion.className = 'perfil-banner-opcion perfil-portada--' + banner.id + (banner.id === claveBanner ? ' seleccionado' : '');
    opcion.title = banner.nombre;
    opcion.addEventListener('click', function () {
      TH.actualizarUsuario(usuarioActual.id, { bannerPerfil: banner.id });
      refrescarUsuario();
      pintarBanner();
      THUI.mostrarToast('Portada "' + banner.nombre + '" aplicada.', 'exito');
    });
    contenedor.appendChild(opcion);
  });
}

function refrescarUsuario() {
  usuarioActual = TH.obtenerUsuarioPorId(usuarioActual.id);
}

/* ---------------------------------------------------------
   CABECERA
   --------------------------------------------------------- */
function pintarCabecera() {
  const u = usuarioActual;
  document.getElementById('perfil-avatar').src = TH.urlAvatar(u.avatarSeed);
  document.getElementById('perfil-avatar').alt = 'Avatar de ' + u.nombre;
  document.getElementById('perfil-nombre').textContent = u.nombre;

  const edadTexto = (u.mostrarEdad && u.edad) ? (u.edad + ' años · ') : '';
  document.getElementById('perfil-ubicacion').innerHTML = '<svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-map-pin"></use></svg> ' + edadTexto + (u.ciudad || 'Perú');

  const progreso = TH.calcularProgresoNivel(u.xp);
  const etiquetas = document.getElementById('perfil-etiquetas');
  etiquetas.innerHTML = '';
  agregarEtiqueta(etiquetas, 'Nivel ' + progreso.nivel, 'purple');
  agregarEtiqueta(etiquetas, u.disponibilidad || 'Disponible', u.disponibilidad === 'Disponible' ? 'verde' : 'navy');
  if (u.premium) agregarEtiqueta(etiquetas, 'Insignia Premium', 'gold');
  if (u.esMenor) agregarEtiqueta(etiquetas, 'Cuenta supervisada', 'navy');

  document.getElementById('perfil-stat-encargos').textContent = u.encargosCompletados || 0;
  document.getElementById('perfil-stat-valoracion').textContent = (u.valoracion || 0).toFixed(1);
  document.getElementById('perfil-stat-xp').textContent = u.xp.toLocaleString('es-PE');
  document.getElementById('perfil-stat-seguidores').textContent = TH.obtenerSeguidores(u.id).length;
  document.getElementById('perfil-stat-siguiendo').textContent = (u.siguiendo || []).length;
}

function agregarEtiqueta(contenedor, texto, variante) {
  const span = document.createElement('span');
  span.className = 'th-etiqueta th-etiqueta--' + variante;
  span.textContent = texto;
  contenedor.appendChild(span);
}

/* ---------------------------------------------------------
   TABS
   --------------------------------------------------------- */
function inicializarTabs() {
  const tabs = document.querySelectorAll('.th-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('activo'); });
      tab.classList.add('activo');
      const destino = tab.getAttribute('data-tab');
      document.querySelectorAll('.perfil-panel').forEach(function (panel) {
        panel.classList.toggle('oculto', panel.getAttribute('data-panel') !== destino);
      });
    });
  });
}

/* ---------------------------------------------------------
   PORTAFOLIO
   --------------------------------------------------------- */
function pintarPortafolio() {
  const contenedor = document.getElementById('perfil-portafolio-grid');
  contenedor.innerHTML = '';
  const proyectos = usuarioActual.portafolio || [];

  if (!proyectos.length) {
    contenedor.innerHTML = '<div class="th-vacio col-span-full"><img src="assets/img/mascota-talenthub.png" class="w-20 mx-auto mb-3" alt=""><p class="text-graytext text-sm">Todavía no agregaste proyectos. Publica el primero y gana +150 XP.</p></div>';
    return;
  }

  const coloresFondo = ['bg-purple/15', 'bg-gold/25', 'bg-navy/10'];
  proyectos.forEach(function (proyecto, indice) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'perfil-proyecto relative';
    const imagenInterior = proyecto.imagen
      ? '<img src="' + proyecto.imagen + '" alt="Portada del proyecto ' + proyecto.titulo + '" class="w-full h-full object-cover">'
      : '<svg width="30" height="30" class="text-navy/40"><use href="assets/icons/sprite.svg#icon-palette"></use></svg>';
    tarjeta.innerHTML =
      '<div class="perfil-proyecto__imagen' + (proyecto.imagen ? '' : ' ' + coloresFondo[indice % coloresFondo.length]) + '">' + imagenInterior +
      '  <button type="button" class="btn-editar-proyecto absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-navy hover:bg-white transition-colors duration-300" data-id="' + proyecto.id + '" aria-label="Editar proyecto"><svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-edit"></use></svg></button>' +
      '</div>' +
      '<div class="p-4">' +
      '  <span class="th-etiqueta th-etiqueta--purple">' + proyecto.categoria + '</span>' +
      '  <h3 class="font-display font-semibold text-sm mt-2.5">' + proyecto.titulo + '</h3>' +
      '  <p class="text-graytext text-xs mt-1.5 leading-relaxed">' + (proyecto.descripcion || '') + '</p>' +
      '  <div class="flex items-center justify-between mt-3 text-[11px] text-graytext/80">' +
      '    <span>' + (proyecto.herramientas || '') + '</span>' +
      '    <span>' + (proyecto.fecha || '') + '</span>' +
      '  </div>' +
      (proyecto.enlace ? '<a href="' + proyecto.enlace + '" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-purple text-xs font-semibold mt-3">Ver demostración <svg width="12" height="12"><use href="assets/icons/sprite.svg#icon-external-link"></use></svg></a>' : '') +
      '</div>';
    contenedor.appendChild(tarjeta);
  });

  contenedor.querySelectorAll('.btn-editar-proyecto').forEach(function (boton) {
    boton.addEventListener('click', function () { abrirModalProyecto(boton.getAttribute('data-id')); });
  });
}

/* ---------------------------------------------------------
   SOBRE MI
   --------------------------------------------------------- */
function pintarSobreMi() {
  const u = usuarioActual;
  document.getElementById('perfil-bio').textContent = u.bio && u.bio.trim() ? u.bio : 'Todavía no escribiste tu biografía. Edita tu perfil para contarle al mundo quién eres.';
  const lista = document.getElementById('perfil-talentos-lista');
  lista.innerHTML = '';
  (u.talentos || []).forEach(function (t) {
    const span = document.createElement('span');
    span.className = 'th-etiqueta th-etiqueta--navy';
    span.textContent = t;
    lista.appendChild(span);
  });
  if (!(u.talentos || []).length) {
    lista.innerHTML = '<p class="text-graytext text-sm">Aún no agregaste talentos.</p>';
  }
}

/* ---------------------------------------------------------
   PERSONALIZACION
   --------------------------------------------------------- */
function pintarPersonalizacion() {
  const u = usuarioActual;
  document.getElementById('perfil-puntos-etiqueta').textContent = (u.puntos || 0) + ' pts';

  const contenedorMarcos = document.getElementById('perfil-marcos');
  contenedorMarcos.innerHTML = '';
  const progreso = TH.calcularProgresoNivel(u.xp);
  const marcoActual = u.marcoAvatar || 'clasico';

  MARCOS_AVATAR.forEach(function (marco) {
    let desbloqueado = true;
    if (marco.requisito === 'nivel3') desbloqueado = progreso.nivel >= 3;
    if (marco.requisito === 'puntos150') desbloqueado = (u.puntos || 0) >= 150;
    if (marco.requisito === 'premium') desbloqueado = !!u.premium;

    const div = document.createElement('div');
    div.className = 'perfil-marco' + (marco.id === marcoActual ? ' seleccionado' : '') + (!desbloqueado ? ' bloqueado' : '');
    div.title = marco.nombre + (desbloqueado ? '' : ' (bloqueado)');
    div.innerHTML = '<span class="w-6 h-6 rounded-full" style="background:' + marco.color + '"></span>' +
      (!desbloqueado ? '<svg width="12" height="12" class="perfil-marco__candado"><use href="assets/icons/sprite.svg#icon-lock"></use></svg>' : '');

    if (desbloqueado) {
      div.addEventListener('click', function () {
        TH.actualizarUsuario(u.id, { marcoAvatar: marco.id });
        refrescarUsuario();
        pintarPersonalizacion();
        THUI.mostrarToast('Marco "' + marco.nombre + '" aplicado a tu avatar.', 'exito');
      });
    }
    contenedorMarcos.appendChild(div);
  });

  document.getElementById('perfil-plan-texto').textContent = u.premium
    ? 'Tienes el Plan Plus activo: sin anuncios, mayor posicionamiento y personalización avanzada.'
    : 'Estás en el Plan Estándar. Mejora a Plan Plus por S/ 20.00 al mes para desbloquear más beneficios.';

  const botonPlan = document.getElementById('btn-mejorar-plan');
  botonPlan.textContent = u.premium ? 'Ya tienes el Plan Plus' : 'Mejorar a Plan Plus';
  botonPlan.disabled = !!u.premium;
  botonPlan.classList.toggle('opacity-50', !!u.premium);

  const listaInsignias = document.getElementById('perfil-insignias-lista');
  listaInsignias.innerHTML = '';
  (u.insignias || []).forEach(function (insignia) {
    const span = document.createElement('span');
    span.className = 'th-etiqueta th-etiqueta--gold';
    span.textContent = insignia;
    listaInsignias.appendChild(span);
  });
}

function inicializarAccionesRapidas() {
  document.getElementById('btn-ver-anuncio').addEventListener('click', function (evento) {
    const boton = evento.currentTarget;
    boton.disabled = true;
    boton.textContent = 'Reproduciendo anuncio de prueba…';
    setTimeout(function () {
      TH.actualizarUsuario(usuarioActual.id, { puntos: (usuarioActual.puntos || 0) + 20 });
      refrescarUsuario();
      pintarPersonalizacion();
      boton.disabled = false;
      boton.textContent = 'Ver anuncio para ganar 20 puntos';
      THUI.mostrarToast('Ganaste 20 puntos por ver el anuncio.', 'exito');
    }, 1400);
  });

  document.getElementById('btn-mejorar-plan').addEventListener('click', function () {
    if (usuarioActual.premium) return;
    window.location.href = 'planes.html';
  });

  document.getElementById('btn-compartir-perfil').addEventListener('click', function () {
    const url = window.location.origin + window.location.pathname.replace('perfil.html', '') + 'perfil.html?usuario=' + usuarioActual.usuario;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        THUI.mostrarToast('Enlace de tu perfil copiado (demostración).', 'exito');
      }).catch(function () {
        THUI.mostrarToast('No se pudo copiar el enlace en este navegador.', 'error');
      });
    } else {
      THUI.mostrarToast('Enlace de tu perfil: ' + url, 'info');
    }
  });
}

/* ---------------------------------------------------------
   VALORACIONES
   --------------------------------------------------------- */
function pintarValoraciones() {
  const contenedor = document.getElementById('perfil-valoraciones-lista');
  if (!(usuarioActual.encargosCompletados > 0)) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">Todavía no tienes valoraciones. Completa tu primer encargo para recibir una.</p></div>';
    return;
  }
  contenedor.innerHTML = '';
  VALORACIONES_EJEMPLO.forEach(function (v) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'th-tarjeta p-5 flex gap-4';
    let estrellas = '';
    for (let i = 0; i < 5; i++) estrellas += '<svg width="13" height="13" class="' + (i < v.estrellas ? 'text-gold' : 'text-navy/15') + '"><use href="assets/icons/sprite.svg#icon-star"></use></svg>';
    tarjeta.innerHTML =
      '<img src="' + TH.urlAvatar(v.avatarSeed) + '" class="w-11 h-11 rounded-full shrink-0" alt="">' +
      '<div>' +
      '  <div class="flex items-center gap-2 flex-wrap"><p class="font-display font-semibold text-sm">' + v.autor + '</p><div class="flex gap-0.5">' + estrellas + '</div></div>' +
      '  <p class="text-graytext text-sm mt-1.5 leading-relaxed">' + v.texto + '</p>' +
      '  <p class="text-graytext/70 text-xs mt-2">' + TH.formatearFechaRelativa(v.fecha) + '</p>' +
      '</div>';
    contenedor.appendChild(tarjeta);
  });
}

/* ---------------------------------------------------------
   MODAL: EDITAR PERFIL
   --------------------------------------------------------- */
function inicializarModalEditarPerfil() {
  document.getElementById('btn-editar-perfil').addEventListener('click', function () {
    const u = usuarioActual;
    document.getElementById('ep-nombre').value = u.nombre || '';
    document.getElementById('ep-ciudad').value = u.ciudad || '';
    document.getElementById('ep-bio').value = u.bio || '';
    document.getElementById('ep-talentos').value = (u.talentos || []).join(', ');
    document.getElementById('ep-disponibilidad').value = u.disponibilidad || 'Disponible';
    document.getElementById('ep-mostrar-edad').checked = !!u.mostrarEdad;
    document.getElementById('contenedor-mostrar-edad').classList.toggle('oculto', !u.edad);
    THUI.abrirModal('modal-editar-perfil');
  });

  document.getElementById('form-editar-perfil').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const bioAnteriorVacia = !usuarioActual.bio || !usuarioActual.bio.trim();
    const nuevaBio = document.getElementById('ep-bio').value.trim();

    TH.actualizarUsuario(usuarioActual.id, {
      nombre: document.getElementById('ep-nombre').value.trim() || usuarioActual.nombre,
      ciudad: document.getElementById('ep-ciudad').value.trim(),
      bio: nuevaBio,
      talentos: document.getElementById('ep-talentos').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
      disponibilidad: document.getElementById('ep-disponibilidad').value,
      mostrarEdad: document.getElementById('ep-mostrar-edad').checked
    });

    refrescarUsuario();
    THUI.cerrarModal('modal-editar-perfil');
    THUI.mostrarToast('Perfil actualizado correctamente.', 'exito');

    if (bioAnteriorVacia && nuevaBio) {
      const resultado = TH.otorgarXP(usuarioActual.id, TH.XP_ACCIONES.PERFIL_COMPLETO, 'completar tu biografía');
      refrescarUsuario();
      THUI.mostrarToast('+' + TH.XP_ACCIONES.PERFIL_COMPLETO + ' XP por completar tu perfil.', 'exito');
      if (resultado && resultado.subioNivel) {
        setTimeout(function () { THUI.mostrarToast('¡Subiste al Nivel ' + resultado.nivelNuevo + '!', 'exito'); }, 900);
      }
    }

    pintarCabecera();
    pintarSobreMi();
    pintarPersonalizacion();
  });
}

/* ---------------------------------------------------------
   MODAL: AGREGAR / EDITAR PROYECTO
   --------------------------------------------------------- */
function abrirModalProyecto(idProyecto) {
  const form = document.getElementById('form-agregar-proyecto');
  form.reset();
  document.getElementById('ap-titulo').closest('.th-campo').classList.remove('th-campo--error');
  document.getElementById('ap-fecha').closest('.th-campo').classList.remove('th-campo--error');

  const hoy = new Date().toISOString().slice(0, 10);
  document.getElementById('ap-fecha').setAttribute('max', hoy);

  const proyecto = idProyecto ? (usuarioActual.portafolio || []).find(function (p) { return p.id === idProyecto; }) : null;

  document.getElementById('ap-id-edicion').value = proyecto ? proyecto.id : '';
  document.getElementById('titulo-modal-proyecto').textContent = proyecto ? 'Editar proyecto' : 'Agregar proyecto al portafolio';
  document.getElementById('btn-guardar-proyecto').textContent = proyecto ? 'Guardar cambios' : 'Publicar proyecto';
  document.getElementById('btn-eliminar-proyecto').classList.toggle('oculto', !proyecto);

  if (proyecto) {
    document.getElementById('ap-titulo').value = proyecto.titulo || '';
    document.getElementById('ap-categoria').value = proyecto.categoria || 'Diseño';
    document.getElementById('ap-herramientas').value = proyecto.herramientas || '';
    document.getElementById('ap-descripcion').value = proyecto.descripcion || '';
    document.getElementById('ap-fecha').value = proyecto.fecha || '';
    document.getElementById('ap-enlace').value = proyecto.enlace || '';
  }

  THUI.abrirModal('modal-agregar-proyecto');
}

function inicializarModalAgregarProyecto() {
  document.getElementById('btn-agregar-proyecto').addEventListener('click', function () { abrirModalProyecto(null); });

  document.getElementById('btn-eliminar-proyecto').addEventListener('click', function () {
    const id = document.getElementById('ap-id-edicion').value;
    if (!id) return;
    const portafolioActualizado = (usuarioActual.portafolio || []).filter(function (p) { return p.id !== id; });
    TH.actualizarUsuario(usuarioActual.id, { portafolio: portafolioActualizado });
    refrescarUsuario();
    THUI.cerrarModal('modal-agregar-proyecto');
    THUI.mostrarToast('Proyecto eliminado de tu portafolio.', 'info');
    pintarPortafolio();
  });

  document.getElementById('form-agregar-proyecto').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const tituloCampo = document.getElementById('ap-titulo');
    const fechaCampo = document.getElementById('ap-fecha');
    const titulo = tituloCampo.value.trim();
    const fecha = fechaCampo.value;
    const hoy = new Date().toISOString().slice(0, 10);

    const tituloValido = titulo.length > 0;
    tituloCampo.closest('.th-campo').classList.toggle('th-campo--error', !tituloValido);

    const fechaValida = !fecha || (fecha <= hoy);
    fechaCampo.closest('.th-campo').classList.toggle('th-campo--error', !fechaValida);

    if (!tituloValido || !fechaValida) return;

    const idEdicion = document.getElementById('ap-id-edicion').value;
    const datosProyecto = {
      titulo: titulo,
      categoria: document.getElementById('ap-categoria').value,
      herramientas: document.getElementById('ap-herramientas').value.trim(),
      descripcion: document.getElementById('ap-descripcion').value.trim(),
      fecha: fecha || hoy,
      enlace: document.getElementById('ap-enlace').value.trim()
    };

    const portafolioActual = usuarioActual.portafolio || [];
    const eraElPrimero = !portafolioActual.length;
    let portafolioActualizado;

    if (idEdicion) {
      portafolioActualizado = portafolioActual.map(function (p) { return p.id === idEdicion ? Object.assign({}, p, datosProyecto) : p; });
    } else {
      portafolioActualizado = portafolioActual.concat([Object.assign({ id: TH.generarId('proy') }, datosProyecto)]);
    }

    TH.actualizarUsuario(usuarioActual.id, { portafolio: portafolioActualizado });
    refrescarUsuario();

    THUI.cerrarModal('modal-agregar-proyecto');
    THUI.mostrarToast(idEdicion ? 'Proyecto actualizado.' : 'Proyecto publicado en tu portafolio.', 'exito');
    pintarPortafolio();

    if (!idEdicion && eraElPrimero) {
      const resultado = TH.otorgarXP(usuarioActual.id, TH.XP_ACCIONES.PRIMER_PROYECTO, 'publicar tu primer proyecto');
      refrescarUsuario();
      THUI.mostrarToast('+' + TH.XP_ACCIONES.PRIMER_PROYECTO + ' XP por tu primer proyecto.', 'exito');
      if (resultado && resultado.subioNivel) {
        setTimeout(function () { THUI.mostrarToast('¡Subiste al Nivel ' + resultado.nivelNuevo + '!', 'exito'); }, 900);
      }
      pintarCabecera();
    }
  });
}

/* ---------------------------------------------------------
   SERVICIOS Y PRECIOS REFERENCIALES
   --------------------------------------------------------- */
function pintarServicios() {
  const contenedor = document.getElementById('perfil-servicios-grid');
  const servicios = usuarioActual.servicios || [];
  contenedor.innerHTML = '';

  if (!servicios.length) {
    contenedor.innerHTML = '<div class="th-vacio col-span-full"><p class="text-graytext text-sm">Todavía no agregaste servicios. Publica tus precios referenciales para que los negocios sepan qué esperar.</p></div>';
    return;
  }

  servicios.forEach(function (servicio) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'th-tarjeta p-5 relative';
    tarjeta.innerHTML =
      '<button type="button" class="btn-editar-servicio absolute top-4 right-4 w-8 h-8 rounded-full bg-grayxl flex items-center justify-center text-navy hover:bg-[#ECEAFF] transition-colors duration-300" data-id="' + servicio.id + '" aria-label="Editar servicio"><svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-edit"></use></svg></button>' +
      '<h3 class="font-display font-semibold text-sm pr-8">' + servicio.nombre + '</h3>' +
      '<p class="text-graytext text-xs mt-2 leading-relaxed">' + (servicio.descripcion || '') + '</p>' +
      '<p class="font-display font-bold text-navy text-lg mt-4">S/ ' + servicio.precioMin + ' - ' + servicio.precioMax + '</p>' +
      '<p class="text-graytext text-xs mt-1">Precio referencial</p>' +
      '<div class="flex items-center gap-4 mt-4 pt-4 border-t border-[#EEF0F7] text-xs text-graytext">' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-clock"></use></svg>' + (servicio.tiempoEstimado || 'A coordinar') + '</span>' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-check-circle"></use></svg>' + (servicio.disponibilidad || 'Disponible ahora') + '</span>' +
      '</div>';
    contenedor.appendChild(tarjeta);
  });

  contenedor.querySelectorAll('.btn-editar-servicio').forEach(function (boton) {
    boton.addEventListener('click', function () { abrirModalServicio(boton.getAttribute('data-id')); });
  });
}

function abrirModalServicio(idServicio) {
  const form = document.getElementById('form-servicio');
  form.reset();
  document.getElementById('error-precio-servicio').style.display = 'none';

  const servicio = idServicio ? (usuarioActual.servicios || []).find(function (s) { return s.id === idServicio; }) : null;

  document.getElementById('sv-id-edicion').value = servicio ? servicio.id : '';
  document.getElementById('titulo-modal-servicio').textContent = servicio ? 'Editar servicio' : 'Agregar servicio';
  document.getElementById('btn-eliminar-servicio').classList.toggle('oculto', !servicio);

  if (servicio) {
    document.getElementById('sv-nombre').value = servicio.nombre || '';
    document.getElementById('sv-descripcion').value = servicio.descripcion || '';
    document.getElementById('sv-precio-min').value = servicio.precioMin;
    document.getElementById('sv-precio-max').value = servicio.precioMax;
    document.getElementById('sv-tiempo').value = servicio.tiempoEstimado || '';
    document.getElementById('sv-disponibilidad').value = servicio.disponibilidad || 'Disponible ahora';
  }

  THUI.abrirModal('modal-servicio');
}

function inicializarModalServicio() {
  document.getElementById('btn-agregar-servicio').addEventListener('click', function () { abrirModalServicio(null); });

  document.getElementById('btn-eliminar-servicio').addEventListener('click', function () {
    const id = document.getElementById('sv-id-edicion').value;
    if (!id) return;
    TH.actualizarUsuario(usuarioActual.id, { servicios: (usuarioActual.servicios || []).filter(function (s) { return s.id !== id; }) });
    refrescarUsuario();
    THUI.cerrarModal('modal-servicio');
    THUI.mostrarToast('Servicio eliminado.', 'info');
    pintarServicios();
  });

  document.getElementById('form-servicio').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('sv-nombre').value.trim();
    const precioMin = parseFloat(document.getElementById('sv-precio-min').value);
    const precioMax = parseFloat(document.getElementById('sv-precio-max').value);
    const errorPrecio = document.getElementById('error-precio-servicio');

    if (!nombre || isNaN(precioMin) || isNaN(precioMax)) return;

    if (precioMax < precioMin) {
      errorPrecio.style.display = 'block';
      return;
    }
    errorPrecio.style.display = 'none';

    const idEdicion = document.getElementById('sv-id-edicion').value;
    const datosServicio = {
      nombre: nombre,
      descripcion: document.getElementById('sv-descripcion').value.trim(),
      precioMin: precioMin,
      precioMax: precioMax,
      tiempoEstimado: document.getElementById('sv-tiempo').value.trim(),
      disponibilidad: document.getElementById('sv-disponibilidad').value
    };

    const serviciosActuales = usuarioActual.servicios || [];
    let serviciosActualizados;
    if (idEdicion) {
      serviciosActualizados = serviciosActuales.map(function (s) { return s.id === idEdicion ? Object.assign({}, s, datosServicio) : s; });
    } else {
      serviciosActualizados = serviciosActuales.concat([Object.assign({ id: TH.generarId('serv') }, datosServicio)]);
    }

    TH.actualizarUsuario(usuarioActual.id, { servicios: serviciosActualizados });
    refrescarUsuario();

    THUI.cerrarModal('modal-servicio');
    THUI.mostrarToast(idEdicion ? 'Servicio actualizado.' : 'Servicio agregado a tu perfil.', 'exito');
    pintarServicios();
  });
}

/* ---------------------------------------------------------
   MODAL: SEGUIDORES / SIGUIENDO
   --------------------------------------------------------- */
let listaSeguidoresActiva = 'seguidores';

function inicializarModalSeguidores() {
  document.getElementById('btn-ver-seguidores').addEventListener('click', function () {
    abrirModalSeguidores('seguidores');
  });
  document.getElementById('btn-ver-siguiendo').addEventListener('click', function () {
    abrirModalSeguidores('siguiendo');
  });

  document.getElementById('tab-seguidores').addEventListener('click', function () { cambiarListaSeguidores('seguidores'); });
  document.getElementById('tab-siguiendo').addEventListener('click', function () { cambiarListaSeguidores('siguiendo'); });
}

function abrirModalSeguidores(lista) {
  cambiarListaSeguidores(lista);
  THUI.abrirModal('modal-seguidores');
}

function cambiarListaSeguidores(lista) {
  listaSeguidoresActiva = lista;
  document.getElementById('tab-seguidores').classList.toggle('activo', lista === 'seguidores');
  document.getElementById('tab-siguiendo').classList.toggle('activo', lista === 'siguiendo');
  pintarListaSeguidores();
}

function pintarListaSeguidores() {
  const contenedor = document.getElementById('lista-seguidores-personas');
  const personas = listaSeguidoresActiva === 'seguidores'
    ? TH.obtenerSeguidores(usuarioActual.id)
    : (usuarioActual.siguiendo || []).map(function (id) { return TH.obtenerUsuarioPorId(id); }).filter(Boolean);

  contenedor.innerHTML = '';

  if (!personas.length) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">' +
      (listaSeguidoresActiva === 'seguidores' ? 'Todavía no tienes seguidores.' : 'Todavía no sigues a nadie. Explora talentos y sigue a quienes te inspiren.') +
      '</p></div>';
    return;
  }

  const misSeguidos = usuarioActual.siguiendo || [];
  const misSeguidores = TH.obtenerSeguidores(usuarioActual.id).map(function (u) { return u.id; });

  personas.forEach(function (persona) {
    const yoLoSigo = misSeguidos.includes(persona.id);
    const meSigue = misSeguidores.includes(persona.id);
    const sonAmigos = yoLoSigo && meSigue;

    const fila = document.createElement('div');
    fila.className = 'flex items-center justify-between gap-3 py-2.5 px-1';

    const enlacePersona = document.createElement('a');
    enlacePersona.href = 'perfil-publico.html?id=' + persona.id;
    enlacePersona.className = 'flex items-center gap-3 min-w-0 flex-1';
    enlacePersona.innerHTML =
      '<img src="' + TH.urlAvatar(persona.avatarSeed) + '" class="w-10 h-10 rounded-full shrink-0" alt="">' +
      '<div class="min-w-0"><p class="font-display font-semibold text-sm truncate">' + persona.nombre + '</p><p class="text-graytext text-xs truncate">' + (persona.ciudad || '') + '</p></div>';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'shrink-0 font-display text-xs font-semibold px-4 py-2 rounded-full transition-colors duration-300 ' +
      (sonAmigos ? 'bg-grayxl text-navy' : yoLoSigo ? 'bg-grayxl text-navy' : 'bg-purple text-white hover:bg-purple-dark');
    boton.textContent = sonAmigos ? 'Amigos' : yoLoSigo ? 'Siguiendo' : 'Seguir';
    boton.addEventListener('click', function (evento) {
      evento.preventDefault();
      const lista = usuarioActual.siguiendo || [];
      const yaSigue = lista.includes(persona.id);
      TH.actualizarUsuario(usuarioActual.id, {
        siguiendo: yaSigue ? lista.filter(function (id) { return id !== persona.id; }) : lista.concat([persona.id])
      });
      refrescarUsuario();
      pintarCabecera();
      pintarListaSeguidores();
    });

    fila.appendChild(enlacePersona);
    fila.appendChild(boton);
    contenedor.appendChild(fila);
  });
}
