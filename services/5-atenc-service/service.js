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
    const {user_id, id_asignacion} = contenido;
}

module.exports = {
    actualizarTablero,
    atenderPaciente,
};
