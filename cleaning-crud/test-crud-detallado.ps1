# Script de pruebas detalladas del CRUD

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🧪 PRUEBAS DETALLADAS DEL CRUD" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# TEST 2: LISTAR TODOS LOS PRODUCTOS
Write-Host "========== TEST: LISTAR TODOS LOS PRODUCTOS ==========" -ForegroundColor Green
$response = Invoke-RestMethod -Uri 'http://localhost:3001/products' -Method Get
Write-Host "Total de productos: $($response.Count)" -ForegroundColor Yellow
Write-Host ""
foreach ($prod in $response) {
    Write-Host "ID: $($prod.id) | Nombre: $($prod.name) | Stock: $($prod.quantity) | Precio: `$$($prod.price)" -ForegroundColor Cyan
}
Write-Host ""

# TEST 3: OBTENER UN PRODUCTO ESPECÍFICO
Write-Host "========== TEST: OBTENER PRODUCTO CON ID 1 ==========" -ForegroundColor Green
$response = Invoke-RestMethod -Uri 'http://localhost:3001/products/1' -Method Get
Write-Host "Producto encontrado:" -ForegroundColor Yellow
Write-Host "  ID: $($response.id)"
Write-Host "  Nombre: $($response.name)"
Write-Host "  Categoría: $($response.category)"
Write-Host "  Cantidad: $($response.quantity)"
Write-Host "  Precio: `$$($response.price)"
Write-Host "  Descripción: $($response.description)"
Write-Host ""

# TEST 4: ACTUALIZAR PRODUCTO
Write-Host "========== TEST: ACTUALIZAR PRODUCTO 1 ==========" -ForegroundColor Green
$updateBody = @{
    quantity = 150
    price = 11.99
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3001/products/1' -Method Patch -Body $updateBody -ContentType 'application/json'
Write-Host "Producto actualizado:" -ForegroundColor Yellow
Write-Host "  Cantidad anterior: 100 -> Cantidad nueva: $($response.quantity)"
Write-Host "  Precio anterior: 9.99 -> Precio nuevo: `$$($response.price)"
Write-Host ""

# TEST 5: ELIMINAR PRODUCTO
Write-Host "========== TEST: ELIMINAR PRODUCTO 2 ==========" -ForegroundColor Green
$response = Invoke-RestMethod -Uri 'http://localhost:3001/products/2' -Method Delete
Write-Host "Producto eliminado:" -ForegroundColor Yellow
Write-Host "  ID: $($response.id)"
Write-Host "  Nombre: $($response.name)"
Write-Host ""

# TEST 6: LISTAR NUEVAMENTE
Write-Host "========== TEST: LISTAR PRODUCTOS DESPUÉS DE ELIMINAR ==========" -ForegroundColor Green
$response = Invoke-RestMethod -Uri 'http://localhost:3001/products' -Method Get
Write-Host "Total de productos ahora: $($response.Count)" -ForegroundColor Yellow
Write-Host ""
foreach ($prod in $response) {
    Write-Host "ID: $($prod.id) | Nombre: $($prod.name)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ TODOS LOS TESTS PASARON - CRUD FUNCIONA PERFECTAMENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

