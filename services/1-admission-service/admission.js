const { enviarAlBus } = require('./configClient');

const servicioCateg = 'categ';
const servicioDataB = 'datab'

/**
 * Procesa una solicitud de inicio de sesión.
 * @param {string} contenido - JSON con `rut` y `password`.
 * @returns {Promise<string>} - Respuesta para el cliente.
 */async function procesarMensaje(contenido) {
  try {
    const data = JSON.parse(contenido);

    if (!data.accion) {
      throw new Error('Error en el programa, no hay acción definida.');
    }

    if (data.accion === 'consultar') {
      return await consultarPaciente(data);
    }

    if (data.accion === 'admision') {
      return await admitirPaciente(data);
    }

    if (data.accion === 'registrar') {
      return await registrarPaciente(data); // Nueva acción para registrar pacientes
    }

  } catch (error) {
    return `Error procesando solicitud: ${error.message}`;
  }
}

async function consultarPaciente(data) {
  try {
    const rut = data.rut;

    if (!rut) {
      throw new Error('Faltan campos obligatorios. rut');
    }

    // Consultar datos del paciente
    const queryPaciente = `SELECT * FROM paciente WHERE rut = '${rut}'`;
    const respuestaPaciente = await enviarAlBus(servicioDataB, queryPaciente);

    if (!respuestaPaciente || respuestaPaciente[0] === '0') {
      return 'No hay paciente en el sistema.';
    }

    const paciente = JSON.parse(respuestaPaciente.slice(1))[0];

    // Consultar última admisión del paciente
    const queryAdmision = `
      SELECT * FROM admision 
      WHERE id_paciente = ${paciente.id} 
      ORDER BY fecha_llegada DESC, hora_llegada DESC LIMIT 1
    `;
    const respuestaAdmision = await enviarAlBus(servicioDataB, queryAdmision);

    let admision = JSON.parse(respuestaAdmision.slice(1))[0];
    if (respuestaAdmision && respuestaAdmision[0] !== '0' && admision != undefined) {
    } else {
      admision = { mensaje: 'El paciente no ha sido admitido previamente.' };
    }

    // Devolver paciente y admisión
    return {
      paciente: {
        ...paciente,
        pertenencia_cesfam: paciente.pertenencia_cesfam ? 'Sí' : 'No',
      },
      admision,
    };
  } catch (error) {
    return `Error consultando paciente: ${error.message}`;
  }
}

async function admitirPaciente(data) {
  try {
    const paciente = data.paciente;

    const id_paciente = paciente.id;
    const id_personal_admision = data.user_id;
    const motivo = data.motivo;

    if (!motivo || !paciente || !id_personal_admision) {
      throw new Error('Faltan campos obligatorios. motivo o paciente');
    }

    const estado = 1;
    const fecha_llegada = 'CURRENT_DATE'; // Se usa correctamente sin comillas
    const hora_llegada = 'CURRENT_TIME'; // Se usa correctamente sin comillas

    // Aquí corregimos la interpolación de los valores de la query
    const query = `INSERT INTO admision (id_paciente, id_personal_admision, motivo, estado, fecha_llegada, hora_llegada) VALUES (${id_paciente}, ${id_personal_admision}, '${motivo}', ${estado}, ${fecha_llegada}, ${hora_llegada})`;

    const respuesta = await enviarAlBus(servicioDataB, query);

    if (!respuesta || respuesta[0] === '0') {
      return 'No se hizo admisión.';
    }

    console.log('se admitió correctamente al paciente');

    const queryAdmision = 'SELECT * FROM admision ORDER BY fecha_llegada DESC, hora_llegada DESC LIMIT 1';

    const respuestaAdmision = await enviarAlBus(servicioDataB, queryAdmision);

    const datos = JSON.parse(respuestaAdmision.slice(1));

    if (Array.isArray(datos) && datos.length > 0) {
      const admision = datos[0];
      await aCategorizacion(admision);
      return admision;
    }
  } catch (error) {
    return `Error admitiendo paciente: ${error.message}`;
  }
}

async function registrarPaciente(data) {
  try {
    const paciente = data.paciente; // Paciente con los datos

    if (!paciente) {
      throw new Error('Faltan campos obligatorios.');
    }

    const { 
      rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, 
      sexo, prevision, telefono, correo_electronico, direccion, nacionalidad, pertenencia_cesfam
    } = paciente;

    // Query para insertar al paciente
    const query = `
      INSERT INTO paciente (
        rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, 
        sexo, prevision, telefono, correo_electronico, direccion, nacionalidad, pertenencia_cesfam
      ) VALUES (
        '${rut}', '${nombres}', '${apellido_paterno}', '${apellido_materno}', '${fecha_nacimiento}',
        '${sexo}', '${prevision}', '${telefono}', '${correo_electronico}', '${direccion}', '${nacionalidad}', ${pertenencia_cesfam}
      )
    `;

    const respuesta = await enviarAlBus(servicioDataB, query); // Enviar consulta a la base de datos

    if (!respuesta || respuesta[0] === '0') {
      return 'Error al registrar paciente.';
    }

    // Si la inserción fue exitosa, obtener el último paciente registrado
    const queryUltimoPaciente = 'SELECT * FROM paciente ORDER BY id DESC LIMIT 1';
    const respuestaPaciente = await enviarAlBus(servicioDataB, queryUltimoPaciente);

    if (!respuestaPaciente || respuestaPaciente[0] === '0') {
      return 'No se pudo obtener el paciente registrado.';
    }

    const datos = JSON.parse(respuestaPaciente.slice(1));
    const pacienteRegistrado = datos[0];

    console.log('pacienteRegistrado', pacienteRegistrado);
    return pacienteRegistrado;

  } catch (error) {
    return `Error registrando paciente: ${error.message}`;
  }
}

async function aCategorizacion(admision) {

}

module.exports = {
  procesarMensaje,
};
