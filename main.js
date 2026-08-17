/* =========================================================
   TALENTHUB - MAIN.JS
   Inicializacion general del sitio: menu movil, navbar
   compacto, animaciones al hacer scroll, acordeon de FAQ,
   carrusel de testimonios, filtros del explorador de talentos,
   pestanas de la galeria de producto, contador de impacto,
   trayectoria de scroll y mapa de cobertura.
   El formulario de contacto se valida por separado en form.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  ejecutarConSeguridad(inicializarMenuMovil, 'inicializarMenuMovil');
  ejecutarConSeguridad(inicializarNavbarCompacto, 'inicializarNavbarCompacto');
  ejecutarConSeguridad(inicializarAnimacionesScroll, 'inicializarAnimacionesScroll');
  ejecutarConSeguridad(inicializarAcordeonFAQ, 'inicializarAcordeonFAQ');
  ejecutarConSeguridad(inicializarCarruselTestimonios, 'inicializarCarruselTestimonios');
  ejecutarConSeguridad(inicializarFiltrosTalentos, 'inicializarFiltrosTalentos');
  ejecutarConSeguridad(inicializarPestanasGaleria, 'inicializarPestanasGaleria');
  ejecutarConSeguridad(inicializarContadoresImpacto, 'inicializarContadoresImpacto');
  ejecutarConSeguridad(inicializarTrayectoriaScroll, 'inicializarTrayectoriaScroll');
  ejecutarConSeguridad(inicializarMapaCobertura, 'inicializarMapaCobertura');
  ejecutarConSeguridad(adaptarNavParaSesion, 'adaptarNavParaSesion');

});

/**
 * Ejecuta una funcion de inicializacion protegida con try/catch: si
 * una seccion falla por cualquier motivo, el error queda registrado
 * en la consola pero NO detiene la inicializacion del resto de la
 * pagina (sin esto, un solo error interrumpe todas las funciones
 * que estaban pendientes de ejecutarse despues en la lista).
 */
function ejecutarConSeguridad(funcion, nombre) {
  try {
    funcion();
  } catch (error) {
    console.error('TalentHub: error al inicializar "' + nombre + '":', error);
  }
}

/**
 * Si ya existe una sesion activa de TalentHub en este navegador
 * (guardada por store.js), reemplaza los botones de "Unirme gratis"
 * e "Iniciar sesión" de la landing por un acceso directo a la
 * aplicacion, para no pedirle a un usuario que ya se registro que
 * vuelva a pasar por el flujo de registro.
 */
function adaptarNavParaSesion() {
  if (typeof TH === 'undefined') return;
  const usuario = TH.obtenerUsuarioActual();
  if (!usuario) return;

  const destino = usuario.tipo === 'negocio' ? 'negocio.html' : 'dashboard.html';
  const textoBoton = 'Ir a mi cuenta';

  const login = document.getElementById('nav-login');
  const loginMovil = document.getElementById('nav-login-movil');
  const cta = document.getElementById('nav-cta');
  const ctaMovil = document.getElementById('nav-cta-movil');
  const heroCta = document.getElementById('hero-cta');

  if (login) login.style.display = 'none';
  if (loginMovil) loginMovil.style.display = 'none';

  [cta, ctaMovil, heroCta].forEach(function (boton) {
    if (!boton) return;
    boton.setAttribute('href', destino);
    boton.childNodes[0].textContent = textoBoton + ' ';
  });
}

/**
 * Controla la apertura y cierre del menu de navegacion en pantallas
 * pequenas, alternando la clase "activo" y los iconos de hamburguesa/cierre.
 */
function inicializarMenuMovil() {
  const boton = document.getElementById('boton-menu-movil');
  const menu = document.getElementById('menu-movil');
  const iconoAbrir = document.getElementById('icono-abrir-menu');
  const iconoCerrar = document.getElementById('icono-cerrar-menu');
  if (!boton || !menu) return;

  function alternarMenu(forzarCierre) {
    const abierto = menu.classList.contains('activo');
    const debeAbrir = forzarCierre ? false : !abierto;
    menu.classList.toggle('activo', debeAbrir);
    boton.setAttribute('aria-expanded', String(debeAbrir));
    iconoAbrir.classList.toggle('hidden', debeAbrir);
    iconoCerrar.classList.toggle('hidden', !debeAbrir);
  }

  boton.addEventListener('click', function () {
    alternarMenu(false);
  });

  // Cierra el menu automaticamente al elegir un enlace
  menu.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      alternarMenu(true);
    });
  });
}

/**
 * Reduce el padding vertical del navbar cuando el usuario baja mas
 * de 40px en la pagina, dando una sensacion de navbar mas compacto.
 */
