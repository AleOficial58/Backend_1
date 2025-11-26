const fs = require('fs').promises;

class ProductManager {
  constructor() {
    // ruta relativa a la raíz del proyecto
    this.path = './products.json';
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getAll() {
    return await this._readFile();
  }

  async getById(id) {
    const products = await this._readFile();
    return products.find(p => String(p.id) === String(id));
  }

  async addProduct(product) {
    const products = await this._readFile();

    // generar id único (string)
    const id = Date.now().toString();
    const newProduct = { id, ...product };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this._readFile();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return null;

    // no permitir actualizar el id
    const existing = products[index];
    const updated = { ...existing, ...updates, id: existing.id };
    products[index] = updated;
    await this._writeFile(products);
    return updated;
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return false;
    products.splice(index, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductManager;
