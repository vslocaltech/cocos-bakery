/**
 * ============================================================================
 * COCO'S BAKERY — SCRIPT PRINCIPAL & GESTOR DE PRODUCTOS
 * Pastelería de Fantasía
 * ============================================================================
 */

// Productos iniciales por defecto (Pastelería de fantasía)
const DEFAULT_PRODUCTS = [
  {
    name: "Corazones de Azúcar & Frutilla",
    category: "Galletitas",
    price: "$3.200",
    description: "Galletas de mantequilla con glaseado de vainilla, polvo de frutilla y detalles de oro comestible.",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Cake de Ensueño Vintage",
    category: "Tortas",
    price: "$18.500",
    description: "Bizcochuelo de vainilla bourbon relleno de crema chantilly, frutos del bosque y decoración vintage con moños.",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Bocados de Cacao Real & Menta",
    category: "Dulces",
    price: "$4.100",
    description: "Brownies de chocolate belga intenso 70% con corazón cremoso y suave frosting de menta pastel.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Cupcakes de la Hora del Té",
    category: "Dulces",
    price: "$4.800",
    description: "Esponjosos cupcakes con remolino de crema de fresa, perlas de azúcar y moño rosa artesanal.",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Macarons de Pétalos de Rosa",
    category: "Galletitas",
    price: "$5.400",
    description: "Caja de macarons franceses rellenos de ganache de chocolate blanco, agua de rosas y frambuesa.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Tarta Vintage de Frutos Dulces",
    category: "Tortas",
    price: "$16.900",
    description: "Masa sablée crocante, crema diplomata perfumada con limón y lluvia de fresas frescas con glaseado brillante.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"
  }
];

// Obtener productos desde localStorage (o inicializar con los predeterminados)
function getProducts() {
  const stored = localStorage.getItem('cocosProducts');
  if (!stored) {
    localStorage.setItem('cocosProducts', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

// Guardar productos en localStorage
function saveProducts(products) {
  localStorage.setItem('cocosProducts', JSON.stringify(products));
}

// ============================================================================
// NAVEGACIÓN Y MENÚ MÓVIL
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? 'Cerrar ✕' : 'Menú ✦';
    });
  }

  // Atajo secreto de teclado para administradores: Ctrl + Shift + A
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  // Renderizar vistas según la página activa
  initCataloguePage();
  initIndexPage();
  initAdminPage();
});

