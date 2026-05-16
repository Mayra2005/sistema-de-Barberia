# 📋 DOCUMENTACIÓN BACKEND
### Sistema de Barbería — Equipo 6
**Por: Ing. Alejandra Margarita Sánchez Malacara**

> "EL BACKEND ES LO QUE HACE FUNCIONAR EL SISTEMA: PROCESA DATOS, EJECUTA LÓGICA Y SE COMUNICA CON LA BASE DE DATOS"

---

## 🔷 DESCRIPCIÓN GENERAL DEL BACKEND

El backend del sistema fue desarrollado en **Node.js** con el framework **Express.js**, ubicado dentro de la carpeta `/BACKEND`.

Se encarga de:
- Procesar la información del sistema
- Ejecutar la lógica de negocio
- Gestionar la base de datos (SQLite)
- Proteger las rutas mediante autenticación con JWT

**Tecnologías utilizadas:**

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | LTS | Entorno de ejecución |
| Express.js | ^5.2.1 | Framework web / API REST |
| SQLite / sqlite3 | ^6.0.1 | Base de datos |
| jsonwebtoken | ^9.0.3 | Autenticación con tokens JWT |
| cors | ^2.8.6 | Comunicación con el frontend |

---

## 🗂️ ESTRUCTURA DEL BACKEND EN GITHUB

```
/BACKEND
│
├── SERVER.JS                   → Punto de entrada, configura el servidor
├── DB.JS                       → Conexión y creación de tablas SQLite
├── package.json                → Dependencias del proyecto
├── database.sqlite             → Archivo de base de datos
│
├── /CONFIG
│   └── JWT.JS                  → Clave secreta para tokens
│
├── /MIDDLEWARES
│   └── AUTH.JS                 → Verificación de token y roles
│
├── /Inicio-de-Sesion
│   └── auth.js                 → Módulo de autenticación (login)
│
├── /Agendar-Cita
│   ├── citas.js                → Módulo de gestión de citas
│   └── clientes.js             → Módulo de gestión de clientes
│
├── /Gestion-de-Empleados
│   └── empleados.js            → Módulo de gestión de empleados
│
├── /Gestion-de-Estilos
│   └── estilos.js              → Módulo de gestión de estilos/cortes
│
├── /Gestion-de-Pagos
│   └── pagos.js                → Módulo de registro de pagos
│
└── /Gestion-de-Promociones
    └── promociones.js          → Módulo de gestión de promociones
```

---

## ⚙️ ARCHIVO PRINCIPAL: SERVER.JS

**Archivos principales:** `SERVER.JS`

Este archivo es el **punto de entrada** del sistema. Se encarga de:
- Inicializar el servidor Express en el puerto 3000
- Aplicar middlewares globales (CORS, JSON)
- Conectar con la base de datos SQLite
- Registrar todas las rutas de la API

**Rutas registradas:**

| Ruta | Módulo |
|---|---|
| `/api/auth` | Inicio de Sesión |
| `/api/empleados` | Gestión de Empleados |
| `/api/clientes` | Clientes |
| `/api/citas` | Agendar Cita |
| `/api/pagos` | Gestión de Pagos |
| `/api/promociones` | Gestión de Promociones |
| `/api/estilos` | Gestión de Estilos |

---

## 🗄️ ARCHIVO DE BASE DE DATOS: DB.JS

**Archivos principales:** `DB.JS`

Este archivo gestiona la **conexión y la estructura de la base de datos**. Se encarga de:
- Conectar con el archivo `database.sqlite`
- Habilitar claves foráneas (`PRAGMA foreign_keys = ON`)
- Crear las tablas si no existen al iniciar el servidor
- Crear usuarios por defecto (admin y barbero)

**Tablas creadas automáticamente:**

| Tabla | Campos principales |
|---|---|
| `Empleados` | idEmpleados, nombre, usuario, contrasena, rol, estado, salario |
| `Clientes` | idClientes, nombre, paterno, materno, telefono, correo |
| `Estilos` | idEstilos, nombre, descripcion, precio |
| `Citas` | idCitas, idClientes, idEmpleados, idEstilos, fecha, hora, estado |
| `Pagos` | idPagos, idCitas, monto, metodo_pago, fecha |
| `Promociones` | idPromociones, nombre, descripcion, descuento, fecha_inicio, fecha_fin |

