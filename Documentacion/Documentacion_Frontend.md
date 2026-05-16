# 📘 Documentación del FRONTEND — Sistema de Barbería

---

## 1. Descripción General del Frontend

El frontend del sistema fue desarrollado en **HTML5, CSS y JavaScript (Vanilla)** dentro de la carpeta `/Frontend`.

Se implementaron interfaces para los módulos:

| Módulo | Descripción |
|---|---|
| 🔐 Inicio de Sesión | Autenticación de usuarios por rol |
| 📅 Agendar Cita | Registro de nuevas citas |
| ✏️ Modificar / Cancelar Cita | Edición y eliminación de citas existentes |
| 💇 Seleccionar Estilo y Promociones | Asignación de estilo y descuento a una cita |
| 💳 Registrar Pagos | Registro de pago por parte del barbero |
| 💰 Gestión de Pagos | Vista de pagos desde el rol Dueño |
| 👨‍💼 Gestión de Empleados | Alta y administración de personal (CRUD completo) |
| 🎁 Gestión de Promociones y Estilos | Creación de promociones y catálogo de cortes |

> [!NOTE]
> El frontend se comunica con el backend a través de una API REST local en `http://localhost:3000/api`. Toda la lógica de peticiones se centraliza en el archivo `/js/script.js`.

---

## 2. Estructura del Frontend en GitHub

El frontend se organizó de la siguiente manera dentro de la carpeta `/Frontend`:

```
Frontend/
├── Inicio-de-Sesion/
│   └── sesion.html
├── Agendar-Cita/
│   └── citas.html
├── Modificar-o-Cancelar cita/
│   └── citas.html
├── Seleccionar-estilo-y-promociones/
│   └── estilos.html
├── Registrar-Pagos/
│   └── pagos.html
├── Gestion-de-Pagos/
│   └── pagos.html
├── Gestion-de-Empleados/
│   └── empleados.html
├── Gestion-de-Promociones/
│   └── promociones.html
├── css/
│   └── style.css          ← Hoja de estilos global compartida
└── js/
    └── script.js          ← Lógica JavaScript global compartida
```

> [!IMPORTANT]
> Todos los módulos comparten el mismo `style.css` y `script.js`. No existe duplicidad de código: cada página HTML simplemente llama a estos archivos compartidos.

---

## 3. Módulos Desarrollados

---

### 🔐 Módulo: Inicio de Sesión

**Archivo principal:** `Inicio-de-Sesion/sesion.html`

**Diseño de la interfaz:**
La interfaz es simple y centrada, con campos para ingresar credenciales de acceso al sistema.

**Elementos principales:**

| Elemento | ID | Tipo |
|---|---|---|
| Campo Usuario | `usuario` | `input[type=text]` |
| Campo Contraseña | `password` | `input[type=password]` |
| Botón Iniciar Sesión | — | `button` |

**Funcionalidad y flujo:**

1. El usuario ve un formulario centrado con dos campos: **Usuario** y **Contraseña**.
2. Escribe sus credenciales y presiona el botón **Iniciar Sesión**.
3. Si los datos son incorrectos, se muestra un mensaje de error en pantalla y el usuario puede intentarlo de nuevo.
4. Si las credenciales son correctas, la página cambia automáticamente según el rol asignado:
   - El **Dueño** es redirigido a la pantalla de Gestión de Empleados.
   - El **Barbero** es redirigido a la pantalla de Agendar Cita.

---

### 📅 Módulo: Agendar Cita

**Archivo principal:** `Agendar-Cita/citas.html`

**Diseño de la interfaz:**
Formulario de registro para nuevas citas con validaciones en tiempo real.

**Elementos principales:**

| Elemento | ID | Tipo | Validación |
|---|---|---|---|
| Nombre del cliente | `cita_cliente_nombre` | `input[text]` | Solo letras y espacios, máx. 100 |
| Teléfono del cliente | `cita_cliente_telefono` | `input[tel]` | Solo números/guiones, máx. 15 |
| Selección de barbero | `cita_empleado` | `select` | Obligatorio, carga dinámica |
| Fecha de la cita | `cita_fecha` | `input[date]` | Obligatorio |
| Hora de la cita | `cita_hora` | `input[time]` | Obligatorio |
| Botón Registrar | — | `button` | Llama a `guardarCita()` |

**Funcionalidad y flujo:**

