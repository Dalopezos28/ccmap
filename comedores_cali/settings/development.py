"""
Configuración para entorno de desarrollo
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# CORS más permisivo en desarrollo
CORS_ALLOW_ALL_ORIGINS = True

# Mostrar emails en consola
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