**Usuarios por defecto creados:**
- 👑 `admin / admin123` → Rol: Dueño
- ✂️ `barbero / barbero123` → Rol: Barbero

---

## 🔐 MÓDULO: INICIO DE SESIÓN

**Archivos principales:** `Inicio-de-Sesion/auth.js`

### Funcionalidad del módulo
Este módulo permite:
- Autenticar a los empleados del sistema
- Generar un token JWT con vigencia de 8 horas
- Proteger el acceso al sistema según el rol del usuario

### Operaciones implementadas

> **POST → Iniciar sesión**
> Se reciben las credenciales del empleado (usuario y contraseña) desde el frontend y el sistema verifica su identidad en la base de datos. Si son correctas, se genera y devuelve un token JWT con vigencia de 8 horas.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión y obtener token JWT |

### Lógica del sistema

1. El usuario accede al formulario de inicio de sesión
2. Ingresa su **usuario** y **contraseña**
3. El frontend envía los datos al endpoint `POST /api/auth/login`
4. El backend busca al empleado en la base de datos
5. Si no existe → responde `401 No autorizado`
6. Si existe → genera un **token JWT** con: `id`, `rol` y `nombre`
7. El token se devuelve al frontend y se almacena en `localStorage`
8. Las siguientes peticiones incluyen el token en el header `Authorization`

### Reglas del sistema
- Usuario y contraseña son **obligatorios**
- Si los datos no coinciden, el acceso es denegado
- El token expira en **8 horas**

---

## 👥 MÓDULO: GESTIÓN DE EMPLEADOS

**Archivos principales:** `Gestion-de-Empleados/empleados.js`

### Funcionalidad del módulo
Este módulo permite:
- Registrar nuevos empleados (barberos)
- Consultar la lista de empleados
- Cambiar el estado (Activo/Inactivo) de un empleado
- Eliminar empleados del sistema
- Verificar si un nombre de usuario ya está en uso

### Operaciones implementadas (CRUD)

> **CREATE → Registrar empleado**
> Se recibe la información del nuevo empleado desde el frontend (nombre, usuario, contraseña, rol) y se almacena en la base de datos. El sistema valida que el nombre de usuario sea único antes de registrarlo.

> **READ → Consultar empleados**
> Permite obtener la lista completa de empleados registrados en el sistema. También permite verificar en tiempo real si un nombre de usuario ya está en uso.

> **UPDATE → Modificar empleado / Cambiar estado**
> Permite al Dueño actualizar la información general de un empleado (nombre, usuario, rol y salario) mediante `PUT /api/empleados/:id`, así como cambiar su estado (Activo/Inactivo) mediante `PUT /api/empleados/:id/estado`.

> **DELETE → Eliminar empleado**
> Permite al Dueño eliminar permanentemente a un empleado del sistema.

| Operación | Método | Ruta | Acceso |
|---|---|---|---|
| READ | GET | `/api/empleados` | Todos los autenticados |
| READ | GET | `/api/empleados/verificar-usuario/:usuario` | Todos los autenticados |
| CREATE | POST | `/api/empleados` | Solo Dueño |
| UPDATE | PUT | `/api/empleados/:id` | Solo Dueño |
| UPDATE | PUT | `/api/empleados/:id/estado` | Solo Dueño |
| DELETE | DELETE | `/api/empleados/:id` | Solo Dueño |

### Lógica del sistema — Registrar Empleado

1. El Dueño accede al formulario de registro de empleados
2. Llena los datos: nombre, usuario, contraseña, horario, especialidad, rol
3. El frontend valida en tiempo real si el usuario ya existe (`GET /verificar-usuario/:usuario`)
4. Al enviar, el backend recibe los datos y ejecuta las validaciones:
   - Nombre y usuario son obligatorios
   - El nombre solo puede contener letras y espacios
   - El usuario no puede tener espacios ni caracteres especiales
   - La contraseña debe tener entre 4 y 100 caracteres
5. Se verifica que el usuario no exista ya en la base de datos (insensible a mayúsculas)
6. Si pasa todas las validaciones, se registra el empleado con `INSERT INTO Empleados`
7. Se retorna `{ success: true }`

### Reglas del sistema
- Solo el **Dueño** puede crear, eliminar o cambiar el estado de empleados
- El nombre de usuario debe ser **único** (validación en tiempo real + servidor)
- El estado solo puede ser `Activo` o `Inactivo`
- No se puede registrar un empleado con campos obligatorios vacíos

---

