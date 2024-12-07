const { client } = require('./configClient');

const servicioDataB = 'datab'; // Servicio de base de datos

const estadoAtencion = {
    0: 'A espera de atender',
    1: 'Atendiendo',
    2: 'Alta'
};

async function actualizarTablero(contenido) {
    const asignaciones_id = contenido;

    try {
        // Consulta SQL para obtener los datos de la asignación, categorización y paciente
        const query = `
            SELECT
                a.id AS id_categorizacion,
                p.rut,
                p.nombres,
                p.apellido_paterno,
                p.apellido_materno,
                a.fecha_llegada,
                a.hora_llegada,
                c.categorizacion,
                c.estado AS estado_categorizacion,
                c.prioridad AS prioridad_categorizacion,
                s.id AS id_asignacion,
                s.prioridad AS prioridad_asignacion,
                s.estado AS estado_asignacion
            FROM paciente p
            INNER JOIN admision a ON p.id = a.id_paciente
            INNER JOIN categorizacion c ON a.id = c.id_admision
            LEFT JOIN asignacion s ON c.id = s.id_categorizacion
            WHERE s.id IN (${asignaciones_id.join(', ')}) AND c.estado < 4 AND a.estado < 4
            ORDER BY s.prioridad ASC, a.fecha_llegada DESC, a.hora_llegada DESC;
        `;

        const respuesta = await client(servicioDataB, { accion: 'select', contenido: query });

        if (respuesta.status === 0) {
            return { status: 0, contenido: 'Error al obtener los datos del tablero.' };
        }

        // Procesar la respuesta y agregar el estado de atención
        respuesta.contenido.forEach(categorizacion => {
            const estado = estadoAtencion[categorizacion.estado_asignacion];
            categorizacion.estado_asignacion = estado;
        });

        // Retornar los datos obtenidos
        return { status: 1, contenido: respuesta.contenido };

    } catch (error) {
        return { status: 0, contenido: `Error en actualizarTablero: ${error.message}` };
    }
}

async function atenderPaciente(contenido) {
    const id_asignacion = contenido;
    try {
        if (!id_asignacion) {
            return { status: 0, contenido: 'ID de asignación no proporcionado.' };
        }

        // Verificar si ya existe un registro en la tabla atención para el ID de asignación
        const verificarAtencionQuery = `
            SELECT id
            FROM atencion
            WHERE id_asignacion = ${id_asignacion};
        `;

        const respuestaVerificar = await client(servicioDataB, { accion: 'select', contenido: verificarAtencionQuery });

        if (respuestaVerificar.status === 0) {
            return { status: 0, contenido: 'Error al verificar la existencia en la tabla atención.' };
        }

        if (respuestaVerificar.contenido[0] == null) {
            // Crear un nuevo registro en la tabla atencion
            const insertarAtencionQuery = `
                INSERT INTO atencion (id_asignacion, estado, fecha_atencion, hora_atencion)
                VALUES (${id_asignacion}, 1, CURRENT_DATE, CURRENT_TIME);
            `;

            const respuestaInsertar = await client(servicioDataB, { accion: 'insert', contenido: insertarAtencionQuery });

            if (respuestaInsertar.status === 0) {
                return { status: 0, contenido: 'Error al insertar el nuevo registro en la tabla atención.' };
            }
        }

        // Realizar la consulta "gigante" para obtener toda la información relacionada
        const datosPacienteQuery = `
            SELECT
                p.id AS id_paciente,
                p.rut,
                p.nombres,
                p.apellido_paterno,
                p.apellido_materno,
                p.fecha_nacimiento,
                p.sexo,
                adm.motivo,
                adm.fecha_llegada,
                adm.hora_llegada,
                c.categorizacion,
                c.observaciones AS observaciones_categorizacion,
                c.fecha_categorizacion,
                c.hora_categorizacion,
                sv.presion_arterial,
                sv.pulso,
                sv.saturacion,
                sv.temperatura_axilar,
                sv.frecuencia_respiratoria,
                sv.alergias_medicamentos,
                sv.otras_alergias,
                at.id as id_atencion,
                at.anamnesis,
                at.observaciones AS observaciones_atencion,
                at.id_diagnostico,
                at.fecha_atencion,
                at.hora_atencion
            FROM asignacion a
            INNER JOIN categorizacion c ON a.id_categorizacion = c.id
            INNER JOIN admision adm ON c.id_admision = adm.id
            INNER JOIN paciente p ON adm.id_paciente = p.id
            LEFT JOIN signos_vitales sv ON c.id = sv.id_categorizacion
            LEFT JOIN atencion at ON a.id = at.id_asignacion
            WHERE a.id = ${id_asignacion};
        `;

        const respuestaDatosPaciente = await client(servicioDataB, { accion: 'select', contenido: datosPacienteQuery });

        if (respuestaDatosPaciente.status === 0 || respuestaDatosPaciente.contenido[0] == null) {
            return { status: 0, contenido: 'Error al obtener los datos del paciente o no se encontró información.' };
        }

        // Retornar los datos obtenidos
        return { status: 1, contenido: respuestaDatosPaciente.contenido[0] };
    } catch (error) {
        return { status: 0, contenido: `Error en atenderPaciente: ${error.message}` };
    }
}

async function ingresarAnamnesis(contenido) {
    const { idAtencion, anamnesis } = contenido;
    try {
      const query = `
        UPDATE atencion
        SET anamnesis = '${anamnesis}'
        WHERE id = ${idAtencion};
      `;
      const respuesta = await client(servicioDataB, { accion: 'update', contenido: query });
      return respuesta.status === 1
        ? { status: 1, contenido: 'Anamnesis actualizada correctamente.' }
        : { status: 0, contenido: 'Error al actualizar anamnesis.' };
    } catch (error) {
      return { status: 0, contenido: `Error en ingresarAnamnesis: ${error.message}` };
    }
  }
  
  async function registrarObservaciones(contenido) {
    const { idAtencion, observaciones } = contenido;
    try {
      const query = `
        UPDATE atencion
        SET observaciones = '${observaciones}'
        WHERE id = ${idAtencion};
      `;
      const respuesta = await client(servicioDataB, { accion: 'update', contenido: query });
      return respuesta.status === 1
        ? { status: 1, contenido: 'Observaciones actualizadas correctamente.' }
        : { status: 0, contenido: 'Error al actualizar observaciones.' };
    } catch (error) {
      return { status: 0, contenido: `Error en registrarObservaciones: ${error.message}` };
    }
  }
  
  async function ingresarDiagnostico(contenido) {
    const { idAtencion, diagnostico } = contenido;
    try {
      const query = `
        UPDATE atencion
        SET diagnostico = '${diagnostico}'
        WHERE id = ${idAtencion};
      `;
      const respuesta = await client(servicioDataB, { accion: 'update', contenido: query });
      return respuesta.status === 1
        ? { status: 1, contenido: 'Diagnóstico actualizado correctamente.' }
        : { status: 0, contenido: 'Error al actualizar diagnóstico.' };
    } catch (error) {
      return { status: 0, contenido: `Error en ingresarDiagnostico: ${error.message}` };
    }
  }
  
  module.exports = {
    actualizarTablero,
    atenderPaciente,
    ingresarAnamnesis,
    registrarObservaciones,
    ingresarDiagnostico,
  };