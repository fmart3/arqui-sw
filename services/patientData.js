// services/patientService.js
const Paciente = require('../models/Paciente');

// Función para crear un nuevo paciente en la base de datos
async function crearPaciente(datosPaciente) {
    try {
        const paciente = new Paciente(datosPaciente);
        await paciente.save();
        console.log("Paciente registrado:", paciente);
    } catch (error) {
        console.error("Error al crear paciente:", error.message);
    }
}

// Función para listar todos los pacientes en la base de datos
async function listarPacientes() {
    try {
        const pacientes = await Paciente.find();
        console.log("Listado de Pacientes:");
        pacientes.forEach((paciente, index) => {
            console.log(`${index + 1}. ${paciente.nombres} ${paciente.apellido_paterno} - RUT: ${paciente.rut}`);
        });
    } catch (error) {
        console.error("Error al listar pacientes:", error.message);
    }
}

module.exports = { crearPaciente, listarPacientes };
