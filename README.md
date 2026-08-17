# TalentHub - Landing Page y Prototipo Web

Proyecto desarrollado para el concurso Crea y Emprende 2026 del Ministerio de Educacion del Peru.

TalentHub es una plataforma que ayuda a jovenes peruanos de 14 a 25 anos a convertir su talento en un portafolio profesional, conseguir clientes reales y generar ingresos de forma segura. Este repositorio contiene dos partes:

1. **La landing page publica** (`index.html`): la carta de presentacion del proyecto.
2. **El prototipo funcional de la aplicacion**: el producto que una persona usaria despues de registrarse (dashboard, perfil, muro de encargos, comunidades, aprendizaje, y mas).

No existe backend real. Todo el prototipo funciona con JavaScript y `localStorage`, cargado con datos de demostracion realistas para que pueda recorrerse de principio a fin sin configuracion previa.

## Estructura del proyecto

```
talenthub/
├── index.html                 Landing publica
├── registro.html               Registro (talento o negocio)
├── login.html                  Inicio de sesion simulado
├── dashboard.html               Inicio del talento (nivel, XP, recomendaciones)
├── perfil.html                  Perfil, portafolio y personalizacion
├── muro.html                    Muro de encargos con filtros y busqueda
├── encargo.html                 Detalle de un encargo y postulacion
├── comunidades.html             Listado de comunidades
├── comunidad.html               Vista interna de una comunidad (canales, posts)
├── aprendizaje.html             Centro de aprendizaje
├── notificaciones.html          Notificaciones
├── configuracion.html           Configuracion de cuenta y privacidad
├── negocio.html                 Panel para cuentas de negocio
├── publicar-encargo.html        Formulario para publicar un encargo
├── README.md
├── css/
│   ├── styles.css                Variables de marca e identidad visual (landing y app)
│   ├── app.css                   Shell compartido: sidebar, topbar, modales, tarjetas
│   ├── auth.css                  Login y registro
│   └── dashboard.css, perfil.css, muro.css, comunidades.css, aprendizaje.css
├── js/
│   ├── store.js                  Capa de datos: usuarios, encargos, XP, localStorage
│   ├── ui.js                     Modales y notificaciones flotantes reutilizables
│   ├── shell.js                  Sidebar, topbar y navegacion movil compartidos
│   ├── auth.js                   Registro e inicio de sesion
│   ├── dashboard.js, perfil.js, muro.js, encargo.js, comunidades.js, comunidad.js,
│   │   aprendizaje.js, notificaciones.js, configuracion.js, negocio.js, publicar-encargo.js
│   └── main.js, form.js          Logica propia de la landing publica
└── assets/
    ├── img/                      Ilustraciones, mascota y fotografia del hero
    ├── icons/                    Sprite SVG con todos los iconos de interfaz
    └── logo/                     Logo de TalentHub (version clara y oscura)
```

## Como previsualizar el proyecto

Se recomienda levantar un servidor local (necesario para que `localStorage` y las rutas entre paginas funcionen de forma consistente):

