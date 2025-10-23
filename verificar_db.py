#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para verificar datos en PostgreSQL"""

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

def main():
    print("\n" + "="*60)
    print("VERIFICACION DE BASE DE DATOS POSTGRESQL")
    print("="*60)

    # Verificar comedores
    print("\n1. COMEDORES:")
    comedores = Comedor.objects.all()
    for i, c in enumerate(comedores, 1):
        print(f"\n   {i}. {c.nombre}")
        print(f"      - Barrio: {c.barrio}")
        print(f"      - Direccion: {c.direccion}")
        print(f"      - Coordenadas: ({c.latitud}, {c.longitud})")
        print(f"      - Horario: {c.horario_apertura} - {c.horario_cierre}")
        print(f"      - Cupos disponibles: {c.cupos_disponibles}")
        print(f"      - Precio: {c.precio_texto}")
        print(f"      - Estado: {'Activo' if c.estado_activo else 'Inactivo'}")

    # Verificar menus
    print(f"\n2. MENUS DEL DIA: {MenuDiario.objects.count()}")
    menus = MenuDiario.objects.all()
    for menu in menus:
        print(f"   - {menu.comedor.nombre}: {menu.almuerzo[:50]}...")

    # Verificar comentarios
    print(f"\n3. COMENTARIOS: {Comentario.objects.count()}")
    comentarios = Comentario.objects.all()
    for com in comentarios:
        print(f"   - {com.nombre_usuario} ({com.calificacion} estrellas): {com.comentario[:40]}...")

    # Verificar usuarios
    print(f"\n4. USUARIOS: {User.objects.count()}")
    usuarios = User.objects.all()
    for u in usuarios:
        print(f"   - {u.username} ({'Admin' if u.is_superuser else 'Usuario'})")

    print("\n" + "="*60)
    print("RESUMEN:")
    print(f"  Total Comedores: {Comedor.objects.count()}")
    print(f"  Total Menus: {MenuDiario.objects.count()}")
    print(f"  Total Comentarios: {Comentario.objects.count()}")
    print(f"  Total Usuarios: {User.objects.count()}")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
