/**
 * donaciones.js
 * Manejo del formulario wizard de donaciones (3 pasos)
 * Versión mejorada con validación en tiempo real y guardado de progreso
 */

// Elementos del DOM
const btnDonaciones = document.getElementById('btn-donaciones');
const modalDonaciones = document.getElementById('modal-donaciones');
const btnCloseModalDonaciones = document.getElementById('btn-close-modal-donaciones');
const formDonaciones = document.getElementById('form-donaciones');

// Estado del wizard
let pasoActual = 1;
let datosUbicacionDonacion = {
    latitud: null,
    longitud: null
};

// Reglas de validación por paso
const validationRulesPaso1 = {
    'donacion-nombre': {
        required: true,
        minLength: 3
    },
    'donacion-telefono': {
        required: true,
        phone: true
    }
};

const validationRulesPaso2 = {
    'donacion-descripcion': {
        required: true,
        minLength: 10
    }
};

// ===== EVENTOS =====

// Abrir modal
btnDonaciones.addEventListener('click', () => {
    Modal.open('modal-donaciones');
    irAPaso(1);
    cargarProgresoGuardado();
});

// Cerrar modal
btnCloseModalDonaciones.addEventListener('click', () => {
    cerrarModalDonaciones();
});

/**
 * Cerrar modal y guardar progreso
 */
function cerrarModalDonaciones() {
    // Guardar progreso antes de cerrar
    guardarProgreso();
    Modal.close('modal-donaciones');
}

/**
 * Navegar entre pasos del wizard
 */
function siguientePaso(paso) {
    // Validar paso actual antes de avanzar
    if (paso > pasoActual) {
        if (!validarPasoActual()) {
            return;
        }
        // Guardar progreso al avanzar
        guardarProgreso();
    }

    irAPaso(paso);
}

/**
 * Ir a un paso específico
 */
function irAPaso(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.wizard-content').forEach(content => {
        content.style.display = 'none';
    });

    // Mostrar paso actual
    const pasoElement = document.getElementById(`wizard-step-${paso}`);
    if (pasoElement) {
        pasoElement.style.display = 'block';
    }

    // Actualizar indicadores de progreso
    document.querySelectorAll('.wizard-step').forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');

        if (stepNumber === paso) {
            step.classList.add('active');
        } else if (stepNumber < paso) {
            step.classList.add('completed');
        }
    });

    pasoActual = paso;
}

/**
 * Validar paso actual antes de avanzar
 */
function validarPasoActual() {
    if (pasoActual === 1) {
        const isValid = FormValidator.validateForm(formDonaciones, validationRulesPaso1);

        if (!isValid) {
            Toast.error('Por favor completa todos los campos del paso 1 correctamente');
            return false;
        }

        return true;
    }

    if (pasoActual === 2) {
        const isValid = FormValidator.validateForm(formDonaciones, validationRulesPaso2);

        if (!isValid) {
            Toast.error('Por favor describe qué deseas donar');
            return false;
        }

        return true;
    }

    return true;
}

/**
 * Obtener ubicación del donante
 */
