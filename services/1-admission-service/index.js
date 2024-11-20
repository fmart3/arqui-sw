const { iniciarServicio } = require('./configService');
const { procesarMensaje } = require('./admission');

// Iniciar el servicio de base de datos
iniciarServicio('admis', async (contenido) => {
  //console.log(`[Service] Procesando solicitud recibida: ${contenido}`);

  // La lógica específica del servicio
  const resultado = await procesarMensaje(contenido);
  return resultado; // Retornar el resultado para enviarlo al bus
});
