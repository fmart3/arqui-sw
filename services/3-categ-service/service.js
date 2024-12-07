const { client } = require('./configClient');

const servicioDataB = 'datab'; // Servicio de base de datos
const servicioAsign = 'asign'; // Servicio de asignación

// Diccionario de estados para categorización
const estadoCategorizacion = {
  0: 'A espera de categorización',
  1: 'Categorizado',
  2: 'En atención',
  3: 'Finalizado',
};

// Función para registrar signos vitales
async function signosVitales(contenido) {
  try {
    const {
      idCategorizacion,
      presionArterial,
      pulso,
      saturacion,
      temperaturaAxilar,
      frecuenciaRespiratoria,
      alergiasMedicamentos,
      otrasAlergias,
    } = contenido;

    if (!idCategorizacion) {
      return { status: 0, contenido: 'ID de categorización no proporcionado.' };
    }

    const queryInsertSignos = `
      INSERT INTO signos_vitales (
        id_categorizacion, presion_arterial, pulso, saturacion,
        temperatura_axilar, frecuencia_respiratoria, alergias_medicamentos, otras_alergias,
        fecha_signos_vitales, hora_signos_vitales
      ) VALUES (
        ${idCategorizacion}, '${presionArterial}', ${pulso}, ${saturacion},
        '${temperaturaAxilar}', ${frecuenciaRespiratoria}, ${alergiasMedicamentos ? 1 : 0}, ${otrasAlergias ? 1 : 0},
        CURRENT_DATE, CURRENT_TIME
      );
    `;

    const respuesta = await client(servicioDataB, { accion: 'insert', contenido: queryInsertSignos });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al registrar los signos vitales.' };
    }

    return { status: 1, contenido: 'Signos vitales registrados correctamente.' };
  } catch (error) {
    return { status: 0, contenido: `Error en signosVitales: ${error.message}` };
  }
}

// Función para categorizar un paciente
async function categorizarPaciente(contenido) {
  try {
    const { user_id, idCategorizacion, nuevaCategorizacion } = contenido;

    if (!idCategorizacion || !nuevaCategorizacion) {
      return { status: 0, contenido: 'Datos incompletos para categorizar al paciente.' };
    }

    // Validar y formatear la nueva categorización
    const categoriasValidas = ['C1', 'C2', 'C3', 'C4', 'C5'];
    const categoriaFormateada = nuevaCategorizacion.toUpperCase();

    if (!categoriasValidas.includes(categoriaFormateada)) {
      return { status: 0, contenido: 'Categorización no válida.' };
    }

    // Actualizar categorización y estado
    const queryActualizarCategorizacion = `
      UPDATE categorizacion
      SET categorizacion = '${categoriaFormateada}', estado = 1, id_funcionario = ${user_id}
      WHERE id = ${idCategorizacion};
    `;

    const respuestaCategorizacion = await client(servicioDataB, { accion: 'update', contenido: queryActualizarCategorizacion });

    if (respuestaCategorizacion.status === 0) {
      return { status: 0, contenido: 'Error al actualizar la categorización.' };
    }

    // Obtener el ID de la admisión usando el ID de categorización
    const queryObtenerIdAdmision = `
      SELECT id_admision
      FROM categorizacion
      WHERE id = ${idCategorizacion};
    `;
    const respuestaAdmision = await client(servicioDataB, { accion: 'select', contenido: queryObtenerIdAdmision });

    if (respuestaAdmision.status === 0 || !respuestaAdmision.contenido.length) {
      return { status: 0, contenido: 'No se pudo obtener el ID de admisión.' };
    }

    const idAdmision = respuestaAdmision.contenido[0].id_admision;

    // Actualizar el estado de la admisión
    const queryActualizarAdmision = `
      UPDATE admision
      SET estado = 3
      WHERE id = ${idAdmision};
    `;
    const respuestaEstadoAdmision = await client(servicioDataB, { accion: 'update', contenido: queryActualizarAdmision });

    if (respuestaEstadoAdmision.status === 0) {
      return { status: 0, contenido: 'Error al actualizar el estado de la admisión.' };
    }

    // Asignar categorización al servicio de asignación
    const respuestaAsignacion = await client(servicioAsign, {
      accion: 'crearAsignacion',
      contenido: idCategorizacion,
    });

    if (respuestaAsignacion.status === 0) {
      return { status: 0, contenido: 'Error al asignar categorización al médico.' };
    }

    return { status: 1, contenido: 'Categorización actualizada correctamente' };

  } catch (error) {
    return { status: 0, contenido: `Error en categorizarPaciente: ${error.message}` };
  }
}

// Función para registrar observaciones
async function registrarObservaciones(contenido) {
  try {
    const { idCategorizacion, nuevasObservaciones } = contenido;

    if (!idCategorizacion || !nuevasObservaciones) {
      return { status: 0, contenido: 'Datos incompletos para añadir observaciones.' };
    }

    const queryActualizarObservaciones = `
      UPDATE categorizacion
      SET observaciones = '${nuevasObservaciones}'
      WHERE id = ${idCategorizacion};
    `;

    const respuesta = await client(servicioDataB, { accion: 'update', contenido: queryActualizarObservaciones });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al actualizar las observaciones.' };
    }

    return { status: 1, contenido: 'Observaciones registradas correctamente.' };
  } catch (error) {
    return { status: 0, contenido: `Error en registrarObservaciones: ${error.message}` };
  }
}

module.exports = {
  signosVitales,
  categorizarPaciente,
  registrarObservaciones,
};
