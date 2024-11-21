const { iniciarServicio } = require('./configService');
const { procesarMensaje } = require('./app');

// Inicia el servicio con el nombre "login" y la lógica definida en `procesarMensaje`.
iniciarServicio('login', procesarMensaje);
