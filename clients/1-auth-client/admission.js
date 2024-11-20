const { pregunta, obtenerDatoConConfirmacion } = require('./inputHandler');
const { enviarAlBus } = require('./configClient');

const servicioAdmision = 'admis'; // Servicio específico para login

const estadoAdmisiones = {
  0: 'No admitido',
  1: 'Admitido',
  2: 'En espera de categorización',
  3: 'Alta',
};

async function admissionMenu(user) {
  console.log('\n--- Admisión de Pacientes ---\n');
  console.log('1. Consultar paciente');
  console.log('9. Volver al menú principal');

  const opcion = await pregunta('\nSeleccione una opción: ');

  switch (opcion.trim()) {
    case '1':
      const paciente = await consultarPaciente();
      if (paciente) { // Admitir solo si el usuario elige sí
        await admitirPaciente(user, paciente);
      } else {
        await admissionMenu(user);
      }
      break;
    case '9':
      console.log('Volviendo al menú de inicio de sesión...');
      return; // Termina el menú de admisión y regresa al flujo principal
    default:
      console.log('\nOpción no válida.');
      await admissionMenu(user);
  }
}

async function consultarPaciente() {
  const rut = await pregunta('Ingrese el RUT del paciente (Sin puntos ni guión): ');

  const contenido = await enviarAlBus(servicioAdmision, { accion: 'consultar', rut });
  const estado = contenido[0];

  if (estado === '1') {
    const respuesta = JSON.parse(contenido.substring(1));
    const paciente = respuesta.paciente;
    const admision = respuesta.admision;

    console.log('\nPaciente encontrado:\n');
    console.log(' RUT:', paciente.rut);
    console.log(' Nombres:', paciente.nombres);
    console.log(' Apellido Paterno:', paciente.apellido_paterno);
    console.log(' Apellido Materno:', paciente.apellido_materno);
    console.log(' Fecha de Nacimiento:', paciente.fecha_nacimiento);
    console.log(' Sexo:', paciente.sexo);
    console.log(' Prevision:', paciente.prevision);
    console.log(' Telefono:', paciente.telefono);
    console.log(' Correo electrónico:', paciente.correo_electronico);
    console.log(' Direccion:', paciente.direccion);
    console.log(' Nacionalidad:', paciente.nacionalidad);
    console.log(' Pertenece al CESFAM:', paciente.pertenencia_cesfam ? 'Sí' : 'No');

    if (admision.mensaje) {
      console.log('\nÚltima admisión:\n', admision.mensaje);
    } else {
      console.log('\nÚltima admisión:\n');
      console.log(' Motivo:', admision.motivo);
      console.log(' Estado:', estadoAdmisiones[admision.estado]);
      console.log(' Fecha:', admision.fecha_llegada);
      console.log(' Hora:', admision.hora_llegada);
    }

    // Preguntar si desea admitir al paciente
    const admitir = await pregunta('\n¿Desea admitir a este paciente? (1: Sí, Otro: No): ');
    if (admitir.trim() === '1') {
      return paciente;
    } else {
      console.log('Volviendo al menú de admisión...');
      return false;
    }
  } else {
    console.log('Paciente no registrado.');

    // Preguntar si desea registrar al paciente
    const registrar = await pregunta('\n¿Desea registrar a este paciente? (1: Sí, Otro: No): ');
    if (registrar.trim() === '1') {
      // Registrar al paciente
      return await registrarPacienteFlow(rut);
    } else {
      console.log('Volviendo al menú de admisión...');
      return false;
    }
  }
}

