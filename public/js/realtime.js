const socket = io();

const productsGrid = document.getElementById('productsGrid');
const openCreateBtn = document.getElementById('openCreateBtn');
const realtimeEditModal = document.getElementById('realtimeEditModal');
const realtimeEditForm = document.getElementById('realtimeEditForm');

function closeModalById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function openModalById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function renderProducts(products){
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const id = p._id || p.id || '';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = id;
    const statusBadge = p.status ? '<span style="background:#27ae60; color:white; padding:4px 8px; border-radius:4px; font-size:12px;">Activo</span>' : '<span style="background:#e74c3c; color:white; padding:4px 8px; border-radius:4px; font-size:12px;">Inactivo</span>';
    card.innerHTML = `
      <h3>${p.title || ''}</h3>
      <p class="description">${p.description || ''}</p>
      <p class="price">Precio: <strong>$${p.price ?? 0}</strong></p>
      <p class="category">Categoria: ${p.category || ''}</p>
      <p class="stock">Stock: ${p.stock ?? 0}</p>
      <p style="margin:8px 0;">Estado: ${statusBadge}</p>
      <div class="product-actions">
        <button class="btn btn-primary editBtn" data-id="${id}">Editar</button>
        <button class="btn btn-danger deleteBtn" data-id="${id}">Eliminar</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

function showRealtimeToast(msg, timeout = 2500) {
  let t = document.createElement('div');
  t.className = 'cp-toast';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('visible'), 50);
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, timeout);
}

// Receive updates from server
socket.on('updateProducts', products => {
  renderProducts(products);
  // close modal after update
  if (realtimeEditModal && realtimeEditModal.classList.contains('open')) {
    closeModalById('realtimeEditModal');
    // toast feedback
    const msg = realtimeEditForm && realtimeEditForm.pid.value ? 'Producto actualizado' : 'Producto creado';
    showRealtimeToast(msg);
  }
});

// Wire create button to open modal in create mode
if (openCreateBtn) {
  openCreateBtn.addEventListener('click', () => {
    if (!realtimeEditForm) return;
    realtimeEditForm.reset();
    realtimeEditForm.pid.value = '';
    document.getElementById('realtimeModalTitle').innerText = 'Nuevo Producto';
    openModalById('realtimeEditModal');
  });
}

// Delegate grid button clicks
if (productsGrid) {
  productsGrid.addEventListener('click', (e) => {
    const del = e.target.closest('.deleteBtn');
    if (del) {
      const id = del.dataset.id || '';
      if (!id) return console.warn('ID inválido para eliminar');
      
      // Show confirmation alert
      Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          socket.emit('deleteProduct', id);
          Swal.fire({
            title: 'Eliminado',
            text: 'Producto eliminado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
      return;
    }

    const edit = e.target.closest('.editBtn');
    if (edit) {
      const id = edit.dataset.id || '';
      if (!id) return console.warn('ID inválido para editar');
      // fetch product and open modal prefilled
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(prod => {
          if (!realtimeEditForm) return;
          realtimeEditForm.pid.value = prod._id || prod.id || '';
          realtimeEditForm.title.value = prod.title || '';
          realtimeEditForm.description.value = prod.description || '';
          realtimeEditForm.code.value = prod.code || '';
          realtimeEditForm.price.value = prod.price ?? 0;
          realtimeEditForm.stock.value = prod.stock ?? 0;
          realtimeEditForm.category.value = prod.category || '';
          realtimeEditForm.status.checked = !!prod.status;
          document.getElementById('realtimeModalTitle').innerText = 'Editar Producto';
          openModalById('realtimeEditModal');
        })
        .catch(err => console.error('Error fetching product for edit', err));
      return;
    }
  });
}

// Submit create/edit form via socket
if (realtimeEditForm) {
  realtimeEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const pid = form.pid.value;
    const payload = {
      title: form.title.value,
      description: form.description.value,
      code: form.code.value,
      price: Number(form.price.value) || 0,
      stock: Number(form.stock.value) || 0,
      status: !!form.status.checked,
      category: form.category.value,
    };
    if (pid) {
      socket.emit('updateProduct', { id: pid, updates: payload });
    } else {
      socket.emit('newProduct', payload);
    }
  });
}

// Wire modal close buttons
document.addEventListener('click', (e) => {
  const close = e.target.closest('[data-action="close-modal"]');
  if (close) {
    const target = close.dataset.target;
    closeModalById(target);
  }
});

// Initial request: ask server for current products (server will emit on connect)
socket.on('connect', () => {
  socket.emit('requestProducts');
});
