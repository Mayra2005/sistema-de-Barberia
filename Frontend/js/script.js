const API_URL = "http://localhost:3000/api";

// ==============================
// LOGIN
// ==============================
async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    if (!usuario || !password) {
        alert("Llena todos los campos");
        return;
    }
    if (usuario.length > 50) { alert("El usuario no puede exceder 50 caracteres"); return; }
    if (password.length > 100) { alert("La contraseña no puede exceder 100 caracteres"); return; }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Usuario o contraseña incorrectos");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);

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

// ==============================
// LOGOUT
// ==============================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "../Inicio-de-Sesion/sesion.html";
}

// ==============================
// MENÚ DINÁMICO
// ==============================
function cargarMenu() {
    const rol = localStorage.getItem("rol");
    const token = localStorage.getItem("token");

    if (!rol || !token) {
        window.location.href = "../Inicio-de-Sesion/sesion.html";
        return;
    }

    const menu = document.getElementById("menu");
    const rolText = document.getElementById("rolActual");

    if (rolText) rolText.innerText = "Rol activo: " + rol;
    if (!menu) return;

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

// ==============================
// FUNCIÓN GENÉRICA FETCH CON TOKEN
// ==============================
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
// VALIDACIONES FRONTEND COMUNES
// ==============================

// Regex para validar tipos
const REGEX = {
    soloLetras:    /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/,
    soloNumeros:   /^[0-9]+$/,
    telefono:      /^[0-9\-\+\s]+$/,
    usuario:       /^[A-Za-z0-9_\-]+$/,
    nombreProm:    /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ0-9\s\-]+$/
};

/**
 * Valida un campo y muestra feedback visual en el input.
 * @returns {string|null} mensaje de error, o null si es válido
 */
function validarCampo(valor, { requerido = false, maxLen = null, minLen = null, regex = null, regexMsg = '', tipo = null, min = null, max = null } = {}) {
    if (requerido && (!valor || valor.toString().trim() === '')) {
        return "Este campo es obligatorio (NOT NULL)";
    }
    if (!valor || valor.toString().trim() === '') return null; // Opcional vacío → ok

    const v = valor.toString().trim();

    if (maxLen !== null && v.length > maxLen) {
        return `No puede exceder ${maxLen} caracteres (límite de la base de datos)`;
    }
    if (minLen !== null && v.length < minLen) {
        return `Debe tener al menos ${minLen} caracteres`;
    }
    if (tipo === 'numero') {
        if (isNaN(parseFloat(v)) || isNaN(Number(v))) return "Este campo solo acepta valores numéricos";
        if (min !== null && parseFloat(v) < min) return `El valor mínimo es ${min}`;
        if (max !== null && parseFloat(v) > max) return `El valor máximo es ${max}`;
    }
    if (tipo === 'entero') {
        if (!/^[0-9]+$/.test(v)) return "Este campo solo acepta números enteros";
        if (min !== null && parseInt(v) < min) return `El valor mínimo es ${min}`;
        if (max !== null && parseInt(v) > max) return `El valor máximo es ${max}`;
    }
    if (regex && !regex.test(v)) {
        return regexMsg || "Formato inválido";
    }
    return null;
}

/**
 * Muestra u oculta el mensaje de error junto al input.
 * No altera el diseño visual del input más que el texto de ayuda.
 */
function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let feedback = input.nextElementSibling;
    // Buscar el elemento de feedback existente o crearlo
    if (!feedback || !feedback.classList.contains('campo-error')) {
        feedback = document.createElement('small');
        feedback.className = 'campo-error';
        feedback.style.cssText = 'display:block; color:#e74c3c; font-size:12px; margin-top:2px;';
        input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    if (mensaje) {
        feedback.textContent = '⚠ ' + mensaje;
        feedback.style.display = 'block';
        input.style.borderColor = '#e74c3c';
    } else {
        feedback.textContent = '';
        feedback.style.display = 'none';
        input.style.borderColor = '';
    }
}

function limpiarErrores(ids) {
    ids.forEach(id => mostrarError(id, null));
}

