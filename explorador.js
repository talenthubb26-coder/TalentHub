/* =========================================================
   TALENTHUB - EXPLORADOR.JS
   Explorador de talentos: busqueda, filtro por categoria con
   identidad visual propia y tarjetas de perfil.
   ========================================================= */

const CATEGORIAS_EXPLORADOR = [
  {
    id: 'todos', nombre: 'Todas', clase: 'todos', franja: '',
    chip: 'Explorador', titulo: 'Explora nuevos talentos',
    subtitulo: 'Descubre jóvenes con habilidades, proyectos e ideas que pueden inspirarte o ayudarte.',
    icono: 'icon-search'
  },
  {
    id: 'Diseño y Arte Digital', nombre: 'Diseño y Arte Digital', clase: 'diseno', franja: 'diseno',
    chip: 'Diseño y Arte Digital', titulo: 'Creativos que le dan forma a las ideas',
    subtitulo: 'Ilustradores, diseñadores y artistas digitales listos para tu próximo proyecto visual.',
    icono: 'icon-palette'
  },
  {
    id: 'Tutorías y Clases', nombre: 'Tutorías y Clases', clase: 'tutorias', franja: 'tutorias',
    chip: 'Tutorías y Clases', titulo: 'Aprende de quienes ya lo dominan',
    subtitulo: 'Jóvenes que enseñan lo que saben, de forma cercana y a tu ritmo.',
    icono: 'icon-book-open'
  },
  {
    id: 'Música y Producción', nombre: 'Música y Producción', clase: 'musica', franja: 'musica',
    chip: 'Música y Producción', titulo: 'El talento sonoro del Perú',
    subtitulo: 'Productores, músicos y editores de audio para darle voz a tu proyecto.',
    icono: 'icon-users'
  },
  {
    id: 'Tecnología y Código', nombre: 'Tecnología y Código', clase: 'tecnologia', franja: 'tecnologia',
    chip: 'Tecnología y Código', titulo: 'Talento técnico para construir',
    subtitulo: 'Jóvenes programadores y soporte técnico listos para resolver lo que necesitas.',
    icono: 'icon-search'
  }
];

let usuarioExplorador = null;
let categoriaActivaExplorador = 'todos';

document.addEventListener('DOMContentLoaded', function () {
  usuarioExplorador = TH_SHELL.montar('explorador', 'Explorador de talentos');
  if (!usuarioExplorador) return;

  pintarFiltrosCategoria();
  aplicarTemaCategoria('todos');
  renderizarTalentos();
  inicializarModalContactarExplorador();

  document.getElementById('explorador-buscador').addEventListener('input', renderizarTalentos);
});

function pintarFiltrosCategoria() {
  const contenedor = document.getElementById('explorador-categorias');
  contenedor.innerHTML = '';
  CATEGORIAS_EXPLORADOR.forEach(function (categoria) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'filtro-categoria px-4 py-2.5 rounded-full border border-navy/15 text-sm font-medium' + (categoria.id === categoriaActivaExplorador ? ' activo' : '');
    boton.textContent = categoria.nombre;
    boton.addEventListener('click', function () {
      categoriaActivaExplorador = categoria.id;
      document.querySelectorAll('#explorador-categorias .filtro-categoria').forEach(function (b) { b.classList.remove('activo'); });
      boton.classList.add('activo');
      aplicarTemaCategoria(categoria.clase);
      renderizarTalentos();
    });
    contenedor.appendChild(boton);
  });
}

function aplicarTemaCategoria(clase) {
  const categoria = CATEGORIAS_EXPLORADOR.find(function (c) { return c.clase === clase; }) || CATEGORIAS_EXPLORADOR[0];
  const banner = document.getElementById('explorador-banner');
  banner.className = 'explorador-banner explorador-banner--' + categoria.clase;
  document.getElementById('explorador-banner-chip').textContent = categoria.chip;
  document.getElementById('explorador-titulo').textContent = categoria.titulo;
  document.getElementById('explorador-subtitulo').textContent = categoria.subtitulo;
  document.getElementById('explorador-banner-icono').innerHTML = '<use href="assets/icons/sprite.svg#' + categoria.icono + '"></use>';
}

