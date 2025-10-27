/**
 * utils.js
 * Sistema unificado de utilidades para UI/UX
 * - Manejo de modales
 * - Sistema de notificaciones (Toast)
 * - Validación de formularios
 * - Accesibilidad (trap de foco)
 */

// ===== SISTEMA DE NOTIFICACIONES (TOAST) =====
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                document.body.appendChild(this.container);
            }
        }
    },

    show(message, type = 'info', duration = 5000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="toast-content">
                ${message.includes('<br>') || message.includes('<strong>')
                    ? `<div>${message}</div>`
                    : `<p>${message}</p>`
                }
            </div>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Botón de cerrar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        // Agregar al contenedor
        this.container.appendChild(toast);

        // Auto-cerrar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    },

    remove(toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    },

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
};

// Exponer globalmente
window.Toast = Toast;
window.showToast = (message, type, duration) => Toast.show(message, type, duration);


// ===== SISTEMA DE MODALES =====
const Modal = {
    openModals: [],
    lastFocusedElement: null,

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal #${modalId} no encontrado`);
            return;
        }

        // Guardar elemento con foco actual
        this.lastFocusedElement = document.activeElement;

        // Añadir clase show
        modal.classList.add('show');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        // Agregar a la pila de modales abiertos
        this.openModals.push(modal);

        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';

        // Configurar trap de foco
        this.setupFocusTrap(modal);

        // Enfocar primer elemento focusable o botón de cerrar
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close, [data-modal-close]');
            if (closeBtn) {
                closeBtn.focus();
            } else {
                const firstFocusable = this.getFocusableElements(modal)[0];
                if (firstFocusable) firstFocusable.focus();
            }
        }, 100);
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Remover clase show
        modal.classList.remove('show');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');

        // Remover de la pila
        this.openModals = this.openModals.filter(m => m !== modal);

        // Restaurar scroll si no hay más modales abiertos
        if (this.openModals.length === 0) {
            document.body.style.overflow = '';
        }

        // Restaurar foco al elemento anterior
        if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
            setTimeout(() => {
                this.lastFocusedElement.focus();
            }, 100);
        }
    },

    closeAll() {
        while (this.openModals.length > 0) {
            const modal = this.openModals[this.openModals.length - 1];
            this.close(modal.id);
        }
    },

    setupFocusTrap(modal) {
        // Obtener todos los elementos focusables
        const focusableElements = this.getFocusableElements(modal);

        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Handler para trap de foco
        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Tab + Shift
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab solo
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        // Agregar listener
        modal.addEventListener('keydown', handleKeyDown);
    },

    getFocusableElements(container) {
        const selectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(selectors));
    }
};

// Exponer globalmente
window.Modal = Modal;


