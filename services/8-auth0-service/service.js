const { client } = require('./configClient');

async function registrarUsuario(usuario) {
    try {
        const queryGetUser = `SELECT * FROM Usuario WHERE rut = '${usuario.rut}'`;
        const respuestaGetUser = await client('datab', { accion: 'select', contenido: queryGetUser });
        if (respuestaGetUser.status === 1 && respuestaGetUser.contenido[0] != null) {
            return { status: 0, contenido: 'El usuario ya existe.'};
        }

        const query = `INSERT INTO Usuario (rut, nombres, apellido_paterno, apellido_materno, cargo, password, estado) VALUES
        ('${usuario.rut}', '${usuario.nombres}', '${usuario.apellido_paterno}', '${usuario.apellido_materno}',
        '${usuario.cargo}', '${usuario.password}', 1)`;

        const respuestaDB = await client('datab', { accion: 'insert', contenido: query });

        if (respuestaDB.status === 0) {
            return { status: 0, contenido: 'Error al registrar el usuario.'};
        }

        //const queryGetUser = `SELECT * FROM Usuario WHERE rut = '${usuario.rut}'`;
        const respuestaGetUser1 = await client('datab', { accion: 'select', contenido: queryGetUser });

        if (respuestaGetUser1.status === 0 || respuestaGetUser1.contenido == []) {
            return { status: 0, contenido: 'Error al obtener el usuario registrado.'};
        }

        return { status: 1, contenido: respuestaGetUser1.contenido[0] };
    } catch (error) {
        return { status: 0, contenido: error.message };
    }
}

async function autenticarUsuario({ rut, password, cargo }) {
    try {
        const query = `SELECT id, rut, nombres, apellido_paterno, apellido_materno, cargo FROM Usuario WHERE rut = '${rut}' AND password = '${password}' and cargo = '${cargo}'`;
        const respuestaDB = await client('datab', { accion:'select', contenido: query });

        //console.log(respuestaDB);

        if (respuestaDB.status === 0) {
            return { status: 0, contenido: 'Credenciales incorrectas.'};
        }
        else if (respuestaDB.status === 1 && respuestaDB.contenido[0] == null) {
            return { status: 0, contenido: 'Credenciales incorrectas.'};
        }
    
        return { status: 1, contenido: respuestaDB.contenido[0]};
    } catch (error) {
        return { status: 0, contenido: error.message };
    }
}

async function logoutUsuario(usuario) {
    try {
        const query = `UPDATE usuario SET estado = 0 WHERE id = '${usuario.id}'`;
        const respuestaDB = await client('datab', { accion: 'update', contenido: query });
        if (respuestaDB.status === 0) {
            return { status: 0, contenido: 'No se pudo cerrar la sesión del usuario.'};
        }
        return { status: 1, contenido: `Sesión cerrada para: ${usuario.nombres} ${usuario.apellido_paterno}.` };

    } catch (error) {
        return { status: 0, contenido: error.message };
    }
}

module.exports = {
    registrarUsuario,
    autenticarUsuario,
    logoutUsuario,
};
