// =======================================
// COMEDORES CALI - JavaScript Principal
// Mapa Interactivo con Leaflet.js
// =======================================

// Variables globales
let map;
let markersLayer;
let userMarker;
let comedoresData = [];
let userLocation = null;
let currentFilters = {
    estado: 'todos',
    tipoComida: '',
    barrio: '',
    calificacionMin: 0,
    radio: 5
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadComedores();
    setupEventListeners();
    
    // Ocultar loader después de 1 segundo
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
});

// ===== INICIALIZAR MAPA =====
function initMap() {
    // Crear mapa centrado en Cali
    map = L.map('map', {
        center: [window.CALI_CENTER.lat, window.CALI_CENTER.lng],
        zoom: 13,
        zoomControl: true,
        maxZoom: 18,
        minZoom: 11
    });
    
    // Añadir capa de tiles con estilo claro elegante
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Inicializar capa de marcadores con clustering
    markersLayer = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let size = 'small';
            
            if (count > 10) size = 'large';
            else if (count > 5) size = 'medium';
            
            return L.divIcon({
                html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
                className: 'custom-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });
    
    map.addLayer(markersLayer);
    
    // Añadir estilo CSS para clusters
    addClusterStyles();
}

// ===== ESTILOS DE CLUSTERS =====
function addClusterStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-cluster {
            background: transparent;
            border: none;
        }
        .cluster-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            animation: pulse-cluster 2s ease-in-out infinite;
        }
        .cluster-small {
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            font-size: 14px;
        }
        .cluster-medium {
            background: linear-gradient(135deg, #ff6b35, #cc5528);
            font-size: 16px;
        }
        .cluster-large {
            background: linear-gradient(135deg, #ffb300, #f57c00);
            font-size: 18px;
        }
        @keyframes pulse-cluster {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
}

// ===== CARGAR COMEDORES DESDE API =====
async function loadComedores() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/comedores/geojson/`);
        const data = await response.json();
        
        comedoresData = data.features;
        displayComedores(comedoresData);
        updateStats();
        
        showToast('Comedores cargados correctamente', 'success');
    } catch (error) {
        console.error('Error al cargar comedores:', error);
        showToast('Error al cargar los datos', 'error');
    }
}

// ===== MOSTRAR COMEDORES EN EL MAPA =====
function displayComedores(features) {
    // Limpiar marcadores existentes
    markersLayer.clearLayers();
    
    features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        // Crear icono personalizado
        const iconClass = props.esta_abierto ? 'marker-open' : 'marker-closed';
        const icon = L.divIcon({
            html: `<div class="marker-icon ${iconClass}"><i class="fas fa-utensils"></i></div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        // Crear marcador
        const marker = L.marker([coords[1], coords[0]], { icon: icon });
        
        // Evento click
        marker.on('click', () => showComedorModal(props.id));
        
        // Añadir a la capa de marcadores
        markersLayer.addLayer(marker);
    });
    
    updateStats();
}

// ===== MOSTRAR MODAL DE COMEDOR =====
async function showComedorModal(comedorId) {
    const modal = document.getElementById('modal-comedor');
    const modalLoader = document.getElementById('modal-loader');
    const modalContentBody = document.getElementById('modal-content-body');
    
    // Mostrar modal con loader
    modal.classList.add('show');
    modalLoader.style.display = 'block';
    modalContentBody.style.display = 'none';
    
    try {
        // Cargar datos del comedor
        const response = await fetch(`${window.API_BASE_URL}/comedores/${comedorId}/`);
        const comedor = await response.json();
        
        // Llenar contenido del modal
        fillModalContent(comedor);
        
        // Ocultar loader y mostrar contenido
        modalLoader.style.display = 'none';
        modalContentBody.style.display = 'block';
    } catch (error) {
        console.error('Error al cargar comedor:', error);
        showToast('Error al cargar la información', 'error');
        closeModal();
    }
}

