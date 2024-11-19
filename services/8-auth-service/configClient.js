const net = require('net');
require('dotenv').config();

const { BUS_HOST, BUS_PORT } = process.env;

// Enviar al bus con un servicio específico
function enviarAlBus(servicio, payload) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.connect(BUS_PORT, BUS_HOST, () => {
      console.log('\n-----------------------------\nConectado al bus.');

      // Serializar el payload solo si es un objeto o array, pero no si es un string
      const mensaje = typeof payload === 'string' ? payload : JSON.stringify(payload);

      const largoMensaje = String(servicio.length + mensaje.length).padStart(5, '0');
      const mensajeCompleto = `${largoMensaje}${servicio}${mensaje}`;

      console.log('Enviando al bus:', mensajeCompleto);

      socket.write(mensajeCompleto);
    });

    socket.on('data', (data) => {
      try {
        const parsedResponse = parseResponse(data.toString());
        console.log('Respuesta del bus:', parsedResponse);

        if (parsedResponse.estado === 'OK') {
          resolve(parsedResponse.contenido); // Solo el contenido si la respuesta fue exitosa
        } else {
          reject(new Error('Fallo del servidor o servicio no disponible.'));
        }
      } catch (error) {
        reject(new Error('Error al parsear la respuesta del servidor: ' + error.message));
      } finally {
        socket.destroy(); // Cerrar el socket después de recibir la respuesta
        console.log('Desconectado del bus.\n-----------------------------\n');
      }
    });

    socket.on('error', (err) => {
      reject(err);
      socket.destroy();
    });

    socket.on('close', () => {
      //console.log('Desconectado del bus.\n');
    });
  });
}


// Parsear respuesta del bus
function parseResponse(rawMessage) {
  const largo = parseInt(rawMessage.substring(0, 5), 10);
  const servicio = rawMessage.substring(5, 10).trim();
  const contenido = rawMessage.substring(10);

  if (contenido.length < 2) {
    throw new Error('El contenido del mensaje es demasiado corto para incluir un estado válido.');
  }

  const estado = contenido.substring(0, 2); // Estado (OK o NK)
  const mensajeContenido = contenido.substring(2); // Resto del contenido del mensaje

  return {
    largo,
    servicio,
    estado,
    contenido: mensajeContenido,
  };
}

module.exports = {
  enviarAlBus,
};
