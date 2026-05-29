# CLEANING CRUD - SQLite

## Iniciar

```powershell
cd "C:\Users\ERICK CAICEDO\IdeaProjects\constswgr2\cleaning-crud"
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
& "C:\Program Files\nodejs\npm.cmd" run start:dev
```

## Cuando veas:
```
✅ Base de datos con 3 productos existentes
🧹 Cleaning CRUD running on http://localhost:3001
```

## Probar:
```
curl http://localhost:3001/products
```

**BD:** `database.sqlite` - Crea automáticamente con 3 productos.

