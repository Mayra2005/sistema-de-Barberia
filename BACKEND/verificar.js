const connectDB = require('./DB.JS');

async function verificar() {
    try {
        const db = await connectDB();

        // Ver todos los empleados
        const empleados = await db.all("SELECT idEmpleados, nombre, usuario, rol FROM Empleados");

        console.log("\n📋 EMPLEADOS EN LA BASE DE DATOS:");
        console.log("=================================");

        if (empleados.length === 0) {
            console.log("❌ No hay empleados registrados");
        } else {
            console.log(`✅ Total: ${empleados.length} empleados\n`);
            empleados.forEach(emp => {
                console.log(`ID: ${emp.idEmpleados} | Nombre: ${emp.nombre} | Usuario: ${emp.usuario} | Rol: ${emp.rol}`);
            });
        }

        console.log("\n📂 Ruta de la base de datos:", require('path').join(__dirname, 'database.sqlite'));

    } catch (error) {
        console.error("Error:", error.message);
    }
}

verificar();