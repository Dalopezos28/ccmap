# Migración a PostgreSQL - Completada

## Resumen

Se ha migrado exitosamente la base de datos del proyecto de SQLite a PostgreSQL en Railway.

## Cambios Realizados

### 1. Configuración de Base de Datos

**Archivo:** `comedores_cali/settings/base.py`

Se actualizó la configuración para usar PostgreSQL cuando está disponible la variable `DATABASE_URL`:

```python
import dj_database_url

# Configuración para PostgreSQL
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
    )
}

# Fallback a SQLite si no hay DATABASE_URL
if not os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

### 2. Variables de Entorno

**Archivo:** `.env`

```env
DATABASE_URL=postgresql://postgres:PASSWORD@shortline.proxy.rlwy.net:12041/railway
SECRET_KEY='tu-secret-key'
ALLOWED_HOSTS='*'
CORS_ALLOWED_ORIGINS='*'
```

### 3. Tablas Creadas en PostgreSQL

Se crearon exitosamente las siguientes tablas:

- `auth_group`
- `auth_group_permissions`
- `auth_permission`
- `auth_user`
- `auth_user_groups`
- `auth_user_user_permissions`
- `comedores_comedor` ⭐ (Tabla principal)
- `comedores_comentario`
- `comedores_favorito`
- `comedores_menudiario`
- `django_admin_log`
- `django_content_type`
- `django_migrations`
- `django_session`

**Total: 14 tablas**

### 4. Datos Importados

Se importaron **265 comedores comunitarios reales de Cali** usando el script `importar_comedores.py`:

**Datos creados:**
- **265 Comedores comunitarios** con información real de Cali
- **21,525 cupos totales** disponibles
- Distribución en **25 comunas** de Cali
- **100% de comedores gratuitos**

**Distribución por comuna:**
- Comuna 14: 53 comedores
- Comuna 21: 43 comedores
- Comuna 15: 40 comedores
- Comuna 18: 19 comedores
- Comuna 20: 14 comedores
- (y 20 comunas más...)

**Top comedores con más cupos:**
1. Comedor de Reacción Inmediata y Migrantes - 255 cupos
2. Creeser de la Fundación SIDOC - 200 cupos
3. Cesar Conto Jorge Eliécer - 150 cupos

## Credenciales de Acceso

### Administrador Django

- **URL:** http://localhost:8000/admin/
- **Usuario:** `admin`
- **Password:** `admin123`

### Base de Datos PostgreSQL

- **Host:** shortline.proxy.rlwy.net
- **Puerto:** 12041
- **Database:** railway
- **Usuario:** postgres
- **Password:** [ver archivo .env]

## Comandos Útiles

### Verificar migración de tablas
```bash
python manage.py showmigrations
```

### Aplicar migraciones
```bash
python manage.py migrate
```

### Importar comedores desde CSV
```bash
python importar_comedores.py
```

### Ver resumen de datos importados
```bash
python resumen_importacion.py
```

### Poblar datos de ejemplo adicionales (opcional)
```bash
python poblar_db.py
```

### Acceder al shell de Django
```bash
python manage.py shell
```

### Ver tablas en PostgreSQL (desde shell de Django)
```python
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = cursor.fetchall()
print(tables)
```

### Contar registros
```bash
python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Total comedores: {Comedor.objects.count()}')"
```

### Ver resumen de datos
```bash
python resumen_importacion.py
```

## Estructura de Datos CSV

El archivo `comedores_data.csv` contiene las siguientes columnas:
- **ITEM**: ID único del comedor
- **NOMBRE COMEDOR**: Nombre del comedor comunitario
- **COORDENADAS**: Latitud y longitud (separadas por coma)
- **CUPOS**: Número de cupos disponibles
- **NICHO**: Categoría del nicho
- **NODO**: Nodo de la red
- **COMUNA**: Comuna donde se ubica el comedor
- **COMUNA RUTA**: Comuna de la ruta
- **DIA ENTREGA**: Día de entrega

Ejemplo:
```
167,A OTRO NIVEL,3.428703, -76.507350,70,4,2,12,12,2
```

## Archivos Creados

1. **comedores_data.csv** - Archivo CSV con 265 comedores reales de Cali
2. **importar_comedores.py** - Script para importar comedores desde CSV a PostgreSQL
3. **resumen_importacion.py** - Script para ver resumen de datos importados
4. **poblar_db.py** - Script para poblar datos de ejemplo adicionales
5. **verificar_db.py** - Script para verificar los datos en PostgreSQL
6. **MIGRACION_POSTGRESQL.md** - Esta documentación

## Próximos Pasos

1. **Desplegar en producción:** El proyecto ya está configurado para usar PostgreSQL
2. **Backup de datos:** Configurar backups automáticos en Railway
3. **Monitoreo:** Verificar el rendimiento de las consultas en PostgreSQL
4. **Optimización:** Revisar índices y optimizar consultas si es necesario

## Notas Importantes

- ✅ El proyecto usa PostgreSQL cuando existe la variable `DATABASE_URL`
- ✅ Fallback a SQLite si no existe `DATABASE_URL` (para desarrollo local sin Railway)
- ✅ Todas las migraciones se aplicaron correctamente
- ✅ Los datos de ejemplo están cargados y funcionando
- ⚠️  Recuerda cambiar las credenciales del admin en producción
- ⚠️  El archivo `.env` contiene información sensible (no debe subirse a Git)

## Verificación de Estado

Para verificar que todo está funcionando:

```bash
# 1. Verificar conexión
python manage.py check

# 2. Ver migraciones aplicadas
python manage.py showmigrations

# 3. Contar registros
python verificar_db.py

# 4. Iniciar servidor
python manage.py runserver

# 5. Acceder a:
#    - Admin: http://localhost:8000/admin/
#    - API: http://localhost:8000/api/comedores/
#    - Mapa: http://localhost:8000/
```

## Troubleshooting

### Error: "No module named 'psycopg2'"
```bash
pip install psycopg2-binary
```

### Error: "Connection refused"
- Verificar que la variable `DATABASE_URL` esté correcta en `.env`
- Verificar conectividad con Railway

### Error: "No such table"
- Ejecutar: `python manage.py migrate`

### Problemas con caracteres especiales en Windows
- Es un problema de encoding de la consola de Windows (cp1252)
- Los datos están correctos en PostgreSQL
- Usar UTF-8 en la terminal o evitar emojis en prints

## Respaldo de SQLite (Opcional)

Si tenías datos en SQLite y quieres migrarlos:

```bash
# 1. Exportar datos de SQLite
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > backup.json

# 2. Cambiar a PostgreSQL (modificar .env)
# DATABASE_URL=postgresql://...

# 3. Importar datos a PostgreSQL
python manage.py loaddata backup.json
```

## Contacto y Soporte

Para problemas o preguntas sobre la migración, revisar:
- Logs de Django
- Logs de Railway
- Estado de la base de datos en Railway Dashboard
