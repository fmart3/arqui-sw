const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

function pregunta(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            clearLastLine();
            resolve(answer);
        });
    });
}

function cerrarInput() {
    rl.close(); // Cierra la instancia de readline
}

function clearLastLine() {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
}

function preguntaConConfirmacion(prompt, mensajeConfirmacion) {
    return new Promise(async (resolve) => {
        while (true) {
            const respuesta = await pregunta(prompt);
            const confirmacion = await pregunta('(Enter para confirmar, Otro para reescribir)\n');
            if (confirmacion.trim() === '') {
                resolve(respuesta);
                break;
            }
        }
    });
}

async function obtenerDatoConConfirmacion(prompt) {
    return await preguntaConConfirmacion(prompt, '¿Es correcto el dato?');
}


module.exports = {
    rl,
    pregunta,
    cerrarInput,
    clearLastLine,
    obtenerDatoConConfirmacion, // Nueva función exportada
};
