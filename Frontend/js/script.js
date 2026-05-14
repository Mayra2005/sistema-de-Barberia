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
        menu.innerHTML += `<a href="../Gestion-de-Promociones/promociones.html">Gestión de promociones y estilos</a>`;
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
        rol,
        salario: parseFloat(document.getElementById("emp_salario")?.value) || 0
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
    const nombre      = document.getElementById("promo_nombre")?.value ?? '';
    const descripcion = document.getElementById("promo_descripcion")?.value ?? '';
    const descuento   = document.getElementById("promo_descuento")?.value ?? '';
    const inicio      = document.getElementById("promo_inicio")?.value ?? '';
    const fin         = document.getElementById("promo_fin")?.value ?? '';

    limpiarErrores(['promo_nombre', 'promo_descuento', 'promo_inicio', 'promo_fin']);

    const errNombre = validarCampo(nombre, { requerido: true, maxLen: 80, regex: REGEX.nombreProm, regexMsg: "Solo letras, números, espacios y guiones" });
    if (errNombre) { mostrarError('promo_nombre', errNombre); return; }

    const errDesc = validarCampo(descuento, { requerido: true, tipo: 'numero', min: 0.01, max: 100 });
    if (errDesc) { mostrarError('promo_descuento', errDesc); return; }

    if (!inicio) { mostrarError('promo_inicio', "La fecha de inicio es requerida"); return; }
    if (!fin) { mostrarError('promo_fin', "La fecha de fin es requerida"); return; }

    const res = await fetchAPI('/promociones', 'POST', {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || 'Sin descripción',
        descuento: parseFloat(descuento),
        fecha_inicio: inicio,
        fecha_fin: fin
    });

    if (res && res.ok) {
        alert("✅ Promoción guardada exitosamente");
        document.getElementById("promo_nombre").value = "";
        document.getElementById("promo_descripcion").value = "";
        document.getElementById("promo_descuento").value = "";
        document.getElementById("promo_inicio").value = "";
        document.getElementById("promo_fin").value = "";
        cargarTablaPromociones();
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
        cargarTablaPagos();
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
        _todasLasCitas = res.data; // Para poder acceder a ellas al calcular total
    }
}

function alSeleccionarCitaParaPago() {
    const idCita = document.getElementById("pago_cita_select")?.value;
    const inputMonto = document.getElementById("pago_monto");
    if (!idCita || !inputMonto) return;
    
    const cita = _todasLasCitas.find(c => c.idCitas == idCita);
    if (cita) {
        let precio = parseFloat(cita.precioEstilo || 0);
        if (precio === 0) return; // Si no hay estilo con precio, dejar vacío
        let descuento = cita.descuentoPromocion ? parseFloat(cita.descuentoPromocion) : 0;
        let total = precio - (precio * (descuento / 100));
        inputMonto.value = total.toFixed(2);
    } else {
        inputMonto.value = '';
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
            const botonEditar = `<button style="background:#3498db; padding:5px 10px; font-size:12px; margin-right:5px;" onclick="abrirModalEditarEmpleado(${emp.idEmpleados}, '${emp.nombre.replace(/'/g, "\\'")}', '${emp.usuario}', '${emp.rol}', ${emp.salario || 0})">Editar</button>`;

            tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.nombre}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.rol}</td>
                    <td style="padding: 10px; border: 1px solid #555;">${emp.usuario || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #555; color: #4caf50;">$${parseFloat(emp.salario || 0).toFixed(2)}</td>
                    <td style="padding: 10px; border: 1px solid #555; font-weight: bold; color: ${esActivo ? '#4caf50' : '#f44336'};">${estadoReal}</td>
                    <td style="padding: 10px; border: 1px solid #555; text-align: center;">${botonEditar}${botonEstado}</td>
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
// TABLA DE PAGOS
// ==============================
async function cargarTablaPagos() {
    const tbody = document.getElementById('tabla_pagos_body');
    if (!tbody) return; // Solo ejecutar en la página correcta

    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">Cargando...</td></tr>`;

    const res = await fetchAPI('/pagos');
    if (!res || !res.ok) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#e74c3c; border:1px solid #555;">❌ Error al cargar los pagos</td></tr>`;
        return;
    }

    const pagos = res.data || [];
    if (pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">No hay pagos registrados</td></tr>`;
        return;
    }

    const rol = localStorage.getItem("rol");
    tbody.innerHTML = pagos.map(pago => {
        const btnEliminar = rol === "Dueño" ? `<button style="background:red; padding:5px 10px; font-size:12px; margin-left:5px;" onclick="eliminarPago(${pago.idPagos})">Eliminar</button>` : '';
        return `
            <tr>
                <td style="padding: 10px; border: 1px solid #555;">#${pago.idPagos}</td>
                <td style="padding: 10px; border: 1px solid #555;">${pago.idCitas}</td>
                <td style="padding: 10px; border: 1px solid #555; color: #4caf50; font-weight: bold;">$${parseFloat(pago.monto).toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #555;">${pago.metodo_pago || 'Efectivo'}</td>
                <td style="padding: 10px; border: 1px solid #555;">${pago.fecha || '—'}</td>
                <td style="padding: 10px; border: 1px solid #555; text-align:center;">
                    <button style="background:#3498db; padding:5px 10px; font-size:12px;" onclick="abrirModalEditarPago(${pago.idPagos}, ${pago.monto}, '${pago.metodo_pago}', '${pago.fecha}')">Editar</button>
                    ${btnEliminar}
                </td>
            </tr>
        `;
    }).join('');
}

