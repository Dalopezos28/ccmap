#!/usr/bin/env python
"""
Script de post-deploy para Railway
Se ejecuta después de las migraciones
"""
import os
import django
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comedores_cali.settings.production')
django.setup()

from apps.comedores.models import Comedor
from django.contrib.auth.models import User

def main():
    print("="*70)
    print("POST-DEPLOY: Verificando datos iniciales")
    print("="*70)

    # Verificar si ya hay comedores
    total_comedores = Comedor.objects.count()
    print(f"\nComedores actuales en la base de datos: {total_comedores}")

    if total_comedores == 0:
        print("\n⚠️  No hay comedores en la base de datos.")
        print("Necesitarás importar los comedores manualmente usando:")
        print("  python importar_comedores.py")
        print("\nO accede al admin de Django y créalos manualmente.")
    else:
        print(f"\n✅ Base de datos tiene {total_comedores} comedores cargados")

    # Verificar superusuario
    superusers = User.objects.filter(is_superuser=True).count()
    print(f"\nSuperusuarios en el sistema: {superusers}")

    if superusers == 0:
        print("\n⚠️  No hay superusuarios configurados.")
        print("Necesitarás crear uno con:")
        print("  python manage.py createsuperuser")
    else:
        print(f"✅ Hay {superusers} superusuario(s) configurado(s)")

    print("\n" + "="*70)
    print("Post-deploy completado")
    print("="*70)

if __name__ == '__main__':
    main()
