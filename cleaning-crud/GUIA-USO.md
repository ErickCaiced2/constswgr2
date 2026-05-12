# 🧹 Guía de Uso: CRUD de Productos de Limpieza

## 📚 Descripción General

Este es un sistema de gestión de inventario de productos de limpieza que se integra con el **EPN Event Manager**. Cada operación CRUD genera eventos que se registran automáticamente en el hub central.

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar en modo desarrollo
```bash
npm run start:dev
```

El servidor estará disponible en: **http://localhost:3001**

### 3. Ejecutar en modo producción
```bash
npm run build
npm run start:prod
```

## 📋 Estructura de Carpetas

```
cleaning-crud/
├── src/
│   ├── main.ts                    # Punto de entrada
│   ├── app.module.ts              # Módulo principal
│   ├── app.controller.ts          # Rutas globales
│   ├── app.service.ts             # Servicios globales
│   ├── modules/
│   │   └── products/
│   │       ├── products.controller.ts
│   │       ├── products.service.ts
│   │       ├── products.module.ts
│   │       ├── product.model.ts
│   │       └── dto/
│   │           ├── create-product.dto.ts
│   │           └── update-product.dto.ts
│   └── services/
│       └── event-emitter.service.ts  # Servicio de integración con Event Manager
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Endpoints

### 1. **GET /** - Estado de la aplicación
```bash
curl http://localhost:3001/
```

**Respuesta:**
```json
"🧹 Cleaning CRUD is running!"
```

---

### 2. **GET /health** - Verificar salud
```bash
curl http://localhost:3001/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "🧹 Cleaning CRUD is healthy"
}
```

---

### 3. **POST /products** - Crear un producto
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Elimina 99.9% de bacterias"
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 50,
  "price": 5.99,
  "description": "Elimina 99.9% de bacterias",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:00.000Z"
}
```

**Evento enviado al Event Manager:**
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

### 4. **GET /products** - Listar todos los productos
```bash
curl http://localhost:3001/products
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes",
    "quantity": 50,
    "price": 5.99,
    "description": "Elimina 99.9% de bacterias",
    "createdAt": "2026-05-07T10:30:00.000Z",
    "updatedAt": "2026-05-07T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Detergente para Pisos",
    "category": "detergentes",
    "quantity": 30,
    "price": 3.50,
    "description": "Detergente concentrado para pisos",
    "createdAt": "2026-05-07T10:31:00.000Z",
    "updatedAt": "2026-05-07T10:31:00.000Z"
  }
]
```

**Evento enviado:**
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

### 5. **GET /products/:id** - Obtener un producto específico
```bash
curl http://localhost:3001/products/1
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 50,
  "price": 5.99,
  "description": "Elimina 99.9% de bacterias",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:00.000Z"
}
```

**Evento enviado:**
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "QUERY",
  "title": "Producto consultado: Desinfectante Multiusos",
  "description": "Se consultó el producto con ID 1",
  "payload": {
    "id": 1,
    "name": "Desinfectante Multiusos",
    "category": "desinfectantes"
  }
}
```

---

### 6. **PATCH /products/:id** - Actualizar un producto
```bash
curl -X PATCH http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price": 6.99
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 150,
  "price": 6.99,
  "description": "Elimina 99.9% de bacterias",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:15.000Z"
}
```

**Evento enviado:**
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
    "previousValues": {
      "name": "Desinfectante Multiusos",
      "category": "desinfectantes",
      "quantity": 50,
      "price": 5.99,
      "description": "Elimina 99.9% de bacterias"
    },
    "newValues": {
      "quantity": 150,
      "price": 6.99
    }
  }
}
```

---

### 7. **DELETE /products/:id** - Eliminar un producto
```bash
curl -X DELETE http://localhost:3001/products/1
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Desinfectante Multiusos",
  "category": "desinfectantes",
  "quantity": 150,
  "price": 6.99,
  "description": "Elimina 99.9% de bacterias",
  "createdAt": "2026-05-07T10:30:00.000Z",
  "updatedAt": "2026-05-07T10:30:15.000Z"
}
```

**Evento enviado:**
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

## 🧪 Pruebas Automatizadas

### Con PowerShell (Windows)
```bash
.\test-crud.ps1
```

### Con Bash/Shell (Linux/Mac)
```bash
bash test-crud.sh
```

---

## 📊 Integración con Event Manager

Cada operación en el CRUD envía automáticamente un evento al Event Manager en `http://localhost:3000/events`.

### Flujo de Integración:
1. Cliente realiza operación CRUD (POST, GET, PATCH, DELETE)
2. El `ProductsController` recibe la solicitud
3. El `ProductsService` procesa la operación
4. El `EventEmitterService` envía un evento al Event Manager
5. El Event Manager registra el evento en la base de datos correspondiente

### Estructura de Evento:
```typescript
{
  source: "cleaning-crud",      // Origen del evento
  entity: "product",             // Tipo de entidad
  action: "CREATE|READ|UPDATE|DELETE|QUERY",  // Acción realizada
  title: string,                 // Título descriptivo
  description: string,           // Descripción detallada
  payload: {                     // Datos adicionales
    id: number;
    name: string;
    // ... otros campos según el contexto
  }
}
```

---

## 🔍 Monitoreo de Eventos

Para ver todos los eventos generados, consulta el Event Manager:

```bash
curl http://localhost:3000/events
```

---

## 🌳 Árbol de Decisiones de Mantenimiento (Fase 2)

En la Fase 2, identificarás errores intencionales en el Event Manager y aplicarás:

- **Mantenimiento Correctivo**: Corregir bugs funcionales
- **Mantenimiento Adaptativo**: Ajustar a nuevas reglas
- **Mantenimiento Perfectivo**: Mejorar rendimiento/reportes
- **Mantenimiento Preventivo**: Fortalecer validaciones

---

## 📝 Notas Importantes

1. El servidor corre en **puerto 3001** (asegúrate de que esté disponible)
2. El Event Manager debe estar corriendo en **http://localhost:3000**
3. Si el Event Manager no está disponible, el CRUD sigue funcionando (sin enviar eventos)
4. Los productos se guardan en memoria (se pierden al reiniciar)
5. En producción, integra con una base de datos real (TypeORM + SQLite/PostgreSQL)

---

## 🛠️ Desarrollo

### Scripts disponibles:
- `npm run start` - Ejecutar en producción
- `npm run start:dev` - Ejecutar en desarrollo con watch
- `npm run build` - Compilar a JavaScript
- `npm run lint` - Verificar código
- `npm run format` - Formatear código
- `npm test` - Ejecutar pruebas

---

## 📞 Soporte

Para dudas sobre la integración o errores, revisa:
1. Los logs de la consola del CRUD
2. Los logs de la consola del Event Manager
3. La sección de tests en `test-crud.ps1` o `test-crud.sh`

