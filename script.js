/**
 * ============================================================================
 * COCO'S BAKERY — SCRIPT PRINCIPAL, GESTOR DE PRODUCTOS & CARRITO DE COMPRAS
 * Pastelería de Fantasía
 * ============================================================================
 */

// Teléfono oficial para pedidos por WhatsApp (+54 3442 472867 -> formato internacional: 5493442472867)
const BAKERY_PHONE = "5493442472867";

// Datos bancarios para transferencias / pagos
const BAKERY_PAYMENT_INFO = {
  alias: "cocos.bakery.dulce",
  titular: "Coco's Bakery - Pastelería",
  banco: "Mercado Pago / Banco"
};

// Productos iniciales por defecto (Pastelería de fantasía)
const DEFAULT_PRODUCTS = [
  {
    name: "Corazones de Azúcar & Frutilla",
    category: "Galletitas",
    tag: "Favorito",
    price: "$3.200",
    description: "Galletas de mantequilla con glaseado de vainilla, polvo de frutilla y detalles de oro comestible.",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Cake de Ensueño Vintage",
    category: "Tortas",
    tag: "Más pedido",
    price: "$18.500",
    description: "Bizcochuelo de vainilla bourbon relleno de crema chantilly, frutos del bosque y decoración vintage con moños.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Bocados de Cacao Real & Menta",
    category: "Dulces",
    tag: "Especial",
    price: "$4.100",
    description: "Brownies de chocolate belga intenso 70% con corazón cremoso y suave frosting de menta pastel.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Cupcakes de la Hora del Té",
    category: "Dulces",
    tag: "Destacado",
    price: "$4.800",
    description: "Esponjosos cupcakes con remolino de crema de fresa, perlas de azúcar y moño rosa artesanal.",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Macarons de Pétalos de Rosa",
    category: "Galletitas",
    tag: "Edición limitada",
    price: "$5.400",
    description: "Caja de macarons franceses rellenos de ganache de chocolate blanco, agua de rosas y frambuesa.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Tarta Vintage de Frutos Dulces",
    category: "Tortas",
    tag: "Personalizable",
    price: "$16.900",
    description: "Masa sablée crocante, crema diplomata perfumada con limón y lluvia de fresas frescas con glaseado brillante.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"
  }
];

// ============================================================================
// PRODUCTOS: OBTENER Y GUARDAR (localStorage)
// ============================================================================
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

function saveProducts(products) {
  localStorage.setItem('cocosProducts', JSON.stringify(products));
}

// Utilidades de precio
function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr > 0 ? Math.round(priceStr) : 0;
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const withoutCents = priceStr.trim().replace(/,\d{1,2}$/, '');
  const cleaned = withoutCents.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function formatPrice(amount) {
  if (!amount || amount <= 0) return 'A consultar';
  return '$ ' + amount.toLocaleString('es-AR');
}

// ============================================================================
// SISTEMA DE CARRITO DE COMPRAS (localStorage: 'cocosCart')
// ============================================================================
const CART_FORM_STORAGE_KEY = 'cocosCartForm';

function getCartFormState() {
  const defaults = {
    name: '',
    deliveryType: 'retiro',
    address: '',
    paymentMethod: 'Transferencia / Mercado Pago',
    notes: ''
  };
  try {
    const stored = sessionStorage.getItem(CART_FORM_STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch (e) {
    return defaults;
  }
}

function saveCartFormState(partial) {
  const current = getCartFormState();
  const updated = { ...current, ...partial };
  try {
    sessionStorage.setItem(CART_FORM_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Ignorar errores de sessionStorage
  }
  return updated;
}

function getCart() {
  try {
    const stored = localStorage.getItem('cocosCart');
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item.name === 'string')
      .map(item => ({
        ...item,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
      }));
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cocosCart', JSON.stringify(cart));
  updateCartBadges();
  renderCartDrawer();
}

function addToCart(product, quantity = 1) {
  const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity = (parseInt(existing.quantity, 10) || 0) + qtyToAdd;
  } else {
    cart.push({
      name: product.name,
      category: product.category || 'Dulces',
      tag: product.tag || '',
      price: product.price || 'Consultar',
      image: product.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
      quantity: qtyToAdd
    });
  }
  saveCart(cart);
  showToast(`¡"${product.name}" agregado a tu canasta! 🛍️`);
}

function updateCartItemQty(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      const removed = cart.splice(index, 1);
      showToast(`"${removed[0]?.name}" eliminado.`);
    }
    saveCart(cart);
  }
}

