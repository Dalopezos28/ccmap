# 🚀 Guía de Despliegue en Railway

## Preparación Completada ✅

Tu proyecto ya está configurado para desplegarse en Railway. Se han creado/actualizado los siguientes archivos:

- ✅ `requirements.txt` - Dependencias actualizadas (Python 3.11/3.13 compatible)
- ✅ `runtime.txt` - Versión de Python especificada
- ✅ `Procfile` - Comandos de inicio
- ✅ `railway.json` - Configuración de Railway
- ✅ `post_deploy.py` - Script post-despliegue
- ✅ `comedores_cali/settings/production.py` - Configuración de producción

## 📋 Pasos para Desplegar

### 1. Verificar Variables de Entorno

En tu proyecto de Railway, asegúrate de tener configuradas estas variables:

```env
# Base de datos (Railway la crea automáticamente al agregar PostgreSQL)
DATABASE_URL=postgresql://...

# Django
DJANGO_SETTINGS_MODULE=comedores_cali.settings.production
SECRET_KEY=tu-secret-key-super-segura-aqui
DEBUG=False

# Hosts permitidos (opcional, ya tiene defaults)
ALLOWED_HOSTS=.railway.app,.up.railway.app

# CORS (opcional)
CORS_ALLOWED_ORIGINS=*
```

### 2. Conectar PostgreSQL

Si aún no lo has hecho:

1. Ve a tu proyecto en Railway
2. Click en "New" → "Database" → "Add PostgreSQL"
3. Railway automáticamente creará la variable `DATABASE_URL`

### 3. Hacer Push a GitHub

```bash
# Si es tu primer push
git init
git add .
git commit -m "Deploy to Railway"
git branch -M main
git remote add origin <tu-repo-url>
git push -u origin main

# Si ya tienes el repo
git add .
git commit -m "Update for Railway deployment"
git push
```

### 4. Conectar Railway con GitHub

1. Ve a [railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Elige tu repositorio
5. Railway detectará automáticamente que es un proyecto Django

### 5. Verificar el Despliegue

Railway ejecutará automáticamente:

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Ejecutar migraciones
python manage.py migrate

# 3. Recolectar archivos estáticos
python manage.py collectstatic --noinput

# 4. Post-deploy (verificación)
python post_deploy.py

# 5. Iniciar servidor
gunicorn comedores_cali.wsgi:application
```

## 📊 Importar Datos de Comedores

Después del primer despliegue, necesitas importar los comedores:

### Opción 1: Usando Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar a tu proyecto
railway link

# Subir el CSV
railway run python importar_comedores.py
```

### Opción 2: Desde tu máquina local

```bash
# Conectar a la base de datos de Railway directamente
# Usa el DATABASE_URL de Railway

# Ejecutar el script
python importar_comedores.py
```

### Opción 3: Manualmente desde el Admin

1. Accede a `https://tu-app.railway.app/admin/`
2. Login con las credenciales del superusuario
3. Crear comedores manualmente

## 👤 Crear Superusuario

### Opción 1: Usando Railway CLI

```bash
railway run python manage.py createsuperuser
```

### Opción 2: Desde Django Shell

```bash
railway run python manage.py shell

# En el shell de Python
from django.contrib.auth.models import User
User.objects.create_superuser('admin', 'admin@example.com', 'tu-password-segura')
```

## 🔧 Comandos Útiles con Railway CLI

```bash
# Ver logs en tiempo real
railway logs

# Ejecutar comandos en el servidor
railway run <comando>

# Ver variables de entorno
railway variables

# Abrir la app en el navegador
railway open
```

## 🐛 Solución de Problemas

### Error: "No module named 'X'"
- Verifica que todas las dependencias estén en `requirements.txt`
- Haz push de los cambios

### Error: "DisallowedHost"
- Agrega tu dominio de Railway a `ALLOWED_HOSTS` en las variables de entorno
- O deja que use los defaults (`.railway.app`)

### Error: "Database connection failed"
- Verifica que PostgreSQL esté agregado al proyecto
- Verifica que `DATABASE_URL` esté configurada

### Error: "Static files not found"
- Railway ejecuta `collectstatic` automáticamente
- Verifica que `whitenoise` esté instalado

### Base de datos vacía
- Ejecuta: `railway run python importar_comedores.py`
- O importa desde el admin de Django

## 📝 Checklist Post-Despliegue

- [ ] ¿El sitio carga correctamente?
- [ ] ¿Las migraciones se aplicaron?
- [ ] ¿Los archivos estáticos se sirven?
- [ ] ¿La base de datos está conectada?
- [ ] ¿Los comedores están importados?
- [ ] ¿Puedes acceder al admin?
- [ ] ¿El mapa muestra los marcadores?
- [ ] ¿La API responde en `/api/comedores/`?
- [ ] ¿El network graph funciona en `/network/`?

## 🎯 URLs de Tu Aplicación

Después del despliegue, tu app estará en:

```
https://tu-proyecto-name.up.railway.app/

Páginas:
- /              → Mapa principal
- /network/      → Network graph
- /admin/        → Panel de administración
- /api/comedores/ → API REST
```

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU y memoria
- Histórico de deploys
- Health checks automáticos

## 🔄 Actualizaciones Futuras

Para actualizar tu app:

```bash
# 1. Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push

# 2. Railway detecta el push y redespliega automáticamente
```

## 💡 Tips

1. **Usa variables de entorno**: Nunca hagas hardcode de secrets
2. **Monitorea los logs**: `railway logs` es tu amigo
3. **Haz backups**: Exporta tu base de datos regularmente
4. **Prueba localmente primero**: Usa `python-dotenv` para simular el entorno de Railway

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `railway logs`
2. Consulta la documentación: [docs.railway.app](https://docs.railway.app)
3. Comunidad de Railway: [Discord](https://discord.gg/railway)

---

**¡Tu proyecto está listo para desplegarse en Railway!** 🎉

Creado: 2025-10-22
Proyecto: Comedores Comunitarios Cali
