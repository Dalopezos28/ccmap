"""
Configuración para entorno de producción
"""
from .base import *
import dj_database_url

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Obtener ALLOWED_HOSTS del entorno
allowed_hosts_env = os.environ.get('ALLOWED_HOSTS', '')
if allowed_hosts_env:
    if allowed_hosts_env == '*':
        ALLOWED_HOSTS = ['*']
    else:
        ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
else:
    # Dominios de Railway por defecto
    ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '.railway.app',
        '.up.railway.app',
    ]

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=False  # Railway maneja SSL internamente
    )
}

# Security settings (solo en producción real con HTTPS)
if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Railway maneja esto
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'

# CORS
CORS_ALLOW_ALL_ORIGINS = True  # Para desarrollo

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

