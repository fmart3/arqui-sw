const net = require('net');

// Configuración
const HOST = 'localhost';
const PORT = 5000;
const servicio = 'sumar'; // Servicio al que se quiere conectar
const datos = '2 5'; // Datos enviados al servicio

// Construir mensaje
const largo = String(servicio.length + datos.length).padStart(5, '0');
const mensaje = `${largo}${servicio}${datos}`;

const clienteSocket = new net.Socket();

clienteSocket.connect(PORT, HOST, () => {
    console.log('Conectado al bus. Enviando mensaje...');
    console.log('Mensaje enviado:', mensaje);
    clienteSocket.write(mensaje);
});

clienteSocket.on('data', (data) => {
    const mensaje = data.toString();
    console.log('Respuesta del bus:', mensaje);

    const largo = mensaje.substring(0, 5);
    const servicio = mensaje.substring(5, 10).trim();
    const estado = mensaje.substring(10, 12);
    const datos = mensaje.substring(12);

    console.log(`Largo: ${largo}`);
    console.log(`Servicio: ${servicio}`);
    console.log(`Estado: ${estado}`);
    console.log(`Datos: ${datos}`);

    clienteSocket.destroy(); // Cerrar conexión después de recibir la respuesta
});

clienteSocket.on('close', () => {
    console.log('Conexión cerrada.');
});

clienteSocket.on('error', (err) => {
    console.error('Error en el cliente:', err.message);
});
