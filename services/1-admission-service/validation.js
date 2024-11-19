const Joi = require('joi');

// Esquema de validación para los datos de un paciente
const pacienteSchema = Joi.object({
    rut: Joi.string().pattern(/^[0-9]{7,8}-[0-9kK]$/).required().messages({
        'string.pattern.base': 'El RUT debe tener el formato correcto (ejemplo: 12345678-9).',
        'any.required': 'El RUT es obligatorio.',
    }),
    nombres: Joi.string().max(100).required().messages({
        'any.required': 'El nombre es obligatorio.',
        'string.max': 'El nombre no puede exceder los 100 caracteres.',
    }),
    apellido_paterno: Joi.string().max(50).required(),
    apellido_materno: Joi.string().max(50),
    fecha_nacimiento: Joi.date().required(),
    sexo: Joi.string().valid('M', 'F').required(),
    prevision: Joi.string().max(50),
    telefono: Joi.string().pattern(/^[0-9]{9,15}$/),
    correo_electronico: Joi.string().email(),
    direccion: Joi.string().max(200),
    pertenencia_cesfam: Joi.boolean().required(),
});

module.exports = { pacienteSchema };
