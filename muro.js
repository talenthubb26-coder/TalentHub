/* =========================================================
   TALENTHUB - MURO.JS
   Logica del muro de encargos: busqueda, filtros combinables y
   renderizado de tarjetas.
   ========================================================= */

let usuarioMuro = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioMuro = TH_SHELL.montar('muro', 'Muro de encargos');
  if (!usuarioMuro) return;

  if (usuarioMuro.tipo === 'negocio') {
    document.getElementById('btn-publicar-encargo').classList.remove('oculto');
  }

  poblarFiltroCategorias();
  renderizarEncargos();

  ['muro-buscador', 'filtro-categoria', 'filtro-modalidad', 'filtro-presupuesto', 'filtro-nivel'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', renderizarEncargos);
    document.getElementById(id).addEventListener('change', renderizarEncargos);
  });
});

function poblarFiltroCategorias() {
  const categorias = Array.from(new Set(TH.obtenerEncargos().map(function (e) { return e.categoria; }))).sort();
  const select = document.getElementById('filtro-categoria');
  categorias.forEach(function (categoria) {
    const opcion = document.createElement('option');
    opcion.value = categoria;
    opcion.textContent = categoria;
    select.appendChild(opcion);
  });
}

function renderizarEncargos() {
  const texto = document.getElementById('muro-buscador').value.trim().toLowerCase();
  const categoria = document.getElementById('filtro-categoria').value;
  const modalidad = document.getElementById('filtro-modalidad').value;
  const presupuesto = document.getElementById('filtro-presupuesto').value;
  const nivel = document.getElementById('filtro-nivel').value;

  let encargos = TH.obtenerEncargos().filter(TH.estaEncargoVigente);

  if (texto) {
    encargos = encargos.filter(function (e) {
      return e.titulo.toLowerCase().includes(texto) || e.descripcion.toLowerCase().includes(texto) || e.categoria.toLowerCase().includes(texto);
    });
  }
  if (categoria) encargos = encargos.filter(function (e) { return e.categoria === categoria; });
  if (modalidad) encargos = encargos.filter(function (e) { return e.modalidad === modalidad; });
  if (nivel) encargos = encargos.filter(function (e) { return String(e.nivelRecomendado) === nivel; });
  if (presupuesto) {
    const partes = presupuesto.split('-');
    const min = parseInt(partes[0], 10);
    const max = parseInt(partes[1], 10);
    encargos = encargos.filter(function (e) { return e.presupuestoMax >= min && e.presupuestoMin <= max; });
  }

  const guardados = usuarioMuro.encargosGuardados || [];
  encargos.sort(function (a, b) {
    const aGuardado = guardados.includes(a.id) ? 1 : 0;
    const bGuardado = guardados.includes(b.id) ? 1 : 0;
    if (aGuardado !== bGuardado) return bGuardado - aGuardado;
    return new Date(b.publicadoEn) - new Date(a.publicadoEn);
  });

  document.getElementById('muro-contador').textContent = encargos.length + (encargos.length === 1 ? ' encargo encontrado' : ' encargos encontrados');

  const grid = document.getElementById('muro-grid');
  const vacio = document.getElementById('muro-vacio');
  grid.innerHTML = '';

  if (!encargos.length) {
    vacio.classList.remove('oculto');
    return;
  }
  vacio.classList.add('oculto');

  encargos.forEach(function (encargo) {
    const autor = TH.obtenerUsuarioPorId(encargo.autorId);
    const yaPostulo = TH.yaPostuloA(usuarioMuro.id, encargo.id);
    const estaGuardado = guardados.includes(encargo.id);

    const tarjeta = document.createElement('article');
    tarjeta.className = 'encargo-tarjeta' + (estaGuardado ? ' encargo-tarjeta--fijado' : '');
    tarjeta.innerHTML =
      (estaGuardado ? '<div class="encargo-tarjeta__fijado"><svg width="12" height="12"><use href="assets/icons/sprite.svg#icon-bookmark"></use></svg> Fijado</div>' : '') +
      '<div class="flex items-center justify-between gap-2 mb-3">' +
      '  <span class="th-etiqueta th-etiqueta--purple">' + encargo.categoria + '</span>' +
      '  <span class="th-etiqueta th-etiqueta--navy">Nivel ' + encargo.nivelRecomendado + '</span>' +
      '</div>' +
      '<h3 class="font-display font-semibold text-[15px] leading-snug mb-2">' + encargo.titulo + '</h3>' +
      '<p class="text-graytext text-sm leading-relaxed mb-4 line-clamp-2">' + encargo.descripcion + '</p>' +
      '<div class="encargo-tarjeta__meta mb-1.5"><svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-briefcase"></use></svg>' + (autor ? (autor.nombreEmpresa || autor.nombre) : 'TalentHub') + '</div>' +
      '<div class="encargo-tarjeta__meta mb-1.5"><svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-map-pin"></use></svg>' + encargo.modalidad + (encargo.ubicacion ? ' · ' + encargo.ubicacion : '') + '</div>' +
      '<div class="encargo-tarjeta__meta mb-4"><svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-calendar"></use></svg>Hasta el ' + formatearFecha(encargo.fechaLimite) + '</div>' +
      '<div class="mt-auto flex items-center justify-between pt-4 border-t border-[#EEF0F7]">' +
      '  <span class="font-display font-bold text-navy">S/ ' + encargo.presupuestoMin + ' - ' + encargo.presupuestoMax + '</span>' +
      '  <a href="encargo.html?id=' + encargo.id + '" class="inline-flex items-center gap-1.5 text-purple text-sm font-semibold">' + (yaPostulo ? 'Ya postulaste' : 'Ver encargo') + ' <svg width="14" height="14"><use href="assets/icons/sprite.svg#icon-arrow-right"></use></svg></a>' +
      '</div>';
    grid.appendChild(tarjeta);
  });
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}
