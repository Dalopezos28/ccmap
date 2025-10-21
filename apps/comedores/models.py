"""
Modelos para la aplicación de Comedores Comunitarios
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone


class Comedor(models.Model):
    """
    Modelo principal para representar un comedor comunitario
    Usa campos de latitud y longitud separados (versión con SQLite)
    """
    DIAS_CHOICES = [
        ('LU-VI', 'Lunes a Viernes'),
        ('LU-SA', 'Lunes a Sábado'),
        ('LU-DO', 'Lunes a Domingo'),
        ('MA-SA', 'Martes a Sábado'),
        ('TODOS', 'Todos los días'),
        ('CUSTOM', 'Horario personalizado'),
    ]
    
    TIPO_COMIDA_CHOICES = [
        ('CASERA', 'Comida Casera'),
        ('VEGETARIANA', 'Vegetariana'),
        ('VEGANA', 'Vegana'),
        ('MIXTA', 'Mixta'),
        ('TIPICA', 'Típica Colombiana'),
        ('INTERNACIONAL', 'Internacional'),
    ]
    
    # Información básica
    nombre = models.CharField(max_length=200, verbose_name='Nombre del Comedor')
    descripcion = models.TextField(verbose_name='Descripción', blank=True)
    
    # Ubicación
    direccion = models.CharField(max_length=300, verbose_name='Dirección')
    barrio = models.CharField(max_length=100, verbose_name='Barrio', blank=True)
    latitud = models.FloatField(verbose_name='Latitud', help_text='Ej: 3.4516')
    longitud = models.FloatField(verbose_name='Longitud', help_text='Ej: -76.5320')
    
    # Contacto
    telefono = models.CharField(max_length=50, verbose_name='Teléfono', blank=True)
    celular = models.CharField(max_length=50, verbose_name='Celular', blank=True)
    email = models.EmailField(verbose_name='Email', blank=True)
    
    # Operación
    capacidad_personas = models.IntegerField(
        verbose_name='Capacidad de Personas',
        validators=[MinValueValidator(1)],
        default=50
    )
    horario_apertura = models.TimeField(verbose_name='Horario de Apertura')
    horario_cierre = models.TimeField(verbose_name='Horario de Cierre')
    dias_atencion = models.CharField(
        max_length=20,
        choices=DIAS_CHOICES,
        default='LU-VI',
        verbose_name='Días de Atención'
    )
    
    # Características
    tipo_comida = models.CharField(
        max_length=30,
        choices=TIPO_COMIDA_CHOICES,
        default='CASERA',
        verbose_name='Tipo de Comida'
    )
    servicios_adicionales = models.TextField(
        verbose_name='Servicios Adicionales',
        help_text='Ej: Wifi, Parqueadero, Área infantil',
        blank=True
    )
    
    # NUEVOS CAMPOS PARA PROGRAMA SOCIAL
    # Precios y acceso
    es_gratuito = models.BooleanField(
        default=True,
        verbose_name='¿Es Gratuito?',
        help_text='Marcar si el comedor es completamente gratuito'
    )
    precio_subsidiado = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        verbose_name='Precio Subsidiado',
        help_text='Precio con subsidio si no es gratuito',
        default=0,
        blank=True,
        null=True
    )
    requisitos_acceso = models.TextField(
        verbose_name='Requisitos de Acceso',
        help_text='Ej: Documento de identidad, Carnet de persona mayor, Sin requisitos',
        blank=True,
        default='Sin requisitos especiales'
    )
    
    # Disponibilidad y cupos
    cupos_disponibles = models.IntegerField(
        verbose_name='Cupos Disponibles Hoy',
        default=50,
        validators=[MinValueValidator(0)],
        help_text='Actualizar diariamente'
    )
    cola_estimada = models.CharField(
        max_length=50,
        verbose_name='Tiempo de Espera Estimado',
        default='Sin cola',
        blank=True,
        help_text='Ej: 5-10 minutos, 15-20 minutos'
    )
    ultima_actualizacion_cupos = models.DateTimeField(
        verbose_name='Última Actualización de Cupos',
        auto_now=True
    )
    
    # Familia y niños
    acepta_ninos = models.BooleanField(
        default=True,
        verbose_name='Acepta Niños'
    )
    tiene_silla_bebes = models.BooleanField(
        default=False,
        verbose_name='Tiene Sillas para Bebés'
    )
    permite_llevar_comida = models.BooleanField(
        default=False,
        verbose_name='Permite Llevar Comida a Casa',
        help_text='Para llevar a familiares'
    )
    tiene_area_infantil = models.BooleanField(
        default=False,
        verbose_name='Tiene Área Infantil'
    )
    
    # Accesibilidad
    accesible_silla_ruedas = models.BooleanField(
        default=False,
        verbose_name='Accesible en Silla de Ruedas'
    )
    tiene_banos = models.BooleanField(
        default=True,
        verbose_name='Tiene Baños'
    )
    tiene_rampa = models.BooleanField(
        default=False,
        verbose_name='Tiene Rampa de Acceso'
    )
    
    # Transporte público
    rutas_transporte_publico = models.TextField(
        verbose_name='Rutas de Transporte Público',
        help_text='Ej: Ruta 15, Ruta 20, MIO Estación Flora',
        blank=True
    )
    parada_bus_cercana = models.CharField(
        max_length=200,
        verbose_name='Parada de Bus Más Cercana',
        blank=True,
        help_text='Nombre de la parada más cercana'
    )
    distancia_parada = models.CharField(
        max_length=50,
        verbose_name='Distancia a la Parada',
        blank=True,
        help_text='Ej: 50 metros, 2 cuadras'
    )
    
    # Contacto adicional
    whatsapp = models.CharField(
        max_length=50,
        verbose_name='WhatsApp',
        blank=True,
        help_text='Número de WhatsApp para contacto rápido'
    )
    
    # Media
    foto_principal = models.ImageField(
        upload_to='comedores/',
        verbose_name='Foto Principal',
        blank=True,
        null=True
    )
    
    # Estado y metadata
    estado_activo = models.BooleanField(default=True, verbose_name='Estado Activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name='Última Modificación')
    
    class Meta:
        verbose_name = 'Comedor'
        verbose_name_plural = 'Comedores'
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['estado_activo', 'nombre']),
            models.Index(fields=['barrio']),
        ]
    
    def __str__(self):
        return self.nombre
    
    @property
    def esta_abierto_ahora(self):
        """Determina si el comedor está abierto en el momento actual"""
        if not self.estado_activo:
            return False
        
        ahora = timezone.now()
        hora_actual = ahora.time()
        
        # Verificar horario
        if self.horario_apertura <= hora_actual <= self.horario_cierre:
            # Verificar día de la semana
            dia_semana = ahora.weekday()  # 0=Lunes, 6=Domingo
            
            if self.dias_atencion == 'TODOS' or self.dias_atencion == 'LU-DO':
                return True
            elif self.dias_atencion == 'LU-VI' and dia_semana < 5:
                return True
            elif self.dias_atencion == 'LU-SA' and dia_semana < 6:
                return True
            elif self.dias_atencion == 'MA-SA' and 1 <= dia_semana < 6:
                return True
        
        return False
    
    def calificacion_promedio(self):
        """Calcula la calificación promedio del comedor"""
        comentarios = self.comentarios.all()
        if comentarios.exists():
            return round(sum(c.calificacion for c in comentarios) / comentarios.count(), 1)
        return 0
    
    @property
    def estado_cupos(self):
        """Retorna el estado de disponibilidad de cupos"""
        if self.cupos_disponibles >= 30:
            return 'disponible'  # Verde
        elif self.cupos_disponibles > 0:
            return 'pocos'  # Amarillo
        else:
            return 'lleno'  # Rojo
    
    @property
    def precio_texto(self):
        """Retorna texto del precio para mostrar"""
        if self.es_gratuito:
            return '🆓 GRATIS'
        elif self.precio_subsidiado and self.precio_subsidiado > 0:
            return f'💰 Subsidiado ${int(self.precio_subsidiado)}'
        else:
            return '💵 Consultar precio'
    
    @property
    def telefono_limpio(self):
        """Retorna teléfono sin espacios ni caracteres especiales"""
        if self.telefono:
            return ''.join(filter(str.isdigit, self.telefono))
        return ''
    
    @property
    def whatsapp_link(self):
        """Genera link de WhatsApp"""
        if self.whatsapp:
            numero = ''.join(filter(str.isdigit, self.whatsapp))
            if not numero.startswith('57'):
                numero = '57' + numero
            return f'https://wa.me/{numero}'
        return None


class MenuDiario(models.Model):
    """
    Modelo para el menú diario de cada comedor
    """
    comedor = models.ForeignKey(
        Comedor,
        on_delete=models.CASCADE,
        related_name='menus',
        verbose_name='Comedor'
    )
    fecha = models.DateField(verbose_name='Fecha', default=timezone.now)
    
    # Comidas
    desayuno = models.TextField(verbose_name='Desayuno', blank=True)
    almuerzo = models.TextField(verbose_name='Almuerzo')
    cena = models.TextField(verbose_name='Cena', blank=True)
    
    # Precios
    precio_desayuno = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio Desayuno',
        validators=[MinValueValidator(0)],
        default=0,
        blank=True,
        null=True
    )
    precio_almuerzo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio Almuerzo',
        validators=[MinValueValidator(0)],
        default=0
    )
    precio_cena = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio Cena',
        validators=[MinValueValidator(0)],
        default=0,
        blank=True,
        null=True
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Menú Diario'
        verbose_name_plural = 'Menús Diarios'
        ordering = ['-fecha']
        unique_together = ['comedor', 'fecha']
        indexes = [
            models.Index(fields=['comedor', '-fecha']),
        ]
    
    def __str__(self):
        return f"{self.comedor.nombre} - {self.fecha}"


class Comentario(models.Model):
    """
    Modelo para comentarios y calificaciones de comedores
    """
    comedor = models.ForeignKey(
        Comedor,
        on_delete=models.CASCADE,
        related_name='comentarios',
        verbose_name='Comedor'
    )
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comentarios_comedores',
        verbose_name='Usuario',
        null=True,
        blank=True
    )
    nombre_usuario = models.CharField(
        max_length=100,
        verbose_name='Nombre',
        help_text='Nombre del usuario si no está registrado'
    )
    
    # Calificación y comentario
    calificacion = models.IntegerField(
        verbose_name='Calificación',
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Calificación de 1 a 5 estrellas'
    )
    comentario = models.TextField(verbose_name='Comentario')
    
    # Metadata
    fecha = models.DateTimeField(auto_now_add=True, verbose_name='Fecha')
    aprobado = models.BooleanField(default=True, verbose_name='Aprobado')
    
    class Meta:
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['comedor', '-fecha']),
        ]
    
    def __str__(self):
        return f"{self.nombre_usuario} - {self.comedor.nombre} ({self.calificacion}★)"


class Favorito(models.Model):
    """
    Modelo para marcar comedores como favoritos
    """
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comedores_favoritos',
        verbose_name='Usuario'
    )
    comedor = models.ForeignKey(
        Comedor,
        on_delete=models.CASCADE,
        related_name='favoritos',
        verbose_name='Comedor'
    )
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'
        unique_together = ['usuario', 'comedor']
        ordering = ['-fecha_agregado']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.comedor.nombre}"

