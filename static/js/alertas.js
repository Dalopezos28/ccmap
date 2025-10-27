/**
 * alertas.js
 * Manejo del formulario de suscripción a alertas
 * Versión mejorada con validación en tiempo real y sistema unificado
 */

// Elementos del DOM
const btnAlertas = document.getElementById('btn-alertas');
const modalAlertas = document.getElementById('modal-alertas');
const btnCloseModalAlertas = document.getElementById('btn-close-modal-alertas');
const formAlertas = document.getElementById('form-alertas');
const radioInput = document.getElementById('alerta-radio');
const radioValue = document.getElementById('alerta-radio-value');

// Reglas de validación para el formulario
const validationRules = {
    'alerta-nombre': {
        required: true,
        minLength: 3
    },
    'alerta-telefono': {
        required: true,
        phone: true
    },
    'alerta-email': {
        email: true  // Opcional, pero si se llena debe ser válido
    }
};

// ===== EVENTOS =====

// Abrir modal
btnAlertas.addEventListener('click', () => {
    Modal.open('modal-alertas');
    cargarDatosGuardados();
});

// Cerrar modal
btnCloseModalAlertas.addEventListener('click', () => {
    Modal.close('modal-alertas');
});

// Actualizar valor del radio
radioInput.addEventListener('input', () => {
    radioValue.textContent = `${radioInput.value} km`;
});

// ===== FUNCIONES =====

/**
 * Cargar datos guardados en localStorage
 */
function cargarDatosGuardados() {
    const datos = loadFromStorage('alertas_preferencias');

    if (datos) {
        document.getElementById('alerta-nombre').value = datos.nombre || '';
        document.getElementById('alerta-telefono').value = datos.telefono || '';
        document.getElementById('alerta-email').value = datos.email || '';
        document.getElementById('alerta-tipo').value = datos.tipo_alerta || 'CUPOS_BAJOS';
        document.getElementById('alerta-canal').value = datos.canal_preferido || 'WHATSAPP';
        document.getElementById('alerta-barrios').value = datos.barrios_interes || '';
        document.getElementById('alerta-radio').value = datos.radio_km || 5;
        radioValue.textContent = `${datos.radio_km || 5} km`;
    }
}

/**
 * Manejar envío del formulario
 */
formAlertas.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar formulario completo
    const isValid = FormValidator.validateForm(formAlertas, validationRules);

    if (!isValid) {
        Toast.error('Por favor completa todos los campos correctamente');
        return;
    }

    // Obtener datos del formulario
    const nombre = document.getElementById('alerta-nombre').value.trim();
    const telefono = document.getElementById('alerta-telefono').value.trim();
    const email = document.getElementById('alerta-email').value.trim();
    const tipoAlerta = document.getElementById('alerta-tipo').value;
    const canal = document.getElementById('alerta-canal').value;
    const barrios = document.getElementById('alerta-barrios').value.trim();
    const radio = parseInt(document.getElementById('alerta-radio').value);

    // Obtener geolocalización si el usuario permite
    let latitud = null;
    let longitud = null;

    try {
        const location = await getUserLocation();
        latitud = location.lat;
        longitud = location.lng;
    } catch (error) {
        console.log('No se pudo obtener la ubicación:', error);
        // Continuar sin ubicación (es opcional)
    }

    // Preparar datos para enviar
    const datos = {
        nombre: nombre,
        telefono: telefono,
        email: email || null,
        tipo_alerta: tipoAlerta,
        canal_preferido: canal,
        barrios_interes: barrios,
        radio_km: radio,
        latitud_usuario: latitud,
        longitud_usuario: longitud,
        activa: true,
        verificada: false
    };

    // Mostrar indicador de carga
    const btnSubmit = formAlertas.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.classList.add('loading');
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        // Enviar a la API
        const response = await fetch('/api/alertas/', {
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

        // Guardar preferencias en localStorage
        saveToStorage('alertas_preferencias', datos);

        // Mostrar mensaje de éxito
        const canalTexto = canal === 'WHATSAPP' ? 'WhatsApp' : canal === 'SMS' ? 'SMS' : 'Email';
        Toast.success(
            `<strong>¡Suscripción exitosa!</strong><br>Recibirás alertas en tu ${canalTexto}<br><small>ID: ${resultado.id}</small>`,
            6000
        );

        // Cerrar modal y resetear formulario
        setTimeout(() => {
            Modal.close('modal-alertas');
            formAlertas.reset();
            radioValue.textContent = '5 km';

            // Limpiar estados de validación
            formAlertas.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }, 2000);

    } catch (error) {
        console.error('Error al crear suscripción:', error);
        Toast.error(`Error al crear la suscripción: ${error.message}<br>Por favor intenta nuevamente.`);
    } finally {
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('loading');
        btnSubmit.innerHTML = textoOriginal;
    }
});

// ===== CONFIGURACIÓN DE VALIDACIÓN EN TIEMPO REAL =====
document.addEventListener('DOMContentLoaded', () => {
    if (formAlertas) {
        FormValidator.setupRealtimeValidation(formAlertas, validationRules);

        // Validación especial para email (solo si tiene valor)
        const emailInput = document.getElementById('alerta-email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (emailInput.value.trim() !== '') {
                    FormValidator.validateField(emailInput, { email: true });
                } else {
                    // Si está vacío, está bien (es opcional)
                    emailInput.classList.remove('is-invalid');
                    emailInput.classList.add('is-valid');
                }
            });
        }
    }
});

console.log('✓ Sistema de alertas cargado correctamente');