function renderizarTalentos() {
  const texto = document.getElementById('explorador-buscador').value.trim().toLowerCase();
  let talentos = TH.obtenerUsuarios().filter(function (u) { return u.tipo === 'talento' && u.id !== usuarioExplorador.id; });

  if (categoriaActivaExplorador !== 'todos') {
    talentos = talentos.filter(function (u) { return u.categoriaTalento === categoriaActivaExplorador; });
  }

  if (texto) {
    talentos = talentos.filter(function (u) {
      return u.nombre.toLowerCase().includes(texto) ||
        (u.talentos || []).some(function (t) { return t.toLowerCase().includes(texto); }) ||
        (u.ciudad || '').toLowerCase().includes(texto);
    });
  }

  talentos.sort(function (a, b) { return (b.valoracion || 0) - (a.valoracion || 0); });

  document.getElementById('explorador-contador').textContent = talentos.length + (talentos.length === 1 ? ' talento encontrado' : ' talentos encontrados');

  const grid = document.getElementById('explorador-grid');
  const vacio = document.getElementById('explorador-vacio');
  grid.innerHTML = '';

  if (!talentos.length) {
    vacio.classList.remove('oculto');
    return;
  }
  vacio.classList.add('oculto');

  talentos.forEach(function (talento) {
    const categoriaInfo = CATEGORIAS_EXPLORADOR.find(function (c) { return c.id === talento.categoriaTalento; });
    const franjaClase = categoriaInfo ? categoriaInfo.franja : '';
    const progreso = TH.calcularProgresoNivel(talento.xp);
    const esNegocio = usuarioExplorador.tipo === 'negocio';
    const guardado = esNegocio && (usuarioExplorador.talentosGuardados || []).includes(talento.id);

    const tarjeta = document.createElement('article');
    tarjeta.className = 'talento-tarjeta';
    tarjeta.innerHTML =
      (franjaClase ? '<div class="talento-tarjeta__franja franja--' + franjaClase + '"></div>' : '') +
      '<div class="flex items-center gap-3 mb-3">' +
      '  <img src="' + TH.urlAvatar(talento.avatarSeed) + '" class="w-14 h-14 rounded-full" alt="Avatar de ' + talento.nombre + '">' +
      '  <div class="min-w-0">' +
      '    <p class="font-display font-semibold text-sm truncate">' + talento.nombre + '</p>' +
      '    <p class="text-graytext text-xs">' + (talento.edad ? talento.edad + ' años · ' : '') + talento.ciudad + '</p>' +
      '  </div>' +
      '</div>' +
      '<div class="flex items-center gap-2 flex-wrap mb-3">' +
      '  <span class="th-etiqueta th-etiqueta--purple">' + (talento.talentos && talento.talentos[0] ? talento.talentos[0] : 'Talento TalentHub') + '</span>' +
      '  <span class="th-etiqueta th-etiqueta--navy">Nivel ' + progreso.nivel + '</span>' +
      '</div>' +
      '<p class="text-graytext text-xs leading-relaxed mb-4 line-clamp-2">' + (talento.bio || 'Todavía no escribió su biografía.') + '</p>' +
      '<div class="flex items-center gap-4 text-xs text-graytext mb-5">' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13" class="text-gold"><use href="assets/icons/sprite.svg#icon-star"></use></svg>' + (talento.valoracion || 0).toFixed(1) + '</span>' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-briefcase"></use></svg>' + (talento.encargosCompletados || 0) + ' encargos</span>' +
      '</div>' +
      (esNegocio
        ? '<div class="flex gap-2 mb-2">' +
          '  <a href="perfil-publico.html?id=' + talento.id + '" class="flex-1 text-center border-2 border-navy/15 text-navy font-display text-xs font-semibold py-2.5 rounded-full hover:border-navy/35 transition-colors duration-300">Ver perfil</a>' +
          '  <button type="button" class="btn-contactar-explorador flex-1 bg-purple text-white font-display text-xs font-semibold py-2.5 rounded-full hover:bg-purple-dark transition-colors duration-300" data-id="' + talento.id + '">Contactar</button>' +
          '</div>' +
          '<button type="button" class="btn-guardar-explorador w-full font-display text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 ' + (guardado ? 'bg-grayxl text-navy' : 'border-2 border-navy/15 text-navy hover:border-navy/35') + '" data-id="' + talento.id + '">' + (guardado ? 'Guardado' : 'Guardar') + '</button>'
        : '<a href="perfil-publico.html?id=' + talento.id + '" class="mt-auto text-center bg-navy text-white font-display text-xs font-semibold py-2.5 rounded-full hover:bg-navy-soft transition-colors duration-300">Ver perfil</a>'
      );
    grid.appendChild(tarjeta);
  });

  if (usuarioExplorador.tipo === 'negocio') conectarAccionesNegocio();
}

