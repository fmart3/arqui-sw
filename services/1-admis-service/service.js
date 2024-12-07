const { client } = require('./configClient');

const servicioDataB = 'datab';
const servicioRecep = 'recep';

async function consultarPaciente(data) {
  //console.log(data);
  const { rut } = data;
  try {
    const queryPaciente = `SELECT * FROM paciente WHERE rut = '${rut}'`;
    const respuestaPaciente = await client(servicioDataB, { accion: 'select', contenido: queryPaciente });

    if ((respuestaPaciente.status === 0 || respuestaPaciente.contenido[0] == null)) {
      return { status: 0, contenido: [] };
    }

    const paciente = respuestaPaciente.contenido[0];
    const queryAdmision = `SELECT * FROM admision WHERE id_paciente = ${paciente.id} ORDER BY fecha_llegada DESC, hora_llegada DESC LIMIT 1`;
    const respuestaAdmision = await client(servicioDataB, { accion: 'select', contenido: queryAdmision });

    const admision = respuestaAdmision.contenido[0] || [];
    return { status: 1, contenido: { paciente, admision } };
  } catch (error) {
    return { status: 0, contenido: error.message };
  }
}

async function admitirPaciente(data) {
  const { user_id, paciente, motivo } = data
  try {
    const query = `
        INSERT INTO admision (id_paciente, id_personal_admision, motivo, estado, fecha_llegada, hora_llegada)
        VALUES (${paciente.id}, ${user_id}, '${motivo}', 1, CURRENT_DATE, CURRENT_TIME)`;
    const respuesta = await client(servicioDataB, { accion: 'insert', contenido: query });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al admitir paciente.' };
    }
    const queryAdmision = 'SELECT * FROM admision ORDER BY fecha_llegada DESC, hora_llegada DESC LIMIT 1';

    const respuestaAdmision = await client(servicioDataB, { accion: 'select', contenido: queryAdmision });

    if (respuestaAdmision.status === 0 || respuestaAdmision.contenido == null) {
      return { status: 0, contenido: 'Error al obtener la admisión del paciente admitido.' };
    }

    await recepcionarAdmision(respuestaAdmision.contenido[0]);

    return { status: 1, contenido: respuestaAdmision.contenido[0] };

  } catch (error) {
    return { status: 0, contenido: `Error admitiendo paciente: ${error.message}` };
  }
}

async function registrarPaciente(data) {
  const { paciente } = data;
  try {
    const query = `
        INSERT INTO paciente (rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, prevision, telefono, correo_electronico, direccion, nacionalidad, pertenencia_cesfam)
        VALUES ('${paciente.rut}', '${paciente.nombres}', '${paciente.apellido_paterno}', '${paciente.apellido_materno}', '${paciente.fecha_nacimiento}', '${paciente.sexo}', '${paciente.prevision}', '${paciente.telefono}', '${paciente.correo_electronico}', '${paciente.direccion}', '${paciente.nacionalidad}', ${paciente.pertenencia_cesfam})`;
    const respuesta = await client(servicioDataB, { accion: 'insert', contenido: query });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al registrar paciente.' };
    }

    const queryUltimoPaciente = 'SELECT * FROM paciente ORDER BY id DESC LIMIT 1';
    const respuestaPaciente = await client(servicioDataB, { accion: 'select', contenido: queryUltimoPaciente });

    if (respuestaPaciente.status === 0) {
      return { status: 0, contenido: 'No se pudo obtener el paciente registrado.' };
    }

    const pacienteRegistrado = respuestaPaciente.contenido[0];

    //console.log('pacienteRegistrado', pacienteRegistrado);
    return { status: 1, contenido: pacienteRegistrado };

  } catch (error) {
    return { status: 0, contenido: `Error registrando paciente: ${error.message}` };
  }
}

async function mostrarAdmisiones() {
  try {
    const query = `
      SELECT 
        a.id AS id_admision,
        p.rut,
        CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_completo,
        a.motivo,
        a.estado,
        a.fecha_llegada,
        a.hora_llegada
      FROM admision a
      JOIN paciente p ON a.id_paciente = p.id
      ORDER BY a.fecha_llegada DESC, a.hora_llegada DESC
      LIMIT 5`;

    const respuesta = await client(servicioDataB, { accion: 'select', contenido: query });

    if (respuesta.status === 1 && respuesta.contenido != null) {
      return { status: 1, contenido: respuesta.contenido };
    } else {
      return { status: 0, contenido: 'No se encontraron admisiones.' };
    }
  } catch (error) {
    return { status: 0, contenido: `Error obteniendo admisiones: ${error.message}` };
  }
}

async function recepcionarAdmision(admision) {
  await client(servicioRecep, { accion: 'recepcion', contenido: admision });
  return;
}

async function borrarAdmision(admision_id) {

}

module.exports = {
  consultarPaciente,
  admitirPaciente,
  registrarPaciente,
  mostrarAdmisiones,
};
