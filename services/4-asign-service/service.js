const { client } = require('./configClient');

const servicioDataB = 'datab'; // Servicio de base de datos

// Función para crear o actualizar una asignación
async function crearAsignacion(idCategorizacion) {
  try {
    if (!idCategorizacion) {
      return { status: 0, contenido: 'ID de categorización no proporcionado.' };
    }

    const queryVerificarAsignacion = `
      SELECT id FROM asignacion WHERE id_categorizacion = ${idCategorizacion};
    `;
    const respuestaVerificar = await client(servicioDataB, { accion: 'select', contenido: queryVerificarAsignacion });

    if (respuestaVerificar.status === 0) {
      return { status: 0, contenido: 'Error al verificar la asignación existente.' };
    }

    if (respuestaVerificar.contenido[0] != null) {
      return { status: 1, contenido: 'La asignación ya existe, no se realizaron cambios.' };
    }

    const queryCrearAsignacion = `
      INSERT INTO asignacion (id_categorizacion, id_medico, prioridad, estado)
      VALUES (${idCategorizacion}, NULL, NULL, 0);
    `;
    const respuestaCrear = await client(servicioDataB, { accion: 'insert', contenido: queryCrearAsignacion });

    if (respuestaCrear.status === 0) {
      return { status: 0, contenido: 'Error al crear la asignación.' };
    }

    return { status: 1, contenido: 'Asignación creada correctamente.' };
  } catch (error) {
    return { status: 0, contenido: `Error en crearAsignacion: ${error.message}` };
  }
}

// Función para asignar un médico y calcular prioridad
async function asignar(contenido) {
  try {
      const idMedico = contenido;

      if (!idMedico) {
          return { status: 0, contenido: 'ID del médico no proporcionado.' };
      }

      // Obtener asignaciones no atendidas
      const queryAsignacionesNoAtendidas = `
          SELECT 
              a.id AS id_asignacion, 
              a.id_categorizacion, 
              c.categorizacion, 
              adm.fecha_llegada, 
              adm.hora_llegada
          FROM asignacion a
          JOIN categorizacion c ON a.id_categorizacion = c.id
          JOIN admision adm ON c.id_admision = adm.id
          WHERE a.estado = 0;
      `;

      const respuestaAsignaciones = await client(servicioDataB, { accion: 'select', contenido: queryAsignacionesNoAtendidas });

      if (respuestaAsignaciones.status === 0 || !respuestaAsignaciones.contenido.length) {
          return { status: 0, contenido: 'No se encontraron asignaciones no atendidas.' };
      }

      const asignaciones = respuestaAsignaciones.contenido;

      // Calcular prioridades
      const asignacionesConPrioridad = calcularPrioridad(asignaciones);

      // Actualizar las asignaciones con las nuevas prioridades
      const idsAsignacionesAsignadas = [];
      for (const asignacion of asignacionesConPrioridad) {
          const queryActualizarAsignacion = `
              UPDATE asignacion
              SET id_medico = ${idMedico}, prioridad = ${asignacion.prioridad}, estado = 1
              WHERE id = ${asignacion.id_asignacion};
          `;

          const respuestaActualizar = await client(servicioDataB, { accion: 'update', contenido: queryActualizarAsignacion });

          if (respuestaActualizar.status === 0) {
              return { status: 0, contenido: `Error al actualizar la asignación con ID ${asignacion.id_asignacion}.` };
          }

          idsAsignacionesAsignadas.push(asignacion.id_asignacion);
      }

      return { status: 1, contenido: idsAsignacionesAsignadas };
  } catch (error) {
      return { status: 0, contenido: `Error en asignar: ${error.message}` };
  }
}

// Función para desasignar médicos de asignaciones no atendidas
async function desasignar() {
  try {
    const queryAsignacionesNoAtendidas = `
      SELECT id 
      FROM asignacion 
      WHERE estado = 1;
    `;
    const respuestaAsignaciones = await client(servicioDataB, { accion: 'select', contenido: queryAsignacionesNoAtendidas });

    if (respuestaAsignaciones.status === 0 || respuestaAsignaciones.contenido[0] == null) {
      return { status: 0, contenido: 'No hay asignaciones para desasignar.' };
    }

    const idsDesasignadas = [];
    for (const asignacion of respuestaAsignaciones.contenido) {
      const queryDesasignar = `
        UPDATE asignacion
        SET id_medico = NULL, prioridad = NULL, estado = 0
        WHERE id = ${asignacion.id};
      `;
      const respuestaActualizar = await client(servicioDataB, { accion: 'update', contenido: queryDesasignar });

      if (respuestaActualizar.status === 0) {
        return { status: 0, contenido: `Error al desasignar la asignación con ID ${asignacion.id}.` };
      }

      idsDesasignadas.push(asignacion.id);
    }

    return { status: 1, contenido: idsDesasignadas };
  } catch (error) {
    return { status: 0, contenido: `Error en desasignar: ${error.message}` };
  }
}

// Función modular para calcular prioridad
function calcularPrioridad(asignaciones) {
  // Mapeo de prioridades por categorización
  const prioridadPorCategorizacion = { C1: 1, C2: 2, C3: 3, C4: 4, C5: 5 };

  // Ordenar las asignaciones por categorización (ascendente) y luego por fecha y hora de llegada (ascendente)
  asignaciones.sort((a, b) => {
      const prioridadA = prioridadPorCategorizacion[a.categorizacion] || 5;
      const prioridadB = prioridadPorCategorizacion[b.categorizacion] || 5;

      if (prioridadA !== prioridadB) {
          return prioridadA - prioridadB;
      }

      // Comparar por fecha y hora de llegada
      const fechaHoraA = new Date(`${a.fecha_llegada}T${a.hora_llegada}`);
      const fechaHoraB = new Date(`${b.fecha_llegada}T${b.hora_llegada}`);
      return fechaHoraA - fechaHoraB;
  });

  // Asignar prioridad incremental basada en el orden
  asignaciones.forEach((asignacion, index) => {
      asignacion.prioridad = index + 1; // 1 es la mayor prioridad
  });

  return asignaciones;
}

module.exports = {
  crearAsignacion,
  asignar,
  desasignar,
};
