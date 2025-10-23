# Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

## [1.0.0] - 2024-10-20

### Agregado
- Mapa interactivo con Leaflet.js centrado en Cali, Colombia
- Sistema de marcadores personalizados con animaciones
- Clustering dinámico de marcadores
- Modal interactivo con información detallada de comedores
- Sistema de filtros avanzados (estado, tipo, calificación, radio)
- Búsqueda por nombre y barrio
- Geolocalización del usuario
- Búsqueda de comedores cercanos
- Integración con Google Maps para direcciones
- Sistema de calificaciones y comentarios
- Panel de administración personalizado con soporte GIS
- API REST completa con Django REST Framework
- Modelos con soporte PostGIS para datos geoespaciales
- Comando management para poblar datos de ejemplo
- Diseño responsive para móviles y tablets
- Tema oscuro tipo videojuego con colores neón
- Animaciones y transiciones CSS suaves
- Notificaciones toast
- Sidebar colapsable
- Tests básicos para modelos

### Características Técnicas
- Django 4.2.7
- PostgreSQL con PostGIS
- Django REST Framework
- WhiteNoise para archivos estáticos
- CORS configurado
- Settings modulares (development/production)
- Variables de entorno con python-dotenv
- Logging configurado

### Documentación
- README.md completo con instrucciones detalladas
- INSTALACION_RAPIDA.md para setup rápido
- Scripts de instalación para Windows y Linux/macOS
- Notas de desarrollo
- Licencia MIT

### Seguridad
- Protección CSRF
- Validación de coordenadas
- Moderación de comentarios
- Headers de seguridad básicos

## [Próximas Versiones]

### Planeado para v1.1.0
- [ ] Sistema de autenticación de usuarios
- [ ] Perfil de usuario con favoritos funcional
- [ ] Subida de fotos por usuarios
- [ ] Sistema de valoraciones más detallado
- [ ] Exportar datos a PDF/Excel

### Planeado para v1.2.0
- [ ] Notificaciones push
- [ ] Chat en vivo con comedores
- [ ] Sistema de reservas
- [ ] Modo offline con service workers

### Planeado para v2.0.0
- [ ] App móvil nativa
- [ ] Múltiples idiomas (i18n)
- [ ] Integración con pagos en línea
- [ ] Sistema de delivery

---

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

