const { enviarAlBus } = require('./configClient');

/**
 * Procesa una solicitud de inicio de sesión.
 * @param {string} contenido - JSON con `rut` y `password`.
 * @returns {Promise<string>} - Respuesta para el cliente.
 */
async function procesarMensaje(contenido) {
  //console.log(`[Login] Procesando contenido: ${contenido}`);

  try {
    const data = JSON.parse(contenido);

    // Verificar que los campos necesarios estén presentes
    if (!data.rut || !data.password) {
      //console.log(`[Login] Datos incompletos en la solicitud.`);
      throw new Error('Faltan campos obligatorios.');
    }

    // Construir el query
    const query = `SELECT rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${data.rut}' AND password = '${data.password}'`;
    //console.log(`Enviando query al servicio de base de datos:`, query);

    // Enviar el query al servicio de base de datos
    const respuestaDB = await enviarAlBus('datab', query);

    // Validar respuesta de la base de datos
    if (!respuestaDB || respuestaDB[0] === '0') {
      //console.log(`[Login] Credenciales incorrectas para RUT: ${data.rut}`);
      return 'Credenciales incorrectas.';
    }

    // Parsear los datos recibidos de la base de datos
    const datos = JSON.parse(respuestaDB.slice(1)); // Quitar el estado (1 o 0) al inicio
    //console.log(`[Login] Datos recibidos de la base de datos:`, datos);

    // Verificar que los datos sean válidos y que exista al menos un usuario
    if (Array.isArray(datos) && datos.length > 0) {
      const usuario = datos[0]; // Usualmente solo se obtiene un usuario en un login
      //console.log(`[Login] Usuario encontrado:`, usuario);

      return usuario;
    } else {
      console.log(`[Login] No se encontró usuario para RUT: ${data.rut}`);
      return 'Credenciales incorrectas.';
    }
  } catch (error) {
    //console.error(`[Login] Error procesando mensaje: ${error.message}`);
    return `Error procesando solicitud: ${error.message}`;
  }
}

module.exports = {
  procesarMensaje,
};
