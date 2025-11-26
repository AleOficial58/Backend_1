const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

// Crear carrito
router.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.json(newCart);
});

// Listar productos de un carrito
router.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);
  res.json(cart || { error: 'Carrito no encontrado' });
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const updatedCart = await cartManager.addProduct(req.params.cid, req.params.pid);
  res.json(updatedCart);
});

module.exports = router;
