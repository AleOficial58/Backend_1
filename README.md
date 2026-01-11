# Ecommerce - Entrega Final

Proyecto de e-commerce profesional implementado con Node.js, Express, MongoDB y Handlebars.

## Características Principales

### 1. MongoDB como Sistema de Persistencia
- Conectado a MongoDB con Mongoose
- Modelos de Producto y Carrito con referencias
- Índices para optimizar búsquedas

### 2. Gestión de Productos

#### GET `/api/products` - Listar productos con filtros y paginación
Parámetros de query:
- `limit` (opcional, default: 10) - Cantidad de productos por página
- `page` (opcional, default: 1) - Número de página
- `query` (opcional) - Filtro por categoría o disponibilidad
- `sort` (opcional) - Ordenamiento: `asc` o `desc` por precio

**Respuesta:**
```json
{
  "status": "success",
  "payload": [...productos],
  "totalPages": 5,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/products?page=2&limit=10"
}
```

#### GET `/api/products/:pid` - Obtener producto por ID

#### POST `/api/products` - Crear nuevo producto
Body requerido:
```json
{
  "title": "string",
  "description": "string",
  "code": "string (único)",
  "price": "number",
  "status": "boolean",
  "stock": "number",
  "category": "string",
  "thumbnails": ["array de URLs"]
}
```

#### PUT `/api/products/:pid` - Actualizar producto

#### DELETE `/api/products/:pid` - Eliminar producto

### 3. Gestión de Carritos

#### POST `/api/carts` - Crear nuevo carrito

#### GET `/api/carts/:cid` - Obtener carrito con productos populados

#### POST `/api/carts/:cid/products/:pid` - Agregar producto al carrito
- Si el producto ya existe, incrementa la cantidad

#### PUT `/api/carts/:cid/products/:pid` - Actualizar cantidad de un producto
Body requerido:
```json
{
  "quantity": "number"
}
```

#### DELETE `/api/carts/:cid/products/:pid` - Eliminar producto del carrito

#### PUT `/api/carts/:cid` - Actualizar todos los productos del carrito
Body requerido:
```json
{
  "products": [
    { "product": "productId", "quantity": "number" },
    ...
  ]
}
```

#### DELETE `/api/carts/:cid` - Vaciar carrito (eliminar todos los productos)

### 4. Vistas

#### GET `/` - Home con catálogo paginado
- Muestra productos con paginación
- Filtros por categoría y disponibilidad
- Ordenamiento por precio
- Botones para ver detalles o agregar al carrito

#### GET `/products` - Vista alternativa de productos

#### GET `/products/:pid` - Vista detallada de producto
- Muestra información completa del producto
- Botón para agregar al carrito
- Enlace para volver al catálogo

#### GET `/carts/:cid` - Vista del carrito
- Lista productos en el carrito
- Permite modificar cantidades
- Opción para eliminar productos o vaciar carrito
- Resumen con total

#### GET `/realtimeproducts` - Vista de productos en tiempo real con WebSockets

## Instalación

```bash
# Instalar dependencias
npm install

# Asegúrate de tener MongoDB ejecutándose
# Por defecto conecta a mongodb://localhost:27017/ecommerce

# Iniciar el servidor
npm start
```

## Variables de Entorno

Puedes configurar la URI de MongoDB en `src/config/mongodb.js`:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
```

## Estructura del Proyecto

```
Backend_1/
├── src/
│   ├── config/
│   │   └── mongodb.js          # Configuración de conexión a MongoDB
│   ├── models/
│   │   ├── Product.js          # Schema y modelo de Producto
│   │   └── Cart.js             # Schema y modelo de Carrito
│   ├── managers/
│   │   ├── ProductManager.js   # Lógica de gestión de productos
│   │   └── CartManager.js      # Lógica de gestión de carritos
│   ├── routes/
│   │   ├── products.js         # Rutas de API de productos
│   │   ├── carts.js            # Rutas de API de carritos
│   │   └── views.js            # Rutas de vistas (Handlebars)
├── views/
│   ├── layouts/
│   │   └── main.handlebars     # Layout principal
│   ├── home.handlebars         # Vista del catálogo
│   ├── products.handlebars     # Vista alternativa de productos
│   ├── productDetail.handlebars # Vista detallada de producto
│   ├── cart.handlebars         # Vista del carrito
│   ├── error.handlebars        # Vista de error
│   └── realtimeProducts.handlebars # Vista de productos en tiempo real
├── public/
│   ├── styles.css              # Estilos CSS
│   └── js/
│       └── realtime.js         # Lógica de WebSockets para realtime
├── server.js                   # Punto de entrada de la aplicación
├── package.json                # Dependencias del proyecto
└── .gitignore                  # Archivos a ignorar en Git
```

## Funcionalidades Implementadas

### ✅ Productos
- Paginación profesional (limit, page)
- Filtros por categoría y disponibilidad
- Ordenamiento ascendente/descendente por precio
- Respuesta con información de paginación y links

### ✅ Carritos
- Referencia a productos mediante populate
- Agregar/eliminar productos
- Actualizar cantidad de productos
- Actualizar carrito completo
- Vaciar carrito

### ✅ Vistas
- Catálogo con paginación visual
- Vista detallada de productos
- Carrito de compras interactivo
- Filtros y búsqueda en el catálogo
- Diseño responsive

## Ejemplos de Uso

### Listar productos con filtros
```
GET /api/products?limit=10&page=1&query=electronics&sort=asc
```

### Crear carrito
```
POST /api/carts
```

### Agregar producto al carrito
```
POST /api/carts/{cartId}/products/{productId}
```

### Actualizar cantidad de producto
```
PUT /api/carts/{cartId}/products/{productId}
Body: { "quantity": 5 }
```

### Vaciar carrito
```
DELETE /api/carts/{cartId}
```

## Dependencias

- **express**: Framework web
- **express-handlebars**: Motor de plantillas
- **mongoose**: ODM para MongoDB
- **socket.io**: Comunicación en tiempo real

## Notas Importantes

1. MongoDB debe estar ejecutándose antes de iniciar la aplicación
2. Los productos se almacenan en MongoDB con referencias
3. Los carritos usan populate para obtener datos completos de productos
4. La paginación es profesional con links directos a otras páginas
5. El código incluye validaciones y manejo de errores

## Autor

Entrega Final - Proyecto de Ecommerce

## Licencia

ISC
