#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para poblar la base de datos PostgreSQL con datos de ejemplo"""

import os
import django
import sys
from pathlib import Path

# Configurar Django
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comedores_cali.settings.base')
django.setup()

from apps.comedores.models import Comedor, MenuDiario, Comentario
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

def main():
    print("=== Poblando Base de Datos PostgreSQL ===\n")

    # Crear superusuario
    print("1. Creando superusuario...")
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@comedores.com',
            'is_staff': True,
            'is_superuser': True,
            'first_name': 'Admin',
            'last_name': 'Sistema'
        }
    )
    if created:
        user.set_password('admin123')
        user.save()
        print(f"   - Superusuario creado: admin / admin123")
    else:
        print(f"   - Superusuario ya existe: admin")

    # Crear comedores de ejemplo
    print("\n2. Creando comedores de ejemplo...")

    comedores_data = [
        {
            'nombre': 'Comedor Popular La Esperanza',
            'descripcion': 'Comedor comunitario que atiende a familias del sector',
            'direccion': 'Carrera 15 #30-25',
            'barrio': 'San Nicolas',
            'latitud': 3.4516,
            'longitud': -76.5320,
            'telefono': '3183456789',
            'celular': '3183456789',
            'email': 'laesperanza@comedores.com',
            'capacidad_personas': 80,
            'horario_apertura': datetime.time(6, 0),
            'horario_cierre': datetime.time(15, 0),
            'dias_atencion': 'LU-VI',
            'tipo_comida': 'CASERA',
            'es_gratuito': True,
            'acepta_ninos': True,
            'tiene_silla_bebes': True,
            'accesible_silla_ruedas': True,
            'tiene_banos': True,
            'tiene_rampa': True,
            'cupos_disponibles': 50,
            'whatsapp': '573183456789',
            'rutas_transporte_publico': 'MIO Estacion San Nicolas, Ruta 15',
            'parada_bus_cercana': 'Carrera 15 con Calle 30',
            'distancia_parada': '50 metros',
        },
        {
            'nombre': 'Comedor Comunitario El Progreso',
            'descripcion': 'Atencion a adultos mayores y personas vulnerables',
            'direccion': 'Calle 25 #10-35',
            'barrio': 'Terron Colorado',
            'latitud': 3.4416,
            'longitud': -76.5420,
            'telefono': '3209876543',
            'celular': '3209876543',
            'email': 'elprogreso@comedores.com',
            'capacidad_personas': 60,
            'horario_apertura': datetime.time(7, 0),
            'horario_cierre': datetime.time(16, 0),
            'dias_atencion': 'LU-SA',
            'tipo_comida': 'CASERA',
            'es_gratuito': True,
            'acepta_ninos': True,
            'tiene_silla_bebes': False,
            'accesible_silla_ruedas': True,
            'tiene_banos': True,
            'tiene_rampa': True,
            'cupos_disponibles': 40,
            'whatsapp': '573209876543',
            'rutas_transporte_publico': 'Ruta 20, Ruta 25',
            'parada_bus_cercana': 'Calle 25 con Carrera 10',
            'distancia_parada': '100 metros',
        },
        {
            'nombre': 'Comedor Social Buen Samaritano',
            'descripcion': 'Comedor con atencion todos los dias incluyendo fines de semana',
            'direccion': 'Avenida 6N #25-40',
            'barrio': 'Granada',
            'latitud': 3.4616,
            'longitud': -76.5220,
            'telefono': '3157654321',
            'celular': '3157654321',
            'email': 'buensamaritano@comedores.com',
            'capacidad_personas': 100,
            'horario_apertura': datetime.time(6, 30),
            'horario_cierre': datetime.time(17, 0),
            'dias_atencion': 'TODOS',
            'tipo_comida': 'MIXTA',
            'es_gratuito': False,
            'precio_subsidiado': 2000,
            'acepta_ninos': True,
            'tiene_silla_bebes': True,
            'accesible_silla_ruedas': True,
            'tiene_banos': True,
            'tiene_rampa': True,
            'tiene_area_infantil': True,
            'cupos_disponibles': 80,
            'whatsapp': '573157654321',
            'rutas_transporte_publico': 'MIO Estacion Granada',
            'parada_bus_cercana': 'Avenida 6N estacion Granada',
            'distancia_parada': '20 metros',
        },
    ]

    comedores_creados = []
    for data in comedores_data:
        comedor, created = Comedor.objects.get_or_create(
            nombre=data['nombre'],
            defaults=data
        )
        if created:
            print(f"   - Creado: {comedor.nombre}")
            comedores_creados.append(comedor)
        else:
            print(f"   - Ya existe: {comedor.nombre}")
            comedores_creados.append(comedor)

    # Crear menus del dia
    print("\n3. Creando menus del dia...")
    hoy = timezone.now().date()

    menus_data = [
        {
            'comedor': comedores_creados[0],
            'fecha': hoy,
            'desayuno': 'Changua, chocolate, pan',
            'almuerzo': 'Sopa de verduras, arroz, pollo guisado, ensalada, jugo',
            'precio_almuerzo': 0,
        },
        {
            'comedor': comedores_creados[1],
            'fecha': hoy,
            'desayuno': 'Cafe, arepa, huevo',
            'almuerzo': 'Sancocho, arroz, carne desmechada, platano, jugo',
            'precio_almuerzo': 0,
        },
        {
            'comedor': comedores_creados[2],
            'fecha': hoy,
            'desayuno': 'Chocolate, pandebono, queso',
            'almuerzo': 'Crema de auyama, arroz, pescado frito, patacon, limonada',
            'precio_almuerzo': 2000,
        },
    ]

    for menu_data in menus_data:
        menu, created = MenuDiario.objects.get_or_create(
            comedor=menu_data['comedor'],
            fecha=menu_data['fecha'],
            defaults={
                'desayuno': menu_data['desayuno'],
                'almuerzo': menu_data['almuerzo'],
                'precio_almuerzo': menu_data['precio_almuerzo'],
            }
        )
        if created:
            print(f"   - Menu creado para: {menu.comedor.nombre}")
        else:
            print(f"   - Menu ya existe para: {menu.comedor.nombre}")

    # Crear comentarios
    print("\n4. Creando comentarios de ejemplo...")

    comentarios_data = [
        {
            'comedor': comedores_creados[0],
            'usuario': user,
            'nombre_usuario': 'Maria Lopez',
            'calificacion': 5,
            'comentario': 'Excelente servicio, la comida es deliciosa y el trato muy amable.',
        },
        {
            'comedor': comedores_creados[0],
            'usuario': user,
            'nombre_usuario': 'Juan Perez',
            'calificacion': 4,
            'comentario': 'Muy buena atencion, solo que a veces hay mucha cola.',
        },
        {
            'comedor': comedores_creados[1],
            'usuario': user,
            'nombre_usuario': 'Ana Rodriguez',
            'calificacion': 5,
            'comentario': 'Me encanta este lugar, siempre hay buena comida.',
        },
    ]

    for comentario_data in comentarios_data:
        comentario, created = Comentario.objects.get_or_create(
            comedor=comentario_data['comedor'],
            nombre_usuario=comentario_data['nombre_usuario'],
            defaults={
                'usuario': comentario_data['usuario'],
                'calificacion': comentario_data['calificacion'],
                'comentario': comentario_data['comentario'],
            }
        )
        if created:
            print(f"   - Comentario creado por: {comentario.nombre_usuario}")
        else:
            print(f"   - Comentario ya existe de: {comentario.nombre_usuario}")

    # Resumen final
    print("\n" + "="*50)
    print("RESUMEN FINAL:")
    print(f"  - Comedores: {Comedor.objects.count()}")
    print(f"  - Menus: {MenuDiario.objects.count()}")
    print(f"  - Comentarios: {Comentario.objects.count()}")
    print(f"  - Usuarios: {User.objects.count()}")
    print("="*50)
    print("\nBase de datos poblada exitosamente!")
    print("\nAcceso al admin:")
    print("  URL: http://localhost:8000/admin/")
    print("  Usuario: admin")
    print("  Password: admin123")

if __name__ == '__main__':
    main()
