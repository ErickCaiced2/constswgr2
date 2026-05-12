# Script para probar el CRUD de productos de limpieza con PowerShell
# Asegúrate de que el servidor está corriendo en http://localhost:3001

Write-Host "🧹 === Pruebas del CRUD de Productos de Limpieza ===" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3001"
$PRODUCTS_URL = "$BASE_URL/products"

# 1. CREAR productos
Write-Host "1️⃣ Creando productos..." -ForegroundColor Yellow
Write-Host ""

$product1 = @{
    name = "Desinfectante Multiusos"
    category = "desinfectantes"
    quantity = 50
    price = 5.99
    description = "Elimina 99.9% de bacterias y virus"
} | ConvertTo-Json

Write-Host "Creando Producto 1..."
$response1 = Invoke-RestMethod -Uri $PRODUCTS_URL -Method Post -Body $product1 -ContentType "application/json"
Write-Host "✅ Producto 1 creado:" -ForegroundColor Green
$response1 | ConvertTo-Json | Write-Host
Write-Host ""

$product2 = @{
    name = "Detergente para Pisos"
    category = "detergentes"
    quantity = 30
    price = 3.50
    description = "Detergente concentrado para pisos"
} | ConvertTo-Json

Write-Host "Creando Producto 2..."
$response2 = Invoke-RestMethod -Uri $PRODUCTS_URL -Method Post -Body $product2 -ContentType "application/json"
Write-Host "✅ Producto 2 creado:" -ForegroundColor Green
$response2 | ConvertTo-Json | Write-Host
Write-Host ""

$product3 = @{
    name = "Papel Higiénico Premium"
    category = "papel"
    quantity = 200
    price = 1.25
    description = "Papel suave de 2 capas"
} | ConvertTo-Json

Write-Host "Creando Producto 3..."
$response3 = Invoke-RestMethod -Uri $PRODUCTS_URL -Method Post -Body $product3 -ContentType "application/json"
Write-Host "✅ Producto 3 creado:" -ForegroundColor Green
$response3 | ConvertTo-Json | Write-Host
Write-Host ""

# 2. LEER todos los productos
Write-Host "2️⃣ Listando todos los productos..." -ForegroundColor Yellow
Write-Host ""

$allProducts = Invoke-RestMethod -Uri $PRODUCTS_URL -Method Get
Write-Host "✅ Total de productos: $($allProducts.Count)" -ForegroundColor Green
$allProducts | ConvertTo-Json | Write-Host
Write-Host ""

# 3. LEER un producto específico
Write-Host "3️⃣ Consultando producto con ID 1..." -ForegroundColor Yellow
Write-Host ""

$product = Invoke-RestMethod -Uri "$PRODUCTS_URL/1" -Method Get
Write-Host "✅ Producto encontrado:" -ForegroundColor Green
$product | ConvertTo-Json | Write-Host
Write-Host ""

# 4. ACTUALIZAR producto
Write-Host "4️⃣ Actualizando producto con ID 1 (aumentando cantidad a 150)..." -ForegroundColor Yellow
Write-Host ""

$updateData = @{
    quantity = 150
    price = 6.99
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "$PRODUCTS_URL/1" -Method Patch -Body $updateData -ContentType "application/json"
Write-Host "✅ Producto actualizado:" -ForegroundColor Green
$updated | ConvertTo-Json | Write-Host
Write-Host ""

# 5. ELIMINAR producto
Write-Host "5️⃣ Eliminando producto con ID 2..." -ForegroundColor Yellow
Write-Host ""

$deleted = Invoke-RestMethod -Uri "$PRODUCTS_URL/2" -Method Delete
Write-Host "✅ Producto eliminado:" -ForegroundColor Green
$deleted | ConvertTo-Json | Write-Host
Write-Host ""

# 6. Verificar estado del sistema
Write-Host "6️⃣ Verificando estado de la aplicación..." -ForegroundColor Yellow
Write-Host ""

$health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
Write-Host "✅ Estado del servidor:" -ForegroundColor Green
$health | ConvertTo-Json | Write-Host
Write-Host ""

Write-Host "✅ Pruebas completadas. Revisa el Event Manager en http://localhost:3000/events para ver los eventos registrados." -ForegroundColor Cyan

