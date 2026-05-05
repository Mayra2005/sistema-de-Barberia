const express = require('express');
const cors = require('cors');
const connectDB = require('./DB.JS'); // Importamos la conexión SQLite

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Permitir recibir JSON en el body de las peticiones

// Inicializamos la base de datos de SQLite antes de definir las rutas
connectDB().catch(console.error);

// 🔥 RUTA PRINCIPAL (Para pruebas de salud del servidor)
app.get('/', (req, res) => {
    res.send('🔥 API Barbería funcionando con SQLite y estructura de Vertical Slices');
});

// 🔥 IMPORTAR Y ASIGNAR RUTAS DESDE LAS NUEVAS CARPETAS
// La estructura del backend ahora es un espejo exacto de la del frontend
app.use('/api/auth', require('./Inicio-de-Sesion/auth.js'));
app.use('/api/empleados', require('./Gestion-de-Empleados/empleados.js'));
app.use('/api/clientes', require('./Agendar-Cita/clientes.js'));
app.use('/api/citas', require('./Agendar-Cita/citas.js'));
app.use('/api/pagos', require('./Gestion-de-Pagos/pagos.js'));
app.use('/api/promociones', require('./Gestion-de-Promociones/promociones.js'));

// 🚀 INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 API PRO corriendo en http://localhost:${PORT}`);
});
