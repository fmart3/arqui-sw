const net = require('net');

// Configuración
const HOST = 'localhost';
const PORT = 5000;
const servicio = 'sumar'; // Identificación del servicio (5 caracteres)

// Mensaje de inicialización
const contenidoSinit = 'sinit';
const largoSinit = String(servicio.length + contenidoSinit.length).padStart(5, '0');
const mensajeSinit = `${largoSinit}${contenidoSinit}${servicio}`;

const servicioSocket = new net.Socket();

servicioSocket.connect(PORT, HOST, () => {
    console.log('Servicio conectado al bus. Registrándose...');
    console.log('Enviando mensaje de registro:', mensajeSinit);
    servicioSocket.write(mensajeSinit);
});

servicioSocket.on('data', (data) => {
    const mensaje = data.toString();
    console.log('Mensaje recibido del bus:', mensaje);

    const largo = parseInt(mensaje.substring(0, 5));
    const accion = mensaje.substring(5, 10).trim();
    const datos = mensaje.substring(10);

    if (accion === 'sinit') {
        if (datos.startsWith('OK')) {
            console.log('Servicio registrado correctamente.');
        } else {
            console.error('Error al registrar el servicio.');
            servicioSocket.destroy();
        }
        return;
    }

    // Procesar transacciones dirigidas al servicio
    if (accion === servicio) {
        console.log(`Procesando datos recibidos: ${datos}`);

        // Procesar operación (ejemplo: suma)
        const [num1, num2] = datos.trim().split(' ').map(Number);
        const resultado = `${num1} + ${num2} = ${num1 + num2}`;
        const respuesta = `OK ${resultado}`;

        // Construir y enviar la respuesta
        const largoRespuesta = String(servicio.length + 2 + respuesta.length).padStart(5, '0');
        const mensajeRespuesta = `${largoRespuesta}${servicio}${respuesta}`;
        console.log('Enviando respuesta al bus:', mensajeRespuesta);
        servicioSocket.write(mensajeRespuesta);
    }
});

servicioSocket.on('close', () => {
    console.log('Conexión cerrada con el bus.');
});

servicioSocket.on('error', (err) => {
    console.error('Error en el servicio:', err.message);
});
