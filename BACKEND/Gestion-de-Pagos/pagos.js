const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken, soloDueño } = require('../MIDDLEWARES/AUTH.JS');

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

        // ── Validaciones server-side ────────────────────────────────────────────
        if (!idCitas || isNaN(parseInt(idCitas))) {
            return res.status(400).json({ error: "Debes seleccionar una cita válida" });
        }
        if (!monto || isNaN(parseFloat(monto))) {
            return res.status(400).json({ error: "El monto debe ser un número válido" });
        }
        if (parseFloat(monto) <= 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero" });
        }
        if (parseFloat(monto) > 99999.99) {
            return res.status(400).json({ error: "El monto no puede exceder $99,999.99" });
        }

        await db.run(
            "INSERT INTO Pagos (idCitas, monto, metodo_pago, fecha) VALUES (?, ?, ?, ?)",
            [parseInt(idCitas), parseFloat(monto), metodo_pago || 'Efectivo', fecha]
        );
        res.json({ success: true, mensaje: "Pago registrado" });
    } catch (error) {
        console.error("Error al registrar pago:", error);
        res.status(500).json({ error: "Error al registrar pago" });
    }
});

router.put('/:id', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const { id } = req.params;
        const { monto, metodo_pago, fecha } = req.body;

        if (!monto || isNaN(parseFloat(monto))) {
            return res.status(400).json({ error: "El monto debe ser un número válido" });
        }

        await db.run(
            "UPDATE Pagos SET monto = ?, metodo_pago = ?, fecha = ? WHERE idPagos = ?",
            [parseFloat(monto), metodo_pago, fecha, id]
        );
        res.json({ success: true, mensaje: "Pago actualizado" });
    } catch (error) {
        console.error("Error al actualizar pago:", error);
        res.status(500).json({ error: "Error al actualizar pago" });
    }
});

router.delete('/:id', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { id } = req.params;
        await db.run("DELETE FROM Pagos WHERE idPagos = ?", [id]);
        res.json({ success: true, mensaje: "Pago eliminado" });
    } catch (error) {
        console.error("Error al eliminar pago:", error);
        res.status(500).json({ error: "Error al eliminar pago" });
    }
});

module.exports = router;
