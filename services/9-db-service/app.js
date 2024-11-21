const sequelize = require('./db');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    if (!contenido.query) {
      throw new Error('No se proporcionó una query.');
    }

    const accionDetermined = determinarAccion(accion);
    const resultado = await ejecutarQuery(contenido.query, accionDetermined);

    return resultado;
  } catch (error) {
    throw new Error(`Error en lógica de base de datos: ${error.message}`);
  }
}

function determinarAccion(accion) {
  const accionMap = {
    select: 'SELECT',
    insert: 'INSERT',
    update: 'UPDATE',
    delete: 'DELETE',
  };

  return accionMap[accion.toLowerCase()] || 'OTRO';
}

async function ejecutarQuery(query, accion) {
  try {
    const [results, metadata] = await sequelize.query(query);

    switch (accion) {
      case 'SELECT':
        return results.length > 0 ? results : [];
      case 'INSERT':
        return { message: 'Operación ejecutada con éxito.' };
      case 'UPDATE':
      case 'DELETE':
        return { message: 'Operación ejecutada con éxito.'};
      default:
        return { message: 'Operación ejecutada con éxito.' };
    }
  } catch (error) {
    throw new Error(`Error ejecutando la query: ${error.message}`);
  }
}

module.exports = {
  procesarMensaje,
};
