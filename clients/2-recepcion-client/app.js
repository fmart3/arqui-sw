const { pregunta } = require('./inputHandler');
const { client } = require('./configClient');
const { tomarSignosVitales, categorizarPaciente, observaciones } = require('./categorizacion');

// Servicio correspondiente
const servicioRecepcion = 'recep';

// Función principal del menú de recepción
async function recepcionMenu(user) {
  while (true) {
    console.clear();
    await mostrarTablero(user);
    console.log('\n\n\n1. Ver detalles de categorización');
    console.log('2. Actualizar tablero');
    console.log('9. Volver al menú principal');

    // Capturar la opción del usuario
    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1': {
        const idCategorizacion = await pregunta('Ingrese el ID de categorización que desea ver: ');
        await mostrarDetallesCategorizacion(user, parseInt(idCategorizacion.trim()));
        break;
      }
      case '2':
        await mostrarTablero(user);
        break;
      case '9':
        break;
      default:
        console.log('Opción no válida.');
        await pregunta('\nPresione Enter para continuar...');
        break;
    }
  }
  return;
}

// Función para mostrar el tablero principal
async function mostrarTablero(user) {
  try {
    console.clear();
    console.log('\n--- Tablero de Pacientes ---\n');

    // Obtener los datos del tablero
    const respuesta = await client(servicioRecepcion, { accion: 'actualizar' });

    if (respuesta.status === 0) {
      console.error('Error al obtener el tablero de pacientes:', respuesta.contenido || 'Datos no válidos.');
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    const categorizacion = respuesta.contenido;

    if (!categorizacion || categorizacion.length === 0) {
      console.log('No hay pacientes en espera.');
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    // Encabezados del tablero
    console.log(
      '| ID Categorización | Rut          | Nombre Completo            | Fecha Llegada | Hora Llegada | Categorización | Estado'
    );
    console.log(
      '|-------------------|--------------|----------------------------|---------------|--------------|----------------|--------------------------'
    );

    // Mostrar los datos
    categorizacion.forEach((paciente) => {
      console.log(
        `| ${paciente.id_categorizacion.toString().padEnd(17)} | ` +
        `${paciente.rut.padEnd(12)} | ` +
        `${(paciente.nombres + ' ' + paciente.apellido_paterno).padEnd(26)} | ` +
        `${paciente.fecha_llegada.padEnd(13)} | ` +
        `${paciente.hora_llegada.padEnd(12)} | ` +
        `${(paciente.categorizacion !== null ? paciente.categorizacion : 'X').toString().padEnd(14)} | ` +
        `${paciente.estado.padEnd(24)}`
        //`${(paciente.prioridad !== null ? paciente.prioridad : 'N/A').toString().padEnd(9)} |`
      );
    });

    return;
  } catch (error) {
    console.error('Error al mostrar el tablero de pacientes:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
  return;
}

// Función para mostrar detalles de una categorización
async function mostrarDetallesCategorizacion(user, idCategorizacion) {
  try {
    console.clear();
    console.log('\n--- Detalles de paciente ---\n');

    const respuesta = await client(servicioRecepcion, { accion: 'detalle', contenido: idCategorizacion });

    if (respuesta.status === 0) {
      //console.error('Error al obtener los detalles de la categorización:', respuesta.contenido || 'Datos no válidos.');
      console.log("Número no corresponde a un paciente actual.")
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    const detalles = respuesta.contenido;
    const categorizacion = detalles.categorizacion;
    const observacioness = detalles.admision.observaciones;

    console.log(`ID Categorización: ${detalles.idCategorizacion}`);
    console.log(`Rut: ${detalles.paciente.rut}`);
    console.log(`Nombre: ${detalles.paciente.nombre}`);
    console.log(`Categorización: ${detalles.categorizacion || 'No categorizado'}`);
    console.log(`Estado: ${detalles.estado}`);
    console.log(`Motivo: ${detalles.admision.motivo}`);
    console.log(`Fecha de Llegada: ${detalles.admision.fechaLlegada}`);
    console.log(`Hora de Llegada: ${detalles.admision.horaLlegada}`);
    console.log(`Observaciones: ${detalles.admision.observaciones || 'Sin observaciones'}`);
    console.log('\nSignos vitales:');
    if (detalles.signosVitales == null) {
      console.log(' No se han tomado los signos vitales.');
    } else {
      Object.entries(detalles.signosVitales).forEach(([key, value]) => {
        // Filtrar para no mostrar 'id' ni 'id_categorizacion'
        if (key !== 'id' && key !== 'id_categorizacion') {
          // Reemplazar guiones bajos por espacios para mejor legibilidad
          const formattedKey = key.replace(/_/g, ' ');
          console.log(`   ${formattedKey}:`, value);
        }
      });
    }
    console.log('\n1. Tomar signos vitales');
    console.log('2. Registrar observaciones');
    console.log('3. Categorizar');
    console.log('9. Mostrar tablero');

    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1':
        if (detalles.signosVitales == null) {
          await tomarSignosVitales(user, idCategorizacion, mostrarDetallesCategorizacion);
        } else {
          console.log('\nLos signos vitales ya han sido tomados.');
          await pregunta('\nPresione Enter para continuar...');
          await mostrarDetallesCategorizacion(user, idCategorizacion);
        }
        break;
      case '3':
        if (detalles.signosVitales == null || observacioness == null) {
          console.log('\nPara categorizar un paciente, debe tomar los signos vitales y registrar las observaciones.');
          await pregunta('\nPresione Enter para continuar...');
          await mostrarDetallesCategorizacion(user, idCategorizacion);
        } else if (categorizacion == null) {
          await categorizarPaciente(user, idCategorizacion, mostrarDetallesCategorizacion);
        }
        console.log('\nEl paciente ya ha sido categorizado.');
        await pregunta('\nPresione Enter para continuar...');
        await mostrarDetallesCategorizacion(user, idCategorizacion);
        break;
      case '2':
        if (observacioness == null) {
          await observaciones(user, idCategorizacion, mostrarDetallesCategorizacion);
        } else {
          console.log('\nLas observaciones ya han sido registradas.');
          await pregunta('\nPresione Enter para continuar...');
          await mostrarDetallesCategorizacion(user, idCategorizacion);
        }
        break;
      case '9':
        break;
      default:
        console.log('Opción no válida.');
        await pregunta('\nPresione Enter para continuar...');
        await mostrarDetallesCategorizacion(user, idCategorizacion);
        break;
    }
  } catch (error) {
    console.error('Error al mostrar detalles de categorización:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
  return;
}

module.exports = {
  recepcionMenu,
};
