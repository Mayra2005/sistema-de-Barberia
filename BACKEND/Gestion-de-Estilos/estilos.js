const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken, soloDueño } = require('../MIDDLEWARES/AUTH.JS');

// GET: Listar todos los estilos — accesible para cualquier usuario autenticado
router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT * FROM Estilos");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener estilos:", error);
        res.status(500).json({ error: "Error al obtener estilos" });
    }
});

// POST: Crear estilo — solo Dueño
router.post('/', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, descripcion, precio } = req.body;
        if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
        await db.run(
            "INSERT INTO Estilos (nombre, descripcion, precio) VALUES (?, ?, ?)",
            [nombre, descripcion || '', precio || 0]
        );
        res.json({ success: true, mensaje: "Estilo creado" });
    } catch (error) {
        console.error("Error al crear estilo:", error);
        res.status(500).json({ error: "Error al crear estilo" });
    }
});

// PUT: Actualizar estilo — solo Dueño
router.put('/:id', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, descripcion, precio } = req.body;
        await db.run(
            "UPDATE Estilos SET nombre = ?, descripcion = ?, precio = ? WHERE idEstilos = ?",
            [nombre, descripcion || '', precio || 0, req.params.id]
        );
        res.json({ success: true, mensaje: "Estilo actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar estilo" });
    }
});

// DELETE: Eliminar estilo — solo Dueño
router.delete('/:id', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        await db.run("DELETE FROM Estilos WHERE idEstilos = ?", [req.params.id]);
        res.json({ success: true, mensaje: "Estilo eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar estilo" });
    }
});

module.exports = router;
