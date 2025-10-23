"""
URL configuration for comedores_cali project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', core_views.mapa_view, name='mapa'),
    path('network/', core_views.network_view, name='network'),
    path('api/', include('apps.comedores.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Personalizar admin
admin.site.site_header = "Comedores Comunitarios Cali - Administración"
admin.site.site_title = "Comedores Cali Admin"
admin.site.index_title = "Bienvenido al Panel de Administración"

