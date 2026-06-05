# MAINTENANCE INTERVENTIONS - Cleanng CRUD Application

## Cambios Aplicados

### 1. CORRECTIVE MAINTENANCE — Corrección de errores y logging estructurado

#### Archivos modificados:
- **`src/services/logger.service.ts`** (nuevo)
  - Logger Winston con severidades INFO, WARN, ERROR
  - Formato ISO 8601 con timestamp: `[2026-06-01T14:32:00.000Z] INFO - mensaje`
  - Soporte para logging a consola y archivo (configurable vía `LOG_FILE`)
  
- **`src/modules/products/products.controller.ts`**
  - Cada método envuelto en `try-catch`
  - Logging en operaciones CRUD: create, findOne, update, remove
  - Respuestas de error estructuradas con HTTP 500 y JSON

- **`src/modules/products/products.service.ts`**
  - Try-catch en todos los métodos CRUD
  - Logging de operaciones principales
  - Manejo de errores granular (NotFoundException, BadRequestException, InternalServerErrorException)

- **`src/services/event-emitter.service.ts`**
  - Inyección de LoggerService
  - Timeout de 3000ms en llamadas HTTP
  - No lanza excepciones para evitar romper flujo CRUD

---

### 2. ADAPTIVE MAINTENANCE — Adaptación a entorno y seguridad API Key

#### Archivos modificados:
- **`src/main.ts`**
  - Carga de `.env` mediante `dotenv.config()`
  - Middleware de validación de API Key: `X-FIS-EPN-KEY` header
  - Puerto configurable desde `process.env.PORT`
  - HTTP 401 Unauthorized si falta o es inválida la clave

- **`src/database/database.module.ts`**
  - Rutas de BD, sync y logging desde variables de entorno
  - `DB_PATH`, `DB_SYNCHRONIZE`, `DB_LOGGING`

- **`src/services/event-emitter.service.ts`**
  - `EVENT_HUB_URL` desde `process.env.EVENT_HUB_URL`

- **`.env.example`** (nuevo)
  - Plantilla con todas las variables requeridas

- **`.env`** (nuevo)
  - Valores de desarrollo local

---

### 3. PERFECTIVE MAINTENANCE — Tests y documentación

#### Archivos nuevos:
- **`src/modules/products/products.service.spec.ts`**
  - Test de duplicate ID en CREATE ✓
  - Test de READ by ID retorna entidad correcta ✓
  - Test de UPDATE rechaza precio negativo ✓
  - Test de DELETE con eliminación lógica vs física ✓

- **`openapi.yaml`** (nuevo)
  - Spec OpenAPI 3.0.3
  - Todos los endpoints CRUD documentados
  - Schema `ProductInput` con validaciones
  - `X-FIS-EPN-KEY` como componente de seguridad

- **`POSTMAN_COLLECTION.json`** (nuevo)
  - 8 requests de ejemplo
  - Casos de uso: CREATE, READ, UPDATE, DELETE
  - Errores esperados: sin API Key, ID inválido

---

### 4. PREVENTIVE MAINTENANCE — Validación y manejo defensivo

#### Archivos modificados:
- **`src/modules/products/dto/create-product.dto.ts`**
  - Validadores class-validator: `@IsNotEmpty`, `@IsString`, `@MaxLength`
  - Rango de validación: nombres (100 chars), categorías (50), descripción (300)
  - Números no negativos: `@Min(0)` para price y quantity

- **`src/modules/products/dto/update-product.dto.ts`**
  - Validadores opcionales: `@IsOptional` + constraints
  - Validación de campos individuales

- **`src/modules/products/product.entity.ts`**
  - Campo `deleted` booleano para soft delete (eliminación lógica)

- **`src/modules/products/product.model.ts`**
  - Propiedad `deleted` reflejando estado lógico

- **`src/modules/products/products.service.ts`**
  - Validación de inyección SQL: regex `/[<script|SELECT|DROP|etc]/i`
  - Límites de longitud en campos
  - Eliminación lógica vs física: `LOGICAL_DELETE` env var
  - Filtrado automático de items eliminados cuando está habilitado

- **`src/main.ts`**
  - `ValidationPipe` global para DTO sanitization
  - Middleware API Key con manejo seguro

---

## Estructura de Archivos Generados

