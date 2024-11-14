// main.js
const connectDB = require('./config/db');
const patientService = require('./services/patientData');

// Conectar a MongoDB
connectDB();

console.log("Sistema de Gestión Hospitalaria - Consola");

function mainMenu() {
    console.log("\nSeleccione una opción:");
    console.log("1. Registrar un nuevo paciente");
    console.log("2. Listar pacientes");
    console.log("3. Salir");

    process.stdin.once('data', async (input) => {
        const option = input.toString().trim();
        switch (option) {
            case '1':
                // Aquí recolectamos los datos del paciente desde la consola
                const datosPaciente = {
                    rut: "12345678-9",
                    nombres: "Juan",
                    apellido_paterno: "Pérez",
                    apellido_materno: "González",
                    fecha_nacimiento: new Date("1990-01-01"),
                    sexo: "M",
                    prevision: "Fonasa",
                    telefono: "123456789",
                    correo_electronico: "juan.perez@example.com",
                    direccion: "Av. Siempre Viva 123",
                    pertenencia_cesfam: true
                };
                await patientService.crearPaciente(datosPaciente);
                mainMenu();
                break;
            case '2':
                await patientService.listarPacientes();
                mainMenu();
                break;
            case '3':
                console.log("Saliendo...");
                process.exit();
                break;
            default:
                console.log("Opción no válida");
                mainMenu();
                break;
        }
    });
}

mainMenu();
