const net = require('net');

// Configuración del bus
const HOST = 'localhost'; // O el nombre del contenedor del bus
const PORT = 5000;

// Datos del paciente
const paciente = {
    rut: '12.345.678-9',
    nombres: 'Juan',
    apellido_paterno: 'Pérez',
    apellido_materno: 'González',
    fecha_nacimiento: '1990-01-01',
    sexo: 'M',
    prevision: 'Fonasa',
    telefono: '123456789',
    correo_electronico: 'juan.perez@gmail.com',
    direccion: 'Calle Falsa 123',
    pertenencia_cesfam: true
};

// Construir mensaje
const servicio = 'admit'; // Servicio objetivo
const datos = JSON.stringify(paciente);
const largo = String(servicio.length + datos.length).padStart(5, '0');
const mensaje = `${largo}${servicio}${datos}`;

const clienteSocket = new net.Socket();

clienteSocket.connect(PORT, HOST, () => {
    console.log('Conectado al bus. Enviando datos del paciente...');
    console.log('Mensaje enviado:', mensaje);
    clienteSocket.write(mensaje);
});

clienteSocket.on('data', (data) => {
    const respuesta = data.toString();
    console.log('Respuesta del bus:', respuesta);

    if (respuesta.includes('admitOK')) {
        console.log('Paciente admitido correctamente');
    } else {
        console.log('Error al admitir paciente. Respuesta del bus:', respuesta);
    }

    clienteSocket.destroy(); // Cerrar conexión después de recibir la respuesta
});

clienteSocket.on('close', () => {
    console.log('Conexión cerrada.');
});

clienteSocket.on('error', (err) => {
    console.error('Error en el cliente:', err.message);
});