1. Al entrar a la página, el selector de **Barbero** se llena automáticamente con la lista de barberos activos disponibles.
2. El usuario completa el formulario con el nombre del cliente, su teléfono (opcional), el barbero asignado, la fecha y la hora deseada.
3. Los campos marcados con \* son obligatorios; si alguno queda vacío o tiene un formato incorrecto, aparece un mensaje de error debajo del campo correspondiente.
4. Al presionar **Registrar**, el sistema valida todos los campos en tiempo real antes de continuar.
5. Si todo es correcto, el formulario se limpia y aparece un mensaje de confirmación indicando que la cita fue registrada exitosamente.

---

### ✏️ Módulo: Modificar o Cancelar Cita

**Archivo principal:** `Modificar-o-Cancelar cita/citas.html`

**Diseño de la interfaz:**
Sección superior con el formulario de edición y tabla inferior con todas las citas registradas y filtro por fecha.

**Elementos principales:**

| Elemento | ID | Tipo |
|---|---|---|
| Selector de cita | `lista_citas` | `select` |
| Nueva fecha | `mod_fecha` | `input[date]` |
| Nueva hora | `mod_hora` | `input[time]` |
| Botón Modificar | — | `button` → `modificarCita()` |
| Botón Cancelar cita | — | `button` → `cancelarCita()` |
| Filtro por fecha | `filtro_fecha` | `input[date]` |
| Tabla de citas | `tabla_citas` | `table` |
| Resumen de resultados | `resumen_citas` | `span` |

**Funcionalidad y flujo:**

1. Al entrar a la página, el selector desplegable y la tabla inferior se rellenan automáticamente con todas las citas registradas.
2. La tabla muestra el número de cita, nombre del cliente, barbero asignado, fecha, hora y estado con código de color:
   - 🔵 **Programada** — cita activa pendiente
   - 🔴 **Cancelada** — cita eliminada del flujo
   - 🟢 **Completada** — servicio finalizado
3. **Para modificar:** El usuario selecciona una cita del desplegable, escribe la nueva fecha y/o hora en los campos correspondientes y presiona **Modificar**. La tabla se actualiza para reflejar el cambio.
4. **Para cancelar:** El usuario selecciona una cita del desplegable y presiona **Cancelar cita**. Aparece una ventana de confirmación; si acepta, la cita desaparece del listado activo.
5. **Para filtrar:** El usuario elige una fecha en el campo de filtro y la tabla muestra únicamente las citas de ese día. El botón **Ver todas** restablece la vista completa.

---

### 💇 Módulo: Seleccionar Estilo y Promociones

**Archivo principal:** `Seleccionar-estilo-y-promociones/estilos.html`

**Diseño de la interfaz:**
Formulario de asignación con tres selectores dinámicos cargados desde la API.

**Elementos principales:**

| Elemento | ID | Tipo | Notas |
|---|---|---|---|
| Selector de cita | `estilo_cita` | `select` | Cita existente a modificar |
| Selector de estilo | `estilo_estilo` | `select` | Estilos cargados desde `/api/estilos` |
| Selector de promoción | `estilo_promocion` | `select` | Opcional, cargado desde `/api/promociones` |
| Botón Guardar | — | `button` → `asignarEstiloPromocion()` |  |

**Funcionalidad y flujo:**

1. Al entrar a la página, los tres selectores se llenan automáticamente con las citas disponibles, los estilos registrados y las promociones activas.
2. El usuario elige la **cita** a la que desea asignar un servicio, luego selecciona el **estilo de corte** aplicado.
3. Opcionalmente, puede elegir una **promoción** con descuento del tercer selector; si no aplica ninguna, puede dejarlo en blanco.
4. Al presionar **Guardar Cambios**, el sistema confirma la asignación y la cita queda actualizada con el estilo y la promoción seleccionados.

---

### 💳 Módulo: Registrar Pagos (Barbero)

**Archivo principal:** `Registrar-Pagos/pagos.html`

**Diseño de la interfaz:**
Formulario simplificado para que el barbero registre el pago de una cita. Las citas disponibles se muestran en un `select` dinámico.

**Elementos principales:**

| Elemento | ID | Tipo | Validación |
|---|---|---|---|
| Selector de cita | `pago_cita_select` | `select` | Obligatorio, carga dinámica |
| Monto ($) | `pago_monto` | `input[number]` | Entre $0.01 y $99,999.99 |
| Método de pago | `pago_metodo` | `select` | Efectivo / Tarjeta / Transferencia |
| Botón Registrar Pago | — | `button` → `guardarPago()` | |

**Funcionalidad y flujo:**

