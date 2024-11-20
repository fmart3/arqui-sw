const { pregunta } = require('./inputHandler');
const { enviarAlBus } = require('./configClient');

const servicioAdmision = 'admis'; // Servicio específico para login

async function admissionMenu(user) {
  console.log('\nHola', user);
  console.log('\n--- Admisión de Pacientes ---\n');
  console.log('1. Consultar paciente');
  console.log('9. Volver al menú principal');

  const opcion = await pregunta('\nSeleccione una opción: ');

  switch (opcion.trim()) {
    case '1':
      const  paciente = await consultarPaciente();
      if (paciente) { // hay paciente
        //console.log('access');
        await admitirPaciente(user, paciente);
        //admissionMenu(user);
      } else {
        //registrarPaciente(); // Vuelve al menú si el login falla
        await registrarPaciente(user);
      }
      break;
    case '9':
      return; // Volver al menú principal
    default:
      console.log('\nOpción no válida.');
      admissionMenu(user);
  }
}

async function consultarPaciente() {
  const rut = await pregunta('Ingrese el RUT del paciente (Sin puntos ni guión): ');
  
  const contenido = await enviarAlBus(servicioAdmision, { accion: 'consultar', rut });
  const estado = contenido[0];

  if (estado === '1') {
    paciente = JSON.parse(contenido.substring(1))
    console.log('Paciente encontrado:', paciente);
    return paciente;
  } else {
    console.log('Paciente no registrado.');
    return false;
  }
}

async function admitirPaciente(user, paciente) {
  const user_id = user.id;
  const motivo = await pregunta('Ingrese el Motivo de visita del paciente: ');

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
    console.log('Paciente admitido:', admision);
  } else {
    console.log('Paciente no se pudo admitir.');
  }
  await admissionMenu(user);
}

async function registrarPaciente(user) {
  const rut = await pregunta('Ingrese RUT (Sin puntos ni guión): ');
  const nombres = await pregunta('Nombres: ');
  const apellido_paterno = await pregunta('Apellido paterno: ');
  const apellido_materno = await pregunta('Apellido materno: ');
  const fecha_nacimiento = await pregunta('Fecha de nacimiento (YYYY-MM-DD): ');
  const sexo = await pregunta('Sexo (M/F): ');
  const prevision = await pregunta('Previsión: ');
  const telefono = await pregunta('Teléfono: ');
  const correo_electronico = await pregunta('Correo electrónico: ');
  const direccion = await pregunta('Dirección: ');
  const nacionalidad = await pregunta('Nacionalidad: ');
  const pertenencia_cesfam = (await pregunta('¿Pertenece al CESFAM? (S/N): ')).toLowerCase() === 's';

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
    console.log('Paciente registrado exitosamente:', pacienteRegistrado);

    // Pasar el paciente registrado a la función admitirPaciente
    await admitirPaciente(user, pacienteRegistrado);
  } else {
    console.error('Error al registrar paciente:', respuesta.slice(1));
    await admissionMenu(user);
  }
}

module.exports = {
  admissionMenu,
};
