/**
 * dashboard.js
 * Visualización de estadísticas con Chart.js
 */

// Variables globales para los gráficos
let chartEvolucion;
let chartComedores;
let chartDonaciones;

// Configuración de colores
const COLORS = {
    primary: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    purple: '#9c27b0',
    teal: '#009688',
    indigo: '#3f51b5',
};

const CHART_COLORS = [
    '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0',
    '#009688', '#3f51b5', '#e91e63', '#00bcd4', '#8bc34a'
];

/**
 * Inicializar dashboard al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    cargarMetricas();
    cargarEvolucion();
    cargarTopComedores();
    cargarDonacionesPorTipo();

    // Actualizar datos cada 5 minutos
    setInterval(() => {
        cargarMetricas();
        cargarEvolucion();
        cargarTopComedores();
        cargarDonacionesPorTipo();
    }, 300000); // 5 minutos
});

/**
 * Cargar métricas destacadas (cards superiores)
 */
async function cargarMetricas() {
    try {
        // Obtener estadísticas de métricas
        const responseMetricas = await fetch('/api/metricas/estadisticas/');
        if (!responseMetricas.ok) throw new Error('Error al cargar métricas');
        const dataMetricas = await responseMetricas.json();

        // Obtener estadísticas de donaciones
        const responseDonaciones = await fetch('/api/donaciones/estadisticas/');
        if (!responseDonaciones.ok) throw new Error('Error al cargar donaciones');
        const dataDonaciones = await responseDonaciones.json();

        // Actualizar valores en los cards
        document.getElementById('metric-comidas').textContent =
            formatNumber(dataMetricas.mes.comidas_servidas);

        document.getElementById('metric-donaciones').textContent =
            formatNumber(dataDonaciones.total_donaciones);

        document.getElementById('metric-personas').textContent =
            formatNumber(dataMetricas.hoy.usuarios_atendidos);

        document.getElementById('metric-valor').textContent =
            '$ ' + formatNumber(dataDonaciones.valor_monetario_total);

    } catch (error) {
        console.error('Error al cargar métricas:', error);
        mostrarError('Error al cargar las métricas destacadas');
    }
}

/**
 * Cargar gráfico de evolución de métricas (últimos 7 días)
 */
async function cargarEvolucion() {
    try {
        const response = await fetch('/api/metricas/ultimos-7-dias/');
        if (!response.ok) throw new Error('Error al cargar evolución');
        const data = await response.json();

        // Preparar datos para el gráfico
        const datasets = [];

        // Dataset para cada tipo de métrica
        if (data.COMIDAS_SERVIDAS) {
            datasets.push({
                label: 'Comidas Servidas',
                data: data.COMIDAS_SERVIDAS.map(d => ({ x: d.fecha, y: d.valor })),
                borderColor: COLORS.primary,
                backgroundColor: COLORS.primary + '20',
                tension: 0.4,
                fill: true
            });
        }

        if (data.CUPOS_OCUPADOS) {
            datasets.push({
                label: 'Cupos Ocupados',
                data: data.CUPOS_OCUPADOS.map(d => ({ x: d.fecha, y: d.valor })),
                borderColor: COLORS.success,
                backgroundColor: COLORS.success + '20',
                tension: 0.4,
                fill: true
            });
        }

        if (data.USUARIOS_ATENDIDOS) {
            datasets.push({
                label: 'Usuarios Atendidos',
                data: data.USUARIOS_ATENDIDOS.map(d => ({ x: d.fecha, y: d.valor })),
                borderColor: COLORS.warning,
                backgroundColor: COLORS.warning + '20',
                tension: 0.4,
                fill: true
            });
        }

        if (data.DONACIONES_RECIBIDAS) {
            datasets.push({
                label: 'Donaciones Recibidas',
                data: data.DONACIONES_RECIBIDAS.map(d => ({ x: d.fecha, y: d.valor })),
                borderColor: COLORS.purple,
                backgroundColor: COLORS.purple + '20',
                tension: 0.4,
                fill: true
            });
        }

        // Crear gráfico
        const ctx = document.getElementById('chart-evolucion').getContext('2d');

        if (chartEvolucion) {
            chartEvolucion.destroy();
        }

        chartEvolucion = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar evolución:', error);
        mostrarError('Error al cargar el gráfico de evolución');
    }
}

/**
 * Cargar gráfico de top 10 comedores
 */
async function cargarTopComedores() {
    try {
        const response = await fetch('/api/metricas/por-comedor/?tipo_metrica=COMIDAS_SERVIDAS&limite=10');
        if (!response.ok) throw new Error('Error al cargar comedores');
        const data = await response.json();

        if (!data || data.length === 0) {
            console.warn('No hay datos de comedores');
            return;
        }

        // Preparar datos
        const labels = data.map(item => item.comedor__nombre);
        const valores = data.map(item => item.total);

        // Crear gráfico
        const ctx = document.getElementById('chart-comedores').getContext('2d');

        if (chartComedores) {
            chartComedores.destroy();
        }

        chartComedores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Comidas Servidas',
                    data: valores,
                    backgroundColor: CHART_COLORS,
                    borderColor: CHART_COLORS.map(c => c),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Barras horizontales
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x.toLocaleString() + ' comidas';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Comidas Servidas'
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar top comedores:', error);
        mostrarError('Error al cargar el ranking de comedores');
    }
}

/**
 * Cargar gráfico de donaciones por tipo
 */
async function cargarDonacionesPorTipo() {
    try {
        const response = await fetch('/api/donaciones/estadisticas/');
        if (!response.ok) throw new Error('Error al cargar donaciones');
        const data = await response.json();

        if (!data.por_tipo || data.por_tipo.length === 0) {
            console.warn('No hay datos de donaciones por tipo');
            return;
        }

        // Mapeo de tipos a nombres legibles
        const tiposNombres = {
            'ALIMENTOS': 'Alimentos No Perecederos',
            'PERECEDEROS': 'Alimentos Perecederos',
            'DINERO': 'Dinero en Efectivo',
            'INSUMOS': 'Insumos de Cocina',
            'VOLUNTARIADO': 'Tiempo como Voluntario'
        };

        // Preparar datos
        const labels = data.por_tipo.map(item => tiposNombres[item.tipo_donacion] || item.tipo_donacion);
        const valores = data.por_tipo.map(item => item.total);

        // Crear gráfico
        const ctx = document.getElementById('chart-donaciones').getContext('2d');

        if (chartDonaciones) {
            chartDonaciones.destroy();
        }

        chartDonaciones = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: CHART_COLORS,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar donaciones por tipo:', error);
        mostrarError('Error al cargar el gráfico de donaciones');
    }
}

/**
 * Formatear números con separadores de miles
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('es-CO');
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (errorDiv && errorText) {
        errorText.textContent = mensaje;
        errorDiv.style.display = 'block';

        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}
