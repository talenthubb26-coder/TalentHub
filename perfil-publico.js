/* =========================================================
   TALENTHUB - PERFIL-PUBLICO.JS
   Vista de perfil publico de otro talento: sin opciones de
   edicion, con acciones de Seguir y Contactar.
   ========================================================= */

const VALORACIONES_EJEMPLO_PP = [
  { autor: 'Café Central', avatarSeed: 'CafeCentral', texto: 'Excelente trabajo, entregó antes de lo acordado y con muy buena comunicación.', estrellas: 5, fecha: '2026-07-20' },
  { autor: 'Textiles del Sur', avatarSeed: 'TextilesSur', texto: 'Muy responsable y con mucho talento. Repetiríamos sin dudarlo.', estrellas: 5, fecha: '2026-06-02' }
];

let visitante = null;
let perfilVisitado = null;

document.addEventListener('DOMContentLoaded', function () {
  visitante = TH_SHELL.montar('explorador', 'Perfil de talento');
  if (!visitante) return;

  const id = new URLSearchParams(window.location.search).get('id');

  if (id === visitante.id) {
    window.location.href = 'perfil.html';
    return;
  }

  perfilVisitado = TH.obtenerUsuarioPorId(id);
  if (!perfilVisitado || perfilVisitado.tipo !== 'talento') {
    document.getElementById('pp-no-encontrado').classList.remove('oculto');
    return;
  }

  document.getElementById('pp-contenido').classList.remove('oculto');
  pintarCabecera();
  pintarPortafolio();
  pintarSobreMi();
  pintarServiciosPublicos();
  pintarValoraciones();
  inicializarTabs();
  inicializarAcciones();
  inicializarFlujoSolicitud();
});

function pintarCabecera() {
  const u = perfilVisitado;
  document.getElementById('pp-avatar').src = TH.urlAvatar(u.avatarSeed);
  document.getElementById('pp-avatar').alt = 'Avatar de ' + u.nombre;
  document.getElementById('pp-nombre').textContent = u.nombre;
  document.getElementById('pp-ubicacion').innerHTML = '<svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-map-pin"></use></svg> ' + (u.mostrarEdad && u.edad ? u.edad + ' años · ' : '') + (u.ciudad || 'Perú');

  const progreso = TH.calcularProgresoNivel(u.xp);
  const etiquetas = document.getElementById('pp-etiquetas');
  etiquetas.innerHTML = '';
  [['Nivel ' + progreso.nivel, 'purple'], [u.disponibilidad || 'Disponible', u.disponibilidad === 'Disponible' ? 'verde' : 'navy']].forEach(function (par) {
    const span = document.createElement('span');
    span.className = 'th-etiqueta th-etiqueta--' + par[1];
    span.textContent = par[0];
    etiquetas.appendChild(span);
  });
  if (u.premium) {
    const span = document.createElement('span');
    span.className = 'th-etiqueta th-etiqueta--gold';
    span.textContent = 'Insignia Premium';
    etiquetas.appendChild(span);
  }

  document.getElementById('pp-stat-encargos').textContent = u.encargosCompletados || 0;
  document.getElementById('pp-stat-valoracion').textContent = (u.valoracion || 0).toFixed(1);
  document.getElementById('pp-stat-nivel').textContent = progreso.nivel;
  document.getElementById('pp-stat-seguidores').textContent = TH.obtenerSeguidores(u.id).length;
}

