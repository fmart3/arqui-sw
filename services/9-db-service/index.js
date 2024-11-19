const { iniciarServicio } = require('./configService');
const { procesarQuery } = require('./query');

// Iniciar el servicio de base de datos
iniciarServicio('datab', async (contenido) => {
  //console.log(`[Service] Procesando solicitud recibida: ${contenido}`);

  // La lógica específica del servicio
  const resultado = await procesarQuery(contenido);
  return resultado; // Retornar el resultado para enviarlo al bus
});
