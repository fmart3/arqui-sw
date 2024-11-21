const net = require('net');
require('dotenv').config();

const { BUS_HOST, BUS_PORT } = process.env;

function sendMessage(servicio, accion, contenido) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.connect(BUS_PORT, BUS_HOST, () => {
      console.log(`[Client] Cliente conectado al bus.`);
      enviarMensaje(socket, servicio, accion, contenido);
    });

    socket.on('data', (data) => {
      const mensaje = parseResponse(data.toString());
      console.log('[Client] Respuesta del bus:', mensaje);
      procesarRespuesta(socket, mensaje, resolve, reject);
    });

    socket.on('error', (err) => {
      reject(err);
      socket.destroy();
    });

    socket.on('close', () => {
      // console.log('[Client] Desconectado del bus.\n');
    });
  });
}

function enviarMensaje(socket, servicio, accion, contenido) {
  try {
    const mensajeObj = { accion, contenido };
    const mensaje = JSON.stringify(mensajeObj);
    const largoMensaje = String(servicio.length + mensaje.length).padStart(5, '0');
    const mensajeCompleto = `${largoMensaje}${servicio}${mensaje}`;

    console.log('[Client] Enviando al bus:', mensajeCompleto);
    socket.write(mensajeCompleto);
  } catch (error) {
    console.error('[Client] Error al enviar el mensaje:', error.message);
    socket.destroy();
  }
}

function procesarRespuesta(socket, mensaje, resolve, reject) {
  try {
    if (mensaje.estado === 'OK') {
      const respuesta = JSON.parse(mensaje.contenido);
      if (respuesta.estado === 1) {
        console.log(respuesta.contenido);
        resolve(respuesta.contenido);
      } else {
        // Transmitir el error contenido de forma clara
        reject(new Error(respuesta.contenido || 'Error desconocido.'));
      }
    } else {
      reject(new Error('Fallo del servidor o servicio no disponible.'));
    }
  } catch (error) {
    reject(new Error('Error al procesar la respuesta del servidor: ' + error.message));
  } finally {
    socket.destroy();
  }
}

function parseResponse(rawMessage) {
  const largo = parseInt(rawMessage.substring(0, 5), 10);
  const servicio = rawMessage.substring(5, 10).trim();
  const contenido = rawMessage.substring(10);
  const estado = contenido.substring(0, 2);
  const mensajeContenido = contenido.substring(2);

  return {
    largo,
    servicio,
    estado,
    contenido: mensajeContenido,
  };
}

module.exports = {
  sendMessage,
};