// ==============================
// FUNCIONES CRUD EXTRAS (PAGOS, PROMOCIONES)
// ==============================

// --- EMPLEADOS ---
function abrirModalEditarEmpleado(id, nombre, usuario, rol, salario) {
    document.getElementById('edit_emp_id').value = id;
    document.getElementById('edit_emp_id_display').innerText = id;
    document.getElementById('edit_emp_nombre').value = nombre;
    document.getElementById('edit_emp_usuario').value = usuario;
    document.getElementById('edit_emp_rol').value = rol;
    document.getElementById('edit_emp_salario').value = salario;
    document.getElementById('modalEditarEmpleado').style.display = 'flex';
}

async function actualizarEmpleado() {
    const id = document.getElementById('edit_emp_id').value;
    const nombre = document.getElementById('edit_emp_nombre').value;
    const usuario = document.getElementById('edit_emp_usuario').value;
    const rol = document.getElementById('edit_emp_rol').value;
    const salario = document.getElementById('edit_emp_salario').value;

    if (!nombre) return alert('Nombre requerido');
    if (!usuario) return alert('Usuario requerido');
    
    const res = await fetchAPI(`/empleados/${id}`, 'PUT', { nombre, usuario, rol, salario });
    if (res && res.ok) {
        alert("✅ Empleado actualizado");
        document.getElementById('modalEditarEmpleado').style.display = 'none';
        cargarEmpleadosTabla();
    } else {
        alert("❌ Error: " + (res?.data?.error || ""));
    }
}

// --- PAGOS ---
function abrirModalEditarPago(id, monto, metodo, fecha) {
    document.getElementById('edit_pago_id').value = id;
    document.getElementById('edit_pago_id_display').innerText = id;
    document.getElementById('edit_pago_monto').value = monto;
    document.getElementById('edit_pago_metodo').value = metodo || 'Efectivo';
    document.getElementById('edit_pago_fecha').value = fecha;
    document.getElementById('modalEditarPago').style.display = 'flex';
}

async function actualizarPago() {
    const id = document.getElementById('edit_pago_id').value;
    const monto = document.getElementById('edit_pago_monto').value;
    const metodo = document.getElementById('edit_pago_metodo').value;
    const fecha = document.getElementById('edit_pago_fecha').value;

    if (!monto || parseFloat(monto) <= 0) return alert('Monto inválido');

    const res = await fetchAPI(`/pagos/${id}`, 'PUT', { monto: parseFloat(monto), metodo_pago: metodo, fecha });
    if (res && res.ok) {
        alert("✅ Pago actualizado");
        document.getElementById('modalEditarPago').style.display = 'none';
        cargarTablaPagos();
    } else {
        alert("❌ Error al actualizar pago: " + (res?.data?.error || ""));
    }
}

async function eliminarPago(id) {
    if (!confirm('¿Seguro que deseas eliminar este pago?')) return;
    const res = await fetchAPI(`/pagos/${id}`, 'DELETE');
    if (res && res.ok) {
        alert("✅ Pago eliminado");
        cargarTablaPagos();
    } else {
        alert("❌ Error al eliminar pago: " + (res?.data?.error || ""));
    }
}

