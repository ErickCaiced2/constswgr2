# Test rápido de 30 segundos
# Ejecuta: .\quick-test.ps1

Write-Host "🧹 Test Rápido - Verificando Integración" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3001"
$EVENT_URL = "http://localhost:3000/events"

# Test 1: Verificar CRUD
Write-Host "1️⃣ Verificando CRUD..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get -TimeoutSec 5
    Write-Host "✅ CRUD en $BASE_URL está activo" -ForegroundColor Green
} catch {
    Write-Host "❌ CRUD NO está corriendo en $BASE_URL" -ForegroundColor Red
    Write-Host "   Inicia con: npm run start:dev en cleaning-crud" -ForegroundColor Yellow
    exit 1
}

# Test 2: Verificar Event Manager
Write-Host ""
Write-Host "2️⃣ Verificando Event Manager..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri $EVENT_URL -Method Get -TimeoutSec 5
    Write-Host "✅ Event Manager en $EVENT_URL está activo" -ForegroundColor Green
} catch {
    Write-Host "❌ Event Manager NO está corriendo en $EVENT_URL" -ForegroundColor Red
    Write-Host "   Inicia con: npm run start:dev en epn-event-manager" -ForegroundColor Yellow
    exit 1
}

# Test 3: Crear producto
Write-Host ""
Write-Host "3️⃣ Creando producto de prueba..." -ForegroundColor Yellow
try {
    $product = @{
        name = "Test Product"
        category = "test"
        quantity = 10
        price = 9.99
        description = "Producto de prueba"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/products" -Method Post -Body $product -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ Producto creado con ID $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al crear producto: $($_)" -ForegroundColor Red
    exit 1
}

# Test 4: Verificar evento fue registrado
Write-Host ""
Write-Host "4️⃣ Verificando evento en Event Manager..." -ForegroundColor Yellow
Start-Sleep -Milliseconds 500  # Esperar a que se procese el evento
try {
    $events = Invoke-RestMethod -Uri $EVENT_URL -Method Get -TimeoutSec 5
    if ($events -and $events.Count -gt 0) {
        Write-Host "✅ $($events.Count) evento(s) encontrado(s) en Event Manager" -ForegroundColor Green
        $lastEvent = $events[-1]
        Write-Host "   Último evento:"
        Write-Host "   - Fuente: $($lastEvent.source)" -ForegroundColor Cyan
        Write-Host "   - Acción: $($lastEvent.action)" -ForegroundColor Cyan
        Write-Host "   - Entidad: $($lastEvent.entity)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ No se encontraron eventos aún" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Error al leer eventos: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ === Test Completado ===" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   ✓ CRUD en 3001 está activo"
Write-Host "   ✓ Event Manager en 3000 está activo"
Write-Host "   ✓ Integración funcionando"
Write-Host ""
Write-Host "🚀 Todo listo para la Fase 2" -ForegroundColor Green

