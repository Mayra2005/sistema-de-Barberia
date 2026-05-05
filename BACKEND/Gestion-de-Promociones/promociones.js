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

        // ── Validaciones server-side ────────────────────────────────────────────
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre de la promoción es requerido" });
        }
        if (nombre.trim().length > 80) {
            return res.status(400).json({ error: "El nombre no puede exceder 80 caracteres" });
        }
        if (!descuento || isNaN(parseFloat(descuento))) {
            return res.status(400).json({ error: "El descuento debe ser un número válido" });
        }
        if (parseFloat(descuento) < 0.01 || parseFloat(descuento) > 100) {
            return res.status(400).json({ error: "El descuento debe estar entre 0.01 y 100" });
        }

        await db.run(
            "INSERT INTO Promociones (nombre, descripcion, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)",
            [
                nombre.trim(),
                (descripcion || 'Sin descripción').trim(),
                parseFloat(descuento),
                fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_fin || new Date().toISOString().split('T')[0]
            ]
        );
        res.json({ success: true, mensaje: "Promoción creada" });
    } catch (error) {
        console.error("Error al crear promoción:", error);
        res.status(500).json({ error: "Error al crear promoción" });
    }
});

module.exports = router;
