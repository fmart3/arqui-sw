const readline = require('readline');
const { enviarAlBus } = require('./configClient');

const servicio = 'login'; // Servicio específico para login

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '',
});

function pregunta(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      clearLastLine();
      resolve(answer);
    });
  });
}

async function iniciarSesion() {
  try {
    const rut = await pregunta('Ingrese su RUT (sin puntos ni guión): ');
    const password = await pregunta('Ingrese su contraseña: ');

    const contenido = await enviarAlBus(servicio, {rut, password });

    const loginResultado = contenido[0]; // Primer carácter después de estado
    if (loginResultado === '1') {
      //console.clear();
      console.log('Inicio de sesión exitoso.\n');
      return true;
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

function iniciarMenuSesion() {
  console.log('\n1. Iniciar sesión');
  console.log('9. Cerrar programa');
  rl.question('\nSeleccione una opción: ', async (opcion) => {
    clearLastLine();
    switch (opcion.trim()) {
      case '1':
        const loginSuccess = await iniciarSesion();
        if (loginSuccess) {
          console.log('Acceso concedido. Aquí iría la lógica para el menú principal.');
          iniciarMenuSesion(); // Por ahora, vuelve al menú de inicio de sesión
        } else {
          iniciarMenuSesion();
        }
        break;
      case '9':
        salir();
        break;
      default:
        console.log('\nOpción no válida.');
        iniciarMenuSesion();
    }
  });
}

function salir() {
  console.log('\nCerrando el programa...');
  rl.close();
  process.exit(0);
}

function clearLastLine() {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
}

module.exports = {
  iniciarMenuSesion,
};