// ==============================
// VERIFICAR USUARIO DUPLICADO (tiempo real)
// ==============================
let _debounceTimer = null;
async function verificarUsuarioDisponible(valor) {
    const feedback = document.getElementById('usuario_feedback');
    if (!feedback) return;

    clearTimeout(_debounceTimer);
    valor = valor.trim();

    if (!valor) {
        feedback.textContent = '';
        feedback.style.color = '';
        return;
    }

    // Validar formato antes de consultar al servidor
    if (!REGEX.usuario.test(valor)) {
        feedback.textContent = '⚠ Solo letras, números, guión y guión bajo (sin espacios)';
        feedback.style.color = '#e74c3c';
        return;
    }

    feedback.textContent = '🔍 Verificando disponibilidad...';
    feedback.style.color = '#aaa';

    _debounceTimer = setTimeout(async () => {
        const res = await fetchAPI(`/empleados/verificar-usuario/${encodeURIComponent(valor)}`);
        if (res && res.ok) {
            if (res.data.disponible) {
                feedback.textContent = '✅ Usuario disponible';
                feedback.style.color = '#4caf50';
            } else {
                feedback.textContent = '❌ Este usuario ya está registrado. Elige otro.';
                feedback.style.color = '#e74c3c';
            }
        } else {
            feedback.textContent = '';
        }
    }, 600);
}

// ==============================
// FUNCIONES DE GUARDADO (CRUD)
// ==============================

async function guardarEmpleado() {
    const nombre    = document.getElementById("emp_nombre")?.value ?? '';
    const usuario   = document.getElementById("emp_usuario")?.value ?? '';
    const contrasena= document.getElementById("emp_contrasena")?.value ?? '';
    const rol       = document.getElementById("emp_rol")?.value;

    // Limpiar errores previos
    limpiarErrores(['emp_nombre', 'emp_usuario', 'emp_contrasena']);

    // Validar nombre
    const errNombre = validarCampo(nombre, { requerido: true, maxLen: 50, regex: REGEX.soloLetras, regexMsg: "El nombre solo puede contener letras y espacios" });
    if (errNombre) { mostrarError('emp_nombre', errNombre); return; }

    // Validar usuario
    const errUsuario = validarCampo(usuario, { requerido: true, maxLen: 50, regex: REGEX.usuario, regexMsg: "Solo letras, números, guión y guión bajo. Sin espacios." });
    if (errUsuario) { mostrarError('emp_usuario', errUsuario); return; }

    // Verificar disponibilidad del usuario antes de enviar
    const checkUsuario = await fetchAPI(`/empleados/verificar-usuario/${encodeURIComponent(usuario.trim())}`);
    if (checkUsuario && checkUsuario.ok && !checkUsuario.data.disponible) {
        mostrarError('emp_usuario', `El usuario '${usuario.trim()}' ya está registrado. Elige otro nombre de usuario.`);
        return;
    }

    // Validar contraseña
    const errPass = validarCampo(contrasena, { requerido: true, maxLen: 100, minLen: 4 });
    if (errPass) { mostrarError('emp_contrasena', errPass); return; }

    const res = await fetchAPI('/empleados', 'POST', {
        nombre: nombre.trim(),
        paterno: '',
        materno: '',
        telefono: '',
        horario: '',
        estado: 'Activo',
        especialidad: 'General',
        usuario: usuario.trim(),
        contrasena,
        rol
    });

    if (res && res.ok) {
        alert("✅ Empleado guardado exitosamente");
        document.getElementById("emp_nombre").value = "";
        document.getElementById("emp_usuario").value = "";
        document.getElementById("emp_contrasena").value = "";
        const feedback = document.getElementById('usuario_feedback');
        if (feedback) { feedback.textContent = ''; }
        cargarEmpleadosTabla();
    } else {
        const msg = res?.data?.error || "Error al guardar empleado";
        // Mostrar el error del servidor en el campo correspondiente si es de usuario duplicado
        if (msg.toLowerCase().includes('usuario')) {
            mostrarError('emp_usuario', msg);
        } else {
            alert("❌ " + msg);
        }
    }
}