// ===== LLENAR CONTENIDO DEL MODAL =====
function fillModalContent(comedor) {
    // Nombre
    document.getElementById('modal-nombre').textContent = comedor.nombre;
    
    // Foto
    const modalImage = document.getElementById('modal-image');
    const modalFoto = document.getElementById('modal-foto');
    if (comedor.foto_principal) {
        modalFoto.src = comedor.foto_principal;
        modalFoto.alt = comedor.nombre;
    } else {
        modalFoto.src = 'https://via.placeholder.com/800x300/16213e/00d4ff?text=Sin+Foto';
        modalFoto.alt = 'Sin foto';
    }
    
    // Badge de estado
    const estadoBadge = document.getElementById('modal-estado-badge');
    if (comedor.esta_abierto) {
        estadoBadge.textContent = '🟢 Abierto Ahora';
        estadoBadge.className = 'modal-badge badge-open';
    } else {
        estadoBadge.textContent = '⏸️ Cerrado';
        estadoBadge.className = 'modal-badge badge-closed';
    }
    
    // Badge de precio
    const precioBadge = document.getElementById('modal-precio-badge');
    precioBadge.textContent = comedor.precio_texto;
    precioBadge.className = 'modal-badge modal-badge-precio ' + 
        (comedor.es_gratuito ? 'badge-gratis' : 'badge-subsidiado');
    
    // Badge de cupos
    const cuposBadge = document.getElementById('modal-cupos-badge');
    const estadoCupos = comedor.estado_cupos || 'disponible';
    if (estadoCupos === 'disponible') {
        cuposBadge.textContent = `✓ ${comedor.cupos_disponibles} Cupos`;
        cuposBadge.className = 'modal-badge modal-badge-cupos badge-cupos-disponible';
    } else if (estadoCupos === 'pocos') {
        cuposBadge.textContent = `⚠️ ${comedor.cupos_disponibles} Cupos`;
        cuposBadge.className = 'modal-badge modal-badge-cupos badge-cupos-pocos';
    } else {
        cuposBadge.textContent = '❌ Sin Cupos';
        cuposBadge.className = 'modal-badge modal-badge-cupos badge-cupos-lleno';
    }
    
    // Calificación
    const rating = comedor.calificacion_promedio || 0;
    const stars = '⭐'.repeat(Math.round(rating));
    document.getElementById('modal-rating').innerHTML = `${stars} <span style="color: var(--text-secondary);">(${rating}/5)</span>`;
    
    // Dirección
    document.getElementById('modal-direccion').textContent = `${comedor.direccion}${comedor.barrio ? ', ' + comedor.barrio : ''}`;
    
    // Horario
    document.getElementById('modal-horario').textContent = 
        `${comedor.horario_apertura} - ${comedor.horario_cierre} (${formatDiasAtencion(comedor.dias_atencion)})`;
    
    // Teléfono
    const detailTelefono = document.getElementById('detail-telefono');
    const modalTelefono = document.getElementById('modal-telefono');
    if (comedor.telefono || comedor.celular) {
        const telefonos = [comedor.telefono, comedor.celular].filter(t => t).join(' / ');
        modalTelefono.textContent = telefonos;
        detailTelefono.style.display = 'flex';
    } else {
        detailTelefono.style.display = 'none';
    }
    
    // Tipo de comida
    document.getElementById('modal-tipo-comida').textContent = formatTipoComida(comedor.tipo_comida);
    
    // Descripción
    const detailDescripcion = document.getElementById('detail-descripcion');
    const modalDescripcion = document.getElementById('modal-descripcion');
    if (comedor.descripcion) {
        modalDescripcion.textContent = comedor.descripcion;
        detailDescripcion.style.display = 'flex';
    } else {
        detailDescripcion.style.display = 'none';
    }
    
    // Menú del día
    const menuContainer = document.getElementById('modal-menu-container');
    const modalMenu = document.getElementById('modal-menu');
    if (comedor.menu_hoy) {
        const menu = comedor.menu_hoy;
        let menuHTML = '';
        
        if (menu.desayuno) {
            menuHTML += `
                <div class="menu-item">
                    <strong>🌅 Desayuno</strong>
                    <p>${menu.desayuno}</p>
                    ${menu.precio_desayuno ? `<div class="menu-price">$${formatNumber(menu.precio_desayuno)}</div>` : ''}
                </div>
            `;
        }
        
        if (menu.almuerzo) {
            menuHTML += `
                <div class="menu-item">
                    <strong>☀️ Almuerzo</strong>
                    <p>${menu.almuerzo}</p>
                    ${menu.precio_almuerzo ? `<div class="menu-price">$${formatNumber(menu.precio_almuerzo)}</div>` : ''}
                </div>
            `;
        }
        
        if (menu.cena) {
            menuHTML += `
                <div class="menu-item">
                    <strong>🌙 Cena</strong>
                    <p>${menu.cena}</p>
                    ${menu.precio_cena ? `<div class="menu-price">$${formatNumber(menu.precio_cena)}</div>` : ''}
                </div>
            `;
        }
        
        modalMenu.innerHTML = menuHTML;
        menuContainer.style.display = 'block';
    } else {
        menuContainer.style.display = 'none';
    }
    
    // Comentarios recientes
    const comentariosContainer = document.getElementById('modal-comentarios-container');
    const modalComentarios = document.getElementById('modal-comentarios');
    if (comedor.comentarios_recientes && comedor.comentarios_recientes.length > 0) {
        let comentariosHTML = '';
        
        comedor.comentarios_recientes.forEach(comentario => {
            const stars = '⭐'.repeat(comentario.calificacion);
            comentariosHTML += `
                <div class="comentario-item">
                    <div class="comentario-header">
                        <span class="comentario-usuario">${comentario.nombre_usuario}</span>
                        <span class="comentario-rating">${stars}</span>
                    </div>
                    <p class="comentario-text">${comentario.comentario}</p>
                </div>
            `;
        });
        
        modalComentarios.innerHTML = comentariosHTML;
        comentariosContainer.style.display = 'block';
    } else {
        comentariosContainer.style.display = 'none';
    }
    
    // Botón Llamar
    const btnLlamar = document.getElementById('btn-llamar');
    if (comedor.telefono || comedor.celular) {
        const telefonoLlamar = comedor.telefono || comedor.celular;
        btnLlamar.href = `tel:+57${comedor.telefono_limpio || telefonoLlamar}`;
        btnLlamar.style.display = 'flex';
    } else {
        btnLlamar.style.display = 'none';
    }
    
    // Botón WhatsApp
    const btnWhatsApp = document.getElementById('btn-whatsapp');
    if (comedor.whatsapp_link) {
        btnWhatsApp.href = comedor.whatsapp_link;
        btnWhatsApp.style.display = 'flex';
    } else {
        btnWhatsApp.style.display = 'none';
    }
    
    // Información de cupos
    const infoCupos = document.getElementById('info-cupos');
    if (comedor.cupos_disponibles !== undefined) {
        document.getElementById('cupos-numero').textContent = comedor.cupos_disponibles;
        
        const colaInfo = document.getElementById('cola-info');
        if (comedor.cola_estimada && comedor.cola_estimada !== 'Sin cola') {
            document.getElementById('cola-tiempo').textContent = comedor.cola_estimada;
            colaInfo.style.display = 'flex';
        } else {
            colaInfo.style.display = 'none';
        }
        
        infoCupos.style.display = 'block';
    } else {
        infoCupos.style.display = 'none';
    }
    
    // Información de transporte público
    const infoTransporte = document.getElementById('info-transporte');
    if (comedor.rutas_transporte_publico) {
        document.getElementById('transporte-rutas').textContent = comedor.rutas_transporte_publico;
        
        const paradaInfo = document.getElementById('parada-info');
        if (comedor.parada_bus_cercana) {
            document.getElementById('transporte-parada').textContent = comedor.parada_bus_cercana;
            if (comedor.distancia_parada) {
                document.getElementById('transporte-distancia').textContent = `📏 ${comedor.distancia_parada}`;
            }
            paradaInfo.style.display = 'flex';
        } else {
            paradaInfo.style.display = 'none';
        }
        
        infoTransporte.style.display = 'block';
    } else {
        infoTransporte.style.display = 'none';
    }
    
    // Servicios y accesibilidad
    const serviciosGrid = document.getElementById('servicios-grid');
    let serviciosHTML = '';
    
    const servicios = [
        { icon: 'child', text: 'Acepta niños', valor: comedor.acepta_ninos },
        { icon: 'baby-carriage', text: 'Sillas para bebés', valor: comedor.tiene_silla_bebes },
        { icon: 'box', text: 'Para llevar', valor: comedor.permite_llevar_comida },
        { icon: 'wheelchair', text: 'Accesible silla de ruedas', valor: comedor.accesible_silla_ruedas },
        { icon: 'restroom', text: 'Tiene baños', valor: comedor.tiene_banos },
        { icon: 'grip-lines', text: 'Tiene rampa', valor: comedor.tiene_rampa },
        { icon: 'gamepad', text: 'Área infantil', valor: comedor.tiene_area_infantil },
    ];
    
    servicios.forEach(servicio => {
        const clase = servicio.valor ? '' : 'disabled';
        serviciosHTML += `
            <div class="servicio-badge ${clase}">
                <i class="fas fa-${servicio.icon}"></i>
                <span>${servicio.text}</span>
            </div>
        `;
    });
    
    serviciosGrid.innerHTML = serviciosHTML;
    
    // Requisitos de acceso (agregar a detalles)
    if (comedor.requisitos_acceso && comedor.requisitos_acceso !== 'Sin requisitos especiales') {
        const detailRequisitos = `
            <div class="detail-item">
                <i class="fas fa-id-card"></i>
                <div>
                    <strong>Requisitos</strong>
                    <p>${comedor.requisitos_acceso}</p>
                </div>
            </div>
        `;
        document.querySelector('.modal-details').insertAdjacentHTML('beforeend', detailRequisitos);
    }
    
    // Botón Cómo Llegar
    const btnComoLlegar = document.getElementById('btn-como-llegar');
    btnComoLlegar.href = `https://www.google.com/maps/dir/?api=1&destination=${comedor.latitud},${comedor.longitud}`;
    
    // Botón Compartir
    document.getElementById('btn-compartir').onclick = () => compartirComedor(comedor);
}

