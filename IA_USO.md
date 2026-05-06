---Uso de Inteligencia Artificial ---

Este documento describe el uso de herramientas de Inteligencia Artificial durante el desarrollo integral del sistema de gestión para una barbería. Originalmente enfocado en el frontend (HTML, CSS, JS), el proyecto ha evolucionado para incluir un backend robusto en Node.js y una base de datos MySQL, todo estructurado y optimizado con el apoyo de IA.

Hicimos uso de ChatGPT (OpenAI) y Gemini (Google).

--- Propósito del uso de IA ---

La utilizamos con los siguientes objetivos:
- Apoyar en la creación de interfaces web.
- Generar estructuras base de páginas HTML.
- Diseñar estilos visuales con CSS.
- Implementar la comunicación asíncrona (Fetch API) con JavaScript.
- Diseñar y estructurar la API RESTful usando Node.js y Express.
- Construir esquemas relacionales coherentes para la base de datos MySQL.
- Refactorizar el código para mejorar la coherencia y modularidad del proyecto.
- Resolver errores y añadir comentarios documentativos en todos los scripts.

--- Se utilizó IA para: ---

**Frontend:**
- Crear la estructura base de páginas (Inicio de sesión, Gestión de empleados, Citas, Pagos, etc.).
- Organizar el contenido mediante etiquetas semánticas y crear formularios.
- Estilizar la plataforma con CSS moderno.

**Backend (Node.js & Express):**
- Configurar el servidor principal (`SERVER.JS`).
- Crear un sistema de enrutamiento modular (MVC simplificado en `routes/`).
- Implementar seguridad mediante JSON Web Tokens (JWT) para distinguir roles (Dueño, Barbero).
- Generar las consultas SQL asíncronas para el CRUD de clientes, empleados, citas, pagos y promociones.

**Base de Datos (SQLITE):**
- Optimizar y normalizar los scripts de creación de tablas (`EMPLEADOS.SQL`, `CITAS.SQL`, etc.).
- Asegurar el uso de llaves foráneas para mantener la integridad de los datos.

--- Funcionalidad y Coherencia ---
Gracias a la IA, logramos integrar el frontend y el backend para que trabajen "de la mano". La lógica simulada del cliente fue reemplazada por conexiones reales al servidor (`fetch()`), y las bases de datos reflejan de manera precisa la información estructurada en el servidor.

--- Consideraciones éticas ---
El uso de la inteligencia artificial se realizó bajo los siguientes principios:
- Uso responsable de la tecnología.
- Comprensión del código generado.
- Validación de resultados obtenidos.
- No dependencia total de la IA.
- Respeto a buenas prácticas de desarrollo (comentarios en código, estructuración limpia).

--- Beneficios obtenidos ---
El uso de IA permitió:
- Reducir drásticamente el tiempo de desarrollo.
- Mejorar el diseño visual y la arquitectura técnica del sistema.
- Facilitar el aprendizaje del stack completo (HTML, CSS, JS, Node.js, SQLITE).
- Detectar, corregir errores y refactorizar el proyecto para un estado profesional.

La IA fue utilizada únicamente como apoyo, elevando la calidad del trabajo del equipo.

---

PROMPT UTILIZADO

A continuación se presentan ejemplos representativos de los prompts enviados a la IA durante el desarrollo del sistema:

---

Módulo: Inicio de Sesión / Autenticación
Prompt:
"Crea un endpoint en Node.js con Express que reciba usuario y contraseña, los verifique contra una base de datos SQLite y devuelva un token JWT con los campos id, nombre y rol. El token debe durar 8 horas."



Módulo: Gestión de Empleados
Prompt:
 "Genera el CRUD completo para una tabla llamada Empleados en SQLite usando Node.js. Necesito registrar empleados con nombre, usuario, contraseña y rol (Dueño o Barbero), poder activarlos o desactivarlos, y que solo el Dueño pueda crear o eliminar empleados. Usa JWT para verificar el rol."


Módulo: Agendar Cita
Prompt:
 "Crea un módulo en Express para gestionar citas de una barbería. Al registrar una cita se deben recibir: nombre del cliente, teléfono, ID del barbero, fecha y hora. Si el cliente no existe en la tabla Clientes, debe registrarse automáticamente. Incluye endpoints para consultar, modificar y cancelar citas."

Módulo: Gestión de Estilos
Prompt:
"Necesito un módulo backend para gestionar un catálogo de estilos de corte. Cada estilo tiene nombre, descripción y precio. Solo el Dueño puede agregar, editar o eliminar estilos. Los barberos solo pueden consultar el catálogo."

Módulo: Gestión de Pagos
Prompt:
"Genera un endpoint POST para registrar pagos vinculados a una cita. Los datos requeridos son: ID de cita, monto y método de pago (Efectivo, Tarjeta, etc.). Valida que el monto sea mayor a 0 y no supere $99,999.99. También genera un GET para consultar todos los pagos."


