const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

// Variable para almacenar la conexión
let dbInstance = null;

async function connectDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Habilitar claves foráneas estrictas
    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    console.log("🔥 Conectado a la base de datos SQLite");

    // Inicializar Tablas
    await initTables(dbInstance);

    return dbInstance;
}

async function initTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Empleados (
            idEmpleados INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            paterno TEXT,
            materno TEXT,
            telefono TEXT,
            horario TEXT,
            estado TEXT,
            especialidad TEXT,
            usuario TEXT NOT NULL UNIQUE,
            contrasena TEXT NOT NULL,
            rol TEXT DEFAULT 'Barbero'
        );

        CREATE TABLE IF NOT EXISTS Clientes (
            idClientes INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            paterno TEXT,
            materno TEXT,
            telefono TEXT,
            correo TEXT
        );

        CREATE TABLE IF NOT EXISTS Estilos (
            idEstilos INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            descripcion TEXT,
            precio REAL
        );

        CREATE TABLE IF NOT EXISTS Citas (
            idCitas INTEGER PRIMARY KEY AUTOINCREMENT,
            idEstilos INTEGER,
            idClientes INTEGER,
            idEmpleados INTEGER,
            fecha TEXT,
            hora TEXT,
            estado TEXT,
            FOREIGN KEY (idEstilos) REFERENCES Estilos(idEstilos),
            FOREIGN KEY (idClientes) REFERENCES Clientes(idClientes),
            FOREIGN KEY (idEmpleados) REFERENCES Empleados(idEmpleados)
        );

        -- Añadir columna idPromociones si no existe
        ALTER TABLE Citas ADD COLUMN idPromociones INTEGER REFERENCES Promociones(idPromociones);
    `).catch(() => { /* Ignorar error si la columna ya existe */ });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Pagos (
            idPagos INTEGER PRIMARY KEY AUTOINCREMENT,
            idCitas INTEGER,
            monto REAL,
            metodo_pago TEXT,
            fecha TEXT,
            FOREIGN KEY (idCitas) REFERENCES Citas(idCitas)
        );

        CREATE TABLE IF NOT EXISTS Promociones (
            idPromociones INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            descripcion TEXT,
            descuento REAL,
            fecha_inicio TEXT,
            fecha_fin TEXT
        );
    `);

    // Crear un empleado dueño por defecto si no existe
    const admin = await db.get("SELECT * FROM Empleados WHERE usuario = 'admin'");
    if (!admin) {
        await db.run(
            "INSERT INTO Empleados (nombre, usuario, contrasena, rol) VALUES ('Admin', 'admin', 'admin123', 'Dueño')"
        );
        console.log("👑 Usuario Dueño por defecto creado (admin/admin123)");
    }

    // Crear un barbero por defecto si no existe
    const barbero = await db.get("SELECT * FROM Empleados WHERE usuario = 'barbero'");
    if (!barbero) {
        await db.run(
            "INSERT INTO Empleados (nombre, usuario, contrasena, rol) VALUES ('Juan Barbero', 'barbero', 'barbero123', 'Barbero')"
        );
        console.log("✂️ Usuario Barbero por defecto creado (barbero/barbero123)");
    }
}

module.exports = connectDB;
