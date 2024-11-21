const { sendMessage } = require('./configClient');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'signos vitales':
        return await recepcionarPaciente(contenido);
      case 'categorizar':
        return await actualizarTablero(contenido);
      default:
        throw new Error('Acción no reconocida.');
    }
  } catch (error) {
    throw new Error(`Error en lógica de login: ${error.message}`);
  }
}

async function recepcionarPaciente(contenido) {
  const admision = contenido.admision;
  console.log(admision);
}

async function actualizarTablero(contenido) {
  const tablero = contenido.tablero;
  await sendMessage(servicioTablero, 'actualizar', { tablero });
}

module.exports = {
  procesarMensaje,
};
