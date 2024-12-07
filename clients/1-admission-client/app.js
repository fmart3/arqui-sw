const { pregunta, obtenerDatoConConfirmacion } = require('./inputHandler');
const { client } = require('./configClient');

const servicioAdmision = 'admis'; // Servicio específico para admisión
const SERVICIO = 'auth0';
const estadoAdmisiones = {
  0: 'No admitido',
  1: 'Admitido',
  2: 'En espera de categorización',
  3: 'En espera de atención',
  4: 'Alta',
};

async function admissionMenu(user) {
  while (true) {
    console.log('\n--- Admisión de Pacientes ---\n');
    console.log('1. Consultar paciente');
    console.log('2. Ver últimas admisiones');
    console.log('9. Volver al menú principal');

    const opcion = await pregunta('\nSeleccione una opción: ');
    try {
      switch (opcion.trim()) {
        case '1':
          const paciente = await consultarPaciente();
          if (paciente) {
            await admitirPaciente(user, paciente);
          }
          break;

        case '2':
          await admisiones();
          console.clear();
          break;

        case '9':
          await logout(user);
          console.log('Volviendo al menú principal...');
          return; // Termina el menú de admisión y regresa al flujo principal

        default:
          console.clear();
          console.log('Opción no válida. Intente nuevamente.');
      }
    } catch (error) {
      throw new Error('Error en el menú de admisión:', error.message);
    }

  }
}

async function admisiones() {
  try {
    const respuesta = await client(servicioAdmision, { accion: 'mostrar_admisiones' });

    if (respuesta.status === 1 && respuesta.contenido != null) {
      console.clear();
      console.log('\n--- Últimas Admisiones ---\n');

      respuesta.contenido.forEach((admision, index) => {
        console.log(`Admisión #${index + 1}`);
        console.log(` RUT: ${admision.rut}`);
        console.log(` Nombre: ${admision.nombre_completo}`);
        console.log(` ID de Admisión: ${admision.id_admision}`);
        console.log(` Motivo: ${admision.motivo}`);
        console.log(` Estado: ${estadoAdmisiones[admision.estado]}`);
        console.log(` Fecha de llegada: ${admision.fecha_llegada}`);
        console.log(` Hora de llegada: ${admision.hora_llegada}`);
        console.log('----------------------------------');
      });

      await pregunta('\nPresione Enter para volver al menú...');
    } else {
      console.log('\nNo se encontraron admisiones recientes.');
      await pregunta('\nPresione Enter para volver al menú...');
    }
  } catch (error) {
    console.error('Error al obtener las últimas admisiones:', error.message);
  }
}


async function consultarPaciente() {
  const rut = await pregunta('Ingrese el RUT del paciente (Sin puntos ni guión): ');

  if (!/^\d{7,8}[0-9kK]$/.test(rut)) {
    console.log('Formato de RUT inválido. Intente nuevamente.');
    return false;
  }

  try {
    const respuesta = await client(servicioAdmision, { accion: 'consultar', contenido: { rut } });

    if (respuesta.status === 1) {
      const { paciente, admision } = respuesta.contenido;
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
    throw new Error('Error al consultar paciente:', error.message);
  }
}

function mostrarDatosPaciente(paciente, admision) {
  console.clear();
  console.log('\nPaciente encontrado:\n');
  Object.entries(paciente).forEach(([key, value]) => {
    if (key != 'id') {
      console.log(` ${key.replace('_', ' ')}:`, value);
    }
  });


  if (admision.id) {
    console.log('\nÚltima admisión:\n');
    console.log(' Motivo: ', admision.motivo);
    console.log(' Estado: ', estadoAdmisiones[admision.estado]);
    console.log(' Fecha: ', admision.fecha_llegada);
    console.log(' Hora: ', admision.hora_llegada);
  } else {
    console.log('\nEl paciente no tiene admisiones previas.');
  }
}

async function admitirPaciente(user, paciente) {
  const motivo = await obtenerDatoConConfirmacion('\n+ Ingrese el Motivo de visita del paciente: ');

  if (!motivo) {
    console.clear();
    console.log('El motivo de la visita no puede estar vacío.');
    return;
  }

  try {
    const respuesta = await client(servicioAdmision, {
      accion: 'admision', contenido: {
        user_id: user.id,
        paciente,
        motivo,
      }
    });

    if (respuesta.status === 1) {
      const admision = respuesta.contenido;
      console.log('\nPaciente admitido con éxito:\n');
      Object.entries(admision).forEach(([key, value]) => {
        console.log(` ${key}: ${value}`);
      });

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
  const campos = [
    { label: '+ Nombres: ', key: 'nombres' },
    { label: '+ Apellido paterno: ', key: 'apellido_paterno' },
    { label: '+ Apellido materno: ', key: 'apellido_materno' },
    { label: '+ Fecha de nacimiento (YYYY-MM-DD): ', key: 'fecha_nacimiento', regex: /^\d{4}-\d{2}-\d{2}$/ },
    { label: '+ Sexo (M/F): ', key: 'sexo', regex: /^[MF]$/i },
    { label: '+ Previsión: ', key: 'prevision' },
    { label: '+ Teléfono: ', key: 'telefono', regex: /^\d+$/ },
    { label: '+ Correo electrónico: ', key: 'correo_electronico', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { label: '+ Dirección: ', key: 'direccion' },
    { label: '+ Nacionalidad: ', key: 'nacionalidad' },
    { label: '+ ¿Pertenece al CESFAM? (S/N): ', key: 'pertenencia_cesfam', regex: /^[SN]$/i },
  ];

  const datosPaciente = { rut };

  for (const campo of campos) {
    const valor = await obtenerDatoConConfirmacion(campo.label);
    if (campo.regex && !campo.regex.test(valor)) {
      console.clear();
      console.log(`El valor ingresado para "${campo.label}" no es válido. Intente nuevamente.`);
      return false;
    }
    datosPaciente[campo.key] = campo.key === 'pertenencia_cesfam' ? valor.toLowerCase() === 's' : valor;
  }

  try {
    const respuesta = await client(servicioAdmision, { accion: 'registrar', contenido: { paciente: datosPaciente } });
    console.clear();
    console.log('paciente registrado:', respuesta.contenido);
    if (respuesta.status === 1) {
      const admitir = await pregunta('\n¿Desea admitir a este paciente? (1: Sí, Otro: No): ');
      if (admitir.trim() === '1') {
        return respuesta.contenido;
      } else {
        console.clear();
        console.log('Paciente registrado pero no admitido.');
        return false;
      }
    } else {
      console.log('No se pudo registrar el paciente.');
      return false;
    }
  } catch (error) {
    console.error('Error al registrar paciente:', error.message);
    return false;
  }
}

async function logout(user) {
  try {
    const respuesta = await client(SERVICIO, { accion: 'logout', contenido: user });

    if (respuesta.status === 1) {
      console.log('\nSesión cerrada correctamente. Gracias por usar nuestro sistema.');
    } else {
      console.error('\nNo se pudo cerrar la sesión. Intente nuevamente.');
    }
  } catch (error) {
    console.error(`Error al cerrar sesión: ${error.message}`);
  }
}

module.exports = {
  admissionMenu,
};
