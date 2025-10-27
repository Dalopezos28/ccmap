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
    // Ya no necesitamos initModals, el sistema de utils.js maneja los modales

    try {
        // Cargar preferencias de accesibilidad
        loadAccessibilityPreferences();

        updateLoaderProgress(20, 'Inicializando mapa...');
        initMap();

        updateLoaderProgress(40, 'Cargando comedores cercanos...');
        loadComedores();

        setupEventListeners();
        
        // Timeout de seguridad: si después de 10 segundos no se ha ocultado el loader, forzar ocultarlo
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader && !loader.classList.contains('hidden')) {
                console.warn('Timeout: Forzando cierre del loader después de 10 segundos');
                loader.classList.add('hidden');
                Toast.error('⚠️ Error al cargar algunos datos. Por favor, recarga la página.');
            }
        }, 10000);
    } catch (error) {
        console.error('Error en la inicialización:', error);
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
    }
});

// ===== CARGAR PREFERENCIAS DE ACCESIBILIDAD =====
function loadAccessibilityPreferences() {
    // Alto contraste
    const highContrast = localStorage.getItem('high_contrast') === 'true';
    if (highContrast) {
        document.body.classList.add('high-contrast');
    }
}

// ===== INICIALIZAR MAPA =====
function initMap() {
    // Crear mapa centrado en Cali con configuración mejorada
    map = L.map('map', {
        center: [window.CALI_CENTER.lat, window.CALI_CENTER.lng],
        zoom: 13,
        zoomControl: false, // Lo añadiremos personalizado
        maxZoom: 19,
        minZoom: 2, // Permite ver todo el planeta
        worldCopyJump: true, // Mejora navegación mundial
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    });

    // ===== ESTILOS DE MAPA DISPONIBLES =====

    // 1. Stamen Toner Lite (Elegante, minimalista, perfecto para marcadores)
    const stamenTonerLite = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        maxZoom: 20,
        minZoom: 2
    });

    // 2. CARTO Voyager (Moderno, colorido, excelente UX)
    const cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 2
    });

    // 3. OpenStreetMap Standard (Clásico, detallado)
    const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 2
    });

    // 4. CARTO Dark Matter (Modo oscuro elegante)
    const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 2
    });

    // 5. Stamen Watercolor (Artístico, único) - BONUS
    const stamenWatercolor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        maxZoom: 16,
        minZoom: 2
    });

    // Añadir capa por defecto (Voyager - el más elegante)
    cartoVoyager.addTo(map);

    // ===== CONTROL DE CAPAS (Selector de estilos) =====
    const baseMaps = {
        "🎨 Voyager (Recomendado)": cartoVoyager,
        "📍 Toner Lite (Minimalista)": stamenTonerLite,
        "🗺️ OpenStreetMap": osmStandard,
        "🌙 Modo Oscuro": cartoDark,
        "🎭 Acuarela (Artístico)": stamenWatercolor
    };

    // Añadir control de capas en la esquina superior derecha
    L.control.layers(baseMaps, null, {
        position: 'topright',
        collapsed: true
    }).addTo(map);

    // ===== CONTROL DE ZOOM PERSONALIZADO =====
    L.control.zoom({
        position: 'bottomright',
        zoomInTitle: 'Acercar',
        zoomOutTitle: 'Alejar'
    }).addTo(map);

    // ===== ESCALA DEL MAPA =====
    L.control.scale({
        position: 'bottomleft',
        imperial: false,
        metric: true
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
    

}

// ===== CARGAR COMEDORES DESDE API =====
async function loadComedores() {
    try {
        const apiUrl = `${window.API_BASE_URL}/comedores/geojson/`;
        
        updateLoaderProgress(60, 'Descargando datos...');
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Guardar en localStorage para fallback offline
        localStorage.setItem('comedores_cache', JSON.stringify(data.features));
        localStorage.setItem('comedores_cache_timestamp', Date.now());

        updateLoaderProgress(80, 'Procesando comedores...');
        comedoresData = data.features;
        displayComedores(comedoresData);
        updateStats();

        updateLoaderProgress(100, '¡Listo!');
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 500);

        Toast.success(`${comedoresData.length} comedores cargados correctamente`);
    } catch (error) {
        console.error('Error al cargar comedores:', error);

        // Intentar cargar desde cache
        const cachedData = localStorage.getItem('comedores_cache');

        if (cachedData) {
            try {
                const timestamp = localStorage.getItem('comedores_cache_timestamp');
                const hoursAgo = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));

                updateLoaderProgress(80, 'Cargando datos guardados...');
                comedoresData = JSON.parse(cachedData);
                displayComedores(comedoresData);
                updateStats();

                updateLoaderProgress(100, 'Datos cargados desde caché');
                setTimeout(() => {
                    if (document.getElementById('loader')) {
                        document.getElementById('loader').classList.add('hidden');
                    }
                }, 500);

                Toast.info(`Modo offline: Datos de hace ${hoursAgo} horas`);
                return;
            } catch (cacheError) {
                console.error('Error al cargar desde cache:', cacheError);
                // Continuar al fallback
            }
        }
        
        // Si no hay cache o falla, cargar datos estáticos de emergencia
        loadFallbackData();
    }
}

