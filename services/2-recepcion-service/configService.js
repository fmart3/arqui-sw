const net = require('net');
require('dotenv').config();

const BUS_HOST = process.env.BUS_HOST;
const BUS_PORT = process.env.BUS_PORT;

function iniciarServicio(servicio, handleRequest) {
    const socket = new net.Socket();

    socket.connect(BUS_PORT, BUS_HOST, () => {
        console.log(`\n[Service] Servicio "${servicio}" conectado al bus.`);
        conectarAlBus(socket, servicio);
    });

    socket.on('data', async (data) => {
        console.log('- - - - -');
        console.log(`[Service] Mensaje recibido del bus: ${data.toString()}`);
        await procesarMensaje(socket, servicio, data, handleRequest);
    });

    socket.on('close', () => {
        console.log(`[Service] Conexión cerrada con el bus para "${servicio}".`);
        process.exit(1);
    });

    socket.on('error', (err) => {
        console.error(`[Service] Error en el servicio "${servicio}":`, err.message);
        process.exit(1);
    });
}

function conectarAlBus(socket, servicio) {
    const mensaje = construirMensaje('sinit', servicio);
    socket.write(mensaje);
    console.log(`[Service] Enviando mensaje de registro: ${mensaje}`);
}

async function procesarMensaje(socket, servicio, data, handleRequest) {
    const mensaje = parsearMensajeBus(data);
    if (mensaje.servicio === 'sinit') {
        manejarRegistro(socket, mensaje);
        return;
    }

    try {
        const request = JSON.parse(mensaje.contenido);
        const contenido = await handleRequest(request);
        enviarRespuesta(socket, servicio, {
            estado: 1,
            contenido,
        });
    } catch (error) {
        enviarRespuesta(socket, servicio, {
            estado: 0,
            contenido: error.message,
        });
    }
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
}

function enviarRespuesta(socket, servicio, contenido) {
    const mensaje = construirMensaje(servicio, JSON.stringify(contenido));
    socket.write(mensaje);
    console.log(`\n[Service] Mensaje enviado al bus: ${mensaje}`);
    console.log('- - - - -');
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
    iniciarServicio,
};