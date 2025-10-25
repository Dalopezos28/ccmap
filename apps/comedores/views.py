"""
Views para la API REST de Comedores
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
from django.shortcuts import render
from math import radians, cos, sin, asin, sqrt
from .models import Comedor, MenuDiario, Comentario, Favorito, AlertaSuscripcion, Metrica, Donacion
from .serializers import (
    ComedorSerializer, ComedorDetalleSerializer, ComedorGeoJSONSerializer,
    MenuDiarioSerializer, ComentarioSerializer, AlertaSuscripcionSerializer,
    MetricaSerializer, DonacionSerializer
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

    @action(detail=False, methods=['get'])
    def network_graph(self, request):
        """
        Endpoint que retorna datos para el network graph
        Agrupa comedores por barrio y genera nodos y enlaces
        """
        # Agrupar por barrio/comuna
        barrios = Comedor.objects.filter(estado_activo=True).values('barrio').annotate(
            total_comedores=Count('id'),
            total_cupos=Sum('cupos_disponibles'),
            total_capacidad=Sum('capacidad_personas'),
            promedio_cupos=Avg('cupos_disponibles')
        ).order_by('-total_cupos')

        # Crear nodos (barrios)
        nodes = []
        node_id_map = {}

        for idx, barrio in enumerate(barrios):
            node_id = f"barrio_{idx}"
            node_id_map[barrio['barrio']] = node_id

            # Categorizar por tamaño de cupos
            if barrio['total_cupos'] >= 3000:
                categoria = 'muy_alto'
                color = '#e74c3c'  # Rojo
                size = 30
            elif barrio['total_cupos'] >= 2000:
                categoria = 'alto'
                color = '#e67e22'  # Naranja
                size = 25
            elif barrio['total_cupos'] >= 1000:
                categoria = 'medio'
                color = '#f39c12'  # Amarillo
                size = 20
            elif barrio['total_cupos'] >= 500:
                categoria = 'bajo'
                color = '#3498db'  # Azul
                size = 15
            else:
                categoria = 'muy_bajo'
                color = '#95a5a6'  # Gris
                size = 10

            nodes.append({
                'id': node_id,
                'label': barrio['barrio'],
                'type': 'barrio',
                'categoria': categoria,
                'total_comedores': barrio['total_comedores'],
                'total_cupos': barrio['total_cupos'],
                'total_capacidad': barrio['total_capacidad'],
                'promedio_cupos': round(barrio['promedio_cupos'], 1),
                'color': color,
                'size': size,
                'x': None,  # Se calculará en frontend
                'y': None
            })

        # Crear enlaces entre barrios basados en proximidad de cupos
        links = []
        barrios_list = list(barrios)

        for i, barrio1 in enumerate(barrios_list):
            for j, barrio2 in enumerate(barrios_list):
                if i < j:  # Evitar duplicados
                    # Conectar barrios con cupos similares
                    diff_cupos = abs(barrio1['total_cupos'] - barrio2['total_cupos'])

                    # Si la diferencia es menor al 50% del mayor, crear enlace
                    max_cupos = max(barrio1['total_cupos'], barrio2['total_cupos'])
                    if diff_cupos < (max_cupos * 0.5):
                        strength = 1 - (diff_cupos / max_cupos)

                        links.append({
                            'source': node_id_map[barrio1['barrio']],
                            'target': node_id_map[barrio2['barrio']],
                            'value': strength,
                            'tipo': 'similitud_cupos'
                        })

        # Agregar nodos de comedores individuales para los top 20
        top_comedores = Comedor.objects.filter(estado_activo=True).order_by('-cupos_disponibles')[:20]

        for comedor in top_comedores:
            node_id = f"comedor_{comedor.id}"

            # Color por tipo de comida
            color_map = {
                'CASERA': '#2ecc71',
                'VEGETARIANA': '#27ae60',
                'VEGANA': '#16a085',
                'MIXTA': '#3498db',
                'TIPICA': '#9b59b6',
                'INTERNACIONAL': '#34495e'
            }

            nodes.append({
                'id': node_id,
                'label': comedor.nombre[:30] + '...' if len(comedor.nombre) > 30 else comedor.nombre,
                'type': 'comedor',
                'categoria': 'destacado',
                'cupos': comedor.cupos_disponibles,
                'capacidad': comedor.capacidad_personas,
                'barrio': comedor.barrio,
                'tipo_comida': comedor.tipo_comida,
                'color': color_map.get(comedor.tipo_comida, '#95a5a6'),
                'size': 8 + (comedor.cupos_disponibles / 20),  # Tamaño proporcional a cupos
                'x': None,
                'y': None
            })

            # Conectar comedor con su barrio
            if comedor.barrio in node_id_map:
                links.append({
                    'source': node_id,
                    'target': node_id_map[comedor.barrio],
                    'value': comedor.cupos_disponibles / 100,
                    'tipo': 'pertenece_a'
                })

        # Estadísticas globales
        stats = {
            'total_barrios': len(barrios),
            'total_comedores_activos': Comedor.objects.filter(estado_activo=True).count(),
            'total_cupos_sistema': sum(b['total_cupos'] for b in barrios),
            'promedio_comedores_por_barrio': round(sum(b['total_comedores'] for b in barrios) / len(barrios), 1) if barrios else 0
        }

        return Response({
            'nodes': nodes,
            'links': links,
            'stats': stats,
            'leyenda': {
                'categorias': [
                    {'nombre': 'Muy Alto', 'color': '#e74c3c', 'rango': '3000+ cupos'},
                    {'nombre': 'Alto', 'color': '#e67e22', 'rango': '2000-3000 cupos'},
                    {'nombre': 'Medio', 'color': '#f39c12', 'rango': '1000-2000 cupos'},
                    {'nombre': 'Bajo', 'color': '#3498db', 'rango': '500-1000 cupos'},
                    {'nombre': 'Muy Bajo', 'color': '#95a5a6', 'rango': '<500 cupos'}
                ],
                'tipos_comida': [
                    {'nombre': 'Casera', 'color': '#2ecc71'},
                    {'nombre': 'Vegetariana', 'color': '#27ae60'},
                    {'nombre': 'Vegana', 'color': '#16a085'},
                    {'nombre': 'Mixta', 'color': '#3498db'},
                    {'nombre': 'Típica', 'color': '#9b59b6'},
                    {'nombre': 'Internacional', 'color': '#34495e'}
                ]
            }
        })


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


class AlertaSuscripcionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para suscripciones de alertas
    Permite a usuarios suscribirse a notificaciones por WhatsApp/SMS
    """
    queryset = AlertaSuscripcion.objects.all()
    serializer_class = AlertaSuscripcionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'telefono', 'barrios_interes']
    ordering = ['-fecha_suscripcion']

    def get_queryset(self):
        """Filtrar suscripciones"""
        queryset = super().get_queryset()

        # Filtrar por activas
        activa = self.request.query_params.get('activa', None)
        if activa is not None:
            activa_bool = activa.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activa=activa_bool)

        # Filtrar por tipo de alerta
        tipo_alerta = self.request.query_params.get('tipo_alerta', None)
        if tipo_alerta:
            queryset = queryset.filter(tipo_alerta=tipo_alerta)

        # Filtrar por canal
        canal = self.request.query_params.get('canal', None)
        if canal:
            queryset = queryset.filter(canal_preferido=canal)

        return queryset

    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activar una suscripción"""
        suscripcion = self.get_object()
        suscripcion.activa = True
        suscripcion.save()
        serializer = self.get_serializer(suscripcion)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactivar una suscripción"""
        suscripcion = self.get_object()
        suscripcion.activa = False
        suscripcion.save()
        serializer = self.get_serializer(suscripcion)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_barrio(self, request):
        """Obtener suscripciones agrupadas por barrio"""
        barrios_stats = []

        # Obtener todos los barrios únicos de las suscripciones
        suscripciones = AlertaSuscripcion.objects.filter(activa=True)

        barrios_set = set()
        for suscripcion in suscripciones:
            if suscripcion.barrios_interes:
                barrios = [b.strip() for b in suscripcion.barrios_interes.split(',')]
                barrios_set.update(barrios)

        for barrio in barrios_set:
            count = suscripciones.filter(barrios_interes__icontains=barrio).count()
            barrios_stats.append({
                'barrio': barrio,
                'total_suscripciones': count
            })

        return Response(sorted(barrios_stats, key=lambda x: x['total_suscripciones'], reverse=True))


class MetricaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para métricas y estadísticas
    Proporciona datos para dashboards y reportes
    """
    queryset = Metrica.objects.all()
    serializer_class = MetricaSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-fecha']

    def get_queryset(self):
        """Filtrar métricas por parámetros"""
        queryset = super().get_queryset()

        # Filtrar por comedor
        comedor_id = self.request.query_params.get('comedor', None)
        if comedor_id:
            queryset = queryset.filter(comedor_id=comedor_id)

        # Filtrar por tipo de métrica
        tipo_metrica = self.request.query_params.get('tipo_metrica', None)
        if tipo_metrica:
            queryset = queryset.filter(tipo_metrica=tipo_metrica)

        # Filtrar por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)

        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)

        return queryset

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Endpoint para obtener estadísticas globales
        Usado en dashboard principal
        """
        from datetime import timedelta

        hoy = timezone.now().date()
        hace_7_dias = hoy - timedelta(days=7)
        hace_30_dias = hoy - timedelta(days=30)

        # Métricas del día
        metricas_hoy = Metrica.objects.filter(fecha=hoy)

        # Métricas de la semana
        metricas_semana = Metrica.objects.filter(fecha__gte=hace_7_dias, fecha__lte=hoy)

        # Métricas del mes
        metricas_mes = Metrica.objects.filter(fecha__gte=hace_30_dias, fecha__lte=hoy)

        stats = {
            'hoy': {
                'comidas_servidas': metricas_hoy.filter(tipo_metrica='COMIDAS_SERVIDAS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'cupos_ocupados': metricas_hoy.filter(tipo_metrica='CUPOS_OCUPADOS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'usuarios_atendidos': metricas_hoy.filter(tipo_metrica='USUARIOS_ATENDIDOS').aggregate(Sum('valor'))['valor__sum'] or 0,
            },
            'semana': {
                'comidas_servidas': metricas_semana.filter(tipo_metrica='COMIDAS_SERVIDAS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'cupos_ocupados': metricas_semana.filter(tipo_metrica='CUPOS_OCUPADOS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'usuarios_atendidos': metricas_semana.filter(tipo_metrica='USUARIOS_ATENDIDOS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'donaciones_recibidas': metricas_semana.filter(tipo_metrica='DONACIONES_RECIBIDAS').aggregate(Sum('valor'))['valor__sum'] or 0,
            },
            'mes': {
                'comidas_servidas': metricas_mes.filter(tipo_metrica='COMIDAS_SERVIDAS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'cupos_ocupados': metricas_mes.filter(tipo_metrica='CUPOS_OCUPADOS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'usuarios_atendidos': metricas_mes.filter(tipo_metrica='USUARIOS_ATENDIDOS').aggregate(Sum('valor'))['valor__sum'] or 0,
                'donaciones_recibidas': metricas_mes.filter(tipo_metrica='DONACIONES_RECIBIDAS').aggregate(Sum('valor'))['valor__sum'] or 0,
            }
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def ultimos_7_dias(self, request):
        """
        Endpoint para gráficos de evolución temporal
        Retorna datos de los últimos 7 días
        """
        from datetime import timedelta

        hoy = timezone.now().date()
        hace_7_dias = hoy - timedelta(days=7)

        # Obtener métricas por día
        metricas = Metrica.objects.filter(
            fecha__gte=hace_7_dias,
            fecha__lte=hoy
        ).values('fecha', 'tipo_metrica').annotate(
            total=Sum('valor')
        ).order_by('fecha')

        # Organizar por tipo de métrica
        datos_por_tipo = {}
        for metrica in metricas:
            tipo = metrica['tipo_metrica']
            if tipo not in datos_por_tipo:
                datos_por_tipo[tipo] = []

            datos_por_tipo[tipo].append({
                'fecha': metrica['fecha'],
                'valor': metrica['total']
            })

        return Response(datos_por_tipo)

    @action(detail=False, methods=['get'])
    def por_comedor(self, request):
        """
        Endpoint para ranking de comedores
        Top 10 comedores por tipo de métrica
        """
        tipo_metrica = request.query_params.get('tipo_metrica', 'COMIDAS_SERVIDAS')
        limite = int(request.query_params.get('limite', 10))

        # Agregar por comedor
        ranking = Metrica.objects.filter(
            tipo_metrica=tipo_metrica,
            comedor__isnull=False
        ).values('comedor__id', 'comedor__nombre').annotate(
            total=Sum('valor')
        ).order_by('-total')[:limite]

        return Response(list(ranking))


class DonacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para donaciones
    Gestiona el flujo completo de donaciones con matching automático
    """
    queryset = Donacion.objects.all()
    serializer_class = DonacionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre_donante', 'descripcion', 'barrio_donante']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """Filtrar donaciones por parámetros"""
        queryset = super().get_queryset()

        # Filtrar por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)

        # Filtrar por tipo
        tipo_donacion = self.request.query_params.get('tipo_donacion', None)
        if tipo_donacion:
            queryset = queryset.filter(tipo_donacion=tipo_donacion)

        # Filtrar por comedor asignado
        comedor_id = self.request.query_params.get('comedor', None)
        if comedor_id:
            queryset = queryset.filter(comedor_asignado_id=comedor_id)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Crear donación y opcionalmente asignar comedor automáticamente
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donacion = serializer.save()

        # Si hay coordenadas, asignar automáticamente
        if donacion.latitud_donante and donacion.longitud_donante:
            comedor = donacion.asignar_comedor_cercano()
            if comedor:
                donacion.comedor_asignado = comedor
                donacion.estado = 'ASIGNADA'
                donacion.fecha_asignacion = timezone.now()
                donacion.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(donacion).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'])
    def asignar_automaticamente(self, request, pk=None):
        """
        Asignar donación a comedor más cercano manualmente
        """
        donacion = self.get_object()

        if donacion.estado != 'PENDIENTE':
            return Response(
                {'error': 'La donación ya fue asignada o entregada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comedor = donacion.asignar_comedor_cercano()

        if not comedor:
            return Response(
                {'error': 'No se pudo encontrar un comedor cercano. Verifique que la donación tenga coordenadas.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donacion.comedor_asignado = comedor
        donacion.estado = 'ASIGNADA'
        donacion.fecha_asignacion = timezone.now()
        donacion.save()

        serializer = self.get_serializer(donacion)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def marcar_en_transito(self, request, pk=None):
        """Marcar donación como en tránsito"""
        donacion = self.get_object()
        donacion.estado = 'EN_TRANSITO'
        donacion.save()
        serializer = self.get_serializer(donacion)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def marcar_entregada(self, request, pk=None):
        """Marcar donación como entregada"""
        donacion = self.get_object()
        donacion.estado = 'ENTREGADA'
        donacion.fecha_entrega_real = timezone.now().date()
        donacion.save()
        serializer = self.get_serializer(donacion)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas de donaciones"""
        from datetime import timedelta

        hoy = timezone.now().date()
        hace_30_dias = hoy - timedelta(days=30)

        # Totales
        total_donaciones = Donacion.objects.count()
        total_entregadas = Donacion.objects.filter(estado='ENTREGADA').count()
        total_pendientes = Donacion.objects.filter(estado='PENDIENTE').count()

        # Del mes actual
        donaciones_mes = Donacion.objects.filter(fecha_creacion__gte=hace_30_dias)

        # Por tipo
        por_tipo = Donacion.objects.values('tipo_donacion').annotate(
            total=Count('id')
        ).order_by('-total')

        # Valor monetario total
        valor_total = Donacion.objects.filter(
            valor_monetario__isnull=False
        ).aggregate(Sum('valor_monetario'))['valor_monetario__sum'] or 0

        # Peso total de alimentos
        peso_total = Donacion.objects.filter(
            cantidad_estimada_kg__isnull=False
        ).aggregate(Sum('cantidad_estimada_kg'))['cantidad_estimada_kg__sum'] or 0

        stats = {
            'total_donaciones': total_donaciones,
            'total_entregadas': total_entregadas,
            'total_pendientes': total_pendientes,
            'donaciones_mes': donaciones_mes.count(),
            'por_tipo': list(por_tipo),
            'valor_monetario_total': float(valor_total),
            'peso_total_kg': float(peso_total),
        }

        return Response(stats)



def dashboard_view(request):
    """
    Vista para renderizar el dashboard con gráficos de Chart.js
    """
    return render(request, 'dashboard.html')
