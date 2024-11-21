const { sendMessage } = require('./configClient');

const servicioDataB = 'datab';

async function procesarMensaje(data) {
  console.log(data);
  const { accion, contenido } = data;
  try {
    switch (accion) {
      case 'recepcion':
        return await recepcionarPaciente(contenido);
      case 'actualizar':
        return await actualizarTablero(contenido);
      case 'paciente':
        return await mostrarPaciente(contenido);
      case 'logout':
        return await logout(contenido);
      default:
        throw new Error('Acción no reconocida.');
    }
  } catch (error) {
    throw new Error(`Error en lógica de recepcion: ${error.message}`);
  }
}

async function recepcionarPaciente(contenido) {
  try {
    const { admision } = contenido;

    if (!admision || !admision.id) {
      throw new Error('Datos de admisión no válidos o incompletos.');
    }

    // Cambiar el estado de admisión a "En espera de categorización"
    const queryActualizarAdmision = `
      UPDATE admision
      SET estado = 2
      WHERE id = ${admision.id};
    `;

    const respuestaActualizacion = await sendMessage(servicioDataB, 'update', { query: queryActualizarAdmision });

    if (!respuestaActualizacion || typeof respuestaActualizacion !== 'object') {
      throw new Error('Error al actualizar el estado de admisión. Respuesta inválida del servicio.');
    }

    // Crear una nueva entrada en la tabla de categorización
    const queryInsertarCategorizacion = `
      INSERT INTO categorizacion (
        id_admision,
        id_funcionario,
        presion_arterial,
        pulso,
        saturacion,
        temperatura_axilar,
        frecuencia_respiratoria,
        alergias_medicamentos,
        otras_alergias,
        categorizacion,
        estado,
        prioridad,
        observaciones,
        fecha_categorizacion,
        hora_categorizacion
      ) VALUES (
        ${admision.id},
        NULL,
        NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, 0,
        NULL, NULL, CURDATE(), CURTIME()
      );
    `;

    const respuestaCategorizacion = await sendMessage(servicioDataB, 'insert', { query: queryInsertarCategorizacion });

    if (!respuestaCategorizacion || typeof respuestaCategorizacion !== 'object') {
      throw new Error('Error al crear la categorización. Respuesta inválida del servicio.');
    }

    console.log('Paciente recepcionado y categorización inicial creada con éxito.');

    return;

  } catch (error) {
    console.error('Error en la función recepcionarPaciente:', error.message);

    return error
  }
}

async function actualizarTablero(contenido) {
  const id_usuario = contenido.id_usuario;

  try {
    await asignarPaciente(id_usuario);

    const query = 'SELECT paciente.id, paciente.nombres, categorizacion.estado FROM paciente, categorizacion, admision ' +
      `WHERE categorizacion.id_funcionario = ${id_usuario} AND categorizacion.estado = 0 AND categorizacion.id_admision = admision.id ` +
      `AND admision.id_paciente = paciente.id`;

    const pacientes = await sendMessage(servicioDataB, 'select', { query });
    if(!pacientes) {
      throw new Error('Error al consultar pacientes para tablero');
    }
    if (pacientes.message) {
      console.log('No hay pacientes');
      return 'No hay pacientes';
    } else if (Array.isArray(pacientes)) {
      return pacientes;
    } else {
      throw new Error('Error inesperado al obtener pacientes');
    }
  } catch (error) {
    console.error('Error en actualizarTablero:', error.message);
    return 'Error en actualizarTablero';
  }
}

async function asignarPaciente(id_usuario) {
  const query = `UPDATE categorizacion SET id_funcionario = ${id_usuario} WHERE id_funcionario IS NULL OR estado = 0`;

  try {
    const respuesta = await sendMessage(servicioDataB, 'update', { query });
    
    if (respuesta.message) {
      console.log(respuesta.message);
      return;
    }
  } catch (error) {
    console.error('Error en asignarPaciente:', error.message);
  }
}


module.exports = {
  procesarMensaje,
};
