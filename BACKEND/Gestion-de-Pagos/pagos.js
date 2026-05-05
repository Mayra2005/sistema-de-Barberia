const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all("SELECT * FROM Pagos");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pagos" });
    }
});

router.post('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { idCitas, monto, metodo_pago, fecha } = req.body;
        await db.run(
            "INSERT INTO Pagos (idCitas, monto, metodo_pago, fecha) VALUES (?, ?, ?, ?)",
            [idCitas, monto, metodo_pago, fecha]
        );
        res.json({ success: true, mensaje: "Pago registrado" });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar pago" });
    }
});

module.exports = router;