Módulo: Gestión de Promociones
Prompt:
"Crea un módulo para gestionar promociones con nombre, descripción, porcentaje de descuento, fecha de inicio y fecha de fin. Solo el Dueño puede crear promociones. Todos los empleados autenticados pueden consultarlas."


Frontend: Formularios y consumo de API
Prompt:
Genera el formulario HTML para registrar una cita en una barbería. Al enviarse debe hacer un fetch POST a /api/citas con los datos del cliente y la cita. Si hay error, muéstralo en pantalla. Usa estilos CSS modernos con colores oscuros."



CÓDIGO GENERADO

La IA generó las siguientes estructuras de código que fueron integradas al proyecto:


Ejemplo 1 — Middleware de autenticación JWT (`MIDDLEWARES/AUTH.JS`)
js
const jwt = require('jsonwebtoken');
const { SECRET } = require('../CONFIG/JWT');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

function soloDueño(req, res, next) {
  if (req.user.rol !== 'Dueño') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}
Este código fue generado por la IA y adoptado directamente al proyecto.


Ejemplo 2 — Registro automático de cliente al agendar cita (`citas.js`)
js
// Verificar si el cliente ya existe
db.get('SELECT idClientes FROM Clientes WHERE nombre = ?', [nombre], (err, cliente) => {
  if (err) return res.status(500).json({ error: 'Error al verificar cliente' });

  const registrarCita = (idCliente) => {
    db.run(
      'INSERT INTO Citas (idClientes, idEmpleados, fecha, hora) VALUES (?, ?, ?, ?)',
      [idCliente, idEmpleados, fecha, hora],
      function (err) {
        if (err) return res.status(500).json({ error: 'Error al registrar cita' });
        res.json({ success: true, mensaje: 'Cita creada' });
      }
    );
  };

  if (cliente) {
    registrarCita(cliente.idClientes);
  } else {
    db.run('INSERT INTO Clientes (nombre, telefono) VALUES (?, ?)', [nombre, telefono],
      function (err) {
        if (err) return res.status(500).json({ error: 'Error al registrar cliente' });
        registrarCita(this.lastID);
      }
    );
  }
});
Generado por IA. Permitió reducir pasos manuales al registrar citas con clientes nuevos.

Ejemplo 3 — Fetch desde el frontend para registrar pago (`pagos.html`)
```js
async function registrarPago(datos) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/pagos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  const resultado = await res.json();
  if (!res.ok) throw new Error(resultado.error || 'Error al registrar pago');
  return resultado;
}

Generado por IA. Adaptado para manejar errores y mostrar mensajes al usuario.


AJUSTES REALIZADOS POR EL EQUIPO
El código generado por la IA no siempre fue utilizado tal cual. El equipo realizó los siguientes ajustes:


Ajuste 1 — Validaciones adicionales en el backend
La IA generó validaciones básicas. El equipo las reforzó para cumplir con los requisitos del sistema:
- Se limitó el campo `nombre` a solo letras y espacios (sin números ni símbolos)
- Se estableció un máximo de caracteres por campo según el tipo de dato
- Se validó que el teléfono acepte solo números y guiones
- Se agregó validación de monto máximo (`$99,999.99`) en pagos



Ajuste 2 — Verificación de usuario único en tiempo real
La IA no contempló la validación en tiempo real del nombre de usuario. El equipo implementó:
- Un endpoint adicional `GET /api/empleados/verificar-usuario/:usuario`
- Lógica en el frontend para consultar ese endpoint mientras el usuario escribe
- Retroalimentación visual inmediata (mensaje de error antes de enviar el formulario)


Ajuste 3 — Roles y rutas de acceso
La IA generó una estructura de roles básica. El equipo ajustó:
- Se definieron con precisión qué rutas requieren rol `Dueño` y cuáles son accesibles para todos
- Se aplicó el middleware `soloDueño` específicamente en los endpoints de creación, edición y eliminación
- Se probaron manualmente los accesos para confirmar que los barberos no puedan ejecutar acciones restringidas


Ajuste 4 — Estructura de carpetas y nombres de archivo
La IA propuso una estructura genérica. El equipo la adaptó a la convención del proyecto:
- Se organizaron los módulos por funcionalidad: `/Agendar-Cita`, `/Gestion-de-Empleados`, `/Gestion-de-Estilos`, etc.
- Se mantuvieron nombres en español para consistencia con el resto del proyecto
- Se separaron las rutas (`routes/`) de la lógica de negocio



Ajuste 5 — Integración frontend–backend
La IA generó el frontend y el backend de forma independiente. El equipo se encargó de:
- Unificar los nombres de los campos entre formularios HTML y los endpoints del backend
- Asegurar que el token JWT se enviara correctamente en cada petición desde el frontend
- Manejar los errores devueltos por el servidor y mostrarlos al usuario de forma clara

