// MongoDB Connection Configuration
const mongoose = require('mongoose');

// MongoDB connection URI
// Change this to your MongoDB URI (local or cloud)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Conectado a MongoDB');
  } catch (err) {
    console.error('✗ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