// ===== CERRAR MODAL =====
function closeModal() {
    document.getElementById('modal-comedor').classList.remove('show');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Toggle sidebar
    document.getElementById('btn-toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleSidebar);
    
    // Mi ubicación
    document.getElementById('btn-mi-ubicacion').addEventListener('click', getUserLocation);
    
    // Botón de emergencia
    document.getElementById('btn-emergencia').addEventListener('click', modoEmergencia);
    
    // Modo simple
    document.getElementById('btn-modo-simple').addEventListener('click', mostrarModoSimple);
    
    // Cerrar modal
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-comedor').addEventListener('click', (e) => {
        if (e.target.id === 'modal-comedor') closeModal();
    });
    
    // Filtros
    document.getElementById('filter-radio').addEventListener('input', (e) => {
        document.getElementById('radio-value').textContent = `${e.target.value} km`;
        currentFilters.radio = parseInt(e.target.value);
    });
    
    document.getElementById('btn-aplicar-filtros').addEventListener('click', applyFilters);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', clearFilters);
    
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Ayuda
    document.getElementById('btn-ayuda').addEventListener('click', () => {
        document.getElementById('modal-ayuda').classList.add('show');
    });
}

// ===== TOGGLE SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        mainContent.classList.add('full');
    } else {
        mainContent.classList.remove('full');
    }
    
    // Invalidar tamaño del mapa para que se ajuste
    setTimeout(() => map.invalidateSize(), 400);
}

