const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

/**
 * POST / - Crear un nuevo carrito
 */
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (err) {
    console.error('Error en POST /:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /:cid - Obtener carrito por ID con productos completos (populate)
 */
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    console.error('Error en GET /:cid:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /:cid/products/:pid - Agregar producto al carrito
 */
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.addProduct(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (err) {
    console.error('Error en POST /:cid/products/:pid:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /:cid/products/:pid - Eliminar un producto específico del carrito
 */
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.deleteProduct(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (err) {
    console.error('Error en DELETE /:cid/products/:pid:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /:cid/products/:pid - Actualizar SÓLO la cantidad de un producto
 * Body: { quantity: número }
 */
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Se requiere la propiedad "quantity"' });
    }

    const updatedCart = await cartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );
    res.json(updatedCart);
  } catch (err) {
    console.error('Error en PUT /:cid/products/:pid:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /:cid - Actualizar todos los productos del carrito
 * Body: { products: [ { product: pid, quantity: qty }, ... ] }
 */
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products) {
      return res.status(400).json({ error: 'Se requiere la propiedad "products"' });
    }

    const updatedCart = await cartManager.updateCart(req.params.cid, products);
    res.json(updatedCart);
  } catch (err) {
    console.error('Error en PUT /:cid:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /:cid - Eliminar todos los productos del carrito (vaciarlo)
 */
router.delete('/:cid', async (req, res) => {
  try {
    const updatedCart = await cartManager.deleteCart(req.params.cid);
    res.json(updatedCart);
  } catch (err) {
    console.error('Error en DELETE /:cid:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
