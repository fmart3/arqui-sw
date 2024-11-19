const net = require('net');
require('dotenv').config();

function iniciarServicio(serviceName, handleRequest) {
  const BUS_HOST = process.env.BUS_HOST;
  const BUS_PORT = process.env.BUS_PORT;

  const servicioSocket = new net.Socket();

  // Mensaje de identificación (registro)
  const contenidoSinit = 'sinit';
  const largoSinit = String(serviceName.length + contenidoSinit.length).padStart(5, '0');
  const mensajeSinit = `${largoSinit}${contenidoSinit}${serviceName}`;

  servicioSocket.connect(BUS_PORT, BUS_HOST, () => {
    console.log(`[Service] Servicio "${serviceName}" conectado al bus.`);
    console.log(`[Service] Enviando mensaje de registro: ${mensajeSinit}`);
    servicioSocket.write(mensajeSinit);
  });

  servicioSocket.on('data', async (data) => {
    const mensaje = data.toString();
    const largo = parseInt(mensaje.substring(0, 5));
    const cliente = mensaje.substring(5, 10).trim();
    const contenido = mensaje.substring(10);

    console.log(`\n-----------------------------\n[Service] Mensaje recibido del bus: ${mensaje}`);

    if (cliente === 'sinit') {
      if (contenido.startsWith('OK')) {
        console.log(`[Service] Servicio "${serviceName}" registrado correctamente.`);
      } else {
        console.error(`[Service] Error al registrar el servicio "${serviceName}".`);
        servicioSocket.destroy();
        return;
      }
      return;
    }

    try {
      // Delegar la lógica de negocios al manejador específico
      const resultado = await handleRequest(contenido);
      enviarRespuesta(servicioSocket, cliente, resultado);
    } catch (err) {
      console.error(`[Service] Error procesando solicitud:`, err.message);
      enviarRespuesta(servicioSocket, cliente, `0Error: ${err.message}`);
    }
  });

  servicioSocket.on('close', () => {
    console.log(`[Service] Conexión cerrada con el bus para "${serviceName}".`);
    process.exit(1);
  });

  servicioSocket.on('error', (err) => {
    console.error(`[Service] Error en el servicio "${serviceName}":`, err.message);
    process.exit(1);
  });
}

function enviarRespuesta(socket, cliente, contenido) {
  let mensaje;

  if (typeof contenido === 'object') {
    // Asume que es un resultado exitoso
    mensaje = `1${JSON.stringify(contenido)}`;
  } else if (contenido.startsWith('0')) {
    // Error o resultado vacío
    mensaje = contenido;
  } else {
    mensaje = `0${contenido}`;
  }

  const largoRespuesta = String(cliente.length + mensaje.length).padStart(5, '0');
  const mensajeRespuesta = `${largoRespuesta}${cliente}${mensaje}`;
  socket.write(mensajeRespuesta);

  console.log(`[Service] Enviando respuesta al bus: ${mensajeRespuesta}\n-----------------------------\n`);
}

module.exports = {
  iniciarServicio,
};
