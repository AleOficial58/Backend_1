// ProductManager using Mongoose for MongoDB persistence
const Product = require('../models/Product');

class ProductManager {
  /**
   * Obtener todos los productos con paginación, filtros y ordenamiento
   * @param {Object} options - Opciones de búsqueda
   * @param {number} options.limit - Cantidad de productos por página (default: 10)
   * @param {number} options.page - Número de página (default: 1)
   * @param {string} options.query - Filtro por categoría o disponibilidad
   * @param {string} options.sort - Ordenamiento: 'asc' o 'desc' por precio
   * @returns {Promise<Object>} Objeto con paginación y productos
   */
  async getAll(options = {}) {
    try {
      const limit = Math.max(1, parseInt(options.limit) || 10);
      const page = Math.max(1, parseInt(options.page) || 1);
      const query = options.query ? options.query.trim().toLowerCase() : null;
      const sort = options.sort ? options.sort.toLowerCase() : null;

      // Construir objeto de filtro
      let filter = {};

      // Si hay query, buscar por categoría o disponibilidad
      if (query) {
        // Buscar por categoría
        filter.$or = [
          { category: { $regex: query, $options: 'i' } },
          { status: query === 'true' || query === '1' },
        ];
      }

      // Contar total de documentos
      const totalDocs = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalDocs / limit);

      // Validar página
      const page_number = Math.min(page, Math.max(1, totalPages));
      const skip = (page_number - 1) * limit;

      // Construir objeto de ordenamiento
      let sortObj = {};
      if (sort === 'asc') {
        sortObj.price = 1; // Ascendente
      } else if (sort === 'desc') {
        sortObj.price = -1; // Descendente
      }

      // Ejecutar consulta (usar .lean() para obtener objetos planos)
      const products = await Product.find(filter)
        .sort(Object.keys(sortObj).length > 0 ? sortObj : {})
        .limit(limit)
        .skip(skip)
        .lean();

      // Calcular información de paginación
      const hasPrevPage = page_number > 1;
      const hasNextPage = page_number < totalPages;

      // Construir links (ejemplo: /api/products?page=X&limit=10&query=electronics&sort=asc)
      const baseUrl = '/api/products';
      const queryParams = {
        limit,
        ...(query && { query }),
        ...(sort && { sort }),
      };

      const prevLink = hasPrevPage
        ? `${baseUrl}?page=${page_number - 1}&${new URLSearchParams(queryParams).toString()}`
        : null;

      const nextLink = hasNextPage
        ? `${baseUrl}?page=${page_number + 1}&${new URLSearchParams(queryParams).toString()}`
        : null;

      return {
        status: 'success',
        payload: products,
        totalPages,
        prevPage: hasPrevPage ? page_number - 1 : null,
        nextPage: hasNextPage ? page_number + 1 : null,
        page: page_number,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      };
    } catch (err) {
      console.error('Error en getAll:', err);
      return {
        status: 'error',
        payload: [],
        message: err.message,
      };
    }
  }

  /**
   * Obtener un producto por ID
   * @param {string} id - ID del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  async getById(id) {
    try {
      // Validar que sea un ObjectId válido de MongoDB
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }
      return await Product.findById(id).lean();
    } catch (err) {
      console.error('Error en getById:', err);
      return null;
    }
  }

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async addProduct(productData) {
    try {
      // Validar campos requeridos
      const { title, description, code, price, status, stock, category, thumbnails } = productData;

      if (!title || !description || !code || price === undefined || status === undefined || !category) {
        throw new Error('Faltan campos requeridos');
      }

      // Verificar que code sea único
      const existing = await Product.findOne({ code: code.trim() });
      if (existing) {
        throw new Error(`El código "${code}" ya existe`);
      }

      const newProduct = new Product({
        title,
        description,
        code: code.trim(),
        price: Number(price),
        status: Boolean(status),
        stock: Number(stock) || 0,
        category,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
      });

      console.log('ProductManager.addProduct input:', {
        title,
        description,
        code: code && code.trim(),
        price: Number(price),
        status: Boolean(status),
        stock: Number(stock),
        category,
      });

      const saved = await newProduct.save();
      console.log('ProductManager.addProduct saved id:', saved && saved._id);
      return saved;
    } catch (err) {
      console.error('Error en addProduct:', err);
      throw err;
    }
  }

  /**
   * Actualizar un producto
   * @param {string} id - ID del producto
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async updateProduct(id, updates) {
    try {
      // Validar que sea un ObjectId válido
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }

      // No permitir cambiar el id
      if ('_id' in updates) delete updates._id;
      if ('id' in updates) delete updates.id;

      // Validar que code sea único (si se actualiza)
      if (updates.code) {
        const existing = await Product.findOne({
          code: updates.code.trim(),
          _id: { $ne: id },
        });
        if (existing) {
          throw new Error(`El código "${updates.code}" ya existe`);
        }
        updates.code = updates.code.trim();
      }

      return await Product.findByIdAndUpdate(id, updates, { new: true });
    } catch (err) {
      console.error('Error en updateProduct:', err);
      throw err;
    }
  }

  /**
   * Eliminar un producto
   * @param {string} id - ID del producto
   * @returns {Promise<boolean>} True si se eliminó, false si no existe
   */
  async deleteProduct(id) {
    try {
      // Validar que sea un ObjectId válido
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return false;
      }

      const result = await Product.findByIdAndDelete(id);
      return result !== null;
    } catch (err) {
      console.error('Error en deleteProduct:', err);
      return false;
    }
  }
}

module.exports = ProductManager;
