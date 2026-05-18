# 🧹 Taller de Mantenimiento de Software - CRUD de Productos de Limpieza

## 📚 Introducción para Juniors

Bienvenidos al taller de **Mantenimiento de Software**. En las próximas semanas estaremos trabajando con dos sistemas integrados que te enseñarán lo importante que es mantener código funcional en producción.

### 🎯 ¿Qué vamos a hacer?

Ustedes van a:
1. **Usar** una aplicación web (esta) para gestionar productos de limpieza
2. **Observar** cómo cada acción genera eventos que se registran en un sistema central
3. **Identificar y corregir** errores intencionales en el sistema central
4. **Aplicar** 4 tipos de mantenimiento diferentes

### 🏗️ ¿Cómo está construido?

```
┌────────────────────────────────────────────────────────────┐
│                   Navegador (Cliente)                      │
│              🧹 Interfaz Web - Puerto 3001                 │
│          (Crear, Editar, Eliminar Productos)               │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP POST/GET/PATCH/DELETE
                 │ 
┌────────────────▼─────────────────────────────────────────┐
│            CRUD de Productos - NestJS                     │
│              Puerto 3001 - Node.js                        │
│  Maneja operaciones CRUD del inventario                   │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP POST (Envía eventos)
                 │
┌────────────────▼─────────────────────────────────────────┐
│           Event Manager (Hub) - NestJS                    │
│              Puerto 3000 - Node.js                        │
│  Recibe eventos y los guarda en 4 tablas:                 │
│  - create_events (CREATE)                                 │
│  - update_events (UPDATE)                                 │
│  - delete_events (DELETE)                                 │
│  - query_events (QUERY/READ)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 La Interfaz Web - Lo que Ustedes Verán

La interfaz web que estamos creando está en: **http://localhost:3001**

### Funcionalidades:

#### 1. **Crear Productos** ➕
- Formulario para agregar nuevos productos al inventario
- Campos: Nombre, Categoría, Cantidad, Precio, Descripción
- Al crear: automáticamente se envía un evento `CREATE` al hub

#### 2. **Listar Productos** 📦
- Ver todos los productos en tarjetas visuales
- Buscar productos por nombre o categoría
- Información: cantidad, precio, descripción

#### 3. **Editar Productos** ✏️
- Actualizar cualquier campo del producto
- Modal emergente con formulario
- Al actualizar: se envía evento `UPDATE` al hub

#### 4. **Eliminar Productos** 🗑️
- Borrar productos con confirmación
- Al eliminar: se envía evento `DELETE` al hub

#### 5. **Consultar Productos** 🔍
- Cada búsqueda/listado genera un evento `QUERY`
- El hub registra todas las búsquedas

---

## 🔄 El Flujo de un Evento

Cuando haces una acción en la interfaz web, esto sucede:

### Ejemplo: Crear un Producto

```
1️⃣ Usuario llena el formulario:
   - Nombre: "Desinfectante Multiusos"
   - Categoría: "desinfectantes"
   - Cantidad: 50
   - Precio: 5.99

2️⃣ Hace clic en "Crear Producto"
   ❌ El navegador envía: POST /products

3️⃣ El CRUD recibe la solicitud
   📥 ProductsService procesa los datos
   💾 Guarda en memoria

4️⃣ El CRUD AUTOMÁTICAMENTE envía un evento:
   🚀 POST http://localhost:3000/events
   
   Con este payload:
   {
     "source": "cleaning-crud",
     "entity": "product",
     "action": "CREATE",
     "title": "Producto de limpieza creado: Desinfectante Multiusos",
     "description": "Se agregó un nuevo producto de categoría desinfectantes",
     "payload": {
       "id": 1,
       "name": "Desinfectante Multiusos",
       "category": "desinfectantes",
       "quantity": 50,
       "price": 5.99
     }
   }

5️⃣ El Event Manager recibe el evento
   📊 Lo guarda en la tabla: create_events
   ✅ Responde: { ok: true }

6️⃣ El CRUD responde al navegador
   ✅ Producto creado: { id: 1, name: "...", ... }

7️⃣ La interfaz actualiza la lista
   🎉 ¡Ves el producto nuevo en la pantalla!
