const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken, soloDueño } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT * FROM Empleados");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener empleados" });
    }
});

router.post('/', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, paterno, materno, telefono, horario, estado, especialidad, usuario, contrasena, rol } = req.body;
        await db.run(
            "INSERT INTO Empleados (nombre, paterno, materno, telefono, horario, estado, especialidad, usuario, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nombre, paterno, materno, telefono, horario, estado, especialidad, usuario, contrasena, rol]
        );
        res.json({ success: true, mensaje: "Empleado creado" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear empleado" });
    }
});

router.delete('/:id', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        await db.run("DELETE FROM Empleados WHERE idEmpleados = ?", [req.params.id]);
        res.json({ success: true, mensaje: "Empleado eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar empleado" });
    }
});

router.put('/:id/estado', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { estado } = req.body;
        await db.run("UPDATE Empleados SET estado = ? WHERE idEmpleados = ?", [estado, req.params.id]);
        res.json({ success: true, mensaje: "Estado actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar estado" });
    }
});

module.exports = router;
