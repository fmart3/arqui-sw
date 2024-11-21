const { pregunta } = require('./inputHandler');
const { sendMessage } = require('./configClient');

// Servicio correspondiente
const servicioRecepcion = 'recepcion';

// Estados posibles
const estadoPacientes = {
  0: 'A espera de categorización',
  1: 'Categorizado',
  2: 'Asignado',
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

    const pacientes = await sendMessage(servicioRecepcion, 'listarPacientes', { id_usuario: user.id });

    if (pacientes && pacientes.length > 0) {
      console.log('| ID   | Nombre Completo         | Motivo              | Estado                     | Prioridad | Signos Vitales | Fecha Llegada | Hora Llegada |');
      console.log('|------|--------------------------|---------------------|----------------------------|-----------|----------------|---------------|--------------|');

      pacientes.forEach((paciente) => {
        console.log(
          `| ${paciente.id_admision.toString().padEnd(5)} | ${`${paciente.nombre} ${paciente.apellido1} ${paciente.apellido2}`.padEnd(25)} | ${paciente.motivo.padEnd(19)} | ${estadoPacientes[paciente.estado].padEnd(26)} | ${paciente.prioridad || 'N/A'}       | ${paciente.signos_vitales ? 'Sí' : 'No'}           | ${paciente.fecha_llegada.padEnd(13)} | ${paciente.hora_llegada.padEnd(12)} |`
        );
      });

      console.log('\n1. Ver paciente');
      console.log('2. Actualizar tablero');
      console.log('9. Volver al menú principal');

      const opcion = await pregunta('\nSeleccione una opción: ');

      switch (opcion.trim()) {
        case '1':
          const idPaciente = await pregunta('Ingrese el ID del paciente que desea ver: ');
          await consultarPaciente(user, parseInt(idPaciente.trim()));
          break;
        case '2':
          console.clear();
          await mostrarTableroPacientes(user);
          break;
        case '9':
          return;
        default:
          console.log('Opción no válida.');
      }
    } else {
      console.log('No hay pacientes en espera.');
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

module.exports = {
  recepcionMenu,
};
