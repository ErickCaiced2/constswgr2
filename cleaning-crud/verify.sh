#!/bin/bash

echo "========================================"
echo "CLEANING CRUD - Verification Checklist"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1"
    return 1
  fi
}

# Function to check content in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $1 contains '$2'"
    return 0
  else
    echo -e "${RED}✗${NC} $1 missing '$2'"
    return 1
  fi
}

echo "=== [CORRECTIVE] Logging & Error Handling ==="
check_file "src/services/logger.service.ts"
check_content "src/services/logger.service.ts" "winston.createLogger"
check_content "src/modules/products/products.service.ts" "this.logger.info"
check_content "src/modules/products/products.controller.ts" "try {"
echo ""

echo "=== [ADAPTIVE] Environment & API Key ==="
check_file ".env"
check_file ".env.example"
check_content ".env" "FIS_EPN_KEY"
check_content "src/main.ts" "process.env.FIS_EPN_KEY"
check_content "src/main.ts" "X-FIS-EPN-KEY"
echo ""

echo "=== [PERFECTIVE] Tests & Documentation ==="
check_file "src/modules/products/products.service.spec.ts"
check_file "openapi.yaml"
check_file "POSTMAN_COLLECTION.json"
check_content "src/modules/products/products.service.spec.ts" "describe"
check_content "openapi.yaml" "openapi: 3.0.3"
echo ""

echo "=== [PREVENTIVE] Validation & Sanitization ==="
check_file "src/modules/products/dto/create-product.dto.ts"
check_content "src/modules/products/dto/create-product.dto.ts" "@IsNotEmpty"
check_content "src/modules/products/products.service.ts" "suspiciousPattern"
check_content "src/modules/products/product.entity.ts" "deleted"
check_content "src/modules/products/products.service.ts" "LOGICAL_DELETE"
echo ""

echo "=== Dependencies ==="
check_content "package.json" "dotenv"
check_content "package.json" "winston"
check_content "package.json" "class-validator"
echo ""

echo "========================================"
echo "Verification Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. npm install"
echo "2. npm run build"
echo "3. npm test"
echo "4. npm run start:dev"
echo ""

