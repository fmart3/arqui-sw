const { iniciarMenuSesion } = require('./login');

async function main() {
  try {
    console.log('\n--- Sistema de Urgencias - Inicio de Sesión - Recepción de Pacientes ---');
    iniciarMenuSesion();
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
}

main();
