// app.js
const { derivarPaciente, altaPaciente, licenciaPaciente } = require('./service');

async function procesarMensaje(data) {
  const { accion, contenido } = data;

  try {
    switch (accion) {
      case 'derivar':
        return await derivarPaciente(contenido);

      case 'alta':
        return await altaPaciente(contenido);

      case 'licencia':
        return await licenciaPaciente(contenido);

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