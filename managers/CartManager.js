const fs = require('fs').promises;

class CartManager {
  constructor() {
    // Mantener compatibilidad: archivo en la raíz llamado carts.json
    this.path = './carts.json';
  }

  // Traer todos los carritos
  async getAll() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Crear un carrito nuevo
  async createCart() {
    const carts = await this.getAll();
    const newCart = { id: Date.now(), products: [] };
    carts.push(newCart);
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  // Traer carrito por ID
  async getCartById(id) {
    const carts = await this.getAll();
    return carts.find(c => String(c.id) === String(id));
  }

  // Agregar producto al carrito
  async addProduct(cid, pid) {
    const carts = await this.getAll();
    const cart = carts.find(c => String(c.id) === String(cid));
    if (!cart) return { error: 'Carrito no encontrado' };

    const existingProduct = cart.products.find(p => String(p.product) === String(pid));
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;