async function guardarPromocion() {
    const nombre    = document.getElementById("prom_nombre")?.value ?? '';
    const descuento = document.getElementById("prom_descuento")?.value ?? '';

    limpiarErrores(['prom_nombre', 'prom_descuento']);

    const errNombre = validarCampo(nombre, { requerido: true, maxLen: 80, regex: REGEX.nombreProm, regexMsg: "Solo letras, números, espacios y guiones" });
    if (errNombre) { mostrarError('prom_nombre', errNombre); return; }

    const errDesc = validarCampo(descuento, { requerido: true, tipo: 'numero', min: 0.01, max: 100 });
    if (errDesc) { mostrarError('prom_descuento', errDesc); return; }

    const res = await fetchAPI('/promociones', 'POST', {
        nombre: nombre.trim(),
        descripcion: 'Sin descripción',
        descuento: parseFloat(descuento),
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date().toISOString().split('T')[0]
    });

    if (res && res.ok) {
        alert("✅ Promoción guardada exitosamente");
        document.getElementById("prom_nombre").value = "";
        document.getElementById("prom_descuento").value = "";
    } else {
        alert("❌ " + (res?.data?.error || "Error al guardar promoción"));
    }
}

async function guardarPago() {
    // Lee desde el select (Barbero) o desde el input numérico (Dueño)
    const idCitas    = document.getElementById("pago_cita_select")?.value || document.getElementById("pago_cita")?.value;
    const monto      = document.getElementById("pago_monto")?.value ?? '';
    const metodo_pago= document.getElementById("pago_metodo")?.value;

    limpiarErrores(['pago_cita', 'pago_monto']);

    if (!idCitas || idCitas === '') {
        const elCita = document.getElementById("pago_cita_select") || document.getElementById("pago_cita");
        mostrarError(elCita?.id || 'pago_cita', "Debes seleccionar o ingresar una cita");
        return;
    }

    const errMonto = validarCampo(monto, { requerido: true, tipo: 'numero', min: 0.01, max: 99999.99 });
    if (errMonto) { mostrarError('pago_monto', errMonto); return; }

    const res = await fetchAPI('/pagos', 'POST', {
        idCitas: parseInt(idCitas),
        monto: parseFloat(monto),
        metodo_pago: metodo_pago || 'Efectivo',
        fecha: new Date().toISOString().split('T')[0]
    });

    if (res && res.ok) {
        alert("✅ Pago registrado exitosamente");
        cargarCitasSelectPago();
        if (document.getElementById("pago_monto")) document.getElementById("pago_monto").value = "";
        if (document.getElementById("pago_cita")) document.getElementById("pago_cita").value = "";
    } else {
        alert("❌ " + (res?.data?.error || "Error al registrar pago"));
    }
}

async function guardarCita() {
    const nombreCliente   = document.getElementById("cita_cliente_nombre")?.value ?? '';
    const telefonoCliente = document.getElementById("cita_cliente_telefono")?.value ?? '';
    const idEmpleado      = document.getElementById("cita_empleado")?.value;
    const fecha           = document.getElementById("cita_fecha")?.value;
    const hora            = document.getElementById("cita_hora")?.value;

    limpiarErrores(['cita_cliente_nombre', 'cita_cliente_telefono', 'cita_empleado', 'cita_fecha', 'cita_hora']);

    // Nombre: obligatorio, solo letras, máx 100
    const errNombre = validarCampo(nombreCliente, { requerido: true, maxLen: 100, regex: REGEX.soloLetras, regexMsg: "El nombre solo puede contener letras y espacios" });
    if (errNombre) { mostrarError('cita_cliente_nombre', errNombre); return; }

    // Teléfono: opcional pero solo números/guiones, máx 15
    const errTel = validarCampo(telefonoCliente, { maxLen: 15, regex: REGEX.telefono, regexMsg: "Solo números, guiones y espacios" });
    if (errTel) { mostrarError('cita_cliente_telefono', errTel); return; }

    // Barbero: requerido
    if (!idEmpleado || idEmpleado === '') {
        mostrarError('cita_empleado', "Debes seleccionar un barbero");
        return;
    }

    // Fecha y hora: requeridos
    if (!fecha) { mostrarError('cita_fecha', "La fecha es obligatoria"); return; }
    if (!hora)  { mostrarError('cita_hora', "La hora es obligatoria"); return; }

    const res = await fetchAPI('/citas', 'POST', {
        idEstilos: null,
        nombreCliente: nombreCliente.trim(),
        telefonoCliente: telefonoCliente.trim(),
        idEmpleados: parseInt(idEmpleado),
        fecha,
        hora,
        estado: 'Programada'
    });

    if (res && res.ok) {
        alert("✅ Cita agendada exitosamente");
        document.getElementById("cita_cliente_nombre").value = "";
        document.getElementById("cita_cliente_telefono").value = "";
        document.getElementById("cita_fecha").value = "";
        document.getElementById("cita_hora").value = "";
        document.getElementById("cita_empleado").value = "";
    } else {
        alert("❌ " + (res?.data?.error || "Error al agendar cita"));
    }
}

