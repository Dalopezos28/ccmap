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

