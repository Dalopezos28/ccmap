// Variables globales
let simulation;
let svg, g;
let nodes = [], links = [];
let nodeElements, linkElements, labelElements;
let zoom;
let currentTransform = d3.zoomIdentity;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    initGraph();
    loadData();
});

function initGraph() {
    const container = document.getElementById('network-graph');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Crear SVG
    svg = d3.select('#network-graph')
        .attr('width', width)
        .attr('height', height);

    // Grupo para transformaciones
    g = svg.append('g');

    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
            currentTransform = event.transform;
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Simulation
    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.size + 5));
}

async function loadData() {
    try {
        const response = await fetch('/api/comedores/network_graph/');
        const data = await response.json();

        nodes = data.nodes;
        links = data.links;

        // Actualizar estadísticas
        updateStats(data.stats);

        // Actualizar leyendas
        updateLegends(data.leyenda);

        // Renderizar grafo
        renderGraph();

        // Ocultar loading
        document.getElementById('loading').style.display = 'none';

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div>❌ Error al cargar datos</div>
            <div style="font-size: 14px; margin-top: 10px;">Por favor, recarga la página</div>
        `;
    }
}

function updateStats(stats) {
    const statCards = document.querySelectorAll('.stat-value');
    statCards[0].textContent = stats.total_barrios;
    statCards[1].textContent = stats.total_comedores_activos;
    statCards[2].textContent = stats.total_cupos_sistema.toLocaleString();
    statCards[3].textContent = stats.promedio_comedores_por_barrio;
}

function updateLegends(leyenda) {
    // Categorías
    const categoriasContainer = document.getElementById('legend-categorias');
    leyenda.categorias.forEach(cat => {
        categoriasContainer.innerHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background: ${cat.color}"></div>
                <div class="legend-text">
                    <div class="legend-name">${cat.nombre}</div>
                    <div class="legend-range">${cat.rango}</div>
                </div>
            </div>
        `;
    });

    // Tipos de comida
    const tiposContainer = document.getElementById('legend-tipos');
    leyenda.tipos_comida.forEach(tipo => {
        tiposContainer.innerHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background: ${tipo.color}"></div>
                <div class="legend-text">
                    <div class="legend-name">${tipo.nombre}</div>
                </div>
            </div>
        `;
    });
}

function renderGraph() {
    // Links
    linkElements = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', d => Math.max(1, d.value * 3));

    // Nodes
    nodeElements = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', d => d.size)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .call(drag(simulation))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip)
        .on('click', nodeClick);

    // Labels (solo para barrios)
    labelElements = g.append('g')
        .selectAll('text')
        .data(nodes.filter(d => d.type === 'barrio'))
        .enter()
        .append('text')
        .attr('class', 'node-label')
        .attr('dy', d => d.size + 15)
        .text(d => d.label);

    // Iniciar simulación
    simulation.nodes(nodes).on('tick', ticked);
    simulation.force('link').links(links);

    function ticked() {
        linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeElements
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        labelElements
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }
}

function showTooltip(event, d) {
    const tooltip = document.getElementById('tooltip');

    let content = `<h3>${d.label}</h3>`;

    if (d.type === 'barrio') {
        content += `
            <div class="tooltip-row">
                <span class="tooltip-label">Tipo:</span>
                <span class="tooltip-value">Barrio/Comuna</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Comedores:</span>
                <span class="tooltip-value">${d.total_comedores}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Cupos:</span>
                <span class="tooltip-value">${d.total_cupos.toLocaleString()}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Promedio:</span>
                <span class="tooltip-value">${d.promedio_cupos} cupos/comedor</span>
            </div>
        `;
    } else {
        content += `
            <div class="tooltip-row">
                <span class="tooltip-label">Tipo:</span>
                <span class="tooltip-value">Comedor Destacado</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Barrio:</span>
                <span class="tooltip-value">${d.barrio}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Cupos:</span>
                <span class="tooltip-value">${d.cupos}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Tipo comida:</span>
                <span class="tooltip-value">${d.tipo_comida}</span>
            </div>
        `;
    }

    tooltip.innerHTML = content;
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
    tooltip.style.opacity = 1;
}

function hideTooltip() {
    document.getElementById('tooltip').style.opacity = 0;
}

function nodeClick(event, d) {
    console.log('Node clicked:', d);
    // Aquí puedes agregar funcionalidad adicional
}

function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

// Funciones de control
function resetGraph() {
    simulation.alpha(1).restart();
}

function centerGraph() {
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
}

function zoomIn() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
}

function zoomOut() {
    svg.transition().duration(300).call(zoom.scaleBy, 0.7);
}

// Búsqueda
document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();

    nodeElements.style('opacity', d => {
        if (!searchTerm) return 1;
        return d.label.toLowerCase().includes(searchTerm) ? 1 : 0.2;
    });

    labelElements.style('opacity', d => {
        if (!searchTerm) return 1;
        return d.label.toLowerCase().includes(searchTerm) ? 1 : 0.2;
    });
});

// Responsive
window.addEventListener('resize', function() {
    const width = document.getElementById('network-graph').clientWidth;
    const height = document.getElementById('network-graph').clientHeight;
    svg.attr('width', width).attr('height', height);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
});