// ============================================================================
// PÁGINA: CATÁLOGO (catalogo.html)
// ============================================================================
function initCataloguePage() {
  const grid = document.querySelector('#catalogue-grid');
  if (!grid) return;

  const filterButtons = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';

  function render(filter) {
    const products = getProducts();
    const filtered = filter === 'all'
      ? products
      : products.filter(p => (p.category || '').toLowerCase() === filter.toLowerCase());

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
          <p style="font-size: 20px; color: var(--choco-soft);">No hay dulces disponibles en esta categoría por el momento.</p>
          <a href="index.html#contacto" class="button button-pink" style="margin-top: 15px;">Hacer un pedido especial <span>✦</span></a>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(prod => `
      <article class="product-card">
        <div class="product-media">
          <span class="badge-kind">${escapeHtml(prod.category || 'Especial')}</span>
          <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80')}" 
               alt="${escapeHtml(prod.name)}" 
               loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'"/>
        </div>
        <div class="product-info">
          <h3 class="product-title">${escapeHtml(prod.name)}</h3>
          <p class="product-desc">${escapeHtml(prod.description)}</p>
          <div class="product-footer">
            <span class="product-price">${escapeHtml(prod.price || 'Consultar')}</span>
            <a href="https://wa.me/?text=${encodeURIComponent('¡Hola Coco\'s Bakery! Quisiera consultar por el dulce: ' + prod.name)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="order-btn">
              Pedir <span>♥</span>
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      render(currentFilter);
    });
  });

  render(currentFilter);
}

// ============================================================================
// PÁGINA: INICIO (index.html)
// ============================================================================
function initIndexPage() {
  const treatGrid = document.querySelector('#featured-grid');
  if (!treatGrid) return;

  const products = getProducts().slice(0, 3);
  treatGrid.innerHTML = products.map(prod => `
    <article class="product-card">
      <div class="product-media">
        <span class="badge-kind">${escapeHtml(prod.category || 'Favorito')}</span>
        <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80')}" 
             alt="${escapeHtml(prod.name)}" 
             loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-title">${escapeHtml(prod.name)}</h3>
        <p class="product-desc">${escapeHtml(prod.description)}</p>
        <div class="product-footer">
          <span class="product-price">${escapeHtml(prod.price || 'Consultar')}</span>
          <a href="catalogo.html" class="order-btn">Ver más <span>→</span></a>
        </div>
      </div>
    </article>
  `).join('');
}

// ============================================================================
// PÁGINA: ADMINISTRACIÓN (admin.html)
// ============================================================================
function initAdminPage() {
  const loginForm = document.querySelector('#login-form');
  const loginScreen = document.querySelector('#admin-login');
  const adminPanel = document.querySelector('#admin-panel');
  const message = document.querySelector('.form-message');
  const logoutBtn = document.querySelector('#logout');

  if (!loginScreen || !adminPanel) return;

  function showAdmin() {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    setupAdminCRUD();
  }

  // Comprobar si ya inició sesión
  if (sessionStorage.getItem('cocosAdmin') === 'true') {
    showAdmin();
  }

  // Manejo de Login (Clave predeterminada: 'coco')
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = document.querySelector('#admin-key')?.value.trim();
    if (key === 'coco') {
      sessionStorage.setItem('cocosAdmin', 'true');
      showAdmin();
      showToast('¡Bienvenida, Coco! ✨');
    } else {
      if (message) message.textContent = 'La clave no coincide. Probá con "coco".';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('cocosAdmin');
    adminPanel.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    const keyInput = document.querySelector('#admin-key');
    if (keyInput) keyInput.value = '';
    if (message) message.textContent = '';
  });
}

// ============================================================================
// CRUD COMPLETO DEL PANEL DE ADMINISTRACIÓN
// ============================================================================
function setupAdminCRUD() {
  const productForm = document.querySelector('#product-form');
  const productList = document.querySelector('#admin-product-list');
  const formTitle = document.querySelector('#form-title');
  const submitBtn = document.querySelector('#submit-btn');
  const cancelBtn = document.querySelector('#cancel-btn');
  const editIndexInput = document.querySelector('#edit-index');

  const fileInput = document.querySelector('#product-image-file');
  const urlInput = document.querySelector('#product-image-url');
  const previewImg = document.querySelector('#preview-image');
  const previewPlaceholder = document.querySelector('#preview-placeholder');

  let currentImageData = '';

  // Actualizar la previsualización de imagen
  function updateImagePreview(src) {
    if (src && src.trim()) {
      previewImg.src = src;
      previewImg.classList.remove('hidden');
      previewPlaceholder?.classList.add('hidden');
      currentImageData = src;
    } else {
      previewImg.src = '';
      previewImg.classList.add('hidden');
      previewPlaceholder?.classList.remove('hidden');
      currentImageData = '';
    }
  }

  // Carga desde archivo local (FileReader -> Base64)
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        updateImagePreview(base64);
        if (urlInput) urlInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Carga desde URL directa
  urlInput?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      updateImagePreview(url);
      if (fileInput) fileInput.value = '';
    }
  });

  // Renderizar la lista de productos en el admin
  function renderList() {
    if (!productList) return;
    const products = getProducts();

    if (products.length === 0) {
      productList.innerHTML = '<p class="empty-state">No hay productos en la carta actualmente.</p>';
      return;
    }

    productList.innerHTML = products.map((prod, index) => `
      <article class="admin-item-row">
        <img class="admin-item-thumb" 
             src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=200&q=80')}" 
             alt="${escapeHtml(prod.name)}" />
        <div class="admin-item-details">
          <h4>${escapeHtml(prod.name)}</h4>
          <p>${escapeHtml(prod.description)}</p>
          <div class="admin-item-meta">
            <span class="badge-kind">${escapeHtml(prod.category)}</span>
            <span class="admin-item-price">${escapeHtml(prod.price || 'Consultar')}</span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn-icon btn-edit" data-edit="${index}" title="Editar dulce">✎</button>
          <button type="button" class="btn-icon btn-delete" data-delete="${index}" title="Eliminar dulce">✕</button>
        </div>
      </article>
    `).join('');

    // Asignar listeners de edición
    productList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.edit);
        startEditing(idx);
      });
    });

    // Asignar listeners de eliminación
    productList.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delete);
        const products = getProducts();
        const prod = products[idx];
        if (confirm(`¿Estás segura de que querés eliminar "${prod.name}" de la carta?`)) {
          products.splice(idx, 1);
          saveProducts(products);
          renderList();
          resetForm();
          showToast(`"${prod.name}" fue eliminado.`);
        }
      });
    });
  }

  // Activar modo edición
  function startEditing(index) {
    const products = getProducts();
    const prod = products[index];
    if (!prod) return;

    if (editIndexInput) editIndexInput.value = String(index);
    document.querySelector('[name="name"]').value = prod.name || '';
    document.querySelector('[name="category"]').value = prod.category || 'Tortas';
    document.querySelector('[name="price"]').value = prod.price || '';
    document.querySelector('[name="description"]').value = prod.description || '';
    
    if (urlInput) urlInput.value = prod.image && prod.image.startsWith('http') ? prod.image : '';
    updateImagePreview(prod.image || '');

    if (formTitle) formTitle.textContent = 'Editar Dulce ✨';
    if (submitBtn) submitBtn.innerHTML = 'Actualizar dulce <span>✓</span>';
    cancelBtn?.classList.remove('hidden');

    productForm?.scrollIntoView({ behavior: 'smooth' });
  }

  // Cancelar modo edición
  function resetForm() {
    productForm?.reset();
    if (editIndexInput) editIndexInput.value = '-1';
    if (formTitle) formTitle.textContent = 'Agregar Nuevo Dulce 🧁';
    if (submitBtn) submitBtn.innerHTML = 'Guardar en la carta <span>+</span>';
    cancelBtn?.classList.add('hidden');
    updateImagePreview('');
  }

  cancelBtn?.addEventListener('click', resetForm);

  // Enviar formulario (crear o editar)
  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(productForm);
    const editIdx = Number(editIndexInput?.value || '-1');
    const products = getProducts();

    const productPayload = {
      name: data.get('name')?.toString().trim(),
      category: data.get('category')?.toString().trim(),
      price: data.get('price')?.toString().trim() || 'Consultar',
      description: data.get('description')?.toString().trim(),
      image: currentImageData || (urlInput?.value.trim()) || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80'
    };

    if (editIdx >= 0 && editIdx < products.length) {
      // Actualización
      products[editIdx] = productPayload;
      saveProducts(products);
      showToast(`¡"${productPayload.name}" actualizado con éxito! ✨`);
    } else {
      // Nuevo producto
      products.unshift(productPayload);
      saveProducts(products);
      showToast(`¡"${productPayload.name}" agregado a la carta! 🎀`);
    }

    resetForm();
    renderList();
  });

  renderList();
}

// ============================================================================
// UTILIDADES: TOAST NOTIFICATIONS & SANITIZACIÓN
// ============================================================================
function showToast(text) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<span>♥</span> <span>${escapeHtml(text)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
