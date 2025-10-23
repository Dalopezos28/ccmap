#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para mostrar resumen de los comedores importados"""

import os
import django
import sys
from pathlib import Path

# Configurar Django
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comedores_cali.settings.base')
django.setup()

from apps.comedores.models import Comedor
from django.db.models import Count, Avg, Sum

def main():
    print("\n" + "="*70)
    print("RESUMEN DE COMEDORES COMUNITARIOS EN POSTGRESQL")
    print("="*70 + "\n")

    # Total de comedores
    total = Comedor.objects.count()
    print(f"TOTAL DE COMEDORES: {total}")
    print()

    # Estadisticas basicas
    print("ESTADISTICAS:")
    stats = Comedor.objects.aggregate(
        total_cupos=Sum('cupos_disponibles'),
        promedio_cupos=Avg('cupos_disponibles'),
        total_capacidad=Sum('capacidad_personas')
    )
    print(f"  - Cupos disponibles totales: {stats['total_cupos']}")
    print(f"  - Promedio de cupos por comedor: {stats['promedio_cupos']:.0f}")
    print(f"  - Capacidad total: {stats['total_capacidad']}")
    print()

    # Por comuna
    print("COMEDORES POR COMUNA:")
    por_comuna = Comedor.objects.values('barrio').annotate(
        total=Count('id'),
        total_cupos=Sum('cupos_disponibles')
    ).order_by('-total')

    for i, comuna in enumerate(por_comuna, 1):
        print(f"  {i:2}. {comuna['barrio']:20} - {comuna['total']:3} comedores ({comuna['total_cupos']} cupos)")
    print()

    # Comedores activos
    activos = Comedor.objects.filter(estado_activo=True).count()
    print(f"COMEDORES ACTIVOS: {activos} de {total}")
    print()

    # Comedores gratuitos
    gratuitos = Comedor.objects.filter(es_gratuito=True).count()
    print(f"COMEDORES GRATUITOS: {gratuitos} de {total}")
    print()

    # Top 10 comedores con mas cupos
    print("TOP 10 COMEDORES CON MAS CUPOS:")
    top_cupos = Comedor.objects.order_by('-cupos_disponibles')[:10]
    for i, comedor in enumerate(top_cupos, 1):
        print(f"  {i:2}. {comedor.nombre[:45]:45} - {comedor.cupos_disponibles} cupos ({comedor.barrio})")
    print()

    # Distribución geografica
    print("DISTRIBUCION GEOGRAFICA (primeros 5):")
    comedores_sample = Comedor.objects.all()[:5]
    for comedor in comedores_sample:
        print(f"  - {comedor.nombre}")
        print(f"    Coordenadas: ({comedor.latitud}, {comedor.longitud})")
        print(f"    {comedor.barrio} - {comedor.cupos_disponibles} cupos")
        print()

    print("="*70)
    print(f"Base de datos PostgreSQL con {total} comedores lista para usar!")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