function pintarPortafolio() {
  const contenedor = document.getElementById('pp-portafolio-grid');
  const proyectos = perfilVisitado.portafolio || [];
  contenedor.innerHTML = '';

  if (!proyectos.length) {
    contenedor.innerHTML = '<div class="th-vacio col-span-full"><p class="text-graytext text-sm">Este talento todavía no publicó proyectos en su portafolio.</p></div>';
    return;
  }

  const coloresFondo = ['bg-purple/15', 'bg-gold/25', 'bg-navy/10'];
  proyectos.forEach(function (proyecto, indice) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'perfil-proyecto';
    const imagenInterior = proyecto.imagen
      ? '<img src="' + proyecto.imagen + '" alt="Portada del proyecto ' + proyecto.titulo + '" class="w-full h-full object-cover">'
      : '<svg width="30" height="30" class="text-navy/40"><use href="assets/icons/sprite.svg#icon-palette"></use></svg>';
    tarjeta.innerHTML =
      '<div class="perfil-proyecto__imagen' + (proyecto.imagen ? '' : ' ' + coloresFondo[indice % coloresFondo.length]) + '">' + imagenInterior + '</div>' +
      '<div class="p-4">' +
      '  <span class="th-etiqueta th-etiqueta--purple">' + proyecto.categoria + '</span>' +
      '  <h3 class="font-display font-semibold text-sm mt-2.5">' + proyecto.titulo + '</h3>' +
      '  <p class="text-graytext text-xs mt-1.5 leading-relaxed">' + (proyecto.descripcion || '') + '</p>' +
      '</div>';
    contenedor.appendChild(tarjeta);
  });
}

function pintarSobreMi() {
  const u = perfilVisitado;
  document.getElementById('pp-bio').textContent = u.bio && u.bio.trim() ? u.bio : 'Este talento todavía no escribió su biografía.';

  const listaTalentos = document.getElementById('pp-talentos-lista');
  listaTalentos.innerHTML = (u.talentos || []).map(function (t) { return '<span class="th-etiqueta th-etiqueta--navy">' + t + '</span>'; }).join('') || '<p class="text-graytext text-sm">Sin talentos registrados.</p>';

  const listaInsignias = document.getElementById('pp-insignias-lista');
  listaInsignias.innerHTML = (u.insignias || []).map(function (i) { return '<span class="th-etiqueta th-etiqueta--gold">' + i + '</span>'; }).join('') || '<p class="text-graytext text-sm">Sin insignias todavía.</p>';
}

function pintarValoraciones() {
  const contenedor = document.getElementById('pp-valoraciones-lista');
  const reales = (perfilVisitado.valoracionesRecibidas || []).slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  const ejemplos = perfilVisitado.encargosCompletados > 0 ? VALORACIONES_EJEMPLO_PP : [];
  const todas = reales.concat(ejemplos);

  if (!todas.length) {
    contenedor.innerHTML = '<div class="th-vacio"><p class="text-graytext text-sm">Todavía no tiene valoraciones.</p></div>';
    return;
  }
  contenedor.innerHTML = '';
  todas.forEach(function (v) {
    let estrellas = '';
    for (let i = 0; i < 5; i++) estrellas += '<svg width="13" height="13" class="' + (i < v.estrellas ? 'text-gold' : 'text-navy/15') + '"><use href="assets/icons/sprite.svg#icon-star"></use></svg>';
    const tarjeta = document.createElement('div');
    tarjeta.className = 'th-tarjeta p-5 flex gap-4';
    tarjeta.innerHTML =
      '<img src="' + TH.urlAvatar(v.avatarSeed || v.autor) + '" class="w-11 h-11 rounded-full shrink-0" alt="">' +
      '<div><div class="flex items-center gap-2 flex-wrap"><p class="font-display font-semibold text-sm">' + v.autor + '</p><div class="flex gap-0.5">' + estrellas + '</div></div>' +
      '<p class="text-graytext text-sm mt-1.5 leading-relaxed">' + (v.texto || v.comentario || '') + '</p></div>';
    contenedor.appendChild(tarjeta);
  });
}

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

function estaSiguiendo() {
  return (visitante.siguiendo || []).includes(perfilVisitado.id);
}

