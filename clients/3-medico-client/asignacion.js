const { client } = require('./configClient');
const { pregunta } = require('./inputHandler');

const servicioAsign = 'asign';

async function asignarPacientes(user) {
    const user_id = user.id;
    try {
        const respuesta = await client(servicioAsign, { accion: 'asignar', contenido: user_id });
        if (respuesta.status === 0) {
            console.error('Error al asignar pacientes:', respuesta.contenido || 'Datos no válidos.');
            await pregunta('\nPresione Enter para continuar...');
        }
        return respuesta.contenido;
    } catch (error) {
        console.error('Error al asignar pacientes:', error.message);
    }
}

async function desasignarPacientes() {
    try {
        const respuesta = await client(servicioAsign, { accion: 'desasignar' });
        if (respuesta.status === 0) {
            console.error('Error al desasignar pacientes:', respuesta.contenido || 'Datos no válidos.');
        }
    } catch (error) {
        console.error('Error al desasignar pacientes:', error.message);
    }
}

module.exports = {
    asignarPacientes,
    desasignarPacientes,
};