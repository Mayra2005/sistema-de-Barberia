const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT * FROM Clientes");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener clientes" });
    }
});

router.post('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { nombre, paterno, materno, telefono, correo } = req.body;
        await db.run(
            "INSERT INTO Clientes (nombre, paterno, materno, telefono, correo) VALUES (?, ?, ?, ?, ?)",
            [nombre, paterno, materno, telefono, correo]
        );
        res.json({ success: true, mensaje: "Cliente creado" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear cliente" });
    }
});

module.exports = router;