// ==============================
// FUNCIONES DE CARGA DINÁMICA
// ==============================

// Cargar barberos en el select al abrir Agendar Cita
async function cargarBarberosSelect() {
    const select = document.getElementById("cita_empleado");
    if (!select) return;

    const res = await fetchAPI('/empleados');
    if (res && res.ok) {
        select.innerHTML = '<option value="">Selecciona un barbero...</option>';
        res.data.forEach(emp => {
            // Mostrar solo barberos activos (o sin estado asignado)
            if (emp.rol === 'Barbero' && (emp.estado === 'Activo' || emp.estado === null || emp.estado === '')) {
                select.innerHTML += `<option value="${emp.idEmpleados}">${emp.nombre}</option>`;
            }
        });
        if (select.options.length === 1) {
            select.innerHTML += '<option value="" disabled>No hay barberos activos</option>';
        }
    } else {
        select.innerHTML = '<option value="">Error al cargar barberos</option>';
    }
}

// Cargar citas en el select de Modificar/Cancelar Cita
async function cargarCitasSelect() {
    const select = document.getElementById("lista_citas");
    if (!select) return;

    const res = await fetchAPI('/citas');
    if (res && res.ok) {
        select.innerHTML = '<option value="">Selecciona una cita...</option>';
        if (res.data.length === 0) {
            select.innerHTML += '<option value="" disabled>No hay citas registradas</option>';
        }
        res.data.forEach(cita => {
            select.innerHTML += `<option value="${cita.idCitas}">${cita.fecha} ${cita.hora} - ${cita.nombreCliente || 'Cliente'} con ${cita.nombreEmpleado || 'Barbero'}</option>`;
        });
    }
}

// Cargar citas en el select de Registrar Pagos
async function cargarCitasSelectPago() {
    const select = document.getElementById("pago_cita_select");
    if (!select) return;

    const res = await fetchAPI('/citas');
    if (res && res.ok) {
        select.innerHTML = '<option value="">Selecciona una cita...</option>';
        if (res.data.length === 0) {
            select.innerHTML += '<option value="" disabled>No hay citas registradas</option>';
        }
        res.data.forEach(cita => {
            select.innerHTML += `<option value="${cita.idCitas}">#${cita.idCitas} - ${cita.fecha} ${cita.hora} - ${cita.nombreCliente || 'Cliente'}</option>`;
        });
    }
}

async function cancelarCita() {
    const idCita = document.getElementById("lista_citas")?.value;
    if (!idCita) return alert("Selecciona una cita primero");

    if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;

    const res = await fetchAPI(`/citas/${idCita}`, 'DELETE');
    if (res && res.ok) {
        alert("✅ Cita cancelada exitosamente");
        cargarCitasSelect();
        cargarTablaCitas();
    } else {
        alert("❌ Error al cancelar la cita");
    }
}

