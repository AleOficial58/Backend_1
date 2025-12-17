const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

// Home: render server-side list of products
router.get('/', async (req, res) => {
  const products = await productManager.getAll();
  res.render('home', { products });
});

// Realtime products view
router.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getAll();
  res.render('realtimeProducts', { products });
});

module.exports = router;