function actualizarBotonSeguir() {
  const boton = document.getElementById('btn-seguir');
  const siguiendo = estaSiguiendo();
  boton.className = 'inline-flex items-center gap-2 font-display text-xs font-semibold px-4 py-2.5 rounded-full transition-colors duration-300 ' + (siguiendo ? 'bg-grayxl text-navy' : 'border-2 border-navy/15 text-navy hover:border-navy/35');
  boton.innerHTML = siguiendo
    ? '<svg width="15" height="15"><use href="assets/icons/sprite.svg#icon-check"></use></svg> Siguiendo'
    : '<svg width="15" height="15"><use href="assets/icons/sprite.svg#icon-plus"></use></svg> Seguir';
}

function inicializarAcciones() {
  actualizarBotonSeguir();

  const esNegocioVisitante = visitante.tipo === 'negocio';
  if (esNegocioVisitante) {
    document.getElementById('btn-valorar').classList.remove('oculto');
  }

  document.getElementById('btn-seguir').addEventListener('click', function () {
    const lista = visitante.siguiendo || [];
    const siguiendo = estaSiguiendo();
    TH.actualizarUsuario(visitante.id, { siguiendo: siguiendo ? lista.filter(function (x) { return x !== perfilVisitado.id; }) : lista.concat([perfilVisitado.id]) });
    visitante = TH.obtenerUsuarioPorId(visitante.id);
    actualizarBotonSeguir();
    if (!siguiendo) THUI.mostrarToast('Ahora sigues a ' + perfilVisitado.nombre.split(' ')[0] + '.', 'exito');
  });

  document.getElementById('btn-contactar').addEventListener('click', function () {
    document.getElementById('form-contactar-pp').reset();
    const select = document.getElementById('pp-proyecto-contacto');
    select.innerHTML = '<option value="">No referenciar ningún proyecto</option>';
    (perfilVisitado.portafolio || []).forEach(function (p) {
      const opcion = document.createElement('option');
      opcion.value = p.id;
      opcion.textContent = p.titulo;
      select.appendChild(opcion);
    });
    THUI.abrirModal('modal-contactar-pp');
  });

  document.getElementById('form-contactar-pp').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const mensaje = document.getElementById('pp-mensaje-contacto').value.trim();
    const idProyecto = document.getElementById('pp-proyecto-contacto').value;
    const proyecto = idProyecto ? (perfilVisitado.portafolio || []).find(function (p) { return p.id === idProyecto; }) : null;

    const conversacion = TH.obtenerOCrearConversacion(visitante.id, perfilVisitado.id, null);
    let texto = mensaje || 'Hola, me interesa tu trabajo.';
    if (proyecto) texto += ' (Sobre tu proyecto: "' + proyecto.titulo + '")';
    TH.agregarMensaje(conversacion.id, visitante.id, texto);

    THUI.cerrarModal('modal-contactar-pp');
    THUI.mostrarToast('Mensaje enviado a ' + perfilVisitado.nombre.split(' ')[0] + '.', 'exito');
    setTimeout(function () { window.location.href = 'mensajes.html?id=' + conversacion.id; }, 500);
  });

  if (esNegocioVisitante) {
    inicializarModalValorar();
  }
}

function inicializarModalValorar() {
  const contenedorEstrellas = document.getElementById('estrellas-valorar');
  const campoEstrellas = document.getElementById('valorar-estrellas');

  function pintarEstrellasSeleccion(cantidad) {
    contenedorEstrellas.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.innerHTML = '<svg width="24" height="24"><use href="assets/icons/sprite.svg#icon-star"></use></svg>';
      boton.className = i <= cantidad ? 'text-gold' : 'text-navy/15';
      boton.addEventListener('click', function () {
        campoEstrellas.value = i;
        pintarEstrellasSeleccion(i);
      });
      contenedorEstrellas.appendChild(boton);
    }
  }

  document.getElementById('btn-valorar').addEventListener('click', function () {
    document.getElementById('form-valorar').reset();
    campoEstrellas.value = 5;
    pintarEstrellasSeleccion(5);
    THUI.abrirModal('modal-valorar');
  });

  document.getElementById('form-valorar').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const estrellas = parseInt(campoEstrellas.value, 10) || 5;
    const comentario = document.getElementById('valorar-comentario').value.trim();

    TH.agregarValoracion(perfilVisitado.id, {
      autor: visitante.nombreEmpresa || visitante.nombre,
      avatarSeed: visitante.avatarSeed,
      estrellas: estrellas,
      texto: comentario || 'Sin comentarios adicionales.'
    });
    TH.crearNotificacion(perfilVisitado.id, (visitante.nombreEmpresa || visitante.nombre) + ' te dejó una valoración de ' + estrellas + ' estrellas.', 'perfil');

    perfilVisitado = TH.obtenerUsuarioPorId(perfilVisitado.id);
    THUI.cerrarModal('modal-valorar');
    THUI.mostrarToast('Valoración publicada.', 'exito');
    pintarCabecera();
    pintarValoraciones();
  });
}