async function obtenerUbicacionDonacion() {
    const btn = event.target.closest('button');
    const textoOriginal = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';

    try {
        const location = await getUserLocation();

        datosUbicacionDonacion.latitud = location.lat;
        datosUbicacionDonacion.longitud = location.lng;

        // Mostrar coordenadas
        const display = document.getElementById('coords-donacion-display');
        display.textContent = `✓ Ubicación obtenida: ${datosUbicacionDonacion.latitud.toFixed(6)}, ${datosUbicacionDonacion.longitud.toFixed(6)}`;
        display.style.display = 'block';

        Toast.success('Ubicación obtenida correctamente');
    } catch (error) {
        console.error('Error al obtener ubicación:', error);
        Toast.error('No se pudo obtener tu ubicación. Por favor ingresa tu barrio manualmente.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

// Exponer funciones globalmente para usar en onclick
window.obtenerUbicacionDonacion = obtenerUbicacionDonacion;
window.siguientePaso = siguientePaso;

/**
 * Guardar progreso del formulario en localStorage
 */
function guardarProgreso() {
    const progreso = {
        paso: pasoActual,
        datos: {
            nombre: document.getElementById('donacion-nombre')?.value || '',
            telefono: document.getElementById('donacion-telefono')?.value || '',
            email: document.getElementById('donacion-email')?.value || '',
            tipo: document.getElementById('donacion-tipo')?.value || 'ALIMENTOS',
            descripcion: document.getElementById('donacion-descripcion')?.value || '',
            cantidad: document.getElementById('donacion-cantidad')?.value || '',
            valor: document.getElementById('donacion-valor')?.value || '',
            direccion: document.getElementById('donacion-direccion')?.value || '',
            barrio: document.getElementById('donacion-barrio')?.value || ''
        },
        ubicacion: datosUbicacionDonacion,
        timestamp: Date.now()
    };

    saveToStorage('donacion_progreso', progreso);
}

/**
 * Cargar progreso guardado
 */
function cargarProgresoGuardado() {
    const progreso = loadFromStorage('donacion_progreso');

    if (!progreso) return;

    // Verificar que el progreso no sea muy antiguo (más de 1 hora)
    const unHora = 60 * 60 * 1000;
    if (Date.now() - progreso.timestamp > unHora) {
        localStorage.removeItem('donacion_progreso');
        return;
    }

    // Preguntar si quiere continuar
    if (confirm('Tienes una donación en progreso. ¿Deseas continuar donde lo dejaste?')) {
        // Restaurar datos
        const datos = progreso.datos;
        if (datos.nombre) document.getElementById('donacion-nombre').value = datos.nombre;
        if (datos.telefono) document.getElementById('donacion-telefono').value = datos.telefono;
        if (datos.email) document.getElementById('donacion-email').value = datos.email;
        if (datos.tipo) document.getElementById('donacion-tipo').value = datos.tipo;
        if (datos.descripcion) document.getElementById('donacion-descripcion').value = datos.descripcion;
        if (datos.cantidad) document.getElementById('donacion-cantidad').value = datos.cantidad;
        if (datos.valor) document.getElementById('donacion-valor').value = datos.valor;
        if (datos.direccion) document.getElementById('donacion-direccion').value = datos.direccion;
        if (datos.barrio) document.getElementById('donacion-barrio').value = datos.barrio;

        // Restaurar ubicación
        if (progreso.ubicacion) {
            datosUbicacionDonacion = progreso.ubicacion;
            if (datosUbicacionDonacion.latitud) {
                const display = document.getElementById('coords-donacion-display');
                display.textContent = `✓ Ubicación guardada: ${datosUbicacionDonacion.latitud.toFixed(6)}, ${datosUbicacionDonacion.longitud.toFixed(6)}`;
                display.style.display = 'block';
            }
        }

        // Ir al paso guardado
        irAPaso(progreso.paso || 1);

        Toast.info('Progreso restaurado. Puedes continuar tu donación.');
    } else {
        // Limpiar progreso guardado
        localStorage.removeItem('donacion_progreso');
    }
}

/**
 * Enviar formulario de donación
 */
formDonaciones.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar paso 3
    if (pasoActual !== 3) {
        return;
    }

    // Recopilar todos los datos del formulario
    const datos = {
        // Paso 1: Donante (requeridos)
        nombre_donante: document.getElementById('donacion-nombre').value.trim(),
        telefono_donante: document.getElementById('donacion-telefono').value.trim(),

        // Paso 2: Donación (requeridos)
        tipo_donacion: document.getElementById('donacion-tipo').value,
        descripcion: document.getElementById('donacion-descripcion').value.trim(),

        // Estados iniciales
        estado: 'PENDIENTE'
    };

    // Agregar campos opcionales solo si tienen valor
    const email = document.getElementById('donacion-email').value.trim();
    if (email) {
        datos.email_donante = email;
    }

    const cantidad = document.getElementById('donacion-cantidad').value.trim();
    if (cantidad && !isNaN(parseFloat(cantidad))) {
        datos.cantidad_estimada_kg = parseFloat(cantidad);
    }

    const valor = document.getElementById('donacion-valor').value.trim();
    if (valor && !isNaN(parseFloat(valor))) {
        datos.valor_monetario = parseFloat(valor);
    }

    const direccion = document.getElementById('donacion-direccion').value.trim();
    if (direccion) {
        datos.direccion_recoleccion = direccion;
    }

    const barrio = document.getElementById('donacion-barrio').value.trim();
    if (barrio) {
        datos.barrio_donante = barrio;
    }

    // Ubicación (opcional)
    if (datosUbicacionDonacion.latitud && datosUbicacionDonacion.longitud) {
        datos.latitud_donante = datosUbicacionDonacion.latitud;
        datos.longitud_donante = datosUbicacionDonacion.longitud;
    }

    // Mostrar indicador de carga
    const btnSubmit = formDonaciones.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.classList.add('loading');
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando donación...';

    // Log para debugging
    console.log('📤 Enviando donación:', datos);

    try {
        // Enviar a la API
        const response = await fetch('/api/donaciones/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            // Intentar obtener el error completo del backend
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Error del servidor:', errorData);

            // Construir mensaje de error detallado
            let errorMsg = `Error ${response.status}`;

            if (errorData.detail) {
                errorMsg += `: ${errorData.detail}`;
            } else if (typeof errorData === 'object') {
                // Si hay errores de campo específicos
                const errores = Object.entries(errorData)
                    .map(([campo, mensajes]) => {
                        const msgs = Array.isArray(mensajes) ? mensajes.join(', ') : mensajes;
                        return `${campo}: ${msgs}`;
                    })
                    .join('\n');
                errorMsg += `:\n${errores}`;
            } else {
                errorMsg += `: ${response.statusText}`;
            }

            throw new Error(errorMsg);
        }

        const resultado = await response.json();
        console.log('✅ Donación creada:', resultado);

        // Preparar mensaje de éxito
        let mensajeExito = `<strong>¡Donación registrada exitosamente!</strong><br>ID: ${resultado.id}`;

        // Si se asignó un comedor automáticamente, mostrarlo
        if (resultado.comedor_asignado && resultado.comedor_nombre) {
            mensajeExito += `<br><br><strong>Asignada a:</strong><br>${resultado.comedor_nombre}`;

            if (resultado.distancia_km) {
                mensajeExito += `<br><small>Distancia: ${resultado.distancia_km.toFixed(2)} km</small>`;
            }
        }

        Toast.success(mensajeExito, 8000);

        // Limpiar progreso guardado
        localStorage.removeItem('donacion_progreso');

        // Si hay comedor asignado y mapa global disponible, mostrar en el mapa
        if (resultado.comedor_asignado && typeof map !== 'undefined' && resultado.comedor_info) {
            setTimeout(() => {
                const comedor = resultado.comedor_info;
                if (comedor.latitud && comedor.longitud) {
                    map.setView([comedor.latitud, comedor.longitud], 15);
                }
            }, 2000);
        }

        // Cerrar modal y resetear
        setTimeout(() => {
            Modal.close('modal-donaciones');
            resetWizard();
        }, 3000);

    } catch (error) {
        console.error('Error al registrar donación:', error);
        Toast.error(`Error al registrar la donación: ${error.message}<br>Por favor intenta nuevamente.`);
    } finally {
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('loading');
        btnSubmit.innerHTML = textoOriginal;
    }
});

/**
 * Resetear wizard a estado inicial
 */
function resetWizard() {
    formDonaciones.reset();
    pasoActual = 1;
    datosUbicacionDonacion = {
        latitud: null,
        longitud: null
    };

    // Ocultar display de coordenadas
    const display = document.getElementById('coords-donacion-display');
    if (display) {
        display.style.display = 'none';
    }

    // Limpiar estados de validación
    formDonaciones.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });

    // Volver al paso 1
    irAPaso(1);
}

// ===== CONFIGURACIÓN DE VALIDACIÓN EN TIEMPO REAL =====
document.addEventListener('DOMContentLoaded', () => {
    if (formDonaciones) {
        // Configurar validación para paso 1
        FormValidator.setupRealtimeValidation(formDonaciones, validationRulesPaso1);

        // Configurar validación para paso 2
        FormValidator.setupRealtimeValidation(formDonaciones, validationRulesPaso2);

        // Auto-guardar progreso cada 30 segundos
        setInterval(() => {
            if (Modal.openModals.includes(modalDonaciones)) {
                guardarProgreso();
            }
        }, 30000);
    }
});

console.log('✓ Sistema de donaciones cargado correctamente');
