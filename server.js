const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const { connectDB } = require('./src/config/mongodb');
const ProductManager = require('./src/managers/ProductManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// Conectar a MongoDB
connectDB();

// view engine
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    multiply: (a, b) => a * b,
    cartTotal: (products) => {
      if (!products) return 0;
      return products.reduce((sum, p) => sum + (p.product?.price || 0) * p.quantity, 0).toFixed(2);
    },
    totalItems: (products) => {
      if (!products) return 0;
      return products.reduce((sum, p) => sum + p.quantity, 0);
    },
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// routers
const productsRouter = require('./src/routes/products')(io);
const cartRouter = require('./src/routes/carts');
const viewsRouter = require('./src/routes/views');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);

// socket logic
const pm = new ProductManager();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado', socket.id);

  // client requests current products
  socket.on('requestProducts', async () => {
    const result = await pm.getAll();
    socket.emit('updateProducts', result.payload);
  });

  // new product via socket
  socket.on('newProduct', async (data) => {
    try {
      // basic server-side validation
      if (!data.title || !data.description) return;
      await pm.addProduct(data);
      const result = await pm.getAll();
      io.emit('updateProducts', result.payload);
    } catch (err) {
      console.error('error newProduct', err);
    }
  });

  // delete product via socket
  socket.on('deleteProduct', async (id) => {
    try {
      await pm.deleteProduct(id);
      const result = await pm.getAll();
      io.emit('updateProducts', result.payload);
    } catch (err) {
      console.error('error deleteProduct', err);
    }
  });

  // update product via socket (realtime edit)
  socket.on('updateProduct', async (data) => {
    try {
      const { id, updates } = data || {};
      if (!id) return;
      await pm.updateProduct(id, updates);
      const result = await pm.getAll();
      io.emit('updateProducts', result.payload);
    } catch (err) {
      console.error('error updateProduct', err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = { app, server, io };