async function modificarCita() {
    const idCita    = document.getElementById("lista_citas")?.value;
    const nuevaFecha= document.getElementById("mod_fecha")?.value;
    const nuevaHora = document.getElementById("mod_hora")?.value;

    if (!idCita) return alert("Selecciona una cita primero");
    if (!nuevaFecha || !nuevaHora) return alert("Ingresa la nueva fecha y hora");

    const res = await fetchAPI(`/citas/${idCita}`, 'PUT', { fecha: nuevaFecha, hora: nuevaHora });
    if (res && res.ok) {
        alert("✅ Cita modificada exitosamente");
        cargarCitasSelect();
        cargarTablaCitas();
    } else {
        alert("❌ Error al modificar la cita");
    }
}

// ==============================
// FUNCIONES DE ESTILOS Y PROMOCIONES
// ==============================

async function cargarEstilosYPromocionesSelect() {
    const selectCita     = document.getElementById("estilo_cita");
    const selectEstilo   = document.getElementById("estilo_estilo");
    const selectPromocion= document.getElementById("estilo_promocion");

    if (!selectCita || !selectEstilo || !selectPromocion) return;

    // Cargar citas
    const resCitas = await fetchAPI('/citas');
    if (resCitas && resCitas.ok) {
        selectCita.innerHTML = '<option value="">Selecciona una cita...</option>';
        resCitas.data.forEach(cita => {
            selectCita.innerHTML += `<option value="${cita.idCitas}">${cita.fecha} ${cita.hora} - ${cita.nombreCliente || 'Cliente'} con ${cita.nombreEmpleado || 'Barbero'}</option>`;
        });
    }

    // Cargar estilos
    const resEstilos = await fetchAPI('/estilos');
    selectEstilo.innerHTML = '<option value="">Selecciona un estilo...</option>';
    if (resEstilos && resEstilos.ok && resEstilos.data && resEstilos.data.length > 0) {
        resEstilos.data.forEach(e => selectEstilo.innerHTML += `<option value="${e.idEstilos}">${e.nombre}</option>`);
    } else {
        selectEstilo.innerHTML += `<option value="1">Corte Clásico</option><option value="2">Corte + Barba</option>`;
    }

    // Cargar promociones
    const resProm = await fetchAPI('/promociones');
    selectPromocion.innerHTML = '<option value="">Ninguna / Seleccionar promoción...</option>';
    if (resProm && resProm.ok) {
        resProm.data.forEach(p => selectPromocion.innerHTML += `<option value="${p.idPromociones}">${p.nombre} (-${p.descuento}%)</option>`);
    }
}

async function asignarEstiloPromocion() {
    const idCita     = document.getElementById("estilo_cita")?.value;
    const idEstilo   = document.getElementById("estilo_estilo")?.value;
    const idPromocion= document.getElementById("estilo_promocion")?.value;

    if (!idCita) return alert("Selecciona una cita");

    const res = await fetchAPI(`/citas/${idCita}/detalles`, 'PUT', {
        idEstilos:     idEstilo    ? parseInt(idEstilo)    : null,
        idPromociones: idPromocion ? parseInt(idPromocion) : null
    });

    if (res && res.ok) {
        alert("✅ Estilo y Promoción asignados a la cita");
        cargarEstilosYPromocionesSelect();
    } else {
        alert("❌ Error al asignar detalles");
    }
}

