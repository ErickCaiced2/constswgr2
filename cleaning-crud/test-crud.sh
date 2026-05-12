#!/bin/bash

# Script para probar el CRUD de productos de limpieza
# Asegúrate de que el servidor está corriendo en http://localhost:3001

echo "🧹 === Pruebas del CRUD de Productos de Limpieza ==="
echo ""

# Variables
BASE_URL="http://localhost:3001"
PRODUCTS_URL="$BASE_URL/products"

# 1. CREAR producto
echo "1️⃣ Creando productos..."
echo ""

PRODUCT_1=$(curl -s -X POST "$PRODUCTS_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Elimina 99.9% de bacterias y virus"
  }')

echo "Producto 1 creado:"
echo "$PRODUCT_1" | jq .
echo ""

PRODUCT_2=$(curl -s -X POST "$PRODUCTS_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Detergente para Pisos",
    "category": "detergentes",
    "quantity": 30,
    "price": 3.50,
    "description": "Detergente concentrado para pisos"
  }')

echo "Producto 2 creado:"
echo "$PRODUCT_2" | jq .
echo ""

PRODUCT_3=$(curl -s -X POST "$PRODUCTS_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Papel Higiénico Premium",
    "category": "papel",
    "quantity": 200,
    "price": 1.25,
    "description": "Papel suave de 2 capas"
  }')

echo "Producto 3 creado:"
echo "$PRODUCT_3" | jq .
echo ""

# 2. LEER todos los productos
echo "2️⃣ Listando todos los productos..."
echo ""

curl -s -X GET "$PRODUCTS_URL" | jq .
echo ""

# 3. LEER un producto específico
echo "3️⃣ Consultando producto con ID 1..."
echo ""

curl -s -X GET "$PRODUCTS_URL/1" | jq .
echo ""

# 4. ACTUALIZAR producto
echo "4️⃣ Actualizando producto con ID 1 (aumentando cantidad a 150)..."
echo ""

curl -s -X PATCH "$PRODUCTS_URL/1" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price": 6.99
  }' | jq .
echo ""

# 5. ELIMINAR producto
echo "5️⃣ Eliminando producto con ID 2..."
echo ""

curl -s -X DELETE "$PRODUCTS_URL/2" | jq .
echo ""

# 6. Verificar estado del sistema
echo "6️⃣ Verificando estado de la aplicación..."
echo ""

curl -s -X GET "$BASE_URL/health" | jq .
echo ""

echo "✅ Pruebas completadas. Revisa el Event Manager en http://localhost:3000/events para ver los eventos registrados."

