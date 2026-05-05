const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken } = require('../middlewares/auth');

// Obtener todos los empleados
router.get('/empleados', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT idEmpleados, nombre, rol, telefono, estado FROM Empleados");
        console.log("📋 Empleados enviados:", rows.length); // Para debug
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        res.status(500).json({ error: "Error al obtener empleados" });
    }
});

// Cambiar estado de empleado
router.put('/empleados/:id/estado', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { estado } = req.body;
        await db.run("UPDATE Empleados SET estado = ? WHERE idEmpleados = ?", [estado, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ error: "Error al cambiar estado" });
    }
});

// Crear empleado
router.post('/empleados', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, usuario, contrasena, rol, telefono } = req.body;
        await db.run(
            "INSERT INTO Empleados (nombre, usuario, contrasena, rol, telefono, estado) VALUES (?, ?, ?, ?, ?, 'Activo')",
            [nombre, usuario, contrasena, rol, telefono || '']
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Error al crear empleado:", error);
        res.status(500).json({ error: "Error al crear empleado" });
    }
});

module.exports = router;