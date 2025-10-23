# 🚀 Instalación Rápida - Comedores Cali

## Para Windows (PowerShell)

### 1. Crear entorno virtual e instalar dependencias
```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar base de datos

La aplicación ya está configurada para usar Railway PostgreSQL con PostGIS.

**Credenciales incluidas en .env:**
- Host: turntable.proxy.rlwy.net
- Puerto: 17716
- Base de datos: railway
- Usuario: postgres
- Password: fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl

### 3. Habilitar PostGIS en Railway (si es necesario)

Si la extensión PostGIS no está habilitada:

```bash
# Conectarse a la base de datos Railway
psql postgresql://postgres:fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl@turntable.proxy.rlwy.net:17716/railway

# Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

# Verificar
SELECT PostGIS_version();
```

### 4. Aplicar migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear superusuario

```powershell
python manage.py createsuperuser
```

Ingresa:
- Usuario: admin (o el que prefieras)
- Email: admin@comedores.com
- Contraseña: (elige una segura)

### 6. Poblar datos de ejemplo

```powershell
python manage.py poblar_comedores
```

Cuando pregunte si desea limpiar datos existentes, escribe `s` si es la primera vez.

### 7. Ejecutar servidor

```powershell
python manage.py runserver
```

### 8. Abrir aplicación

Abre tu navegador en: **http://localhost:8000**

Para el panel admin: **http://localhost:8000/admin**

---

## Para Linux/macOS (Bash)

### 1. Crear entorno virtual e instalar dependencias
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2-8. Seguir los mismos pasos que en Windows

---

## 🔧 Solución de Problemas Comunes

### Error: "No module named 'django'"
```bash
# Asegúrate de que el entorno virtual esté activado
# Windows
.\venv\Scripts\Activate.ps1

# Linux/macOS
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

### Error: "GDAL is not installed"
Este error puede ocurrir con djangorestframework-gis. 

**Solución temporal:**
Comenta la línea en `requirements.txt`:
```
# djangorestframework-gis==1.0
```

Y también comenta en `apps/comedores/serializers.py` el import:
```python
# from rest_framework_gis.serializers import GeoFeatureModelSerializer
```

Y comenta la clase `ComedorGeoJSONSerializer`.

### Error: "PostGIS extension not found"
```sql
-- Conectarse a la base de datos y ejecutar:
CREATE EXTENSION postgis;
```

### Error de conexión a base de datos
Verifica que el archivo `.env` tenga las credenciales correctas.

---

## 📱 Funcionalidades Principales

Una vez instalado, podrás:

✅ Ver todos los comedores en el mapa interactivo  
✅ Filtrar por estado (abierto/cerrado)  
✅ Filtrar por tipo de comida  
✅ Buscar por nombre o barrio  
✅ Ver detalles de cada comedor  
✅ Ver menú del día  
✅ Leer comentarios y calificaciones  
✅ Obtener direcciones en Google Maps  
✅ Usar geolocalización para encontrar comedores cercanos  

---

## 🎮 Características de Diseño

- **Tema oscuro tipo videojuego** con colores neón
- **Animaciones suaves** en todos los elementos
- **Marcadores personalizados** con colores según estado
- **Modal interactivo** con información completa
- **Sidebar colapsable** con filtros
- **Notificaciones toast** animadas
- **100% responsive** para móviles

---

## 🛠️ Panel de Administración

Accede a `http://localhost:8000/admin` con tu superusuario para:

- ➕ Agregar nuevos comedores
- ✏️ Editar información existente
- 🗺️ Usar selector de ubicación en mapa
- 📅 Gestionar menús diarios
- 💬 Moderar comentarios
- 📊 Ver estadísticas

---

## 📚 Más Información

Para instrucciones detalladas, consulta el archivo `README.md`

---

¡Disfruta de la aplicación! 🍽️🗺️

