/* =========================================================
   TALENTHUB - APRENDIZAJE.JS
   Centro de aprendizaje: lista de recursos cortos, contenido
   simulado por curso, marcado de progreso y recompensa de XP.
   ========================================================= */

const CONTENIDO_CURSOS = {
  cu1: [
    'Elige entre 3 y 6 de tus mejores trabajos. La calidad siempre gana sobre la cantidad.',
    'Escribe una frase corta para cada proyecto: qué necesitaba el cliente y cómo lo resolviste.',
    'Actualiza tu portafolio cada vez que termines un encargo nuevo, no esperes a "tenerlo perfecto".'
  ],
  cu2: [
    'Investiga cuánto cobran otros talentos de tu categoría antes de poner un precio.',
    'Empieza con un precio justo para ti, no el más bajo posible: tu tiempo vale.',
    'Comunica tu tarifa con seguridad, sin justificarte de más.'
  ],
  cu3: [
    'Empieza por tu círculo cercano: familia, vecinos, colegio. Ahí están tus primeros clientes.',
    'Comparte tu trabajo en redes sociales aunque sientas vergüenza al inicio.',
    'Ofrece un pequeño descuento o bono en tus primeros 3 encargos para ganar reseñas.'
  ],
  cu4: [
    'Publica tu proceso, no solo el resultado final: la gente conecta con el "cómo".',
    'Usa siempre la misma estética en tus publicaciones para que te reconozcan.',
    'Pide a tus clientes felices que compartan tu trabajo o te den una reseña.'
  ],
  cu5: [
    'Empieza tu propuesta entendiendo el problema del cliente, no solo tu servicio.',
    'Sé claro con tiempos de entrega, precio y qué incluye exactamente.',
    'Cierra siempre con una pregunta o un siguiente paso concreto.'
  ],
  cu6: [
    'Separa tus ingresos en tres partes: gastos, ahorro y reinversión en tu talento.',
    'Guarda un pequeño registro de cada encargo y cuánto te pagaron.',
    'Antes de gastar, pregúntate si te acerca o te aleja de tus metas de estudio.'
  ],
  cu7: [
    'Nunca compartas contraseñas ni datos bancarios completos por chat.',
    'Si algo se siente raro con un cliente, repórtalo dentro de TalentHub.',
    'Acuerda siempre los términos del encargo por escrito antes de empezar.'
  ]
};

let usuarioAprendizaje = null;
let cursoModalId = null;

document.addEventListener('DOMContentLoaded', function () {
  usuarioAprendizaje = TH_SHELL.montar('aprendizaje', 'Centro de aprendizaje');
  if (!usuarioAprendizaje) return;

  pintarCursos();
});

function pintarCursos() {
  const cursos = TH.obtenerCursos();
  const contenedor = document.getElementById('aprendizaje-grid');
  contenedor.innerHTML = '';

  let completados = 0;

  cursos.forEach(function (curso) {
    const hecho = TH.cursoEstaCompletado(curso.id);
    if (hecho) completados++;

    const tarjeta = document.createElement('article');
    tarjeta.className = 'curso-tarjeta' + (hecho ? ' completado' : '');
    tarjeta.innerHTML =
      '<div class="flex items-center justify-between mb-3">' +
      '  <span class="th-etiqueta th-etiqueta--purple">' + curso.categoria + '</span>' +
      (hecho ? '<svg width="18" height="18" class="text-[#1C8F5B]"><use href="assets/icons/sprite.svg#icon-check-circle"></use></svg>' : '') +
      '</div>' +
      '<h3 class="font-display font-semibold text-[15px] leading-snug mb-2">' + curso.titulo + '</h3>' +
      '<p class="text-graytext text-xs leading-relaxed mb-4">' + curso.descripcion + '</p>' +
      '<div class="flex items-center gap-3 text-graytext text-xs mb-5">' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-clock"></use></svg>' + curso.duracion + '</span>' +
      '  <span class="flex items-center gap-1"><svg width="13" height="13"><use href="assets/icons/sprite.svg#icon-badge"></use></svg>' + curso.nivel + '</span>' +
      '</div>' +
      '<button type="button" class="btn-abrir-curso mt-auto w-full font-display text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 ' + (hecho ? 'bg-grayxl text-navy' : 'bg-purple text-white hover:bg-purple-dark') + '" data-id="' + curso.id + '">' + (hecho ? 'Repasar de nuevo' : 'Comenzar · +' + curso.xp + ' XP') + '</button>';
    contenedor.appendChild(tarjeta);
  });

  document.getElementById('aprendizaje-completados').textContent = completados;
  document.getElementById('aprendizaje-total').textContent = cursos.length;

  contenedor.querySelectorAll('.btn-abrir-curso').forEach(function (boton) {
    boton.addEventListener('click', function () { abrirCurso(boton.getAttribute('data-id')); });
  });
}

function abrirCurso(id) {
  const curso = TH.obtenerCursoPorId(id);
  if (!curso) return;
  cursoModalId = id;

  document.getElementById('curso-modal-categoria').textContent = curso.categoria;
  document.getElementById('curso-modal-titulo').textContent = curso.titulo;
  document.getElementById('curso-modal-meta').textContent = curso.duracion + ' · Nivel ' + curso.nivel;

  const puntos = CONTENIDO_CURSOS[id] || [curso.descripcion];
  document.getElementById('curso-modal-contenido').innerHTML = '<p>' + curso.descripcion + '</p><ul class="list-disc pl-5 space-y-2">' +
    puntos.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';

  const completado = TH.cursoEstaCompletado(id);
  const boton = document.getElementById('btn-completar-curso');
  boton.textContent = completado ? 'Ya completaste este recurso' : 'Marcar como completado';
  boton.disabled = completado;
  boton.classList.toggle('opacity-50', completado);

  THUI.abrirModal('modal-curso');
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn-completar-curso').addEventListener('click', function () {
    if (!cursoModalId || TH.cursoEstaCompletado(cursoModalId)) return;
    const curso = TH.obtenerCursoPorId(cursoModalId);

    TH.marcarCursoCompletado(cursoModalId);
    const resultado = TH.otorgarXP(usuarioAprendizaje.id, curso.xp, 'completar "' + curso.titulo + '"');
    usuarioAprendizaje = TH.obtenerUsuarioPorId(usuarioAprendizaje.id);

    THUI.cerrarModal('modal-curso');
    document.getElementById('logro-curso-texto').textContent = 'Ganaste +' + curso.xp + ' XP por completar "' + curso.titulo + '".' + (resultado && resultado.subioNivel ? ' ¡Y subiste al Nivel ' + resultado.nivelNuevo + '!' : '');
    THUI.abrirModal('modal-logro-curso');

    pintarCursos();
  });
});