## 📅 MÓDULO: AGENDAR CITA

**Archivos principales:** `Agendar-Cita/citas.js`, `Agendar-Cita/clientes.js`

### Funcionalidad del módulo
Este módulo permite:
- Registrar nuevas citas
- Consultar todas las citas con nombre de cliente y barbero
- Modificar fecha y hora de una cita existente
- Asignar estilo y promoción a una cita
- Cancelar (eliminar) una cita

### Operaciones implementadas (CRUD)

> **CREATE → Registrar cita**
> Se recibe la información de la cita desde el frontend (cliente, barbero, fecha y hora) y se almacena en la base de datos. Si el cliente no existe, el sistema lo registra automáticamente.

> **READ → Consultar citas**
> Permite consultar todas las citas registradas en el sistema, incluyendo el nombre del cliente, el barbero asignado, la fecha, hora y estado de cada cita.

> **UPDATE → Modificar cita**
> Permite modificar la fecha y hora de una cita existente. También permite asignar o actualizar el estilo de corte y la promoción vinculada a la cita.

> **DELETE → Cancelar cita**
> Permite eliminar permanentemente una cita del sistema.

| Operación | Método | Ruta | Descripción |
|---|---|---|---|
| READ | GET | `/api/citas` | Consultar todas las citas (incluye cálculo de `precioEstilo` y `descuentoPromocion` usando JOINs) |
| CREATE | POST | `/api/citas` | Registrar nueva cita |
| UPDATE | PUT | `/api/citas/:id` | Modificar fecha y hora |
| UPDATE | PUT | `/api/citas/:id/detalles` | Asignar estilo y promoción |
| DELETE | DELETE | `/api/citas/:id` | Cancelar cita |

### Lógica del sistema — Registrar Cita

1. El usuario accede al formulario de agendar cita
2. Llena los datos: nombre del cliente, teléfono, barbero, fecha y hora
3. El frontend envía los datos al endpoint `POST /api/citas`
4. El backend valida:
   - Nombre del cliente obligatorio, máx. 100 caracteres, solo letras
   - Barbero debe ser seleccionado (ID válido)
   - Fecha y hora son obligatorias
   - Teléfono: máx. 15 caracteres, solo números y guiones
5. El sistema **busca si el cliente ya existe** por nombre
   - Si existe → usa su ID
   - Si no existe → lo registra automáticamente en la tabla `Clientes`
6. Se registra la cita con `INSERT INTO Citas`
7. Se retorna `{ success: true, mensaje: "Cita creada" }`

### Reglas del sistema
- El nombre del cliente es **obligatorio**
- La fecha y hora son **obligatorias**
- El teléfono es opcional pero debe tener formato válido si se proporciona
- Al cancelar, la cita se elimina permanentemente

---



## 💰 MÓDULO: GESTIÓN DE PAGOS

**Archivos principales:** `Gestion-de-Pagos/pagos.js`

### Funcionalidad del módulo
Este módulo permite:
- Consultar todos los pagos registrados
- Registrar un nuevo pago vinculado a una cita
- Actualizar la información de un pago
- Eliminar un pago registrado

### Operaciones implementadas (CRUD)

> **CREATE → Registrar pago**
> Se recibe la información del pago desde el frontend (cita, monto y método de pago) y se almacena en la base de datos vinculada a la cita correspondiente.

> **READ → Consultar pagos**
> Permite consultar todos los pagos registrados en el sistema, incluyendo el monto, método de pago y la cita asociada.

> **UPDATE → Modificar pago**
> Permite actualizar el monto, método de pago y fecha de un pago existente.

> **DELETE → Eliminar pago**
> Permite al Dueño eliminar un pago del sistema.

| Operación | Método | Ruta | Acceso |
|---|---|---|---|
| READ | GET | `/api/pagos` | Todos los autenticados |
| CREATE | POST | `/api/pagos` | Todos los autenticados |
| UPDATE | PUT | `/api/pagos/:id` | Todos los autenticados |
| DELETE | DELETE | `/api/pagos/:id` | Solo Dueño |

### Lógica del sistema — Registrar Pago

1. El usuario selecciona la cita a pagar
2. El frontend autocalcula el monto a pagar: recupera el precio del corte asociado a la cita y le aplica el descuento de la promoción vinculada (si aplica).
3. Ingresa o confirma el monto y el método de pago (Efectivo, Tarjeta, etc.)
4. El backend recibe los datos y valida:
   - La cita debe ser válida (ID numérico)
   - El monto debe ser un número mayor a 0
   - El monto no puede exceder $99,999.99
