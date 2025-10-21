#!/bin/bash
# Script de instalación automática para Linux/macOS

echo "========================================"
echo "  INSTALADOR - Comedores Cali"
echo "========================================"
echo ""

echo "[1/7] Creando entorno virtual..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudo crear el entorno virtual"
    exit 1
fi
echo "✓ Entorno virtual creado"

echo ""
echo "[2/7] Activando entorno virtual..."
source venv/bin/activate
echo "✓ Entorno virtual activado"

echo ""
echo "[3/7] Instalando dependencias..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudieron instalar las dependencias"
    exit 1
fi
echo "✓ Dependencias instaladas"

echo ""
echo "[4/7] Aplicando migraciones..."
python manage.py makemigrations
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Error al aplicar migraciones"
    echo "Asegúrate de que PostgreSQL con PostGIS esté configurado"
    exit 1
fi
echo "✓ Migraciones aplicadas"

echo ""
echo "[5/7] Creando superusuario..."
echo "NOTA: Se te pedirá crear un usuario administrador"
python manage.py createsuperuser

echo ""
echo "[6/7] Poblando base de datos con datos de ejemplo..."
echo "NOTA: Cuando se pregunte, escribe 's' para confirmar"
python manage.py poblar_comedores
echo "✓ Datos de ejemplo creados"

echo ""
echo "[7/7] Colectando archivos estáticos..."
python manage.py collectstatic --noinput
echo "✓ Archivos estáticos colectados"

echo ""
echo "========================================"
echo "  INSTALACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "Para iniciar el servidor, ejecuta:"
echo "  python manage.py runserver"
echo ""
echo "Luego abre tu navegador en:"
echo "  http://localhost:8000"
echo ""
echo "Panel admin:"
echo "  http://localhost:8000/admin"
echo ""

