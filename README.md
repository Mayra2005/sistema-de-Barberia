# Barbería Super Bee — Sistema de Gestión

**Proyecto de Ingeniería de Software**

**Integrantes:**
- Mayra Azenet Ferrer Ramos
- Alondra Yazmin Galvan Zuñiga
- Xavier Israel Sucedo Castillo

---

## 📋 Descripción

Sistema de Gestión de Citas y Administración para la Barbería "Super Bee". Digitaliza y optimiza los procesos administrativos: citas, empleados, promociones, estilos, pagos y respaldo de información.

Roles del sistema:
- **Dueño** → Gestión de empleados, promociones, pagos y copia de seguridad.
- **Barbero** → Agendar, modificar y cancelar citas, seleccionar estilos y registrar pagos.

---

## 🛠 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js + Express |
| Base de datos | SQLite (generada automáticamente) |
| Autenticación | JWT |
| Control de versiones | GitHub |

---

## 🚀 Instrucciones para ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Mayra2005/Barberia-Eq6.git
cd Barberia-Eq6
```

### 2. Instalar dependencias del backend

```bash
cd BACKEND
npm install
```

### 3. Iniciar el servidor

```bash
node server.js
```

Deberías ver:
```
🔥 API PRO corriendo en http://localhost:3000
🔥 Conectado a la base de datos SQLite
```

> La base de datos SQLite **se crea automáticamente** la primera vez que inicias el servidor. No necesitas instalar ningún motor de base de datos.

### 4. Abrir el frontend

Abre el archivo `Frontend/Inicio-de-Sesion/sesion.html` en tu navegador.

> ⚠️ El servidor debe estar corriendo en `http://localhost:3000` antes de abrir el frontend.

---

## 🔑 Credenciales por defecto

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Dueño |
| `barbero` | `barbero123` | Barbero |

---

## 📁 Estructura del proyecto

```
Barberia-Eq6/
├── BACKEND/
│   ├── Agendar-Cita/          # Rutas de citas y clientes
│   ├── CONFIG/                # Configuración JWT
│   ├── Gestion-de-Empleados/  # Rutas de empleados
│   ├── Gestion-de-Estilos/    # Rutas de estilos
│   ├── Gestion-de-Pagos/      # Rutas de pagos
│   ├── Gestion-de-Promociones/# Rutas de promociones
│   ├── Inicio-de-Sesion/      # Autenticación (login)
│   ├── MIDDLEWARES/           # Verificación de token JWT
│   ├── DB.JS                  # Conexión y creación de tablas SQLite
│   ├── SERVER.JS              # Punto de entrada del servidor
│   └── package.json
├── Frontend/
│   ├── Agendar-Cita/
│   ├── Copia-de-Seguridad/
│   ├── Gestion-de-Empleados/
│   ├── Gestion-de-Pagos/
│   ├── Gestion-de-Promociones/
│   ├── Inicio-de-Sesion/
│   ├── Modificar-o-Cancelar cita/
│   ├── Registrar-Pagos/
│   ├── Seleccionar-estilo-y-promociones/
│   ├── css/
│   └── js/
│       └── script.js          # Lógica completa del frontend
└── README.md
```

---

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/) v16 o superior
- Navegador web moderno (Chrome, Firefox, Edge)
- No requiere MySQL, SQL Server ni ningún otro motor de base de datos externo
