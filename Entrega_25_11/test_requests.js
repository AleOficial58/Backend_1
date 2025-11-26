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
    console.log('1) Crear producto de prueba');
    const prod = await doRequest('POST', '/api/products', {
      title: 'Producto prueba',
      description: 'Producto para pruebas',
      code: 'P001',
      price: 99.9,
      status: true,
      stock: 20,
      category: 'test',
      thumbnails: ['/img/1.jpg']
    });
    console.log('RESPUESTA:', prod);

    const pid = (prod.body && prod.body.id) ? prod.body.id : null;

    console.log('\n2) Listar productos');
    const list = await doRequest('GET', '/api/products');
    console.log('RESPUESTA:', list);

    console.log('\n3) Crear carrito');
    const cart = await doRequest('POST', '/api/carts');
    console.log('RESPUESTA:', cart);
    const cid = (cart.body && cart.body.id) ? cart.body.id : null;

    if (cid && pid) {
      console.log(`\n4) Agregar producto ${pid} al carrito ${cid}`);
      const add = await doRequest('POST', `/api/carts/${cid}/product/${pid}`);
      console.log('RESPUESTA:', add);

      console.log(`\n5) Ver carrito ${cid}`);
      const show = await doRequest('GET', `/api/carts/${cid}`);
      console.log('RESPUESTA:', show);
    } else {
      console.log('\nNo se obtuvieron ids (pid/cid), no se realiza la prueba de agregado al carrito.');
    }
  } catch (err) {
    console.error('Error en pruebas:', err);
  }
})();
