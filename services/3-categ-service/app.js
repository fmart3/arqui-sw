const { sendMessage } = require('./configClient');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'signos vitales':
        return await signosVitales(contenido);
      case 'categorizar':
        return await categorizarPaciente(contenido);
      default:
        throw new Error('Acción no reconocida.');
    }
  } catch (error) {
    throw new Error(`Error en lógica de login: ${error.message}`);
  }
}

signosVitales (categorizacion, signos) {
  const {signosVitales} = contenido.signosVitales;
  // Implementación del código para registrar signos vitales
  return signosVitales();
}

categorizarPaciente (categorizacion) {
  const {categorizacion} = contenido.paciente;
  u
  // Implementación del código para categorizar paciente
  return paciente.categorizacion;
}

module.exports = {
  procesarMensaje,
};
