// Cart Schema and Model for MongoDB
const { mongoose } = require('../config/mongodb');

/**
 * Schema para Carritos
 * Propiedades:
 * - products: Array de productos en el carrito
 *   - product: ID del producto (referencia a modelo Product)
 *   - quantity: Cantidad de unidades de este producto
 * - timestamp: Fecha de creación y actualización automática
 */
const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Referencia al modelo Product
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