// ===== DATOS ESTÁTICOS DE EMERGENCIA =====
function loadFallbackData() {
    updateLoaderProgress(60, 'Sin conexión. Cargando datos básicos...');

    // Datos mínimos de comedores clave de Cali
    const fallbackComedores = [
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-76.5320, 3.4516] },
            properties: {
                id: 1,
                nombre: "Comedor Comunal San Bosco",
                direccion: "Calle 5 #36-00",
                barrio: "San Bosco",
                telefono: "3001234567",
                esta_abierto: true,
                cupos_disponibles: 50,
                horario_apertura: "07:00",
                horario_cierre: "14:00",
                tipo_comida: "CASERA",
                es_gratuito: true,
                precio_texto: "GRATIS",
                calificacion_promedio: 4.5,
                estado_cupos: "disponible"
            }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-76.5425, 3.4370] },
            properties: {
                id: 2,
                nombre: "Fundación Amor y Vida",
                direccion: "Carrera 10 #25-30",
                barrio: "Alfonso López",
                telefono: "3107654321",
                esta_abierto: true,
                cupos_disponibles: 30,
                horario_apertura: "06:00",
                horario_cierre: "15:00",
                tipo_comida: "MIXTA",
                es_gratuito: false,
                precio_texto: "$2.000",
                calificacion_promedio: 4.0,
                estado_cupos: "pocos"
            }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-76.5280, 3.4650] },
            properties: {
                id: 3,
                nombre: "Comedor Popular Siloé",
                direccion: "Calle 8A #52-15",
                barrio: "Siloé",
                telefono: "3159876543",
                esta_abierto: false,
                cupos_disponibles: 0,
                horario_apertura: "11:00",
                horario_cierre: "16:00",
                tipo_comida: "TIPICA",
                es_gratuito: true,
                precio_texto: "GRATIS",
                calificacion_promedio: 4.8,
                estado_cupos: "lleno"
            }
        }
    ];

    comedoresData = fallbackComedores;
    displayComedores(comedoresData);
    updateStats();

    updateLoaderProgress(100, 'Datos de emergencia cargados');
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 500);

    Toast.error('⚠️ Sin conexión: Mostrando comedores básicos');
}

// ===== MOSTRAR COMEDORES EN EL MAPA =====
function displayComedores(features) {
    try {
        // Limpiar marcadores existentes
        markersLayer.clearLayers();
        
        // Si no hay features, mostrar error
        if (!features || features.length === 0) {
            Toast.error('No se encontraron comedores');
            // Aún así, ocultar el loader
            setTimeout(() => {
                if (document.getElementById('loader')) {
                    document.getElementById('loader').classList.add('hidden');
                }
            }, 500);
            return;
        }
        
        features.forEach(feature => {
            try {
                const props = feature.properties;
                const coords = feature.geometry.coordinates;
                
                // Validar coordenadas
                if (!coords || coords.length !== 2) {
                    console.error('Coordenadas inválidas:', feature);
                    return;
                }
                
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
            } catch (error) {
                console.error('Error al procesar feature:', error, feature);
            }
        });
        
        updateStats();
    } catch (error) {
        console.error('Error en displayComedores:', error);
        Toast.error('Error al mostrar comedores');
        // Forzar ocultar el loader
        setTimeout(() => {
            if (document.getElementById('loader')) {
                document.getElementById('loader').classList.add('hidden');
            }
        }, 500);
    }
}

// ===== MOSTRAR MODAL DE COMEDOR =====
async function showComedorModal(comedorId) {
    const modal = document.getElementById('modal-comedor');
    const modalLoader = document.getElementById('modal-loader');
    const modalContentBody = document.getElementById('modal-content-body');

    // Abrir modal con el sistema unificado
    Modal.open('modal-comedor');

    // Mostrar loader
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
        Toast.error('Error al cargar la información');
        Modal.close('modal-comedor');
    }
}

