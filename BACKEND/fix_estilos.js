const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        const count = await db.get('SELECT COUNT(*) as c FROM Estilos');
        if (count.c === 0) {
            await db.run('INSERT INTO Estilos (idEstilos, nombre, descripcion, precio) VALUES (1, "Corte Clásico", "Corte tradicional", 150.00)');
            await db.run('INSERT INTO Estilos (idEstilos, nombre, descripcion, precio) VALUES (2, "Corte + Barba", "Corte y arreglo de barba", 250.00)');
            await db.run('INSERT INTO Estilos (idEstilos, nombre, descripcion, precio) VALUES (3, "Corte Fade", "Corte desvanecido moderno", 200.00)');
            console.log('Estilos agregados exitosamente');
        } else {
            console.log('Ya existen estilos en la bd');
        }
    } catch(e) {
        console.error('Error:', e);
    }
}
run();
