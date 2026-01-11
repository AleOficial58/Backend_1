module.exports = function(io){
  const express = require('express');
  const router = express.Router();
  const ProductManager = require('../managers/ProductManager');
  const productManager = new ProductManager();

  /**
   * GET / - Listar todos los productos con paginación, filtros y ordenamiento
   * Query params:
   * - limit: cantidad de productos por página (default: 10)
   * - page: número de página (default: 1)
   * - query: filtro por categoría o disponibilidad
   * - sort: ordenamiento asc/desc por precio
   */
  router.get('/', async (req, res) => {
    try {
      const { limit, page, query, sort } = req.query;
      const result = await productManager.getAll({ limit, page, query, sort });
      res.json(result);
    } catch (err) {
      console.error('Error en GET /:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  /**
   * GET /:pid - Traer producto por ID
   */
  router.get('/:pid', async (req, res) => {
    try {
      const product = await productManager.getById(req.params.pid);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (err) {
      console.error('Error en GET /:pid:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST / - Agregar nuevo producto
   * Body:
   * - title, description, code, price, status, stock, category, thumbnails
   */
  router.post('/', async (req, res) => {
    try {
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

      // emitir actualización si io está disponible
      if (io && io.emit) {
        const allResult = await productManager.getAll();
        io.emit('updateProducts', allResult.payload);
      }

      res.status(201).json(newProduct);
    } catch (err) {
      console.error('Error en POST /:', err);
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * PUT /:pid - Actualizar producto
   * No se puede cambiar el ID
   */
  router.put('/:pid', async (req, res) => {
    try {
      const updates = req.body;
      if ('_id' in updates) delete updates._id;
      if ('id' in updates) delete updates.id;
      
      const updated = await productManager.updateProduct(req.params.pid, updates);
      if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });

      if (io && io.emit) {
        const allResult = await productManager.getAll();
        io.emit('updateProducts', allResult.payload);
      }

      res.json(updated);
    } catch (err) {
      console.error('Error en PUT /:pid:', err);
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * DELETE /:pid - Eliminar producto
   */
  router.delete('/:pid', async (req, res) => {
    try {
      const ok = await productManager.deleteProduct(req.params.pid);
      if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });

      if (io && io.emit) {
        const allResult = await productManager.getAll();
        io.emit('updateProducts', allResult.payload);
      }

      res.json({ message: 'Producto eliminado' });
    } catch (err) {
      console.error('Error en DELETE /:pid:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
