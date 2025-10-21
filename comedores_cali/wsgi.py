"""
WSGI config for comedores_cali project.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comedores_cali.settings.development')

application = get_wsgi_application()

