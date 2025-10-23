# 🌐 Network Graph - Mapa de Transformación Social

## Descripción

Visualización interactiva estilo **WEF Transformation Map** que muestra la red de comedores comunitarios de Cali agrupados por barrios y conectados por similitud de cupos disponibles.

## ✨ Características

### 🎯 Inspiración: World Economic Forum Transformation Map

La visualización está inspirada en el [WEF Strategic Intelligence Transformation Map](https://intelligence.weforum.org/topics/a1Gb0000001RIhBEAW), con las siguientes características:

#### 1. **Network Graph Interactivo**
- Nodos representan **barrios/comunas** y **comedores destacados**
- Enlaces muestran **relaciones** entre barrios con cupos similares
- **D3.js** para renderizado y física de la simulación

#### 2. **Agrupación Inteligente**
- **Barrios**: Nodos grandes agrupados por total de cupos
- **Comedores**: Nodos pequeños mostrando los top 20 por capacidad
- **Colores por categoría**:
  - Rojo (#e74c3c): Muy Alto (3000+ cupos)
  - Naranja (#e67e22): Alto (2000-3000 cupos)
  - Amarillo (#f39c12): Medio (1000-2000 cupos)
  - Azul (#3498db): Bajo (500-1000 cupos)
  - Gris (#95a5a6): Muy Bajo (<500 cupos)

#### 3. **Interactividad Completa**
- **Zoom y Pan**: Scroll para zoom, arrastrar para mover
- **Drag & Drop**: Reorganizar nodos arrastrando
- **Hover**: Tooltips con información detallada
- **Búsqueda**: Filtrar por nombre de barrio o comedor
- **Controles**: Reiniciar, centrar, zoom +/-

#### 4. **Diseño Moderno**
- Gradiente de fondo (#667eea → #764ba2)
- Glassmorphism en sidebar y header
- Animaciones suaves y transiciones
- Responsive design

## 🚀 Cómo Usar

### Acceso

1. **Desde el mapa principal**:
   - Haz clic en el botón "**Red de Comedores**" en el header
   - URL directa: http://localhost:8000/network/

2. **Desde la API**:
   - Endpoint: http://localhost:8000/api/comedores/network_graph/
   - Método: GET
   - Formato: JSON

### Navegación

#### Controles del Mouse
- **Scroll**: Zoom in/out
- **Click + Arrastrar fondo**: Mover el grafo
- **Click + Arrastrar nodo**: Reorganizar posición
- **Hover sobre nodo**: Ver tooltip con información
- **Click en nodo**: Seleccionar (expandible en futuras versiones)

#### Controles de Interfaz
- **Buscar**: Encuentra barrios o comedores por nombre
- **Reiniciar**: Reinicia la simulación física
- **Centrar**: Centra el grafo en la pantalla
- **+/−**: Zoom manual

### Interpretación

#### Nodos Grandes (Barrios)
```
Comuna 14 (4290 cupos)
├─ Total Comedores: 53
├─ Promedio: 81 cupos/comedor
└─ Color: Rojo (Muy Alto)
```

#### Nodos Pequeños (Comedores Destacados)
```
COMEDOR DE REACCION INMEDIATA
├─ Cupos: 255
├─ Barrio: Comuna 3
├─ Tipo: Casera
└─ Color: Verde (#2ecc71)
```

#### Enlaces
- **Grosor**: Indica fuerza de conexión (similitud en cupos)
- **Opacidad**: Se ajusta al hover para mejor visualización
- **Tipo**: "similitud_cupos" o "pertenece_a"

## 📊 Datos Mostrados

### Estadísticas Globales (Header)
- **Total Barrios**: 25 comunas
- **Total Comedores**: 265 activos
- **Cupos Totales**: 21,525
- **Promedio por Barrio**: 10.6 comedores

### Información por Nodo

#### Barrio/Comuna
- Nombre de la comuna
- Total de comedores
- Total de cupos disponibles
- Promedio de cupos por comedor
- Categoría (Muy Alto, Alto, Medio, Bajo, Muy Bajo)

#### Comedor
- Nombre del comedor
- Barrio donde se ubica
- Cupos disponibles
- Tipo de comida
- Categoría (destacado)

## 🎨 Paleta de Colores

### Por Nivel de Cupos (Barrios)
| Categoría | Color | Rango | Hex |
|-----------|-------|-------|-----|
| Muy Alto | 🔴 Rojo | 3000+ cupos | #e74c3c |
| Alto | 🟠 Naranja | 2000-3000 | #e67e22 |
| Medio | 🟡 Amarillo | 1000-2000 | #f39c12 |
| Bajo | 🔵 Azul | 500-1000 | #3498db |
| Muy Bajo | ⚪ Gris | <500 | #95a5a6 |

### Por Tipo de Comida (Comedores)
| Tipo | Color | Hex |
|------|-------|-----|
| Casera | 🟢 Verde | #2ecc71 |
| Vegetariana | 🟢 Verde Oscuro | #27ae60 |
| Vegana | 🟢 Verde Azulado | #16a085 |
| Mixta | 🔵 Azul | #3498db |
| Típica | 🟣 Púrpura | #9b59b6 |
| Internacional | ⚫ Gris Oscuro | #34495e |

## 🔧 Estructura Técnica

### Backend (Django)

**Archivo**: `apps/comedores/views.py`

```python
@action(detail=False, methods=['get'])
def network_graph(self, request):
    """
    Endpoint que retorna datos para el network graph
    Agrupa comedores por barrio y genera nodos y enlaces
    """
    # Genera:
    # - nodes: Lista de nodos (barrios + comedores)
    # - links: Enlaces entre nodos
    # - stats: Estadísticas globales
    # - leyenda: Categorías y colores
```

**Endpoint**: `/api/comedores/network_graph/`

### Frontend (D3.js)

**Archivo**: `templates/network.html`

#### Componentes Principales

1. **D3.js v7**: Librería de visualización
2. **Force Simulation**: Física para posicionamiento de nodos
3. **Zoom Behavior**: Manejo de zoom y pan
4. **Drag Behavior**: Arrastre de nodos

#### Forces Aplicadas

```javascript
d3.forceSimulation()
  .force('link', d3.forceLink().distance(100))      // Distancia entre nodos
  .force('charge', d3.forceManyBody().strength(-300)) // Repulsión
  .force('center', d3.forceCenter(w/2, h/2))        // Centrado
  .force('collision', d3.forceCollide().radius(r))  // Anti-colisión
```

## 📈 Algoritmo de Conexiones

### Enlaces entre Barrios

```python
# Se conectan barrios con cupos similares
if diff_cupos < (max_cupos * 0.5):
    strength = 1 - (diff_cupos / max_cupos)
    # Crear enlace con valor proporcional
```

### Enlaces Comedor-Barrio

```python
# Cada comedor destacado se conecta a su barrio
links.append({
    'source': comedor_id,
    'target': barrio_id,
    'value': cupos / 100,
    'tipo': 'pertenece_a'
})
```

## 🎯 Casos de Uso

### 1. Análisis de Distribución
"¿Qué comunas tienen más capacidad de atención?"

→ Ver nodos rojos y naranjas (>2000 cupos)
→ Comuna 14, 21, 15 son las principales

### 2. Identificar Brechas
"¿Qué zonas necesitan más comedores?"

→ Buscar nodos grises o azules pequeños
→ Comunas con <500 cupos totales

### 3. Comedores Destacados
"¿Cuáles son los comedores más grandes?"

→ Filtrar nodos de tipo 'comedor'
→ Tamaño del nodo indica capacidad

### 4. Planificación
"¿Cómo optimizar la red de comedores?"

→ Ver clusters de barrios conectados
→ Identificar patrones de distribución

## 🚀 Próximas Mejoras

### Funcionalidades Planeadas

- [ ] **Filtros Avanzados**: Por tipo de comida, comuna específica
- [ ] **Modo Temporal**: Ver evolución de cupos en el tiempo
- [ ] **Comparación**: Comparar múltiples barrios
- [ ] **Export**: Descargar imagen del grafo
- [ ] **Compartir**: URL con configuración específica
- [ ] **3D Mode**: Visualización en 3D con Three.js
- [ ] **Heatmap**: Mapa de calor superpuesto
- [ ] **Clustering**: Detección automática de clusters

### Datos Adicionales

- [ ] Integrar datos de asistencia real
- [ ] Mostrar tendencias temporales
- [ ] Agregar indicadores sociales
- [ ] Conectar con datos demográficos

## 📱 Responsive Design

### Desktop (>1024px)
- Sidebar visible
- Estadísticas en 4 columnas
- Controles completos

### Tablet (768-1024px)
- Sidebar colapsable
- Estadísticas en 2 columnas
- Controles simplificados

### Mobile (<768px)
- Sidebar oculto por defecto
- Estadísticas apiladas
- Controles táctiles optimizados

## 🎓 Referencias

### Inspiración
- [WEF Strategic Intelligence](https://intelligence.weforum.org/)
- [WEF Transformation Maps](https://www.weforum.org/agenda/2018/01/the-transformation-map-explained/)

### Tecnologías
- [D3.js Documentation](https://d3js.org/)
- [Force Simulation](https://github.com/d3/d3-force)
- [Zoom Behavior](https://github.com/d3/d3-zoom)

## 🐛 Debugging

### Ver datos en consola
```javascript
console.log('Nodes:', nodes);
console.log('Links:', links);
```

### Test del endpoint
```bash
curl http://localhost:8000/api/comedores/network_graph/
```

### Verificar simulación
```javascript
simulation.on('tick', () => {
    console.log('Simulation tick:', simulation.alpha());
});
```

## 📝 Notas

- Los datos se cargan dinámicamente desde PostgreSQL
- La simulación física se ejecuta en el cliente (navegador)
- El rendimiento es óptimo hasta ~500 nodos
- Para datasets más grandes, considerar clustering o sampling

---

**Creado**: 2025-10-22
**Versión**: 1.0
**Tecnologías**: Django + PostgreSQL + D3.js v7
**Inspirado en**: WEF Transformation Map
