const sequelize = require('./db');

// Función para manejar consultas SELECT
async function consulta(query) {
  try {
    const [results] = await sequelize.query(query);
    if (results.length === 0) {
      return { status: 1, contenido: [] };
    }
    return { status: 1, contenido: results };
  } catch (error) {
    return { status: 0, contenido: error.message };
  }
}

// Función para manejar inserciones
async function agregar(query) {
  try {
    await sequelize.query(query);
    return { status: 1, contenido: 'Operación ejecutada con éxito' };
  } catch (error) {
    return { status: 0, contenido: error.message };
  }
}

// Función para manejar actualizaciones
async function actualizar(query) {
  try {
    await sequelize.query(query);
    return { status: 1, contenido: 'Operación ejecutada con éxito' };
  } catch (error) {
    return { status: 0, contenido: error.message };
  }
}

// Función para manejar eliminaciones
async function eliminar(query) {
  try {
    await sequelize.query(query);
    return { status: 1, contenido: 'Operación ejecutada con éxito' };
  } catch (error) {
    return { status: 0, contenido: error.message };
  }
}

module.exports = {
  consulta,
  agregar,
  actualizar,
  eliminar,
};