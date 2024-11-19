const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  dialectOptions: {
    timezone: 'Z',
    dateStrings: true,
    typeCast: true,
  },
  timezone: '-04:00',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('\n[Database] Conexión establecida exitosamente con la base de datos.');
  })
  .catch(err => {
    console.error('\n[Database] No se pudo conectar a la base de datos:', err);
  });

// Sincronizar la base de datos
sequelize.sync().then(() => {
  console.log('[Database] Base de datos sincronizada.');
}).catch((err) => {
  console.error('[Database] Error sincronizando la base de datos:', err);
});

module.exports = sequelize;