function removeCartItem(index) {
  const cart = getCart();
  if (cart[index]) {
    const removed = cart.splice(index, 1);
    saveCart(cart);
    showToast(`"${removed[0]?.name}" eliminado.`);
  }
}

function clearCart() {
  if (confirm('¿Deseas vaciar todos los dulces de tu canastita?')) {
    saveCart([]);
    showToast('Canasta vaciada.');
  }
}

function getCartTotals() {
  const cart = getCart();
  let totalAmount = 0;
  let totalItems = 0;
  let hasInquiry = false;

  cart.forEach(item => {
    totalItems += item.quantity;
    const priceNum = parsePrice(item.price);
    if (priceNum > 0) {
      totalAmount += priceNum * item.quantity;
    } else {
      hasInquiry = true;
    }
  });

  return { totalAmount, totalItems, hasInquiry };
}

function updateCartBadges() {
  const { totalItems } = getCartTotals();
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = String(totalItems);
    el.style.display = totalItems > 0 ? 'inline-flex' : 'none';
  });

  const cartNavBtn = document.querySelector('#cart-nav-btn');
  if (cartNavBtn) {
    cartNavBtn.classList.toggle('has-items', totalItems > 0);
  }
}

// ============================================================================
// INICIALIZACIÓN DEL DRAWER / PANEL LATERAL DEL CARRITO
// ============================================================================
function initCartDrawer() {
  // Crear elementos del drawer si no existen
  if (!document.querySelector('#cart-drawer')) {
    const drawerHtml = `
      <div id="cart-backdrop" class="cart-backdrop" aria-hidden="true"></div>
      <aside id="cart-drawer" class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header class="cart-header">
          <div class="cart-header-title">
            <span class="cart-header-icon">🛍️</span>
            <div>
              <h3 id="cart-drawer-title">Tu Canastita Dulce</h3>
              <p class="cart-header-sub">Pastelería artesanal hecha con cariño</p>
            </div>
          </div>
          <button type="button" class="cart-close-btn" id="cart-close-btn" aria-label="Cerrar canasta">✕</button>
        </header>

        <div class="cart-body" id="cart-body">
          <!-- Renderizado dinámicamente con renderCartDrawer() -->
        </div>

        <footer class="cart-footer" id="cart-footer">
          <!-- Renderizado dinámicamente con renderCartDrawer() -->
        </footer>
      </aside>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    // Eventos de apertura/cierre
    document.querySelector('#cart-close-btn')?.addEventListener('click', closeCartDrawer);
    document.querySelector('#cart-backdrop')?.addEventListener('click', closeCartDrawer);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isCartOpen()) closeCartDrawer();
    });
  }

  // Inyectar botón de carrito en el header si existe navbar
  const header = document.querySelector('.site-header');
  if (header && !document.querySelector('#cart-nav-btn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'cart-nav-btn';
    btn.className = 'cart-nav-btn';
    btn.setAttribute('aria-label', 'Ver carrito de compras');
    btn.innerHTML = `
      <span class="cart-btn-icon">🛍️</span>
      <span class="cart-btn-label">Canasta</span>
      <span class="cart-badge-count">0</span>
    `;
    btn.addEventListener('click', openCartDrawer);

    // Ubicar antes del botón de menú móvil
    const menuBtn = header.querySelector('.menu-button');
    if (menuBtn) {
      header.insertBefore(btn, menuBtn);
    } else {
      header.appendChild(btn);
    }
  }

  updateCartBadges();
  renderCartDrawer();
}

function isCartOpen() {
  return document.querySelector('#cart-drawer')?.classList.contains('open');
}

function openCartDrawer() {
  const drawer = document.querySelector('#cart-drawer');
  const backdrop = document.querySelector('#cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.querySelector('#cart-drawer');
  const backdrop = document.querySelector('#cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function syncCartFormFromDOM() {
  const cartBody = document.querySelector('#cart-body');
  if (!cartBody || !cartBody.querySelector('#order-name')) return getCartFormState();

  const nameInput = cartBody.querySelector('#order-name');
  const deliveryRadio = cartBody.querySelector('input[name="delivery-type"]:checked');
  const addressInput = cartBody.querySelector('#order-address');
  const paymentRadio = cartBody.querySelector('input[name="payment-method"]:checked');
  const notesInput = cartBody.querySelector('#order-notes');

  return saveCartFormState({
    name: nameInput ? nameInput.value : '',
    deliveryType: deliveryRadio ? deliveryRadio.value : 'retiro',
    address: addressInput ? addressInput.value : '',
    paymentMethod: paymentRadio ? paymentRadio.value : 'Transferencia / Mercado Pago',
    notes: notesInput ? notesInput.value : ''
  });
}

async function copyTextToClipboard(text) {
  if (!text) return false;

  // 1. Intentar con la API moderna de portapapeles (contextos seguros / localhost / HTTPS)
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Si falla por permisos o contexto file://, continuar al fallback
    }
  }

  // 2. Fallback universal con textarea temporal (funciona en file://, HTTP y todos los navegadores)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (copied) return true;
  } catch (err) {
    // Fallback final
  }

  return false;
}

function renderCartDrawer() {
  const cartBody = document.querySelector('#cart-body');
  const cartFooter = document.querySelector('#cart-footer');
  if (!cartBody || !cartFooter) return;

  // Preservar lo que el usuario haya escrito antes de re-renderizar
  const formState = syncCartFormFromDOM();

  const cart = getCart();
  const { totalAmount, totalItems, hasInquiry } = getCartTotals();

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty-state">
        <span class="empty-icon">🧁</span>
        <h4>Tu canastita está vacía</h4>
        <p>Aún no agregaste ninguna delicia. ¡Explorá nuestra carta y elegí tus dulces favoritos!</p>
        <a href="catalogo.html" class="button button-pink" id="cart-empty-catalogue-btn">
          Ver catálogo de dulces <span>✨</span>
        </a>
      </div>
    `;
    cartFooter.innerHTML = '';
    cartFooter.classList.add('hidden');

    cartBody.querySelector('#cart-empty-catalogue-btn')?.addEventListener('click', (e) => {
      if (window.location.pathname.endsWith('catalogo.html')) {
        e.preventDefault();
      }
      closeCartDrawer();
    });
    return;
  }

  cartFooter.classList.remove('hidden');

  // Lista de items
  const itemsHtml = cart.map((item, idx) => {
    const priceNum = parsePrice(item.price);
    const itemTotal = priceNum > 0 ? formatPrice(priceNum * item.quantity) : 'A consultar';

    return `
      <article class="cart-item" data-idx="${idx}">
        <img class="cart-item-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
        <div class="cart-item-info">
          <div class="cart-item-top">
            <h5 class="cart-item-title">${escapeHtml(item.name)}</h5>
            <button type="button" class="cart-item-del" data-del="${idx}" title="Eliminar de la canasta" aria-label="Eliminar ${escapeHtml(item.name)}">✕</button>
          </div>
          <p class="cart-item-unit">${escapeHtml(item.price)} c/u</p>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button type="button" class="qty-btn" data-minus="${idx}" aria-label="Restar uno">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button type="button" class="qty-btn" data-plus="${idx}" aria-label="Sumar uno">+</button>
            </div>
            <span class="cart-item-subtotal">${itemTotal}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const isEnvio = formState.deliveryType === 'envio';
  const isEfectivo = formState.paymentMethod === 'Efectivo al retirar';

  // Formulario con datos de entrega y pago
  const formHtml = `
    <div class="cart-checkout-box">
      <h5 class="checkout-box-title">Datos para tu pedido 🎀</h5>

      <div class="cart-field">
        <label for="order-name">Tu nombre y apellido</label>
        <input type="text" id="order-name" class="cart-input" placeholder="Ej. Valentina Gómez" value="${escapeHtml(formState.name)}" />
      </div>

      <div class="cart-field">
        <label>Forma de entrega</label>
        <div class="delivery-toggle-group">
          <label class="radio-card">
            <input type="radio" name="delivery-type" value="retiro" ${!isEnvio ? 'checked' : ''} />
            <span class="radio-label">
              <strong>Retiro en taller</strong>
              <small>Sin costo adicional</small>
            </span>
          </label>
          <label class="radio-card">
            <input type="radio" name="delivery-type" value="envio" ${isEnvio ? 'checked' : ''} />
            <span class="radio-label">
              <strong>Envío a domicilio</strong>
              <small>Coordinar costo por zona</small>
            </span>
          </label>
        </div>
      </div>

      <div class="cart-field ${isEnvio ? '' : 'hidden'}" id="address-field-wrap">
        <label for="order-address">Dirección de entrega</label>
        <input type="text" id="order-address" class="cart-input" placeholder="Calle, altura, piso/dpto y localidad" value="${escapeHtml(formState.address)}" />
      </div>

      <div class="cart-field">
        <label>Método de pago preferido</label>
        <div class="payment-options-grid">
          <label class="radio-card mini">
            <input type="radio" name="payment-method" value="Transferencia / Mercado Pago" ${!isEfectivo ? 'checked' : ''} />
            <span class="radio-label">📲 Transferencia / Alias</span>
          </label>
          <label class="radio-card mini">
            <input type="radio" name="payment-method" value="Efectivo al retirar" ${isEfectivo ? 'checked' : ''} />
            <span class="radio-label">💵 Efectivo</span>
          </label>
        </div>
      </div>

      <!-- Datos de transferencia bancaria -->
      <div class="bank-info-box" id="bank-info-box">
        <div class="bank-info-header">
          <span>✨ Alias para transferir:</span>
          <button type="button" class="alias-tag" id="alias-copy-btn" title="Clic para copiar alias">
            <span class="alias-text">${escapeHtml(BAKERY_PAYMENT_INFO.alias)}</span>
            <span class="alias-copy-icon">📋</span>
          </button>
        </div>
        <p class="bank-info-note">Hacé clic en el alias para copiarlo. Podés abonar por Mercado Pago o transferencia bancaria y enviar el comprobante por WhatsApp.</p>
      </div>

      <div class="cart-field">
        <label for="order-notes">Aclaraciones o fecha especial (Opcional)</label>
        <textarea id="order-notes" class="cart-input" rows="2" placeholder="Ej. Dedicatoria en la torta, fecha y horario deseado...">${escapeHtml(formState.notes)}</textarea>
      </div>
    </div>
  `;

  cartBody.innerHTML = `
    <div class="cart-items-container">
      ${itemsHtml}
    </div>
    ${formHtml}
  `;

  // Listener para copiar Alias con soporte universal y feedback visual
  const aliasCopyBtn = cartBody.querySelector('#alias-copy-btn');
  aliasCopyBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const copied = await copyTextToClipboard(BAKERY_PAYMENT_INFO.alias);
    if (copied) {
      aliasCopyBtn.classList.add('copied');
      aliasCopyBtn.innerHTML = `<span>¡Copiado! ${escapeHtml(BAKERY_PAYMENT_INFO.alias)}</span> <span>✓</span>`;
      showToast(`¡Alias "${BAKERY_PAYMENT_INFO.alias}" copiado al portapapeles! 📋`);
      setTimeout(() => {
        if (aliasCopyBtn.isConnected) {
          aliasCopyBtn.classList.remove('copied');
          aliasCopyBtn.innerHTML = `<span class="alias-text">${escapeHtml(BAKERY_PAYMENT_INFO.alias)}</span> <span class="alias-copy-icon">📋</span>`;
        }
      }, 2200);
    } else {
      showToast(`Alias para transferir: ${BAKERY_PAYMENT_INFO.alias}`);
    }
  });

  // Actualizar estado del formulario y link de WhatsApp en tiempo real
  const refreshCheckoutState = () => {
    const state = syncCartFormFromDOM();
    const addressWrap = cartBody.querySelector('#address-field-wrap');
    if (addressWrap) {
      addressWrap.classList.toggle('hidden', state.deliveryType !== 'envio');
    }
    const checkoutLink = cartFooter.querySelector('#btn-checkout-wa');
    if (checkoutLink) {
      checkoutLink.href = buildWhatsAppOrderUrl();
    }
  };

  cartBody.querySelectorAll('#order-name, #order-address, #order-notes').forEach(input => {
    input.addEventListener('input', refreshCheckoutState);
  });

  cartBody.querySelectorAll('input[name="delivery-type"], input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', refreshCheckoutState);
  });

  // Listeners de cantidad y eliminar
  cartBody.querySelectorAll('[data-minus]').forEach(btn => {
    btn.addEventListener('click', () => updateCartItemQty(Number(btn.dataset.minus), -1));
  });
  cartBody.querySelectorAll('[data-plus]').forEach(btn => {
    btn.addEventListener('click', () => updateCartItemQty(Number(btn.dataset.plus), 1));
  });
  cartBody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => removeCartItem(Number(btn.dataset.del)));
  });

  // Footer con totales y botón/enlace directo a WhatsApp
  const totalDisplay = formatPrice(totalAmount);
  const initialWaUrl = buildWhatsAppOrderUrl();

  cartFooter.innerHTML = `
    <div class="cart-total-row">
      <div>
        <span class="cart-total-label">Total estimado (${totalItems} ${totalItems === 1 ? 'dulce' : 'dulces'}):</span>
        ${hasInquiry ? '<small class="cart-inquiry-note">* Incluye productos a cotizar</small>' : ''}
      </div>
      <strong class="cart-total-value">${totalDisplay}</strong>
    </div>

    <div class="cart-actions-row">
      <button type="button" class="button button-secondary btn-clear-cart" id="btn-clear-cart" title="Vaciar canasta">
        Vaciar 🗑️
      </button>
      <a href="${escapeHtml(initialWaUrl)}" target="_blank" rel="noopener noreferrer" class="button button-pink btn-checkout-wa" id="btn-checkout-wa">
        Enviar pedido por WhatsApp <span>📲</span>
      </a>
    </div>
  `;

  cartFooter.querySelector('#btn-clear-cart')?.addEventListener('click', clearCart);
  cartFooter.querySelector('#btn-checkout-wa')?.addEventListener('click', handleWhatsAppCheckout);
}

// ============================================================================
// ENVÍO DE PEDIDO A WHATSAPP (+54 3442 472867)
// ============================================================================
function buildWhatsAppOrderUrl() {
  const cart = getCart();
  const state = syncCartFormFromDOM();
  const name = (state.name || '').trim();
  const deliveryType = state.deliveryType || 'retiro';
  const address = (state.address || '').trim();
  const paymentMethod = state.paymentMethod || 'Transferencia / Mercado Pago';
  const notes = (state.notes || '').trim();
  const { totalAmount, hasInquiry } = getCartTotals();

  const itemsText = cart.map(item => {
    const unitNum = parsePrice(item.price);
    const subtotalText = unitNum > 0 ? formatPrice(unitNum * item.quantity) : 'A consultar';
    return `• ${item.quantity}x ${item.name} (${item.price} c/u) = ${subtotalText}`;
  }).join('\n');

  const deliveryText = deliveryType === 'envio'
    ? `Envío a domicilio (${address || 'Dirección a coordinar'})`
    : 'Retiro en el taller (Sin costo)';

  const totalText = totalAmount > 0 ? formatPrice(totalAmount) : 'A confirmar';

  const message = [
    `¡Hola Coco's Bakery! 🧁 Quiero realizar el siguiente pedido:`,
    ``,
    `📋 DETALLE DE MI PEDIDO:`,
    itemsText,
    ``,
    `💰 TOTAL ESTIMADO: ${totalText}${hasInquiry ? ' (con productos a cotizar)' : ''}`,
    ``,
    `👤 DATOS PARA LA ENTREGA:`,
    name ? `• Nombre: ${name}` : `• Nombre: A coordinar`,
    `• Entrega: ${deliveryText}`,
    `• Forma de pago: ${paymentMethod}`,
    notes ? `• Aclaraciones: ${notes}` : null,
    ``,
    `¡Muchas gracias! ✨ Espero tu confirmación.`
  ].filter(line => line !== null).join('\n');

  return `https://wa.me/${BAKERY_PHONE}?text=${encodeURIComponent(message)}`;
}

function handleWhatsAppCheckout(e) {
  const cart = getCart();
  if (cart.length === 0) {
    if (e) e.preventDefault();
    showToast('Tu canastita está vacía.');
    return;
  }

  const waUrl = buildWhatsAppOrderUrl();
  const checkoutBtn = document.querySelector('#btn-checkout-wa');

  if (checkoutBtn && checkoutBtn.tagName === 'A') {
    checkoutBtn.href = waUrl;
  } else {
    if (e) e.preventDefault();
    const newWin = window.open(waUrl, '_blank');
    if (newWin) {
      newWin.opener = null;
    } else {
      window.location.href = waUrl;
    }
  }

  showToast('¡Redirigiendo a WhatsApp con tu pedido preparado! 📲');
}

// ============================================================================
// NAVEGACIÓN Y EVENTOS GENERALES
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

  // Inicializar componentes globales
  initCartDrawer();
  initCataloguePage();
  initIndexPage();
  initAdminPage();
});

