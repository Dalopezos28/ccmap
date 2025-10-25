/**
 * alertas.js
 * Manejo del formulario de suscripción a alertas
 */

// Elementos del DOM
const btnAlertas = document.getElementById('btn-alertas');
const modalAlertas = document.getElementById('modal-alertas');
const btnCloseModalAlertas = document.getElementById('btn-close-modal-alertas');
const formAlertas = document.getElementById('form-alertas');
const radioInput = document.getElementById('alerta-radio');
const radioValue = document.getElementById('alerta-radio-value');

// Abrir modal
btnAlertas.addEventListener('click', () => {
    modalAlertas.style.display = 'flex';
    cargarDatosGuardados();
});

// Cerrar modal
btnCloseModalAlertas.addEventListener('click', () => {
    modalAlertas.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
modalAlertas.addEventListener('click', (e) => {
    if (e.target === modalAlertas) {
        modalAlertas.style.display = 'none';
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalAlertas.style.display === 'flex') {
        modalAlertas.style.display = 'none';
    }
});

// Actualizar valor del radio
radioInput.addEventListener('input', () => {
    radioValue.textContent = `${radioInput.value} km`;
});

// Cargar datos guardados en localStorage
function cargarDatosGuardados() {
    const datosGuardados = localStorage.getItem('alertas_preferencias');
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            document.getElementById('alerta-nombre').value = datos.nombre || '';
            document.getElementById('alerta-telefono').value = datos.telefono || '';
            document.getElementById('alerta-email').value = datos.email || '';
            document.getElementById('alerta-tipo').value = datos.tipo_alerta || 'CUPOS_BAJOS';
            document.getElementById('alerta-canal').value = datos.canal_preferido || 'WHATSAPP';
            document.getElementById('alerta-barrios').value = datos.barrios_interes || '';
            document.getElementById('alerta-radio').value = datos.radio_km || 5;
            radioValue.textContent = `${datos.radio_km || 5} km`;
        } catch (error) {
            console.error('Error al cargar preferencias guardadas:', error);
        }
    }
}

// Validar formato de teléfono colombiano
function validarTelefono(telefono) {
    // Acepta formatos: +573001234567, +57 300 123 4567, 3001234567
    const regex = /^(\+57\s?)?[3][0-9]{9}$/;
    const telefonoLimpio = telefono.replace(/\s/g, '').replace('+57', '');
    return regex.test(`+57${telefonoLimpio}`);
}

// Enviar formulario
formAlertas.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener datos del formulario
    const nombre = document.getElementById('alerta-nombre').value.trim();
    const telefono = document.getElementById('alerta-telefono').value.trim();
    const email = document.getElementById('alerta-email').value.trim();
    const tipoAlerta = document.getElementById('alerta-tipo').value;
    const canal = document.getElementById('alerta-canal').value;
    const barrios = document.getElementById('alerta-barrios').value.trim();
    const radio = parseInt(document.getElementById('alerta-radio').value);

    // Validar teléfono
    if (!validarTelefono(telefono)) {
        mostrarNotificacion('Por favor ingresa un número de teléfono válido (Ej: +57 300 123 4567)', 'error');
        return;
    }

    // Obtener geolocalización si el usuario permite
    let latitud = null;
    let longitud = null;

    if (navigator.geolocation) {
        try {
            const position = await obtenerUbicacion();
            latitud = position.coords.latitude;
            longitud = position.coords.longitude;
        } catch (error) {
            console.log('No se pudo obtener la ubicación:', error);
        }
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
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const resultado = await response.json();

        // Guardar preferencias en localStorage
        localStorage.setItem('alertas_preferencias', JSON.stringify(datos));

        // Mostrar mensaje de éxito
        mostrarNotificacion(
            `¡Suscripción exitosa! 🎉<br>Recibirás alertas en tu ${canal === 'WHATSAPP' ? 'WhatsApp' : canal === 'SMS' ? 'SMS' : 'Email'}.<br><small>ID de suscripción: ${resultado.id}</small>`,
            'success'
        );

        // Cerrar modal
        setTimeout(() => {
            modalAlertas.style.display = 'none';
            formAlertas.reset();
            radioValue.textContent = '5 km';
        }, 2000);

    } catch (error) {
        console.error('Error al crear suscripción:', error);
        mostrarNotificacion(
            `Error al crear la suscripción: ${error.message}<br>Por favor intenta nuevamente.`,
            'error'
        );
    } finally {
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
});

// Función auxiliar para obtener ubicación
function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;

    // Agregar estilos inline si no existen en el CSS
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

    // Agregar al DOM
    document.body.appendChild(notificacion);

    // Remover después de 5 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 5000);
}

// Agregar animaciones CSS si no existen
if (!document.querySelector('#alertas-animations')) {
    const style = document.createElement('style');
    style.id = 'alertas-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .notificacion-contenido {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .notificacion-contenido i {
            font-size: 20px;
        }
    `;
    document.head.appendChild(style);
}
