const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');
const productManager = new ProductManager();
const cartManager = new CartManager();

/**
 * GET / - Home: lista de productos paginada
 */
router.get('/', async (req, res) => {
  try {
    const { limit, page, query, sort } = req.query;
    const result = await productManager.getAll({ limit, page, query, sort });
    // Ensure Mongoose documents are plain objects for Handlebars
    const products = Array.isArray(result.payload)
      ? result.payload.map(p => (p && typeof p.toObject === 'function' ? p.toObject() : p))
      : [];
    console.log('Rendering / (home) - sample product:', products && products[0]);
    
    res.render('home', { 
      products,
      pagination: {
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        totalPages: result.totalPages,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
      }
    });
  } catch (err) {
    console.error('Error en GET /:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /products - Vista de productos con paginación (alternativa)
 */
router.get('/products', async (req, res) => {
  try {
    const { limit, page, query, sort } = req.query;
    const result = await productManager.getAll({ limit, page, query, sort });
    const products = Array.isArray(result.payload)
      ? result.payload.map(p => (p && typeof p.toObject === 'function' ? p.toObject() : p))
      : [];
    console.log('Rendering /products - sample product:', products && products[0]);
    
    res.render('products', { 
      products,
      pagination: {
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        totalPages: result.totalPages,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
      }
    });
  } catch (err) {
    console.error('Error en GET /products:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /products/:pid - Vista detallada de un producto
 * Con opción de agregar al carrito
 */
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }
    
    res.render('productDetail', { product });
  } catch (err) {
    console.error('Error en GET /products/:pid:', err);
    res.status(500).render('error', { message: err.message });
  }
});

/**
 * GET /carts/:cid - Vista del carrito con productos
 */
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    let cart = null;
    
    // Intentar obtener el carrito si el ID es válido
    if (cid && cid.match(/^[0-9a-fA-F]{24}$/)) {
      cart = await cartManager.getCartById(cid);
    }
    
    // Si no existe o el ID no es válido, mostrar un carrito vacío
    if (!cart) {
      cart = { products: [] };
    }
    
    res.render('cart', { 
      cart,
      cartId: cid
    });
  } catch (err) {
    console.error('Error en GET /carts/:cid:', err);
    // Mostrar carrito vacío incluso en caso de error
    res.render('cart', { 
      cart: { products: [] },
      cartId: req.params.cid
    });
  }
});

// Realtime products view
router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getAll();
    const products = Array.isArray(result.payload)
      ? result.payload.map(p => (p && typeof p.toObject === 'function' ? p.toObject() : p))
      : [];
    console.log('Rendering /realtimeproducts - sample product:', products && products[0]);
    res.render('realtimeProducts', { products });
  } catch (err) {
    console.error('Error en GET /realtimeproducts:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
