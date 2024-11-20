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

module.exports = {
    rl,
    pregunta,
    cerrarInput,
};