function inicializarNavbarCompacto() {
  const navbar = document.getElementById('navbar');
  const interior = document.getElementById('navbar-interior');
  if (!navbar || !interior) return;

  function actualizarEstado() {
    const debeSerCompacto = window.scrollY > 40;
    navbar.classList.toggle('navbar-compacta', debeSerCompacto);
    interior.classList.toggle('py-2', debeSerCompacto);
    interior.classList.toggle('py-4', !debeSerCompacto);
  }

  actualizarEstado();
  window.addEventListener('scroll', actualizarEstado, { passive: true });
}

/**
 * Usa Intersection Observer para revelar con una transicion suave
 * los elementos marcados con las clases al-aparecer, al-aparecer-izq
 * o al-aparecer-der apenas entran en el viewport.
 */
function inicializarAnimacionesScroll() {
  const elementos = document.querySelectorAll('.al-aparecer, .al-aparecer-izq, .al-aparecer-der');
  if (!elementos.length) return;

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('en-vista');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  elementos.forEach(function (el) {
    observador.observe(el);
  });
}

/**
 * Controla el acordeon de preguntas frecuentes: abre y cierra cada
 * pregunta calculando su altura real para animar max-height.
 */
function inicializarAcordeonFAQ() {
  const items = document.querySelectorAll('#acordeon-faq .acordeon-item');
  if (!items.length) return;

  items.forEach(function (item) {
    const boton = item.querySelector('.acordeon-boton');
    const contenido = item.querySelector('.acordeon-contenido');

    boton.addEventListener('click', function () {
      const yaActivo = item.classList.contains('activo');

      // Cierra las demas preguntas abiertas (solo una a la vez)
      items.forEach(function (otro) {
        otro.classList.remove('activo');
        otro.querySelector('.acordeon-boton').setAttribute('aria-expanded', 'false');
        otro.querySelector('.acordeon-contenido').style.maxHeight = null;
      });

      if (!yaActivo) {
        item.classList.add('activo');
        boton.setAttribute('aria-expanded', 'true');
        contenido.style.maxHeight = contenido.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Carrusel simple de testimonios: desplaza la pista horizontalmente
 * segun el punto seleccionado y genera los puntos de navegacion
 * dinamicamente segun el numero de tarjetas visibles a la vez.
 */
function inicializarCarruselTestimonios() {
  const pista = document.getElementById('pista-testimonios');
  const contenedorPuntos = document.getElementById('puntos-carrusel');
  if (!pista || !contenedorPuntos) return;

  const tarjetas = Array.from(pista.children);
  let indiceActual = 0;

  function tarjetasVisibles() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function totalPaginas() {
    return Math.max(1, tarjetas.length - tarjetasVisibles() + 1);
  }

  function construirPuntos() {
    contenedorPuntos.innerHTML = '';
    const paginas = totalPaginas();
    for (let i = 0; i < paginas; i++) {
      const punto = document.createElement('button');
      punto.className = 'punto-carrusel' + (i === indiceActual ? ' activo' : '');
      punto.setAttribute('aria-label', 'Ver testimonio ' + (i + 1));
      punto.addEventListener('click', function () {
        indiceActual = i;
        moverPista();
      });
      contenedorPuntos.appendChild(punto);
    }
  }

  function moverPista() {
    if (!tarjetas.length) return;
    const anchoTarjeta = tarjetas[0].getBoundingClientRect().width + 24; // 24px = gap-6
    pista.style.transform = 'translateX(-' + (anchoTarjeta * indiceActual) + 'px)';
    Array.from(contenedorPuntos.children).forEach(function (punto, i) {
      punto.classList.toggle('activo', i === indiceActual);
    });
  }

  construirPuntos();
  moverPista();

  window.addEventListener('resize', function () {
    if (indiceActual > totalPaginas() - 1) indiceActual = totalPaginas() - 1;
    construirPuntos();
    moverPista();
  });
}

/**
 * Filtra las tarjetas de ejemplo del explorador de talentos segun
 * la categoria seleccionada en los botones de filtro.
 */
function inicializarFiltrosTalentos() {
  const botones = document.querySelectorAll('.filtro-categoria');
  const tarjetas = document.querySelectorAll('.tarjeta-talento');
  const mensajeVacio = document.getElementById('sin-resultados');
  if (!botones.length) return;

  botones.forEach(function (boton) {
    boton.addEventListener('click', function () {
      botones.forEach(function (b) { b.classList.remove('activo'); });
      boton.classList.add('activo');

      const categoria = boton.getAttribute('data-categoria');
      let visibles = 0;

      tarjetas.forEach(function (tarjeta) {
        const coincide = categoria === 'todos' || tarjeta.getAttribute('data-categoria') === categoria;
        tarjeta.hidden = !coincide;
        if (coincide) visibles++;
      });

      if (mensajeVacio) mensajeVacio.classList.toggle('hidden', visibles > 0);
    });
  });
}

/**
 * Controla las pestanas de la galeria de producto, mostrando la
 * pantalla simulada correspondiente dentro del marco de laptop.
 */
function inicializarPestanasGaleria() {
  const pestanas = document.querySelectorAll('.pestana-pantalla');
  const pantallas = document.querySelectorAll('.pantalla-app');
  if (!pestanas.length) return;

  pestanas.forEach(function (pestana) {
    pestana.addEventListener('click', function () {
      pestanas.forEach(function (p) { p.classList.remove('activa'); });
      pestana.classList.add('activa');

      const destino = pestana.getAttribute('data-pantalla');
      pantallas.forEach(function (pantalla) {
        pantalla.classList.toggle('activa', pantalla.getAttribute('data-pantalla') === destino);
      });
    });
  });
}

/**
 * Anima los numeros grandes de la seccion de impacto contando desde
 * 0 hasta el valor definido en data-contador, una sola vez, cuando
 * la seccion entra en el viewport.
 */
function inicializarContadoresImpacto() {
  const numeros = document.querySelectorAll('.numero-contador');
  if (!numeros.length) return;

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      animarContador(entrada.target);
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.4 });

  numeros.forEach(function (numero) { observador.observe(numero); });

  function animarContador(elemento) {
    const valorFinal = parseInt(elemento.getAttribute('data-contador'), 10) || 0;
    const sufijo = elemento.getAttribute('data-sufijo') || '';
    const duracion = 1400;
    const inicio = performance.now();

    function paso(ahora) {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const valorActual = Math.floor(progreso * valorFinal);
      elemento.textContent = valorActual + sufijo;
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        elemento.textContent = valorFinal + sufijo;
      }
    }
    requestAnimationFrame(paso);
  }
}

/**
 * Mueve el icono de cohete a lo largo de la linea orbital fija segun
 * el porcentaje de scroll total de la pagina (elemento de firma visual).
 */
function inicializarTrayectoriaScroll() {
  const cohete = document.getElementById('cohete-scroll');
  if (!cohete) return;

  function actualizarPosicion() {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = alturaTotal > 0 ? window.scrollY / alturaTotal : 0;
    const contenedor = cohete.parentElement.getBoundingClientRect();
    const maxTop = contenedor.height - cohete.offsetHeight;
    cohete.style.top = (progreso * maxTop) + 'px';
  }

  actualizarPosicion();
  window.addEventListener('scroll', actualizarPosicion, { passive: true });
  window.addEventListener('resize', actualizarPosicion);
}

/**
 * Inicializa el mapa interactivo de cobertura con Leaflet y
 * OpenStreetMap, marcando algunas ciudades del Peru donde
 * TalentHub ya tiene talentos activos.
 */
function inicializarMapaCobertura() {
  const contenedor = document.getElementById('mapa-cobertura');
  if (!contenedor || typeof L === 'undefined') return;

  const mapa = L.map('mapa-cobertura', {
    scrollWheelZoom: false
  }).setView([-9.4, -75.0], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; colaboradores de OpenStreetMap',
    maxZoom: 12
  }).addTo(mapa);

  const ciudades = [
    { nombre: 'Lima', coords: [-12.0464, -77.0428], detalle: 'Sede principal de la comunidad TalentHub' },
    { nombre: 'Arequipa', coords: [-16.4090, -71.5375], detalle: 'Talentos en música y producción de audio' },
    { nombre: 'Trujillo', coords: [-8.1116, -79.0290], detalle: 'Talentos en diseño y marcas locales' },
    { nombre: 'Cusco', coords: [-13.5320, -71.9675], detalle: 'Talentos en fotografía y turismo creativo' },
    { nombre: 'Piura', coords: [-5.1945, -80.6328], detalle: 'Talentos en arte e ilustración' },
    { nombre: 'Chiclayo', coords: [-6.7714, -79.8409], detalle: 'Talentos en educación y tutorías' }
  ];

  ciudades.forEach(function (ciudad) {
    L.circleMarker(ciudad.coords, {
      radius: 8,
      color: '#7C5CFF',
      fillColor: '#7C5CFF',
      fillOpacity: 0.55,
      weight: 2
    })
      .addTo(mapa)
      .bindPopup('<strong>' + ciudad.nombre + '</strong><br>' + ciudad.detalle);
  });
}