/* ---------------------------------------------------------
   SERVICIOS PUBLICOS Y BOTON "SOLICITAR ENCARGO"
   --------------------------------------------------------- */
function pintarServiciosPublicos() {
  const contenedor = document.getElementById('pp-servicios-grid');
  const servicios = perfilVisitado.servicios || [];
  contenedor.innerHTML = '';

  if (!servicios.length) {
    contenedor.innerHTML = '<div class="th-vacio col-span-full"><p class="text-graytext text-sm">Este talento todavía no publicó servicios con precios referenciales.</p></div>';
    return;
  }

  servicios.forEach(function (servicio) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'th-tarjeta p-5';
    tarjeta.innerHTML =
      '<h3 class="font-display font-semibold text-sm">' + servicio.nombre + '</h3>' +
      '<p class="text-graytext text-xs mt-2 leading-relaxed">' + (servicio.descripcion || '') + '</p>' +
      '<p class="font-display font-bold text-navy text-lg mt-4">S/ ' + servicio.precioMin + ' - ' + servicio.precioMax + '</p>' +
      '<p class="text-graytext text-xs mt-1">Precio referencial · el precio final puede variar según tus requisitos</p>' +
      '<div class="flex items-center gap-4 mt-4 pt-4 border-t border-[#EEF0F7] text-xs text-graytext">' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-clock"></use></svg>' + (servicio.tiempoEstimado || 'A coordinar') + '</span>' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-check-circle"></use></svg>' + (servicio.disponibilidad || 'Disponible ahora') + '</span>' +
      '</div>' +
      '<button type="button" class="btn-solicitar-encargo w-full mt-4 bg-purple text-white font-display text-xs font-semibold py-2.5 rounded-full hover:bg-purple-dark transition-colors duration-300" data-id="' + servicio.id + '">Solicitar encargo</button>';
    contenedor.appendChild(tarjeta);
  });

  contenedor.querySelectorAll('.btn-solicitar-encargo').forEach(function (boton) {
    boton.addEventListener('click', function () { abrirFlujoSolicitud(boton.getAttribute('data-id')); });
  });
}

/* ---------------------------------------------------------
   FLUJO: SOLICITAR ENCARGO -> DETALLAR -> PRECIO -> DEPOSITO -> CONFIRMACION
   --------------------------------------------------------- */
let servicioSolicitado = null;

function mostrarPasoSolicitud(numero) {
  document.querySelectorAll('.solicitar-paso').forEach(function (paso) {
    paso.classList.toggle('oculto', paso.getAttribute('data-paso') !== String(numero));
  });
  const titulos = { 1: 'Detallar solicitud', 2: 'Acordar precio', 3: 'Realizar depósito', 4: 'Confirmación' };
  document.getElementById('solicitar-paso-indicador').textContent = 'Paso ' + numero + ' de 4 · ' + titulos[numero];
}