// --- PROMOCIONES ---
async function cargarTablaPromociones() {
    const tbody = document.getElementById('tabla_promociones_body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">Cargando...</td></tr>`;

    const res = await fetchAPI('/promociones');
    if (!res || !res.ok) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#e74c3c; border:1px solid #555;">❌ Error al cargar las promociones</td></tr>`;
        return;
    }

    const promociones = res.data || [];
    if (promociones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">No hay promociones registradas</td></tr>`;
        return;
    }

    const rol = localStorage.getItem("rol");
    tbody.innerHTML = promociones.map(prom => {
        const btnEliminar = rol === "Dueño" ? `<button style="background:red; padding:5px 10px; font-size:12px; margin-left:5px;" onclick="eliminarPromocion(${prom.idPromociones})">Eliminar</button>` : '';
        const btnEditar = rol === "Dueño" ? `<button style="background:#3498db; padding:5px 10px; font-size:12px;" onclick="abrirModalEditarPromocion(${prom.idPromociones}, '${prom.nombre.replace(/'/g, "\\'")}', '${(prom.descripcion||'').replace(/'/g, "\\'")}', ${prom.descuento}, '${prom.fecha_inicio}', '${prom.fecha_fin}')">Editar</button>` : '';
        
        return `
            <tr>
                <td style="padding: 10px; border: 1px solid #555;">#${prom.idPromociones}</td>
                <td style="padding: 10px; border: 1px solid #555;">${prom.nombre}</td>
                <td style="padding: 10px; border: 1px solid #555; color: #3498db; font-weight: bold;">-${prom.descuento}%</td>
                <td style="padding: 10px; border: 1px solid #555; font-size:13px;">${prom.fecha_inicio} a ${prom.fecha_fin}</td>
                <td style="padding: 10px; border: 1px solid #555; text-align:center;">
                    ${btnEditar}
                    ${btnEliminar}
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalEditarPromocion(id, nombre, descripcion, descuento, fInicio, fFin) {
    document.getElementById('edit_promo_id').value = id;
    document.getElementById('edit_promo_id_display').innerText = id;
    document.getElementById('edit_promo_nombre').value = nombre;
    document.getElementById('edit_promo_descripcion').value = descripcion;
    document.getElementById('edit_promo_descuento').value = descuento;
    document.getElementById('edit_promo_inicio').value = fInicio;
    document.getElementById('edit_promo_fin').value = fFin;
    document.getElementById('modalEditarPromocion').style.display = 'flex';
}

async function actualizarPromocion() {
    const id = document.getElementById('edit_promo_id').value;
    const nombre = document.getElementById('edit_promo_nombre').value;
    const descripcion = document.getElementById('edit_promo_descripcion').value;
    const descuento = document.getElementById('edit_promo_descuento').value;
    const fInicio = document.getElementById('edit_promo_inicio').value;
    const fFin = document.getElementById('edit_promo_fin').value;

    if (!nombre) return alert('Nombre requerido');
    
    const res = await fetchAPI(`/promociones/${id}`, 'PUT', { nombre, descripcion: descripcion || 'Sin descripción', descuento: parseFloat(descuento), fecha_inicio: fInicio, fecha_fin: fFin });
    if (res && res.ok) {
        alert("✅ Promoción actualizada");
        document.getElementById('modalEditarPromocion').style.display = 'none';
        cargarTablaPromociones();
    } else {
        alert("❌ Error al actualizar promoción: " + (res?.data?.error || ""));
    }
}

async function eliminarPromocion(id) {
    if (!confirm('¿Seguro que deseas eliminar esta promoción permanentemente?')) return;
    const res = await fetchAPI(`/promociones/${id}`, 'DELETE');
    if (res && res.ok) {
        alert("✅ Promoción eliminada");
        cargarTablaPromociones();
    } else {
        alert("❌ Error al eliminar promoción: " + (res?.data?.error || ""));
    }
}

// ==============================
// --- ESTILOS CRUD ---
// ==============================

async function guardarEstilo() {
    const nombre = document.getElementById("estilo_nombre")?.value;
    const descripcion = document.getElementById("estilo_descripcion")?.value;
    const precio = document.getElementById("estilo_precio")?.value;

    if (!nombre || nombre.trim() === '') return alert('El nombre es obligatorio');
    if (!precio || parseFloat(precio) <= 0) return alert('El precio es obligatorio y debe ser mayor a 0');

    const res = await fetchAPI('/estilos', 'POST', {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : 'Sin descripción',
        precio: parseFloat(precio)
    });

    if (res && res.ok) {
        alert("✅ Estilo guardado exitosamente");
        document.getElementById("estilo_nombre").value = "";
        document.getElementById("estilo_descripcion").value = "";
        document.getElementById("estilo_precio").value = "";
        cargarTablaEstilos();
    } else {
        alert("❌ Error al guardar estilo: " + (res?.data?.error || ""));
    }
}

async function cargarTablaEstilos() {
    const tbody = document.getElementById('tabla_estilos_body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">Cargando...</td></tr>`;

    const res = await fetchAPI('/estilos');
    if (!res || !res.ok) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#e74c3c; border:1px solid #555;">❌ Error al cargar los estilos</td></tr>`;
        return;
    }

    const estilos = res.data || [];
    if (estilos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#aaa; border:1px solid #555;">No hay estilos registrados</td></tr>`;
        return;
    }

    const rol = localStorage.getItem("rol");
    tbody.innerHTML = estilos.map(est => {
        const btnEliminar = rol === "Dueño" ? `<button style="background:red; padding:5px 10px; font-size:12px; margin-left:5px;" onclick="eliminarEstilo(${est.idEstilos})">Eliminar</button>` : '';
        const btnEditar = rol === "Dueño" ? `<button style="background:#3498db; padding:5px 10px; font-size:12px;" onclick="abrirModalEditarEstilo(${est.idEstilos}, '${(est.nombre || '').replace(/'/g, "\\'")}', '${(est.descripcion || '').replace(/'/g, "\\'")}', ${est.precio})">Editar</button>` : '';
        
        return `
            <tr>
                <td style="padding: 10px; border: 1px solid #555;">#${est.idEstilos}</td>
                <td style="padding: 10px; border: 1px solid #555;">${est.nombre}</td>
                <td style="padding: 10px; border: 1px solid #555;">${est.descripcion}</td>
                <td style="padding: 10px; border: 1px solid #555; color: #4caf50; font-weight: bold;">$${parseFloat(est.precio).toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #555; text-align:center;">
                    ${btnEditar}
                    ${btnEliminar}
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalEditarEstilo(id, nombre, descripcion, precio) {
    document.getElementById('edit_estilo_id').value = id;
    document.getElementById('edit_estilo_id_display').innerText = id;
    document.getElementById('edit_estilo_nombre').value = nombre;
    document.getElementById('edit_estilo_descripcion').value = descripcion;
    document.getElementById('edit_estilo_precio').value = precio;
    document.getElementById('modalEditarEstilo').style.display = 'flex';
}

async function actualizarEstilo() {
    const id = document.getElementById('edit_estilo_id').value;
    const nombre = document.getElementById('edit_estilo_nombre').value;
    const descripcion = document.getElementById('edit_estilo_descripcion').value;
    const precio = document.getElementById('edit_estilo_precio').value;

    if (!nombre) return alert('Nombre requerido');
    
    const res = await fetchAPI(`/estilos/${id}`, 'PUT', { nombre, descripcion, precio: parseFloat(precio) });
    if (res && res.ok) {
        alert("✅ Estilo actualizado");
        document.getElementById('modalEditarEstilo').style.display = 'none';
        cargarTablaEstilos();
    } else {
        alert("❌ Error al actualizar estilo: " + (res?.data?.error || ""));
    }
}

async function eliminarEstilo(id) {
    if (!confirm('¿Seguro que deseas eliminar este estilo permanentemente?')) return;
    const res = await fetchAPI(`/estilos/${id}`, 'DELETE');
    if (res && res.ok) {
        alert("✅ Estilo eliminado");
        cargarTablaEstilos();
    } else {
        alert("❌ Error al eliminar estilo: " + (res?.data?.error || ""));
    }
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
    cargarTablaPagos();
    if (typeof cargarTablaPromociones === 'function') cargarTablaPromociones();
    if (typeof cargarTablaEstilos === 'function') cargarTablaEstilos();
});
