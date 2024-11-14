// admission.js
const readline = require('readline');
const patients = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createPatient() {
    rl.question("Ingrese el RUT del paciente: ", (rut) => {
        rl.question("Ingrese el nombre del paciente: ", (name) => {
            rl.question("Ingrese apellido paterno: ", (apellidoPaterno) => {
                rl.question("Ingrese apellido materno: ", (apellidoMaterno) => {
                    rl.question("Ingrese la fecha de nacimiento (YYYY-MM-DD): ", (fechaNacimiento) => {
                        const newPatient = {
                            rut,
                            name,
                            apellidoPaterno,
                            apellidoMaterno,
                            fechaNacimiento
                        };
                        patients.push(newPatient);
                        console.log("Paciente registrado:", newPatient);
                        rl.close();
                    });
                });
            });
        });
    });
}

function listPatients() {
    console.log("Listado de Pacientes:");
    patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name} ${patient.apellidoPaterno} - RUT: ${patient.rut}`);
    });
    rl.close();
}

module.exports = { createPatient, listPatients };