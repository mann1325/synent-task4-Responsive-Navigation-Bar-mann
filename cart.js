// ===== CART SYSTEM =====
const CART_KEY = 'omnifood_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Add item to cart (called from menu/detail pages)
function addToCart(name, price, image) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, image, qty: 1 });
  }
  saveCart(cart);
  showToast(`${name} added to cart!`);
}

// Toast notification
function showToast(message) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #1a1a1a; color: #fff; padding: 12px 24px;
      border-radius: 8px; font-size: 0.9rem; font-weight: 500;
      z-index: 9998; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transition: opacity 0.3s; opacity: 0;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ===== CART PAGE RENDERING =====
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const emptyCart = document.getElementById('emptyCart');
  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.style.display = 'none';
    cartSummary.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  cartItems.style.display = 'flex';
  cartSummary.style.display = 'block';
  emptyCart.style.display = 'none';

  cartItems.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='resources/img/1.jpg'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Rs. ${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
      </div>
      <div class="cart-item-total">Rs. ${itemTotal.toFixed(2)}</div>
      <button class="remove-btn" onclick="removeItem(${index})" title="Remove">✕</button>
    `;
    cartItems.appendChild(div);
  });

  document.getElementById('subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `Rs. ${subtotal.toFixed(2)}`;
}

function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// Place order — save to orders.txt via PHP, show modal
document.addEventListener('DOMContentLoaded', function () {
  renderCart();

  const placeBtn = document.getElementById('placeOrderBtn');
  const clearBtn = document.getElementById('clearCartBtn');
  const modal = document.getElementById('orderModal');
  const modalMsg = document.getElementById('modalMsg');
  const modalClose = document.getElementById('modalClose');

  if (placeBtn) {
    placeBtn.addEventListener('click', function () {
      const cart = getCart();
      if (cart.length === 0) return;

      const orderText = cart.map(i => `${i.name} x${i.qty}`).join(', ');
      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

      // Send order to PHP to save in orders.txt
      const formData = new FormData();
      formData.append('order', orderText);
      formData.append('total', subtotal.toFixed(2));

      fetch('save_order.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(() => {
          modalMsg.textContent = `Your order (${orderText}) has been placed. Total: Rs. ${subtotal.toFixed(2)}. Show this at the counter to confirm!`;
          modal.style.display = 'flex';
          saveCart([]);
          renderCart();
        })
        .catch(() => {
          // Even if server fails, show confirmation (offline/local use)
          modalMsg.textContent = `Your order (${orderText}) has been placed. Total: Rs. ${subtotal.toFixed(2)}. Show this at the counter to confirm!`;
          modal.style.display = 'flex';
          saveCart([]);
          renderCart();
        });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (confirm('Clear all items from cart?')) {
        saveCart([]);
        renderCart();
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', function () {
      modal.style.display = 'none';
      window.location.href = 'menu.html';
    });
  }
});
