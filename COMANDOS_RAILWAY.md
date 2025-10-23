# 📋 Comandos Rápidos para Railway

## Instalación Railway CLI

```bash
# Instalar con npm
npm install -g @railway/cli

# O con Homebrew (Mac)
brew install railway

# Verificar instalación
railway --version
```

## Configuración Inicial

```bash
# Login en Railway
railway login

# Conectar al proyecto
railway link

# Ver variables de entorno
railway variables
```

## Comandos de Despliegue

```bash
# Deploy manual (si no usas GitHub)
railway up

# Ver logs en tiempo real
railway logs

# Ver logs con filtro
railway logs --filter "error"
```

## Gestión de Base de Datos

```bash
# Ejecutar migraciones
railway run python manage.py migrate

# Ver migraciones aplicadas
railway run python manage.py showmigrations

# Crear migraciones (si modificaste models.py)
railway run python manage.py makemigrations

# Importar comedores
railway run python importar_comedores.py

# Verificar datos
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Total: {Comedor.objects.count()}')"
```

## Gestión de Usuarios

```bash
# Crear superusuario
railway run python manage.py createsuperuser

# Crear superusuario con Python
railway run python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'password123')"

# Listar superusuarios
railway run python manage.py shell -c "from django.contrib.auth.models import User; [print(u.username) for u in User.objects.filter(is_superuser=True)]"
```

## Archivos Estáticos

```bash
# Recolectar archivos estáticos
railway run python manage.py collectstatic --noinput

# Limpiar y recolectar
railway run python manage.py collectstatic --clear --noinput
```

## Debugging

```bash
# Abrir Django shell
railway run python manage.py shell

# Ejecutar comando Python
railway run python manage.py shell -c "print('Hello Railway')"

# Verificar configuración
railway run python manage.py check

# Ver settings de Django
railway run python manage.py diffsettings
```

## Información del Proyecto

```bash
# Abrir app en navegador
railway open

# Ver información del proyecto
railway status

# Ver dominio asignado
railway domain
```

## Backups y Datos

```bash
# Exportar datos a JSON
railway run python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > backup.json

# Importar datos desde JSON
railway run python manage.py loaddata backup.json

# Exportar solo comedores
railway run python manage.py dumpdata comedores.Comedor --indent 4 > comedores_backup.json
```

## Variables de Entorno

```bash
# Agregar variable
railway variables set KEY=value

# Ver todas las variables
railway variables

# Eliminar variable
railway variables delete KEY
```

## Gestión de Servicios

```bash
# Reiniciar servicio
railway restart

# Ver servicios del proyecto
railway service

# Cambiar de servicio
railway service <service-name>
```

## Comandos Útiles Combinados

```bash
# Deploy completo desde cero
railway run python manage.py migrate && \
railway run python manage.py collectstatic --noinput && \
railway run python importar_comedores.py && \
railway run python manage.py createsuperuser

# Verificación completa
railway run python manage.py check && \
railway run python manage.py showmigrations && \
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Comedores: {Comedor.objects.count()}')"

# Limpiar y reiniciar
railway run python manage.py flush && \
railway run python manage.py migrate && \
railway run python importar_comedores.py
```

## Troubleshooting

```bash
# Ver últimas 100 líneas de logs
railway logs --lines 100

# Ver logs con timestamp
railway logs --timestamp

# Seguir logs en vivo
railway logs --follow

# Ver logs de un servicio específico
railway logs --service <service-name>

# Reiniciar si algo falla
railway restart

# Verificar health del servicio
railway status
```

## Desarrollo Local con Railway DB

```bash
# Conectar a la BD de Railway localmente
# 1. Obtener DATABASE_URL
railway variables | grep DATABASE_URL

# 2. Exportar localmente
export DATABASE_URL="postgresql://..."

# 3. Ejecutar localmente
python manage.py runserver
```

## Conectarse a PostgreSQL

```bash
# Obtener credenciales
railway variables | grep DATABASE

# Conectar con psql (si lo tienes instalado)
railway run psql $DATABASE_URL

# O conectar directamente
psql postgresql://user:pass@host:port/db
```

## Scripts Personalizados

```bash
# Ejecutar script personalizado
railway run python tu_script.py

# Con argumentos
railway run python tu_script.py --arg1 value1

# Ejecutar con Django context
railway run python manage.py shell < tu_script.py
```

## Monitoreo y Métricas

```bash
# Ver uso de recursos
railway ps

# Ver deployments
railway deployment

# Ver deployment específico
railway deployment <deployment-id>
```

## Quick Reference

```bash
# Los 5 comandos más usados:

1. railway logs              # Ver logs
2. railway run <cmd>         # Ejecutar comando
3. railway variables         # Ver/editar variables
4. railway restart           # Reiniciar
5. railway open              # Abrir app en navegador
```

## Ejemplos Prácticos

### Resetear base de datos completa:
```bash
railway run python manage.py flush --noinput
railway run python manage.py migrate
railway run python importar_comedores.py
railway run python post_deploy.py
```

### Ver estado completo:
```bash
echo "=== PROJECT STATUS ===" && \
railway status && \
echo -e "\n=== LOGS (last 20) ===" && \
railway logs --lines 20 && \
echo -e "\n=== DATABASE ===" && \
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Total comedores: {Comedor.objects.count()}')"
```

### Deploy y verificar:
```bash
git add . && \
git commit -m "Update" && \
git push && \
echo "Waiting for deploy..." && \
sleep 30 && \
railway logs --lines 50
```

## Notas Importantes

- Los comandos `railway run` ejecutan en el servidor, no localmente
- Variables de entorno se aplican inmediatamente
- Restart es necesario después de cambiar variables
- Los logs se pueden filtrar por nivel (info, warn, error)
- El dominio `.railway.app` es automático

## Ayuda

```bash
# Ver ayuda general
railway --help

# Ayuda de comando específico
railway <command> --help

# Ejemplos
railway run --help
railway variables --help
```

---

**Tip**: Agrega estos alias a tu `.bashrc` o `.zshrc`:

```bash
alias rl='railway logs'
alias rr='railway run'
alias ro='railway open'
alias rs='railway status'
alias rv='railway variables'
```

Luego úsalos como: `rl`, `rr python manage.py migrate`, `ro`, etc.
