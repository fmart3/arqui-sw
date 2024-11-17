// services/admission.js
const readline = require('readline');
const patientService = require('./patientService'); // Asegúrate de que este servicio se conecta a MongoDB

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createPatient() {
    rl.question("Ingrese el RUT del paciente: ", (rut) => {
        rl.question("Ingrese el nombre del paciente: ", (name) => {
            rl.question("Ingrese apellido paterno: ", (apellidoPaterno) => {
                rl.question("Ingrese apellido materno: ", (apellidoMaterno) => {
                    rl.question("Ingrese la fecha de nacimiento (YYYY-MM-DD): ", async (fechaNacimiento) => {
                        const newPatient = {
                            rut,
                            name,
                            apellidoPaterno,
                            apellidoMaterno,
                            fechaNacimiento: new Date(fechaNacimiento)
                        };

                        // Guardar paciente en MongoDB usando el servicio
                        try {
                            await patientService.crearPaciente(newPatient);
                            console.log("Paciente registrado:", newPatient);
                        } catch (error) {
                            console.log("Error al registrar el paciente:", error.message);
                        }
                        
                        rl.close();
                    });
                });
            });
        });
    });
}

function listPatients() {
    patientService.listarPacientes()
        .then(patients => {
            console.log("Listado de Pacientes:");
            patients.forEach((patient, index) => {
                console.log(`${index + 1}. ${patient.name} ${patient.apellidoPaterno} - RUT: ${patient.rut}`);
            });
            rl.close();
        })
        .catch(err => {
            console.log("Error al listar pacientes:", err.message);
            rl.close();
        });
}

module.exports = { createPatient, listPatients };
