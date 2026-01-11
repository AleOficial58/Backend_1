// Product Schema and Model for MongoDB
const { mongoose } = require('../config/mongodb');

/**
 * Schema para Productos
 * Propiedades:
 * - title: Nombre del producto
 * - description: Descripción del producto
 * - code: Código único del producto
 * - price: Precio del producto
 * - status: Estado del producto (activo/inactivo)
 * - stock: Cantidad disponible
 * - category: Categoría del producto (útil para filtrar)
 * - thumbnails: Array de URLs de imágenes
 * - timestamp: Fecha de creación automática
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnails: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Crear índices para mejorar búsquedas
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
