const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken } = require('../MIDDLEWARES/AUTH.JS');

router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all(`
            SELECT Citas.*, Clientes.nombre as nombreCliente, Empleados.nombre as nombreEmpleado,
            Estilos.precio as precioEstilo, Promociones.descuento as descuentoPromocion
            FROM Citas 
            LEFT JOIN Clientes ON Citas.idClientes = Clientes.idClientes
            LEFT JOIN Empleados ON Citas.idEmpleados = Empleados.idEmpleados
            LEFT JOIN Estilos ON Citas.idEstilos = Estilos.idEstilos
            LEFT JOIN Promociones ON Citas.idPromociones = Promociones.idPromociones
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

        // ── Validaciones server-side ────────────────────────────────────────────
        if (!nombreCliente || nombreCliente.trim() === '') {
            return res.status(400).json({ error: "El nombre del cliente es requerido" });
        }
        if (nombreCliente.trim().length > 100) {
            return res.status(400).json({ error: "El nombre del cliente no puede exceder 100 caracteres" });
        }
        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombreCliente.trim())) {
            return res.status(400).json({ error: "El nombre del cliente solo puede contener letras y espacios" });
        }
        if (!idEmpleados || isNaN(parseInt(idEmpleados))) {
            return res.status(400).json({ error: "Debes seleccionar un barbero válido" });
        }
        if (!fecha || fecha.trim() === '') {
            return res.status(400).json({ error: "La fecha es requerida" });
        }
        if (!hora || hora.trim() === '') {
            return res.status(400).json({ error: "La hora es requerida" });
        }
        if (telefonoCliente && telefonoCliente.trim().length > 15) {
            return res.status(400).json({ error: "El teléfono no puede exceder 15 caracteres" });
        }
        if (telefonoCliente && telefonoCliente.trim() !== '' && !/^[0-9\-\+\s]+$/.test(telefonoCliente.trim())) {
            return res.status(400).json({ error: "El teléfono solo puede contener números, guiones y espacios" });
        }

        // Crear o buscar al cliente por nombre
        let idClientes;
        const clienteExistente = await db.get("SELECT idClientes FROM Clientes WHERE nombre = ?", [nombreCliente.trim()]);
        if (clienteExistente) {
            idClientes = clienteExistente.idClientes;
        } else {
            const result = await db.run(
                "INSERT INTO Clientes (nombre, telefono, paterno, materno, correo) VALUES (?, ?, '', '', '')",
                [nombreCliente.trim(), (telefonoCliente || '').trim()]
            );
            idClientes = result.lastID;
        }

        await db.run(
            "INSERT INTO Citas (idEstilos, idClientes, idEmpleados, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, ?)",
            [idEstilos || null, idClientes, parseInt(idEmpleados), fecha.trim(), hora.trim(), estado || 'Programada']
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
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
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
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
        if (!fecha || fecha.trim() === '') return res.status(400).json({ error: "La fecha es requerida" });
        if (!hora || hora.trim() === '') return res.status(400).json({ error: "La hora es requerida" });
        await db.run(
            "UPDATE Citas SET fecha = ?, hora = ? WHERE idCitas = ?",
            [fecha.trim(), hora.trim(), id]
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
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
        await db.run(
            "UPDATE Citas SET idEstilos = ?, idPromociones = ? WHERE idCitas = ?",
            [idEstilos ? parseInt(idEstilos) : null, idPromociones ? parseInt(idPromociones) : null, id]
        );
        res.json({ success: true, mensaje: "Detalles asignados a la cita" });
    } catch (error) {
        res.status(500).json({ error: "Error al asignar detalles a cita" });
    }
});

module.exports = router;
