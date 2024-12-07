const net = require('net');
require('dotenv').config();

const BUS_HOST = process.env.BUS_HOST;
const BUS_PORT = process.env.BUS_PORT;

function client(servicio, contenido) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();

        socket.connect(BUS_PORT, BUS_HOST, () => {
            console.log(`\n[Client] Cliente conectado al bus.`);
            enviarMensaje(socket, servicio, contenido);
        });

        socket.on('data', (data) => {
            try {
                const mensaje = parseResponse(data.toString());
                console.log('[Client] Respuesta del bus:', mensaje);
                const respuesta = procesarRespuesta(socket, mensaje);
                resolve(respuesta);
            } catch (error) {
                reject(new Error(`[Client] Error procesando la respuesta: ${error.message}`));
            } finally {
                socket.destroy();
                console.log('[Client] Desconectado del bus.\n');
            }
        });

        socket.on('error', (err) => {
            console.error(`[Service] Error en el cliente:`, err.message);
            reject(err);
            socket.destroy();
        });

        socket.on('close', () => {
            //console.log('[Client] Desconectado del bus.');
        });
    });
}

function enviarMensaje(socket, servicio, contenido) {
    try {
        const mensaje = JSON.stringify(contenido);
        const largoMensaje = String(servicio.length + mensaje.length).padStart(5, '0');
        const mensajeCompleto = `${largoMensaje}${servicio}${mensaje}`;

        console.log('[Client] Enviando al bus:', mensajeCompleto);
        socket.write(mensajeCompleto);
    } catch (error) {
        console.error('[Client] Error al enviar el mensaje:', error.message);
        socket.destroy();
        throw error;
    }
}

function procesarRespuesta(socket, mensaje) {
    if (mensaje.estado === 'OK') {
        return JSON.parse(mensaje.contenido);
    } else {
        throw new Error('Fallo del servidor o servicio no disponible.');
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
    client,
};