#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para importar comedores desde CSV a PostgreSQL"""

import os
import django
import sys
import csv
import datetime
from pathlib import Path

# Configurar Django
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comedores_cali.settings.base')
django.setup()

from apps.comedores.models import Comedor
from django.db import transaction

# Mapeo de comuna a barrio (aproximado basado en las comunas de Cali)
COMUNA_BARRIOS = {
    1: 'Comuna 1',
    2: 'Comuna 2',
    3: 'Comuna 3',
    4: 'Comuna 4',
    5: 'Comuna 5',
    6: 'Comuna 6',
    7: 'Comuna 7',
    8: 'Comuna 8',
    9: 'Comuna 9',
    10: 'Comuna 10',
    11: 'Comuna 11',
    12: 'Comuna 12',
    13: 'Comuna 13',
    14: 'Comuna 14',
    15: 'Comuna 15',
    16: 'Comuna 16',
    17: 'Comuna 17',
    18: 'Comuna 18',
    19: 'Comuna 19',
    20: 'Comuna 20',
    21: 'Comuna 21',
    51: 'Comuna 51',
    52: 'Comuna 52',
    53: 'Comuna 53',
    62: 'Comuna 62',
}

def parsear_coordenadas(lat_str, lon_str):
    """Extrae latitud y longitud de strings separados"""
    try:
        latitud = float(lat_str.strip())
        longitud = float(lon_str.strip())
        return latitud, longitud
    except Exception as e:
        print(f"Error parseando coordenadas '{lat_str}, {lon_str}': {e}")
        return None, None

def limpiar_datos():
    """Elimina los comedores de ejemplo anteriores"""
    print("Limpiando comedores de ejemplo anteriores...")
    # Solo eliminar los 4 comedores de ejemplo que creamos antes
    nombres_ejemplo = [
        'Comedor Popular La Esperanza',
        'Comedor Comunitario El Progreso',
        'Comedor Social Buen Samaritano',
        'Comedor Social La Esperanza'
    ]
    eliminados = Comedor.objects.filter(nombre__in=nombres_ejemplo).delete()
    print(f"   - Eliminados {eliminados[0]} comedores de ejemplo")

def importar_comedores():
    """Importa todos los comedores desde el archivo CSV"""

    print("\n" + "="*70)
    print("IMPORTACION DE COMEDORES DESDE CSV A POSTGRESQL")
    print("="*70 + "\n")

    # Limpiar datos de ejemplo
    limpiar_datos()

    archivo_csv = 'comedores_data.csv'

    if not os.path.exists(archivo_csv):
        print(f"ERROR: No se encontro el archivo {archivo_csv}")
        return

    print(f"Leyendo archivo: {archivo_csv}\n")

    comedores_creados = 0
    comedores_actualizados = 0
    errores = 0

    with open(archivo_csv, 'r', encoding='utf-8') as file:
        # Leer con delimitador especial para manejar las coordenadas
        lines = file.readlines()

        # Usar transaccion para mejor rendimiento
        with transaction.atomic():
            for i, line in enumerate(lines[1:], 1):  # Saltar header
                try:
                    # Parsear línea manualmente para manejar coordenadas con coma
                    parts = line.strip().split(',')

                    if len(parts) < 9:
                        print(f"   X Error en fila {i}: Formato invalido")
                        errores += 1
                        continue

                    nombre = parts[1].strip()
                    lat_str = parts[2].strip()
                    lon_str = parts[3].strip()
                    cupos_str = parts[4].strip()
                    comuna_str = parts[7].strip()

                    # Parsear coordenadas
                    latitud, longitud = parsear_coordenadas(lat_str, lon_str)

                    if latitud is None or longitud is None:
                        print(f"   X Error en fila {i}: Coordenadas invalidas")
                        errores += 1
                        continue

                    # Validar que las coordenadas esten dentro de Cali
                    if not (3.3 <= latitud <= 3.6 and -76.6 <= longitud <= -76.4):
                        print(f"   ! Advertencia fila {i}: Coordenadas fuera de Cali ({latitud}, {longitud})")

                    # Obtener comuna
                    try:
                        comuna = int(comuna_str)
                        barrio = COMUNA_BARRIOS.get(comuna, f'Comuna {comuna}')
                    except:
                        barrio = 'Sin especificar'

                    # Obtener cupos
                    try:
                        cupos = int(cupos_str)
                    except:
                        cupos = 50  # Valor por defecto

                    # Direccion aproximada basada en coordenadas
                    direccion = f"Comuna {comuna_str}, Cali"

                    # Crear o actualizar comedor
                    comedor, created = Comedor.objects.update_or_create(
                        nombre=nombre,
                        defaults={
                            'descripcion': f'Comedor comunitario en {barrio}',
                            'direccion': direccion,
                            'barrio': barrio,
                            'latitud': latitud,
                            'longitud': longitud,
                            'telefono': '',
                            'celular': '',
                            'email': '',
                            'capacidad_personas': cupos if cupos > 0 else 50,
                            'horario_apertura': datetime.time(7, 0),
                            'horario_cierre': datetime.time(15, 0),
                            'dias_atencion': 'LU-VI',
                            'tipo_comida': 'CASERA',
                            'es_gratuito': True,
                            'cupos_disponibles': cupos if cupos > 0 else 50,
                            'acepta_ninos': True,
                            'tiene_banos': True,
                            'estado_activo': True,
                        }
                    )

                    if created:
                        comedores_creados += 1
                        if comedores_creados % 50 == 0:
                            print(f"   + Creados {comedores_creados} comedores...")
                    else:
                        comedores_actualizados += 1

                except Exception as e:
                    nombre_comedor = parts[1].strip() if len(parts) > 1 else 'DESCONOCIDO'
                    print(f"   X Error en fila {i} ({nombre_comedor}): {str(e)}")
                    errores += 1
                    continue

    # Resumen final
    print("\n" + "="*70)
    print("RESUMEN DE IMPORTACION:")
    print(f"  Comedores creados: {comedores_creados}")
    print(f"  Comedores actualizados: {comedores_actualizados}")
    print(f"  Errores: {errores}")
    print(f"  Total en base de datos: {Comedor.objects.count()}")
    print("="*70 + "\n")

    if errores == 0:
        print("Importacion completada exitosamente!")
    else:
        print(f"Importacion completada con {errores} errores")

    # Mostrar algunos ejemplos
    print("\nEjemplos de comedores importados:")
    for comedor in Comedor.objects.all()[:5]:
        print(f"  - {comedor.nombre}")
        print(f"    Ubicacion: {comedor.barrio} ({comedor.latitud}, {comedor.longitud})")
        print(f"    Cupos: {comedor.cupos_disponibles}")
        print()

if __name__ == '__main__':
    importar_comedores()