```

---

## 🏢 Arquitectura Técnica

### Stack Tecnológico

| Componente | Tecnología | Puerto |
|-----------|-----------|--------|
| Interfaz Web | HTML5, CSS3, JavaScript Vanilla | 3001 |
| CRUD Backend | NestJS, TypeScript | 3001 |
| Event Manager | NestJS, TypeScript, SQLite | 3000 |
| Base de Datos CRUD | En memoria (se pierden al reiniciar) | - |
| Base de Datos Hub | SQLite | `db/events.sqlite` |

### Archivos Importantes

#### CRUD - Carpeta `cleaning-crud/`

```
src/
├── main.ts                    # Inicia servidor, sirve archivos estáticos
├── app.module.ts              # Módulo raíz
├── app.controller.ts          # Rutas /health y /
├── modules/
│   └── products/
│       ├── products.controller.ts    # Endpoints: POST/GET/PATCH/DELETE
│       ├── products.service.ts       # Lógica CRUD
│       ├── products.module.ts        # Inyección de dependencias
│       ├── product.model.ts          # Interfaz Product
│       └── dto/
│           ├── create-product.dto.ts # Validación para CREATE
│           └── update-product.dto.ts # Validación para UPDATE
└── services/
    └── event-emitter.service.ts      # 🔑 Envía eventos al hub

public/                       # 🌐 Navegador
├── index.html               # Interfaz
├── styles.css               # Diseño
└── app.js                   # Lógica del navegador
```

#### Event Manager - Carpeta `epn-event-manager/`

```
src/
├── main.ts                  # Inicia servidor puerto 3000
├── app.module.ts            # Módulo raíz
├── modules/
│   ├── events/
│   │   ├── events.controller.ts     # Endpoints POST/GET
│   │   ├── events.service.ts        # 🔑 Guarda eventos (TIENE ERRORES)
│   │   └── dto/
│   │       └── create-event.dto.ts  # Validación de eventos
│   ├── health/              # GET /health
│   └── stats/               # GET /stats
├── database/
│   ├── database.module.ts   # Config TypeORM
│   └── entities/            # 4 tablas diferentes
│       ├── create-event.entity.ts
│       ├── update-event.entity.ts
│       ├── delete-event.entity.ts
│       └── query-event.entity.ts

db/
└── events.sqlite            # Base de datos SQLite
```

---

## 🚀 Cómo Iniciar Todo - GUÍA COMPLETA

### ⚠️ IMPORTANTE: Lee esto antes de empezar

Este proyecto tiene **2 servidores independientes** que se comunican entre sí:
- **CRUD** (Puerto 3001) = Tu interfaz web
- **Event Manager** (Puerto 3000) = El hub central

Ambos **DEBEN estar corriendo** para que funcione todo.

---

### Paso 1️⃣: Abre 2 Terminales Separadas

Necesitas **2 terminales diferentes** (una para cada servidor).

> **Nota para Windows**: Abre PowerShell o CMD. Si usas Git Bash, algunos comandos pueden variar.

---

### Paso 2️⃣: Terminal 1 - Instalar y Iniciar Event Manager

Copia y ejecuta estos comandos **en la Terminal 1**:

```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\epn-event-manager
npm install
npm run start:dev
```

**Espera a ver esto en la pantalla:**
```
🎉 Listening on port 3000
```

✅ **NO CIERRES ESTA TERMINAL** - Déjala abierta

---

### Paso 3️⃣: Terminal 2 - Instalar y Iniciar CRUD de Productos

Abre **UNA NUEVA TERMINAL** y copia estos comandos **en la Terminal 2**:

```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm install
npm run start:dev
```

**Espera a ver esto en la pantalla:**
```
🧹 Cleaning CRUD running on http://localhost:3001
📱 Interfaz web disponible en http://localhost:3001/index.html
```

✅ **NO CIERRES ESTA TERMINAL** - Déjala abierta

---

### Paso 4️⃣: Abre tu Navegador

En tu navegador (Chrome, Firefox, Edge) ve a:

```
http://localhost:3001
```

🎉 **¡LISTO! Ya tienes la interfaz web funcionando!**

Deberías ver:
- Un formulario verde para crear productos
- Una lista de productos
- Indicadores de estado (CRUD y Event Manager)

---

### ⚡ Resumen de Comandos Rápido

Si ya todo está instalado y solo quieres reiniciar:

**Terminal 1:**
```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\epn-event-manager
npm run start:dev
```

**Terminal 2:**
```powershell
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm run start:dev
```

**Navegador:**
```
http://localhost:3001
```

---

### 🔧 Comandos Útiles Durante el Trabajo

#### Verificar que TODO funciona

Desde **cualquier terminal nueva**:

```powershell
# Verificar que CRUD responde
curl http://localhost:3001/health