1. Al entrar a la página, el selector de **Cita** se llena automáticamente con las citas disponibles para cobrar.
2. El barbero selecciona la cita correspondiente al cliente atendido.
3. El sistema **autocalcula el monto total** basado en el precio del estilo de corte y el descuento de la promoción asignada a la cita, rellenando el campo de Monto automáticamente.
4. El barbero verifica el **monto** y elige el **método de pago** (Efectivo, Tarjeta o Transferencia). Si el monto está fuera del rango permitido, aparece un mensaje de error.
5. Al presionar **Registrar Pago**, el sistema confirma el registro y la pantalla se actualiza.

---

### 💰 Módulo: Gestión de Pagos (Dueño)

**Archivo principal:** `Gestion-de-Pagos/pagos.html`

**Diseño de la interfaz:**
Versión extendida del módulo de pagos para el rol Dueño. Permite registrar pagos seleccionando la cita y gestionar el historial de pagos mediante una tabla interactiva (CRUD completo).

**Elementos principales:**

| Elemento | ID | Tipo | Validación |
|---|---|---|---|
| Selector de cita | `pago_cita_select` o `pago_cita` | `select` / `input` | Obligatorio |
| Monto ($) | `pago_monto` | `input[number]` | Autocalculado, entre $0.01 y $99,999.99 |
| Método de pago | `pago_metodo` | `select` | Efectivo / Tarjeta / Transferencia |
| Tabla de pagos | `tabla_pagos` | `table` | Carga el historial de pagos |

**Funcionalidad y flujo:**

1. Al entrar, se carga el selector con las citas disponibles y la tabla inferior con el historial completo de pagos registrados en el sistema.
2. Al seleccionar una cita, el sistema **autocalcula el monto** consultando el precio del estilo y restando el descuento de la promoción asociada.
3. El Dueño confirma el **monto** y selecciona el **método de pago**. Al registrar, el pago se añade a la base de datos.
4. Desde la tabla inferior, el Dueño puede presionar **Editar** para abrir una ventana modal y modificar los detalles del pago, o presionar **Eliminar** para borrar el registro permanentemente.

---

### 👨‍💼 Módulo: Gestión de Empleados (Dueño)

**Archivo principal:** `Gestion-de-Empleados/empleados.html`

**Diseño de la interfaz:**
Formulario de registro de empleados en la parte superior y tabla de personal en la parte inferior, con control de estado activo/inactivo.

**Elementos principales:**

| Elemento | ID | Tipo | Validación |
|---|---|---|---|
| Nombre | `emp_nombre` | `input[text]` | Solo letras, máx. 50 |
| Salario | `emp_salario` | `input[number]` | 0 a 999,999 |
| Usuario | `emp_usuario` | `input[text]` | Único, sin espacios, máx. 50 |
| Contraseña | `emp_contrasena` | `input[password]` | Mín. 4 caracteres, máx. 100 |
| Rol | `emp_rol` | `select` | Barbero / Dueño |
| Tabla de personal | `tabla_empleados` | `table` | Cargada dinámicamente |
| Feedback de usuario | `usuario_feedback` | `small` | Verificación en tiempo real |

**Funcionalidad y flujo:**

1. Al entrar a la página, la tabla inferior muestra automáticamente a todos los empleados registrados con su nombre, rol, usuario y estado actual.
2. El Dueño completa el formulario superior con los datos del nuevo empleado. Los campos obligatorios están marcados con \*.
3. Mientras escribe el **nombre de usuario**, aparece un indicador debajo del campo que confirma en tiempo real si ese usuario ya está en uso o si está disponible, sin necesidad de enviar el formulario.
4. Al presionar **Guardar**, el sistema valida todos los campos. Si alguno tiene error, se muestra el mensaje correspondiente debajo de ese campo.
5. Si todo es correcto, el nuevo empleado aparece inmediatamente en la tabla inferior.
6. Desde la tabla, el Dueño puede presionar el botón **Editar** para abrir una ventana modal y modificar la información básica y el salario del empleado.
7. Desde la tabla, el Dueño puede presionar el botón **Activar** o **Inactivar** de cada fila para cambiar el estado del empleado. El estado se refleja con color: 🟢 **Activo** (verde) o 🔴 **Inactivo** (rojo).

> [!TIP]
> El estado del empleado se muestra en color: 🟢 **Activo** (verde) o 🔴 **Inactivo** (rojo).

---

### 🎁 Módulo: Gestión de Promociones y Estilos (Dueño)

**Archivo principal:** `Gestion-de-Promociones/promociones.html`

