const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connectDB = require('../DB.JS'); 
const { secret } = require('../CONFIG/JWT.JS');

router.post('/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const db = await connectDB();
        const user = await db.get(
            "SELECT * FROM Empleados WHERE usuario = ? AND contrasena = ?",
            [usuario, password]
        );

        if (!user) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: user.idEmpleados, rol: user.rol, nombre: user.nombre },
            secret,
            { expiresIn: '8h' }
        );

        res.json({ token, rol: user.rol, mensaje: "Login exitoso" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;
