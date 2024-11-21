const { pregunta, obtenerDatoConConfirmacion } = require('./inputHandler');
const { sendMessage } = require('./configClient');

const servicioAdmision = 'admis'; // Servicio específico para admisión

const estadoAdmisiones = {
  0: 'No admitido',
  1: 'Admitido',
  2: 'En espera de categorización',
  3: 'Alta',
};

async function admissionMenu(user) {
  while (true) {
    console.log('\n--- Admisión de Pacientes ---\n');
    console.log('1. Consultar paciente');
    console.log('9. Volver al menú principal');

    const opcion = await pregunta('\nSeleccione una opción: ');

    switch (opcion.trim()) {
      case '1':
        const paciente = await consultarPaciente();
        if (paciente) {
          await admitirPaciente(user, paciente);
        }
        break;

      case '9':
        console.log('Volviendo al menú principal...');
        return; // Termina el menú de admisión y regresa al flujo principal

      default:
        console.clear();
        console.log('Opción no válida. Intente nuevamente.');
    }
  }
}

async function consultarPaciente() {
  const rut = await pregunta('Ingrese el RUT del paciente (Sin puntos ni guión): ');

  try {
    const respuesta = await sendMessage(servicioAdmision, 'consultar', { rut });

    if (respuesta) {
      const { paciente, admision } = respuesta;
      mostrarDatosPaciente(paciente, admision);

      const admitir = await pregunta('\n¿Desea admitir a este paciente? (1: Sí, Otro: No): ');
      if (admitir.trim() === '1') {
        return paciente;
      } else {
        console.clear();
        console.log('Paciente no admitido.');
        return false;
      }
    } else {
      console.log('\nPaciente no registrado.');

      const registrar = await pregunta('\n¿Desea registrar a este paciente? (1: Sí, Otro: No): ');
      if (registrar.trim() === '1') {
        return await registrarPacienteFlow(rut);
      } else {
        console.clear();
        console.log('Paciente no admitido.');
        return false;
      }
    }
  } catch (error) {
    console.error('Error al consultar paciente:', error.message);
    return false;
  }
}

function mostrarDatosPaciente(paciente, admision) {
  console.clear();
  console.log('\nPaciente encontrado:\n');
  Object.entries(paciente).forEach(([key, value]) => {
    console.log(` ${key.replace('_', ' ')}:`, value);
  });

  if (admision) {
    console.log('\nÚltima admisión:\n');
    console.log(' Motivo:', admision.motivo);
    console.log(' Estado:', estadoAdmisiones[admision.estado]);
    console.log(' Fecha:', admision.fecha_llegada);
    console.log(' Hora:', admision.hora_llegada);
  } else {
    console.log('\nEl paciente no tiene admisiones previas.');
  }
}

async function admitirPaciente(user, paciente) {
  const motivo = await obtenerDatoConConfirmacion('\n+ Ingrese el Motivo de visita del paciente: ');

  try {
    const respuesta = await sendMessage(servicioAdmision, 'admision', {
      user_id: user.id,
      paciente,
      motivo,
    });

    if (respuesta) {
      const admision = respuesta;
      console.log('\nPaciente admitido con éxito:\n');
      console.log(' id_admision:', admision.id);
      console.log(' id_paciente:', admision.id_paciente);
      console.log(' Motivo:', admision.motivo);
      console.log(' Estado:', estadoAdmisiones[admision.estado]);
      console.log(' Fecha:', admision.fecha_llegada);
      console.log(' Hora:', admision.hora_llegada);

      // Esperar a que el usuario presione Enter antes de continuar
      await pregunta('\nPresione Enter para continuar...');
      console.clear();
    } else {
      console.log('No se pudo admitir al paciente.');
    }
  } catch (error) {
    console.error('Error al admitir paciente:', error.message);
  }
}

async function registrarPacienteFlow(rut) {
  const datosPaciente = {
    rut,
    nombres: await obtenerDatoConConfirmacion('+ Nombres: '),
    apellido_paterno: await obtenerDatoConConfirmacion('+ Apellido paterno: '),
    apellido_materno: await obtenerDatoConConfirmacion('+ Apellido materno: '),
    fecha_nacimiento: await obtenerDatoConConfirmacion('+ Fecha de nacimiento (YYYY-MM-DD): '),
    sexo: await obtenerDatoConConfirmacion('+ Sexo (M/F): '),
    prevision: await obtenerDatoConConfirmacion('+ Previsión: '),
    telefono: await obtenerDatoConConfirmacion('+ Teléfono: '),
    correo_electronico: await obtenerDatoConConfirmacion('+ Correo electrónico: '),
    direccion: await obtenerDatoConConfirmacion('+ Dirección: '),
    nacionalidad: await obtenerDatoConConfirmacion('+ Nacionalidad: '),
    pertenencia_cesfam: (await obtenerDatoConConfirmacion('+ ¿Pertenece al CESFAM? (S/N): ')).toLowerCase() === 's',
  };

  try {
    const respuesta = await sendMessage(servicioAdmision, 'registrar', { paciente: datosPaciente });
    console.clear();
    console.log('paciente registrado:', respuesta);
    if (respuesta) {
      const admitir = await pregunta('\n¿Desea admitir a este paciente? (1: Sí, Otro: No): ');
      if (admitir.trim() === '1') {
        return respuesta;
      } else {
        console.clear();
        console.log('Paciente registrado pero no admitido.');
        return false;
      }
    } else {
      console.log('Error al registrar el paciente.');
      return false;
    }
  } catch (error) {
    console.error('Error al registrar paciente:', error.message);
    return false;
  }
}

module.exports = {
  admissionMenu,
};
