const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken, soloDueño } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT * FROM Promociones");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener promociones" });
    }
});

router.post('/', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, descripcion, descuento, fecha_inicio, fecha_fin } = req.body;
        await db.run(
            "INSERT INTO Promociones (nombre, descripcion, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)",
            [nombre, descripcion, descuento, fecha_inicio, fecha_fin]
        );
        res.json({ success: true, mensaje: "Promoción creada" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear promoción" });
    }
});

module.exports = router;
