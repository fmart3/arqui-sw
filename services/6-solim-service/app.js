// app.js
const { actualizarTablero, atenderPaciente, ingresarAnamnesis, registrarObservaciones, ingresarDiagnostico } = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;

  try {
    switch (accion) {
      case 'solicitud':
        return await solicitud(contenido);

      default:
        return { status: 0, contenido: 'Acción no reconocida.' };
    }
  } catch (error) {
    return { status: 0, contenido: `Error Procesando solicitud: ${error.message}` };
  }
}

module.exports = {
  procesarMensaje,
};