// ===== LLENAR CONTENIDO DEL MODAL =====
function fillModalContent(comedor) {
    // Nombre
    document.getElementById('modal-nombre').textContent = comedor.nombre;

    // Foto (opcional - solo si existe en el HTML)
    const modalImage = document.getElementById('modal-image');
    const modalFoto = document.getElementById('modal-foto');
    if (modalFoto) {
        if (comedor.foto_principal) {
            modalFoto.src = comedor.foto_principal;
            modalFoto.alt = comedor.nombre;
        } else {
            modalFoto.src = 'https://via.placeholder.com/800x300/16213e/00d4ff?text=Sin+Foto';
            modalFoto.alt = 'Sin foto';
        }
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
    
    // Teléfono (opcional)
    const detailTelefono = document.getElementById('detail-telefono');
    const modalTelefono = document.getElementById('modal-telefono');
    if (modalTelefono && detailTelefono) {
        if (comedor.telefono || comedor.celular) {
            const telefonos = [comedor.telefono, comedor.celular].filter(t => t).join(' / ');
            modalTelefono.textContent = telefonos;
            detailTelefono.style.display = 'flex';
        } else {
            detailTelefono.style.display = 'none';
        }
    }

    // Tipo de comida (opcional)
    const modalTipoComida = document.getElementById('modal-tipo-comida');
    if (modalTipoComida) {
        modalTipoComida.textContent = formatTipoComida(comedor.tipo_comida);
    }
    
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
    
    // Información de cupos (opcional)
    const infoCupos = document.getElementById('info-cupos');
    if (infoCupos && comedor.cupos_disponibles !== undefined) {
        const cuposNumero = document.getElementById('cupos-numero');
        if (cuposNumero) {
            cuposNumero.textContent = comedor.cupos_disponibles;
        }

        const colaInfo = document.getElementById('cola-info');
        if (colaInfo && comedor.cola_estimada && comedor.cola_estimada !== 'Sin cola') {
            const colaTiempo = document.getElementById('cola-tiempo');
            if (colaTiempo) {
                colaTiempo.textContent = comedor.cola_estimada;
            }
            colaInfo.style.display = 'flex';
        } else if (colaInfo) {
            colaInfo.style.display = 'none';
        }

        infoCupos.style.display = 'block';
    } else if (infoCupos) {
        infoCupos.style.display = 'none';
    }

    // Información de transporte público (opcional)
    const infoTransporte = document.getElementById('info-transporte');
    if (infoTransporte && comedor.rutas_transporte_publico) {
        const transporteRutas = document.getElementById('transporte-rutas');
        if (transporteRutas) {
            transporteRutas.textContent = comedor.rutas_transporte_publico;
        }

        const paradaInfo = document.getElementById('parada-info');
        if (paradaInfo && comedor.parada_bus_cercana) {
            const transporteParada = document.getElementById('transporte-parada');
            if (transporteParada) {
                transporteParada.textContent = comedor.parada_bus_cercana;
            }
            if (comedor.distancia_parada) {
                const transporteDistancia = document.getElementById('transporte-distancia');
                if (transporteDistancia) {
                    transporteDistancia.textContent = `📏 ${comedor.distancia_parada}`;
                }
            }
            paradaInfo.style.display = 'flex';
        } else if (paradaInfo) {
            paradaInfo.style.display = 'none';
        }

        infoTransporte.style.display = 'block';
    } else if (infoTransporte) {
        infoTransporte.style.display = 'none';
    }
    
    // Servicios y accesibilidad (opcional)
    const serviciosGrid = document.getElementById('servicios-grid');
    if (serviciosGrid) {
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
    }
    
    // Requisitos de acceso (agregar a detalles - opcional)
    if (comedor.requisitos_acceso && comedor.requisitos_acceso !== 'Sin requisitos especiales') {
        const modalDetails = document.querySelector('.modal-details');
        if (modalDetails) {
            const detailRequisitos = `
                <div class="detail-item">
                    <i class="fas fa-id-card"></i>
                    <div>
                        <strong>Requisitos</strong>
                        <p>${comedor.requisitos_acceso}</p>
                    </div>
                </div>
            `;
            modalDetails.insertAdjacentHTML('beforeend', detailRequisitos);
        }
    }

    // Botón Cómo Llegar
    const btnComoLlegar = document.getElementById('btn-como-llegar');
    if (btnComoLlegar) {
        btnComoLlegar.href = `https://www.google.com/maps/dir/?api=1&destination=${comedor.latitud},${comedor.longitud}`;
    }

    // Botón Compartir
    const btnCompartir = document.getElementById('btn-compartir');
    if (btnCompartir) {
        btnCompartir.onclick = () => compartirComedor(comedor);
    }
}

// ===== CERRAR MODAL =====
// Función deprecada - ahora usa Modal.close('modal-comedor')
function closeModal() {
    Modal.close('modal-comedor');
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
    
    // Cerrar modal (ya manejado por el sistema unificado en utils.js)
    document.getElementById('btn-close-modal').addEventListener('click', () => Modal.close('modal-comedor'));
    
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
        Modal.open('modal-ayuda');
    });

    // Alto contraste
    document.getElementById('btn-alto-contraste').addEventListener('click', toggleAltoContraste);

    // Navegación por teclado
    setupKeyboardNavigation();
}

