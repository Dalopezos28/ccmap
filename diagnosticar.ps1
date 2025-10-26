# Script de diagnóstico para el mapa de comedores
Write-Host "=== DIAGNÓSTICO DEL MAPA DE COMEDORES ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si el servidor está corriendo
Write-Host "1. Verificando servidores Django..." -ForegroundColor Yellow
$django8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$django8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue

if ($django8000) {
    Write-Host "   ✓ Servidor corriendo en puerto 8000" -ForegroundColor Green
    $port = 8000
} elseif ($django8080) {
    Write-Host "   ✓ Servidor corriendo en puerto 8080" -ForegroundColor Green
    $port = 8080
} else {
    Write-Host "   ✗ NO HAY SERVIDOR CORRIENDO" -ForegroundColor Red
    Write-Host "   Causa: El servidor Django no está iniciado" -ForegroundColor Red
    Write-Host ""
    Write-Host "   SOLUCIÓN: Ejecuta esto en PowerShell:" -ForegroundColor Yellow
    Write-Host "   python manage.py runserver 8080" -ForegroundColor White
    Write-Host ""
    exit
}

# 2. Probar el endpoint de la API
Write-Host ""
Write-Host "2. Probando endpoint /api/comedores/geojson/..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/api/comedores/geojson/" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ API responde correctamente" -ForegroundColor Green
        Write-Host "   ✓ Comedores encontrados: $($data.features.Count)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ ERROR: API no responde" -ForegroundColor Red
    Write-Host "   Causa: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   PROBLEMA ENCONTRADO:" -ForegroundColor Yellow
    Write-Host "   - El servidor está corriendo pero el endpoint no responde" -ForegroundColor White
    Write-Host "   - Puede haber un error en la base de datos" -ForegroundColor White
    Write-Host ""
    Write-Host "   SOLUCIÓN: Ejecuta:" -ForegroundColor Yellow
    Write-Host "   python manage.py migrate" -ForegroundColor White
    Write-Host ""
    exit
}

# 3. Verificar página principal
Write-Host ""
Write-Host "3. Probando página principal..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Página principal carga correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ ERROR: Página principal no responde" -ForegroundColor Red
    Write-Host "   Causa: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Resumen
Write-Host ""
Write-Host "=== RESULTADO ===" -ForegroundColor Cyan
Write-Host "✓ El servidor está funcionando correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Abre el navegador en: http://localhost:$port/" -ForegroundColor Green
Write-Host ""
Write-Host "Si el mapa TODAVÍA se queda cargando:" -ForegroundColor Yellow
Write-Host "1. Abre la consola del navegador (F12)" -ForegroundColor White
Write-Host "2. Ve a la pestaña 'Console'" -ForegroundColor White
Write-Host "3. Busca errores en rojo" -ForegroundColor White
Write-Host "4. Copia el error y compártelo" -ForegroundColor White
Write-Host ""
