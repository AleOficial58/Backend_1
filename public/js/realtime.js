const socket = io();

const productsList = document.getElementById('productsList');
const addProductForm = document.getElementById('addProductForm');

function renderProducts(products){
  productsList.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.setAttribute('data-id', p.id);
    li.innerHTML = `<strong>${p.title}</strong> — $${p.price} — Stock: ${p.stock} <button class="deleteBtn" data-id="${p.id}">Eliminar</button>`;
    productsList.appendChild(li);
  });
}

// Receive updates from server
socket.on('updateProducts', products => {
  renderProducts(products);
});

// Submit new product via socket
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const thumbnailsRaw = formData.get('thumbnails') || '';
  const thumbnails = thumbnailsRaw.split(',').map(s => s.trim()).filter(Boolean);

  const newProduct = {
    title: formData.get('title'),
    description: formData.get('description'),
    code: formData.get('code'),
    price: Number(formData.get('price')),
    status: formData.get('status') === 'true',
    stock: Number(formData.get('stock')),
    category: formData.get('category'),
    thumbnails
  };

  socket.emit('newProduct', newProduct);
  form.reset();
});

// Delegate delete button clicks
productsList.addEventListener('click', (e) => {
  if(e.target.classList.contains('deleteBtn')){
    const id = e.target.dataset.id;
    socket.emit('deleteProduct', id);
  }
});

// Initial request: ask server for current products (server will emit on connect)
socket.on('connect', () => {
  socket.emit('requestProducts');
});
