# 🧹 CRUD de Productos de Limpieza - Guía Completa

## 📍 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Instalación y Setup](#instalación-y-setup)
3. [Iniciar Servidores](#iniciar-servidores)
4. [Cómo Usar el CRUD](#cómo-usar-el-crud)
5. [Endpoints Disponibles](#endpoints-disponibles)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Integración con Event Manager](#integración-con-event-manager)
8. [Pruebas Automatizadas](#pruebas-automatizadas)
9. [Troubleshooting](#troubleshooting)
10. [Estado del Proyecto](#estado-del-proyecto)

---

## 📚 Descripción General

Este es un **sistema de gestión de inventario de productos de limpieza** que se integra automáticamente con el **EPN Event Manager**. 

### ✨ Características
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar, Consultar)
- ✅ Integración automática con Event Manager central
- ✅ Cada operación genera un evento registrado en el hub
- ✅ Servidor independiente pero conectado
- ✅ Documentación completa y tests incluidos

### 🏗️ Tecnología
- **Framework**: NestJS 11.0.1
- **Lenguaje**: TypeScript 5.7.3
- **HTTP Client**: Axios
- **Puerto CRUD**: 3001
- **Puerto Event Manager**: 3000

---

## 🚀 Instalación y Setup

### Requisitos Previos
- Node.js 18+ instalado
- npm instalado
- Event Manager corriendo en `http://localhost:3000`

### 1. Instalar Dependencias
```bash
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm install
```

### 2. Compilar el CRUD (Opcional)
```bash
npm run build
```
✓ Esto genera los archivos en `dist/` preparados para producción.

---

## ▶️ Iniciar Servidores

### 📌 Opción 1: Modo Desarrollo (RECOMENDADO)

Abre **3 terminales** diferentes:

#### Terminal 1️⃣ - Event Manager
```bash
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\epn-event-manager
npm run start:dev
```
**Espera hasta ver:**
```
🎉 Listening on port 3000
```
✓ Event Manager está listo en `http://localhost:3000`

---

#### Terminal 2️⃣ - CRUD de Productos
```bash
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm run start:dev
```
**Espera hasta ver:**
```
🧹 Cleaning CRUD running on http://localhost:3001
```
✓ CRUD está listo en `http://localhost:3001`

---

#### Terminal 3️⃣ - Pruebas (Opcional)
```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
.\quick-test.ps1
```
✓ Ejecuta pruebas automáticas para verificar la integración.

---

### 📌 Opción 2: Modo Producción

```bash
# 1. Compilar
npm run build

# 2. Ejecutar
npm run start:prod
```

---

## 💻 Cómo Usar el CRUD

### Estructura del CRUD

```
Tu aplicación (Cliente)
        ↓
    CRUD Productos (3001)
    ├── POST   /products (Crear)
    ├── GET    /products (Listar todos)
    ├── GET    /products/:id (Obtener uno)
    ├── PATCH  /products/:id (Actualizar)
    └── DELETE /products/:id (Eliminar)
        ↓
    Event Manager (3000) ← Registra eventos automáticamente
```

---

## 🔌 Endpoints Disponibles

### 1. **GET /** - Estado de la Aplicación

**Descripción**: Verifica si el CRUD está activo

**Comando**:
```bash
curl http://localhost:3001/
```

**Respuesta**:
```
🧹 Cleaning CRUD is running!
```

---

### 2. **GET /health** - Verificar Salud del Sistema

**Descripción**: Devuelve el estado del servidor

**Comando**:
```bash
curl http://localhost:3001/health
```

**Respuesta**:
```json
{
  "status": "OK",
  "message": "🧹 Cleaning CRUD is healthy"
}
```

---

### 3. **POST /products** - Crear un Producto

**Descripción**: Crea un nuevo producto y envía evento al hub

**Campos Requeridos**:
- `name` (string) - Nombre del producto
- `category` (string) - Categoría (ej: desinfectantes, detergentes, papel)
- `quantity` (number) - Cantidad en inventario
- `price` (number) - Precio unitario
- `description` (string) - Descripción del producto

**Comando**:
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Elimina 99.9% de bacterias y virus"
  }'
```

**Respuesta**:
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 50,
  "price": 5.99,
  "description": "Elimina 99.9% de bacterias y virus",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:00.000Z"
}
```

**Evento Enviado al Hub**:
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "CREATE",
  "title": "Producto de limpieza creado: Desinfectante Multiusos",
  "description": "Se agregó un nuevo producto de categoría \"desinfectantes\" con 50 unidades en inventario",
  "payload": {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99
  }
}
```

---

### 4. **GET /products** - Listar Todos los Productos

**Descripción**: Obtiene la lista completa de productos y envía evento QUERY al hub

**Comando**:
```bash
curl http://localhost:3001/products
```

**Respuesta**:
```json
[
  {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Elimina 99.9% de bacterias y virus",
    "createdAt": "2026-05-07T10:30:00.000Z",
    "updatedAt": "2026-05-07T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Detergente para Pisos",
    "category": "detergentes",
    "quantity": 30,
    "price": 3.50,
    "description": "Detergente concentrado",
    "createdAt": "2026-05-07T10:31:00.000Z",
    "updatedAt": "2026-05-07T10:31:00.000Z"
  }
]
```

**Evento Enviado**:
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "QUERY",
  "title": "Listado de productos consultado",
  "description": "Se consultó el listado completo de 2 productos",
  "payload": {
    "count": 2,
    "totalValue": 261.85
  }
}
```

---

### 5. **GET /products/:id** - Obtener un Producto Específico

**Descripción**: Obtiene un producto por su ID y envía evento QUERY

**Parámetro**:
- `:id` - ID del producto

**Comando**:
```bash
curl http://localhost:3001/products/1
```

**Respuesta**:
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 50,
  "price": 5.99,
  "description": "Elimina 99.9% de bacterias y virus",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:00.000Z"
}
```

---

### 6. **PATCH /products/:id** - Actualizar un Producto

**Descripción**: Actualiza campos de un producto existente y envía evento UPDATE

**Parámetro**:
- `:id` - ID del producto

**Campos Opcionales** (actualizar solo los que necesites):
- `name` (string)
- `category` (string)
- `quantity` (number)
- `price` (number)
- `description` (string)

**Comando**:
```bash
curl -X PATCH http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price": 6.99
  }'
```

**Respuesta**:
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 150,
  "price": 6.99,
  "description": "Elimina 99.9% de bacterias y virus",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:15.000Z"
}
```

**Evento Enviado**:
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "UPDATE",
  "title": "Producto actualizado: Desinfectante Multiusos",
  "description": "Se actualizaron los datos del producto con ID 1",
  "payload": {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "previousValues": { "quantity": 50, "price": 5.99 },
    "newValues": { "quantity": 150, "price": 6.99 }
  }
}
```

---

### 7. **DELETE /products/:id** - Eliminar un Producto

**Descripción**: Elimina un producto y envía evento DELETE al hub

**Parámetro**:
- `:id` - ID del producto

**Comando**:
```bash
curl -X DELETE http://localhost:3001/products/1
```

**Respuesta**:
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 150,
  "price": 6.99,
  "description": "Elimina 99.9% de bacterias y virus",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:15.000Z"
}
```

