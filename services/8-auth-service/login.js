const { enviarAlBus } = require('./configClient');

/**
 * Procesa una solicitud de inicio de sesión.
 * @param {string} contenido - JSON con `rut` y `password`.
 * @returns {Promise<string>} - Respuesta para el cliente.
 */
async function procesarMensaje(contenido) {
  try {
    const data = JSON.parse(contenido);

    if (data.accion === 'registrar') {
      return await registrarUsuario(data);
    } 

    return await autenticarUsuario(data);
  } catch (error) {
    return `Error procesando solicitud: ${error.message}`;
  }
}

async function registrarUsuario(data) {
  const query = `INSERT INTO Usuario (rut, nombres, apellido_paterno, apellido_materno, cargo, password, estado) VALUES 
    ('${data.usuario.rut}', '${data.usuario.nombres}', '${data.usuario.apellido_paterno}', '${data.usuario.apellido_materno}', 
    '${data.usuario.cargo}', '${data.usuario.password}', 1)`;

  const respuestaDB = await enviarAlBus('datab', query);

  if (!respuestaDB || respuestaDB[0] !== '1') {
    return 'Error al registrar el usuario.';
  }

  // Consulta para obtener el usuario recién registrado
  const queryGetUser = `SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${data.usuario.rut}'`;
  const respuestaGetUser = await enviarAlBus('datab', queryGetUser);

  if (!respuestaGetUser || respuestaGetUser[0] === '0') {
    return 'Error al obtener el usuario registrado.';
  }

  const usuario = JSON.parse(respuestaGetUser.slice(1));
  return usuario[0];
}


async function autenticarUsuario(data) {
  const query = `SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${data.rut}' AND password = '${data.password}'`;
  const respuestaDB = await enviarAlBus('datab', query);

  if (!respuestaDB || respuestaDB[0] === '0') {
    return 'Credenciales incorrectas.';
  }

  const datos = JSON.parse(respuestaDB.slice(1));
  if (Array.isArray(datos) && datos.length > 0) {
    return datos[0]; // Retorna el usuario autenticado
  }
  return 'Credenciales incorrectas.';
}


module.exports = {
  procesarMensaje,
};
