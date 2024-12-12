const { client } = require('./configClient');
const { pregunta } = require('./inputHandler');

const servicioAtenc = 'atenc';
const servicioAltam = 'altam';
const servicioSolim = 'solim';

async function atenderPaciente(idAsignacion) {
  while (true) {
    console.clear();

    const respuesta = await client(servicioAtenc, { accion: 'atender', contenido: idAsignacion });

    if (respuesta.status === 0) {
      //console.error('Error al obtener los detalles de la categorización:', respuesta.contenido || 'Datos no válidos.');
      console.log("Número no corresponde a un paciente actual.")
      await pregunta('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n--- Atención de Pacientes: Detalles del Paciente ---\n');
    await mostrarDatos(respuesta.contenido);

    const idAtencion = respuesta.contenido.id_atencion;
    const idPaciente = respuesta.contenido.id_paciente;

    console.log('\n\n1. Ingresar Anamnesis');
    console.log('2. Registrar observaciones');
    console.log('3. Ingresar diagnóstico');
    console.log('4. Asignar tratamiento');
    console.log('5. Solicitud de medicamentos');
    console.log('6. Consultar historial de atenciones');
    //console.log('7. Generar derivación (No implementado)');
    //console.log('8. Emitir licencia (No implementado)');
    console.log('9. Finalizar atención');
    console.log('10. Mostrar tablero');

    const opcion = await pregunta('\nSeleccione una opción: ');

    const detalles = respuesta.contenido;

    switch (opcion.trim()) {
      case '1':
        if (detalles.anamnesis == null) {
          const anamnesis = await pregunta('Anamnesis: ');
          await client(servicioAtenc, { accion: 'ingresarAnamnesis', contenido: { idAtencion, anamnesis } });
        } else {
          console.log('\nYa se ha ingresado una Anamnesis.');
          await pregunta('\nPresione Enter para continuar...');
        }
        break;

      case '2':

        if (detalles.observaciones == null) {
          const observaciones = await pregunta('Observaciones: ');
          await client(servicioAtenc, { accion: 'registrarObservaciones', contenido: { idAtencion, observaciones } });
        } else {
          console.log('\nYa se han ingresado Observaciones.');
          await pregunta('\nPresione Enter para continuar...');
        }
        break;

      case '3':

        if (detalles.id_diagnostico == null) {
          const diagnostico = await pregunta('Diagnostico: ');
          const respuestaDiagnostico = await client(servicioAtenc, { accion: 'ingresarDiagnostico', contenido: { idAtencion, diagnostico } });


          if (respuestaDiagnostico.status === 1) {
            console.log('\nDiagnóstico actualizado correctamente.');
          } else {
            console.error('\nError al actualizar diagnóstico:', respuestaDiagnostico.contenido || 'Ocurrió un problema.');
          }

          await pregunta('\nPresione Enter para continuar...');


        } else {
          console.log('\nYa se ha ingresado un Diagnostico.');
          await pregunta('\nPresione Enter para continuar...');
        }
        break;

      case '4':
        const respuesta3 = await client(servicioAltam, { accion: 'asignarTratamiento' });
        if (respuesta3.status === 0) {
          console.log(respuesta3.contenido);
        }
        await pregunta('\nPresione Enter para continuar...');
        break;

      case '5':
        const respuesta0 = await client(servicioSolim, { accion: 'solicitarMedicamentos', contenido: idAtencion });
        if (respuesta0.status === 0) {
          console.log(respuesta0.contenido);
        }
        await pregunta('\nPresione Enter para continuar...');
        break;

      case '6':
        await client(servicioAtenc, { accion: 'consultarHistorial', contenido: idPaciente });
        break;

      //case '7':
        //console.log('Opción no implementada aún.');
        //await pregunta('\nPresione Enter para continuar...');
        //break;

      case '8':
        console.log('Opción no implementada aún.');
        await pregunta('\nPresione Enter para continuar...');
        break;

      case '9':
        const indicaciones = await pregunta('Indicaciones: ');

        if (
          !indicaciones ||
          indicaciones.trim() === '' ||
          !respuesta.contenido ||
          !respuesta.contenido.anamnesis ||
          !respuesta.contenido.id_diagnostico ||
          !respuesta.contenido.observaciones_atencion
        ) {
          console.log('\nError: Hacen falta datos esenciales para completar la atención.');
          console.log('Por favor, registre los datos que faltan antes de finalizar la atención.');
          await pregunta('\nPresione Enter para regresar al menú de atención...');
          break;
        }

        const respuestaAlta = await client(servicioAltam, { accion: 'alta', contenido: { idAtencion, indicaciones } });
        await mostrarDatosAlta(respuestaAlta.contenido);
        console.log('\nAtención finalizada.');
        await pregunta('\nPresione Enter para continuar...');
        return;

      case '10':
        console.log('Mostrando tablero...');
        return;

      default:
        console.log('Opción no válida.');
        await pregunta('\nPresione Enter para continuar...');
    }
  }
}

async function mostrarDatos(contenido) {
  console.log(`Rut: ${contenido.rut}`);
  console.log(`Nombre: ${contenido.nombres} ${contenido.apellido_paterno} ${contenido.apellido_materno}`);
  console.log(`Fecha de Nacimiento: ${contenido.fecha_nacimiento}`);
  console.log(`Sexo: ${contenido.sexo}`);
  console.log(`Motivo de Admisión: ${contenido.motivo}`);
  console.log(`Fecha de Llegada: ${contenido.fecha_llegada}`);
  console.log(`Hora de Llegada: ${contenido.hora_llegada}`);
  console.log(`Categorización: ${contenido.categorizacion}`);
  console.log(`Observaciones de Categorización: ${contenido.observaciones_categorizacion || 'No registradas'}`);
  console.log(`Fecha de Categorización: ${contenido.fecha_categorizacion}`);
  console.log(`Hora de Categorización: ${contenido.hora_categorizacion}`);

  console.log('\n--- Signos Vitales ---');
  console.log(`Presión Arterial: ${contenido.presion_arterial || 'No registrada'}`);
  console.log(`Pulso: ${contenido.pulso || 'No registrado'}`);
  console.log(`Saturación: ${contenido.saturacion || 'No registrada'}`);
  console.log(`Temperatura Axilar: ${contenido.temperatura_axilar || 'No registrada'}`);
  console.log(`Frecuencia Respiratoria: ${contenido.frecuencia_respiratoria || 'No registrada'}`);

  const alergiasMedicamentos = contenido.alergias_medicamentos === 1 ? 'Sí' : 'No';
  const otrasAlergias = contenido.otras_alergias === 1 ? 'Sí' : 'No';

  console.log(`Alergias a Medicamentos: ${alergiasMedicamentos}`);
  console.log(`Otras Alergias: ${otrasAlergias}`);

  console.log('\n--- Datos de Atención ---');
  console.log(`Anamnesis: ${contenido.anamnesis || 'No registrada'}`);
  console.log(`Observaciones: ${contenido.observaciones_atencion || 'No registradas'}`);
  console.log(`Diagnóstico: ${contenido.id_diagnostico || 'No registrado'}`);
}

async function mostrarDatosAlta(contenido) {
  console.log('\n--- Datos de Paciente ---');
  console.log(`Rut: ${contenido.rut}`);
  console.log(`Nombre: ${contenido.nombres} ${contenido.apellido_paterno} ${contenido.apellido_materno}`);
  console.log(`Fecha de Nacimiento: ${contenido.fecha_nacimiento}`);
  console.log(`Sexo: ${contenido.sexo}`);
  console.log(`Motivo de Admisión: ${contenido.motivo}`);


  console.log('\n--- Datos de Atención ---');
  console.log(`Anamnesis: ${contenido.anamnesis || 'No registrada'}`);
  console.log(`Observaciones: ${contenido.observaciones_atencion || 'No registradas'}`);
  console.log(`Diagnóstico: ${contenido.id_diagnostico || 'No registrado'}`);

  console.log('\n--- Datos de Alta ---');
  console.log(`Indicaciones: ${contenido.indicaciones_alta || 'No registradas'}`);
  // seleecione cuantos medicamentos va a prescribir 2
  // nombre medicamento paracegtamol 500 gr, cantidad, frecuencia horas y duracion en dias
}

module.exports = {
  atenderPaciente,
};
