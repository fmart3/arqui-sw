//main.js
const connectDB = require('./config/db');
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const API_URL = 'http://soabus:5000';  // URL del contenedor "soabus"

connectDB();

console.log("Sistema de Gestión Hospitalaria - Consola");

async function mainMenu() {
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
                try {
                    const newPatient = {
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
                    
                    // Realizar solicitud HTTP para crear el paciente
                    await axios.post(`${API_URL}/pacientes`, newPatient);
                    console.log("Paciente registrado:", newPatient);
                } catch (error) {
                    console.error("Error al registrar paciente:", error.message);
                }
                mainMenu();
                break;
            case '2':
                try {
                    const newPatient = {
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

                    // Realizar solicitud HTTP para crear el segundo paciente
                    await axios.post(`${API_URL}/pacientes`, newPatient);
                    console.log("Paciente registrado:", newPatient);
                } catch (error) {
                    console.error("Error al registrar paciente:", error.message);
                }
                mainMenu();
                break;
            case '3':
                try {
                    // Realizar solicitud HTTP para listar pacientes
                    const response = await axios.get(`${API_URL}/pacientes`);
                    console.log("Listado de pacientes:");
                    response.data.forEach((paciente, index) => {
                        console.log(`${index + 1}. ${paciente.nombres} ${paciente.apellido_paterno} - RUT: ${paciente.rut}`);
                    });
                } catch (error) {
                    console.error("Error al listar pacientes:", error.message);
                }
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
