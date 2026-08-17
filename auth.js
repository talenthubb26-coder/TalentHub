/* =========================================================
   TALENTHUB - AUTH.JS
   Logica de registro.html y login.html. La autenticacion es
   simulada: no existe servidor, todo se guarda y se valida
   contra localStorage a traves de store.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  inicializarAlternarClave();

  if (document.getElementById('form-registro')) inicializarRegistro();
  if (document.getElementById('form-login')) inicializarLogin();
});

/**
 * Conecta los botones de "ojo" que muestran u ocultan el contenido
 * de un campo de contraseña, presentes tanto en registro como en login.
 */
function inicializarAlternarClave() {
  document.querySelectorAll('.auth-alternar-clave').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const campo = document.getElementById(boton.getAttribute('data-alternar'));
      if (!campo) return;
      const mostrando = campo.type === 'text';
      campo.type = mostrando ? 'password' : 'text';
      boton.innerHTML = '<svg width="18" height="18"><use href="assets/icons/sprite.svg#' + (mostrando ? 'icon-eye' : 'icon-eye-off') + '"></use></svg>';
    });
  });
}

/* ---------------------------------------------------------
   REGISTRO
   --------------------------------------------------------- */
function inicializarRegistro() {
  const form = document.getElementById('form-registro');
  const tabTalento = document.getElementById('tab-talento');
  const tabNegocio = document.getElementById('tab-negocio');
  const campoEdad = document.getElementById('reg-edad');
  const avisoMenor = document.getElementById('aviso-menor');
  const avisoPlan = document.getElementById('aviso-plan-premium');

  const parametros = new URLSearchParams(window.location.search);
  let tipoCuenta = parametros.get('tipo') === 'negocio' ? 'negocio' : 'talento';
  const planSolicitado = parametros.get('plan');

  if (planSolicitado === 'plus') avisoPlan.classList.remove('oculto');

  function aplicarTipoCuenta(tipo) {
    tipoCuenta = tipo;
    tabTalento.classList.toggle('activo', tipo === 'talento');
    tabNegocio.classList.toggle('activo', tipo === 'negocio');

    document.getElementById('campo-nombre-empresa').classList.toggle('oculto', tipo !== 'negocio');
    document.getElementById('campo-categoria-empresa').classList.toggle('oculto', tipo !== 'negocio');
    document.getElementById('campo-edad').classList.toggle('oculto', tipo !== 'talento');
    document.getElementById('campo-talentos').classList.toggle('oculto', tipo !== 'talento');
    if (tipo !== 'talento') avisoMenor.classList.add('oculto');
  }

  tabTalento.addEventListener('click', function () { aplicarTipoCuenta('talento'); });
  tabNegocio.addEventListener('click', function () { aplicarTipoCuenta('negocio'); });
  aplicarTipoCuenta(tipoCuenta);

  campoEdad.addEventListener('input', function () {
    const edad = parseInt(campoEdad.value, 10);
    avisoMenor.classList.toggle('oculto', !(edad > 0 && edad < 18));
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const datos = {
      nombre: document.getElementById('reg-nombre').value.trim(),
      usuario: document.getElementById('reg-usuario').value.trim(),
      correo: document.getElementById('reg-correo').value.trim(),
      clave: document.getElementById('reg-clave').value,
      clave2: document.getElementById('reg-clave2').value,
      ciudad: document.getElementById('reg-ciudad').value.trim(),
      terminos: document.getElementById('reg-terminos').checked
    };

    let valido = true;
    valido = validar('reg-nombre', datos.nombre.length >= 3) && valido;
    valido = validar('reg-usuario', datos.usuario.length >= 4 && !/\s/.test(datos.usuario)) && valido;
    valido = validar('reg-correo', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) && valido;
    valido = validar('reg-clave', datos.clave.length >= 6) && valido;
    valido = validar('reg-clave2', datos.clave2 === datos.clave && datos.clave.length > 0) && valido;
    valido = validar('campo-ciudad', datos.ciudad.length >= 2, true) && valido;

    let edad = null;
    if (tipoCuenta === 'talento') {
      edad = parseInt(campoEdad.value, 10);
      valido = validar('campo-edad', edad >= 14 && edad <= 99, true) && valido;
    } else {
      valido = validar('campo-nombre-empresa', document.getElementById('reg-empresa').value.trim().length >= 2, true) && valido;
    }

    const errorTerminos = document.getElementById('error-terminos');
    if (!datos.terminos) {
      errorTerminos.style.display = 'block';
      valido = false;
    } else {
      errorTerminos.style.display = 'none';
    }

    if (TH.obtenerUsuarioPorCorreoOUsuario(datos.correo) || TH.obtenerUsuarioPorCorreoOUsuario(datos.usuario)) {
      validar('reg-correo', false);
      document.querySelector('#reg-correo + .th-error').textContent = 'Ese correo o usuario ya está registrado. Prueba con otro o inicia sesión.';
      valido = false;
    }

    if (!valido) return;

    let usuarioCreado;
    if (tipoCuenta === 'talento') {
      usuarioCreado = TH.crearUsuario({
        tipo: 'talento',
        nombre: datos.nombre,
        usuario: datos.usuario,
        correo: datos.correo,
        password: datos.clave,
        edad: edad,
        esMenor: edad < 18,
        ciudad: datos.ciudad,
        talentos: document.getElementById('reg-talentos').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        bio: '',
        disponibilidad: 'Disponible',
        avatarSeed: datos.usuario,
        premium: planSolicitado === 'plus'
      });
    } else {
      usuarioCreado = TH.crearUsuario({
        tipo: 'negocio',
        nombre: datos.nombre,
        usuario: datos.usuario,
        correo: datos.correo,
        password: datos.clave,
        ciudad: datos.ciudad,
        nombreEmpresa: document.getElementById('reg-empresa').value.trim(),
        categoriaEmpresa: document.getElementById('reg-categoria').value,
        bio: '',
        avatarSeed: datos.usuario,
        verificada: false
      });
    }

    TH.iniciarSesion(usuarioCreado.id, true);
    document.getElementById('texto-nombre-exito').textContent = datos.nombre.split(' ')[0];
    THUI.abrirModal('modal-exito-registro');

    setTimeout(function () {
      window.location.href = tipoCuenta === 'negocio' ? 'negocio.html' : 'dashboard.html';
    }, 1600);
  });

  function validar(idCampoOContenedor, condicion, esContenedor) {
    const contenedor = esContenedor ? document.getElementById(idCampoOContenedor) : document.getElementById(idCampoOContenedor).closest('.th-campo');
    if (contenedor) contenedor.classList.toggle('th-campo--error', !condicion);
    return condicion;
  }
}

