// app.js
const { actualizarTablero, atenderPaciente, ingresarAnamnesis, registrarObservaciones, ingresarDiagnostico } = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;

  try {
    switch (accion) {
      case 'actualizar':
        return await actualizarTablero(contenido);

      case 'atender':
        return await atenderPaciente(contenido);

      case 'ingresarAnamnesis':
        return await ingresarAnamnesis(contenido);

      case 'registrarObservaciones':
        return await registrarObservaciones(contenido);

      case 'ingresarDiagnostico':
        return await ingresarDiagnostico(contenido);

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