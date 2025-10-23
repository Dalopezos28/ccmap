"""
Serializers para la API REST de Comedores
"""
from rest_framework import serializers
# from rest_framework_gis.serializers import GeoFeatureModelSerializer  # No necesario con SQLite
from .models import Comedor, MenuDiario, Comentario, Favorito


class MenuDiarioSerializer(serializers.ModelSerializer):
    """Serializer para el menú diario"""
    
    class Meta:
        model = MenuDiario
        fields = [
            'id', 'fecha', 'desayuno', 'almuerzo', 'cena',
            'precio_desayuno', 'precio_almuerzo', 'precio_cena'
        ]


class ComentarioSerializer(serializers.ModelSerializer):
    """Serializer para comentarios"""
    usuario_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Comentario
        fields = [
            'id', 'nombre_usuario', 'usuario_display', 'calificacion',
            'comentario', 'fecha', 'aprobado'
        ]
        read_only_fields = ['fecha']
    
    def get_usuario_display(self, obj):
        """Obtener nombre del usuario registrado o el nombre manual"""
        if obj.usuario:
            return obj.usuario.username
        return obj.nombre_usuario


class ComedorSerializer(serializers.ModelSerializer):
    """Serializer básico para Comedor"""
    latitud = serializers.SerializerMethodField()
    longitud = serializers.SerializerMethodField()
    esta_abierto = serializers.SerializerMethodField()
    calificacion_promedio = serializers.SerializerMethodField()
    menu_hoy = serializers.SerializerMethodField()
    comentarios_recientes = serializers.SerializerMethodField()
    estado_cupos = serializers.SerializerMethodField()
    precio_texto = serializers.SerializerMethodField()
    telefono_limpio = serializers.SerializerMethodField()
    whatsapp_link = serializers.SerializerMethodField()
    
    class Meta:
        model = Comedor
        fields = [
            'id', 'nombre', 'descripcion', 'direccion', 'barrio',
            'latitud', 'longitud', 'telefono', 'celular', 'email', 'whatsapp',
            'capacidad_personas', 'horario_apertura', 'horario_cierre',
            'dias_atencion', 'tipo_comida', 'servicios_adicionales',
            'foto_principal', 'estado_activo', 'esta_abierto',
            'calificacion_promedio', 'menu_hoy', 'comentarios_recientes',
            # Nuevos campos sociales
            'es_gratuito', 'precio_subsidiado', 'requisitos_acceso',
            'cupos_disponibles', 'cola_estimada', 'estado_cupos',
            'acepta_ninos', 'tiene_silla_bebes', 'permite_llevar_comida', 'tiene_area_infantil',
            'accesible_silla_ruedas', 'tiene_banos', 'tiene_rampa',
            'rutas_transporte_publico', 'parada_bus_cercana', 'distancia_parada',
            'precio_texto', 'telefono_limpio', 'whatsapp_link',
            'fecha_creacion'
        ]
    
    def get_latitud(self, obj):
        """Obtener latitud desde Point field"""
        return obj.latitud
    
    def get_longitud(self, obj):
        """Obtener longitud desde Point field"""
        return obj.longitud
    
    def get_esta_abierto(self, obj):
        """Verificar si está abierto ahora"""
        return obj.esta_abierto_ahora
    
    def get_calificacion_promedio(self, obj):
        """Obtener calificación promedio"""
        return obj.calificacion_promedio()
    
    def get_menu_hoy(self, obj):
        """Obtener menú del día actual"""
        from django.utils import timezone
        menu = obj.menus.filter(fecha=timezone.now().date()).first()
        if menu:
            return MenuDiarioSerializer(menu).data
        return None
    
    def get_comentarios_recientes(self, obj):
        """Obtener últimos 3 comentarios aprobados"""
        comentarios = obj.comentarios.filter(aprobado=True)[:3]
        return ComentarioSerializer(comentarios, many=True).data
    
    def get_estado_cupos(self, obj):
        """Estado de disponibilidad de cupos"""
        return obj.estado_cupos
    
    def get_precio_texto(self, obj):
        """Texto del precio formateado"""
        return obj.precio_texto
    
    def get_telefono_limpio(self, obj):
        """Teléfono sin caracteres especiales"""
        return obj.telefono_limpio
    
    def get_whatsapp_link(self, obj):
        """Link de WhatsApp"""
        return obj.whatsapp_link


class ComedorGeoJSONSerializer(serializers.ModelSerializer):
    """
    Serializer GeoJSON para usar con Leaflet
    Formato manual de GeoJSON
    """
    esta_abierto = serializers.SerializerMethodField()
    calificacion_promedio = serializers.SerializerMethodField()
    estado_cupos = serializers.SerializerMethodField()
    precio_texto = serializers.SerializerMethodField()
    
    class Meta:
        model = Comedor
        fields = [
            'id', 'nombre', 'descripcion', 'direccion', 'barrio',
            'latitud', 'longitud',
            'telefono', 'celular', 'email', 'whatsapp', 'capacidad_personas',
            'horario_apertura', 'horario_cierre', 'dias_atencion',
            'tipo_comida', 'servicios_adicionales', 'foto_principal',
            'estado_activo', 'esta_abierto', 'calificacion_promedio',
            'es_gratuito', 'cupos_disponibles', 'estado_cupos', 'precio_texto',
            'acepta_ninos', 'permite_llevar_comida', 'accesible_silla_ruedas'
        ]
    
    def get_esta_abierto(self, obj):
        return obj.esta_abierto_ahora
    
    def get_calificacion_promedio(self, obj):
        return obj.calificacion_promedio()
    
    def get_estado_cupos(self, obj):
        return obj.estado_cupos
    
    def get_precio_texto(self, obj):
        return obj.precio_texto


class ComedorDetalleSerializer(ComedorSerializer):
    """Serializer detallado con todos los menús y comentarios"""
    menus = MenuDiarioSerializer(many=True, read_only=True)
    comentarios = serializers.SerializerMethodField()
    
    class Meta(ComedorSerializer.Meta):
        fields = ComedorSerializer.Meta.fields + ['menus', 'comentarios']
    
    def get_comentarios(self, obj):
        """Obtener todos los comentarios aprobados"""
        comentarios = obj.comentarios.filter(aprobado=True)
        return ComentarioSerializer(comentarios, many=True).data

