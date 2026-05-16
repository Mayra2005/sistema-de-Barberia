const express = require('express');
const router = express.Router();
const fs = require('fs');
const os = require('os');
const path = require('path');
const PDFDocument = require('pdfkit-table');
const connectDB = require('../DB.JS'); 

router.post('/', async (req, res) => {
    try {
        const db = await connectDB();
        const { tipo } = req.body; // 'diario', 'semanal', 'mensual', 'todo'
        
        // Define timeframe
        let filterCondition = "1=1";
        let titleSuffix = "Completo";
        
        if (tipo === 'diario') {
            filterCondition = "date(fecha) = date('now', 'localtime')";
            titleSuffix = "Diario (" + new Date().toLocaleDateString() + ")";
        } else if (tipo === 'semanal') {
            filterCondition = "date(fecha) >= date('now', '-7 days', 'localtime')";
            titleSuffix = "Semanal (Últimos 7 días)";
        } else if (tipo === 'mensual') {
            filterCondition = "strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now', 'localtime')";
            titleSuffix = "Mensual (" + new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }) + ")";
        }

        // Fetch data
        const citas = await db.all(`
            SELECT c.idCitas, cl.nombre as nombreCliente, c.fecha, c.hora, c.estado, e.nombre as empleado 
            FROM Citas c 
            LEFT JOIN Empleados e ON c.idEmpleados = e.idEmpleados
            LEFT JOIN Clientes cl ON c.idClientes = cl.idClientes
            WHERE ${filterCondition}
        `);

        const pagos = await db.all(`
            SELECT idPagos, idCitas, monto, metodo_pago, fecha 
            FROM Pagos 
            WHERE ${filterCondition}
        `);

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        
        // Output path on Desktop
        const desktopPath = path.join(os.homedir(), 'Desktop', `Respaldo_${tipo}_Barberia.pdf`);
        const stream = fs.createWriteStream(desktopPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Copia de Seguridad - Sistema de Barbería', { align: 'center' });
        doc.fontSize(14).text(`Reporte ${titleSuffix}`, { align: 'center' });
        doc.moveDown();

        // Table Citas
        if (citas.length > 0) {
            const citasTable = {
                title: "Registro de Citas",
                headers: ["ID", "Cliente", "Barbero", "Fecha", "Hora", "Estado"],
                rows: citas.map(c => [
                    (c.idCitas || '').toString(), 
                    (c.nombreCliente || 'N/A').toString(), 
                    (c.empleado || 'N/A').toString(), 
                    (c.fecha || 'N/A').toString(), 
                    (c.hora || 'N/A').toString(), 
                    (c.estado || 'N/A').toString()
                ])
            };
            await doc.table(citasTable, { width: 500 });
        } else {
            doc.text('No hay citas en este periodo.');
            doc.moveDown();
        }

        // Table Pagos
        if (pagos.length > 0) {
            const total = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
            const pagosTable = {
                title: "Registro de Pagos (Ingresos)",
                headers: ["ID Pago", "ID Cita", "Monto ($)", "Método", "Fecha"],
                rows: pagos.map(p => [
                    (p.idPagos || '').toString(), 
                    (p.idCitas || '').toString(), 
                    `$${parseFloat(p.monto || 0).toFixed(2)}`, 
                    (p.metodo_pago || 'N/A').toString(), 
                    (p.fecha || 'N/A').toString()
                ])
            };
            await doc.table(pagosTable, { width: 500 });
            doc.fontSize(12).text(`Total Ingresos: $${total.toFixed(2)}`, { align: 'right', bold: true });
            doc.moveDown();
        } else {
            doc.text('No hay pagos en este periodo.');
            doc.moveDown();
        }

        doc.end();

        stream.on('finish', () => {
            res.json({ success: true, message: `PDF guardado en el Escritorio exitosamente`, path: desktopPath });
        });

        stream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ error: 'Error al generar el PDF' });
        });

    } catch (error) {
        console.error('ERROR EN RESPALDO:', error);
        res.status(500).json({ error: 'Error interno: ' + error.message });
    }
});

module.exports = router;
