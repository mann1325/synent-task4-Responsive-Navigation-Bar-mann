// ===== SHARED NAVBAR LOGIC =====

// Update cart badge count from localStorage
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('omnifood_cart') || '[]');
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.querySelector('.cart-count');
  if (badge) {
    badge.textContent = total > 0 ? total : '';
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  updateCartBadge();

  // Highlight active page link
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });
});
