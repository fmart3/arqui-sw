const sequelize = require('./db');

/**
 * Procesa una consulta SQL para el servicio de base de datos.
 * @param {string} query - La consulta SQL a ejecutar.
 * @returns {Promise<Object|string>} - Resultado de la consulta o mensaje de error.
 */
async function procesarQuery(query) {
  //console.log(`\n[Database] Query recibida: ${query}`);

  try {
    const [results] = await sequelize.query(query);

    if (results.length > 0) {
      //console.log(`[Database] Query exitosa. Datos encontrados.`);
      return results; // Retorna todos los resultados
    } else {
      //console.log(`[Database] No se encontraron datos.`);
      return 'No se encontraron datos.';
    }
  } catch (err) {
    //console.error(`[Database] Error ejecutando query: ${err.message}`);
    return `Error ejecutando query: ${err.message}`;
  }
}

module.exports = {
  procesarQuery,
};
