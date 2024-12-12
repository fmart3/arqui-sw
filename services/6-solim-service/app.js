const { } = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;

  try {
    switch (accion) {
      case 'solicitarMedicamentos':
        return {status: 0, contenido: "Sistema de farmacia no diponible."};

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