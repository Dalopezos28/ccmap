"""
Tests para la aplicación de Comedores
"""
from django.test import TestCase
from django.contrib.gis.geos import Point
from .models import Comedor, MenuDiario, Comentario
from datetime import time


class ComedorModelTest(TestCase):
    """Tests para el modelo Comedor"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.comedor = Comedor.objects.create(
            nombre='Comedor Test',
            direccion='Calle 1 # 2-3',
            barrio='Test Barrio',
            ubicacion=Point(-76.5320, 3.4516, srid=4326),
            telefono='1234567',
            horario_apertura=time(8, 0),
            horario_cierre=time(17, 0),
            dias_atencion='LU-VI',
            tipo_comida='CASERA',
            capacidad_personas=50,
            estado_activo=True
        )
    
    def test_comedor_creation(self):
        """Test de creación de comedor"""
        self.assertEqual(self.comedor.nombre, 'Comedor Test')
        self.assertTrue(self.comedor.estado_activo)
    
    def test_latitud_longitud_properties(self):
        """Test de propiedades de latitud y longitud"""
        self.assertEqual(self.comedor.latitud, 3.4516)
        self.assertEqual(self.comedor.longitud, -76.5320)
    
    def test_calificacion_promedio_sin_comentarios(self):
        """Test de calificación promedio sin comentarios"""
        self.assertEqual(self.comedor.calificacion_promedio(), 0)
    
    def test_str_method(self):
        """Test del método __str__"""
        self.assertEqual(str(self.comedor), 'Comedor Test')


class MenuDiarioModelTest(TestCase):
    """Tests para el modelo MenuDiario"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.comedor = Comedor.objects.create(
            nombre='Comedor Test',
            direccion='Calle 1 # 2-3',
            ubicacion=Point(-76.5320, 3.4516, srid=4326),
            horario_apertura=time(8, 0),
            horario_cierre=time(17, 0),
            dias_atencion='LU-VI',
            tipo_comida='CASERA',
            capacidad_personas=50
        )
        
        self.menu = MenuDiario.objects.create(
            comedor=self.comedor,
            almuerzo='Arroz, frijoles, carne',
            precio_almuerzo=8000
        )
    
    def test_menu_creation(self):
        """Test de creación de menú"""
        self.assertEqual(self.menu.comedor, self.comedor)
        self.assertEqual(self.menu.precio_almuerzo, 8000)
    
    def test_str_method(self):
        """Test del método __str__"""
        self.assertIn('Comedor Test', str(self.menu))


class ComentarioModelTest(TestCase):
    """Tests para el modelo Comentario"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.comedor = Comedor.objects.create(
            nombre='Comedor Test',
            direccion='Calle 1 # 2-3',
            ubicacion=Point(-76.5320, 3.4516, srid=4326),
            horario_apertura=time(8, 0),
            horario_cierre=time(17, 0),
            dias_atencion='LU-VI',
            tipo_comida='CASERA',
            capacidad_personas=50
        )
        
        self.comentario = Comentario.objects.create(
            comedor=self.comedor,
            nombre_usuario='Usuario Test',
            calificacion=5,
            comentario='Excelente comedor',
            aprobado=True
        )
    
    def test_comentario_creation(self):
        """Test de creación de comentario"""
        self.assertEqual(self.comentario.calificacion, 5)
        self.assertTrue(self.comentario.aprobado)
    
    def test_str_method(self):
        """Test del método __str__"""
        self.assertIn('Usuario Test', str(self.comentario))
        self.assertIn('5★', str(self.comentario))

