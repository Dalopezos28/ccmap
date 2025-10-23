"""
Comando para poblar la base de datos con comedores de ejemplo
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from apps.comedores.models import Comedor, MenuDiario, Comentario
import random
from datetime import time, timedelta


class Command(BaseCommand):
    help = 'Poblar base de datos con comedores de ejemplo en Cali'
    
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando población de comedores...'))
        
        # Limpiar datos existentes
        if input('¿Desea limpiar datos existentes? (s/n): ').lower() == 's':
            Comedor.objects.all().delete()
            self.stdout.write(self.style.WARNING('Datos anteriores eliminados'))
        
        # Crear usuario de ejemplo para comentarios
        user, created = User.objects.get_or_create(
            username='usuario_ejemplo',
            defaults={'email': 'ejemplo@comedores.com'}
        )
        if created:
            user.set_password('ejemplo123')
            user.save()
        
        # Datos de comedores en diferentes barrios de Cali
        comedores_data = [
            {
                'nombre': 'Comedor Social La Esperanza',
                'direccion': 'Calle 13 # 72-45',
                'barrio': 'La Flora',
                'lat': 3.4214,
                'lng': -76.5390,
                'tipo': 'CASERA',
                'capacidad': 80,
                'horario_apertura': '06:00',
                'horario_cierre': '20:00',
                'dias': 'LU-VI',
                'descripcion': 'Comedor comunitario subsidiado por el gobierno. Almuerzos nutritivos y balanceados.',
                'es_gratuito': True,
                'cupos': 60,
                'cola': 'Sin cola',
                'transporte': 'MIO Estación Flora, Rutas: C15, P7A',
                'parada': 'Frente al CAM La Flora',
                'dist_parada': '50 metros',
                'acepta_ninos': True,
                'lleva_comida': True,
                'accesible': True,
                'requisitos': 'Solo documento de identidad',
            },
            {
                'nombre': 'Restaurante Popular San Fernando',
                'direccion': 'Carrera 36 # 15-23',
                'barrio': 'San Fernando',
                'lat': 3.4128,
                'lng': -76.5215,
                'tipo': 'TIPICA',
                'capacidad': 120,
                'horario_apertura': '07:00',
                'horario_cierre': '18:00',
                'dias': 'LU-SA',
                'descripcion': 'Programa social del gobierno. Comida típica colombiana gratuita.',
                'es_gratuito': True,
                'cupos': 80,
                'cola': '5-10 minutos',
                'transporte': 'MIO T35, Rutas C40, T21',
                'parada': 'Parque San Fernando',
                'dist_parada': '100 metros (1 cuadra)',
                'acepta_ninos': True,
                'lleva_comida': True,
                'accesible': False,
                'requisitos': 'Sin requisitos',
            },
            {
                'nombre': 'Comedor Verde Vida',
                'direccion': 'Avenida 6N # 28-55',
                'barrio': 'Centenario',
                'lat': 3.4616,
                'lng': -76.5289,
                'tipo': 'VEGETARIANA',
                'capacidad': 50,
                'horario_apertura': '08:00',
                'horario_cierre': '17:00',
                'dias': 'LU-VI',
                'descripcion': 'Opciones vegetarianas y veganas saludables.',
            },
            {
                'nombre': 'Comedor Comunitario Alfonso López',
                'direccion': 'Calle 44 # 29-18',
                'barrio': 'Alfonso López',
                'lat': 3.3914,
                'lng': -76.5234,
                'tipo': 'MIXTA',
                'capacidad': 100,
                'horario_apertura': '06:30',
                'horario_cierre': '19:00',
                'dias': 'LU-SA',
                'descripcion': 'Variedad de platos caseros y comida del día.',
            },
            {
                'nombre': 'Sabor Popular',
                'direccion': 'Carrera 15 # 70-32',
                'barrio': 'El Poblado',
                'lat': 3.4234,
                'lng': -76.5456,
                'tipo': 'CASERA',
                'capacidad': 60,
                'horario_apertura': '07:00',
                'horario_cierre': '16:00',
                'dias': 'LU-VI',
                'descripcion': 'Comida casera como en casa.',
            },
            {
                'nombre': 'Comedor Social Siloé',
                'direccion': 'Calle 5 # 52-17',
                'barrio': 'Siloé',
                'lat': 3.4156,
                'lng': -76.5612,
                'tipo': 'TIPICA',
                'capacidad': 90,
                'horario_apertura': '06:00',
                'horario_cierre': '20:00',
                'dias': 'TODOS',
                'descripcion': 'Servicio de alimentación para la comunidad todos los días.',
            },
            {
                'nombre': 'Restaurante El Buen Samaritano',
                'direccion': 'Avenida 3 # 48-23',
                'barrio': 'San Antonio',
                'lat': 3.4478,
                'lng': -76.5378,
                'tipo': 'CASERA',
                'capacidad': 70,
                'horario_apertura': '07:30',
                'horario_cierre': '18:30',
                'dias': 'LU-SA',
                'descripcion': 'Almuerzo ejecutivo y menú del día.',
            },
            {
                'nombre': 'Comedor Vegano Natural',
                'direccion': 'Carrera 5 # 16-45',
                'barrio': 'Granada',
                'lat': 3.4567,
                'lng': -76.5312,
                'tipo': 'VEGANA',
                'capacidad': 40,
                'horario_apertura': '08:00',
                'horario_cierre': '16:00',
                'dias': 'LU-VI',
                'descripcion': '100% vegano, orgánico y sostenible.',
            },
            {
                'nombre': 'Comedor Popular La Unión',
                'direccion': 'Calle 25 # 8-12',
                'barrio': 'La Base',
                'lat': 3.3989,
                'lng': -76.5423,
                'tipo': 'MIXTA',
                'capacidad': 110,
                'horario_apertura': '06:00',
                'horario_cierre': '19:00',
                'dias': 'LU-DO',
                'descripcion': 'Gran variedad de platos y horario extendido.',
            },
            {
                'nombre': 'Sabores del Valle',
                'direccion': 'Carrera 42 # 5-67',
                'barrio': 'Obrero',
                'lat': 3.4345,
                'lng': -76.5178,
                'tipo': 'TIPICA',
                'capacidad': 85,
                'horario_apertura': '07:00',
                'horario_cierre': '17:00',
                'dias': 'LU-SA',
                'descripcion': 'Comida típica vallecaucana.',
            },
            {
                'nombre': 'Comedor Solidario',
                'direccion': 'Avenida 2N # 24-89',
                'barrio': 'Santa Rosa',
                'lat': 3.4689,
                'lng': -76.5234,
                'tipo': 'CASERA',
                'capacidad': 95,
                'horario_apertura': '06:30',
                'horario_cierre': '18:00',
                'dias': 'LU-VI',
                'descripcion': 'Precios solidarios para la comunidad.',
            },
            {
                'nombre': 'La Casita del Sabor',
                'direccion': 'Calle 52 # 3-45',
                'barrio': 'Juanchito',
                'lat': 3.3812,
                'lng': -76.5456,
                'tipo': 'INTERNACIONAL',
                'capacidad': 65,
                'horario_apertura': '08:00',
                'horario_cierre': '17:00',
                'dias': 'MA-SA',
                'descripcion': 'Fusión de sabores internacionales.',
            },
            {
                'nombre': 'Comedor Familiar El Refugio',
                'direccion': 'Carrera 26 # 44-12',
                'barrio': 'Mariano Ramos',
                'lat': 3.4023,
                'lng': -76.5289,
                'tipo': 'CASERA',
                'capacidad': 75,
                'horario_apertura': '06:00',
                'horario_cierre': '19:00',
                'dias': 'LU-SA',
                'descripcion': 'Ambiente familiar y acogedor.',
            },
            {
                'nombre': 'Restaurante Popular La Ermita',
                'direccion': 'Calle 13 # 6-23',
                'barrio': 'La Ermita',
                'lat': 3.4512,
                'lng': -76.5401,
                'tipo': 'TIPICA',
                'capacidad': 130,
                'horario_apertura': '06:00',
                'horario_cierre': '20:00',
                'dias': 'TODOS',
                'descripcion': 'El más grande de la zona, siempre abierto.',
            },
            {
                'nombre': 'Comedor Ecológico Naturista',
                'direccion': 'Avenida 5 # 34-78',
                'barrio': 'Versalles',
                'lat': 3.4423,
                'lng': -76.5345,
                'tipo': 'VEGETARIANA',
                'capacidad': 55,
                'horario_apertura': '08:00',
                'horario_cierre': '16:00',
                'dias': 'LU-VI',
                'descripcion': 'Productos orgánicos y naturales.',
            },
        ]
        
        telefonos = [
            '2345678', '2456789', '2567890', '2678901', '2789012',
            '3201234567', '3112345678', '3123456789', '3134567890'
        ]
        
        servicios_list = [
            'Wifi gratis, Parqueadero, Área infantil',
            'Domicilios, Parqueadero',
            'Wifi, Televisión, Menú especial',
            'Zona de juegos, Parqueadero',
            'Domicilios, Wifi, TV',
            'Parqueadero amplio',
            '',
        ]
        
        # WhatsApp numbers
        whatsapp_numbers = [
            '3201234567', '3112345678', '3123456789', '3134567890',
            '3145678901', '3156789012', '3167890123', '3178901234'
        ]
        
        # Crear comedores
        comedores_creados = []
        for data in comedores_data:
            comedor = Comedor.objects.create(
                nombre=data['nombre'],
                descripcion=data['descripcion'],
                direccion=data['direccion'],
                barrio=data['barrio'],
                latitud=data['lat'],
                longitud=data['lng'],
                telefono=random.choice(telefonos),
                celular=random.choice(telefonos),
                whatsapp=random.choice(whatsapp_numbers),
                email=f"{data['nombre'].lower().replace(' ', '')}@comedores.com",
                capacidad_personas=data['capacidad'],
                horario_apertura=time(*map(int, data['horario_apertura'].split(':'))),
                horario_cierre=time(*map(int, data['horario_cierre'].split(':'))),
                dias_atencion=data['dias'],
                tipo_comida=data['tipo'],
                servicios_adicionales=random.choice(servicios_list),
                estado_activo=True,
                # Nuevos campos sociales
                es_gratuito=data.get('es_gratuito', True),
                precio_subsidiado=data.get('precio_sub', 0),
                cupos_disponibles=data.get('cupos', random.randint(20, 80)),
                cola_estimada=data.get('cola', 'Sin cola'),
                requisitos_acceso=data.get('requisitos', 'Sin requisitos especiales'),
                acepta_ninos=data.get('acepta_ninos', True),
                permite_llevar_comida=data.get('lleva_comida', random.choice([True, False])),
                tiene_silla_bebes=random.choice([True, False]),
                tiene_area_infantil=random.choice([True, False]),
                accesible_silla_ruedas=data.get('accesible', random.choice([True, False])),
                tiene_banos=True,
                tiene_rampa=random.choice([True, False]),
                rutas_transporte_publico=data.get('transporte', ''),
                parada_bus_cercana=data.get('parada', ''),
                distancia_parada=data.get('dist_parada', ''),
            )
            comedores_creados.append(comedor)
            self.stdout.write(self.style.SUCCESS(f'✓ Creado: {comedor.nombre}'))
        
        # Crear menús para cada comedor
        self.stdout.write(self.style.SUCCESS('\nCreando menús del día...'))
        
        menus_almuerzo = [
            'Arroz, frijoles, carne guisada, ensalada, jugo',
            'Sancocho de gallina, arroz, aguacate, jugo',
            'Bandeja paisa, arepa, jugo',
            'Arroz con pollo, papas fritas, ensalada, jugo',
            'Sudado de carne, arroz, yuca, ensalada, jugo',
            'Pescado frito, arroz con coco, patacón, jugo',
            'Lentejas, arroz, plátano, proteína, jugo',
            'Pasta boloñesa, ensalada, pan, jugo',
            'Sopa de costilla, arroz, papa, jugo',
            'Arroz chino, ensalada, jugo',
        ]
        
        menus_desayuno = [
            'Arepa, huevo, café con leche',
            'Calentado, huevo, chocolate',
            'Pan, queso, chocolate',
            'Changua, pan, café',
            'Tamales, chocolate',
        ]
        
        menus_cena = [
            'Sopa, arepa, chocolate',
            'Empanadas, jugo',
            'Sanduche, café con leche',
            'Arroz con huevo, arepa, jugo',
        ]
        
        hoy = timezone.now().date()
        
        for comedor in comedores_creados:
            MenuDiario.objects.create(
                comedor=comedor,
                fecha=hoy,
                desayuno=random.choice(menus_desayuno) if random.random() > 0.3 else '',
                almuerzo=random.choice(menus_almuerzo),
                cena=random.choice(menus_cena) if random.random() > 0.4 else '',
                precio_desayuno=random.randint(2000, 5000) if random.random() > 0.3 else 0,
                precio_almuerzo=random.randint(5000, 12000),
                precio_cena=random.randint(3000, 8000) if random.random() > 0.4 else 0,
            )
            self.stdout.write(f'  ✓ Menú creado para {comedor.nombre}')
        
        # Crear comentarios de ejemplo
        self.stdout.write(self.style.SUCCESS('\nCreando comentarios...'))
        
        comentarios_texto = [
            'Excelente comida y muy buen precio. Lo recomiendo.',
            'Muy rica la comida casera, como la de la abuela.',
            'Buen servicio y ambiente familiar.',
            'Porciones generosas y sabor delicioso.',
            'La mejor opción de la zona, muy limpio.',
            'Comida fresca y bien preparada.',
            'Personal muy amable y atento.',
            'Relación calidad-precio increíble.',
            'Siempre vuelvo, nunca defrauda.',
            'Menú variado y comida bien condimentada.',
        ]
        
        nombres_usuarios = [
            'María García', 'Juan Pérez', 'Ana Rodríguez', 'Carlos López',
            'Laura Martínez', 'Pedro González', 'Sofía Hernández', 'Diego Castro',
            'Valentina Díaz', 'Andrés Ramírez'
        ]
        
        for comedor in comedores_creados:
            # 2-5 comentarios por comedor
            num_comentarios = random.randint(2, 5)
            for _ in range(num_comentarios):
                Comentario.objects.create(
                    comedor=comedor,
                    usuario=user if random.random() > 0.5 else None,
                    nombre_usuario=random.choice(nombres_usuarios),
                    calificacion=random.randint(3, 5),
                    comentario=random.choice(comentarios_texto),
                    aprobado=True,
                )
            self.stdout.write(f'  ✓ {num_comentarios} comentarios para {comedor.nombre}')
        
        self.stdout.write(self.style.SUCCESS(f'\n¡Completado! Se crearon:'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(comedores_creados)} comedores'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(comedores_creados)} menús del día'))
        self.stdout.write(self.style.SUCCESS(f'  - ~{len(comedores_creados) * 3} comentarios'))

