const sequelize = require('./db');

/**
 * Procesa una consulta SQL para el servicio de base de datos.
 * @param {string} query - La consulta SQL a ejecutar.
 * @returns {Promise<Object|string>} - Resultado de la consulta o mensaje de error.
 */
async function procesarQuery(query) {
  try {
    const [results] = await sequelize.query(query);

    // Si los resultados contienen filas (para SELECT, UPDATE, DELETE)
    if (results.length > 0) {
      return results;
    } else {
      // Si no se encontraron resultados, pero la operación fue exitosa
      return {message: 'Operación ejecutada con éxito, pero no se encontraron datos.' };
    }
  } catch (err) {
    // Si ocurre un error en la ejecución de la query
    return `Error ejecutando la consulta: ${err.message}`;
  }
}

module.exports = {
  procesarQuery,
};
