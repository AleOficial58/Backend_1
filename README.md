# Entrega N°1 — API de Productos y Carritos

## Descripción General

Este proyecto implementa un servidor HTTP basado en Node.js y Express para gestionar una API de productos y carritos de compra. El servidor expone dos grupos de rutas principales: `/api/products` para la gestión de productos y `/api/carts` para la gestión de carritos. Los datos se persisten mediante archivos JSON (`products.json` y `carts.json`) ubicados en la carpeta `data/`, utilizando managers específicos para cada entidad.

## Requisitos del Sistema

- **Node.js** v14 o superior
- **npm** (incluido con Node.js)

## Estructura del Proyecto

```
.
├── server.js                 # Punto de entrada — configura Express y monta las rutas
├── package.json              # Dependencias y scripts
├── README.md                 # Este archivo
├── src/
│   ├── routes/
│   │   ├── products.js      # Rutas para /api/products
│   │   └── carts.js         # Rutas para /api/carts
│   └── managers/
│       ├── ProductManager.js # Lógica de persistencia de productos
│       └── CartManager.js    # Lógica de persistencia de carritos
├── data/
│   ├── products.json        # Almacenamiento de productos
│   └── carts.json           # Almacenamiento de carritos
└── scripts/
    └── test_requests.js     # Script para validar el flujo de la API
```

## Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor

El servidor escuchará en `http://localhost:8080`

```bash
npm start
# o
node .\server.js
```

### 3. Ejecutar las pruebas incluidas

```bash
npm run test:api
# o
node .\scripts\test_requests.js
```

El script de pruebas valida el flujo completo: crea un producto, lista productos, crea un carrito, agrega el producto al carrito y verifica su contenido.

---

## Endpoints de la API

### Productos (`/api/products`)

#### GET /api/products
Obtiene todos los productos registrados.

**Respuesta (200 OK):**
```json
[
  {
    "id": "1764114820009",
    "title": "Producto ejemplo",
    "description": "Descripción del producto",
    "code": "P001",
    "price": 99.9,
    "status": true,
    "stock": 20,
    "category": "test",
    "thumbnails": ["/img/1.jpg"]
  }
]
```

#### GET /api/products/:pid
Obtiene un producto específico por su ID.

**Parámetros:**
- `pid` (path): ID del producto

**Respuesta (200 OK):**
```json
{
  "id": "1764114820009",
  "title": "Producto ejemplo",
  "description": "Descripción del producto",
  "code": "P001",
  "price": 99.9,
  "status": true,
  "stock": 20,
  "category": "test",
  "thumbnails": ["/img/1.jpg"]
}
```

**Error (404 Not Found):**
```json
{ "error": "Producto no encontrado" }
```

#### POST /api/products
Crea un nuevo producto. El ID se genera automáticamente de forma única.

**Body (JSON):**
```json
{
  "title": "Nuevo producto",
  "description": "Descripción",
  "code": "P002",
  "price": 149.99,
  "status": true,
  "stock": 50,
  "category": "electrónica",
  "thumbnails": ["/img/producto.jpg"]
}
```

**Respuesta (201 Created):**
```json
{
  "id": "1764117386954",
  "title": "Nuevo producto",
  "description": "Descripción",
  "code": "P002",
  "price": 149.99,
  "status": true,
  "stock": 50,
  "category": "electrónica",
  "thumbnails": ["/img/producto.jpg"]
}
```

#### PUT /api/products/:pid
Actualiza un producto. El ID no puede ser modificado.

**Parámetros:**
- `pid` (path): ID del producto a actualizar

**Body (JSON):** Cualquier campo excepto `id`
```json
{
  "price": 129.99,
  "stock": 45
}
```

**Respuesta (200 OK):** Producto actualizado

#### DELETE /api/products/:pid
Elimina un producto por su ID.

**Parámetros:**
- `pid` (path): ID del producto a eliminar

**Respuesta (200 OK):**
```json
{ "message": "Producto eliminado" }
```

---

### Carritos (`/api/carts`)

#### POST /api/carts
Crea un nuevo carrito vacío. El ID se genera automáticamente.

**Respuesta (200 OK):**
```json
{
  "id": 1764117386965,
  "products": []
}
```

#### GET /api/carts/:cid
Obtiene los productos de un carrito específico.

**Parámetros:**
- `cid` (path): ID del carrito

**Respuesta (200 OK):**
```json
{
  "id": 1764117386965,
  "products": [
    {
      "product": "1764117386954",
      "quantity": 2
    }
  ]
}
```

#### POST /api/carts/:cid/product/:pid
Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad en 1.

**Parámetros:**
- `cid` (path): ID del carrito
- `pid` (path): ID del producto a agregar

**Respuesta (200 OK):**
```json
{
  "id": 1764117386965,
  "products": [
    {
      "product": "1764117386954",
      "quantity": 1
    }
  ]
}
```

---

## Ejemplos de Uso (PowerShell)

### Crear un producto

```powershell
$body = '{
  "title": "Laptop",
  "description": "Laptop de 15 pulgadas",
  "code": "LAP001",
  "price": 1299.99,
  "status": true,
  "stock": 10,
  "category": "electrónica",
  "thumbnails": ["/img/laptop.jpg"]
}'

Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/products' `
  -ContentType 'application/json' -Body $body
```

### Listar todos los productos

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/products'
```

### Obtener un producto por ID

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/products/1764117386954'
```

### Crear un carrito

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/carts'
```

### Agregar un producto a un carrito

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/carts/1764117386965/product/1764117386954'
```

---

## Persistencia de Datos

- Los productos se guardan en `data/products.json`
- Los carritos se guardan en `data/carts.json`
- Los datos se persisten automáticamente después de cada operación (CREATE, UPDATE, DELETE)
- No se requiere base de datos externa; todo se maneja mediante el sistema de archivos

## Manejo de Errores

- **400 Bad Request**: Campos requeridos faltantes en la solicitud
- **404 Not Found**: Recurso no encontrado (producto o carrito inexistente)
- **500 Internal Server Error**: Error del servidor

---

**Última actualización:** 25 de noviembre de 2025