**Diseño de la interfaz:**
Pantalla dividida en dos grandes secciones con formularios y tablas independientes para administrar tanto Promociones (descuentos) como Estilos (cortes y precios) de forma completa (CRUD).

**Elementos principales:**

| Elemento | ID | Tipo | Validación |
|---|---|---|---|
| Nombre promoción | `promo_nombre` | `input[text]` | Letras/números/espacios/guiones |
| Descuento (%) | `promo_descuento` | `input[number]` | Entre 0.01% y 100% |
| Fechas Promo | `promo_inicio` / `promo_fin` | `input[date]` | Obligatorias |
| Nombre Estilo | `estilo_nombre` | `input[text]` | Obligatorio |
| Precio Estilo ($) | `estilo_precio` | `input[number]` | Mayor a 0 |
| Tablas | `tabla_promociones` y `tabla_estilos` | `table` | Carga dinámica de registros |

**Funcionalidad y flujo:**

1. Al entrar a la página, se cargan automáticamente las dos tablas con las promociones y estilos que ya existen en la base de datos.
2. **Promociones**: El Dueño puede registrar una nueva promoción ingresando nombre, descripción, porcentaje y vigencia. 
3. **Estilos**: El Dueño puede registrar un nuevo estilo de corte ingresando nombre, descripción y el precio base del servicio.
4. En ambas tablas, cada registro cuenta con botones de **Editar** y **Eliminar**.
5. Al presionar Editar, se despliega una ventana modal oscura que permite modificar todos los valores del registro y guardarlos, actualizando la tabla instantáneamente.

---

## 4. Recursos Globales Compartidos

### `css/style.css`
Hoja de estilos global aplicada a todos los módulos. Define:
- Fondo gris claro del `body` (`#dcdcdc`)
- `header` oscuro (`#111`) con texto blanco
- Barra de navegación (`nav`) con fondo `#2a2a2a` y enlaces tipo botón
- `section` con fondo `#e9e9e9` y bordes redondeados
- Estilos base para `label`, `input` y botones

### `js/script.js`
Archivo JavaScript único con toda la lógica del frontend. Contiene:

| Función | Descripción |
|---|---|
| `login()` | Autenticación y redirección por rol |
| `logout()` | Cierre de sesión y limpieza de localStorage |
| `cargarMenu()` | Menú dinámico según rol (Dueño o Barbero) |
| `fetchAPI()` | Wrapper genérico para peticiones con token JWT |
| `validarCampo()` | Validación reutilizable de campos con múltiples reglas |
| `mostrarError()` | Muestra mensajes de error inline bajo cada campo |
| `verificarUsuarioDisponible()` | Verificación en tiempo real de usuarios únicos (debounce) |
| `guardarCita()` | POST de nueva cita |
| `modificarCita()` | PUT para actualizar fecha/hora de una cita |
| `cancelarCita()` | DELETE de una cita |
| `guardarPago()` | POST de nuevo pago |
| `guardarEmpleado()` | POST de nuevo empleado |
| `guardarPromocion()` | POST de nueva promoción |
| `asignarEstiloPromocion()` | PUT de estilo/promoción a una cita |
| `cargarBarberosSelect()` | GET de barberos activos para select |
| `cargarCitasSelect()` | GET de citas para select de modificar/cancelar |
| `cargarCitasSelectPago()` | GET de citas para select de pagos |
| `cargarEmpleadosTabla()` | GET de empleados para tabla de gestión |
| `cargarTablaCitas()` | GET de citas para tabla filtrable |
| `filtrarCitasPorFecha()` | Filtro en memoria por fecha |
| `cambiarEstadoEmpleado()` | PUT para activar/inactivar empleado |

---

## 5. Flujo de Navegación por Rol

```
[Inicio de Sesión]
        │
        ├── Rol: Dueño ──────────────────────────────────────────┐
        │                                                         │
        │   [Gestión de Empleados]   [Gestión de Promociones]   │
        │   [Gestionar Pagos]        [Copia de Seguridad]       │
        │                                                         │
        └── Rol: Barbero ────────────────────────────────────────┤
                                                                  │
            [Agendar Cita]          [Modificar/Cancelar Cita]   │
            [Seleccionar Estilo]    [Registrar Pagos]           │
                                                                  │
                            [Cerrar Sesión] ◄─────────────────────┘
```

> [!IMPORTANT]
> La función `cargarMenu()` se ejecuta con el evento `onload` en todas las páginas. Si no existe un token o rol en `localStorage`, el usuario es redirigido automáticamente al login, protegiendo el acceso a todas las vistas.
