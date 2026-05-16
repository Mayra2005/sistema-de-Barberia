const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        const citas = await db.all('SELECT * FROM Citas');
        console.log("Citas:", citas);
    } catch(e) {
        console.error('Error:', e);
    }
}
run();
