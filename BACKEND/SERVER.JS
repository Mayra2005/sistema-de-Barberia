const express = require('express');
const cors = require('cors');
const connectDB = require('./DB.JS');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Inicializamos la base de datos SQLite
connectDB().catch(console.error);

// 🔥 RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.send('🔥 API Barbería funcionando con SQLite');
});

// 🔥 RUTAS DE LA API (una sola vez cada una)
app.use('/api/auth',       require('./Inicio-de-Sesion/auth.js'));
app.use('/api/empleados',  require('./Gestion-de-Empleados/empleados.js'));
app.use('/api/clientes',   require('./Agendar-Cita/clientes.js'));
app.use('/api/citas',      require('./Agendar-Cita/citas.js'));
app.use('/api/pagos',      require('./Gestion-de-Pagos/pagos.js'));
app.use('/api/promociones',require('./Gestion-de-Promociones/promociones.js'));
app.use('/api/estilos',    require('./Gestion-de-Estilos/estilos.js'));
app.use('/api/respaldo',   require('./Copia-de-Seguridad/respaldo.js'));

// 🚀 INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 API PRO corriendo en http://localhost:${PORT}`);
});
