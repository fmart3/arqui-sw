const {registrarUsuario, autenticarUsuario, logoutUsuario} = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  //console.log(data);
  try {
    switch (accion) {
      case 'registrar':
        return await registrarUsuario(contenido);
      case 'autenticar':
        return await autenticarUsuario(contenido);
      case 'logout':
        return await logoutUsuario(contenido);
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