async function admitirPaciente(user, paciente) {
  const user_id = user.id;
  const motivo = await obtenerDatoConConfirmacion('\n+ Ingrese el Motivo de visita del paciente: ');

  // Verificar que el paciente tiene un ID válido
  if (!paciente || !paciente.id) {
    console.error('Error: El paciente no tiene un ID válido.');
    return;
  }

  // Enviar la solicitud de admisión al bus
  const contenido = await enviarAlBus(servicioAdmision, {
    accion: 'admision',
    user_id,
    paciente,
    motivo,
  });

  const estado = contenido[0];

  if (estado === '1') {
    const admision = JSON.parse(contenido.substring(1));
    console.log('\nPaciente admitido:\n');
    console.log(' Motivo:', admision.motivo);
    console.log(' Estado:', estadoAdmisiones[admision.estado]);
    console.log(' Fecha:', admision.fecha_llegada);
    console.log(' Hora:', admision.hora_llegada);
  } else {
    console.log('Paciente no se pudo admitir.');
  }
  await admissionMenu(user);
}

async function registrarPacienteFlow(rut) {
  const nombres = await obtenerDatoConConfirmacion('+ Nombres: ');
  const apellido_paterno = await obtenerDatoConConfirmacion('+ Apellido paterno: ');
  const apellido_materno = await obtenerDatoConConfirmacion('+ Apellido materno: ');
  const fecha_nacimiento = await obtenerDatoConConfirmacion('+ Fecha de nacimiento (YYYY-MM-DD): ');
  const sexo = await obtenerDatoConConfirmacion('+ Sexo (M/F): ');
  const prevision = await obtenerDatoConConfirmacion('+ Previsión: ');
  const telefono = await obtenerDatoConConfirmacion('+ Teléfono: ');
  const correo_electronico = await obtenerDatoConConfirmacion('+ Correo electrónico: ');
  const direccion = await obtenerDatoConConfirmacion('+ Dirección: ');
  const nacionalidad = await obtenerDatoConConfirmacion('+ Nacionalidad: ');
  const pertenencia_cesfam = (await obtenerDatoConConfirmacion('+ ¿Pertenece al CESFAM? (S/N): ')).toLowerCase() === 's';

  const paciente = {
    rut,
    nombres,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    sexo,
    prevision,
    telefono,
    correo_electronico,
    direccion,
    nacionalidad,
    pertenencia_cesfam,
  };

  // Enviar el paciente al servicio de admisión para registro
  const respuesta = await enviarAlBus(servicioAdmision, { accion: 'registrar', paciente });

  if (respuesta.startsWith('1')) {
    // Extraer el objeto paciente registrado desde la respuesta
    const pacienteRegistrado = JSON.parse(respuesta.slice(1)); // Convertir el JSON a objeto
    console.log('\nPaciente registrado:\n');
    console.log(' RUT:', pacienteRegistrado.rut);
    console.log(' Nombres:', pacienteRegistrado.nombres);
    console.log(' Apellido Paterno:', pacienteRegistrado.apellido_paterno);
    console.log(' Apellido Materno:', pacienteRegistrado.apellido_materno);
    console.log(' Fecha de Nacimiento:', pacienteRegistrado.fecha_nacimiento);
    console.log(' Sexo:', pacienteRegistrado.sexo);
    console.log(' Prevision:', pacienteRegistrado.prevision);
    console.log(' Telefono:', pacienteRegistrado.telefono);
    console.log(' Correo electrónico:', pacienteRegistrado.correo_electronico);
    console.log(' Direccion:', pacienteRegistrado.direccion);
    console.log(' Nacionalidad:', pacienteRegistrado.nacionalidad);
    console.log(' Pertenece al CESFAM:', pacienteRegistrado.pertenencia_cesfam ? 'Sí' : 'No');

    // Preguntar si desea admitir al paciente
    const admitir = await pregunta('\n¿Desea admitir a este paciente? (1: Sí, Otro: No): ');
    if (admitir.trim() === '1') {
      return pacienteRegistrado;
    } else {
      console.log('Paciente registrado pero no admitido.');
      return false;
    }
  } else {
    console.error('Error al registrar paciente:', respuesta.slice(1));
    return false;
  }
}

module.exports = {
  admissionMenu,
};
