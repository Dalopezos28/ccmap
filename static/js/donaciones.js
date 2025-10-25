/**
 * donaciones.js
 * Manejo del formulario wizard de donaciones (3 pasos)
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

// Abrir modal
btnDonaciones.addEventListener('click', () => {
    modalDonaciones.style.display = 'flex';
    irAPaso(1);
});

// Cerrar modal
btnCloseModalDonaciones.addEventListener('click', () => {
    modalDonaciones.style.display = 'none';
    resetWizard();
});

// Cerrar modal al hacer clic fuera
modalDonaciones.addEventListener('click', (e) => {
    if (e.target === modalDonaciones) {
        modalDonaciones.style.display = 'none';
        resetWizard();
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalDonaciones.style.display === 'flex') {
        modalDonaciones.style.display = 'none';
        resetWizard();
    }
});

/**
 * Navegar entre pasos del wizard
 */
function siguientePaso(paso) {
    // Validar paso actual antes de avanzar
    if (paso > pasoActual) {
        if (!validarPasoActual()) {
            return;
        }
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
        // Validar datos del donante
        const nombre = document.getElementById('donacion-nombre').value.trim();
        const telefono = document.getElementById('donacion-telefono').value.trim();

        if (!nombre) {
            mostrarNotificacion('Por favor ingresa tu nombre o el de tu organización', 'error');
            return false;
        }

        if (!telefono) {
            mostrarNotificacion('Por favor ingresa un teléfono de contacto', 'error');
            return false;
        }

        if (!validarTelefono(telefono)) {
            mostrarNotificacion('Por favor ingresa un número de teléfono válido (Ej: +57 300 123 4567)', 'error');
            return false;
        }

        return true;
    }

    if (pasoActual === 2) {
        // Validar detalles de la donación
        const descripcion = document.getElementById('donacion-descripcion').value.trim();

        if (!descripcion) {
            mostrarNotificacion('Por favor describe qué deseas donar', 'error');
            return false;
        }

        return true;
    }

    return true;
}

/**
 * Obtener ubicación del donante
 */
function obtenerUbicacionDonacion() {
    if (!navigator.geolocation) {
        mostrarNotificacion('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    // Mostrar indicador de carga
    const btn = event.target.closest('button');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            datosUbicacionDonacion.latitud = position.coords.latitude;
            datosUbicacionDonacion.longitud = position.coords.longitude;

            // Mostrar coordenadas
            const display = document.getElementById('coords-donacion-display');
            display.textContent = `✓ Ubicación obtenida: ${datosUbicacionDonacion.latitud.toFixed(6)}, ${datosUbicacionDonacion.longitud.toFixed(6)}`;
            display.style.display = 'block';

            mostrarNotificacion('Ubicación obtenida correctamente', 'success');

            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        },
        (error) => {
            console.error('Error al obtener ubicación:', error);
            mostrarNotificacion('No se pudo obtener tu ubicación. Por favor ingresa tu barrio manualmente.', 'error');

            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Exponer función globalmente para usar en onclick
window.obtenerUbicacionDonacion = obtenerUbicacionDonacion;
window.siguientePaso = siguientePaso;

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
        // Paso 1: Donante
        nombre_donante: document.getElementById('donacion-nombre').value.trim(),
        telefono_donante: document.getElementById('donacion-telefono').value.trim(),
        email_donante: document.getElementById('donacion-email').value.trim() || null,

        // Paso 2: Donación
        tipo_donacion: document.getElementById('donacion-tipo').value,
        descripcion: document.getElementById('donacion-descripcion').value.trim(),
        cantidad_estimada_kg: parseFloat(document.getElementById('donacion-cantidad').value) || null,
        valor_monetario: parseFloat(document.getElementById('donacion-valor').value) || null,

        // Paso 3: Ubicación
        direccion_recoleccion: document.getElementById('donacion-direccion').value.trim() || null,
        barrio_donante: document.getElementById('donacion-barrio').value.trim() || 'No especificado',
        latitud_donante: datosUbicacionDonacion.latitud,
        longitud_donante: datosUbicacionDonacion.longitud,

        // Estados iniciales
        estado: 'PENDIENTE'
    };

    // Mostrar indicador de carga
    const btnSubmit = formDonaciones.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando donación...';

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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const resultado = await response.json();

        // Preparar mensaje de éxito
        let mensajeExito = `¡Donación registrada exitosamente! 🎉<br>ID: ${resultado.id}`;

        // Si se asignó un comedor automáticamente, mostrarlo
        if (resultado.comedor_asignado && resultado.comedor_nombre) {
            mensajeExito += `<br><br><strong>Tu donación fue asignada a:</strong><br>${resultado.comedor_nombre}`;

            if (resultado.distancia_km) {
                mensajeExito += `<br><small>Distancia: ${resultado.distancia_km.toFixed(2)} km</small>`;
            }
        }

        mostrarNotificacion(mensajeExito, 'success');

        // Si hay comedor asignado y mapa global disponible, mostrar en el mapa
        if (resultado.comedor_asignado && typeof map !== 'undefined' && resultado.comedor_info) {
            setTimeout(() => {
                const comedor = resultado.comedor_info;
                if (comedor.latitud && comedor.longitud) {
                    map.setView([comedor.latitud, comedor.longitud], 15);
                    // TODO: Abrir popup del comedor si existe
                }
            }, 2000);
        }

        // Cerrar modal y resetear
        setTimeout(() => {
            modalDonaciones.style.display = 'none';
            resetWizard();
        }, 3000);

    } catch (error) {
        console.error('Error al registrar donación:', error);
        mostrarNotificacion(
            `Error al registrar la donación: ${error.message}<br>Por favor intenta nuevamente.`,
            'error'
        );
    } finally {
        // Restaurar botón
        btnSubmit.disabled = false;
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

    // Volver al paso 1
    irAPaso(1);
}

/**
 * Validar formato de teléfono colombiano
 */
function validarTelefono(telefono) {
    const regex = /^(\+57\s?)?[3][0-9]{9}$/;
    const telefonoLimpio = telefono.replace(/\s/g, '').replace('+57', '');
    return regex.test(`+57${telefonoLimpio}`);
}

/**
 * Mostrar notificaciones (reutilizado de alertas.js con mejoras)
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;

    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#4caf50' : tipo === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 5000);
}

// Agregar estilos para el wizard si no existen
if (!document.querySelector('#wizard-styles')) {
    const style = document.createElement('style');
    style.id = 'wizard-styles';
    style.textContent = `
        .wizard-progress {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            position: relative;
        }

        .wizard-progress::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 25%;
            right: 25%;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }

        .wizard-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;
            z-index: 1;
        }

        .wizard-step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #757575;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-bottom: 8px;
            transition: all 0.3s ease;
        }

        .wizard-step.active .wizard-step-number {
            background: var(--primary-color, #2196f3);
            color: white;
            box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2);
        }

        .wizard-step.completed .wizard-step-number {
            background: var(--success-color, #4caf50);
            color: white;
        }

        .wizard-step.completed .wizard-step-number::before {
            content: '\\f00c';
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
        }

        .wizard-step span {
            font-size: 14px;
            color: #757575;
            font-weight: 500;
        }

        .wizard-step.active span {
            color: var(--primary-color, #2196f3);
            font-weight: 700;
        }

        .wizard-step.completed span {
            color: var(--success-color, #4caf50);
        }

        .wizard-content {
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--primary-color, #2196f3);
            color: var(--primary-color, #2196f3);
        }

        .btn-outline:hover {
            background: var(--primary-color, #2196f3);
            color: white;
        }
    `;
    document.head.appendChild(style);
}