```
cleaning-crud/
├── .env                           [ADAPTIVE] Configuración de desarrollo
├── .env.example                   [ADAPTIVE] Plantilla de variables
├── openapi.yaml                   [PERFECTIVE] Documentación OpenAPI
├── POSTMAN_COLLECTION.json        [PERFECTIVE] Tests Postman
├── src/
│   ├── main.ts                    [ADAPTIVE, PREVENTIVE] Entry point con middleware
│   ├── app.module.ts              [ADAPTIVE] Providers globales
│   ├── services/
│   │   ├── logger.service.ts      [CORRECTIVE] Winston logger con ISO 8601
│   │   └── event-emitter.service.ts [ADAPTIVE, CORRECTIVE] URL y logging
│   ├── database/
│   │   └── database.module.ts     [ADAPTIVE] Configuración desde env
│   └── modules/products/
│       ├── products.controller.ts [CORRECTIVE, PREVENTIVE] Try-catch y logs
│       ├── products.service.ts    [CORRECTIVE, PREVENTIVE] Validación y manejo de errores
│       ├── product.entity.ts      [PREVENTIVE] Campo deleted
│       ├── product.model.ts       [PREVENTIVE] Propiedad deleted
│       ├── products.module.ts     [ADAPTIVE] Providers
│       ├── products.service.spec.ts [PERFECTIVE] Tests Jest
│       └── dto/
│           ├── create-product.dto.ts [PREVENTIVE] Validadores
│           └── update-product.dto.ts [PREVENTIVE] Validadores
```

---

## Compilación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

Se instalarán: `dotenv` y `winston` automáticamente.

### 2. Compilar TypeScript a JavaScript
```bash
npm run build
```

Output: `/dist/` lista para producción

### 3. Ejecutar en desarrollo (con watch)
```bash
npm run start:dev
```

O en producción:
```bash
npm run start:prod
```

### 4. Ejecutar tests
```bash
npm test
npm test:cov           # con coverage
npm test:watch         # modo watch
```

---

## Validación de Cambios

### API Key Middleware
- ✅ Requerido header `X-FIS-EPN-KEY`
- ✅ HTTP 401 si no coincide `process.env.FIS_EPN_KEY`
- ✅ Permite desarrollo local si no está configurada

### Logging Estructurado
```
[2026-06-01T14:32:00.000Z] INFO - Entity created: {"id":5,"name":"Jabón"}
[2026-06-01T14:32:01.000Z] ERROR - Error in create: {"error":"..."}
```

### Sanitización de Input
- ✅ Validación de longitud de strings
- ✅ Rechazo de patrones SQL injection
- ✅ Validación de números no negativos
- ✅ DTO validators activos

### Eliminación Lógica vs Física
- **LOGICAL_DELETE=true**: marca `deleted=true`, no borra realmente
- **LOGICAL_DELETE=false**: borra registro de BD (predeterminado)

### Error Handling
- ✅ Try-catch en todos los handlers
- ✅ Respuestas JSON estructuradas
- ✅ HTTP 4xx/5xx apropiados
- ✅ No hay crashes por input inválido

---

## Pruebas Recomendadas (usando Postman Collection)

1. **Autenticación**: Enviar request sin `X-FIS-EPN-KEY` → HTTP 401
2. **Validación**: POST con name>100 chars → HTTP 400
3. **CRUD Flow**: CREATE → READ → UPDATE → DELETE
4. **Estadísticas**: GET /products/stats
5. **Edge Cases**: ID = "abc" → HTTP 400

---

## Variables de Entorno (.env)

| Variable | Descripción | Valor por defecto |
|----------|------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `FIS_EPN_KEY` | Clave API requerida | `test-key-12345` |
| `EVENT_HUB_URL` | URL del Event Manager | `http://localhost:3000/events` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `LOG_FILE` | Archivo de logs | `logs/cleaning-crud.log` |
| `DB_PATH` | Ruta de BD SQLite | `database.sqlite` |
| `DB_SYNCHRONIZE` | Sincronizar schema | `true` |
| `DB_LOGGING` | Logs de TypeORM | `false` |
| `LOGICAL_DELETE` | Eliminación lógica | `true` |

---

## Cambios por Tipo de Mantenimiento

| Tipo | Cambios |
|------|---------|
| **[CORRECTIVE]** | Logger (Winston), try-catch, estructuración de errores |
| **[ADAPTIVE]** | .env, API Key middleware, env vars en servicios |
| **[PERFECTIVE]** | Tests Jest, OpenAPI YAML, Postman collection |
| **[PREVENTIVE]** | Validadores DTO, sanitización SQL, soft delete |

---

**Status**: ✅ Todos los 4 tipos de mantenimiento aplicados y documentados.

