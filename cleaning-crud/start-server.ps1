# Script para iniciar el servidor rápidamente

Write-Host "🧹 Iniciando Cleaning CRUD con SQLite..." -ForegroundColor Green
Write-Host ""

$npmCmd = "C:\Program Files\nodejs\npm.cmd"

# Verificar que Node.js está disponible
if (-not (Test-Path $npmCmd)) {
    Write-Host "❌ npm no encontrado en: $npmCmd" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Por favor, ejecuta primero:" -ForegroundColor Yellow
    Write-Host "   .\add-node-to-path.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O descarga Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Verificando dependencias..." -ForegroundColor Cyan

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado" -ForegroundColor Yellow
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    & $npmCmd install
    Write-Host ""
}

Write-Host "✅ Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Información del Servidor:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Puerto: 3001" -ForegroundColor Yellow
Write-Host "URL: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Base de Datos: SQLite (database.sqlite)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Espera el siguiente mensaje:" -ForegroundColor Yellow
Write-Host "  '✅ Base de datos con X productos existentes'" -ForegroundColor Green
Write-Host "  '🧹 Cleaning CRUD running on http://localhost:3001'" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener el servidor: Presiona Ctrl + C" -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor
& $npmCmd run start:dev

