const {consulta, agregar, actualizar, eliminar} = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'select':
        return await consulta(contenido);
      case 'insert':
        return await agregar(contenido);
      case 'update':
        return await actualizar(contenido);
      case 'delete':
        return await eliminar(contenido);
      default:
        return { status: 0, contenido: 'Acción no reconocida.' }
    }
  } catch (error) {
    return { status: 0, contenido: 'Error Procesando solicitud.' }
  }
}

module.exports = {
  procesarMensaje,
};
