/**
 * Test Requests para la API de Ecommerce
 * Ejecutar con: node scripts/test_requests.js
 * 
 * Asegúrate de que MongoDB esté ejecutándose antes de correr estos tests
 */

const http = require('http');

function doRequest(method, path, data) {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path,
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('🚀 INICIANDO PRUEBAS DE API DE ECOMMERCE\n');

    // ===== PRUEBAS DE PRODUCTOS =====
    console.log('=== PRUEBAS DE PRODUCTOS ===\n');

    console.log('1) Crear producto de prueba');
    const prod1 = await doRequest('POST', '/api/products', {
      title: 'Laptop Gaming',
      description: 'Laptop de alto rendimiento para gaming',
      code: 'LG-001',
      price: 1500,
      status: true,
      stock: 10,
      category: 'electronics',
      thumbnails: []
    });
    console.log('Status:', prod1.status, '\n');
    const pid1 = (prod1.body && prod1.body._id) ? prod1.body._id : null;

    console.log('2) Crear segundo producto');
    const prod2 = await doRequest('POST', '/api/products', {
      title: 'Mouse Inalámbrico',
      description: 'Mouse inalámbrico con batería larga',
      code: 'MS-001',
      price: 45,
      status: true,
      stock: 50,
      category: 'electronics',
      thumbnails: []
    });
    console.log('Status:', prod2.status, '\n');
    const pid2 = (prod2.body && prod2.body._id) ? prod2.body._id : null;

    console.log('3) Crear tercer producto');
    const prod3 = await doRequest('POST', '/api/products', {
      title: 'Teclado Mecánico',
      description: 'Teclado mecánico RGB',
      code: 'KB-001',
      price: 120,
      status: true,
      stock: 25,
      category: 'electronics',
      thumbnails: []
    });
    console.log('Status:', prod3.status, '\n');
    const pid3 = (prod3.body && prod3.body._id) ? prod3.body._id : null;

    console.log('4) Listar todos los productos (sin filtros)');
    const listAll = await doRequest('GET', '/api/products');
    console.log('Status:', listAll.status, 'Total de páginas:', listAll.body.totalPages, '\n');

    console.log('5) Listar productos con paginación (limit=2, page=1)');
    const listPage = await doRequest('GET', '/api/products?limit=2&page=1');
    console.log('Status:', listPage.status, 'Página:', listPage.body.page, 'de', listPage.body.totalPages, '\n');

    console.log('6) Filtrar por categoría (query=electronics)');
    const listFilter = await doRequest('GET', '/api/products?query=electronics');
    console.log('Status:', listFilter.status, 'Productos encontrados:', listFilter.body.payload.length, '\n');

    console.log('7) Ordenar por precio ascendente (sort=asc)');
    const listAsc = await doRequest('GET', '/api/products?sort=asc');
    console.log('Status:', listAsc.status, '\n');

    console.log('8) Ordenar por precio descendente (sort=desc)');
    const listDesc = await doRequest('GET', '/api/products?sort=desc');
    console.log('Status:', listDesc.status, '\n');

    if (pid1) {
      console.log('9) Obtener producto por ID');
      const getProd = await doRequest('GET', `/api/products/${pid1}`);
      console.log('Status:', getProd.status, 'Producto:', getProd.body.title, '\n');

      console.log('10) Actualizar producto');
      const updateProd = await doRequest('PUT', `/api/products/${pid1}`, {
        price: 1400,
        stock: 8
      });
      console.log('Status:', updateProd.status, 'Nuevo precio:', updateProd.body.price, '\n');
    }

    // ===== PRUEBAS DE CARRITOS =====
    console.log('\n=== PRUEBAS DE CARRITOS ===\n');

    console.log('11) Crear carrito');
    const cart = await doRequest('POST', '/api/carts');
    console.log('Status:', cart.status, '\n');
    const cid = (cart.body && cart.body._id) ? cart.body._id : null;

    if (cid && pid1 && pid2 && pid3) {
      console.log('12) Agregar primer producto al carrito');
      const add1 = await doRequest('POST', `/api/carts/${cid}/products/${pid1}`);
      console.log('Status:', add1.status, '\n');

      console.log('13) Agregar segundo producto al carrito');
      const add2 = await doRequest('POST', `/api/carts/${cid}/products/${pid2}`);
      console.log('Status:', add2.status, '\n');

      console.log('14) Obtener carrito (con populate)');
      const getCart = await doRequest('GET', `/api/carts/${cid}`);
      console.log('Status:', getCart.status, 'Productos en carrito:', getCart.body.products.length, '\n');

      console.log('15) Actualizar cantidad de primer producto a 3');
      const updateQty = await doRequest('PUT', `/api/carts/${cid}/products/${pid1}`, {
        quantity: 3
      });
      console.log('Status:', updateQty.status, '\n');

      console.log('16) Agregar tercer producto');
      const add3 = await doRequest('POST', `/api/carts/${cid}/products/${pid3}`);
      console.log('Status:', add3.status, '\n');

      console.log('17) Obtener carrito actualizado');
      const getCart2 = await doRequest('GET', `/api/carts/${cid}`);
      console.log('Status:', getCart2.status, 'Productos en carrito:', getCart2.body.products.length, '\n');

      console.log('18) Eliminar segundo producto del carrito');
      const deleteProd = await doRequest('DELETE', `/api/carts/${cid}/products/${pid2}`);
      console.log('Status:', deleteProd.status, '\n');

      console.log('19) Actualizar carrito completo con nuevo array de productos');
      const updateCart = await doRequest('PUT', `/api/carts/${cid}`, {
        products: [
          { product: pid1, quantity: 2 },
          { product: pid3, quantity: 1 }
        ]
      });
      console.log('Status:', updateCart.status, 'Productos en carrito:', updateCart.body.products.length, '\n');

      console.log('20) Obtener carrito final');
      const getCartFinal = await doRequest('GET', `/api/carts/${cid}`);
      console.log('Status:', getCartFinal.status, 'Productos en carrito:', getCartFinal.body.products.length, '\n');

      console.log('21) Vaciar carrito');
      const emptyCart = await doRequest('DELETE', `/api/carts/${cid}`);
      console.log('Status:', emptyCart.status, 'Productos en carrito:', emptyCart.body.products.length, '\n');
    } else {
      console.log('⚠️  No se obtuvieron IDs correctos, saltando pruebas de carrito');
    }

    if (pid1) {
      console.log('22) Eliminar producto');
      const deleteProd = await doRequest('DELETE', `/api/products/${pid1}`);
      console.log('Status:', deleteProd.status, '\n');
    }

    console.log('✅ PRUEBAS COMPLETADAS\n');

  } catch (err) {
    console.error('❌ Error en pruebas:', err);
  }
})();
