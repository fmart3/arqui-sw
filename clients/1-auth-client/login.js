const { pregunta, cerrarInput } = require('./inputHandler');
const { enviarAlBus } = require('./configClient');
const { admissionMenu } = require('./admission');

const servicio = 'login'; // Servicio específico para login

async function iniciarMenuSesion() {
  console.log('\n1. Iniciar sesión');
  //console.log('2. Registrar usuario');
  console.log('9. Cerrar programa');
  const opcion = await pregunta('\nSeleccione una opción: ');

  switch (opcion.trim()) {
    case '1':
      const login = await iniciarSesion();
      if (login) {
        await admissionMenu(login);
        console.log('\nSesión cerrada. Volviendo al inicio de sesión...');
        await iniciarMenuSesion();
      } else {
        await iniciarMenuSesion();
      }
      break;
    case '123456':
      const registrar = await registrarUsuario();
      if (registrar) {
        console.log('Usuario registrado. Inicie sesión para continuar.');
        await iniciarMenuSesion();
      } else {
        await iniciarMenuSesion();
      }
      break;
    case '9':
      cerrarInput();
      process.exit(0);
    default:
      console.log('\nOpción no válida.');
      await iniciarMenuSesion();
  }
}

async function iniciarSesion() {
  try {
    const rut = await pregunta('Ingrese su RUT (sin puntos ni guión): ');
    const password = await pregunta('Ingrese su contraseña: ');

    const contenido = await enviarAlBus(servicio, { rut, password });
    const estado = contenido[0]; // Primer carácter después de estado

    if (estado === '1') {
      //console.clear();
      user = JSON.parse(contenido.substring(1))
      console.log('Inicio de sesión exitoso.');
      return user;
    } else {
      //console.clear();
      console.log('Inicio de sesión fallido. Por favor, intente nuevamente.');
      return false;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    return false;
  }
}

async function registrarUsuario() {
  try {
    console.log('\n--- Registrar Usuario ---\n');

    const rut = await pregunta('Ingrese su RUT (sin puntos ni guión): ');
    const nombres = await pregunta('Ingrese su(s) nombres: ');
    const apellido_paterno = await pregunta('Ingrese su apellido paterno: ');
    const apellido_materno = await pregunta('Ingrese su apellido materno: ');
    const cargo = 'admision'; // Cargo fijo para usuarios que realizan admisión
    const password = await pregunta('Ingrese su contraseña: ');
    const confirmarPassword = await pregunta('Confirme su contraseña: ');

    if (password !== confirmarPassword) {
      console.log('\nLas contraseñas no coinciden. Intente nuevamente.\n');
      return false;
    }

    // Enviar datos al bus
    const respuesta = await enviarAlBus(servicio, {
      accion: 'registrar',
      usuario: {
        rut,
        nombres,
        apellido_paterno,
        apellido_materno,
        cargo,
        password,
      },
    });

    if (respuesta.startsWith('1')) {
      const usuarioRegistrado = JSON.parse(respuesta.slice(1));
      console.log('Usuario registrado exitosamente:', usuarioRegistrado);
      return usuarioRegistrado;
    } else {
      console.log('Error al registrar usuario:', respuesta.slice(1));
      return false;
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    return false;
  }
}

module.exports = {
  iniciarMenuSesion,
};
