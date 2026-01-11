// Client-side JS for product interactions: details modal, edit modal, add-to-cart, toasts

function showToast(msg, timeout = 2500) {
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

// Update cart counter in header
function updateCartBadge() {
  const cartId = localStorage.getItem('cartId');
  
  if (!cartId) {
    document.getElementById('cartCount').innerText = '0';
    return;
  }
  
  fetch(`/api/carts/${cartId}`)
    .then(res => res.json())
    .then(cart => {
      const count = cart.products ? cart.products.length : 0;
      document.getElementById('cartCount').innerText = count;
    })
    .catch(() => {
      document.getElementById('cartCount').innerText = '0';
    });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setInterval(updateCartBadge, 5000); // Update every 5 seconds
});

// Socket.IO listener para actualizar productos en tiempo real
if (typeof io !== 'undefined') {
  const socket = io();
  
  socket.on('updateProducts', (products) => {
    // Actualizar cada tarjeta de producto en la página
    if (document.querySelector('.products-grid')) {
      products.forEach(product => {
        const card = document.querySelector(`[data-pid="${product._id}"]`);
        if (card) {
          // Actualizar estado visual
          const statusSpan = card.querySelector('.p-status');
          if (statusSpan) {
            statusSpan.innerText = product.status ? 'Activo' : 'Inactivo';
            statusSpan.style.background = product.status ? '#27ae60' : '#e74c3c';
          }
          
          // Mostrar/ocultar botón de agregar al carrito
          const addBtn = card.querySelector('[data-action="add-to-cart"]');
          if (addBtn) {
            addBtn.style.display = product.status ? 'inline-block' : 'none';
          }
          
          // Actualizar otros datos si es necesario
          const titleSpan = card.querySelector('.p-title');
          if (titleSpan) titleSpan.innerText = product.title || '';
          
          const priceSpan = card.querySelector('.p-price');
          if (priceSpan) priceSpan.innerText = '$' + (product.price ?? '0');
          
          const categorySpan = card.querySelector('.p-category');
          if (categorySpan) categorySpan.innerText = product.category || '';
          
          const stockSpan = card.querySelector('.p-stock');
          if (stockSpan) stockSpan.innerText = product.stock ?? 0;
        }
      });
    }
    
    
    // Si el modal de detalles está abierto, actualizar su contenido también
    const detailModal = document.getElementById('productDetailModal');
    if (detailModal && detailModal.classList.contains('open')) {
      const editBtn = detailModal.querySelector('[data-action="edit"]');
      if (editBtn) {
        const productId = editBtn.dataset.pid;
        const updatedProduct = products.find(p => p._id === productId);
        if (updatedProduct) {
          // Actualizar estado en el modal
          const statusSpan = detailModal.querySelector('.pd-status');
          if (statusSpan) statusSpan.innerText = updatedProduct.status ? 'Activo' : 'Inactivo';
          
          // Actualizar otros datos del modal
          detailModal.querySelector('.pd-title').innerText = updatedProduct.title || '';
          detailModal.querySelector('.pd-price').innerText = '$' + (updatedProduct.price ?? '0');
          detailModal.querySelector('.pd-stock').innerText = updatedProduct.stock ?? 0;
          detailModal.querySelector('.pd-category').innerText = updatedProduct.category || '';
        }
      }
    }
  });
}

