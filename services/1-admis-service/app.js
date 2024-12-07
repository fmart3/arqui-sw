const {consultarPaciente, admitirPaciente, registrarPaciente, mostrarAdmisiones} = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  //console.log(data);
  try {
    switch (accion) {
      case 'consultar':
        return await consultarPaciente(contenido);
      case 'admision':
        return await admitirPaciente(contenido);
      case 'registrar':
        return await registrarPaciente(contenido);
      case 'mostrar_admisiones':
        return await mostrarAdmisiones();
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
