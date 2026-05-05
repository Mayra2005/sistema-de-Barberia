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

**Base de Datos (MySQL):**
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
- Facilitar el aprendizaje del stack completo (HTML, CSS, JS, Node.js, MySQL).
- Detectar, corregir errores y refactorizar el proyecto para un estado profesional.

La IA fue utilizada únicamente como apoyo, elevando la calidad del trabajo del equipo.
