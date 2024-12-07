const { crearAsignacion, asignar, desasignar } = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'crearAsignacion':
        return await crearAsignacion(contenido);
      case 'asignar':
        return await asignar(contenido);
      case 'desasignar':
        return await desasignar();
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
