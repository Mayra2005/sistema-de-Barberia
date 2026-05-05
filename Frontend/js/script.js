const API_URL = "http://localhost:3000/api";

// LOGIN
async function login() {
    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    if (usuario === "" || password === "") {
        alert("Llena todos los campos");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Error al iniciar sesión");
            return;
        }

        // Guardar token y rol
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);

        // Redirección según rol
        if (data.rol === "Dueño") {
            window.location.href = "../Gestion-de-Empleados/empleados.html";
        } else {
            window.location.href = "../Agendar-Cita/citas.html";
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("Error de conexión con el servidor");
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "../Inicio-de-Sesion/sesion.html";
}

// MENÚ DINÁMICO
function cargarMenu() {
    const rol = localStorage.getItem("rol");
    const token = localStorage.getItem("token");

    if (!rol || !token) {
        window.location.href = "../Inicio-de-Sesion/sesion.html";
        return;
    }

    const menu = document.getElementById("menu");
    const rolText = document.getElementById("rolActual");

    if(rolText) rolText.innerText = "Rol activo: " + rol;
    if(!menu) return;

    menu.innerHTML = "";

    // 🔴 MENÚ DUEÑO
    if (rol === "Dueño") {
        menu.innerHTML += `<a href="../Gestion-de-Empleados/empleados.html">Gestión de empleados</a>`;
        menu.innerHTML += `<a href="../Gestion-de-Promociones/promociones.html">Gestión de promociones</a>`;
        menu.innerHTML += `<a href="../Gestion-de-Pagos/pagos.html">Gestionar pagos</a>`;
        menu.innerHTML += `<a href="../Copia-de-Seguridad/seguridad.html">Copia de seguridad</a>`;
    }

    // 🔵 MENÚ BARBERO
    if (rol === "Barbero") {
        menu.innerHTML += `<a href="../Agendar-Cita/citas.html">Agendar cita</a>`;
        menu.innerHTML += `<a href="../Modificar-o-Cancelar cita/citas.html">Modificar y/o cancelar cita</a>`;
        menu.innerHTML += `<a href="../Seleccionar-estilo-y-promociones/estilos.html">Seleccionar estilo</a>`;
        menu.innerHTML += `<a href="../Registrar-Pagos/pagos.html">Registrar pagos</a>`;
    }

    // 🔐 Cerrar sesión (para ambos)
    menu.innerHTML += `<button onclick="logout()">Cerrar sesión</button>`;
}

// FUNCIONES GENÉRICAS PARA API CON TOKEN
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../Inicio-de-Sesion/sesion.html";
        return null;
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
}

// ==============================
// FUNCIONES DE GUARDADO (CRUD)
// ==============================

async function guardarEmpleado() {
    const nombre = document.getElementById("emp_nombre")?.value;
    const salario = document.getElementById("emp_salario")?.value;
    const usuario = document.getElementById("emp_usuario")?.value;
    const contrasena = document.getElementById("emp_contrasena")?.value;
    const rol = document.getElementById("emp_rol")?.value;

    if (!nombre || !usuario || !contrasena) return alert("Nombre, usuario y contraseña son requeridos");

    const res = await fetchAPI('/empleados', 'POST', {
        nombre,
        paterno: '',
        materno: '',
        telefono: '',
        horario: '',
        estado: 'Activo',
        especialidad: 'General',
        usuario,
        contrasena,
        rol
    });

    if (res.ok) {
        alert("Empleado guardado exitosamente");
        document.getElementById("emp_nombre").value = "";
        document.getElementById("emp_usuario").value = "";
        document.getElementById("emp_contrasena").value = "";
        if(document.getElementById("emp_salario")) document.getElementById("emp_salario").value = "";
    } else {
        alert("Error al guardar empleado");
    }
}

async function guardarPromocion() {
    const nombre = document.getElementById("prom_nombre")?.value;
    const descuento = document.getElementById("prom_descuento")?.value;

    if (!nombre || !descuento) return alert("Llena los campos");

    const res = await fetchAPI('/promociones', 'POST', {
        nombre,
        descripcion: 'Sin descripción',
        descuento: parseFloat(descuento) || 0,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date().toISOString().split('T')[0]
    });

    if (res.ok) {
        alert("Promoción guardada exitosamente");
    } else {
        alert("Error al guardar promoción");
    }
}

