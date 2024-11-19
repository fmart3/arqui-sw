const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'db1'
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

module.exports = pool;
