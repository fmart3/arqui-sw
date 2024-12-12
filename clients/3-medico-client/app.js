const { pregunta } = require('./inputHandler');
const { client } = require('./configClient');
const {asignarPacientes, desasignarPacientes} = require('./asignacion');
const {atenderPaciente} = require('./atencion');

const servicioAtenc = 'atenc';

const estadoAtencion = {
  0: 'A espera de atender',
  1: 'Atendiendo',
  2: 'Alta'
};

async function medicoMenu(user) {
  while (true) {
    console.clear();
    await desasignarPacientes();
    const pacientes = await asignarPacientes(user);
    await mostrarTablero(user, pacientes);
    console.log('\n\n\n1. Atender paciente');
    console.log('2. Actualizar tablero');
    console.log('9. Volver al menú principal');

    // Capturar la opción del usuario
    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1': {
        const idAsignacion = await pregunta('Ingrese el ID de asignación que desea atender: ');
        await atenderPaciente(idAsignacion);
        break;
      }
      case '2':
        await mostrarTablero(user, pacientes);
        break;
      case '9':
        await desasignarPacientes();
        return;
      default:
        console.log('Opción no válida.');
        await pregunta('\nPresione Enter para continuar...');
    }
  }
}

// Función para mostrar el tablero principal
async function mostrarTablero(user, pacientes) {
  try {
    console.clear();
    console.log('\n--- Tablero de Atención de Pacientes ---\n');

    // Obtener los datos del tablero
    const respuesta = await client(servicioAtenc, { accion: 'actualizar', contenido: pacientes });

    if (respuesta.status === 0) {
      console.error('Error al obtener el tablero de pacientes:', respuesta.contenido || 'Datos no válidos.');
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    //console.log(respuesta.contenido);
    //await pregunta('\nPresione Enter para continuar...');
    //return;

    const asignacion = respuesta.contenido;

    if (!asignacion || asignacion[0] == null) {
      console.log('No hay pacientes en espera.');
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    // Encabezados del tablero
    console.log(
      '| ID asignacion | Rut          | Nombre Completo            | Fecha Llegada | Hora Llegada | Categorización |'
    );
    console.log(
      '|---------------|--------------|----------------------------|---------------|--------------|----------------|'
    );

    // Mostrar los datos
    asignacion.forEach((paciente) => {
      console.log(
        `| ${paciente.id_asignacion.toString().padEnd(13)} | ` +
        `${paciente.rut.padEnd(12)} | ` +
        `${(paciente.nombres + ' ' + paciente.apellido_paterno).padEnd(26)} | ` +
        `${paciente.fecha_llegada.padEnd(13)} | ` +
        `${paciente.hora_llegada.padEnd(12)} | ` +
        `${(paciente.categorizacion !== null ? paciente.categorizacion : 'X').toString().padEnd(14)} | `
        //`${paciente.estado.padEnd(24)}`
        //`${(paciente.prioridad !== null ? paciente.prioridad : 'N/A').toString().padEnd(9)} |`
      );
    });

    return;
  } catch (error) {
    console.error('Error al mostrar el tablero de pacientes:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
}

module.exports = {
  medicoMenu,
};
