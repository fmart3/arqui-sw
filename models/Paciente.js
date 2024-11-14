// models/Paciente.js
const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    rut: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellido_paterno: { type: String, required: true },
    apellido_materno: { type: String, required: true },
    fecha_nacimiento: { type: Date, required: true },
    sexo: { type: String, enum: ['M', 'F'], required: true },
    prevision: { type: String, required: true },
    telefono: { type: String },
    correo_electronico: { type: String, unique: true },
    direccion: { type: String },
    pertenencia_cesfam: { type: Boolean, default: false }
});

module.exports = mongoose.model('Paciente', pacienteSchema);
