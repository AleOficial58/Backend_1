const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/carts');

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