// Fetch product by id and open detail modal
async function openProductDetail(pid) {
  try {
    const res = await fetch(`/api/products/${pid}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const product = await res.json();

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    modal.querySelector('.pd-title').innerText = product.title || '';
    modal.querySelector('.pd-desc').innerText = product.description || '';
    modal.querySelector('.pd-price').innerText = '$' + (product.price ?? '0');
    modal.querySelector('.pd-category').innerText = product.category || '';
    modal.querySelector('.pd-stock').innerText = product.stock ?? 0;
    modal.querySelector('.pd-status').innerText = product.status ? 'Activo' : 'Inactivo';
    modal.querySelector('.pd-code').innerText = product.code || '';

    // Set edit button inside detail modal
    const editBtn = modal.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.dataset.pid = pid;
      // only show edit button in modal when viewing from realtimeproducts
      if (window.location && window.location.pathname && window.location.pathname.includes('realtimeproducts')) {
        editBtn.style.display = 'inline-block';
        } else {
          editBtn.style.display = 'none';
        }
      }

    modal.classList.add('open');
  } catch (err) {
    showToast('Error al cargar detalles');
    console.error(err);
  }
}

// Close any modal
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Open edit modal prefilled
async function openEditModal(pid) {
  try {
    const res = await fetch(`/api/products/${pid}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const product = await res.json();

    const modal = document.getElementById('productEditModal');
    if (!modal) return;

    modal.querySelector('input[name="title"]').value = product.title || '';
    modal.querySelector('textarea[name="description"]').value = product.description || '';
    modal.querySelector('input[name="code"]').value = product.code || '';
    modal.querySelector('input[name="price"]').value = product.price ?? '';
    modal.querySelector('input[name="stock"]').value = product.stock ?? '';
    modal.querySelector('input[name="status"]').checked = !!product.status;
    modal.querySelector('input[name="category"]').value = product.category || '';
    modal.querySelector('input[name="pid"]').value = product._id || '';

    modal.classList.add('open');
  } catch (err) {
    showToast('Error al cargar producto para editar');
    console.error(err);
  }
}

// Submit edit form
async function submitEditForm(e) {
  e.preventDefault();
  const form = e.target;
  const pid = form.querySelector('input[name="pid"]').value;
  const payload = {
    title: form.querySelector('input[name="title"]').value,
    description: form.querySelector('textarea[name="description"]').value,
    code: form.querySelector('input[name="code"]').value,
    price: Number(form.querySelector('input[name="price"]').value) || 0,
    stock: Number(form.querySelector('input[name="stock"]').value) || 0,
    status: !!form.querySelector('input[name="status"]').checked,
    category: form.querySelector('input[name="category"]').value,
  };

  try {
    const res = await fetch(`/api/products/${pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al actualizar');
    }
    const updated = await res.json();
    showToast('Producto actualizado');
    closeModal('productEditModal');
    // Update card in DOM if present
    const card = document.querySelector(`[data-pid='${pid}']`);
    if (card) {
      card.querySelector('.p-title').innerText = updated.title || '';
      card.querySelector('.p-price').innerText = '$' + (updated.price ?? '0');
      card.querySelector('.p-stock').innerText = updated.stock ?? 0;
      card.querySelector('.p-status').innerText = updated.status ? 'Activo' : 'Inactivo';
      card.querySelector('.p-category').innerText = updated.category || '';
    }
    // If the product detail modal is open for this product, update its fields too
    const detailModal = document.getElementById('productDetailModal');
    if (detailModal && detailModal.classList.contains('open')) {
      try {
        const detailPid = (detailModal.querySelector('.pd-add-to-cart') || {}).dataset.pid;
        if (detailPid === pid) {
          detailModal.querySelector('.pd-title').innerText = updated.title || '';
          detailModal.querySelector('.pd-desc').innerText = updated.description || '';
          detailModal.querySelector('.pd-price').innerText = '$' + (updated.price ?? '0');
          detailModal.querySelector('.pd-category').innerText = updated.category || '';
          detailModal.querySelector('.pd-stock').innerText = updated.stock ?? 0;
          detailModal.querySelector('.pd-status').innerText = updated.status ? 'Activo' : 'Inactivo';
          detailModal.querySelector('.pd-code').innerText = updated.code || '';
          const editBtnInside = detailModal.querySelector('[data-action="edit"]');
          if (editBtnInside) editBtnInside.dataset.pid = pid;
          const addBtnInside = detailModal.querySelector('.pd-add-to-cart');
          if (addBtnInside) addBtnInside.dataset.pid = pid;
        }
      } catch (e) {
        console.warn('Could not update detail modal:', e);
      }
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Error al actualizar');
  }
}

// Add to cart flow: get or create cart, then add product
async function addToCartFlow(pid) {
  try {
    // First, check if product is active
    const productRes = await fetch(`/api/products/${pid}`);
    if (!productRes.ok) throw new Error('Producto no encontrado');
    const product = await productRes.json();
    
    if (!product.status) {
      Swal.fire({
        title: 'Producto Inactivo',
        text: 'No puedes agregar productos inactivos al carrito',
        icon: 'warning'
      });
      return;
    }

    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      // create cart
      const res = await fetch('/api/carts', { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo crear el carrito');
      const cart = await res.json();
      cartId = cart._id || cart.id;
      localStorage.setItem('cartId', cartId);
    }

    const addRes = await fetch(`/api/carts/${cartId}/products/${pid}`, { method: 'POST' });
    if (!addRes.ok) {
      const err = await addRes.json().catch(() => ({}));
      throw new Error(err.error || 'Error al agregar al carrito');
    }
    
    // Show success with Sweet Alert
    Swal.fire({
      title: '¡Agregado!',
      text: 'Producto agregado al carrito',
      icon: 'success',
      showConfirmButton: true,
      confirmButtonText: 'Ir al carrito',
      showDenyButton: true,
      denyButtonText: 'Continuar comprando'
    }).then((result) => {
      updateCartBadge();
      if (result.isConfirmed) {
        window.location.href = `/carts/${cartId}`;
      }
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'Error',
      text: err.message || 'Error al agregar al carrito',
      icon: 'error'
    });
  }
}

// Event delegation for product actions
document.addEventListener('click', function(e){
  const detailBtn = e.target.closest('[data-action="detail"]');
  if (detailBtn) {
    e.preventDefault();
    const pid = detailBtn.dataset.pid;
    openProductDetail(pid);
    return;
  }

  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    e.preventDefault();
    const pid = editBtn.dataset.pid;
    openEditModal(pid);
    return;
  }

  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    e.preventDefault();
    const pid = deleteBtn.dataset.pid;
    if (!pid) return showToast('ID de producto inválido');
    // Call API to delete
    fetch(`/api/products/${pid}`, { method: 'DELETE' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error al eliminar');
        }
        // remove card from DOM
        // remove all matching cards
        const cards = document.querySelectorAll(`[data-pid='${pid}']`);
        cards.forEach(c => c.remove());
        showToast('Producto eliminado');
        // if any matching card still exists, reload to sync server-rendered list
        setTimeout(() => {
          const left = document.querySelector(`[data-pid='${pid}']`);
          if (left) {
            window.location.reload();
          }
        }, 200);
      })
      .catch(err => {
        console.error(err);
        showToast(err.message || 'Error al eliminar producto');
      });
    return;
  }

  const addBtn = e.target.closest('[data-action="add-to-cart"]');
  if (addBtn) {
    e.preventDefault();
    const pid = addBtn.dataset.pid;
    addToCartFlow(pid);
    return;
  }

  const modalClose = e.target.closest('[data-action="close-modal"]');
  if (modalClose) {
    e.preventDefault();
    const id = modalClose.dataset.target;
    closeModal(id);
    return;
  }
});

// Wire edit form submit
document.addEventListener('DOMContentLoaded', function(){
  const editForm = document.getElementById('productEditForm');
  if (editForm) editForm.addEventListener('submit', submitEditForm);

  // Wire add-to-cart inside product detail modal
  const pd = document.getElementById('productDetailModal');
  if (pd) {
    pd.addEventListener('click', function(e){
      const btn = e.target.closest('.pd-add-to-cart');
      if (btn) {
        const pid = btn.dataset.pid;
        addToCartFlow(pid);
      }
    });
  }
});

// Go to cart: if cartId exists, navigate to it; otherwise create a new one
function goToCart() {
  let cartId = localStorage.getItem('cartId');
  
  if (cartId) {
    // Si existe cartId, ir directamente al carrito
    window.location.href = `/carts/${cartId}`;
  } else {
    // Si no existe, crear uno nuevo
    fetch('/api/carts', { method: 'POST' })
      .then(res => res.json())
      .then(cart => {
        cartId = cart._id || cart.id;
        localStorage.setItem('cartId', cartId);
        window.location.href = `/carts/${cartId}`;
      })
      .catch(err => {
        console.error('Error creating cart:', err);
        Swal.fire({
          title: 'Error',
          text: 'Error al crear el carrito',
          icon: 'error'
        });
      });
  }
}
