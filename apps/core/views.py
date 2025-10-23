"""
Views para la aplicación core
"""
from django.shortcuts import render


def mapa_view(request):
    """
    Vista principal que muestra el mapa interactivo de comedores
    """
    context = {
        'page_title': 'Comedores Comunitarios - Cali',
        'meta_description': 'Encuentra comedores comunitarios cerca de ti en Cali, Colombia. Mapa interactivo con horarios, menús y ubicaciones.',
    }
    return render(request, 'mapa.html', context)


def network_view(request):
    """
    Vista del network graph interactivo de comedores
    Visualización estilo WEF Transformation Map
    """
    context = {
        'page_title': 'Red de Comedores - Mapa de Transformación Social',
        'meta_description': 'Explora la red de comedores comunitarios en Cali. Visualización interactiva por barrios y capacidad de atención.',
    }
    return render(request, 'network.html', context)