// ============================================================================
// MODAL / VISTA DETALLADA DE PRODUCTO
// ============================================================================
function openProductModal(prod) {
  let overlay = document.querySelector('#product-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'product-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  let currentModalQty = 1;

  overlay.innerHTML = `
    <div class="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title-elem">
      <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">✕</button>
      <div class="modal-media">
        <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80')}" 
             alt="${escapeHtml(prod.name)}" />
      </div>
      <div class="modal-content">
        <div>
          <div class="modal-badges">
            <span class="badge-kind" style="position: static;">${escapeHtml(prod.category || 'Especial')}</span>
            ${prod.tag ? `<span class="badge-tag" style="position: static;">${escapeHtml(prod.tag)}</span>` : ''}
          </div>
          <h3 class="modal-title" id="modal-title-elem">${escapeHtml(prod.name)}</h3>
          <p class="modal-desc">${escapeHtml(prod.description)}</p>
        </div>

        <div class="modal-actions-box">
          <div class="modal-price-row">
            <span class="modal-price">${escapeHtml(prod.price || 'Consultar')}</span>
            <div class="qty-control modal-qty">
              <button type="button" class="qty-btn" id="modal-qty-minus" aria-label="Restar">-</button>
              <span class="qty-val" id="modal-qty-display">1</span>
              <button type="button" class="qty-btn" id="modal-qty-plus" aria-label="Sumar">+</button>
            </div>
          </div>

          <div class="modal-buttons-group">
            <button type="button" class="button button-pink" id="modal-add-cart-btn" style="width: 100%;">
              Agregar a la canasta <span>🛍️</span>
            </button>
            <a href="https://wa.me/${BAKERY_PHONE}?text=${encodeURIComponent('¡Hola Coco\'s Bakery! Quisiera consultar por el dulce: ' + prod.name)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="button button-secondary" 
               style="width: 100%; font-size: 13px;">
              Consultar por WhatsApp <span>💬</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  const closeBtn = overlay.querySelector('.modal-close-btn');
  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Selector de cantidad en modal
  const qtyMinus = overlay.querySelector('#modal-qty-minus');
  const qtyPlus = overlay.querySelector('#modal-qty-plus');
  const qtyDisplay = overlay.querySelector('#modal-qty-display');
  const addBtn = overlay.querySelector('#modal-add-cart-btn');

  qtyMinus?.addEventListener('click', () => {
    if (currentModalQty > 1) {
      currentModalQty--;
      qtyDisplay.textContent = String(currentModalQty);
    }
  });

  qtyPlus?.addEventListener('click', () => {
    currentModalQty++;
    qtyDisplay.textContent = String(currentModalQty);
  });

  addBtn?.addEventListener('click', () => {
    addToCart(prod, currentModalQty);
    closeModal();
    openCartDrawer();
  });

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', handleKeydown);
    }
  }
  window.addEventListener('keydown', handleKeydown);

  function closeModal() {
    overlay.classList.remove('active');
  }
}

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
          <a href="https://wa.me/${BAKERY_PHONE}?text=¡Hola%20Coco's%20Bakery!%20Quisiera%20hacer%20un%20pedido%20especial" 
             target="_blank" rel="noopener noreferrer" class="button button-pink" style="margin-top: 15px;">
            Hacer un pedido especial <span>✦</span>
          </a>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((prod, idx) => `
      <article class="product-card" data-idx="${idx}">
        <div class="product-media" title="Clic para ver detalles">
          <span class="badge-kind">${escapeHtml(prod.category || 'Especial')}</span>
          ${prod.tag ? `<span class="badge-tag">${escapeHtml(prod.tag)}</span>` : ''}
          <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80')}" 
               alt="${escapeHtml(prod.name)}" 
               loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'"/>
        </div>
        <div class="product-info">
          <h3 class="product-title" style="cursor: pointer;" title="Clic para ver detalles">${escapeHtml(prod.name)}</h3>
          <p class="product-desc">${escapeHtml(prod.description)}</p>
          <div class="product-footer">
            <span class="product-price">${escapeHtml(prod.price || 'Consultar')}</span>
            <div class="product-card-actions">
              <button type="button" class="btn-card-add" data-add="${idx}" title="Agregar a la canasta">
                Agregar <span>🛍️</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    // Listener para abrir modal al hacer clic en imagen o título
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      const prod = filtered[i];
      card.querySelector('.product-media')?.addEventListener('click', () => openProductModal(prod));
      card.querySelector('.product-title')?.addEventListener('click', () => openProductModal(prod));
      card.querySelector('[data-add]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(prod, 1);
      });
    });
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
  treatGrid.innerHTML = products.map((prod, idx) => `
    <article class="product-card">
      <div class="product-media" title="Clic para ver detalles">
        <span class="badge-kind">${escapeHtml(prod.category || 'Favorito')}</span>
        ${prod.tag ? `<span class="badge-tag">${escapeHtml(prod.tag)}</span>` : ''}
        <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80')}" 
             alt="${escapeHtml(prod.name)}" 
             loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-title" style="cursor: pointer;" title="Clic para ver detalles">${escapeHtml(prod.name)}</h3>
        <p class="product-desc">${escapeHtml(prod.description)}</p>
        <div class="product-footer">
          <span class="product-price">${escapeHtml(prod.price || 'Consultar')}</span>
          <div class="product-card-actions">
            <button type="button" class="btn-card-add" data-add-featured="${idx}" title="Agregar a la canasta">
              Agregar <span>🛍️</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  treatGrid.querySelectorAll('.product-card').forEach((card, i) => {
    const prod = products[i];
    card.querySelector('.product-media')?.addEventListener('click', () => openProductModal(prod));
    card.querySelector('.product-title')?.addEventListener('click', () => openProductModal(prod));
    card.querySelector('[data-add-featured]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(prod, 1);
    });
  });
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

  const searchInput = document.querySelector('#admin-search-input');
  const countBadge = document.querySelector('#admin-product-count');
  const resetBtn = document.querySelector('#admin-reset-btn');

  let currentImageData = '';

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

  urlInput?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      updateImagePreview(url);
      if (fileInput) fileInput.value = '';
    }
  });

  function renderList() {
    if (!productList) return;
    const allProducts = getProducts();
    const query = (searchInput?.value || '').toLowerCase().trim();

    const filtered = query
      ? allProducts.filter(p => 
          (p.name || '').toLowerCase().includes(query) || 
          (p.category || '').toLowerCase().includes(query) ||
          (p.tag || '').toLowerCase().includes(query) ||
          (p.description || '').toLowerCase().includes(query)
        )
      : allProducts;

    if (countBadge) {
      countBadge.textContent = query 
        ? `${filtered.length} de ${allProducts.length} dulces`
        : `${allProducts.length} dulces en carta`;
    }

    if (filtered.length === 0) {
      productList.innerHTML = query 
        ? `<p class="empty-state">No se encontraron dulces que coincidan con "${escapeHtml(query)}".</p>`
        : '<p class="empty-state">No hay productos en la carta actualmente.</p>';
      return;
    }

    productList.innerHTML = filtered.map(prod => {
      const actualIndex = allProducts.indexOf(prod);
      return `
        <article class="admin-item-row">
          <img class="admin-item-thumb" 
               src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=200&q=80')}" 
               alt="${escapeHtml(prod.name)}" />
          <div class="admin-item-details">
            <h4>${escapeHtml(prod.name)}</h4>
            <p>${escapeHtml(prod.description)}</p>
            <div class="admin-item-meta">
              <span class="badge-kind" style="position: static;">${escapeHtml(prod.category)}</span>
              ${prod.tag ? `<span class="badge-tag" style="position: static;">${escapeHtml(prod.tag)}</span>` : ''}
              <span class="admin-item-price">${escapeHtml(prod.price || 'Consultar')}</span>
            </div>
          </div>
          <div class="admin-item-actions">
            <button type="button" class="btn-icon btn-edit" data-edit="${actualIndex}" title="Editar dulce">✎</button>
            <button type="button" class="btn-icon btn-delete" data-delete="${actualIndex}" title="Eliminar dulce">✕</button>
          </div>
        </article>
      `;
    }).join('');

    productList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.edit);
        startEditing(idx);
      });
    });

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

  searchInput?.addEventListener('input', renderList);

  resetBtn?.addEventListener('click', () => {
    if (confirm('¿Deseas restaurar la carta a los dulces de ejemplo iniciales? Se recuperarán los 6 productos originales.')) {
      saveProducts(DEFAULT_PRODUCTS);
      if (searchInput) searchInput.value = '';
      resetForm();
      renderList();
      showToast('Carta de dulces restaurada con éxito ✨');
    }
  });

  function startEditing(index) {
    const products = getProducts();
    const prod = products[index];
    if (!prod) return;

    if (editIndexInput) editIndexInput.value = String(index);
    document.querySelector('[name="name"]').value = prod.name || '';
    document.querySelector('[name="category"]').value = prod.category || 'Tortas';
    const tagSelect = document.querySelector('[name="tag"]');
    if (tagSelect) tagSelect.value = prod.tag || '';
    document.querySelector('[name="price"]').value = prod.price || '';
    document.querySelector('[name="description"]').value = prod.description || '';
    
    if (urlInput) urlInput.value = prod.image && prod.image.startsWith('http') ? prod.image : '';
    updateImagePreview(prod.image || '');

    if (formTitle) formTitle.textContent = 'Editar Dulce ✨';
    if (submitBtn) submitBtn.innerHTML = 'Actualizar dulce <span>✓</span>';
    cancelBtn?.classList.remove('hidden');

    productForm?.scrollIntoView({ behavior: 'smooth' });
  }

  function resetForm() {
    productForm?.reset();
    if (editIndexInput) editIndexInput.value = '-1';
    if (formTitle) formTitle.textContent = 'Agregar Nuevo Dulce 🧁';
    if (submitBtn) submitBtn.innerHTML = 'Guardar en la carta <span>+</span>';
    cancelBtn?.classList.add('hidden');
    updateImagePreview('');
  }

  cancelBtn?.addEventListener('click', resetForm);

  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(productForm);
    const editIdx = Number(editIndexInput?.value || '-1');
    const products = getProducts();

    const productPayload = {
      name: data.get('name')?.toString().trim(),
      category: data.get('category')?.toString().trim(),
      tag: data.get('tag')?.toString().trim() || '',
      price: data.get('price')?.toString().trim() || 'Consultar',
      description: data.get('description')?.toString().trim(),
      image: currentImageData || (urlInput?.value.trim()) || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80'
    };

    if (editIdx >= 0 && editIdx < products.length) {
      products[editIdx] = productPayload;
      saveProducts(products);
      showToast(`¡"${productPayload.name}" actualizado con éxito! ✨`);
    } else {
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
