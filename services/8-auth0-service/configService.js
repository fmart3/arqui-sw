const net = require('net');
require('dotenv').config();
const { procesarMensaje } = require('./app');

const BUS_HOST = process.env.BUS_HOST;
const BUS_PORT = process.env.BUS_PORT;

function service(servicio) {
  const socket = new net.Socket();

  socket.connect(BUS_PORT, BUS_HOST, () => {
    console.log(`[Service] Servicio "${servicio}" conectado al bus.`);
    sinit(socket, servicio);
    return;
  });

  socket.on('data', async (data) => {
    console.log(`\n[Service] Mensaje recibido del bus: ${data.toString()}`);
    const mensaje = parsearMensajeBus(data);
    if (mensaje.servicio === 'sinit') {
      manejarRegistro(socket, mensaje);
    } else if (mensaje.servicio === servicio) {
      try {
        const request = JSON.parse(mensaje.contenido);
        const respuesta = await procesarMensaje(request);
        enviarRespuesta(socket, servicio, respuesta);
      } catch (error) {
        console.log('Error al procesar mensaje:', error);
        enviarRespuesta(socket, servicio, {error: error.message});
      }
    }
    return;
  });

  socket.on('error', (err) => {
    console.error(`[Service] Error en el servicio "${servicio}":`, err.message);
    process.exit(1);
  });

  socket.on('close', () => {
    console.log(`[Service] Conexión cerrada con el bus para "${servicio}".`);
    process.exit(1);
  });
}

function sinit(socket, servicio) {
  const mensaje = construirMensaje('sinit', servicio);
  socket.write(mensaje);
  console.log(`[Service] Enviando mensaje de registro: ${mensaje}`);
  return;
}

function manejarRegistro(socket, mensaje) {
  const estado = mensaje.contenido.substring(0, 2);
  const contenido = mensaje.contenido.substring(2);
  if (estado === 'OK') {
    console.log(`[Service] Servicio "${contenido}" registrado correctamente.`);
  } else {
    console.error(`[Service] Error al registrar servicio "${contenido}".`);
    socket.destroy();
  }
  return;
}

function enviarRespuesta(socket, servicio, respuesta) {
  const contenido = JSON.stringify(respuesta);
  const mensaje = construirMensaje(servicio, contenido);
  socket.write(mensaje);
  console.log(`[Service] Mensaje enviado al bus: ${mensaje}`);
  return;
}

function construirMensaje(servicio, contenido) {
  const largo = String(servicio.length + contenido.length).padStart(5, '0');
  return `${largo}${servicio}${contenido}`;
}

function parsearMensajeBus(data) {
  const mensaje = data.toString();
  const servicio = mensaje.substring(5, 10).trim();
  const contenido = mensaje.substring(10);
  return { servicio, contenido };
}

module.exports = {
  service,
};