5. Se registra el pago con `INSERT INTO Pagos`
6. Se retorna `{ success: true, mensaje: "Pago registrado" }`

### Reglas del sistema
- El **ID de cita** es obligatorio y debe existir
- El **monto** debe ser mayor a $0
- El monto máximo permitido es **$99,999.99**

---

## 🎁 MÓDULO: GESTIÓN DE PROMOCIONES y ESTILOS

**Archivos principales:** `Gestion-de-Promociones/promociones.js`, `Gestion-de-Estilos/estilos.js`

### Funcionalidad del módulo
Estos módulos paralelos permiten administrar el catálogo comercial de la barbería:
- Consultar, crear, modificar y eliminar promociones (descuentos por tiempo limitado).
- Consultar, crear, modificar y eliminar estilos de corte (catálogo de servicios con precio).

### Operaciones implementadas (CRUD)

> **CREATE → Registrar promoción / estilo**
> Permite al Dueño registrar una nueva promoción (con nombre, descripción, porcentaje de descuento y fechas de vigencia) o un nuevo estilo (con nombre, descripción y precio base).

> **READ → Consultar promociones / estilos**
> Permite obtener la lista completa de promociones y estilos. Accesible para que los barberos puedan usarlos al agendar citas o cobrar.

> **UPDATE → Modificar promoción / estilo**
> Permite al Dueño actualizar cualquier dato (nombre, descuento, fechas, precio o descripción) de un registro existente.

> **DELETE → Eliminar promoción / estilo**
> Permite al Dueño borrar permanentemente una promoción o estilo del sistema.

**Endpoints de Promociones:**
| Operación | Método | Ruta | Acceso |
|---|---|---|---|
| READ | GET | `/api/promociones` | Todos los autenticados |
| CREATE | POST | `/api/promociones` | Solo Dueño |
| UPDATE | PUT | `/api/promociones/:id` | Solo Dueño |
| DELETE | DELETE | `/api/promociones/:id` | Solo Dueño |

**Endpoints de Estilos:**
| Operación | Método | Ruta | Acceso |
|---|---|---|---|
| READ | GET | `/api/estilos` | Todos los autenticados |
| CREATE | POST | `/api/estilos` | Solo Dueño |
| UPDATE | PUT | `/api/estilos/:id` | Solo Dueño |
| DELETE | DELETE | `/api/estilos/:id` | Solo Dueño |

### Reglas del sistema
- El nombre es **obligatorio** tanto para estilos como para promociones.
- El descuento de promociones debe estar entre **0.01% y 100%**.
- El precio del estilo debe ser mayor a **$0**.
- Solo el **Dueño** tiene permisos de escritura (POST, PUT, DELETE); los barberos solo tienen acceso de lectura (GET) para poder aplicarlos.

---

## 🔒 MIDDLEWARES DE SEGURIDAD

**Archivos principales:** `MIDDLEWARES/AUTH.JS`

El sistema implementa dos middlewares de protección:

| Middleware | Función |
|---|---|
| `verificarToken` | Verifica que el token JWT sea válido en cada petición |
| `soloDueño` | Verifica que el usuario autenticado tenga rol de "Dueño" |

**Flujo de autenticación:**
1. El cliente envía el token en el header: `Authorization: Bearer <token>`
2. El middleware extrae y verifica el token
3. Si es válido → la petición continúa
4. Si no es válido o está expirado → responde `401 No autorizado`
5. Si la ruta requiere rol Dueño y el usuario es Barbero → responde `403 Prohibido`

---

## 📊 RESUMEN DE ENDPOINTS DE LA API

| Módulo | Endpoint base | Operaciones |
|---|---|---|
| Autenticación | `/api/auth` | POST login |
| Empleados | `/api/empleados` | GET, POST, PUT estado, DELETE |
| Clientes | `/api/clientes` | GET, POST, PUT, DELETE |
| Citas | `/api/citas` | GET, POST, PUT, DELETE |
| Estilos | `/api/estilos` | GET, POST, PUT, DELETE |
| Pagos | `/api/pagos` | GET, POST, PUT, DELETE |
| Promociones | `/api/promociones` | GET, POST, PUT, DELETE |

---

*Documentación generada para el sistema Barbería — Equipo 6*