```
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador. Tambien puedes usar `npx serve .` si prefieres Node.

## Como desplegarlo gratis

Al ser HTML, CSS y JavaScript puro, puedes publicarlo en Netlify, Vercel o GitHub Pages arrastrando la carpeta o conectando el repositorio, sin pasos de compilacion.

## Cuenta de prueba

En `login.html` existe un boton **"Toca aqui para usar la cuenta de prueba"** que autocompleta:

- Usuario: `sofia@talenthub.pe`
- Contraseña: `talenthub123`

Tambien puedes registrar una cuenta nueva (de talento o de negocio) desde `registro.html`; los datos quedan guardados en el navegador.

## Que funcionalidades estan implementadas

- **Autenticacion simulada**: registro con dos tipos de cuenta (talento o negocio), aviso visual de seguridad para menores de edad, inicio de sesion, cierre de sesion y proteccion de rutas internas (si no hay sesion activa, se redirige a `login.html`).
- **Sistema de XP y niveles**: barra de progreso, calculo automatico de nivel, XP otorgado por completar el perfil, publicar el primer proyecto, postularse a un encargo, participar en comunidades y completar recursos de aprendizaje, con notificacion de subida de nivel.
- **Perfil y portafolio**: edicion de datos, agregar proyectos al portafolio, insignias, marcos de avatar (algunos bloqueados por nivel, puntos o plan Premium), plan Estandar/Plus con modal de "proximamente", boton de "ver anuncio" que simula ganar puntos.
- **Muro de encargos**: busqueda y filtros combinables por categoria, modalidad, presupuesto y nivel recomendado.
- **Detalle de encargo y postulacion**: modal de postulacion con mensaje y seleccion de un proyecto del portafolio, confirmacion visual y XP.
- **Comunidades**: creacion de comunidades, union/salida, publicaciones, comentarios, reacciones y reporte de publicaciones con motivo y evidencia (demostrativo).
- **Centro de aprendizaje**: 7 recursos con contenido simulado, progreso y recompensa de XP al completarlos.
- **Notificaciones**: listado, marcado individual y masivo como leidas.
- **Configuracion**: datos basicos, cambio de contraseña (simulado), privacidad, notificaciones, seccion de seguridad para menores, bloqueo de usuarios y boton para restablecer los datos de demostracion.
- **Cuentas de negocio**: panel propio, publicacion de encargos, revision de postulantes, explorador y guardado de talentos.

## Que es simulado mediante localStorage

Todo. No hay backend, base de datos ni servidor de autenticacion real:

- Usuarios, contraseñas y sesion activa.
- Encargos, postulaciones y su estado.
- Comunidades, publicaciones, comentarios y reacciones.
- Progreso del centro de aprendizaje y XP.
- Notificaciones, puntos, insignias y marcos de avatar desbloqueados.

Desde **Configuracion → Datos del prototipo** se puede restablecer toda la informacion a su estado original en cualquier momento (util antes de una nueva demostracion).

## Recorrido recomendado para la demostracion

1. Abrir la landing (`index.html`) y mostrar la propuesta de valor.
2. Pulsar **"Comenzar gratis"** y registrar una cuenta de tipo **Joven/Talento** con una edad menor de 18 para mostrar el aviso de seguridad para menores.
3. Ver la redireccion automatica al **Dashboard**: nivel, XP, encargos y comunidades recomendadas.
4. Entrar a **Perfil**, editar la biografia (se gana XP) y agregar un proyecto al portafolio (se gana mas XP y puede subir de nivel).
5. Ir al **Muro de encargos**, aplicar un filtro y abrir el detalle de un encargo.
6. Postularse al encargo (mensaje + proyecto del portafolio) y ver la confirmacion.
7. Entrar a **Comunidades**, unirse a una y publicar un comentario dentro de ella.
8. Abrir el **Centro de aprendizaje**, completar un recurso y ver el mensaje de logro.
9. Revisar **Notificaciones** y la seccion **Premium** dentro de Perfil → Personalizacion.
10. Cerrar sesion, volver a `login.html` e iniciar sesion como **Negocio** (registra una cuenta nueva eligiendo "Negocio/Emprendimiento") para mostrar `negocio.html`, publicar un encargo y revisar postulantes.

## Notas de diseño

- La identidad visual (colores, tipografia, logo y mascota) es exactamente la misma que la de la landing original; no se modifico sin motivo.
- La mascota (gato espacial) aparece de forma puntual: pantallas vacias, bienvenida en registro y login, y mensajes de logro, nunca como decoracion repetida.
- Los iconos son SVG propios (sin emojis), reunidos en `assets/icons/sprite.svg`.
- El shell de la aplicacion (sidebar, topbar y navegacion movil) se genera desde `js/shell.js` para evitar duplicar el mismo bloque de HTML en cada pagina.
