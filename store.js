/* =========================================================
   TALENTHUB - STORE.JS
   Capa de datos del prototipo. No existe backend real: todo se
   guarda en localStorage. Este archivo centraliza:
     - Datos de demostracion (usuarios, negocios, encargos,
       comunidades, cursos, notificaciones).
     - Sesion activa (quien inicio sesion en este navegador).
     - Sistema de XP y niveles.
     - Funciones de lectura y escritura reutilizables.
   Debe cargarse ANTES que cualquier otro script de la app
   (shell.js, auth.js, dashboard.js, etc.) porque ellos dependen
   de las funciones definidas aqui (objeto global TH).
   ========================================================= */

const TH = (function () {

  const CLAVES = {
    USUARIOS: 'th_usuarios',
    ENCARGOS: 'th_encargos',
    POSTULACIONES: 'th_postulaciones',
    COMUNIDADES: 'th_comunidades',
    CURSOS: 'th_cursos',
    PROGRESO_CURSOS: 'th_progreso_cursos',
    NOTIFICACIONES: 'th_notificaciones',
    CONVERSACIONES: 'th_conversaciones',
    SESION: 'th_sesion',
    SEMILLA_CARGADA: 'th_semilla_v1'
  };

  const XP_POR_NIVEL = 300;

  const XP_ACCIONES = {
    PERFIL_COMPLETO: 100,
    PRIMER_PROYECTO: 150,
    CAPACITACION: 100,
    VALORACION_POSITIVA: 50,
    ENCARGO_COMPLETADO: 200,
    ACTIVIDAD_COMUNIDAD: 30,
    POSTULACION: 20
  };

  /* ---------------------------------------------------------
     UTILIDADES DE ALMACENAMIENTO
     --------------------------------------------------------- */
  function leer(clave, porDefecto) {
    try {
      const crudo = localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    } catch (error) {
      return porDefecto;
    }
  }

  function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  function generarId(prefijo) {
    return prefijo + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------------------------------------------------
     SEMILLA DE DATOS DE DEMOSTRACION
     Se carga una sola vez (marcada con SEMILLA_CARGADA) para no
     sobrescribir los cambios que el jurado haga durante la demo.
     --------------------------------------------------------- */
  function cargarSemillaSiNoExiste() {
    if (leer(CLAVES.SEMILLA_CARGADA, false)) return;

    const usuarios = [
      {
        id: 'u_sofia', tipo: 'talento', nombre: 'Sofía Ramírez', usuario: 'sofia_demo',
        correo: 'sofia@talenthub.pe', password: 'talenthub123', edad: 16, esMenor: true,
        ciudad: 'Piura, Perú', talentos: ['Ilustración digital', 'Diseño de personajes', 'Retratos'],
        categoriaTalento: 'Diseño y Arte Digital',
        bio: 'Apasionada por el diseño creativo y ayudar a marcas a destacar. Creo identidades visuales únicas y funcionales.',
        disponibilidad: 'Disponible', avatarSeed: 'Sofia', nivel: 1, xp: 1240, puntos: 180, premium: false,
        insignias: ['Primeros pasos', 'Perfil verificado', 'Racha de 7 días'],
        servicios: [
          { id: 'serv1', nombre: 'Diseño de logotipo', descripcion: 'Logotipo original en formato vectorial, con dos rondas de ajustes incluidas.', precioMin: 40, precioMax: 80, tiempoEstimado: '3 a 5 días', disponibilidad: 'Disponible ahora' },
          { id: 'serv2', nombre: 'Ilustración de personaje', descripcion: 'Ilustración digital de un personaje original a color, estilo semi-realista.', precioMin: 60, precioMax: 120, tiempoEstimado: '4 a 7 días', disponibilidad: 'Disponible ahora' }
        ],
        metodosPago: [{ id: 'mp_demo', marca: 'Visa', ultimos4: '4582' }],
        siguiendo: ['u_mateo', 'u_valentina'],
        portafolio: [
          { id: 'p1', titulo: 'Identidad visual - Café Andino', categoria: 'Diseño', herramientas: 'Illustrator, Photoshop', fecha: '2026-03-12', descripcion: 'Logotipo y paleta de colores para una cafetería local en Piura.', enlace: '' },
          { id: 'p2', titulo: 'Serie de retratos digitales', categoria: 'Ilustración', herramientas: 'Procreate', fecha: '2026-02-02', descripcion: 'Retratos por encargo para clientes particulares.', enlace: '' },
          { id: 'p3', titulo: 'Personajes para videojuego escolar', categoria: 'Ilustración', herramientas: 'Procreate, Photoshop', fecha: '2026-01-10', descripcion: 'Diseño de tres personajes para un proyecto escolar de videojuegos.', enlace: '' }
        ],
        valoracion: 4.9, encargosCompletados: 12, creadoEn: '2025-11-02'
      },
      {
        id: 'u_mateo', tipo: 'talento', nombre: 'Mateo Kanashiro', usuario: 'mateo_dev',
        correo: 'mateo@talenthub.pe', password: 'talenthub123', edad: 17, esMenor: true,
        ciudad: 'Lima, Perú', talentos: ['Programación web', 'HTML/CSS', 'JavaScript'],
        categoriaTalento: 'Tecnología y Código',
        bio: 'Construyo paginas web sencillas y funcionales para pequenos negocios de mi distrito.',
        disponibilidad: 'Disponible', avatarSeed: 'Mateo', nivel: 3, xp: 820, puntos: 60, premium: true,
        insignias: ['Primeros pasos', 'Insignia Premium'],
        servicios: [
          { id: 'serv_mateo1', nombre: 'Landing page para negocio', descripcion: 'Página de presentación de una sola vista, responsive, con formulario de contacto.', precioMin: 100, precioMax: 200, tiempoEstimado: '5 a 8 días', disponibilidad: 'Disponible ahora' },
          { id: 'serv_mateo2', nombre: 'Automatización con hoja de cálculo', descripcion: 'Formularios y hojas de cálculo conectadas para ordenar ventas o inventario.', precioMin: 60, precioMax: 120, tiempoEstimado: '3 a 5 días', disponibilidad: 'Bajo consulta' }
        ],
        portafolio: [
          { id: 'p1', titulo: 'Landing page - Bodega Don José', categoria: 'Programación', herramientas: 'HTML, CSS, JS', fecha: '2026-02-20', descripcion: 'Pagina de presentacion para una bodega familiar.', enlace: '', imagen: 'assets/img/proyecto-mateo-landing.jpg' }
        ],
        valoracion: 4.8, encargosCompletados: 7, creadoEn: '2025-10-14'
      },
      {
        id: 'u_valentina', tipo: 'talento', nombre: 'Valentina Suárez', usuario: 'valen_audio',
        correo: 'valentina@talenthub.pe', password: 'talenthub123', edad: 15, esMenor: true,
        ciudad: 'Arequipa, Perú', talentos: ['Producción de audio', 'Jingles', 'Edición de podcast'],
        categoriaTalento: 'Música y Producción',
        bio: 'Produzco jingles y edito audio para negocios y creadores de contenido.',
        disponibilidad: 'Ocupada', avatarSeed: 'Valentina', nivel: 5, xp: 1510, puntos: 340, premium: false,
        insignias: ['Primeros pasos', 'Perfil verificado', 'Top del mes'],
        servicios: [
          { id: 'serv_valentina1', nombre: 'Jingle publicitario', descripcion: 'Jingle original de 15 a 20 segundos, listo para redes sociales o radio local.', precioMin: 60, precioMax: 120, tiempoEstimado: '4 a 6 días', disponibilidad: 'Lista de espera' },
          { id: 'serv_valentina2', nombre: 'Edición de podcast', descripcion: 'Limpieza de audio, cortes y mezcla de un episodio de hasta 40 minutos.', precioMin: 50, precioMax: 90, tiempoEstimado: '2 a 4 días', disponibilidad: 'Lista de espera' }
        ],
        portafolio: [
          { id: 'p1', titulo: 'Jingle - Heladería Sabor Sur', categoria: 'Música', herramientas: 'FL Studio', fecha: '2026-01-18', descripcion: 'Jingle de 15 segundos para redes sociales.', enlace: '', imagen: 'assets/img/proyecto-valentina-jingle.jpg' }
        ],
        valoracion: 5.0, encargosCompletados: 15, creadoEn: '2025-08-30'
      },
      {
        id: 'u_diego', tipo: 'talento', nombre: 'Diego Paredes', usuario: 'diego_foto',
        correo: 'diego@talenthub.pe', password: 'talenthub123', edad: 19, esMenor: false,
        ciudad: 'Cusco, Perú', talentos: ['Fotografía', 'Edición de fotos'],
        categoriaTalento: 'Diseño y Arte Digital',
        bio: 'Cobertura fotografica de eventos y fotografia de producto.',
        disponibilidad: 'Disponible', avatarSeed: 'Diego', nivel: 2, xp: 430, puntos: 20, premium: false,
        insignias: ['Primeros pasos'],
        siguiendo: ['u_sofia'],
        servicios: [
          { id: 'serv_diego1', nombre: 'Sesión de fotos de producto', descripcion: 'Hasta 20 fotos editadas de productos para catálogo o redes sociales.', precioMin: 80, precioMax: 150, tiempoEstimado: '3 a 5 días', disponibilidad: 'Disponible ahora' },
          { id: 'serv_diego2', nombre: 'Cobertura de evento', descripcion: 'Cobertura fotográfica de eventos pequeños, hasta 3 horas.', precioMin: 100, precioMax: 200, tiempoEstimado: 'A coordinar', disponibilidad: 'Disponible ahora' }
        ],
        portafolio: [], valoracion: 4.7, encargosCompletados: 4, creadoEn: '2026-01-05'
      },
      {
        id: 'u_ana', tipo: 'talento', nombre: 'Ana Paucar', usuario: 'ana_disena',
        correo: 'ana@talenthub.pe', password: 'talenthub123', edad: 20, esMenor: false,
        ciudad: 'Trujillo, Perú', talentos: ['Diseño gráfico', 'Branding'],
        categoriaTalento: 'Diseño y Arte Digital',
        bio: 'Diseno de identidad visual para emprendimientos que recien empiezan.',
        disponibilidad: 'Disponible', avatarSeed: 'Ana', nivel: 6, xp: 1980, puntos: 410, premium: true,
        insignias: ['Primeros pasos', 'Perfil verificado', 'Insignia Premium', 'Top del mes'],
        siguiendo: ['u_sofia'],
        servicios: [
          { id: 'serv_ana1', nombre: 'Identidad visual completa', descripcion: 'Logotipo, paleta de colores y tipografía para una marca nueva.', precioMin: 150, precioMax: 280, tiempoEstimado: '6 a 10 días', disponibilidad: 'Disponible ahora' },
          { id: 'serv_ana2', nombre: 'Diseño de catálogo o empaque', descripcion: 'Diseño de catálogo digital o empaque de producto, hasta 6 páginas.', precioMin: 90, precioMax: 160, tiempoEstimado: '4 a 6 días', disponibilidad: 'Disponible ahora' }
        ],
        portafolio: [], valoracion: 4.9, encargosCompletados: 21, creadoEn: '2025-06-11'
      },
      {
        id: 'u_rodrigo', tipo: 'talento', nombre: 'Rodrigo Tueros', usuario: 'rodrigo_tutor',
        correo: 'rodrigo@talenthub.pe', password: 'talenthub123', edad: 18, esMenor: false,
        ciudad: 'Chiclayo, Perú', talentos: ['Tutoría de matemática', 'Clases de física', 'Preparación preuniversitaria'],
        categoriaTalento: 'Tutorías y Clases',
        bio: 'Dicto clases particulares de matemática y física para estudiantes de secundaria y preuniversitario.',
        disponibilidad: 'Disponible', avatarSeed: 'Rodrigo', nivel: 4, xp: 1120, puntos: 95, premium: false,
        insignias: ['Primeros pasos', 'Perfil verificado'],
        servicios: [
          { id: 'serv_rodrigo1', nombre: 'Tutoría de matemática (mensual)', descripcion: 'Cuatro sesiones de una hora por semana, con material de práctica incluido.', precioMin: 60, precioMax: 100, tiempoEstimado: 'Mensual', disponibilidad: 'Disponible ahora' },
          { id: 'serv_rodrigo2', nombre: 'Preparación preuniversitaria', descripcion: 'Clases intensivas de matemática y física orientadas a examen de admisión.', precioMin: 80, precioMax: 140, tiempoEstimado: 'Mensual', disponibilidad: 'Bajo consulta' }
        ],
        portafolio: [], valoracion: 4.9, encargosCompletados: 18, creadoEn: '2025-09-22'
      },
      {
        id: 'u_ariana', tipo: 'talento', nombre: 'Ariana Vega', usuario: 'ariana_tech',
        correo: 'ariana@talenthub.pe', password: 'talenthub123', edad: 20, esMenor: false,
        ciudad: 'Lima, Perú', talentos: ['Soporte técnico', 'Automatización', 'Hojas de cálculo'],
        categoriaTalento: 'Tecnología y Código',
        bio: 'Ayudo a pequeños negocios a organizar su información y automatizar tareas repetitivas.',
        disponibilidad: 'Disponible', avatarSeed: 'Ariana', nivel: 3, xp: 760, puntos: 40, premium: false,
        insignias: ['Primeros pasos'],
        servicios: [
          { id: 'serv_ariana1', nombre: 'Soporte técnico básico', descripcion: 'Configuración de equipos, impresoras en red y mantenimiento preventivo.', precioMin: 50, precioMax: 100, tiempoEstimado: '1 a 2 días', disponibilidad: 'Disponible ahora' },
          { id: 'serv_ariana2', nombre: 'Automatización de hojas de cálculo', descripcion: 'Plantillas y fórmulas para organizar ventas, inventario o pagos.', precioMin: 60, precioMax: 110, tiempoEstimado: '3 a 5 días', disponibilidad: 'Disponible ahora' }
        ],
        portafolio: [], valoracion: 4.8, encargosCompletados: 6, creadoEn: '2026-02-11'
      },
      {
        id: 'u_negocio_cafe', tipo: 'negocio', nombre: 'Karla Injante', usuario: 'cafe_central',
        correo: 'contacto@cafecentral.pe', password: 'talenthub123',
        nombreEmpresa: 'Café Central', categoriaEmpresa: 'Cafetería y repostería', ciudad: 'Lima, Perú',
        bio: 'Cafeteria de barrio buscando talento joven para creceer nuestra marca.',
        avatarSeed: 'CafeCentral', verificada: true, creadoEn: '2025-09-01'
      },
      {
        id: 'u_negocio_textil', tipo: 'negocio', nombre: 'James Delgado', usuario: 'textiles_sur',
        correo: 'james@textilessur.pe', password: 'talenthub123',
        nombreEmpresa: 'Textiles del Sur', categoriaEmpresa: 'Moda y textiles', ciudad: 'Arequipa, Perú',
        bio: 'Emprendimiento textil familiar en busqueda de apoyo creativo y digital.',
        avatarSeed: 'TextilesSur', verificada: false, creadoEn: '2025-12-04'
      }
    ];

    const encargos = [
      { id: 'e1', titulo: 'Diseño de logo para marca de ropa', descripcion: 'Buscamos un logotipo moderno y minimalista para una marca de ropa urbana peruana. Se entrega en formato vectorial y variantes de color.', categoria: 'Diseño', presupuestoMin: 120, presupuestoMax: 200, modalidad: 'Remoto', ubicacion: 'Lima', fechaLimite: '2026-09-05', autorId: 'u_negocio_textil', nivelRecomendado: 2, habilidades: ['Illustrator', 'Branding'], estado: 'Abierto', publicadoEn: '2026-08-01' },
      { id: 'e2', titulo: 'Edición de video para evento escolar', descripcion: 'Necesitamos editar un video de 3 minutos para la ceremonia de fin de año de un colegio. Material ya grabado, se entrega en una semana.', categoria: 'Video', presupuestoMin: 80, presupuestoMax: 150, modalidad: 'Remoto', ubicacion: 'Lima', fechaLimite: '2026-08-30', autorId: 'u_negocio_cafe', nivelRecomendado: 1, habilidades: ['Premiere', 'Edición'], estado: 'Abierto', publicadoEn: '2026-08-03' },
      { id: 'e3', titulo: 'Creación de página web para bodega', descripcion: 'Bodega familiar busca una pagina web sencilla de una sola pagina con catalogo de productos y datos de contacto.', categoria: 'Programación', presupuestoMin: 150, presupuestoMax: 300, modalidad: 'Remoto', ubicacion: 'Lima', fechaLimite: '2026-09-12', autorId: 'u_negocio_cafe', nivelRecomendado: 3, habilidades: ['HTML', 'CSS', 'JavaScript'], estado: 'Abierto', publicadoEn: '2026-07-28' },
      { id: 'e4', titulo: 'Jingle publicitario para negocio local', descripcion: 'Se necesita un jingle corto y pegajoso de 15 a 20 segundos para anuncios en redes sociales.', categoria: 'Música', presupuestoMin: 60, presupuestoMax: 120, modalidad: 'Remoto', ubicacion: 'Arequipa', fechaLimite: '2026-08-25', autorId: 'u_negocio_textil', nivelRecomendado: 2, habilidades: ['Producción musical'], estado: 'Abierto', publicadoEn: '2026-08-05' },
      { id: 'e5', titulo: 'Tutoría escolar de matemática', descripcion: 'Se busca apoyo semanal en matematica de secundaria para dos estudiantes de tercer ano.', categoria: 'Educación', presupuestoMin: 40, presupuestoMax: 80, modalidad: 'Remoto', ubicacion: 'Chiclayo', fechaLimite: '2026-08-20', autorId: 'u_negocio_cafe', nivelRecomendado: 1, habilidades: ['Matemática', 'Enseñanza'], estado: 'Abierto', publicadoEn: '2026-08-06' },
      { id: 'e6', titulo: 'Ilustración de personaje para stickers', descripcion: 'Buscamos un ilustrador para crear un set de 8 stickers de un personaje mascota para WhatsApp.', categoria: 'Ilustración', presupuestoMin: 90, presupuestoMax: 160, modalidad: 'Remoto', ubicacion: 'Piura', fechaLimite: '2026-09-01', autorId: 'u_negocio_textil', nivelRecomendado: 2, habilidades: ['Procreate', 'Ilustración'], estado: 'Abierto', publicadoEn: '2026-08-02' }
    ];

    const comunidades = [
      { id: 'c1', nombre: 'Programadores Perú', descripcion: 'Espacio para compartir proyectos, resolver dudas de codigo y conseguir tus primeros encargos de programacion.', categoria: 'Programación', color: 'purple', miembros: 342, reglas: 'Respeto ante todo. Nada de spam. Comparte y ayuda a otros.', publicaciones: [
        { id: 'pub1', autor: 'Mateo Kanashiro', avatarSeed: 'Mateo', canal: 'general', contenido: 'Terminé mi primera landing page para un negocio real. ¿Algún consejo para mejorar la velocidad de carga?', fecha: '2026-08-09', likesBase: 14, likedBy: [], comentarios: [
          { autor: 'Ana Paucar', avatarSeed: 'Ana', texto: 'Comprime tus imágenes antes de subirlas, se nota bastante la diferencia.' },
          { autor: 'Ariana Vega', avatarSeed: 'Ariana', texto: 'También revisa si estás cargando fuentes que no usas, suma bastante peso.' }
        ] },
        { id: 'pub2', autor: 'Ariana Vega', avatarSeed: 'Ariana', canal: 'proyectos', contenido: 'Automaticé el registro de ventas de una bodega con una hoja de cálculo conectada a un formulario. El dueño quedó feliz con el ahorro de tiempo.', fecha: '2026-08-05', likesBase: 9, likedBy: [], comentarios: [] },
        { id: 'pub3', autor: 'Diego Paredes', avatarSeed: 'Diego', canal: 'preguntas', contenido: '¿Alguien ha cobrado por mantenimiento mensual de una web? ¿Cómo estructuran el precio?', fecha: '2026-08-02', likesBase: 5, likedBy: [], comentarios: [
          { autor: 'Mateo Kanashiro', avatarSeed: 'Mateo', texto: 'Yo cobro una tarifa fija baja mensual, cubre cambios pequeños y hosting.' }
        ] },
        { id: 'pub4', autor: 'Mateo Kanashiro', avatarSeed: 'Mateo', canal: 'recursos', contenido: 'Encontré un curso gratuito de HTML y CSS bastante bueno para quienes recién empiezan. Lo recomiendo antes de meterse con JavaScript.', fecha: '2026-07-28', likesBase: 18, likedBy: [], comentarios: [] }
      ]},
      { id: 'c2', nombre: 'Diseño & Branding', descripcion: 'Comunidad de diseñadores gráficos e ilustradores compartiendo referencias, criticas constructivas y encargos.', categoria: 'Diseño', color: 'gold', miembros: 518, reglas: 'Comparte tu proceso. Las criticas deben ser constructivas.', publicaciones: [
        { id: 'pub1', autor: 'Sofía Ramírez', avatarSeed: 'Sofia', canal: 'general', contenido: 'Comparto el logo que hice para una cafetería de mi barrio. ¡Cualquier feedback es bienvenido!', fecha: '2026-08-10', likesBase: 22, likedBy: [], comentarios: [
          { autor: 'Ana Paucar', avatarSeed: 'Ana', texto: 'Me encanta la tipografía que elegiste, se ve muy limpio.' }
        ] },
        { id: 'pub2', autor: 'Ana Paucar', avatarSeed: 'Ana', canal: 'proyectos', contenido: 'Rediseñé la identidad visual completa de una marca de ropa: logo, paleta y empaques. Fue mi proyecto más grande hasta ahora.', fecha: '2026-08-06', likesBase: 31, likedBy: [], comentarios: [
          { autor: 'Sofía Ramírez', avatarSeed: 'Sofia', texto: 'Se nota la evolución desde tus primeros trabajos, ¡increíble!' }
        ] },
        { id: 'pub3', autor: 'Sofía Ramírez', avatarSeed: 'Sofia', canal: 'preguntas', contenido: '¿Qué programa recomiendan para alguien que recién empieza en diseño de logotipos, sin poder pagar Adobe todavía?', fecha: '2026-07-30', likesBase: 7, likedBy: [], comentarios: [
          { autor: 'Ana Paucar', avatarSeed: 'Ana', texto: 'Figma tiene un plan gratuito bastante completo para empezar.' }
        ] },
        { id: 'pub4', autor: 'Ana Paucar', avatarSeed: 'Ana', canal: 'recursos', contenido: 'Guardé una colección de paletas de colores inspiradas en textiles peruanos, las uso mucho para proyectos locales.', fecha: '2026-07-22', likesBase: 12, likedBy: [], comentarios: [] }
      ]},
      { id: 'c3', nombre: 'Música y Producción', descripcion: 'Para productores, cantantes e ingenieros de audio que recien empiezan a monetizar su talento.', categoria: 'Música', color: 'navy', miembros: 201, reglas: 'Comparte tus pistas con contexto. Respeta los créditos de autoría.', publicaciones: [
        { id: 'pub1', autor: 'Valentina Suárez', avatarSeed: 'Valentina', canal: 'general', contenido: 'Cerré mi encargo número 15 esta semana: un jingle para una heladería. ¡Gracias comunidad por todos los consejos!', fecha: '2026-08-08', likesBase: 27, likedBy: [], comentarios: [
          { autor: 'Sofía Ramírez', avatarSeed: 'Sofia', texto: '¡Felicidades! Se nota tu progreso, sigue así.' }
        ] },
        { id: 'pub2', autor: 'Valentina Suárez', avatarSeed: 'Valentina', canal: 'recursos', contenido: 'Si están empezando en producción, FL Studio tiene una versión de prueba sin límite de tiempo, ideal para practicar antes de comprarlo.', fecha: '2026-07-25', likesBase: 15, likedBy: [], comentarios: [] }
      ]},
      { id: 'c4', nombre: 'Fotografía Perú', descripcion: 'Comunidad de fotografos jovenes compartiendo tecnica, equipo y oportunidades de trabajo.', categoria: 'Fotografía', color: 'purple', miembros: 156, reglas: 'Cita la ubicación de tus fotos. Nada de contenido con derechos de autor ajenos.', publicaciones: [
        { id: 'pub1', autor: 'Diego Paredes', avatarSeed: 'Diego', canal: 'general', contenido: 'Sesión de fotos de producto para una marca de textiles en Arequipa. Trabajar con luz natural marcó toda la diferencia.', fecha: '2026-08-07', likesBase: 11, likedBy: [], comentarios: [] },
        { id: 'pub2', autor: 'Diego Paredes', avatarSeed: 'Diego', canal: 'preguntas', contenido: '¿Alguna recomendación de cámara de entrada para alguien que recién va a cobrar por sus primeras sesiones?', fecha: '2026-07-29', likesBase: 6, likedBy: [], comentarios: [] }
      ]},
      { id: 'c5', nombre: 'Emprendimiento Joven', descripcion: 'Espacio para jovenes que estan armando su propio negocio o marca personal.', categoria: 'Emprendimiento', color: 'gold', miembros: 289, reglas: 'Comparte aprendizajes reales, no solo logros.', publicaciones: [
        { id: 'pub1', autor: 'Rodrigo Tueros', avatarSeed: 'Rodrigo', canal: 'general', contenido: 'Después de un año dando tutorías, aprendí que cobrar por adelantado el primer mes evita muchos malentendidos.', fecha: '2026-08-04', likesBase: 19, likedBy: [], comentarios: [
          { autor: 'Mateo Kanashiro', avatarSeed: 'Mateo', texto: 'Totalmente de acuerdo, a mí me pasó lo mismo con proyectos de programación.' }
        ] },
        { id: 'pub2', autor: 'Ana Paucar', avatarSeed: 'Ana', canal: 'recursos', contenido: 'El curso "Cómo administrar tus primeros ingresos" del Centro de Aprendizaje me ayudó a organizar mejor mis cobros. Se los recomiendo.', fecha: '2026-07-20', likesBase: 13, likedBy: [], comentarios: [] }
      ]},
      { id: 'c6', nombre: 'Ilustración y Cómic', categoria: 'Ilustración', color: 'navy', descripcion: 'Ilustradores compartiendo procesos creativos, retos de dibujo y encargos.', miembros: 233, reglas: 'Marca contenido sensible. Da crédito a tus referencias.', publicaciones: [
        { id: 'pub1', autor: 'Sofía Ramírez', avatarSeed: 'Sofia', canal: 'general', contenido: 'Reto personal: una ilustración de personaje por semana durante un mes. Aquí va la primera.', fecha: '2026-08-11', likesBase: 25, likedBy: [], comentarios: [] },
        { id: 'pub2', autor: 'Sofía Ramírez', avatarSeed: 'Sofia', canal: 'proyectos', contenido: 'Diseñé tres personajes para un proyecto escolar de videojuegos. Fue mi primer encargo relacionado a videojuegos.', fecha: '2026-07-18', likesBase: 20, likedBy: [], comentarios: [] }
      ]}
    ];

    const cursos = [
      { id: 'cu1', titulo: 'Cómo crear un portafolio que venda', categoria: 'Portafolio', duracion: '12 min', nivel: 'Principiante', xp: 100, descripcion: 'Aprende a organizar tus mejores proyectos y presentarlos de forma profesional.' },
      { id: 'cu2', titulo: 'Cómo cobrar por tu primer servicio', categoria: 'Finanzas', duracion: '10 min', nivel: 'Principiante', xp: 100, descripcion: 'Como definir tarifas justas y comunicarlas con confianza a tus clientes.' },
      { id: 'cu3', titulo: 'Cómo conseguir tus primeros clientes', categoria: 'Crecimiento', duracion: '15 min', nivel: 'Principiante', xp: 100, descripcion: 'Estrategias simples para conseguir tus primeros encargos dentro y fuera de TalentHub.' },
      { id: 'cu4', titulo: 'Cómo promocionar tu trabajo', categoria: 'Marketing', duracion: '11 min', nivel: 'Intermedio', xp: 100, descripcion: 'Tips practicos para mostrar tu trabajo en redes sociales sin sentirte incómodo.' },
      { id: 'cu5', titulo: 'Cómo presentar una propuesta ganadora', categoria: 'Comunicación', duracion: '9 min', nivel: 'Intermedio', xp: 100, descripcion: 'La estructura de una propuesta clara que aumenta tus posibilidades de ser elegido.' },
      { id: 'cu6', titulo: 'Cómo administrar tus primeros ingresos', categoria: 'Finanzas', duracion: '13 min', nivel: 'Intermedio', xp: 100, descripcion: 'Organiza tus ingresos como talento joven: ahorro, reinversión y estudios.' },
      { id: 'cu7', titulo: 'Seguridad al trabajar por internet', categoria: 'Seguridad', duracion: '14 min', nivel: 'Principiante', xp: 100, descripcion: 'Buenas practicas para protegerte al conseguir clientes y cobrar en linea.' }
    ];

    const notificaciones = [
      { id: 'n1', userId: 'u_sofia', texto: 'Tu perfil recibió una nueva visita.', tipo: 'perfil', leida: false, fecha: '2026-08-12T09:10:00' },
      { id: 'n2', userId: 'u_sofia', texto: 'Mateo Kanashiro comentó tu publicación en Diseño & Branding.', tipo: 'comunidad', leida: false, fecha: '2026-08-11T18:40:00' },
      { id: 'n3', userId: 'u_sofia', texto: 'Tu postulación a "Ilustración de personaje para stickers" fue recibida.', tipo: 'postulacion', leida: false, fecha: '2026-08-10T13:05:00' },
      { id: 'n4', userId: 'u_sofia', texto: 'Has conseguido 100 XP por completar tu perfil.', tipo: 'xp', leida: true, fecha: '2026-08-08T11:00:00' },
      { id: 'n5', userId: 'u_sofia', texto: 'Subiste al Nivel 5. ¡Sigue así!', tipo: 'nivel', leida: true, fecha: '2026-08-05T20:15:00' },
      { id: 'n6', userId: 'u_sofia', texto: 'Una nueva oportunidad de Ilustración coincide con tus talentos.', tipo: 'encargo', leida: true, fecha: '2026-08-02T08:30:00' }
    ];

    const conversaciones = [
      {
        id: 'conv1', participantes: ['u_sofia', 'u_negocio_textil'], encargoId: 'e6', deposito: { estado: 'protegido', monto: 130 },
        noLeidoPara: ['u_sofia'],
        mensajes: [
          { autorId: 'u_negocio_textil', texto: 'Hola Sofía, vimos tu portafolio y nos encantó tu estilo para el set de stickers.', fecha: '2026-08-11T10:00:00' },
          { autorId: 'u_sofia', texto: '¡Hola! Muchas gracias, con gusto lo hago. ¿Tienen alguna referencia del personaje?', fecha: '2026-08-11T10:15:00' },
          { autorId: 'u_negocio_textil', texto: 'Sí, te comparto algunas ideas por aquí. Ya realizamos el depósito para que puedas empezar con confianza.', fecha: '2026-08-11T10:40:00' },
          { autorId: 'u_negocio_textil', texto: 'El pago queda protegido en TalentHub hasta que entregues el encargo y lo confirmemos.', fecha: '2026-08-11T10:41:00' }
        ]
      },
      {
        id: 'conv2', participantes: ['u_sofia', 'u_negocio_cafe'], encargoId: null, deposito: null,
        noLeidoPara: [],
        mensajes: [
          { autorId: 'u_negocio_cafe', texto: 'Hola, ¿tienes disponibilidad para un logo pequeño la próxima semana?', fecha: '2026-08-06T15:20:00' },
          { autorId: 'u_sofia', texto: 'Hola, sí tengo espacio. Cuéntame un poco más de tu negocio para armar una propuesta.', fecha: '2026-08-06T16:05:00' },
          { autorId: 'u_negocio_cafe', texto: 'Genial, te escribo los detalles mañana con calma. ¡Gracias!', fecha: '2026-08-06T16:20:00' }
        ]
      },
      {
        id: 'conv3', participantes: ['u_sofia', 'u_mateo'], encargoId: null, deposito: null,
        noLeidoPara: [],
        mensajes: [
          { autorId: 'u_mateo', texto: 'Oye, vi tu ilustración en la comunidad, está buenísima.', fecha: '2026-08-09T20:00:00' },
          { autorId: 'u_sofia', texto: '¡Gracias Mateo! Vi que también compartiste tu landing page, quedó muy limpia.', fecha: '2026-08-09T20:12:00' }
        ]
      }
    ];

    guardar(CLAVES.USUARIOS, usuarios);
    guardar(CLAVES.ENCARGOS, encargos);
    guardar(CLAVES.POSTULACIONES, []);
    guardar(CLAVES.COMUNIDADES, comunidades);
    guardar(CLAVES.CURSOS, cursos);
    guardar(CLAVES.PROGRESO_CURSOS, {});
    guardar(CLAVES.NOTIFICACIONES, notificaciones);
    guardar(CLAVES.CONVERSACIONES, conversaciones);
    guardar(CLAVES.SEMILLA_CARGADA, true);
  }

  /**
   * Reinicia todos los datos de demostracion a su estado original.
   * Se usa desde configuracion.html para volver a dejar el prototipo
   * listo para otra demostracion.
   */
  function reiniciarDatosDemo() {
    Object.keys(CLAVES).forEach(function (k) {
      if (k !== 'SESION') localStorage.removeItem(CLAVES[k]);
    });
    cargarSemillaSiNoExiste();
  }

  /* ---------------------------------------------------------
     USUARIOS Y SESION
     --------------------------------------------------------- */
  function obtenerUsuarios() { return leer(CLAVES.USUARIOS, []); }
  function guardarUsuarios(lista) { guardar(CLAVES.USUARIOS, lista); }

  function obtenerUsuarioPorId(id) {
    return obtenerUsuarios().find(function (u) { return u.id === id; }) || null;
  }

  function obtenerUsuarioPorCorreoOUsuario(valor) {
    const v = (valor || '').trim().toLowerCase();
    return obtenerUsuarios().find(function (u) {
      return u.correo.toLowerCase() === v || u.usuario.toLowerCase() === v;
    }) || null;
  }

  /**
   * Devuelve la lista de usuarios que siguen a userId, calculada a
   * partir del arreglo "siguiendo" de cada usuario (no existe una
   * lista invertida separada).
   */
  function obtenerSeguidores(userId) {
    return obtenerUsuarios().filter(function (u) { return (u.siguiendo || []).includes(userId); });
  }

  /**
   * Agrega una valoracion real de un negocio hacia un talento y
   * recalcula el promedio mostrado en su perfil.
   */
  function agregarValoracion(talentoId, datosValoracion) {
    const usuarios = obtenerUsuarios();
    const talento = usuarios.find(function (u) { return u.id === talentoId; });
    if (!talento) return null;

    const nueva = Object.assign({ id: generarId('val'), fecha: new Date().toISOString() }, datosValoracion);
    const valoraciones = (talento.valoracionesRecibidas || []).concat([nueva]);
    const promedio = valoraciones.reduce(function (suma, v) { return suma + v.estrellas; }, 0) / valoraciones.length;

    return actualizarUsuario(talentoId, {
      valoracionesRecibidas: valoraciones,
      valoracion: Math.round(promedio * 10) / 10
    });
  }

  function actualizarUsuario(id, cambios) {
    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(function (u) { return u.id === id; });
    if (indice === -1) return null;
    usuarios[indice] = Object.assign({}, usuarios[indice], cambios);
    guardarUsuarios(usuarios);
    return usuarios[indice];
  }

  function crearUsuario(datos) {
    const usuarios = obtenerUsuarios();
    const nuevo = Object.assign({
      id: generarId('u'),
      nivel: 1,
      xp: 0,
      puntos: 0,
      premium: false,
      insignias: [],
      portafolio: [],
      valoracion: 0,
      encargosCompletados: 0,
      creadoEn: new Date().toISOString()
    }, datos);
    usuarios.push(nuevo);
    guardarUsuarios(usuarios);
    return nuevo;
  }

  function iniciarSesion(usuarioId, recordarme) {
    guardar(CLAVES.SESION, { usuarioId: usuarioId, recordarme: !!recordarme });
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVES.SESION);
  }

  function obtenerSesion() {
    return leer(CLAVES.SESION, null);
  }

  function obtenerUsuarioActual() {
    const sesion = obtenerSesion();
    if (!sesion) return null;
    return obtenerUsuarioPorId(sesion.usuarioId);
  }

  /**
   * Redirige a login.html si no hay una sesion activa. Debe llamarse
   * al inicio de cada pagina interna de la aplicacion (no en la landing
   * ni en login/registro).
   */
  function requerirSesion() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
      window.location.href = 'login.html';
      return null;
    }
    return usuario;
  }

  /* ---------------------------------------------------------
     SISTEMA DE XP Y NIVELES
     --------------------------------------------------------- */
  function calcularNivel(xpTotal) {
    return Math.floor(xpTotal / XP_POR_NIVEL) + 1;
  }

  function calcularProgresoNivel(xpTotal) {
    const xpEnNivel = xpTotal % XP_POR_NIVEL;
    return {
      nivel: calcularNivel(xpTotal),
      xpEnNivel: xpEnNivel,
      xpNecesario: XP_POR_NIVEL,
      xpFaltante: XP_POR_NIVEL - xpEnNivel,
      porcentaje: Math.round((xpEnNivel / XP_POR_NIVEL) * 100)
    };
  }

  /**
   * Otorga XP a un usuario, actualiza su nivel y genera las
   * notificaciones correspondientes. Devuelve informacion sobre si
   * el usuario subio de nivel, para poder mostrar una celebracion.
   */
  function otorgarXP(userId, cantidad, motivoTexto) {
    const usuario = obtenerUsuarioPorId(userId);
    if (!usuario) return null;

    const nivelAnterior = calcularNivel(usuario.xp);
    const xpNuevo = usuario.xp + cantidad;
    const nivelNuevo = calcularNivel(xpNuevo);

    actualizarUsuario(userId, { xp: xpNuevo, nivel: nivelNuevo });
    crearNotificacion(userId, 'Has conseguido ' + cantidad + ' XP' + (motivoTexto ? ' por ' + motivoTexto + '.' : '.'), 'xp');

    const subioNivel = nivelNuevo > nivelAnterior;
    if (subioNivel) {
      crearNotificacion(userId, 'Subiste al Nivel ' + nivelNuevo + '. ¡Sigue así!', 'nivel');
    }

    return { xpNuevo: xpNuevo, nivelNuevo: nivelNuevo, subioNivel: subioNivel };
  }

  /* ---------------------------------------------------------
     ENCARGOS Y POSTULACIONES
     --------------------------------------------------------- */
  function obtenerEncargos() { return leer(CLAVES.ENCARGOS, []); }
  function obtenerEncargoPorId(id) {
    return obtenerEncargos().find(function (e) { return e.id === id; }) || null;
  }
  function crearEncargo(datos) {
    const encargos = obtenerEncargos();
    const nuevo = Object.assign({ id: generarId('e'), estado: 'Abierto', publicadoEn: new Date().toISOString() }, datos);
    encargos.unshift(nuevo);
    guardar(CLAVES.ENCARGOS, encargos);
    return nuevo;
  }

  const LIMITE_ENCARGOS_ESTANDAR = 3;
  const COOLDOWN_ELIMINACION_MS = 24 * 60 * 60 * 1000;

  /**
   * Un encargo esta "vigente" si sigue abierto y su fecha limite
   * todavia no paso. Los encargos vencidos dejan de contar como
   * activos y dejan de mostrarse en el muro, aunque no se borran.
   */
  function estaEncargoVigente(encargo) {
    const hoy = new Date().toISOString().slice(0, 10);
    return encargo.estado === 'Abierto' && encargo.fechaLimite >= hoy;
  }

  /**
   * Cuenta cuantos "cupos" de encargo esta usando un negocio ahora
   * mismo: los encargos vigentes, mas los que elimino hace menos de
   * 24 horas (para evitar que borre y publique de inmediato).
   */
  function contarEncargosActivosNegocio(negocioId) {
    const encargos = obtenerEncargos().filter(function (e) { return e.autorId === negocioId; });
    const vigentes = encargos.filter(estaEncargoVigente).length;
    const enEnfriamiento = encargos.filter(function (e) {
      return e.estado === 'Eliminado' && e.eliminadoEn && (Date.now() - new Date(e.eliminadoEn).getTime()) < COOLDOWN_ELIMINACION_MS;
    }).length;
    return vigentes + enEnfriamiento;
  }

  /**
   * Elimina (de forma logica) un encargo publicado por un negocio.
   * El cupo que ocupaba se mantiene bloqueado 24 horas antes de
   * poder usarse para publicar un encargo nuevo.
   */
  function eliminarEncargo(id) {
    const encargos = obtenerEncargos();
    const encargo = encargos.find(function (e) { return e.id === id; });
    if (!encargo) return null;
    encargo.estado = 'Eliminado';
    encargo.eliminadoEn = new Date().toISOString();
    guardar(CLAVES.ENCARGOS, encargos);
    return encargo;
  }

  function obtenerPostulaciones() { return leer(CLAVES.POSTULACIONES, []); }
  function obtenerPostulacionesDeUsuario(userId) {
    return obtenerPostulaciones().filter(function (p) { return p.userId === userId; });
  }
  function crearPostulacion(datos) {
    const postulaciones = obtenerPostulaciones();
    const nueva = Object.assign({ id: generarId('post'), estado: 'Enviada', fecha: new Date().toISOString() }, datos);
    postulaciones.unshift(nueva);
    guardar(CLAVES.POSTULACIONES, postulaciones);
    return nueva;
  }
  function yaPostuloA(userId, encargoId) {
    return obtenerPostulaciones().some(function (p) { return p.userId === userId && p.encargoId === encargoId; });
  }

  /* ---------------------------------------------------------
     COMUNIDADES
     --------------------------------------------------------- */
  function obtenerComunidades() { return leer(CLAVES.COMUNIDADES, []); }
  function obtenerComunidadPorId(id) {
    return obtenerComunidades().find(function (c) { return c.id === id; }) || null;
  }
  function guardarComunidades(lista) { guardar(CLAVES.COMUNIDADES, lista); }

  function crearComunidad(datos) {
    const comunidades = obtenerComunidades();
    const nueva = Object.assign({ id: generarId('c'), miembros: 1, publicaciones: [] }, datos);
    comunidades.unshift(nueva);
    guardarComunidades(comunidades);
    return nueva;
  }

  function ajustarMiembrosComunidad(comunidadId, delta) {
    const comunidades = obtenerComunidades();
    const comunidad = comunidades.find(function (c) { return c.id === comunidadId; });
    if (!comunidad) return null;
    comunidad.miembros = Math.max(0, (comunidad.miembros || 0) + delta);
    guardarComunidades(comunidades);
    return comunidad.miembros;
  }

  function agregarPublicacion(comunidadId, publicacion) {
    const comunidades = obtenerComunidades();
    const comunidad = comunidades.find(function (c) { return c.id === comunidadId; });
    if (!comunidad) return null;
    const nueva = Object.assign({ id: generarId('pub'), likesBase: 0, likedBy: [], comentarios: [], fecha: new Date().toISOString() }, publicacion);
    comunidad.publicaciones.unshift(nueva);
    guardarComunidades(comunidades);
    return nueva;
  }

  function agregarComentario(comunidadId, publicacionId, comentario) {
    const comunidades = obtenerComunidades();
    const comunidad = comunidades.find(function (c) { return c.id === comunidadId; });
    if (!comunidad) return null;
    const publicacion = comunidad.publicaciones.find(function (p) { return p.id === publicacionId; });
    if (!publicacion) return null;
    publicacion.comentarios.push(comentario);
    guardarComunidades(comunidades);
    return publicacion;
  }

  function reaccionarPublicacion(comunidadId, publicacionId, userId) {
    const comunidades = obtenerComunidades();
    const comunidad = comunidades.find(function (c) { return c.id === comunidadId; });
    if (!comunidad) return null;
    const publicacion = comunidad.publicaciones.find(function (p) { return p.id === publicacionId; });
    if (!publicacion) return null;

    if (!publicacion.likedBy) publicacion.likedBy = [];
    const yaLeGusta = publicacion.likedBy.includes(userId);

    if (yaLeGusta) {
      publicacion.likedBy = publicacion.likedBy.filter(function (id) { return id !== userId; });
    } else {
      publicacion.likedBy.push(userId);
    }

    guardarComunidades(comunidades);
    return {
      total: (publicacion.likesBase || 0) + publicacion.likedBy.length,
      leGusta: !yaLeGusta
    };
  }

  /* ---------------------------------------------------------
     CURSOS / CENTRO DE APRENDIZAJE
     --------------------------------------------------------- */
  function obtenerCursos() { return leer(CLAVES.CURSOS, []); }
  function obtenerCursoPorId(id) {
    return obtenerCursos().find(function (c) { return c.id === id; }) || null;
  }
  function obtenerProgresoCursos() { return leer(CLAVES.PROGRESO_CURSOS, {}); }
  function marcarCursoCompletado(cursoId) {
    const progreso = obtenerProgresoCursos();
    progreso[cursoId] = true;
    guardar(CLAVES.PROGRESO_CURSOS, progreso);
  }
  function cursoEstaCompletado(cursoId) {
    return !!obtenerProgresoCursos()[cursoId];
  }

  /* ---------------------------------------------------------
     NOTIFICACIONES
     --------------------------------------------------------- */
  function obtenerNotificaciones(userId) {
    return leer(CLAVES.NOTIFICACIONES, []).filter(function (n) { return n.userId === userId; })
      .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }
  function crearNotificacion(userId, texto, tipo) {
    const notificaciones = leer(CLAVES.NOTIFICACIONES, []);
    notificaciones.unshift({ id: generarId('n'), userId: userId, texto: texto, tipo: tipo, leida: false, fecha: new Date().toISOString() });
    guardar(CLAVES.NOTIFICACIONES, notificaciones);
  }
  function contarNoLeidas(userId) {
    return obtenerNotificaciones(userId).filter(function (n) { return !n.leida; }).length;
  }
  function marcarNotificacionLeida(id) {
    const notificaciones = leer(CLAVES.NOTIFICACIONES, []);
    const notificacion = notificaciones.find(function (n) { return n.id === id; });
    if (notificacion) notificacion.leida = true;
    guardar(CLAVES.NOTIFICACIONES, notificaciones);
  }
  function marcarTodasLeidas(userId) {
    const notificaciones = leer(CLAVES.NOTIFICACIONES, []);
    notificaciones.forEach(function (n) { if (n.userId === userId) n.leida = true; });
    guardar(CLAVES.NOTIFICACIONES, notificaciones);
  }

  /* ---------------------------------------------------------
     MENSAJES / CONVERSACIONES DIRECTAS
     --------------------------------------------------------- */
  function obtenerConversaciones(userId) {
    return leer(CLAVES.CONVERSACIONES, []).filter(function (c) { return c.participantes.includes(userId); })
      .sort(function (a, b) {
        const fechaA = a.mensajes.length ? a.mensajes[a.mensajes.length - 1].fecha : 0;
        const fechaB = b.mensajes.length ? b.mensajes[b.mensajes.length - 1].fecha : 0;
        return new Date(fechaB) - new Date(fechaA);
      });
  }

  function obtenerConversacionPorId(id) {
    return leer(CLAVES.CONVERSACIONES, []).find(function (c) { return c.id === id; }) || null;
  }

  /**
   * Busca (o crea si no existe) la conversacion entre dos usuarios,
   * opcionalmente asociada a un encargo. Se usa por ejemplo al pulsar
   * "Contactar" desde un perfil publico.
   */
  function obtenerOCrearConversacion(userIdA, userIdB, encargoId) {
    const conversaciones = leer(CLAVES.CONVERSACIONES, []);
    let conversacion = conversaciones.find(function (c) {
      return c.participantes.includes(userIdA) && c.participantes.includes(userIdB) && (!encargoId || c.encargoId === encargoId);
    });
    if (conversacion) return conversacion;

    conversacion = { id: generarId('conv'), participantes: [userIdA, userIdB], encargoId: encargoId || null, deposito: null, noLeidoPara: [], mensajes: [] };
    conversaciones.unshift(conversacion);
    guardar(CLAVES.CONVERSACIONES, conversaciones);
    return conversacion;
  }

  function agregarMensaje(conversacionId, autorId, texto) {
    const conversaciones = leer(CLAVES.CONVERSACIONES, []);
    const conversacion = conversaciones.find(function (c) { return c.id === conversacionId; });
    if (!conversacion) return null;

    conversacion.mensajes.push({ autorId: autorId, texto: texto, fecha: new Date().toISOString() });
    const otroParticipante = conversacion.participantes.find(function (id) { return id !== autorId; });
    if (otroParticipante && !conversacion.noLeidoPara.includes(otroParticipante)) {
      conversacion.noLeidoPara.push(otroParticipante);
    }
    guardar(CLAVES.CONVERSACIONES, conversaciones);
    return conversacion;
  }

  function marcarConversacionLeida(conversacionId, userId) {
    const conversaciones = leer(CLAVES.CONVERSACIONES, []);
    const conversacion = conversaciones.find(function (c) { return c.id === conversacionId; });
    if (!conversacion) return;
    conversacion.noLeidoPara = conversacion.noLeidoPara.filter(function (id) { return id !== userId; });
    guardar(CLAVES.CONVERSACIONES, conversaciones);
  }

  function contarConversacionesNoLeidas(userId) {
    return obtenerConversaciones(userId).filter(function (c) { return c.noLeidoPara.includes(userId); }).length;
  }

  /**
   * Simula el deposito protegido de un encargo dentro de una conversacion.
   * El dinero queda "protegido" y solo se marca como liberado cuando el
   * negocio confirma que el encargo fue completado.
   */
  function registrarDepositoConversacion(conversacionId, monto) {
    const conversaciones = leer(CLAVES.CONVERSACIONES, []);
    const conversacion = conversaciones.find(function (c) { return c.id === conversacionId; });
    if (!conversacion) return null;
    conversacion.deposito = { estado: 'protegido', monto: monto };
    guardar(CLAVES.CONVERSACIONES, conversaciones);
    return conversacion;
  }

  function liberarDepositoConversacion(conversacionId) {
    const conversaciones = leer(CLAVES.CONVERSACIONES, []);
    const conversacion = conversaciones.find(function (c) { return c.id === conversacionId; });
    if (!conversacion || !conversacion.deposito) return null;
    conversacion.deposito.estado = 'liberado';
    guardar(CLAVES.CONVERSACIONES, conversaciones);
    return conversacion;
  }

  /* ---------------------------------------------------------
     FORMATO Y AYUDAS GENERALES
     --------------------------------------------------------- */
  function formatearFechaRelativa(fechaISO) {
    const diferenciaMs = Date.now() - new Date(fechaISO).getTime();
    const minutos = Math.floor(diferenciaMs / 60000);
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return 'Hace ' + minutos + ' min';
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return 'Hace ' + horas + (horas === 1 ? ' hora' : ' horas');
    const dias = Math.floor(horas / 24);
    if (dias < 30) return 'Hace ' + dias + (dias === 1 ? ' día' : ' días');
    return new Date(fechaISO).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function urlAvatar(seed) {
    return 'https://api.dicebear.com/7.x/notionists/svg?seed=' + encodeURIComponent(seed || 'TalentHub') + '&backgroundColor=f1eeff';
  }

  /* API publica del modulo */
  return {
    CLAVES: CLAVES,
    XP_ACCIONES: XP_ACCIONES,
    init: cargarSemillaSiNoExiste,
    reiniciarDatosDemo: reiniciarDatosDemo,
    generarId: generarId,

    obtenerUsuarios: obtenerUsuarios,
    obtenerUsuarioPorId: obtenerUsuarioPorId,
    obtenerUsuarioPorCorreoOUsuario: obtenerUsuarioPorCorreoOUsuario,
    obtenerSeguidores: obtenerSeguidores,
    agregarValoracion: agregarValoracion,
    actualizarUsuario: actualizarUsuario,
    crearUsuario: crearUsuario,

    iniciarSesion: iniciarSesion,
    cerrarSesion: cerrarSesion,
    obtenerSesion: obtenerSesion,
    obtenerUsuarioActual: obtenerUsuarioActual,
    requerirSesion: requerirSesion,

    calcularNivel: calcularNivel,
    calcularProgresoNivel: calcularProgresoNivel,
    otorgarXP: otorgarXP,

    obtenerEncargos: obtenerEncargos,
    obtenerEncargoPorId: obtenerEncargoPorId,
    crearEncargo: crearEncargo,
    estaEncargoVigente: estaEncargoVigente,
    contarEncargosActivosNegocio: contarEncargosActivosNegocio,
    eliminarEncargo: eliminarEncargo,
    LIMITE_ENCARGOS_ESTANDAR: LIMITE_ENCARGOS_ESTANDAR,
    obtenerPostulaciones: obtenerPostulaciones,
    obtenerPostulacionesDeUsuario: obtenerPostulacionesDeUsuario,
    crearPostulacion: crearPostulacion,
    yaPostuloA: yaPostuloA,

    obtenerComunidades: obtenerComunidades,
    obtenerComunidadPorId: obtenerComunidadPorId,
    crearComunidad: crearComunidad,
    ajustarMiembrosComunidad: ajustarMiembrosComunidad,
    agregarPublicacion: agregarPublicacion,
    agregarComentario: agregarComentario,
    reaccionarPublicacion: reaccionarPublicacion,

    obtenerCursos: obtenerCursos,
    obtenerCursoPorId: obtenerCursoPorId,
    marcarCursoCompletado: marcarCursoCompletado,
    cursoEstaCompletado: cursoEstaCompletado,

    obtenerNotificaciones: obtenerNotificaciones,
    crearNotificacion: crearNotificacion,
    contarNoLeidas: contarNoLeidas,
    marcarNotificacionLeida: marcarNotificacionLeida,
    marcarTodasLeidas: marcarTodasLeidas,

    obtenerConversaciones: obtenerConversaciones,
    obtenerConversacionPorId: obtenerConversacionPorId,
    obtenerOCrearConversacion: obtenerOCrearConversacion,
    agregarMensaje: agregarMensaje,
    marcarConversacionLeida: marcarConversacionLeida,
    contarConversacionesNoLeidas: contarConversacionesNoLeidas,
    registrarDepositoConversacion: registrarDepositoConversacion,
    liberarDepositoConversacion: liberarDepositoConversacion,

    formatearFechaRelativa: formatearFechaRelativa,
    urlAvatar: urlAvatar
  };
})();

/* Carga la semilla de datos apenas se lee este archivo, en cualquier pagina */
TH.init();