function abrirFlujoSolicitud(idServicio) {
  servicioSolicitado = (perfilVisitado.servicios || []).find(function (s) { return s.id === idServicio; });
  if (!servicioSolicitado) return;

  document.getElementById('solicitar-servicio-nombre').textContent = servicioSolicitado.nombre;
  document.getElementById('solicitar-servicio-precio').textContent = 'Precio referencial: S/ ' + servicioSolicitado.precioMin + ' - S/ ' + servicioSolicitado.precioMax;
  document.getElementById('solicitar-aviso-menor').classList.toggle('oculto', !visitante.esMenor);

  document.getElementById('sol-necesidad').value = '';
  document.getElementById('sol-descripcion').value = '';
  document.getElementById('sol-fecha').value = '';
  document.getElementById('sol-fecha').setAttribute('min', new Date().toISOString().slice(0, 10));
  document.getElementById('error-solicitar-paso1').style.display = 'none';

  mostrarPasoSolicitud(1);
  THUI.abrirModal('modal-solicitar');
}

function inicializarFlujoSolicitud() {
  document.getElementById('btn-ir-paso-2').addEventListener('click', function () {
    const necesidad = document.getElementById('sol-necesidad').value.trim();
    const errorEl = document.getElementById('error-solicitar-paso1');
    if (!necesidad) {
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';

    const precioSugerido = Math.round((servicioSolicitado.precioMin + servicioSolicitado.precioMax) / 2);
    const campoPrecio = document.getElementById('sol-precio-acordado');
    campoPrecio.value = precioSugerido;
    campoPrecio.setAttribute('min', servicioSolicitado.precioMin);
    document.getElementById('sol-precio-rango').textContent = 'Rango referencial: S/ ' + servicioSolicitado.precioMin + ' - S/ ' + servicioSolicitado.precioMax + '. Puedes ajustarlo si ambos están de acuerdo.';

    mostrarPasoSolicitud(2);
  });

  document.getElementById('btn-ir-paso-3').addEventListener('click', function () {
    const precioAcordado = parseFloat(document.getElementById('sol-precio-acordado').value) || servicioSolicitado.precioMin;
    const metodos = visitante.metodosPago || [];
    const selectMetodo = document.getElementById('sol-metodo-pago');

    document.getElementById('sol-sin-metodo').classList.toggle('oculto', metodos.length > 0);
    document.getElementById('sol-con-metodo').classList.toggle('oculto', metodos.length === 0);

    if (metodos.length) {
      selectMetodo.innerHTML = metodos.map(function (m) { return '<option value="' + m.id + '">' + m.marca + ' •••• ' + m.ultimos4 + '</option>'; }).join('');
      document.getElementById('sol-monto-texto').textContent = 'S/ ' + precioAcordado.toFixed(2);
    }

    mostrarPasoSolicitud(3);
  });

  document.querySelectorAll('.btn-volver-paso').forEach(function (boton) {
    boton.addEventListener('click', function () { mostrarPasoSolicitud(boton.getAttribute('data-volver')); });
  });

  document.getElementById('btn-confirmar-deposito').addEventListener('click', function () {
    const precioAcordado = parseFloat(document.getElementById('sol-precio-acordado').value) || servicioSolicitado.precioMin;
    const necesidad = document.getElementById('sol-necesidad').value.trim();

    const conversacion = TH.obtenerOCrearConversacion(visitante.id, perfilVisitado.id, null);
    TH.agregarMensaje(conversacion.id, visitante.id, 'Hola, me gustaría solicitar tu servicio "' + servicioSolicitado.nombre + '". ' + necesidad);
    TH.registrarDepositoConversacion(conversacion.id, precioAcordado);
    TH.agregarMensaje(conversacion.id, visitante.id, 'Realicé el depósito de S/ ' + precioAcordado.toFixed(2) + '. El pago queda protegido en TalentHub hasta confirmar la entrega.');

    TH.crearNotificacion(visitante.id, 'Depósito registrado: tu solicitud de "' + servicioSolicitado.nombre + '" con ' + perfilVisitado.nombre.split(' ')[0] + ' fue enviada.', 'encargo');
    TH.crearNotificacion(perfilVisitado.id, visitante.nombre + ' te envió una solicitud de encargo: "' + servicioSolicitado.nombre + '".', 'encargo');

    mostrarPasoSolicitud(4);
  });
}
