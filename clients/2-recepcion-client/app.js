const { pregunta } = require('./inputHandler');
const { sendMessage } = require('./configClient');

// Servicio correspondiente
const servicioRecepcion = 'recep';

// Estados posibles
const estadoPacientes = {
  0: 'A espera de categorización',
  1: 'Categorizado',
  2: 'Asignado',
  3: 'A espera de atención',
  4: 'En atención',
  5: 'Finalizado',
};

// Función principal del menú de recepción
async function recepcionMenu(user) {
  while (true) {
    console.clear();
    console.log('\n--- Recepción de Pacientes ---\n');
    console.log('1. Mostrar tablero de pacientes');
    console.log('9. Volver al menú principal');

    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1':
        await mostrarTableroPacientes(user);
        break;

      case '9':
        await logout();
        console.log('Volviendo al menú principal...');
        return;

      default:
        console.clear();
        console.log('Opción no válida. Intente nuevamente.');
    }
  }
}

// Función para mostrar el tablero principal
async function mostrarTableroPacientes(user) {
  try {
   console.clear();
    console.log('\n--- Tablero de Pacientes ---\n');

    // Obtener los datos del tablero
    const respuesta = await sendMessage(servicioRecepcion, 'actualizar', { id_usuario: user.id });

    if (respuesta === 'No hay pacientes') {
      console.log('No hay pacientes en espera.');
      await pregunta('\nPresione Enter para continuar...');
    } else if (Array.isArray(respuesta)) {
      const pacientes = respuesta;

      // Encabezados del tablero
      console.log('| ID Paciente       | nombres           | estado    |');
      console.log('|-------------------|-------------------|----------------------|');

      // Mostrar los datos
      pacientes.forEach((paciente) => {
        console.log(`| ${paciente.id.toString().padEnd(17)} | ${paciente.nombres.padEnd(17)} | ${estadoPacientes[paciente.estado].toString().padEnd(20)} |`);
      });

      console.log('\n1. Ver detalles de paciente');
      console.log('2. Actualizar tablero');
      console.log('9. Volver al menú principal');

      // Capturar la opción del usuario
      const opcion = await pregunta('\nSeleccione una opción: ');

      switch (opcion.trim()) {
        case '1': {
          const idPaciente = await pregunta('Ingrese el ID del paciente que desea ver: ');
          await consultarPaciente(user, parseInt(idPaciente.trim()));
          break;
        }
        case '2':
          console.clear();
          await mostrarTableroPacientes(user);
          break;
        case '9':
          return;
        default:
          console.log('Opción no válida.');
          break;
      }
    } else {
      console.error('Error al obtener el tablero de pacientes:', respuesta);
      await pregunta('\nPresione Enter para continuar...');
    }
  } catch (error) {
    console.error('Error al mostrar el tablero de pacientes:', error.message);
  }
}


// Función para consultar los detalles de un paciente
async function consultarPaciente(user, paciente_id) {
  try {
    console.clear();
    const paciente = await sendMessage(servicioRecepcion, 'verPaciente', { id_admision: paciente_id });

    if (!paciente) {
      console.log('Paciente no encontrado.');
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n--- Información del Paciente ---\n');
    console.log(`Nombre: ${paciente.nombre} ${paciente.apellido1} ${paciente.apellido2}`);
    console.log(`Motivo: ${paciente.motivo}`);
    console.log(`Estado: ${estadoPacientes[paciente.estado]}`);
    console.log(`Prioridad: ${paciente.prioridad || 'N/A'}`);
    console.log(`Signos vitales registrados: ${paciente.signos_vitales ? 'Sí' : 'No'}`);
    console.log(`Fecha de llegada: ${paciente.fecha_llegada}`);
    console.log(`Hora de llegada: ${paciente.hora_llegada}`);
    console.log(`Observaciones: ${paciente.observaciones || 'Sin observaciones'}`);

    console.log('\n1. Ingresar signos vitales');
    console.log('2. Registrar observaciones');
    console.log('9. Volver al tablero');

    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1':
        await ingresarSignosVitales(user, paciente_id);
        break;
      case '2':
        await registrarObservaciones(user, paciente_id);
        break;
      case '9':
        return;
      default:
        console.log('Opción no válida.');
    }
  } catch (error) {
    console.error('Error al consultar al paciente:', error.message);
  }
}

// Función para ingresar signos vitales
async function ingresarSignosVitales(user, paciente_id) {
  try {
    console.clear();
    console.log('\n--- Ingresar Signos Vitales ---\n');
    const presionArterial = await pregunta('Presión arterial (ej. 120/80): ');
    const pulso = await pregunta('Pulso: ');
    const saturacion = await pregunta('Saturación (%): ');
    const temperatura = await pregunta('Temperatura axilar (°C): ');
    const frecuenciaResp = await pregunta('Frecuencia respiratoria: ');
    const alergiasMed = await pregunta('¿Tiene alergias a medicamentos? (Sí/No): ') === 'Sí';
    const otrasAlergias = await pregunta('¿Tiene otras alergias? (Sí/No): ') === 'Sí';

    const resultado = await sendMessage(servicioRecepcion, 'ingresarSignosVitales', {
      id_admision: paciente_id,
      id_funcionario: user.id,
      presion_arterial: presionArterial,
      pulso: parseInt(pulso),
      saturacion: parseInt(saturacion),
      temperatura_axilar: temperatura,
      frecuencia_respiratoria: parseInt(frecuenciaResp),
      alergias_medicamentos: alergiasMed,
      otras_alergias: otrasAlergias,
    });

    if (resultado) {
      console.log('Signos vitales registrados con éxito.');
    } else {
      console.log('Error al registrar signos vitales.');
    }
  } catch (error) {
    console.error('Error al ingresar signos vitales:', error.message);
  }

  await pregunta('\nPresione Enter para continuar...');
}

// Función para registrar observaciones
async function registrarObservaciones(user, paciente_id) {
  try {
    console.clear();
    const observaciones = await pregunta('Ingrese las observaciones: ');

    const resultado = await sendMessage(servicioRecepcion, 'registrarObservaciones', {
      id_admision: paciente_id,
      id_funcionario: user.id,
      observaciones,
    });

    if (resultado) {
      console.log('Observaciones registradas con éxito.');
    } else {
      console.log('Error al registrar observaciones.');
    }
  } catch (error) {
    console.error('Error al registrar observaciones:', error.message);
  }

  await pregunta('\nPresione Enter para continuar...');
}

async function logout() {
  await sendMessage(servicioRecepcion, 'logout', {bum: 'bum'});
}

module.exports = {
  recepcionMenu,
};
