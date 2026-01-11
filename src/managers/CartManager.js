// CartManager using Mongoose for MongoDB persistence
const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartManager {
  /**
   * Obtener todos los carritos
   * @returns {Promise<Array>} Lista de todos los carritos
   */
  async getAll() {
    try {
      return await Cart.find().populate('products.product');
    } catch (err) {
      console.error('Error en getAll:', err);
      return [];
    }
  }

  /**
   * Crear un nuevo carrito
   * @returns {Promise<Object>} Carrito creado
   */
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      return await newCart.save();
    } catch (err) {
      console.error('Error en createCart:', err);
      throw err;
    }
  }

  /**
   * Obtener carrito por ID (con productos completos mediante populate)
   * @param {string} cid - ID del carrito
   * @returns {Promise<Object|null>} Carrito encontrado o null
   */
  async getCartById(cid) {
    try {
      // Validar que sea un ObjectId válido
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }
      const cart = await Cart.findById(cid).populate('products.product').lean();
      return cart;
    } catch (err) {
      console.error('Error en getCartById:', err);
      return null;
    }
  }

  /**
   * Agregar producto al carrito
   * Si el producto ya existe, incrementar la cantidad
   * @param {string} cid - ID del carrito
   * @param {string} pid - ID del producto
   * @returns {Promise<Object|null>} Carrito actualizado o null
   */
  async addProduct(cid, pid) {
    try {
      // Validar ObjectIds
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/) || !pid || !pid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de carrito o producto inválido');
      }

      // Verificar que el producto existe
      const product = await Product.findById(pid);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Encontrar o crear el carrito
      let cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Buscar si el producto ya está en el carrito
      const existingProduct = cart.products.find(p => String(p.product) === String(pid));
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      const saved = await cart.save();
      return await Cart.findById(saved._id).populate('products.product').lean();
    } catch (err) {
      console.error('Error en addProduct:', err);
      throw err;
    }
  }

  /**
   * Eliminar un producto específico del carrito
   * @param {string} cid - ID del carrito
   * @param {string} pid - ID del producto
   * @returns {Promise<Object|null>} Carrito actualizado o null
   */
  async deleteProduct(cid, pid) {
    try {
      // Validar ObjectIds
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/) || !pid || !pid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de carrito o producto inválido');
      }

      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Filtrar el producto del carrito
      cart.products = cart.products.filter(p => String(p.product) !== String(pid));
      const saved = await cart.save();
      return await Cart.findById(saved._id).populate('products.product').lean();
    } catch (err) {
      console.error('Error en deleteProduct:', err);
      throw err;
    }
  }

  /**
   * Actualizar la cantidad de un producto en el carrito
   * @param {string} cid - ID del carrito
   * @param {string} pid - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Promise<Object|null>} Carrito actualizado o null
   */
  async updateProductQuantity(cid, pid, quantity) {
    try {
      // Validar ObjectIds
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/) || !pid || !pid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de carrito o producto inválido');
      }

      if (quantity < 1) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const existingProduct = cart.products.find(p => String(p.product) === String(pid));
      if (!existingProduct) {
        throw new Error('Producto no encontrado en el carrito');
      }

      existingProduct.quantity = quantity;
      const saved = await cart.save();
      return await Cart.findById(saved._id).populate('products.product').lean();
    } catch (err) {
      console.error('Error en updateProductQuantity:', err);
      throw err;
    }
  }

  /**
   * Actualizar todos los productos del carrito
   * @param {string} cid - ID del carrito
   * @param {Array} products - Array de productos con { product: pid, quantity: qty }
   * @returns {Promise<Object|null>} Carrito actualizado o null
   */
  async updateCart(cid, products) {
    try {
      // Validar ObjectId del carrito
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de carrito inválido');
      }

      // Validar y normalizar productos
      if (!Array.isArray(products)) {
        throw new Error('Los productos deben ser un array');
      }

      for (const item of products) {
        if (!item.product || !item.product.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('ID de producto inválido');
        }
        if (!item.quantity || item.quantity < 1) {
          throw new Error('Cantidad debe ser mayor a 0');
        }
      }

      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = products;
      const saved = await cart.save();
      return await Cart.findById(saved._id).populate('products.product').lean();
    } catch (err) {
      console.error('Error en updateCart:', err);
      throw err;
    }
  }

  /**
   * Vaciar el carrito (eliminar todos los productos)
   * @param {string} cid - ID del carrito
   * @returns {Promise<Object|null>} Carrito actualizado o null
   */
  async deleteCart(cid) {
    try {
      // Validar ObjectId
      if (!cid || !cid.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de carrito inválido');
      }

      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = [];
      const saved = await cart.save();
      return await Cart.findById(saved._id).populate('products.product').lean();
    } catch (err) {
      console.error('Error en deleteCart:', err);
      throw err;
    }
  }
}

module.exports = CartManager;
