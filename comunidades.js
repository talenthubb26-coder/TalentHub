/* =========================================================
   TALENTHUB - COMUNIDADES.JS
   Listado de comunidades con filtro por categoria, boton de
   unirse/salir y formulario para crear una nueva comunidad.
   ========================================================= */

let usuarioComunidades = null;
let filtroCategoriaActivo = 'Todas';

document.addEventListener('DOMContentLoaded', function () {
  usuarioComunidades = TH_SHELL.montar('comunidades', 'Comunidades');
  if (!usuarioComunidades) return;

  pintarFiltros();
  pintarComunidades();
  inicializarCrearComunidad();
});

function pintarFiltros() {
  const categorias = ['Todas'].concat(Array.from(new Set(TH.obtenerComunidades().map(function (c) { return c.categoria; }))));
  const contenedor = document.getElementById('comunidades-filtros');
  contenedor.innerHTML = '';
  categorias.forEach(function (categoria) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'filtro-categoria px-4 py-2 rounded-full border border-navy/15 text-sm font-medium' + (categoria === filtroCategoriaActivo ? ' activo' : '');
    boton.textContent = categoria;
    boton.addEventListener('click', function () {
      filtroCategoriaActivo = categoria;
      pintarFiltros();
      pintarComunidades();
    });
    contenedor.appendChild(boton);
  });
}

function estaUnido(comunidadId) {
  return (usuarioComunidades.comunidadesUnidas || []).includes(comunidadId);
}

function pintarComunidades() {
  const contenedor = document.getElementById('comunidades-grid');
  contenedor.innerHTML = '';

  let comunidades = TH.obtenerComunidades();
  if (filtroCategoriaActivo !== 'Todas') {
    comunidades = comunidades.filter(function (c) { return c.categoria === filtroCategoriaActivo; });
  }

  if (!comunidades.length) {
    contenedor.innerHTML = '<div class="th-vacio col-span-full"><p class="text-graytext text-sm">No hay comunidades en esta categoría todavía.</p></div>';
    return;
  }

  comunidades.forEach(function (comunidad) {
    const unido = estaUnido(comunidad.id);
    const tarjeta = document.createElement('article');
    tarjeta.className = 'comunidad-tarjeta';
    tarjeta.innerHTML =
      '<div class="flex items-start justify-between gap-3 mb-4">' +
      '  <div class="comunidad-icono comunidad-icono--' + comunidad.color + '"><svg width="24" height="24"><use href="assets/icons/sprite.svg#icon-users"></use></svg></div>' +
      '  <span class="th-etiqueta th-etiqueta--navy">' + comunidad.categoria + '</span>' +
      '</div>' +
      '<h3 class="font-display font-semibold text-base mb-2">' + comunidad.nombre + '</h3>' +
      '<p class="text-graytext text-sm leading-relaxed mb-4 line-clamp-2">' + comunidad.descripcion + '</p>' +
      '<p class="text-graytext text-xs mb-5">' + comunidad.miembros.toLocaleString('es-PE') + ' miembros · ' + comunidad.publicaciones.length + ' publicaciones</p>' +
      '<div class="flex gap-2">' +
      '  <button type="button" class="btn-unirse flex-1 font-display text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 ' + (unido ? 'bg-grayxl text-navy' : 'bg-purple text-white hover:bg-purple-dark') + '" data-id="' + comunidad.id + '">' + (unido ? 'Unido' : 'Unirme') + '</button>' +
      '  <a href="comunidad.html?id=' + comunidad.id + '" class="flex-1 text-center border-2 border-navy/15 font-display text-xs font-semibold py-2 rounded-full hover:border-navy/35 transition-colors duration-300">Ver comunidad</a>' +
      '</div>';
    contenedor.appendChild(tarjeta);
  });

  contenedor.querySelectorAll('.btn-unirse').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const id = boton.getAttribute('data-id');
      const yaUnido = estaUnido(id);
      const lista = usuarioComunidades.comunidadesUnidas || [];

      if (yaUnido) {
        TH.actualizarUsuario(usuarioComunidades.id, { comunidadesUnidas: lista.filter(function (x) { return x !== id; }) });
        TH.ajustarMiembrosComunidad(id, -1);
      } else {
        TH.actualizarUsuario(usuarioComunidades.id, { comunidadesUnidas: lista.concat([id]) });
        TH.ajustarMiembrosComunidad(id, 1);
        THUI.mostrarToast('Te uniste a la comunidad.', 'exito');
      }
      usuarioComunidades = TH.obtenerUsuarioPorId(usuarioComunidades.id);
      pintarComunidades();
    });
  });
}

function inicializarCrearComunidad() {
  document.getElementById('btn-crear-comunidad').addEventListener('click', function () {
    document.getElementById('form-crear-comunidad').reset();
    THUI.abrirModal('modal-crear-comunidad');
  });

  document.getElementById('form-crear-comunidad').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const nombre = document.getElementById('cc-nombre').value.trim();
    if (!nombre) return;

    const nueva = TH.crearComunidad({
      nombre: nombre,
      categoria: document.getElementById('cc-categoria').value,
      color: document.getElementById('cc-color').value,
      descripcion: document.getElementById('cc-descripcion').value.trim() || 'Una nueva comunidad de TalentHub.',
      reglas: document.getElementById('cc-reglas').value.trim(),
      creadaPor: usuarioComunidades.id
    });

    TH.actualizarUsuario(usuarioComunidades.id, { comunidadesUnidas: (usuarioComunidades.comunidadesUnidas || []).concat([nueva.id]) });
    usuarioComunidades = TH.obtenerUsuarioPorId(usuarioComunidades.id);

    THUI.cerrarModal('modal-crear-comunidad');
    THUI.mostrarToast('Comunidad "' + nombre + '" creada correctamente.', 'exito');
    filtroCategoriaActivo = 'Todas';
    pintarFiltros();
    pintarComunidades();
  });
}