// Cargar empleados en la tabla (Dueño)
async function cargarEmpleadosTabla() {
    const tbody = document.querySelector("#tabla_empleados tbody");
    if (!tbody) return;

    const res = await fetchAPI('/empleados');
    if (res && res.ok) {
        tbody.innerHTML = '';
        res.data.forEach(emp => {
            const estadoReal = emp.estado || 'Activo';
            const esActivo   = estadoReal === 'Activo';
            const botonEstado = esActivo
                ? `<button style="background:red; padding:5px 10px; font-size:12px;" onclick="cambiarEstadoEmpleado(${emp.idEmpleados}, 'Inactivo')">Inactivar</button>`
                : `<button style="background:green; padding:5px 10px; font-size:12px;" onclick="cambiarEstadoEmpleado(${emp.idEmpleados}, 'Activo')">Activar</button>`;

            tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.nombre}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.rol}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.usuario || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #555; font-weight: bold; color: ${esActivo ? '#4caf50' : '#f44336'};">${estadoReal}</td>
                    <td style="padding: 10px; border: 1px solid #555; text-align: center;">${botonEstado}</td>
                </tr>
            `;
        });
    }
}

async function cambiarEstadoEmpleado(id, nuevoEstado) {
    if (!confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;

    const res = await fetchAPI(`/empleados/${id}/estado`, 'PUT', { estado: nuevoEstado });
    if (res && res.ok) {
        cargarEmpleadosTabla();
    } else {
        alert("❌ Error al cambiar estado");
    }
}

// ==============================
// TABLA DE CITAS (Modificar/Cancelar)
// ==============================

// Almacena todas las citas para poder filtrar sin nueva petición al servidor
let _todasLasCitas = [];

async function cargarTablaCitas() {
    const tbody = document.getElementById('tabla_citas_body');
    if (!tbody) return; // Solo ejecutar en la página correcta

    tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">Cargando...</td></tr>`;

    const res = await fetchAPI('/citas');
    if (!res || !res.ok) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#e74c3c; border:1px solid #555;">❌ Error al cargar las citas</td></tr>`;
        return;
    }

    // Ordenar por fecha y hora de forma ascendente
    _todasLasCitas = res.data.sort((a, b) => {
        const da = (a.fecha || '') + (a.hora || '');
        const db = (b.fecha || '') + (b.hora || '');
        return da.localeCompare(db);
    });

    renderizarTablaCitas(_todasLasCitas);
}

function renderizarTablaCitas(citas) {
    const tbody = document.getElementById('tabla_citas_body');
    const resumen = document.getElementById('resumen_citas');
    if (!tbody) return;

    if (citas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">No hay citas para mostrar</td></tr>`;
        if (resumen) resumen.textContent = '';
        return;
    }

    if (resumen) resumen.textContent = `${citas.length} cita${citas.length !== 1 ? 's' : ''} encontrada${citas.length !== 1 ? 's' : ''}`;

    tbody.innerHTML = citas.map(cita => {
        // Color según estado
        const colores = { 'Programada': '#3498db', 'Cancelada': '#e74c3c', 'Completada': '#4caf50' };
        const color = colores[cita.estado] || '#aaa';

        return `
            <tr style="border-bottom:1px solid #444;">
                <td style="padding:10px; border:1px solid #555; color:#aaa; font-size:13px;">#${cita.idCitas}</td>
                <td style="padding:10px; border:1px solid #555;">${cita.nombreCliente || '—'}</td>
                <td style="padding:10px; border:1px solid #555;">${cita.nombreEmpleado || '—'}</td>
                <td style="padding:10px; border:1px solid #555;">${cita.fecha || '—'}</td>
                <td style="padding:10px; border:1px solid #555;">${cita.hora || '—'}</td>
                <td style="padding:10px; border:1px solid #555; font-weight:bold; color:${color};">${cita.estado || '—'}</td>
            </tr>
        `;
    }).join('');
}

function filtrarCitasPorFecha() {
    const fecha = document.getElementById('filtro_fecha')?.value;
    if (!fecha) {
        renderizarTablaCitas(_todasLasCitas);
        return;
    }
    const filtradas = _todasLasCitas.filter(c => c.fecha === fecha);
    renderizarTablaCitas(filtradas);
}

function limpiarFiltro() {
    const filtro = document.getElementById('filtro_fecha');
    if (filtro) filtro.value = '';
    renderizarTablaCitas(_todasLasCitas);
}

// ==============================
// INICIALIZACIÓN AL CARGAR PÁGINA
// ==============================
window.addEventListener('DOMContentLoaded', () => {
    cargarBarberosSelect();
    cargarCitasSelect();
    cargarCitasSelectPago();
    cargarEmpleadosTabla();
    cargarEstilosYPromocionesSelect();
    cargarTablaCitas();
});
