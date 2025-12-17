const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const ProductManager = require('./src/managers/ProductManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// view engine
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
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
    const all = await pm.getAll();
    socket.emit('updateProducts', all);
  });

  // new product via socket
  socket.on('newProduct', async (data) => {
    try {
      // basic server-side validation
      if (!data.title || !data.description) return;
      await pm.addProduct(data);
      const all = await pm.getAll();
      io.emit('updateProducts', all);
    } catch (err) {
      console.error('error newProduct', err);
    }
  });

  // delete product via socket
  socket.on('deleteProduct', async (id) => {
    try {
      await pm.deleteProduct(id);
      const all = await pm.getAll();
      io.emit('updateProducts', all);
    } catch (err) {
      console.error('error deleteProduct', err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = { app, server, io };