# Verificar que Event Manager responde  
curl http://localhost:3000/health

# Ver TODOS los eventos registrados
curl http://localhost:3000/events

# Ver eventos solo de tu CRUD
curl http://localhost:3000/events/source/cleaning-crud

# Ver eventos solo de productos
curl http://localhost:3000/events/entity/product

# Ver estadísticas del hub
curl http://localhost:3000/stats
```

---

#### Si algo falla o quieres limpiar

```powershell
# Detener un servidor: CTRL + C (en la terminal donde corre)

# Reinstalar dependencias (si hay problemas)
cd cleaning-crud
npm install

cd ../epn-event-manager
npm install

# Compilar el código TypeScript a JavaScript
cd cleaning-crud
npm run build

cd ../epn-event-manager
npm run build
```

---

### 📱 Paso 2: Abre el Navegador

Ve a: **http://localhost:3001**

¡Listo! Ya tienes la interfaz web funcionando.

---

## 🧪 Prueba la Integración

### 1. Crea un Producto
- Nombre: "Desinfectante"
- Categoría: "desinfectantes"
- Cantidad: 50
- Precio: 5.99
- Click en "Crear Producto"

### 2. Verifica que se guardó
- Ver el producto en la lista
- Si ves el producto en la pantalla = ✅ CRUD funcionando

### 3. Comprueba el evento en el Hub
```powershell
curl http://localhost:3000/events
```

Deberías ver un JSON con el evento registrado:
```json
{
  "source": "cleaning-crud",
  "entity": "product",
  "action": "CREATE",
  ...
}
```

Si ves esto = ✅ **INTEGRACIÓN FUNCIONANDO**

---

## 🎓 Los 4 Tipos de Mantenimiento que Haremos

### 1. **Mantenimiento Correctivo** 🐞
Encontrar y arreglar **bugs** (errores funcionales)
- Algo que debería funcionar pero no funciona
- Ej: "El evento DELETE no se guarda en la BD"
- Lo que haremos: Recrear el error, encontrar la causa, hacerlo funcionar

### 2. **Mantenimiento Adaptativo** ⚙️
Ajustar el sistema a **nuevas reglas o requisitos**
- Cambios en el entorno externo
- Ej: "Los eventos deben almacenarse en UTC, no en hora local"
- Lo que haremos: Aplicar el cambio sin romper nada más

### 3. **Mantenimiento Perfectivo** 📈
Mejorar lo que funciona (**optimización y refactoring**)
- La funcionalidad está bien pero puede mejorar
- Ej: "Combinar las 4 tablas en una sola para mejor rendimiento"
- Lo que haremos: Refactorizar código sin cambiar lo que hace

### 4. **Mantenimiento Preventivo** 🛡️
Evitar problemas futuros (**robustez y seguridad**)
- Agregar validaciones antes de que algo falle
- Ej: "Limitar el tamaño del título a 200 caracteres"
- Lo que haremos: Endurecer el sistema contra inputs maliciosos

---

## 📊 Errores Intencionales en Event Manager

El sistema tiene **6 errores intencionales** distribuidos en los endpoints del Event Manager.

Ustedes deben encontrarlos y clasificarlos según el tipo de mantenimiento.

### Los 6 Endpoints a Revisar

1. `POST /events` - Registrar evento
2. `GET /events` - Listar todos
3. `GET /events/source/:source` - Filtrar por origen
4. `GET /events/entity/:entity` - Filtrar por entidad
5. `GET /stats` - Estadísticas
6. `GET /health` - Estado del servidor

**Tarea**: Encontrar cuál de los 4 tipos de mantenimiento aplica a cada endpoint.

---

## 💻 Comandos Útiles

### Desde cualquier carpeta:

```bash
# Ver si CRUD está activo
curl http://localhost:3001/health

# Ver si Hub está activo
curl http://localhost:3000/health

# Ver todos los eventos
curl http://localhost:3000/events

# Ver eventos solo de tu CRUD
curl http://localhost:3000/events/source/cleaning-crud

# Ver eventos solo de productos
curl http://localhost:3000/events/entity/product

