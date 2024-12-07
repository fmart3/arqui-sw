const {recepcionarPaciente, actualizarTablero, mostrarDetalle} = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  //console.log(data);
  try {
    switch (accion) {
      case 'recepcion':
        return await recepcionarPaciente(contenido);
      case 'actualizar':
        return await actualizarTablero();
      case 'detalle':
        return await mostrarDetalle(contenido);
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