function conectarAccionesNegocio() {
  document.querySelectorAll('.btn-guardar-explorador').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const id = boton.getAttribute('data-id');
      const lista = usuarioExplorador.talentosGuardados || [];
      const yaGuardado = lista.includes(id);
      TH.actualizarUsuario(usuarioExplorador.id, { talentosGuardados: yaGuardado ? lista.filter(function (x) { return x !== id; }) : lista.concat([id]) });
      usuarioExplorador = TH.obtenerUsuarioPorId(usuarioExplorador.id);
      THUI.mostrarToast(yaGuardado ? 'Quitaste el talento de guardados.' : 'Talento guardado.', 'exito');
      renderizarTalentos();
    });
  });

  document.querySelectorAll('.btn-contactar-explorador').forEach(function (boton) {
    boton.addEventListener('click', function () {
      abrirModalContactarExplorador(boton.getAttribute('data-id'));
    });
  });
}

let talentoContactadoExplorador = null;

function abrirModalContactarExplorador(talentoId) {
  const talento = TH.obtenerUsuarioPorId(talentoId);
  if (!talento) return;
  talentoContactadoExplorador = talentoId;

  document.getElementById('titulo-contactar-explorador').textContent = 'Escribirle a ' + talento.nombre.split(' ')[0];
  document.getElementById('form-contactar-explorador').reset();

  const select = document.getElementById('exp-proyecto');
  select.innerHTML = '<option value="">No referenciar ningún proyecto</option>';
  (talento.portafolio || []).forEach(function (p) {
    const opcion = document.createElement('option');
    opcion.value = p.id;
    opcion.textContent = p.titulo;
    select.appendChild(opcion);
  });

  THUI.abrirModal('modal-contactar-explorador');
}

function inicializarModalContactarExplorador() {
  const form = document.getElementById('form-contactar-explorador');
  if (!form) return;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const talento = TH.obtenerUsuarioPorId(talentoContactadoExplorador);
    if (!talento) return;

    const mensaje = document.getElementById('exp-mensaje').value.trim();
    const idProyecto = document.getElementById('exp-proyecto').value;
    const proyecto = idProyecto ? (talento.portafolio || []).find(function (p) { return p.id === idProyecto; }) : null;

    let texto = mensaje || ('Hola, tu negocio ' + (usuarioExplorador.nombreEmpresa || usuarioExplorador.nombre) + ' está interesado en tu talento.');
    if (proyecto) texto += ' (Sobre tu proyecto: "' + proyecto.titulo + '")';

    const conversacion = TH.obtenerOCrearConversacion(usuarioExplorador.id, talento.id, null);
    TH.agregarMensaje(conversacion.id, usuarioExplorador.id, texto);

    THUI.cerrarModal('modal-contactar-explorador');
    THUI.mostrarToast('Mensaje enviado a ' + talento.nombre.split(' ')[0] + '.', 'exito');
    setTimeout(function () { window.location.href = 'mensajes.html?id=' + conversacion.id; }, 500);
  });
}