/* ---------------------------------------------------------
   LOGIN
   --------------------------------------------------------- */
function inicializarLogin() {
  const form = document.getElementById('form-login');
  const botonPrueba = document.getElementById('btn-usuario-prueba');
  const enlaceOlvidada = document.getElementById('enlace-clave-olvidada');

  if (botonPrueba) {
    botonPrueba.addEventListener('click', function () {
      document.getElementById('log-correo').value = 'sofia@talenthub.pe';
      document.getElementById('log-clave').value = 'talenthub123';
      THUI.mostrarToast('Datos de la cuenta de prueba completados. Presiona "Ingresar".', 'info');
    });
  }

  if (enlaceOlvidada) {
    enlaceOlvidada.addEventListener('click', function (evento) {
      evento.preventDefault();
      THUI.abrirModal('modal-clave-olvidada');
    });
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const valorCorreo = document.getElementById('log-correo').value.trim();
    const clave = document.getElementById('log-clave').value;
    const recordarme = document.getElementById('log-recordarme').checked;

    const usuario = TH.obtenerUsuarioPorCorreoOUsuario(valorCorreo);
    const campoCorreo = document.getElementById('log-correo').closest('.th-campo');
    const campoClave = document.getElementById('log-clave').closest('.th-campo');

    campoCorreo.classList.remove('th-campo--error');
    campoClave.classList.remove('th-campo--error');

    if (!usuario) {
      campoCorreo.classList.add('th-campo--error');
      return;
    }
    if (usuario.password !== clave) {
      campoClave.classList.add('th-campo--error');
      return;
    }

    TH.iniciarSesion(usuario.id, recordarme);
    THUI.mostrarToast('Bienvenido de nuevo, ' + usuario.nombre.split(' ')[0] + '.', 'exito');

    setTimeout(function () {
      window.location.href = usuario.tipo === 'negocio' ? 'negocio.html' : 'dashboard.html';
    }, 500);
  });
}
