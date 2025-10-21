"""
Configuración del panel de administración para Comedores
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Comedor, MenuDiario, Comentario, Favorito


@admin.register(Comedor)
class ComedorAdmin(admin.ModelAdmin):
    """
    Admin personalizado para Comedores con mapa interactivo
    """
    list_display = [
        'nombre', 'barrio', 'precio_display', 'cupos_display',
        'estado_badge', 'horario_completo', 'calificacion_display'
    ]
    list_filter = [
        'estado_activo', 'es_gratuito', 'tipo_comida', 'dias_atencion', 
        'barrio', 'acepta_ninos', 'accesible_silla_ruedas'
    ]
    search_fields = ['nombre', 'descripcion', 'direccion', 'barrio']
    readonly_fields = ['fecha_creacion', 'fecha_modificacion', 'calificacion_display', 'ultima_actualizacion_cupos']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'tipo_comida', 'estado_activo')
        }),
        ('Ubicación', {
            'fields': ('direccion', 'barrio', 'latitud', 'longitud'),
            'description': 'Ingrese las coordenadas de ubicación'
        }),
        ('Contacto', {
            'fields': ('telefono', 'celular', 'whatsapp', 'email')
        }),
        ('Horarios y Capacidad', {
            'fields': (
                'horario_apertura', 'horario_cierre', 'dias_atencion',
                'capacidad_personas'
            )
        }),
        ('💰 Precios y Acceso (PROGRAMA SOCIAL)', {
            'fields': ('es_gratuito', 'precio_subsidiado', 'requisitos_acceso'),
            'description': 'Información sobre costos y requisitos para acceder'
        }),
        ('📊 Disponibilidad en Tiempo Real', {
            'fields': ('cupos_disponibles', 'cola_estimada'),
            'description': 'Actualizar diariamente para informar a los usuarios'
        }),
        ('🚌 Transporte Público', {
            'fields': ('rutas_transporte_publico', 'parada_bus_cercana', 'distancia_parada'),
            'description': 'Información de cómo llegar en bus/MIO'
        }),
        ('👨‍👩‍👧‍👦 Servicios Familiares', {
            'fields': ('acepta_ninos', 'tiene_silla_bebes', 'tiene_area_infantil', 'permite_llevar_comida'),
        }),
        ('♿ Accesibilidad', {
            'fields': ('accesible_silla_ruedas', 'tiene_rampa', 'tiene_banos'),
        }),
        ('Servicios y Multimedia', {
            'fields': ('servicios_adicionales', 'foto_principal')
        }),
        ('Metadata', {
            'fields': ('calificacion_display', 'fecha_creacion', 'fecha_modificacion', 'ultima_actualizacion_cupos'),
            'classes': ('collapse',)
        }),
    )
    
    def estado_badge(self, obj):
        """Mostrar badge de estado con colores"""
        if obj.estado_activo:
            if obj.esta_abierto_ahora:
                return format_html(
                    '<span style="background-color: #28a745; color: white; '
                    'padding: 3px 10px; border-radius: 3px;">🟢 Abierto</span>'
                )
            else:
                return format_html(
                    '<span style="background-color: #ffc107; color: black; '
                    'padding: 3px 10px; border-radius: 3px;">⏸️ Cerrado</span>'
                )
        return format_html(
            '<span style="background-color: #dc3545; color: white; '
            'padding: 3px 10px; border-radius: 3px;">❌ Inactivo</span>'
        )
    estado_badge.short_description = 'Estado'
    
    def horario_completo(self, obj):
        """Mostrar horario completo"""
        return f"{obj.horario_apertura.strftime('%H:%M')} - {obj.horario_cierre.strftime('%H:%M')}"
    horario_completo.short_description = 'Horario'
    
    def calificacion_display(self, obj):
        """Mostrar calificación con estrellas"""
        calificacion = obj.calificacion_promedio()
        estrellas = '⭐' * int(calificacion)
        return f"{estrellas} ({calificacion}/5)"
    calificacion_display.short_description = 'Calificación'
    
    def precio_display(self, obj):
        """Mostrar precio"""
        return obj.precio_texto
    precio_display.short_description = 'Precio'
    
    def cupos_display(self, obj):
        """Mostrar cupos con color"""
        estado = obj.estado_cupos
        if estado == 'disponible':
            color = '#28a745'
            icon = '✓'
        elif estado == 'pocos':
            color = '#ffc107'
            icon = '⚠️'
        else:
            color = '#dc3545'
            icon = '❌'
        
        return format_html(
            '<span style="color: {}; font-weight: 700;">{} {} cupos</span>',
            color, icon, obj.cupos_disponibles
        )
    cupos_display.short_description = 'Cupos'


@admin.register(MenuDiario)
class MenuDiarioAdmin(admin.ModelAdmin):
    """Admin para menús diarios"""
    list_display = [
        'comedor', 'fecha', 'tiene_desayuno', 'tiene_almuerzo',
        'tiene_cena', 'precio_almuerzo'
    ]
    list_filter = ['fecha', 'comedor']
    search_fields = ['comedor__nombre', 'almuerzo', 'desayuno', 'cena']
    date_hierarchy = 'fecha'
    
    fieldsets = (
        ('Información General', {
            'fields': ('comedor', 'fecha')
        }),
        ('Menú del Día', {
            'fields': (
                ('desayuno', 'precio_desayuno'),
                ('almuerzo', 'precio_almuerzo'),
                ('cena', 'precio_cena'),
            )
        }),
    )
    
    def tiene_desayuno(self, obj):
        return '✅' if obj.desayuno else '❌'
    tiene_desayuno.short_description = 'Desayuno'
    
    def tiene_almuerzo(self, obj):
        return '✅' if obj.almuerzo else '❌'
    tiene_almuerzo.short_description = 'Almuerzo'
    
    def tiene_cena(self, obj):
        return '✅' if obj.cena else '❌'
    tiene_cena.short_description = 'Cena'


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    """Admin para comentarios"""
    list_display = [
        'nombre_usuario', 'comedor', 'calificacion_estrellas',
        'fecha', 'aprobado_badge'
    ]
    list_filter = ['aprobado', 'calificacion', 'fecha']
    search_fields = ['nombre_usuario', 'comentario', 'comedor__nombre']
    readonly_fields = ['fecha']
    date_hierarchy = 'fecha'
    
    actions = ['aprobar_comentarios', 'rechazar_comentarios']
    
    fieldsets = (
        ('Usuario', {
            'fields': ('usuario', 'nombre_usuario')
        }),
        ('Comentario', {
            'fields': ('comedor', 'calificacion', 'comentario')
        }),
        ('Estado', {
            'fields': ('aprobado', 'fecha')
        }),
    )
    
    def calificacion_estrellas(self, obj):
        """Mostrar calificación con estrellas"""
        return '⭐' * obj.calificacion
    calificacion_estrellas.short_description = 'Calificación'
    
    def aprobado_badge(self, obj):
        """Badge de aprobación"""
        if obj.aprobado:
            return format_html(
                '<span style="background-color: #28a745; color: white; '
                'padding: 2px 8px; border-radius: 3px;">✓ Aprobado</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; '
            'padding: 2px 8px; border-radius: 3px;">✗ Pendiente</span>'
        )
    aprobado_badge.short_description = 'Estado'
    
    def aprobar_comentarios(self, request, queryset):
        """Acción para aprobar comentarios"""
        updated = queryset.update(aprobado=True)
        self.message_user(request, f'{updated} comentario(s) aprobado(s).')
    aprobar_comentarios.short_description = 'Aprobar comentarios seleccionados'
    
    def rechazar_comentarios(self, request, queryset):
        """Acción para rechazar comentarios"""
        updated = queryset.update(aprobado=False)
        self.message_user(request, f'{updated} comentario(s) rechazado(s).')
    rechazar_comentarios.short_description = 'Rechazar comentarios seleccionados'


@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    """Admin para favoritos"""
    list_display = ['usuario', 'comedor', 'fecha_agregado']
    list_filter = ['fecha_agregado']
    search_fields = ['usuario__username', 'comedor__nombre']
    date_hierarchy = 'fecha_agregado'

