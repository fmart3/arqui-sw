const express = require('express');
const pool = require('./database');
const { pacienteSchema } = require('./validation');

const app = express();
app.use(express.json());

// Endpoint para admitir un paciente
app.post('/admit-patient', async (req, res) => {
    const { error, value } = pacienteSchema.validate(req.body, { abortEarly: false });

    // Validación de datos
    if (error) {
        const mensajes = error.details.map((detalle) => detalle.message);
        return res.status(400).json({ errors: mensajes });
    }

    const {
        rut,
        nombres,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        sexo,
        prevision,
        telefono,
        correo_electronico,
        direccion,
        pertenencia_cesfam,
    } = value;

    try {
        const connection = await pool.getConnection();
        const query = `
            INSERT INTO pacientes (
                rut, nombres, apellido_paterno, apellido_materno,
                fecha_nacimiento, sexo, prevision, telefono,
                correo_electronico, direccion, pertenencia_cesfam
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [
            rut,
            nombres,
            apellido_paterno,
            apellido_materno,
            fecha_nacimiento,
            sexo,
            prevision,
            telefono,
            correo_electronico,
            direccion,
            pertenencia_cesfam,
        ]);
        connection.release();
        res.status(201).send({ message: 'Paciente admitido correctamente' });
    } catch (error) {
        console.error('Error al admitir paciente:', error);
        console.log('Datos recibidos:', req.body);
        res.status(500).send({ error: 'Error al procesar la solicitud' });
    }
});

// Arrancar el servicio
const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Servicio de admisión corriendo en http://localhost:${PORT}`);
});
