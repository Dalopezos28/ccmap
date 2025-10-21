"""
Views para la API REST de Comedores
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Avg
from math import radians, cos, sin, asin, sqrt
from .models import Comedor, MenuDiario, Comentario, Favorito
from .serializers import (
    ComedorSerializer, ComedorDetalleSerializer, ComedorGeoJSONSerializer,
    MenuDiarioSerializer, ComentarioSerializer
)


class ComedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de comedores
    """
    queryset = Comedor.objects.filter(estado_activo=True)
    serializer_class = ComedorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'direccion', 'barrio']
    ordering_fields = ['nombre', 'fecha_creacion']
    ordering = ['nombre']
    
    def get_serializer_class(self):
        """Usar serializer detallado para retrieve"""
        if self.action == 'retrieve':
            return ComedorDetalleSerializer
        elif self.action == 'geojson':
            return ComedorGeoJSONSerializer
        return ComedorSerializer
    
    def get_queryset(self):
        """
        Filtrar comedores según parámetros de query
        """
        queryset = super().get_queryset()
        
        # Filtrar por estado (abierto/cerrado)
        estado = self.request.query_params.get('estado', None)
        if estado == 'abierto':
            # Filtrar comedores abiertos ahora
            ahora = timezone.now()
            hora_actual = ahora.time()
            dia_semana = ahora.weekday()
            
            queryset = queryset.filter(
                horario_apertura__lte=hora_actual,
                horario_cierre__gte=hora_actual
            )
            
            # Filtrar por día de la semana
            if dia_semana < 5:  # Lunes a Viernes
                queryset = queryset.filter(
                    Q(dias_atencion__in=['LU-VI', 'LU-SA', 'LU-DO', 'TODOS'])
                )
            elif dia_semana == 5:  # Sábado
                queryset = queryset.filter(
                    Q(dias_atencion__in=['LU-SA', 'LU-DO', 'MA-SA', 'TODOS'])
                )
            else:  # Domingo
                queryset = queryset.filter(
                    Q(dias_atencion__in=['LU-DO', 'TODOS'])
                )
        
        # Filtrar por tipo de comida
        tipo_comida = self.request.query_params.get('tipo_comida', None)
        if tipo_comida:
            queryset = queryset.filter(tipo_comida=tipo_comida)
        
        # Filtrar por barrio
        barrio = self.request.query_params.get('barrio', None)
        if barrio:
            queryset = queryset.filter(barrio__icontains=barrio)
        
        # Filtrar por calificación mínima
        calificacion_min = self.request.query_params.get('calificacion_min', None)
        if calificacion_min:
            try:
                cal_min = float(calificacion_min)
                # Esto requeriría una anotación más compleja
                # Por ahora filtramos en el serializer
            except ValueError:
                pass
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """
        Endpoint que retorna todos los comedores en formato GeoJSON
        para usar directamente con Leaflet
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Construir GeoJSON manualmente
        features = []
        for comedor in queryset:
            feature = {
                'type': 'Feature',
                'id': comedor.id,
                'geometry': {
                    'type': 'Point',
                    'coordinates': [comedor.longitud, comedor.latitud]
                },
                'properties': {
                    'id': comedor.id,
                    'nombre': comedor.nombre,
                    'descripcion': comedor.descripcion,
                    'direccion': comedor.direccion,
                    'barrio': comedor.barrio,
                    'telefono': comedor.telefono,
                    'celular': comedor.celular,
                    'email': comedor.email,
                    'whatsapp': comedor.whatsapp,
                    'capacidad_personas': comedor.capacidad_personas,
                    'horario_apertura': str(comedor.horario_apertura),
                    'horario_cierre': str(comedor.horario_cierre),
                    'dias_atencion': comedor.dias_atencion,
                    'tipo_comida': comedor.tipo_comida,
                    'servicios_adicionales': comedor.servicios_adicionales,
                    'foto_principal': comedor.foto_principal.url if comedor.foto_principal else None,
                    'estado_activo': comedor.estado_activo,
                    'esta_abierto': comedor.esta_abierto_ahora,
                    'calificacion_promedio': comedor.calificacion_promedio(),
                    # Nuevos campos sociales
                    'es_gratuito': comedor.es_gratuito,
                    'precio_texto': comedor.precio_texto,
                    'cupos_disponibles': comedor.cupos_disponibles,
                    'estado_cupos': comedor.estado_cupos,
                    'cola_estimada': comedor.cola_estimada,
                    'requisitos_acceso': comedor.requisitos_acceso,
                    'acepta_ninos': comedor.acepta_ninos,
                    'permite_llevar_comida': comedor.permite_llevar_comida,
                    'tiene_silla_bebes': comedor.tiene_silla_bebes,
                    'tiene_area_infantil': comedor.tiene_area_infantil,
                    'accesible_silla_ruedas': comedor.accesible_silla_ruedas,
                    'tiene_banos': comedor.tiene_banos,
                    'tiene_rampa': comedor.tiene_rampa,
                    'rutas_transporte_publico': comedor.rutas_transporte_publico,
                    'parada_bus_cercana': comedor.parada_bus_cercana,
                    'distancia_parada': comedor.distancia_parada,
                    'telefono_limpio': comedor.telefono_limpio,
                    'whatsapp_link': comedor.whatsapp_link,
                }
            }
            features.append(feature)
        
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        return Response(geojson)
    
    @action(detail=False, methods=['get'])
    def cercanos(self, request):
        """
        Obtener comedores cercanos a una ubicación
        Query params: lat, lng, radio (en km, default 5)
        """
        lat = request.query_params.get('lat', None)
        lng = request.query_params.get('lng', None)
        radio = float(request.query_params.get('radio', 5))  # km
        
        if not lat or not lng:
            return Response(
                {'error': 'Se requieren parámetros lat y lng'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {'error': 'Coordenadas inválidas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calcular distancia usando fórmula haversine
        comedores_cercanos = []
        for comedor in Comedor.objects.filter(estado_activo=True):
            distancia = haversine(lat, lng, comedor.latitud, comedor.longitud)
            if distancia <= radio:
                comedores_cercanos.append(comedor)
        
        serializer = self.get_serializer(comedores_cercanos, many=True)
        return Response(serializer.data)


def haversine(lat1, lon1, lat2, lon2):
    """
    Calcular la distancia entre dos puntos en la Tierra usando la fórmula de Haversine
    Retorna la distancia en kilómetros
    """
    # Convertir grados a radianes
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Fórmula de Haversine
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radio de la Tierra en kilómetros
    r = 6371
    
    return c * r
    
    @action(detail=True, methods=['post'])
    def agregar_comentario(self, request, pk=None):
        """
        Agregar comentario a un comedor
        """
        comedor = self.get_object()
        serializer = ComentarioSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(comedor=comedor, usuario=request.user if request.user.is_authenticated else None)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MenuDiarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para menús diarios
    """
    queryset = MenuDiario.objects.all()
    serializer_class = MenuDiarioSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-fecha']
    
    def get_queryset(self):
        """Filtrar por comedor si se especifica"""
        queryset = super().get_queryset()
        comedor_id = self.request.query_params.get('comedor', None)
        
        if comedor_id:
            queryset = queryset.filter(comedor_id=comedor_id)
        
        # Filtrar por fecha
        fecha = self.request.query_params.get('fecha', None)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def hoy(self, request):
        """Obtener menús del día actual"""
        hoy = timezone.now().date()
        queryset = self.get_queryset().filter(fecha=hoy)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ComentarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para comentarios
    """
    queryset = Comentario.objects.filter(aprobado=True)
    serializer_class = ComentarioSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-fecha']
    
    def get_queryset(self):
        """Filtrar por comedor si se especifica"""
        queryset = super().get_queryset()
        comedor_id = self.request.query_params.get('comedor', None)
        
        if comedor_id:
            queryset = queryset.filter(comedor_id=comedor_id)
        
        return queryset