// ===== VALIDACIÓN DE FORMULARIOS =====
const FormValidator = {
    // Reglas de validación
    rules: {
        required: (value) => value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^(\+57\s?)?[3][0-9]{9}$/.test(value.replace(/\s/g, '').replace('+57', '')),
        minLength: (value, min) => value.length >= min,
        maxLength: (value, max) => value.length <= max,
        number: (value) => !isNaN(value) && value.trim() !== '',
        min: (value, min) => parseFloat(value) >= min,
        max: (value, max) => parseFloat(value) <= max,
    },

    // Mensajes de error
    messages: {
        required: 'Este campo es obligatorio',
        email: 'Ingresa un email válido',
        phone: 'Ingresa un teléfono válido (Ej: +57 300 123 4567)',
        minLength: 'Mínimo {min} caracteres',
        maxLength: 'Máximo {max} caracteres',
        number: 'Debe ser un número',
        min: 'El valor mínimo es {min}',
        max: 'El valor máximo es {max}',
    },

    /**
     * Validar un campo individual
     */
    validateField(input, rules) {
        const value = input.value;
        let isValid = true;
        let errorMessage = '';

        for (const [ruleName, ruleValue] of Object.entries(rules)) {
            const validationRule = this.rules[ruleName];

            if (!validationRule) {
                console.warn(`Regla de validación "${ruleName}" no existe`);
                continue;
            }

            let result;
            if (typeof ruleValue === 'boolean' && ruleValue) {
                result = validationRule(value);
            } else {
                result = validationRule(value, ruleValue);
            }

            if (!result) {
                isValid = false;
                errorMessage = this.messages[ruleName].replace(`{${ruleName}}`, ruleValue);
                break;
            }
        }

        // Actualizar UI
        this.updateFieldUI(input, isValid, errorMessage);

        return isValid;
    },

    /**
     * Actualizar UI del campo
     */
    updateFieldUI(input, isValid, errorMessage = '') {
        // Remover clases anteriores
        input.classList.remove('is-valid', 'is-invalid');

        // Agregar nueva clase
        if (isValid) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
        }

        // Buscar o crear elemento de feedback
        let feedback = input.nextElementSibling;
        if (!feedback || (!feedback.classList.contains('invalid-feedback') && !feedback.classList.contains('valid-feedback'))) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }

        // Actualizar mensaje
        if (!isValid) {
            feedback.textContent = errorMessage;
            feedback.className = 'invalid-feedback';
        } else {
            feedback.textContent = '';
            feedback.className = 'valid-feedback';
        }
    },

    /**
     * Configurar validación en tiempo real para un formulario
     */
    setupRealtimeValidation(formElement, validationRules) {
        Object.entries(validationRules).forEach(([fieldName, rules]) => {
            const input = formElement.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (!input) {
                console.warn(`Campo "${fieldName}" no encontrado en el formulario`);
                return;
            }

            // Validar en blur (cuando pierde el foco)
            input.addEventListener('blur', () => {
                this.validateField(input, rules);
            });

            // Validar en input (mientras escribe) solo después del primer blur
            let hasBlurred = false;
            input.addEventListener('blur', () => { hasBlurred = true; }, { once: true });
            input.addEventListener('input', () => {
                if (hasBlurred) {
                    this.validateField(input, rules);
                }
            });
        });
    },

    /**
     * Validar formulario completo
     */
    validateForm(formElement, validationRules) {
        let isFormValid = true;

        Object.entries(validationRules).forEach(([fieldName, rules]) => {
            const input = formElement.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (!input) return;

            const isFieldValid = this.validateField(input, rules);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }
};

// Exponer globalmente
window.FormValidator = FormValidator;


// ===== UTILIDADES GENERALES =====

/**
 * Validar teléfono colombiano
 */
function validarTelefono(telefono) {
    const regex = /^(\+57\s?)?[3][0-9]{9}$/;
    const telefonoLimpio = telefono.replace(/\s/g, '').replace('+57', '');
    return regex.test(`+57${telefonoLimpio}`);
}

/**
 * Formatear número con separadores de miles
 */
function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

/**
 * Debounce para optimizar eventos
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Obtener ubicación del usuario
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Guardar en localStorage de forma segura
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

/**
 * Cargar desde localStorage de forma segura
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        return defaultValue;
    }
}

// Exponer utilidades globalmente
window.validarTelefono = validarTelefono;
window.formatNumber = formatNumber;
window.debounce = debounce;
window.getUserLocation = getUserLocation;
window.saveToStorage = saveToStorage;
window.loadFromStorage = loadFromStorage;


// ===== CONFIGURACIÓN GLOBAL DE EVENTOS =====
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Cerrar el último modal abierto
            if (Modal.openModals.length > 0) {
                const lastModal = Modal.openModals[Modal.openModals.length - 1];
                Modal.close(lastModal.id);
            }
        }
    });

    // Cerrar modales al hacer clic en el backdrop
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
            Modal.close(e.target.id);
        }
    });

    // Configurar todos los botones de cerrar modal
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.closest('.modal')?.id;
            if (modalId) {
                Modal.close(modalId);
            }
        });
    });

    // Configurar todos los botones que abren modales
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modalOpen;
            if (modalId) {
                Modal.open(modalId);
            }
        });
    });
});

// Log de inicialización
console.log('✓ Sistema de utilidades UI/UX cargado correctamente');
