const bcrypt = require('bcryptjs');
const { client } = require('./configClient');

// Función para generar el hash de la contraseña
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Función para comparar contraseñas
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Función para registrar el usuario
async function registrarUsuario(usuario) {
    try {
        const queryGetUser = `SELECT * FROM Usuario WHERE rut = '${usuario.rut}'`;
        const respuestaGetUser = await client('datab', { accion: 'select', contenido: queryGetUser });

        if (respuestaGetUser.status === 1 && respuestaGetUser.contenido[0] != null) {
            return { status: 0, contenido: 'El usuario ya existe.' };
        }

        // Generar hash de la contraseña
        const passwordHashed = await hashPassword(usuario.password);

        const query = `
            INSERT INTO Usuario (rut, nombres, apellido_paterno, apellido_materno, cargo, password, estado)
            VALUES ('${usuario.rut}', '${usuario.nombres}', '${usuario.apellido_paterno}', '${usuario.apellido_materno}', 
            '${usuario.cargo}', '${passwordHashed}', 1)
        `;

        const respuestaDB = await client('datab', { accion: 'insert', contenido: query });

        if (respuestaDB.status === 0) {
            return { status: 0, contenido: 'Error al registrar el usuario.' };
        }

        const respuestaGetUser1 = await client('datab', { accion: 'select', contenido: queryGetUser });

        if (respuestaGetUser1.status === 0 || respuestaGetUser1.contenido.length === 0) {
            return { status: 0, contenido: 'Error al obtener el usuario registrado.' };
        }

        return { status: 1, contenido: respuestaGetUser1.contenido[0] };
    } catch (error) {
        return { status: 0, contenido: `Error al registrar usuario: ${error.message}` };
    }
}

// Función para autenticar usuario
async function autenticarUsuario({ rut, password, cargo }) {
    try {
        const query = `
            SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo, password
            FROM Usuario
            WHERE rut = '${rut}' AND cargo = '${cargo}'
        `;
        const respuestaDB = await client('datab', { accion: 'select', contenido: query });

        if (respuestaDB.status === 0 || respuestaDB.contenido[0] == null) {
            return { status: 0, contenido: 'Credenciales incorrectas.' };
        }

        // Comparar contraseñas
        const hashedPassword = respuestaDB.contenido[0].password;
        const esValida = await comparePassword(password, hashedPassword);

        if (!esValida) {
            return { status: 0, contenido: 'Credenciales incorrectas.' };
        }

        return { status: 1, contenido: respuestaDB.contenido[0] };
    } catch (error) {
        return { status: 0, contenido: `Error al autenticar usuario: ${error.message}` };
    }
}

module.exports = {
    registrarUsuario,
    autenticarUsuario,
};