async function guardarPago() {
    const idCitas = document.getElementById("pago_cita")?.value;
    const monto = document.getElementById("pago_monto")?.value;
    const metodo_pago = document.getElementById("pago_metodo")?.value;

    if (!idCitas || !monto) return alert("Llena los campos");

    const res = await fetchAPI('/pagos', 'POST', {
        idCitas: parseInt(idCitas),
        monto: parseFloat(monto),
        metodo_pago,
        fecha: new Date().toISOString().split('T')[0]
    });

    if (res.ok) {
        alert("Pago registrado exitosamente");
    } else {
        alert("Error al registrar pago");
    }
}

async function guardarCita() {
    const nombreCliente = document.getElementById("cita_cliente_nombre")?.value;
    const telefonoCliente = document.getElementById("cita_cliente_telefono")?.value;
    const idEmpleado = document.getElementById("cita_empleado")?.value;
    const fecha = document.getElementById("cita_fecha")?.value;
    const hora = document.getElementById("cita_hora")?.value;

    if (!nombreCliente || !idEmpleado || !fecha || !hora) return alert("Llena los campos requeridos");

    const res = await fetchAPI('/citas', 'POST', {
        idEstilos: null, // Se asigna después en la otra pantalla
        nombreCliente,
        telefonoCliente,
        idEmpleados: parseInt(idEmpleado),
        fecha,
        hora,
        estado: 'Programada'
    });

    if (res.ok) {
        alert("Cita agendada exitosamente");
    } else {
        alert("Error al agendar cita");
    }
}

// ==============================
// FUNCIONES DE CARGA DINÁMICA
// ==============================

// Cargar barberos en el select al abrir Agendar Cita
async function cargarBarberosSelect() {
    const select = document.getElementById("cita_empleado");
    if (!select) return; // Si no estamos en la página de agendar cita, ignorar
    
    const res = await fetchAPI('/empleados');
    if (res.ok) {
        select.innerHTML = '<option value="">Selecciona un barbero...</option>';
        res.data.forEach(emp => {
            if (emp.rol === 'Barbero') {
                select.innerHTML += `<option value="${emp.idEmpleados}">${emp.nombre}</option>`;
            }
        });
    }
}

// Cargar citas en el select de Modificar/Cancelar Cita
async function cargarCitasSelect() {
    const select = document.getElementById("lista_citas");
    if (!select) return; // Ignorar si no estamos en esta pantalla

    const res = await fetchAPI('/citas');
    if (res.ok) {
        select.innerHTML = '<option value="">Selecciona una cita...</option>';
        res.data.forEach(cita => {
            select.innerHTML += `<option value="${cita.idCitas}">${cita.fecha} ${cita.hora} - ${cita.nombreCliente || 'Cliente'} con ${cita.nombreEmpleado || 'Barbero'}</option>`;
        });
    }
}

async function cancelarCita() {
    const idCita = document.getElementById("lista_citas")?.value;
    if (!idCita) return alert("Selecciona una cita primero");

    if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;

    const res = await fetchAPI(`/citas/${idCita}`, 'DELETE');
    if (res.ok) {
        alert("Cita cancelada exitosamente");
        cargarCitasSelect(); // Recargar lista
    } else {
        alert("Error al cancelar la cita");
    }
}

async function modificarCita() {
    const idCita = document.getElementById("lista_citas")?.value;
    const nuevaFecha = document.getElementById("mod_fecha")?.value;
    const nuevaHora = document.getElementById("mod_hora")?.value;

    if (!idCita) return alert("Selecciona una cita primero");
    if (!nuevaFecha || !nuevaHora) return alert("Ingresa la nueva fecha y hora");

    const res = await fetchAPI(`/citas/${idCita}`, 'PUT', { fecha: nuevaFecha, hora: nuevaHora });
    if (res.ok) {
        alert("Cita modificada exitosamente");
        cargarCitasSelect(); // Recargar lista
    } else {
        alert("Error al modificar la cita");
    }
}

// ==============================
// FUNCIONES DE ESTILOS Y PROMOCIONES
// ==============================