**Evento Enviado**:
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "DELETE",
  "title": "Producto eliminado: Desinfectante Multiusos",
  "description": "Se eliminó el producto con ID 1 de la base de datos",
  "payload": {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 150,
    "precio": 6.99
  }
}
```

---

## 📋 Ejemplos de Uso

### Ejemplo Completo: Ciclo CRUD

```bash
# 1. CREAR 3 productos
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desinfectante",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Mata bacterias"
  }'

curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Detergente",
    "category": "detergentes",
    "quantity": 30,
    "price": 3.50,
    "description": "Para pisos"
  }'

curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Papel Higiénico",
    "category": "papel",
    "quantity": 200,
    "price": 1.25,
    "description": "Suave"
  }'

# 2. LISTAR todos
curl http://localhost:3001/products

# 3. OBTENER uno específico
curl http://localhost:3001/products/1

# 4. ACTUALIZAR
curl -X PATCH http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'

# 5. ELIMINAR
curl -X DELETE http://localhost:3001/products/2

# 6. VERIFICAR eventos registrados
curl http://localhost:3000/events
```

---

## 🔗 Integración con Event Manager

### ¿Qué sucede automáticamente?

Cada vez que haces una operación en el CRUD:

1. **Tu solicitud** → CRUD recibe la petición
2. **Procesa** → ProductsService ejecuta la lógica
3. **Envía evento** → EventEmitterService POST a `http://localhost:3000/events`
4. **Registra** → Event Manager guarda en la tabla correspondiente:
   - `CREATE` → `create_events`
   - `UPDATE` → `update_events`
   - `DELETE` → `delete_events`
   - `QUERY` → `query_events`
5. **Respuesta** → Tu aplicación recibe el resultado

### Ver Eventos Registrados

```bash
# Ver TODOS los eventos
curl http://localhost:3000/events

# Ver solo eventos de CREATE
curl http://localhost:3000/events/source/cleaning-crud

# Ver solo productos
curl http://localhost:3000/events/entity/product
```

---

## 🧪 Pruebas Automatizadas

### Test Rápido (30 segundos)

```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
.\quick-test.ps1
```

**Verifica**:
- ✅ CRUD está activo
- ✅ Event Manager está activo
- ✅ Integración funcionando
- ✅ Eventos siendo registrados

---

### Test Completo (Todos los endpoints)

```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
.\test-crud.ps1
```

**Ejecuta**:
1. Crea 3 productos
2. Lista todos
3. Obtiene uno
4. Actualiza uno
5. Elimina uno
6. Verifica salud del sistema

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción (requiere compilar primero)
npm run start:prod