// ===== TOGGLE ALTO CONTRASTE =====
function toggleAltoContraste() {
    document.body.classList.toggle('high-contrast');

    const isActive = document.body.classList.contains('high-contrast');

    // Guardar preferencia en localStorage
    localStorage.setItem('high_contrast', isActive);

    const message = isActive ? 'Modo alto contraste activado' : 'Modo normal activado';
    Toast.info(message);
}

// ===== NAVEGACIÓN POR TECLADO =====
function setupKeyboardNavigation() {
    // Escape cierra modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Cerrar modal de comedor
            const modalComedor = document.getElementById('modal-comedor');
            if (modalComedor.classList.contains('show')) {
                closeModal();
                e.preventDefault();
            }

            // Cerrar modal de ayuda
            const modalAyuda = document.getElementById('modal-ayuda');
            if (modalAyuda.classList.contains('show')) {
                cerrarModalAyuda();
                e.preventDefault();
            }

            // Cerrar modal simple
            const modalSimple = document.getElementById('modal-simple');
            if (modalSimple.classList.contains('show')) {
                cerrarModoSimple();
                e.preventDefault();
            }

            // Cerrar sidebar si está abierto
            const sidebar = document.getElementById('sidebar');
            if (!sidebar.classList.contains('collapsed')) {
                toggleSidebar();
                e.preventDefault();
            }
        }

        // Ctrl/Cmd + F enfoca búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');

            // Abrir sidebar si está cerrado
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('collapsed')) {
                toggleSidebar();
            }

            searchInput.focus();
        }

        // Ctrl/Cmd + H abre ayuda
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            document.getElementById('modal-ayuda').classList.add('show');
        }

        // Ctrl/Cmd + K activa alto contraste
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleAltoContraste();
        }
    });

    // Mejorar accesibilidad del toggle sidebar
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    btnToggleSidebar.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const isExpanded = !sidebar.classList.contains('collapsed');
        btnToggleSidebar.setAttribute('aria-expanded', isExpanded);
    });
}

// ===== TOGGLE SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
    
    // Invalidar tamaño del mapa para que se ajuste
    setTimeout(() => map.invalidateSize(), 300); // 300ms es la duración de la transición
}

// ===== OBTENER UBICACIÓN DEL USUARIO =====
function getUserLocation() {
    if (!navigator.geolocation) {
        Toast.error('Geolocalización no disponible');
        return;
    }
    
    Toast.info('Obteniendo tu ubicación...');
    
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
            
            Toast.success('Ubicación encontrada');
            
            // Cargar comedores cercanos
            loadComedoresCercanos();
        },
        (error) => {
            console.error('Error al obtener ubicación:', error);
            Toast.error('No se pudo obtener tu ubicación');
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
        
        Toast.success(`${data.length} comedores encontrados cerca de ti`);
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
    Toast.info(`${filteredComedores.length} comedores encontrados`);
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
    Toast.info('Filtros limpiados');
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
    Toast.info('Funcionalidad próximamente disponible');
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
        Toast.success('Enlace copiado al portapapeles');
    }
}

// ===== MODAL AYUDA =====
function cerrarModalAyuda() {
    Modal.close('modal-ayuda');
}

// Exponer globalmente para onclick en HTML
window.cerrarModalAyuda = cerrarModalAyuda;

// ===== UTILIDADES =====

// Actualizar progreso del loader
function updateLoaderProgress(percentage, message) {
    const progressBar = document.getElementById('loader-progress-bar');
    const loaderMessage = document.getElementById('loader-message');

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }

    if (loaderMessage && message) {
        loaderMessage.textContent = message;
    }
}

// Funciones de utilidad (showToast y debounce) ahora están en utils.js

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

// formatNumber ahora está en utils.js

// ===== MODO EMERGENCIA =====
function modoEmergencia() {
    Toast.info('Buscando comedores disponibles AHORA...');
    
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
        Toast.error('No hay comedores con cupos disponibles en este momento');
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
    
    Toast.success(`${disponibles.length} comedor(es) con cupos disponibles AHORA`);
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
        Modal.open('modal-simple');
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
    Modal.open('modal-simple');
}

function cerrarModoSimple() {
    Modal.close('modal-simple');
}

// Exponer globalmente para onclick en HTML
window.cerrarModoSimple = cerrarModoSimple;

