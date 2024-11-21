const { sendMessage } = require('./configClient');

async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'registrar':
        return await registrarUsuario(contenido.usuario);
      case 'autenticar':
        return await autenticarUsuario(contenido);
      default:
        throw new Error('Acción no reconocida.');
    }
  } catch (error) {
    throw new Error(`Error en lógica de login: ${error.message}`);
  }
}

async function registrarUsuario(usuario) {
  try {
    const query = `INSERT INTO Usuario (rut, nombres, apellido_paterno, apellido_materno, cargo, password, estado) VALUES
      ('${usuario.rut}', '${usuario.nombres}', '${usuario.apellido_paterno}', '${usuario.apellido_materno}',
      '${usuario.cargo}', '${usuario.password}', 1)`;

    const respuestaDB = await sendMessage('datab', 'insert', { query });

    if (!respuestaDB || !respuestaDB.message) {
      throw new Error('Error al registrar el usuario.');
    }

    const queryGetUser = `SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${usuario.rut}'`;
    const respuestaGetUser = await sendMessage('datab', 'select', { query: queryGetUser });

    if (!respuestaGetUser || respuestaGetUser.length === 0) {
      throw new Error('Error al obtener el usuario registrado.');
    }

    return respuestaGetUser[0];
  } catch (error) {
    throw new Error(`Error en registrarUsuario: ${error.message}`);
  }
}

async function autenticarUsuario({ rut, password }) {
  try {
    const query = `SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${rut}' AND password = '${password}'`;
    const respuestaDB = await sendMessage('datab', 'select', { query });

    if (!respuestaDB || respuestaDB.length === 0) {
      // Devolver un mensaje entendible
      throw new Error('Credenciales incorrectas.');
    }

    return respuestaDB[0];
  } catch (error) {
    // Error técnico para diagnóstico interno
    console.error(`Error técnico en autenticarUsuario: ${error.message}`);
    // Error simplificado enviado al cliente
    throw Error('Error al autenticar usuario. Verifique los datos proporcionados.');
  }
}


module.exports = {
  procesarMensaje,
};