# Ver estadísticas del hub
curl http://localhost:3000/stats
```

---

## 🆘 Troubleshooting - Solucionar Problemas

### Problema: "No puedo acceder a http://localhost:3001"

**Causa**: El CRUD no está corriendo

**Solución:**
```powershell
# Verifica que la Terminal 2 está activa y muestra:
# 🧹 Cleaning CRUD running on http://localhost:3001

# Si no, ejecuta en Terminal 2:
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm run start:dev
```

---

### Problema: "Event Manager desconectado" (en la página)

**Causa**: Event Manager no está corriendo

**Solución:**
```powershell
# Verifica que la Terminal 1 está activa y muestra:
# 🎉 Listening on port 3000

# Si no, ejecuta en Terminal 1:
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\epn-event-manager
npm run start:dev
```

---

### Problema: "Error: Address already in use :::3000" o ":::3001"

**Causa**: Otro proceso está usando ese puerto

**Solución:**

```powershell
# Encontrar y detener proceso en puerto 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# Encontrar y detener proceso en puerto 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# Luego reinicia los servidores
```

---

### Problema: "npm: no se encuentra"

**Causa**: Node.js no está instalado correctamente

**Solución:**
```powershell
# Verificar Node instalado
node --version

# Verificar npm instalado
npm --version

# Si no funcionan, ve a: https://nodejs.org/
# Descarga e instala Node.js LTS
```

---

### Problema: Los eventos no se registran

**Causa**: Probable que el CRUD se conecte mal al hub

**Solución:**
```powershell
# 1. Verificar que ambos servidores corran
curl http://localhost:3001/health
curl http://localhost:3000/health

# 2. Ver logs en la Terminal 1 (Event Manager)
# Deberías ver: ✅ Event [CREATE] registered

# 3. Si ves ❌ Error emitting event, reinicia ambos servidores
```

---

### Problema: "npm install no funciona"

**Causa**: Posible problema con la conexión o cache corrupto

**Solución:**
```powershell
# Limpiar cache de npm
npm cache clean --force

# Reinstalar
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm install

cd ..\epn-event-manager
npm install
```

---

### Problema: "Los productos no se guardan"

**Causa**: El servicio en memoria perdió los datos (reiniciaste el CRUD)

**Nota:** Esto es **normal**. Los productos se guardan en RAM, no en BD.

**Solución:** Los datos se pierden al reiniciar. Para persistencia, necesitarías agregar SQLite o PostgreSQL.

---

## 📊 Cosas que deberías probar

### 1. Test Completo de Creación

```powershell
# Crear un producto
curl -X POST http://localhost:3001/products `
  -H "Content-Type: application/json" `
  -d '{
    "name":"Desinfectante",
    "category":"desinfectantes",
    "quantity":50,
    "price":5.99,
    "description":"Prueba"
  }'

# Ver el evento en el hub
curl http://localhost:3000/events
```

Deberías ver el producto creado en response y el evento registrado en el hub.

---

### 2. Test de Listado

```powershell
# Listar todos los productos
curl http://localhost:3001/products

# Ver todos los eventos (incluye QUERY)
curl http://localhost:3000/events

# Ver solo eventos de tu origen
curl http://localhost:3000/events/source/cleaning-crud
```

---

### 3. Test de Filtrado

```powershell
# Ver eventos por entidad
curl http://localhost:3000/events/entity/product

# Ver estadísticas
curl http://localhost:3000/stats
```

---

## ⚡ Comandos Rápidos - Reiniciar Todo

Si todo está instalado y solo necesitas reiniciar los servidores:

```powershell
# Terminal 1
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\epn-event-manager
npm run start:dev

# Terminal 2 (nueva)
cd C:\Users\admin\IdeaProjects\EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main\cleaning-crud
npm run start:dev

# Navegador
http://localhost:3001
```

---

## 📁 Estructura de Carpetas - Dónde Buscar Código

```
EGUEZ-SARZOSA-VICENTE-ADRIAN-constswgr2-main/
│
├── cleaning-crud/                 ← TU INTERFAZ WEB
│   ├── src/
│   │   ├── main.ts               ← Inicia servidor
│   │   └── modules/products/     ← Lógica CRUD
│   │       └── products.service.ts ← Envía eventos aquí
│   ├── public/
│   │   ├── index.html            ← La interfaz web
│   │   ├── styles.css            ← Diseño
│   │   └── app.js                ← Lógica JavaScript
│   └── package.json
│
├── epn-event-manager/             ← EL HUB CENTRAL (CON ERRORES)
│   ├── src/
│   │   ├── main.ts
│   │   └── modules/events/
│   │       ├── events.service.ts  ← 🔴 AQUÍ ESTÁN LOS ERRORES
│   │       └── events.controller.ts
│   ├── db/
│   │   └── events.sqlite          ← Base de datos
│   └── package.json
│
└── PARA-JUNIORS.md               ← ESTE ARCHIVO
```

