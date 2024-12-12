const { pregunta } = require('./inputHandler');
const { client } = require('./configClient');
//const {mostrarDetallesCategorizacion} = require('./app.js');

// Servicio correspondiente
const servicioCateg = 'categ';

// Función para tomar signos vitales
async function tomarSignosVitales(user, idCategorizacion, mostrarDetallesCategorizacion) {
  try {
    console.clear();
    console.log('\n--- Ingresar Signos Vitales ---\n');

    const presionArterial = await pregunta('Presión Arterial (ej: 120/80): ');
    const pulso = parseInt(await pregunta('Pulso: '), 10);
    const saturacion = parseInt(await pregunta('Saturación (%): '), 10);
    const temperaturaAxilar = await pregunta('Temperatura Axilar (°C): ');
    const frecuenciaRespiratoria = parseInt(await pregunta('Frecuencia Respiratoria: '), 10);
    const alergiasMedicamentos = (await pregunta('¿Alergia a medicamentos? (s/n): ')).toLowerCase() === 's';
    const otrasAlergias = (await pregunta('¿Otras alergias? (s/n): ')).toLowerCase() === 's';

    const datos = {
      idCategorizacion,
      presionArterial,
      pulso,
      saturacion,
      temperaturaAxilar,
      frecuenciaRespiratoria,
      alergiasMedicamentos,
      otrasAlergias,
    };

    const respuesta = await client(servicioCateg, { accion: 'signosVitales', contenido: datos });

    if (respuesta.status === 1) {
      console.log('Signos vitales registrados correctamente.');
    } else {
      console.error('Error al registrar los signos vitales:', respuesta.contenido || 'Desconocido.');
    }
    await pregunta('\nPresione Enter para continuar...');
    // Volver a mostrar detalles del paciente
    await mostrarDetallesCategorizacion(user, idCategorizacion);
  } catch (error) {
    console.error('Error al tomar signos vitales:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
  return;
}

// Función para categorizar
async function categorizarPaciente(user, idCategorizacion, mostrarDetallesCategorizacion) {
  try {
    console.clear();
    console.log('\n--- Categorizar Paciente ---\n');

    const nuevaCategorizacion = await pregunta('Ingrese la categorización: ');

    const respuesta = await client(servicioCateg, {
      accion: 'categorizar',
      contenido: { user_id: user.id, idCategorizacion, nuevaCategorizacion },
    });

    if (respuesta.status === 1) {
      console.log('Categorización actualizada correctamente.');
    } else {
      console.error('Error al actualizar la categorización:', respuesta.contenido || 'Desconocido.');
    }

    await pregunta('\nPresione Enter para continuar...');
    // Volver a mostrar detalles del paciente
    await mostrarDetallesCategorizacion(user, idCategorizacion);
  } catch (error) {
    console.error('Error al categorizar al paciente:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
  return;
}

// Función para añadir observaciones
async function observaciones(user, idCategorizacion, mostrarDetallesCategorizacion) {
  try {
    console.clear();
    console.log('\n--- Añadir Observaciones ---\n');

    const nuevasObservaciones = await pregunta('Ingrese las observaciones: ');

    const respuesta = await client(servicioCateg, {
      accion: 'observaciones',
      contenido: { idCategorizacion, nuevasObservaciones },
    });

    if (respuesta.status === 1) {
      console.log('Observaciones añadidas correctamente.');
    } else {
      console.error('Error al añadir las observaciones:', respuesta.contenido || 'Desconocido.');
    }
    await pregunta('\nPresione Enter para continuar...');
    // Volver a mostrar detalles del paciente
    await mostrarDetallesCategorizacion(user, idCategorizacion);
  } catch (error) {
    console.error('Error al añadir observaciones:', error.message);
    await pregunta('\nPresione Enter para continuar...');
  }
  return;
}

module.exports = {
  tomarSignosVitales,
  categorizarPaciente,
  observaciones,
};