// ===== OBTENER UBICACIÓN DEL USUARIO =====
function getUserLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocalización no disponible', 'error');
        return;
    }
    
    showToast('Obteniendo tu ubicación...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Remover marcador anterior si existe
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            
            // Añadir marcador de usuario
            const icon = L.divIcon({
                html: '<div class="marker-icon" style="background: linear-gradient(135deg, #f44336, #c62828);"><i class="fas fa-user"></i></div>',
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: icon }).addTo(map);
            
            // Centrar mapa en ubicación del usuario
            map.setView([userLocation.lat, userLocation.lng], 14);
            
            showToast('Ubicación encontrada', 'success');
            
            // Cargar comedores cercanos
            loadComedoresCercanos();
        },
        (error) => {
            console.error('Error al obtener ubicación:', error);
            showToast('No se pudo obtener tu ubicación', 'error');
        }
    );
}

// ===== CARGAR COMEDORES CERCANOS =====
async function loadComedoresCercanos() {
    if (!userLocation) return;
    
    try {
        const response = await fetch(
            `${window.API_BASE_URL}/comedores/cercanos/?lat=${userLocation.lat}&lng=${userLocation.lng}&radio=${currentFilters.radio}`
        );
        const data = await response.json();
        
        showToast(`${data.length} comedores encontrados cerca de ti`, 'success');
    } catch (error) {
        console.error('Error al cargar comedores cercanos:', error);
    }
}