---

## 🔧 Dependencias Principales

### CRUD (`package.json`)
```json
{
  "dependencies": {
    "@nestjs/common": "11.0.1",
    "@nestjs/core": "11.0.1",
    "@nestjs/platform-express": "11.0.1",
    "axios": "^1.4.0",
    "typescript": "5.7.3"
  }
}
```

### Event Manager (`package.json`)
```json
{
  "dependencies": {
    "@nestjs/common": "11.0.1",
    "@nestjs/core": "11.0.1",
    "@nestjs/typeorm": "9.0.1",
    "typeorm": "^0.3.17",
    "sqlite3": "^5.1.6"
  }
}
```

---

## 📝 Notas Importantes

### Para Juniors Nuevos

1. **TypeScript**: Es JavaScript con tipos. Si no la conocen, no se preocupen. Los errores son claros.

2. **NestJS**: Es un framework para hacer backends. Piénsenlo como un organizador de código.

3. **Eventos**: Cada acción en el CRUD genera un "mensaje" que le dice al hub: "Oye, pasó algo aquí".

4. **SQLite**: Es una base de datos simple. Guardan datos en un archivo `.sqlite`.

5. **Los datos no persisten**: El CRUD pierde los productos al reiniciar (están en memoria). El hub guarda los eventos (en SQLite).

### Arquitectura "Mala a Propósito"

El Event Manager usa **4 tablas distintas** (una por tipo de operación) cuando debería usar **1 sola tabla** con una columna `action`.

Esto genera:
- Código duplicado
- Dificultad para hacer consultas
- Inconsistencias entre tablas

**Esto es intencional**. Es para que aprendan a reconocer malas decisiones arquitectónicas.

---

## 🎯 Próximas Sesiones

1. **Sesión 1**: Explorar la interfaz, crear productos, ver eventos
2. **Sesión 2**: Identificar errores en el Event Manager
3. **Sesión 3-6**: Corregir cada error aplicando el tipo de mantenimiento correcto

---

## 📞 Preguntas Frecuentes

### P: ¿Dónde se guardan los productos que creo?
R: En la **memoria RAM**. Si reinician el CRUD, se pierden. Los **eventos** sí se guardan en SQLite.

### P: ¿Si falla el Event Manager, falla el CRUD?
R: **No**. El CRUD sigue funcionando aunque falle. Simplemente no enviará eventos.

### P: ¿Por qué hay 4 tablas de eventos en lugar de 1?
R: **Exacto**. Es un error arquitectónico intencional. Es material de trabajo para ustedes.

### P: ¿Puedo ver el código del Event Manager?
R: **Sí**. Está en `epn-event-manager/src/modules/events/events.service.ts`. Ahí están los errores.

### P: ¿Cuál es el objetivo final?
R: Que aprendan a **identificar, clasificar y arreglar errores** en sistemas en producción.

---

## 🚀 ¡Listos para Comenzar!

La interfaz web ya está lista. Ahora a:

1. ✅ **Iniciar ambos servidores**
2. ✅ **Ir a http://localhost:3001**
3. ✅ **Crear algunos productos**
4. ✅ **Verificar que aparecen en el hub**
5. ✅ **Prepararse para la Fase 2: Mantenimiento**

---

## 📚 Recursos

- **NestJS Docs**: https://docs.nestjs.com
- **TypeScript**: https://www.typescriptlang.org/docs/
- **TypeORM**: https://typeorm.io/
- **SQLite**: https://www.sqlite.org/docs.html

---

## ✨ ¡Bienvenidos al Taller!

Ustedes están a punto de aprender algo muy valioso: **cómo mantener software real en el mundo actual**.

La mayoría del trabajo de un desarrollador es **mantenimiento**, no construcción desde cero.

Aprovechen este taller. 🚀

---

**Docente**: [Tu nombre]
**Objetivo**: Aprender los 4 tipos de mantenimiento de software
**Duración**: 6 sesiones
**Entregable Final**: Presentación del problema, solución y clasificación del mantenimiento

¡A trabajar! 💻

