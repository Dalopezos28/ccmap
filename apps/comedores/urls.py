"""
URLs para la API de Comedores
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ComedorViewSet, MenuDiarioViewSet, ComentarioViewSet,
    AlertaSuscripcionViewSet, MetricaViewSet, DonacionViewSet
)

# Router de DRF
router = DefaultRouter()
router.register(r'comedores', ComedorViewSet, basename='comedor')
router.register(r'menus', MenuDiarioViewSet, basename='menu')
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'alertas', AlertaSuscripcionViewSet, basename='alerta')
router.register(r'metricas', MetricaViewSet, basename='metrica')
router.register(r'donaciones', DonacionViewSet, basename='donacion')

urlpatterns = [
    path('', include(router.urls)),
]

