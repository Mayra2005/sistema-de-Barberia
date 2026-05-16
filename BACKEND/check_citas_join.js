const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        const rows = await db.all(`
            SELECT Citas.*, Clientes.nombre as nombreCliente, Empleados.nombre as nombreEmpleado,
            Estilos.precio as precioEstilo, Promociones.descuento as descuentoPromocion
            FROM Citas 
            LEFT JOIN Clientes ON Citas.idClientes = Clientes.idClientes
            LEFT JOIN Empleados ON Citas.idEmpleados = Empleados.idEmpleados
            LEFT JOIN Estilos ON Citas.idEstilos = Estilos.idEstilos
            LEFT JOIN Promociones ON Citas.idPromociones = Promociones.idPromociones
        `);
        console.log("Joined Citas:", rows);
    } catch(e) {
        console.error('Error:', e);
    }
}
run();
