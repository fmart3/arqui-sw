const { pregunta, cerrarInput } = require('./inputHandler');
const { enviarAlBus } = require('./configClient');
const { admissionMenu } = require('./admission');

const servicio = 'login'; // Servicio específico para login

async function iniciarMenuSesion() {
  console.log('\n1. Iniciar sesión');
  console.log('9. Cerrar programa');
  const opcion = await pregunta('\nSeleccione una opción: ');

  switch (opcion.trim()) {
    case '1':
      const user = await iniciarSesion();
      if (user) {
        admissionMenu(user);
      } else {
        iniciarMenuSesion(); // Vuelve al menú si el login falla
      }
      break;
    case '9':
      cerrarInput();
      process.exit(0);
    default:
      console.log('\nOpción no válida.');
      iniciarMenuSesion();
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

module.exports = {
  iniciarMenuSesion,
};
