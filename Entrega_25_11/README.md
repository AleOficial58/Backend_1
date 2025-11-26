# Entrega N°1 - API de Productos y Carritos

Este proyecto implementa un servidor HTTP con Node.js y Express para gestionar productos y carritos de compra. La persistencia se realiza mediante archivos JSON (`products.json` y `carts.json`) en la raíz del proyecto.

Este README explica cómo arrancar el servidor y cómo ejecutar las pruebas automáticas que incluí para verificar el flujo básico (crear producto, listar productos, crear carrito y agregar producto al carrito).

## Requisitos
- Node.js (v14+ recomendado)
- npm (opcional)

## Estructura importante
- `server.js` - arranca el servidor en el puerto 8080 y monta las rutas
- `routes/products.js` - endpoints para productos (/api/products)
- `routes/carts.js` - endpoints para carritos (/api/carts)
- `managers/ProductManager.js` - lógica de persistencia para productos (usa `products.json`)
- `managers/CartManager.js` - lógica de persistencia para carritos (usa `carts.json`)
- `products.json`, `carts.json` - archivos donde se guardan los datos
- `test_requests.js` - pequeño script Node que realiza una serie de requests para validar el flujo

## Endpoints disponibles

Productos (`/api/products`):
- GET `/api/products` - listar todos los productos
- GET `/api/products/:pid` - obtener producto por id
- POST `/api/products` - crear producto (el `id` se autogenera)
- PUT `/api/products/:pid` - actualizar producto (no se puede cambiar `id`)
- DELETE `/api/products/:pid` - eliminar producto

Carritos (`/api/carts`):
- POST `/api/carts` - crear nuevo carrito (devuelve `id` y `products: []`)
- GET `/api/carts/:cid` - obtener carrito por id
- POST `/api/carts/:cid/product/:pid` - agregar el producto `pid` al carrito `cid` (incrementa `quantity` si ya existe)

## Cómo ejecutar (Windows PowerShell)

1. Abrir PowerShell en la carpeta del proyecto (donde está `server.js`).

2. (Opcional) Instalar dependencias si las hubiera:

```powershell
npm install
```

3. Arrancar el servidor:

Opción A — en la misma ventana (verás logs):

```powershell
node .\server.js
```

Opción B — como proceso separado (no bloqueante):

```powershell
Start-Process -FilePath node -ArgumentList '.\server.js' -NoNewWindow
```

El servidor escucha en: http://localhost:8080

4. Ejecutar el script de pruebas que incluye una secuencia automática (crear producto, listar, crear carrito, agregar producto y mostrar carrito):

```powershell
node .\test_requests.js
```

Verás en la consola las respuestas de cada paso y los status HTTP devueltos.

## Ejemplos rápidos con PowerShell (manual)

- Crear producto (POST):

```powershell
$body = '{
  "title":"Producto prueba",
  "description":"Producto de prueba",
  "code":"P001",
  "price":99.9,
  "status":true,
  "stock":20,
  "category":"test",
  "thumbnails":["/img/1.jpg"]
}'
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/products' -ContentType 'application/json' -Body $body
```

- Listar productos (GET):

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/products'
```

- Crear carrito (POST):

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/carts'
```

- Agregar producto al carrito (POST):

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/carts/{cid}/product/{pid}"
```

Reemplaza `{cid}` y `{pid}` por los ids devueltos por las llamadas previas.

## Qué comprobar si algo falla
- ECONNREFUSED: significa que no hay servidor escuchando en el puerto 8080. Asegúrate de arrancar `server.js` antes de ejecutar el script o las peticiones.
- 404 en alguna ruta: verifica que usas `/api/products` y `/api/carts` (el prefijo está definido en `server.js`).
- Permisos escritura: si los cambios no persisten, confirma que `products.json` y `carts.json` son escribibles por el usuario.

## Sugerencias opcionales
- Puedo añadir scripts npm en `package.json` para facilitar:

```json
"scripts": {
  "start": "node server.js",
  "test:api": "node test_requests.js"
}
```

- También puedo mover los JSON a una carpeta `data/` y actualizar las rutas si prefieres orden.

---

Si quieres, creo ahora el `README.md` en tu proyecto (ya lo añadí) y también puedo agregar los scripts npm o mover los JSON a `data/`. ¿Qué prefieres que haga a continuación?
