# 🍽️ Comedores Comunitarios Cali

Sistema de mapeo interactivo de comedores comunitarios en Cali, Colombia. Aplicación web moderna con Django, PostgreSQL/PostGIS y Leaflet.js, diseñada con estética de videojuego para una experiencia visual atractiva.

![Django](https://img.shields.io/badge/Django-4.2+-green.svg)
![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Características Principales

### 🗺️ Mapa Interactivo
- Mapa interactivo con Leaflet.js centrado en Cali
- Marcadores personalizados con iconos animados
- Clustering dinámico para múltiples marcadores
- Colores diferentes según estado (abierto/cerrado)
- Efectos hover y animaciones suaves
- Mapa con estilo oscuro tipo videojuego

### 🔍 Filtros Avanzados
- Filtro por estado (abierto ahora/cerrado/todos)
- Filtro por tipo de comida
- Filtro por calificación mínima
- Búsqueda por nombre o barrio
- Radio de búsqueda personalizable
- Filtros aplicados dinámicamente sin recargar

### 📱 Funcionalidades Modernas
- Geolocalización del usuario
- Comedores más cercanos a tu ubicación
- Modal interactivo con información detallada
- Menú del día actualizado
- Sistema de calificaciones y comentarios
- Botón "Cómo llegar" integrado con Google Maps
- Compartir comedores en redes sociales
- Diseño 100% responsive

### 🎮 Interfaz Tipo Videojuego
- Paleta de colores vibrante (neón)
- Animaciones y transiciones CSS suaves
- Efectos hover 3D en botones
- Notificaciones toast animadas
- Loaders con animaciones
- Sidebar colapsable con slide
- Tema oscuro completo

## 🛠️ Stack Tecnológico

### Backend
- **Django 4.2+**: Framework web
- **Django REST Framework**: API REST
- **PostgreSQL**: Base de datos
- **PostGIS**: Extensión geoespacial
- **Pillow**: Procesamiento de imágenes
- **WhiteNoise**: Archivos estáticos

### Frontend
- **HTML5/CSS3**: Estructura y estilos
- **JavaScript ES6+**: Lógica del cliente
- **Leaflet.js 1.9+**: Mapas interactivos
- **Leaflet MarkerCluster**: Agrupación de marcadores
- **Font Awesome 6**: Iconos
- **Google Fonts (Poppins)**: Tipografía

## 📋 Requisitos Previos

- Python 3.9 o superior
- PostgreSQL 14+ con extensión PostGIS
- pip (gestor de paquetes de Python)
- Virtualenv (recomendado)
- GDAL/OGR (para funcionalidades geoespaciales)

### Instalar PostgreSQL con PostGIS

**Windows:**
```bash
# Descargar e instalar PostgreSQL desde postgresql.org
# Incluir PostGIS en la instalación usando Stack Builder
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis
```

**macOS:**
```bash
brew install postgresql postgis
```

### Instalar GDAL

**Windows:**
```bash
# Descargar desde https://www.gisinternals.com/
# O usar OSGeo4W
```

**Ubuntu/Debian:**
```bash
sudo apt-get install gdal-bin libgdal-dev
sudo apt-get install python3-gdal
```

**macOS:**
```bash
brew install gdal
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio o descargar el código

```bash
cd comedores_cali
```

### 2. Crear y activar entorno virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar base de datos PostgreSQL

#### Opción A: Base de datos Railway (Ya configurada)

El proyecto ya está configurado con la base de datos proporcionada:
- Host: turntable.proxy.rlwy.net
- Puerto: 17716
- Base de datos: railway
- Usuario: postgres

#### Opción B: Base de datos local

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE comedores_cali_db;

-- Conectarse a la base de datos
\c comedores_cali_db

-- Habilitar PostGIS
CREATE EXTENSION postgis;

-- Verificar instalación
SELECT PostGIS_version();
```

Luego editar el archivo `.env` (ya existe) con tus credenciales locales.

### 5. Verificar archivo .env

El archivo `.env` ya está creado. Verifica que contenga:

```env
# Base de datos (Railway o local)
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl
DB_HOST=turntable.proxy.rlwy.net
DB_PORT=17716

# Django
SECRET_KEY=django-insecure-comedores-cali-2024-secretkey-change-in-production
DEBUG=True

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

### 6. Aplicar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

**Nota importante:** Si encuentras errores con PostGIS, asegúrate de que la extensión esté habilitada en la base de datos.

### 7. Crear superusuario

```bash
python manage.py createsuperuser
```

Sigue las instrucciones para crear un usuario administrador.

### 8. Poblar base de datos con datos de ejemplo

```bash
python manage.py poblar_comedores
```

Este comando creará:
- 15 comedores distribuidos por diferentes barrios de Cali
- Menús del día para cada comedor
- Comentarios y calificaciones de ejemplo

### 9. Colectar archivos estáticos

```bash
python manage.py collectstatic --noinput
```

### 10. Ejecutar servidor de desarrollo

```bash
python manage.py runserver
```

La aplicación estará disponible en: **http://localhost:8000**

## 🎯 Uso de la Aplicación

### Página Principal
1. Accede a `http://localhost:8000`
2. Verás el mapa de Cali con todos los comedores marcados
3. Los marcadores verdes están abiertos, los naranjas están cerrados

### Filtrar Comedores
1. Haz clic en el botón "Filtros" en la esquina superior derecha
2. Selecciona los filtros deseados:
   - Estado (abierto/cerrado)
   - Tipo de comida
   - Calificación mínima
   - Radio de búsqueda
3. Haz clic en "Aplicar Filtros"

### Ver Detalles de un Comedor
1. Haz clic en cualquier marcador del mapa
2. Se abrirá un modal con:
   - Foto del comedor
   - Información de contacto
   - Horarios
   - Menú del día
   - Comentarios recientes
3. Usa "Cómo Llegar" para abrir Google Maps con direcciones

### Usar Geolocalización
1. Haz clic en el botón "Mi Ubicación"
2. Autoriza el acceso a tu ubicación
3. El mapa se centrará en tu posición
4. Verás los comedores más cercanos

### Panel de Administración
1. Accede a `http://localhost:8000/admin`
2. Inicia sesión con tu superusuario
3. Gestiona:
   - Comedores (añadir, editar, eliminar)
   - Menús diarios
   - Comentarios y calificaciones
   - Favoritos de usuarios

## 📁 Estructura del Proyecto

```
comedores_cali/
├── manage.py                      # Script de gestión Django
├── requirements.txt               # Dependencias Python
├── README.md                      # Este archivo
├── .env                          # Variables de entorno
├── .gitignore                    # Archivos ignorados por Git
│
├── comedores_cali/               # Configuración del proyecto
│   ├── __init__.py
│   ├── urls.py                   # URLs principales
│   ├── wsgi.py                   # Configuración WSGI
│   ├── asgi.py                   # Configuración ASGI
│   └── settings/                 # Settings modulares
│       ├── __init__.py
│       ├── base.py               # Configuración base
│       ├── development.py        # Configuración desarrollo
│       └── production.py         # Configuración producción
│
├── apps/                         # Aplicaciones Django
│   ├── __init__.py
│   ├── core/                     # App core
│   │   ├── views.py              # Vista principal del mapa
│   │   └── ...
│   └── comedores/                # App principal
│       ├── models.py             # Modelos (Comedor, MenuDiario, etc.)
│       ├── serializers.py        # Serializers DRF
│       ├── views.py              # ViewSets API
│       ├── urls.py               # URLs de la API
│       ├── admin.py              # Configuración admin
│       └── management/           # Comandos personalizados
│           └── commands/
│               └── poblar_comedores.py
│
├── templates/                    # Templates HTML
│   ├── base.html                 # Template base
│   └── mapa.html                 # Template del mapa
│
├── static/                       # Archivos estáticos
│   ├── css/
│   │   └── styles.css            # Estilos principales
│   ├── js/
│   │   └── main.js               # JavaScript principal
│   └── img/                      # Imágenes
│
└── media/                        # Archivos subidos
    └── comedores/                # Fotos de comedores
```

## 🔌 API Endpoints

### Comedores

**Listar todos los comedores**
```
GET /api/comedores/
```

**Obtener comedor específico**
```
GET /api/comedores/{id}/
```

**Comedores en formato GeoJSON**
```
GET /api/comedores/geojson/
```

**Comedores cercanos**
```
GET /api/comedores/cercanos/?lat=3.4516&lng=-76.5320&radio=5
```

**Agregar comentario**
```
POST /api/comedores/{id}/agregar_comentario/
Body: {
  "nombre_usuario": "Juan Pérez",
  "calificacion": 5,
  "comentario": "Excelente comida"
}
```

### Menús

**Listar menús**
```
GET /api/menus/
```

**Menús de hoy**
```
GET /api/menus/hoy/
```

**Menús de un comedor**
```
GET /api/menus/?comedor={id}
```

### Comentarios

**Listar comentarios**
```
GET /api/comentarios/
```

**Comentarios de un comedor**
```
GET /api/comentarios/?comedor={id}
```

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `static/css/styles.css`:

```css
:root {
    --primary-color: #00d4ff;     /* Color primario */
    --secondary-color: #ff6b35;   /* Color secundario */
    --success-color: #4caf50;     /* Color de éxito */
    --dark-bg: #1a1a2e;           /* Fondo oscuro */
    /* ... más colores */
}
```

### Cambiar centro del mapa
Edita en `comedores_cali/settings/base.py`:

```python
CALI_CENTER = {
    'lat': 3.4516,  # Tu latitud
    'lng': -76.5320,  # Tu longitud
}
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
python manage.py test

# Con coverage
coverage run --source='.' manage.py test
coverage report
```

## 🚀 Despliegue a Producción

### 1. Configurar variables de entorno en producción

Edita `.env` para producción:

```env
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
SECRET_KEY=tu-clave-secreta-muy-segura-y-aleatoria
```

### 2. Usar settings de producción

```bash
export DJANGO_SETTINGS_MODULE=comedores_cali.settings.production
```

### 3. Colectar archivos estáticos

```bash
python manage.py collectstatic
```

### 4. Usar servidor WSGI (Gunicorn)

```bash
pip install gunicorn
gunicorn comedores_cali.wsgi:application
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autor

Desarrollado con ❤️ para la comunidad de Cali, Colombia.

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible

## 📧 Contacto

Para preguntas o sugerencias, contacta a través de los issues del repositorio.

## 🙏 Agradecimientos

- Comunidad de Django
- Leaflet.js
- Font Awesome
- Todos los contribuyentes

---

**¡Disfruta mapeando los comedores comunitarios de Cali! 🍽️🗺️**

