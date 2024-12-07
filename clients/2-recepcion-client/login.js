const { pregunta, cerrarInput } = require('./inputHandler');
const { client } = require('./configClient');
const { recepcionMenu } = require('./app');

const SERVICIO = 'auth0';
const cargo = 'tens';

async function iniciarMenuSesion() {
  while (true) {
    console.log('\n1. Iniciar sesión');
    console.log('9. Cerrar programa');

    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1':
        const login = await iniciarSesion();
        if (login) {
          console.log(`\n¡Bienvenido(a), ${login.nombres} ${login.apellido_paterno}!`);
          await recepcionMenu(login);
          console.log('\nSesión cerrada. Volviendo al inicio de sesión...');
        }
        break;

      case '123456': // Registro temporal para pruebas
        const registrar = await registrarUsuario();
        if (registrar) {
          console.clear();
          console.log('Usuario registrado exitosamente. Inicie sesión para continuar.');
        }
        break;

      case '9':
        cerrarInput();
        return;

      default:
        console.clear();
        console.log('Opción no válida. Intente nuevamente.');
    }
  }
}

async function iniciarSesion() {
  try {
    const rut = await pregunta('Ingrese su RUT (sin puntos ni guión): ');
    const password = await pregunta('Ingrese su contraseña: ');

    const respuesta = await client(SERVICIO, {accion: 'autenticar', contenido: {rut, password, cargo }});

    if (respuesta.status === 1) {
      console.clear();
      console.log('\nInicio de sesión exitoso.');
      return respuesta.contenido;
    } else {
      console.log(`\nInicio de sesión fallido. Intente nuevamente.`);
      return null;
    }
  } catch (error) {
    console.error(`Error al iniciar sesión: ${error.message}`);
    console.clear();
    console.log('\nInicio de sesión fallido. Verifique sus credenciales.');
    return null;
  }
}

async function registrarUsuario() {
  try {
    console.log('\n--- Registrar Usuario ---\n');
    const usuario = {
      rut: await pregunta('Ingrese su RUT (sin puntos ni guión): '),
      nombres: await pregunta('Ingrese su(s) nombres: '),
      apellido_paterno: await pregunta('Ingrese su apellido paterno: '),
      apellido_materno: await pregunta('Ingrese su apellido materno: '),
      cargo: cargo,
      password: await pregunta('Ingrese su contraseña: '),
    };

    const confirmarPassword = await pregunta('Confirme su contraseña: ');
    if (usuario.password !== confirmarPassword) {
      console.clear();
      console.log('\nLas contraseñas no coinciden. Intente nuevamente.\n');
      return false;
    }

    const respuesta = await client(SERVICIO, { accion: 'registrar', contenido: usuario });

    if (respuesta.status === 1) {
      //console.log('Usuario registrado exitosamente:', respuesta);
      return true;
    } else {
      console.log(`\nError al registrar usuario: ${respuesta.contenido || 'Intente nuevamente más tarde.'}`);
      return false;
    }
  } catch (error) {
    console.error(`Error al registrar usuario: ${error.message}`);
    return false;
  }
}

module.exports = {
  iniciarMenuSesion,
};
