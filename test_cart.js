// Test script para verificar que el carrito funciona correctamente
const fetch = require('node-fetch');

const API = 'http://localhost:8080/api';

async function testCart() {
  try {
    console.log('=== PRUEBA DE CARRITO ===\n');

    // 1. Crear carrito
    console.log('1. Creando carrito...');
    const cartRes = await fetch(`${API}/carts`, { method: 'POST' });
    const cart = await cartRes.json();
    const cartId = cart._id;
    console.log('✓ Carrito creado:', cartId);
    console.log('  Contenido:', JSON.stringify(cart, null, 2));

    // 2. Obtener el primer producto
    console.log('\n2. Obteniendo productos...');
    const productsRes = await fetch(`${API}/products?limit=1`);
    const productsData = await productsRes.json();
    const product = productsData.payload[0];
    const productId = product._id;
    console.log('✓ Primer producto:', product.title);
    console.log('  ID:', productId);

    // 3. Agregar producto al carrito
    console.log('\n3. Agregando producto al carrito...');
    const addRes = await fetch(`${API}/carts/${cartId}/products/${productId}`, {
      method: 'POST'
    });
    const updatedCart = await addRes.json();
    console.log('✓ Producto agregado');
    console.log('  Carrito actualizado:', JSON.stringify(updatedCart, null, 2));

    // 4. Obtener carrito (verificar populate)
    console.log('\n4. Obteniendo carrito con productos...');
    const getCartRes = await fetch(`${API}/carts/${cartId}`);
    const cartWithProducts = await getCartRes.json();
    console.log('✓ Carrito obtenido:');
    console.log('  Estructura:', JSON.stringify(cartWithProducts, null, 2));
    
    // Verificar que los productos están completos (populate)
    if (cartWithProducts.products && cartWithProducts.products[0]) {
      const cartProduct = cartWithProducts.products[0];
      if (cartProduct.product && cartProduct.product.title) {
        console.log('\n✓ ¡ÉXITO! El populate funciona correctamente');
        console.log('  Producto en carrito:', {
          title: cartProduct.product.title,
          price: cartProduct.product.price,
          quantity: cartProduct.quantity
        });
      } else {
        console.log('\n✗ PROBLEMA: El producto no tiene title/price');
        console.log('  Estructura del producto:', JSON.stringify(cartProduct.product, null, 2));
      }
    }

    // 5. Probar actualizar cantidad
    console.log('\n5. Actualizando cantidad a 5...');
    const updateRes = await fetch(`${API}/carts/${cartId}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 5 })
    });
    const updatedCart2 = await updateRes.json();
    console.log('✓ Cantidad actualizada:', updatedCart2.products[0].quantity);

    // 6. Probar vista del carrito
    console.log('\n6. Accediendo a la vista del carrito...');
    console.log(`   URL: http://localhost:8080/carts/${cartId}`);
    console.log('   Abre esta URL en el navegador para verificar el render');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testCart();
