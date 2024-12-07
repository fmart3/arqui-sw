const { client } = require('./configClient');

const servicioDataB = 'datab';

const estadoPacientes = {
  0: 'A espera de categorización',
  1: 'Categorizado',
  2: 'En atención',
  3: 'Finalizado',
};

async function recepcionarPaciente(contenido) {
  try {
    const admision = contenido;

    if (!admision || !admision.id) {
      return { status: 0, contenido: 'Datos de admisión no válidos o incompletos.' };
    }

    // Cambiar el estado de admisión a "En espera de categorización"
    const queryActualizarAdmision = `
      UPDATE admision
      SET estado = 2
      WHERE id = ${admision.id};
    `;

    const respuestaActualizacion = await client(servicioDataB, { accion: 'update', contenido: queryActualizarAdmision });

    if (respuestaActualizacion.status === 0) {
      return { status: 0, contenido: 'Error al actualizar el estado de admisión.'};
    }

    // Crear una nueva entrada en la tabla de categorización
    const queryInsertarCategorizacion = `
      INSERT INTO categorizacion (
        id_admision,
        id_funcionario,
        categorizacion,
        estado,
        prioridad,
        observaciones,
        fecha_categorizacion,
        hora_categorizacion
      ) VALUES (
        ${admision.id},
        NULL, NULL, 0,
        NULL, NULL, CURRENT_DATE, CURRENT_TIME
      );
    `;

    const respuestaCategorizacion = await client(servicioDataB, {accion: 'insert', contenido: queryInsertarCategorizacion });

    if (respuestaCategorizacion.status === 0) {
      return { status: 0, contenido: 'Error al crear la categorización.'};
    }

    //console.log('Paciente recepcionado y categorización inicial creada con éxito.');
    return { status: 1, contenido: 'Exito al crear la categorización.'};

  } catch (error) {
    //console.error('Error en la función recepcionarPaciente:', error.message);
    return { status: 0, contenido: error.message };
  }
}

async function actualizarTablero() {
  try {
    const query = `
      SELECT 
        c.id AS id_categorizacion,
        p.rut,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        a.fecha_llegada,
        a.hora_llegada,
        c.categorizacion,
        c.estado,
        c.prioridad
      FROM paciente p
      INNER JOIN admision a ON p.id = a.id_paciente
      INNER JOIN categorizacion c ON a.id = c.id_admision
      WHERE c.estado < 3 AND a.estado < 4
      ORDER BY a.fecha_llegada DESC, a.hora_llegada DESC;
    `;

    const respuesta = await client(servicioDataB, { accion: 'select', contenido: query });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al obtener los datos del tablero.' };
    }

    respuesta.contenido.forEach(categorizacion => {
      const estado = estadoPacientes[categorizacion.estado];
      categorizacion.estado = estado;
    });

    return { status: 1, contenido: respuesta.contenido };
  } catch (error) {
    return { status: 0, contenido: `Error en actualizarTablero: ${error.message}` };
  }
}

async function mostrarDetalle(contenido) {
  const idCategorizacion = contenido

  try {
    if (idCategorizacion == null) {
      return { status: 0, contenido: 'Debe proporcionar un ID de categorización válido.' };
    }

    const query = `
      SELECT 
        c.id AS id_categorizacion,
        c.categorizacion,
        c.estado AS estado_categorizacion,
        c.prioridad,
        c.observaciones,
        p.rut,
        CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_completo,
        a.id AS id_admision,
        a.motivo,
        a.fecha_llegada,
        a.hora_llegada
      FROM categorizacion c
      INNER JOIN admision a ON c.id_admision = a.id
      INNER JOIN paciente p ON a.id_paciente = p.id
      WHERE c.id = ${idCategorizacion} AND c.estado < 3;
    `;

    const respuesta = await client(servicioDataB, { accion: 'select', contenido: query });

    if (respuesta.status === 0) {
      return { status: 0, contenido: 'Error al obtener los datos de la categorización.' };
    }

    if (respuesta.contenido == null) {
      return { status: 0, contenido: 'No se encontró la categorización con el ID proporcionado.' };
    }

    const querySignosVitales = `SELECT * FROM signos_vitales WHERE ${respuesta.contenido[0].id_categorizacion} = id_categorizacion`;

    const respuestaSignosVitales = await client(servicioDataB, { accion: 'select', contenido: querySignosVitales });

    let signosVitales = null;

    if (respuestaSignosVitales.status === 1 && respuestaSignosVitales.contenido != null) {
      signosVitales = respuestaSignosVitales.contenido[0];
    }

    const categorizacion = respuesta.contenido[0];
    const datosCategorizacion = {
      idCategorizacion: categorizacion.id_categorizacion,
      categorizacion: categorizacion.categorizacion,
      estado: estadoPacientes[categorizacion.estado_categorizacion], // Traduce el estado si es necesario
      prioridad: categorizacion.prioridad,
      paciente: {
        rut: categorizacion.rut,
        nombre: categorizacion.nombre_completo
      },
      admision: {
        idAdmision: categorizacion.id_admision,
        motivo: categorizacion.motivo,
        observaciones: categorizacion.observaciones,
        fechaLlegada: categorizacion.fecha_llegada,
        horaLlegada: categorizacion.hora_llegada
      },
      signosVitales: signosVitales,
    };

    return { status: 1, contenido: datosCategorizacion };
  } catch (error) {
    return { status: 0, contenido: `Error en mostrarCategorizacion: ${error.message}` };
  }
}

module.exports = {
  recepcionarPaciente,
  actualizarTablero,
  mostrarDetalle
};
