Entrega N°1 - API de Productos y Carritos

Este proyecto implementa un servidor HTTP usando Node.js y Express para gestionar productos y carritos de compra. Los datos se almacenan en dos archivos JSON (products.json y carts.json) ubicados en la raíz del proyecto.

A continuación, te explico cómo arrancar el servidor y cómo ejecutar las pruebas automáticas que he incluido para verificar que el flujo básico funcione correctamente (crear producto, listar productos, crear carrito y agregar productos a un carrito).

Requisitos

Node.js (v14+ recomendado)

npm (opcional)

Estructura del proyecto

server.js: Arranca el servidor en el puerto 8080 y monta las rutas.

routes/products.js: Endpoints relacionados a productos (/api/products).

routes/carts.js: Endpoints relacionados a carritos (/api/carts).

managers/ProductManager.js: Lógica de persistencia para productos (usa products.json).

managers/CartManager.js: Lógica de persistencia para carritos (usa carts.json).

products.json, carts.json: Archivos donde se guardan los datos.

test_requests.js: Script en Node.js que realiza una serie de peticiones para validar el flujo (crear productos, listar productos, crear carrito y agregar productos).

Endpoints disponibles
Productos (/api/products):

GET /api/products: Lista todos los productos.

GET /api/products/:pid: Obtiene un producto por su ID.

POST /api/products: Crea un nuevo producto. El ID se genera automáticamente.

PUT /api/products/:pid: Actualiza un producto (no se puede cambiar el id).

DELETE /api/products/:pid: Elimina un producto.

Carritos (/api/carts):

POST /api/carts: Crea un nuevo carrito. Devuelve un objeto con el id y una lista de productos vacía.

GET /api/carts/:cid: Obtiene un carrito por su ID.

POST /api/carts/:cid/product/:pid: Agrega el producto con ID pid al carrito con ID cid (si ya existe, aumenta la cantidad).

Cómo ejecutar el servidor (en PowerShell)

Abre PowerShell en la carpeta del proyecto (donde está server.js).

(Opcional) Instala las dependencias necesarias si aún no lo has hecho:

npm install


Arranca el servidor:

Opción A: En la misma ventana (verás los logs):

node .\server.js


Opción B: Como proceso separado (sin bloquear la terminal):

Start-Process -FilePath node -ArgumentList '.\server.js' -NoNewWindow


El servidor estará escuchando en: http://localhost:8080

Ejecuta el script de pruebas para validar el flujo básico (crear un producto, listar productos, crear un carrito, agregar un producto al carrito y mostrar el carrito):

node .\test_requests.js


Verás las respuestas y los status HTTP de cada paso en la consola.

Ejemplos rápidos con PowerShell (manual)

Crear un producto (POST):

$body = '{
  "title": "Producto prueba",
  "description": "Producto de prueba",
  "code": "P001",
  "price": 99.9,
  "status": true,
  "stock": 20,
  "category": "test",
  "thumbnails": ["/img/1.jpg"]
}'
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/products' -ContentType 'application/json' -Body $body


Listar productos (GET):

Invoke-RestMethod -Uri 'http://localhost:8080/api/products'


Crear un carrito (POST):

Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/carts'


Agregar un producto al carrito (POST):

Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/carts/{cid}/product/{pid}"


Recuerda reemplazar {cid} y {pid} por los valores que obtuviste en las llamadas anteriores.

Qué hacer si algo falla

ECONNREFUSED: Esto significa que el servidor no está escuchando en el puerto 8080. Asegúrate de haber arrancado server.js antes de hacer peticiones o ejecutar el script.

404 en alguna ruta: Verifica que estés utilizando las rutas correctas (/api/products y /api/carts). El prefijo está definido en server.js.

Problemas de permisos de escritura: Si los cambios no se guardan, asegúrate de que los archivos products.json y carts.json sean escribibles por el usuario.

Sugerencias opcionales

Puedes añadir algunos scripts en el package.json para facilitar su uso:

"scripts": {
  "start": "node server.js",
  "test:api": "node test_requests.js"
}