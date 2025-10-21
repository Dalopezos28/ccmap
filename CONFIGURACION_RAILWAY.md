# 🚂 Configuración Railway PostgreSQL

## Datos de Conexión Proporcionados

Tu base de datos PostgreSQL en Railway ya está configurada en el archivo `.env`:

```
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl
DB_HOST=turntable.proxy.rlwy.net
DB_PORT=17716
```

## ✅ Pasos para Configurar PostGIS en Railway

### Opción 1: Usar interfaz web de Railway (Recomendado)

1. Ve a tu proyecto en [railway.app](https://railway.app)
2. Abre la base de datos PostgreSQL
3. Ve a la pestaña "Query"
4. Ejecuta el siguiente SQL:

```sql
-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar instalación
SELECT PostGIS_version();
```

Si ves una versión de PostGIS (ej: "3.3.2"), ¡está listo!

### Opción 2: Usar terminal (psql)

Si tienes PostgreSQL instalado localmente con psql:

```bash
# Conectarse a Railway
psql postgresql://postgres:fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl@turntable.proxy.rlwy.net:17716/railway

# Una vez conectado, ejecutar:
CREATE EXTENSION IF NOT EXISTS postgis;

# Verificar
SELECT PostGIS_version();

# Salir
\q
```

### Opción 3: Usar herramienta GUI (DBeaver, pgAdmin, etc.)

1. Crear nueva conexión con los datos:
   - Host: turntable.proxy.rlwy.net
   - Puerto: 17716
   - Base de datos: railway
   - Usuario: postgres
   - Contraseña: fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl

2. Conectar y ejecutar el SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

## 🔧 Problema: Si PostGIS no está disponible en Railway

Railway puede no tener PostGIS instalado por defecto. Si obtienes un error como:
```
ERROR: could not open extension control file
```

### Solución A: Contactar soporte de Railway

1. Ve a Railway Discord o soporte
2. Solicita habilitar PostGIS en tu base de datos
3. Es gratis y lo hacen rápido

### Solución B: Usar base de datos local temporalmente

Mientras Railway habilita PostGIS:

1. Instala PostgreSQL localmente
2. Habilita PostGIS localmente
3. Edita `.env`:
   ```env
   DB_NAME=comedores_cali_db
   DB_USER=postgres
   DB_PASSWORD=tu_password_local
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. Crea la base de datos:
   ```sql
   CREATE DATABASE comedores_cali_db;
   \c comedores_cali_db
   CREATE EXTENSION postgis;
   ```

### Solución C: Usar otra base de datos con PostGIS

**Alternativas con PostGIS incluido:**
- [Supabase](https://supabase.com) (gratis, PostGIS incluido)
- [Render](https://render.com) (gratis, PostGIS incluido)
- [ElephantSQL](https://www.elephantsql.com) (gratis hasta 20MB)
- [Neon](https://neon.tech) (gratis, experimental)

## 🚀 Después de Habilitar PostGIS

Una vez que PostGIS esté habilitado:

1. Asegúrate de que `.env` tenga las credenciales correctas
2. Ejecuta las migraciones:
   ```bash
   python manage.py migrate
   ```

3. Si obtienes errores, prueba:
   ```bash
   python manage.py migrate --run-syncdb
   ```

4. Crea el superusuario:
   ```bash
   python manage.py createsuperuser
   ```

5. Pobla los datos:
   ```bash
   python manage.py poblar_comedores
   ```

6. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

## ⚠️ Errores Comunes

### Error: "could not connect to server"
- Verifica que las credenciales en `.env` sean correctas
- Verifica tu conexión a internet
- Railway puede estar en mantenimiento (poco común)

### Error: "FATAL: password authentication failed"
- La contraseña en `.env` es incorrecta
- Railway puede haber rotado las credenciales (verifica en su panel)

### Error: "extension postgis does not exist"
- PostGIS no está habilitado
- Sigue los pasos de "Habilitar PostGIS" arriba

### Error: "relation does not exist"
- No se han ejecutado las migraciones
- Ejecuta: `python manage.py migrate`

## 📝 Verificar Conexión

Para verificar que la conexión funciona:

```bash
python manage.py shell
```

Luego en el shell de Django:
```python
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT version();")
print(cursor.fetchone())
# Debería mostrar la versión de PostgreSQL

# Verificar PostGIS
cursor.execute("SELECT PostGIS_version();")
print(cursor.fetchone())
# Debería mostrar la versión de PostGIS

exit()
```

## 🔒 Seguridad

**⚠️ IMPORTANTE:**

1. **NO compartas** las credenciales de la base de datos públicamente
2. El archivo `.env` ya está en `.gitignore`
3. Para producción, usa variables de entorno del servidor
4. Considera rotar las credenciales después del desarrollo

## 🌐 Conexión desde otro lugar

Si quieres conectarte desde otro proyecto o herramienta:

**String de conexión completa:**
```
postgresql://postgres:fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl@turntable.proxy.rlwy.net:17716/railway
```

**Usar con psycopg2:**
```python
import psycopg2
conn = psycopg2.connect(
    dbname="railway",
    user="postgres",
    password="fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl",
    host="turntable.proxy.rlwy.net",
    port="17716"
)
```

## 📊 Gestión de Base de Datos

### Ver tablas existentes
```sql
\dt
```

### Ver extensiones instaladas
```sql
SELECT * FROM pg_extension;
```

### Ver tamaño de la base de datos
```sql
SELECT pg_size_pretty(pg_database_size('railway'));
```

### Backup de la base de datos
```bash
pg_dump postgresql://postgres:fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl@turntable.proxy.rlwy.net:17716/railway > backup.sql
```

### Restaurar backup
```bash
psql postgresql://postgres:fkqJCDHFbGtHLssXFKbvOZTHMsmOjXPl@turntable.proxy.rlwy.net:17716/railway < backup.sql
```

## 💡 Tips

1. **Conexiones limitadas**: Railway puede tener un límite de conexiones simultáneas. Cierra conexiones cuando no las uses.

2. **Timeouts**: Las consultas lentas pueden timeout. Optimiza tus queries.

3. **Storage**: Verifica el límite de almacenamiento de tu plan en Railway.

4. **Backups**: Railway hace backups automáticos, pero considera hacer los tuyos también.

5. **Monitoreo**: Usa el dashboard de Railway para monitorear uso y performance.

## 🆘 Soporte Adicional

- **Railway Docs**: https://docs.railway.app/databases/postgresql
- **PostGIS Docs**: https://postgis.net/documentation/
- **Django GIS Docs**: https://docs.djangoproject.com/en/4.2/ref/contrib/gis/

---

## ✅ Checklist Rápido

- [ ] PostGIS habilitado en Railway
- [ ] Credenciales en `.env` verificadas
- [ ] `python manage.py migrate` ejecutado exitosamente
- [ ] Superusuario creado
- [ ] Datos de ejemplo poblados
- [ ] Servidor funcionando
- [ ] Puedes acceder a http://localhost:8000

¡Todo listo! 🎉

