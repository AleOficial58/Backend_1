Entrega N°1 — API de Productos y Carritos

Este proyecto es una API simple hecha con Node.js y Express para manejar productos y carritos. Los datos se guardan en archivos JSON dentro de la carpeta `data/`, así que no hace falta una base de datos externa: todo es local y fácil de probar.

Abajo te dejo cómo usarlo paso a paso, qué endpoints incluye y algunos consejos para que lo pruebes sin problemas (Postman o PowerShell).

Requisitos
- Node.js (recomiendo v14 o superior)
- npm (viene con Node)

Estructura importante
- `server.js` — arranca el servidor y monta las rutas.
- `src/routes/` — las rutas: `products` y `carts`.
- `src/managers/` — lógica para leer/escribir `data/*.json`.
- `data/` — aquí están `products.json` y `carts.json` (persistencia simple por archivos).
- `scripts/test_requests.js` — script que hace una secuencia de peticiones para validar el flujo.

Endpoints (resumen rápido)

Productos (/api/products)
- GET /api/products — lista todos los productos.
- GET /api/products/:pid — obtiene un producto por id.
- POST /api/products — crea un producto (el id se genera automáticamente).
- PUT /api/products/:pid — actualiza un producto (no permite cambiar el id).
- DELETE /api/products/:pid — elimina un producto.

Carritos (/api/carts)
- POST /api/carts — crea un carrito nuevo (devuelve id y products: []).
- GET /api/carts/:cid — obtiene los productos de un carrito.
- POST /api/carts/:cid/product/:pid — agrega el producto `pid` al carrito `cid` (si ya existe, suma 1 a `quantity`).

Arrancar y probar (PowerShell)

1) Abrir PowerShell en la carpeta del proyecto (donde está `server.js`).

2) Instalar dependencias (si hace falta):

```powershell
npm install
```

3) Iniciar el servidor:

```powershell
# ver logs en la misma ventana
node .\server.js

# o en segundo plano (no bloquea la terminal)
Start-Process -FilePath node -ArgumentList '.\server.js' -NoNewWindow
```

El servidor quedará escuchando en http://localhost:8080

4) Ejecutar las pruebas automáticas (script incluido):

```powershell
npm run test:api
# ó
node .\scripts\test_requests.js
```

El script crea un producto, lista productos, crea un carrito, añade el producto al carrito y muestra el carrito. Verás las respuestas en la consola.

Comandos rápidos (PowerShell) — ejemplos manuales

Crear producto (POST):

```powershell
$body = '{
  "title":"Producto prueba",
  "description":"Descripción",
  "code":"P001",
  "price":99.9,
  "status":true,
  "stock":20,
  "category":"test",
  "thumbnails":["/img/1.jpg"]
}'
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/products' -ContentType 'application/json' -Body $body
```

Listar productos (GET):

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/products'
```

Crear carrito (POST):

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/carts'
```

Agregar producto al carrito (POST):

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/carts/{cid}/product/{pid}"
```

Recuerda reemplazar `{cid}` y `{pid}` por los ids que obtengas al crear el carrito y el producto.

Problemas comunes y soluciones
- ECONNREFUSED: el servidor no está corriendo en el puerto 8080. Inicia `server.js` y vuelve a intentarlo.
- 404 en rutas: verifica que usas el prefijo `/api` (por ejemplo `/api/products`).
- Cambios que no se guardan: revisa permisos de escritura en `data/products.json` y `data/carts.json`.

Extras útiles
- En `package.json` hay un script `test:api` para ejecutar el script de comprobación.
- Si querés un modo de desarrollo con reinicio automático, puedo agregar `nodemon` y un script `dev`.

Si querés, dejo el repo limpio (muevo archivos antiguos a `archive/` o los borro) y actualizo el README con un pequeño changelog. ¿Lo hago ahora?