// ===== APLICAR FILTROS =====
function applyFilters() {
    currentFilters.estado = document.getElementById('filter-estado').value;
    currentFilters.tipoComida = document.getElementById('filter-tipo-comida').value;
    currentFilters.calificacionMin = parseInt(document.getElementById('filter-calificacion').value);
    
    let filteredComedores = comedoresData.filter(feature => {
        const props = feature.properties;
        
        // Filtro por estado
        if (currentFilters.estado === 'abierto' && !props.esta_abierto) return false;
        if (currentFilters.estado === 'cerrado' && props.esta_abierto) return false;
        
        // Filtro por tipo de comida
        if (currentFilters.tipoComida && props.tipo_comida !== currentFilters.tipoComida) return false;
        
        // Filtro por calificación
        if (props.calificacion_promedio < currentFilters.calificacionMin) return false;
        
        return true;
    });
    
    displayComedores(filteredComedores);
    showToast(`${filteredComedores.length} comedores encontrados`, 'info');
}

// ===== LIMPIAR FILTROS =====
function clearFilters() {
    document.getElementById('filter-estado').value = 'todos';
    document.getElementById('filter-tipo-comida').value = '';
    document.getElementById('filter-calificacion').value = '0';
    document.getElementById('filter-radio').value = '5';
    document.getElementById('radio-value').textContent = '5 km';
    document.getElementById('search-input').value = '';
    
    currentFilters = {
        estado: 'todos',
        tipoComida: '',
        barrio: '',
        calificacionMin: 0,
        radio: 5
    };
    
    displayComedores(comedoresData);
    showToast('Filtros limpiados', 'info');
}

// ===== BÚSQUEDA =====
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        displayComedores(comedoresData);
        return;
    }
    
    const filtered = comedoresData.filter(feature => {
        const props = feature.properties;
        return props.nombre.toLowerCase().includes(query) ||
               (props.barrio && props.barrio.toLowerCase().includes(query)) ||
               (props.direccion && props.direccion.toLowerCase().includes(query));
    });
    
    displayComedores(filtered);
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats() {
    const total = comedoresData.length;
    const abiertos = comedoresData.filter(f => f.properties.esta_abierto).length;
    const visibles = markersLayer.getLayers().length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-abiertos').textContent = abiertos;
    document.getElementById('stat-visibles').textContent = visibles;
}

// ===== TOGGLE FAVORITO =====
function toggleFavorito(comedorId) {
    // TODO: Implementar con autenticación
    showToast('Funcionalidad próximamente disponible', 'info');
}

// ===== COMPARTIR COMEDOR =====
function compartirComedor(comedor) {
    if (navigator.share) {
        navigator.share({
            title: comedor.nombre,
            text: `Mira este comedor comunitario: ${comedor.nombre}`,
            url: window.location.href
        }).catch(err => console.log('Error al compartir:', err));
    } else {
        // Copiar al portapapeles
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showToast('Enlace copiado al portapapeles', 'success');
    }
}

// ===== CERRAR MODAL AYUDA =====
function cerrarModalAyuda() {
    document.getElementById('modal-ayuda').classList.remove('show');
}

// Cerrar modal ayuda al hacer clic fuera
document.addEventListener('click', (e) => {
    const modalAyuda = document.getElementById('modal-ayuda');
    if (e.target === modalAyuda) {
        modalAyuda.classList.remove('show');
    }
});

// ===== UTILIDADES =====

// Mostrar notificación toast
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Debounce para búsqueda
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

// Formatear días de atención
function formatDiasAtencion(dias) {
    const map = {
        'LU-VI': 'Lunes a Viernes',
        'LU-SA': 'Lunes a Sábado',
        'LU-DO': 'Lunes a Domingo',
        'MA-SA': 'Martes a Sábado',
        'TODOS': 'Todos los días',
        'CUSTOM': 'Horario especial'
    };
    return map[dias] || dias;
}

