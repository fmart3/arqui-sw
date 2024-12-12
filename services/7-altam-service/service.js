const { client } = require('./configClient');

const servicioDataB = 'datab'; // Servicio de base de datos

async function altaPaciente(contenido) {
  const { idAtencion, indicaciones } = contenido;

  try {

    const verificarCampos = `
      SELECT *
      FROM atencion
      WHERE id = ${idAtencion}
      AND (
        id_asignacion IS NULL OR
        id_diagnostico IS NULL OR
        anamnesis IS NULL OR
        observaciones IS NULL
      );
    `;

    const resultadoVerificacion = await client(servicioDataB, { accion: 'select', contenido: verificarCampos });

    if (resultadoVerificacion.length > 0) {
      return { status: 0, contenido: 'Error: Hacen falta datos de atención.' };
    }

    const queryAlta = `
      INSERT INTO alta (
        id_atencion, indicaciones, fecha_alta, hora_alta
      ) VALUES (
        ${idAtencion}, '${indicaciones}', CURRENT_DATE, CURRENT_TIME
      );
    `;

    const respuestaAlta = await client(servicioDataB, { accion: 'insert', contenido: queryAlta });

    if (respuestaAlta.status !== 1) {
      return { status: 0, contenido: 'Error al crear alta.' };
    }

    const actualizarAtencion = `
      UPDATE atencion
      SET estado = 2
      WHERE id = ${idAtencion};
    `;


    const actualizarAdmision = `
      UPDATE admision
      SET estado = 4
      WHERE id = (
        SELECT id_admision
        FROM categorizacion
        WHERE id = (
          SELECT id_categorizacion
          FROM asignacion
          WHERE id = (
            SELECT id_asignacion
            FROM atencion
            WHERE id = ${idAtencion}
          )
        )
      );
    `;


    const actualizarCategorizacion = `
      UPDATE categorizacion
      SET estado = 3
      WHERE id = (
        SELECT id_categorizacion
        FROM asignacion
        WHERE id = (
          SELECT id_asignacion
          FROM atencion
          WHERE id = ${idAtencion}
        )
      );
    `;

    const respuestaAtencion = await client(servicioDataB, { accion: 'update', contenido: actualizarAtencion });

    if (respuestaAtencion.status !== 1) {
      return { status: 0, contenido: 'Error al actualizar estado de atención.' };
    }

    const respuestaAdmision = await client(servicioDataB, { accion: 'update', contenido: actualizarAdmision });

    if (respuestaAdmision.status !== 1) {
      return { status: 0, contenido: 'Error al actualizar estado de admisión.' };
    }

    const respuestaCategorizacion = await client(servicioDataB, { accion: 'update', contenido: actualizarCategorizacion });

    if (respuestaCategorizacion.status !== 1) {
      return { status: 0, contenido: 'Error al actualizar estado de categorización.' };
    }

    const datosPacienteQuery = `
              SELECT
            p.rut,
            p.nombres,
            p.apellido_paterno,
            p.apellido_materno,
            p.fecha_nacimiento,
            p.sexo,
            adm.motivo,
            at.anamnesis,
            at.observaciones AS observaciones_atencion,
            at.id_diagnostico,
            alta.indicaciones AS indicaciones_alta
            FROM asignacion a
            INNER JOIN categorizacion c ON a.id_categorizacion = c.id
            INNER JOIN admision adm ON c.id_admision = adm.id
            INNER JOIN paciente p ON adm.id_paciente = p.id
            LEFT JOIN atencion at ON a.id = at.id_asignacion
            LEFT JOIN alta ON at.id = alta.id_atencion
            WHERE at.id = ${idAtencion};
          `;

    const respuestaDatosPaciente = await client(servicioDataB, { accion: 'select', contenido: datosPacienteQuery });

    if (respuestaDatosPaciente.status === 0 || respuestaDatosPaciente.contenido[0] == null) {
      return { status: 0, contenido: 'Error al obtener los datos del paciente o no se encontró información.' };
    }

    return { status: 1, contenido: respuestaDatosPaciente.contenido[0] };

    //return { status: 1, contenido: 'Alta creada y estados actualizados correctamente.' };

  } catch (error) {
    return { status: 0, contenido: `Error en altaPaciente: ${error.message}` };
  }

}


module.exports = {
  altaPaciente
};
