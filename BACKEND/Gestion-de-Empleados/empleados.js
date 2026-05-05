const express = require('express');
const router = express.Router();
const connectDB = require('../DB.JS');
const { verificarToken, soloDueño } = require('../MIDDLEWARES/AUTH.JS');

// ─── GET: Listar empleados ─────────────────────────────────────────────────────
// Accesible para cualquier usuario autenticado (barberos necesitan la lista para selects)
router.get('/', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const rows = await db.all(
            "SELECT idEmpleados, nombre, paterno, materno, telefono, horario, estado, especialidad, usuario, rol FROM Empleados"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        res.status(500).json({ error: "Error al obtener empleados" });
    }
});

// ─── GET: Verificar si un usuario ya existe (para validación en tiempo real) ───
// Accesible para cualquier usuario autenticado
router.get('/verificar-usuario/:usuario', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const usuarioBuscado = req.params.usuario.trim().toLowerCase();
        // Buscar ignorando mayúsculas/minúsculas
        const existe = await db.get(
            "SELECT idEmpleados FROM Empleados WHERE LOWER(usuario) = ?",
            [usuarioBuscado]
        );
        res.json({ disponible: !existe });
    } catch (error) {
        console.error("Error al verificar usuario:", error);
        res.status(500).json({ error: "Error al verificar usuario" });
    }
});

// ─── POST: Crear empleado ─────────────────────────────────────────────────────
// Solo Dueño
router.post('/', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const {
            nombre, paterno, materno, telefono, horario,
            estado, especialidad, usuario, contrasena, rol
        } = req.body;

        // ── Validaciones server-side ────────────────────────────────────────────
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es requerido" });
        }
        if (!usuario || usuario.trim() === '') {
            return res.status(400).json({ error: "El usuario es requerido" });
        }
        if (!contrasena || contrasena.trim() === '') {
            return res.status(400).json({ error: "La contraseña es requerida" });
        }
        if (nombre.length > 50) {
            return res.status(400).json({ error: "El nombre no puede exceder 50 caracteres" });
        }
        if (usuario.length > 50) {
            return res.status(400).json({ error: "El usuario no puede exceder 50 caracteres" });
        }
        if (contrasena.length > 100) {
            return res.status(400).json({ error: "La contraseña no puede exceder 100 caracteres" });
        }
        if (contrasena.length < 4) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });
        }
        // Validar que el nombre solo contenga letras y espacios
        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombre.trim())) {
            return res.status(400).json({ error: "El nombre solo puede contener letras y espacios" });
        }
        // Validar que el usuario no tenga espacios ni caracteres especiales
        if (!/^[A-Za-z0-9_\-]+$/.test(usuario.trim())) {
            return res.status(400).json({ error: "El usuario solo puede contener letras, números, guión y guión bajo" });
        }

        // ── Verificar unicidad del usuario (case-insensitive) ────────────────────
        const usuarioExistente = await db.get(
            "SELECT idEmpleados FROM Empleados WHERE LOWER(usuario) = ?",
            [usuario.trim().toLowerCase()]
        );
        if (usuarioExistente) {
            return res.status(409).json({ error: `El usuario '${usuario.trim()}' ya está registrado. Elige otro nombre de usuario.` });
        }

        await db.run(
            "INSERT INTO Empleados (nombre, paterno, materno, telefono, horario, estado, especialidad, usuario, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                nombre.trim(),
                (paterno || '').trim(),
                (materno || '').trim(),
                (telefono || '').trim(),
                (horario || '').trim(),
                estado || 'Activo',
                especialidad || 'General',
                usuario.trim(),
                contrasena,
                rol || 'Barbero'
            ]
        );
        res.json({ success: true, mensaje: "Empleado creado exitosamente" });
    } catch (error) {
        console.error("Error al crear empleado:", error);
        // SQLite lanza UNIQUE constraint failed cuando el usuario ya existe
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: "El nombre de usuario ya está registrado. Elige otro." });
        }
        res.status(500).json({ error: "Error al crear empleado" });
    }
});

// ─── DELETE: Eliminar empleado ────────────────────────────────────────────────
// Solo Dueño
router.delete('/:id', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
        await db.run("DELETE FROM Empleados WHERE idEmpleados = ?", [id]);
        res.json({ success: true, mensaje: "Empleado eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar empleado" });
    }
});

// ─── PUT: Cambiar estado ──────────────────────────────────────────────────────
// Solo Dueño
router.put('/:id/estado', verificarToken, soloDueño, async (req, res) => {
    try {
        const db = await connectDB();
        const { estado } = req.body;
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
        if (!['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({ error: "Estado inválido. Use 'Activo' o 'Inactivo'" });
        }
        await db.run("UPDATE Empleados SET estado = ? WHERE idEmpleados = ?", [estado, id]);
        res.json({ success: true, mensaje: "Estado actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar estado" });
    }
});

module.exports = router;