async function cargarEstilosYPromocionesSelect() {
    const selectCita = document.getElementById("estilo_cita");
    const selectEstilo = document.getElementById("estilo_estilo");
    const selectPromocion = document.getElementById("estilo_promocion");
    
    if (!selectCita || !selectEstilo || !selectPromocion) return;

    // Cargar citas
    const resCitas = await fetchAPI('/citas');
    if (resCitas.ok) {
        selectCita.innerHTML = '<option value="">Selecciona una cita...</option>';
        resCitas.data.forEach(cita => {
            selectCita.innerHTML += `<option value="${cita.idCitas}">${cita.fecha} ${cita.hora} - ${cita.nombreCliente || 'Cliente'} con ${cita.nombreEmpleado || 'Barbero'}</option>`;
        });
    }

    // Cargar estilos
    const resEstilos = await fetchAPI('/estilos'); // Nota: el backend de Estilos no está listo, se enviará dummy
    selectEstilo.innerHTML = '<option value="">Selecciona un estilo...</option>';
    if (resEstilos.ok && resEstilos.data) {
        resEstilos.data.forEach(e => selectEstilo.innerHTML += `<option value="${e.idEstilos}">${e.nombre}</option>`);
    } else {
        // Fallback por si la ruta de estilos aún no existe
        selectEstilo.innerHTML += `<option value="1">Corte Clásico</option><option value="2">Corte + Barba</option>`;
    }

    // Cargar promociones
    const resProm = await fetchAPI('/promociones');
    selectPromocion.innerHTML = '<option value="">Ninguna / Seleccionar promoción...</option>';
    if (resProm.ok) {
        resProm.data.forEach(p => selectPromocion.innerHTML += `<option value="${p.idPromociones}">${p.nombre} (-$${p.descuento})</option>`);
    }
}

async function asignarEstiloPromocion() {
    const idCita = document.getElementById("estilo_cita")?.value;
    const idEstilo = document.getElementById("estilo_estilo")?.value;
    const idPromocion = document.getElementById("estilo_promocion")?.value;

    if (!idCita) return alert("Selecciona una cita");

    const res = await fetchAPI(`/citas/${idCita}/detalles`, 'PUT', { 
        idEstilos: idEstilo ? parseInt(idEstilo) : null, 
        idPromociones: idPromocion ? parseInt(idPromocion) : null 
    });

    if (res.ok) {
        alert("Estilo y Promoción asignados a la cita");
        cargarEstilosYPromocionesSelect();
    } else {
        alert("Error al asignar detalles");
    }
}

// Cargar empleados en la tabla (Dueño)
async function cargarEmpleadosTabla() {
    const tbody = document.querySelector("#tabla_empleados tbody");
    if (!tbody) return;

    const res = await fetchAPI('/empleados');
    if (res.ok) {
        tbody.innerHTML = '';
        res.data.forEach(emp => {
            const esActivo = emp.estado === 'Activo';
            const botonEstado = esActivo 
                ? `<button style="background:red; padding:5px 10px; font-size:12px;" onclick="cambiarEstadoEmpleado(${emp.idEmpleados}, 'Inactivo')">Inactivar</button>`
                : `<button style="background:green; padding:5px 10px; font-size:12px;" onclick="cambiarEstadoEmpleado(${emp.idEmpleados}, 'Activo')">Activar</button>`;
            
            tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.nombre}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.rol}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.usuario}</td>
                    <td style="padding: 10px; border: 1px solid #555; font-weight: bold; color: ${esActivo ? '#4caf50' : '#f44336'};">${emp.estado || 'Activo'}</td>
                    <td style="padding: 10px; border: 1px solid #555; text-align: center;">${botonEstado}</td>
                </tr>
            `;
        });
    }
}

async function cambiarEstadoEmpleado(id, nuevoEstado) {
    if (!confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;

    const res = await fetchAPI(`/empleados/${id}/estado`, 'PUT', { estado: nuevoEstado });
    if (res.ok) {
        cargarEmpleadosTabla(); // Recargar tabla
    } else {
        alert("Error al cambiar estado");
    }
}

// Llamar a las funciones dinámicas si los elementos existen en la pantalla actual
window.addEventListener('DOMContentLoaded', () => {
    cargarBarberosSelect();
    cargarCitasSelect();
    cargarEmpleadosTabla();
    cargarEstilosYPromocionesSelect();
});
