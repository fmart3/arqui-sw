const { sendMessage } = require('./configClient');

const servicioDataB = 'datab';
const servicioRecep = 'recep';


async function procesarMensaje(data) {
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'consultar':
        return await consultarPaciente(contenido);
      case 'admision':
        return await admitirPaciente(contenido);
      case 'registrar':
        return await registrarPaciente(contenido);
      default:
        throw new Error('Acción no reconocida.');
    }
  } catch (error) {
    throw new Error(`Error procesando solicitud: ${error.message}`);
  }
}

async function consultarPaciente(data) {
  console.log(data);
  const { rut } = data;
  try {
    const queryPaciente = `SELECT * FROM paciente WHERE rut = '${rut}'`;
    const respuestaPaciente = await sendMessage(servicioDataB, 'select', { query: queryPaciente });

    if ((!respuestaPaciente || respuestaPaciente.length === 0)) {
      return null;
    }

    const paciente = respuestaPaciente[0];
    const queryAdmision = `SELECT * FROM admision WHERE id_paciente = ${paciente.id} ORDER BY fecha_llegada DESC LIMIT 1`;
    const respuestaAdmision = await sendMessage(servicioDataB, 'select', { query: queryAdmision });

    const admision = respuestaAdmision[0] || null;
    return { paciente, admision };
  } catch (error) {
    throw new Error(`Error consultando paciente: ${error.message}`);
  }
}

async function admitirPaciente(data) {
  const { paciente, user_id, motivo } = data
  try {
    const query = `
      INSERT INTO admision (id_paciente, id_personal_admision, motivo, estado, fecha_llegada, hora_llegada)
      VALUES (${paciente.id}, ${user_id}, '${motivo}', 1, CURRENT_DATE, CURRENT_TIME)`;
    const respuesta = await sendMessage(servicioDataB, 'insert', { query });

    if (!respuesta) {
      throw new Error('Error al admitir paciente.');
    }
    const queryAdmision = 'SELECT * FROM admision ORDER BY fecha_llegada DESC, hora_llegada DESC LIMIT 1';

    const respuestaAdmision = await sendMessage(servicioDataB, 'select', { query: queryAdmision });

    await recepcionarAdmision (respuestaAdmision[0]);

    if (!respuestaAdmision) {
      throw new Error('Error al obtener la admisión del paciente admitido.');
    }
    return respuestaAdmision[0];

  } catch (error) {
    throw new Error(`Error admitiendo paciente: ${error.message}`);
  }
}

async function registrarPaciente(data) {
  const { paciente } = data;
  try {
    const query = `
      INSERT INTO paciente (rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, prevision, telefono, correo_electronico, direccion, nacionalidad, pertenencia_cesfam)
      VALUES ('${paciente.rut}', '${paciente.nombres}', '${paciente.apellido_paterno}', '${paciente.apellido_materno}', '${paciente.fecha_nacimiento}', '${paciente.sexo}', '${paciente.prevision}', '${paciente.telefono}', '${paciente.correo_electronico}', '${paciente.direccion}', '${paciente.nacionalidad}', ${paciente.pertenencia_cesfam})`;
    const respuesta = await sendMessage(servicioDataB, 'insert', { query });

    if (!respuesta) {
      throw new Error('Error al registrar paciente.');
    }

    const queryUltimoPaciente = 'SELECT * FROM paciente ORDER BY id DESC LIMIT 1';
    const respuestaPaciente = await sendMessage(servicioDataB, 'select', {query: queryUltimoPaciente});

    if (!respuestaPaciente ) {
      throw new Error('No se pudo obtener el paciente registrado.');
    }

    const pacienteRegistrado = respuestaPaciente[0];

    //console.log('pacienteRegistrado', pacienteRegistrado);
    return pacienteRegistrado;

  } catch (error) {
    throw new Error(`Error registrando paciente: ${error.message}`);
  }
}

async function recepcionarAdmision(admision) {
  await sendMessage(servicioRecep, 'recepcion', admision);
  return;
} 

module.exports = {
  procesarMensaje,
};
