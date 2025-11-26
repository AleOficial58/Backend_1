const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

// Listar todos los productos
router.get('/', async (req, res) => {
  const products = await productManager.getAll();
  res.json(products);
});

// Traer producto por id
router.get('/:pid', async (req, res) => {
  const product = await productManager.getById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

// Agregar nuevo producto (id autogenerado)
router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;

  // validación básica
  if (!title || !description || !code || price === undefined || status === undefined || stock === undefined || !category) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const productData = {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails: Array.isArray(thumbnails) ? thumbnails : []
  };

  const newProduct = await productManager.addProduct(productData);
  res.status(201).json(newProduct);
});

// Actualizar producto (no se puede cambiar id)
router.put('/:pid', async (req, res) => {
  const updates = req.body;
  if ('id' in updates) delete updates.id; // prevenir cambio de id
  const updated = await productManager.updateProduct(req.params.pid, updates);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
});

// Eliminar producto
router.delete('/:pid', async (req, res) => {
  const ok = await productManager.deleteProduct(req.params.pid);
  if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
});

module.exports = router;