# Compilar a JavaScript
npm run build

# Verificar código
npm run lint

# Formatear código
npm run format

# Ejecutar pruebas
npm test
```

---

## ❓ Troubleshooting

### ❌ Error: "connect ECONNREFUSED 127.0.0.1:3000"

**Significado**: Event Manager no está corriendo

**Solución**:
```bash
cd epn-event-manager
npm run start:dev
```

El CRUD sigue funcionando aunque falle, pero no enviará eventos.

---

### ❌ Error: "Address already in use :::3001"

**Significado**: El puerto 3001 ya está en uso

**Soluciones**:

**Opción 1**: Liberar el puerto
```bash
netstat -ano | findstr :3001
taskkill /PID <PID_AQUI> /F
```

**Opción 2**: Cambiar puerto en `src/main.ts`
```typescript
await app.listen(3002, () => { // Cambiar 3001 por 3002
  console.log('CRUD corriendo en 3002');
});
```

---

### ❌ Error: "Producto con ID X no encontrado"

**Significado**: Intentaste actualizar/eliminar un producto que no existe

**Solución**: Primero lista los productos para ver IDs válidos
```bash
curl http://localhost:3001/products
```

---

### ❌ Los eventos no aparecen en Event Manager

**Causas comunes**:
1. Event Manager no está corriendo
2. Hay error de conexión

**Verificar**:
```bash
# Revisar consola del CRUD para ver:
# ✅ Event [CREATE] registered
# o
# ❌ Error emitting event
```

---

### ✅ Test exitoso pero eventos no visibles

**Solución**: Hay un pequeño delay. Espera 1 segundo y consulta:
```bash
curl http://localhost:3000/events
```

---

## 📊 Estado del Proyecto

### ✅ Completado

| Característica | Estado | Detalles |
|----------------|--------|----------|
| CRUD Básico | ✅ | 5 operaciones implementadas |
| Integración con Hub | ✅ | Envía eventos automáticamente |
| TypeScript | ✅ | Compilable sin errores |
| Tests | ✅ | Scripts PowerShell + Bash |
| Documentación | ✅ | Guía completa y ejemplos |
| Hot-reload | ✅ | `npm run start:dev` |
| Manejo de errores | ✅ | Validaciones y try-catch |

---

### 🎯 Estructura de Carpetas

```
cleaning-crud/
├── src/
│   ├── main.ts                    ← Punto de entrada (puerto 3001)
│   ├── app.module.ts              ← Módulo raíz
│   ├── app.controller.ts          ← Rutas /health y /
│   ├── modules/
│   │   └── products/
│   │       ├── products.controller.ts    ← Endpoints CRUD
│   │       ├── products.service.ts       ← Lógica CRUD
│   │       ├── products.module.ts        ← Inyección de dependencias
│   │       ├── product.model.ts          ← Modelo de datos
│   │       └── dto/
│   │           ├── create-product.dto.ts
│   │           └── update-product.dto.ts
│   └── services/
│       └── event-emitter.service.ts      ← Envía eventos al hub
├── dist/                          ← Código compilado (generado)
├── node_modules/                  ← Dependencias (generado)
├── package.json                   ← Definición del proyecto
├── tsconfig.json                  ← Config TypeScript
├── README.md                      ← ESTE archivo
├── quick-test.ps1                ← Test rápido
└── test-crud.ps1                 ← Test completo
```

---

## 📝 Notas Importantes

1. **Almacenamiento**: Los datos se guardan en **memoria**, se pierden al reiniciar
2. **Producción**: Para usar en producción, integra con SQLite o PostgreSQL
3. **CORS**: Habilitado para pruebas desde otros orígenes
4. **Sin errores**: El CRUD funciona aunque Event Manager falle
5. **Puertos**: CRUD=3001, Event Manager=3000

---

## 🎓 Próximos Pasos

### Cuando estés listo para Fase 2:

1. ✅ Ambos servidores corriendo (`npm run start:dev`)
2. ✅ `quick-test.ps1` sin errores
3. ✅ Eventos registrándose en Event Manager
4. ✅ Comenzar a analizar los 6 errores intencionales del hub

---

## 📞 Resumen Rápido

### Iniciar
```bash
# Terminal 1 - Event Manager
cd epn-event-manager && npm run start:dev

# Terminal 2 - CRUD
cd cleaning-crud && npm run start:dev
```

### Crear Producto
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Limpiador","category":"test","quantity":10,"price":5,"description":"Test"}'
```

### Ver Eventos
```bash
curl http://localhost:3000/events
```

### Probar Todo
```powershell
.\quick-test.ps1
```

---

## ✨ ¡Listo para Usar!

Tu CRUD de productos de limpieza está **100% funcional** e **integrado** con el Event Manager.

**¿Preguntas?** Revisa este archivo o ejecuta `.\quick-test.ps1` 🚀