// Formatear tipo de comida
function formatTipoComida(tipo) {
    const map = {
        'CASERA': 'Comida Casera',
        'VEGETARIANA': 'Vegetariana',
        'VEGANA': 'Vegana',
        'MIXTA': 'Mixta',
        'TIPICA': 'Típica Colombiana',
        'INTERNACIONAL': 'Internacional'
    };
    return map[tipo] || tipo;
}

// Formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

// ===== MODO EMERGENCIA =====
function modoEmergencia() {
    showToast('Buscando comedores disponibles AHORA...', 'info');
    
    // Filtrar solo comedores:
    // 1. Abiertos ahora
    // 2. Con cupos disponibles
    // 3. Ordenados por distancia (si hay ubicación) o por cupos
    
    const disponibles = comedoresData.filter(feature => {
        const props = feature.properties;
        return props.esta_abierto && 
               props.estado_cupos !== 'lleno' &&
               props.cupos_disponibles > 0;
    });
    
    if (disponibles.length === 0) {
        showToast('No hay comedores con cupos disponibles en este momento', 'error');
        return;
    }
    
    // Ordenar por cupos disponibles (más cupos primero)
    disponibles.sort((a, b) => {
        return b.properties.cupos_disponibles - a.properties.cupos_disponibles;
    });
    
    // Mostrar solo estos en el mapa
    displayComedores(disponibles);
    
    // Si hay ubicación del usuario, centrar en el más cercano
    if (userLocation && disponibles.length > 0) {
        const masCercano = disponibles[0];
        const coords = masCercano.geometry.coordinates;
        map.setView([coords[1], coords[0]], 15);
    }
    
    showToast(`${disponibles.length} comedor(es) con cupos disponibles AHORA`, 'success');
}

// ===== MODO SIMPLE =====
function mostrarModoSimple() {
    const modal = document.getElementById('modal-simple');
    const listaSimple = document.getElementById('lista-simple');
    
    // Obtener comedores abiertos con cupos
    const disponibles = comedoresData.filter(feature => {
        const props = feature.properties;
        return props.esta_abierto && props.cupos_disponibles > 0;
    }).slice(0, 10); // Solo primeros 10
    
    if (disponibles.length === 0) {
        listaSimple.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning-color);"></i>
                <p style="margin-top: 20px; font-size: 18px;">No hay comedores disponibles en este momento</p>
            </div>
        `;
        modal.classList.add('show');
        return;
    }
    
    // Generar HTML para cada comedor
    let html = '';
    disponibles.forEach(feature => {
        const c = feature.properties;
        const coords = feature.geometry.coordinates;
        
        html += `
            <div class="comedor-simple-card">
                <div class="simple-header">
                    <div>
                        <div class="simple-nombre">${c.nombre}</div>
                        <div style="color: var(--text-secondary);">${c.barrio}</div>
                    </div>
                    <div class="simple-precio">${c.precio_texto}</div>
                </div>
                
                <div class="simple-info">
                    <div class="simple-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${c.direccion}</span>
                    </div>
                    <div class="simple-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Abierto hasta las ${c.horario_cierre}</span>
                    </div>
                    <div class="simple-info-item">
                        <i class="fas fa-users"></i>
                        <span style="color: var(--success-color); font-weight: 700;">
                            ${c.cupos_disponibles} cupos disponibles
                        </span>
                    </div>
                    ${c.rutas_transporte_publico ? `
                        <div class="simple-info-item">
                            <i class="fas fa-bus"></i>
                            <span>${c.rutas_transporte_publico}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="simple-actions">
                    <a href="tel:+57${c.telefono_limpio || c.telefono}" class="btn btn-call">
                        <i class="fas fa-phone"></i> LLAMAR
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}" 
                       target="_blank" class="btn btn-primary">
                        <i class="fas fa-directions"></i> IR
                    </a>
                </div>
            </div>
        `;
    });
    
    listaSimple.innerHTML = html;
    modal.classList.add('show');
}

function cerrarModoSimple() {
    document.getElementById('modal-simple').classList.remove('show');
}

// Cerrar modo simple al hacer clic fuera
document.addEventListener('click', (e) => {
    const modalSimple = document.getElementById('modal-simple');
    if (e.target === modalSimple) {
        modalSimple.classList.remove('show');
    }
});

