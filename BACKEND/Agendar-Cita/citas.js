const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all(`
            SELECT Citas.*, Clientes.nombre as nombreCliente, Empleados.nombre as nombreEmpleado 
            FROM Citas 
            LEFT JOIN Clientes ON Citas.idClientes = Clientes.idClientes
            LEFT JOIN Empleados ON Citas.idEmpleados = Empleados.idEmpleados
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener citas" });
    }
});

router.post('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { idEstilos, nombreCliente, telefonoCliente, idEmpleados, fecha, hora, estado } = req.body;
        
        // 1. Crear o buscar al cliente por nombre
        let idClientes;
        const clienteExistente = await db.get("SELECT idClientes FROM Clientes WHERE nombre = ?", [nombreCliente]);
        
        if (clienteExistente) {
            idClientes = clienteExistente.idClientes;
        } else {
            const result = await db.run(
                "INSERT INTO Clientes (nombre, telefono, paterno, materno, correo) VALUES (?, ?, '', '', '')",
                [nombreCliente, telefonoCliente || '']
            );
            idClientes = result.lastID;
        }

        // 2. Crear la cita usando el idCliente obtenido
        await db.run(
            "INSERT INTO Citas (idEstilos, idClientes, idEmpleados, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, ?)",
            [idEstilos, idClientes, idEmpleados, fecha, hora, estado]
        );
        res.json({ success: true, mensaje: "Cita creada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear cita" });
    }
});

router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const id = req.params.id;
        await db.run("DELETE FROM Citas WHERE idCitas = ?", [id]);
        res.json({ success: true, mensaje: "Cita cancelada" });
    } catch (error) {
        res.status(500).json({ error: "Error al cancelar cita" });
    }
});

router.put('/:id', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { fecha, hora } = req.body;
        await db.run(
            "UPDATE Citas SET fecha = ?, hora = ? WHERE idCitas = ?",
            [fecha, hora, req.params.id]
        );
        res.json({ success: true, mensaje: "Cita actualizada" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar cita" });
    }
});

router.put('/:id/detalles', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { idEstilos, idPromociones } = req.body;
        await db.run(
            "UPDATE Citas SET idEstilos = ?, idPromociones = ? WHERE idCitas = ?",
            [idEstilos || null, idPromociones || null, req.params.id]
        );
        res.json({ success: true, mensaje: "Detalles asignados a la cita" });
    } catch (error) {
        res.status(500).json({ error: "Error al asignar detalles a cita" });
    }
});

module.exports = router;
