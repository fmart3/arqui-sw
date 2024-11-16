const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const connectDB = require('./config/db');
const patientService = require('./services/patientData');

// Conectar a MongoDB
connectDB();

console.log("Sistema de Gestión Hospitalaria - Consola");

function mainMenu() {
    console.log("URI cargada:", process.env.MONGO_URI);
    console.log("\nSeleccione una opción:");
    console.log("1. Registrar un nuevo paciente");
    console.log("2. Registrar un 2do nuevo paciente");
    console.log("3. Listar pacientes");
    console.log("4. Salir");

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
                // Aquí recolectamos los datos del paciente desde la consola
                const datosPaciente1 = {
                    rut: "98765432-1",
                    nombres: "Pedro",
                    apellido_paterno: "Soto",
                    apellido_materno: "Gutierrez",
                    fecha_nacimiento: new Date("2000-02-02"),
                    sexo: "M",
                    prevision: "Isapre",
                    telefono: "911113333",
                    correo_electronico: "pedro.soto@example.com",
                    direccion: "Av. High Bridge 321",
                    pertenencia_cesfam: false
                };
                await patientService.crearPaciente(datosPaciente1);
                mainMenu();
                break;
            case '3':
                await patientService.listarPacientes();
                mainMenu();
                break;
            case '4':
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
