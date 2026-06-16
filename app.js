// ============================================================
// MSD BACKS AND SWEETS — Main Application Logic
// ============================================================

// ── Cart State ────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('msd_cart') || '[]');
let orders = JSON.parse(localStorage.getItem('msd_orders') || '[]');
let activeCategory = 'milk';
let activePage = 'home';
let queryType = 'query';
let selectedPayment = 'cod';

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderQueries();
  initCart();
  initAdmin();
  updateCartBadge();
  initNavScroll();
  initMobileNav();
  startMealsCountdown();
  // Show home page
  showPage('home');
});

// ── Navigation ────────────────────────────────────────────
function showPage(page) {
  activePage = page;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(page + '-section');
  if (target) {
    target.classList.add('active');
    if (page !== 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  // Close mobile nav
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.remove('open');

  if (page === 'products') renderProducts();
  if (page === 'tracking') initTrackingMap();
  if (page === 'queries') { renderQueries(); initContactMap(); }
}

function initNavScroll() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── Products ──────────────────────────────────────────────
function renderProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  // Category Tabs
  const tabsHTML = Object.values(PRODUCTS).map(cat => {
    const isLocked = cat.timeRestricted && !isMealsAvailable();
    return `
      <button class="cat-tab ${cat.id === activeCategory ? 'active' : ''} ${isLocked ? '' : ''}"
              onclick="switchCategory('${cat.id}')"
              id="tab-${cat.id}"
              ${isLocked ? 'disabled' : ''}>
        ${cat.icon} ${cat.name}
        ${isLocked ? '<span class="lock-badge">🔒 After 6PM</span>' : ''}
      </button>`;
  }).join('');

  container.innerHTML = `
    <div class="category-tabs" id="cat-tabs">${tabsHTML}</div>
    <div id="products-grid-container"></div>
  `;
  renderProductGrid(activeCategory);
}

function switchCategory(catId) {
  const cat = PRODUCTS[catId];
  if (cat.timeRestricted && !isMealsAvailable()) return;
  activeCategory = catId;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + catId)?.classList.add('active');
  renderProductGrid(catId);
}

function isMealsAvailable() {
  return new Date().getHours() >= 18;
}

function renderProductGrid(catId) {
  const cat = PRODUCTS[catId];
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  if (cat.timeRestricted && !isMealsAvailable()) {
    const remaining = getTimeUntil6PM();
    container.innerHTML = `
      <div class="meals-locked">
        <span class="meals-locked-icon">🌙</span>
        <h3>Meals Available After 6:00 PM</h3>
        <p>Our hot meals section opens at 6 PM. Check back soon for<br>delicious Chicken Noodles, Fried Rice, and more!</p>
        <div class="countdown-timer">
          <div class="countdown-block"><span class="countdown-num" id="cd-h">${remaining.h}</span><span class="countdown-lbl">Hours</span></div>
          <div class="countdown-block"><span class="countdown-num" id="cd-m">${remaining.m}</span><span class="countdown-lbl">Mins</span></div>
          <div class="countdown-block"><span class="countdown-num" id="cd-s">${remaining.s}</span><span class="countdown-lbl">Secs</span></div>
        </div>
      </div>`;
    return;
  }

  let html = '<div class="products-grid">';

  if (cat.subCategories) {
    Object.values(cat.subCategories).forEach(subCat => {
      html = html.replace('</div>', '') + `</div>`;
      container.innerHTML = `
        <div class="subcategory-label">${subCat.name}</div>
        <div class="products-grid">${subCat.items.map(item => productCardHTML(item, cat)).join('')}</div>
      `;
    });
    // Rebuild with sub-cats
    container.innerHTML = Object.values(cat.subCategories).map(subCat => `
      <div class="subcategory-label">${subCat.name}</div>
      <div class="products-grid">${subCat.items.map(item => productCardHTML(item, cat)).join('')}</div>
    `).join('');
  } else {
    container.innerHTML = `<div class="products-grid">${cat.items.map(item => productCardHTML(item, cat)).join('')}</div>`;
  }
  // Animate cards in
  container.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });
}

function productCardHTML(item, cat) {
  const cartItem = cart.find(c => c.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;
  const isCustomizable = item.customizable;

  return `
    <div class="product-card" id="card-${item.id}">
      ${item.popular ? '<div class="product-popular">⭐ Popular</div>' : ''}
      <span class="product-emoji">${item.emoji}</span>
      <div class="product-name">${item.name}</div>
      <div class="product-desc">${item.desc}</div>
      ${item.unit ? `<div class="product-unit">📦 ${item.unit}</div>` : ''}
      <div class="product-footer">
        <div class="product-price">₹${item.price}<span> each</span></div>
        ${qty > 0
          ? `<div class="btn-qty">
               <button onclick="updateQty('${item.id}', -1, ${item.price}, '${item.name}', '${item.emoji}', '${cat.id}')">−</button>
               <span>${qty}</span>
               <button onclick="updateQty('${item.id}', 1, ${item.price}, '${item.name}', '${item.emoji}', '${cat.id}')">+</button>
             </div>`
          : `<button class="btn-add-cart" onclick="addToCart('${item.id}', ${item.price}, '${item.name}', '${item.emoji}', '${cat.id}')" title="Add to cart">+</button>`
        }
      </div>
      ${isCustomizable ? `
        <button onclick="toggleCustomCake()" style="margin-top:0.75rem;width:100%;padding:0.5rem;background:rgba(255,107,43,0.1);border:1px dashed rgba(255,107,43,0.4);border-radius:8px;color:var(--primary);font-size:0.8rem;font-weight:600;">
          ✨ Customize This Cake
        </button>
        <div class="cake-custom-form" id="custom-cake-form">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">📞 We'll call you to confirm design details!</p>
          <input id="cake-msg" placeholder="Describe your cake (flavor, design, message...)" style="width:100%;padding:0.5rem;background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.8rem;margin-bottom:0.5rem;">
          <input id="cake-phone" placeholder="Your phone number" style="width:100%;padding:0.5rem;background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.8rem;">
          <button onclick="submitCustomCake()" style="margin-top:0.5rem;width:100%;padding:0.5rem;background:var(--gradient);border-radius:8px;color:#fff;font-size:0.8rem;font-weight:700;">Request Custom Cake</button>
        </div>
      ` : ''}
    </div>`;
}

function toggleCustomCake() {
  const form = document.getElementById('custom-cake-form');
  form?.classList.toggle('visible');
}

function submitCustomCake() {
  const msg = document.getElementById('cake-msg')?.value;
  const phone = document.getElementById('cake-phone')?.value;
  if (!msg || !phone) { showToast('Please fill in all fields', 'warning'); return; }
  showToast('🎂 Custom cake request sent! We\'ll call you soon.', 'success');
  document.getElementById('custom-cake-form')?.classList.remove('visible');
}

// ── Cart Functions ─────────────────────────────────────────
function addToCart(id, price, name, emoji, catId) {
  const existing = cart.find(c => c.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, price, name, emoji, catId, qty: 1 }); }
  saveCart();
  updateCartBadge();
  renderProductGrid(activeCategory);
  showToast(`${emoji} ${name} added to cart!`, 'success');
  animateCartBtn();
}

function updateQty(id, delta, price, name, emoji, catId) {
  const existing = cart.find(c => c.id === id);
  if (!existing) {
    if (delta > 0) addToCart(id, price, name, emoji, catId);
    return;
  }
  existing.qty += delta;
  if (existing.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderProductGrid(activeCategory);
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('msd_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const total = cart.reduce((sum, c) => sum + c.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

function animateCartBtn() {
  const btn = document.getElementById('btn-cart');
  btn?.classList.add('animate-cart');
  setTimeout(() => btn?.classList.remove('animate-cart'), 400);
}

function initCart() {
  renderCartItems();
  // Cart open/close
  document.getElementById('btn-cart')?.addEventListener('click', openCart);
  document.getElementById('btn-close-cart')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
}

function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  renderCartItems();
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

function renderCartItems() {
  const container = document.getElementById('cart-items-list');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Your cart is empty</p>
        <p style="font-size:0.8rem;margin-top:0.5rem;color:var(--text-dim)">Add some delicious items!</p>
      </div>`;
    updateCartTotals();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} × ${item.qty} = <strong>₹${item.price * item.qty}</strong></div>
      </div>
      <div class="cart-item-qty">
        <button onclick="updateQty('${item.id}', -1, ${item.price}, '${item.name}', '${item.emoji}', '${item.catId}')">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty('${item.id}', 1, ${item.price}, '${item.name}', '${item.emoji}', '${item.catId}')">+</button>
      </div>
    </div>`).join('');
  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const total = subtotal + delivery;
  const stEl = document.getElementById('cart-subtotal-val');
  const dvEl = document.getElementById('cart-delivery-val');
  const ttEl = document.getElementById('cart-total-val');
  if (stEl) stEl.textContent = `₹${subtotal}`;
  if (dvEl) dvEl.textContent = `₹${delivery}`;
  if (ttEl) ttEl.textContent = `₹${total}`;
}

// ── Checkout ──────────────────────────────────────────────
function openCheckout() {
  if (cart.length === 0) { showToast('Cart is empty!', 'warning'); return; }
  closeCart();
  document.getElementById('checkout-modal')?.classList.add('open');
  selectedPayment = 'cod';
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.payment === 'cod');
  });
}

function selectPayment(type) {
  selectedPayment = type;
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.payment === type);
  });
}

function closeCheckout() {
  document.getElementById('checkout-modal')?.classList.remove('open');
}

function placeOrder() {
  const name   = document.getElementById('order-name')?.value?.trim();
  const phone  = document.getElementById('order-phone')?.value?.trim();
  const addr   = document.getElementById('order-address')?.value?.trim();

  if (!name || !phone || !addr) { showToast('Please fill all required fields!', 'warning'); return; }
  if (!/^\d{10}$/.test(phone)) { showToast('Enter a valid 10-digit phone number', 'error'); return; }

  const orderId = 'MSD' + Date.now().toString().slice(-6);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = 30;
  const dp = DELIVERY_PERSONS[Math.floor(Math.random() * DELIVERY_PERSONS.length)];

  const order = {
    id: orderId,
    name, phone, addr,
    payment: selectedPayment,
    items: [...cart],
    subtotal,
    delivery,
    total: subtotal + delivery,
    status: 'placed',
    deliveryPersonId: dp.id,
    placedAt: new Date().toISOString(),
    estimatedMins: Math.floor(Math.random() * 15) + 20,
  };

  orders.push(order);
  localStorage.setItem('msd_orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  updateCartBadge();

  // Show success
  document.getElementById('checkout-form')?.classList.add('hidden');
  document.getElementById('order-success')?.classList.remove('hidden');
  document.getElementById('order-id-display').textContent = orderId;
  document.getElementById('est-time-display').textContent = order.estimatedMins;
  document.getElementById('success-dp-name').textContent = dp.name;
  document.getElementById('success-dp-phone').textContent = dp.phone;

  showToast(`🎉 Order ${orderId} placed successfully!`, 'success');
  renderCartItems();
  updateCartBadge();

  // Update admin dashboard
  updateAdminDashboard();
}

function trackOrderFromSuccess() {
  const orderId = document.getElementById('order-id-display')?.textContent;
  closeCheckout();
  showPage('tracking');
  setTimeout(() => {
    document.getElementById('tracking-input').value = orderId;
    searchOrder();
  }, 500);
}

// ── Meals Countdown ───────────────────────────────────────
function getTimeUntil6PM() {
  const now = new Date();
  const target = new Date();
  target.setHours(18, 0, 0, 0);
  if (now >= target) return { h: '00', m: '00', s: '00' };
  const diff = target - now;
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  return { h, m, s };
}

function startMealsCountdown() {
  setInterval(() => {
    if (activeCategory === 'meals') {
      const r = getTimeUntil6PM();
      const cdh = document.getElementById('cd-h');
      const cdm = document.getElementById('cd-m');
      const cds = document.getElementById('cd-s');
      if (cdh) cdh.textContent = r.h;
      if (cdm) cdm.textContent = r.m;
      if (cds) cds.textContent = r.s;
    }
    // Check if it's now 6PM to unlock meals
    if (isMealsAvailable()) {
      const tab = document.getElementById('tab-meals');
      if (tab && tab.disabled) {
        tab.disabled = false;
        tab.querySelector('.lock-badge')?.remove();
        showToast('🍽️ Meals are now available!', 'info');
      }
    }
  }, 1000);
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: '🔔' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Queries Section ───────────────────────────────────────
function renderQueries() {
  // FAQ items
  const faqs = [
    { q: 'What are your delivery hours?', a: 'We deliver from 7 AM to 10 PM. Meals section is available after 6 PM.' },
    { q: 'How do I track my order?', a: 'Go to the Tracking page and enter your Order ID or phone number to see live GPS location of your delivery person.' },
    { q: 'Do you do customized cakes?', a: 'Yes! Go to the Cakes section, click "Customize This Cake", fill the form and we\'ll call you to confirm.' },
    { q: 'What is the delivery charge?', a: 'Flat ₹30 delivery charge for all orders. Free delivery on orders above ₹300 (coming soon).' },
    { q: 'Can I cancel my order?', a: 'You can cancel within 5 minutes of placing the order. Call us directly or use the Queries page.' },
    { q: 'What payment methods do you accept?', a: 'Cash on Delivery and UPI payment (PhonePe, GPay, Paytm).' },
  ];

  const faqContainer = document.getElementById('faq-list');
  if (faqContainer) {
    faqContainer.innerHTML = faqs.map((f, i) => `
      <div class="faq-item" id="faq-${i}">
        <button class="faq-question" onclick="toggleFaq(${i})">
          ${f.q}
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">${f.a}</div>
      </div>`).join('');
  }
}

function toggleFaq(i) {
  const item = document.getElementById('faq-' + i);
  item?.classList.toggle('open');
}

function setQueryType(type) {
  queryType = type;
  document.querySelectorAll('.query-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type);
  });
}

function submitQuery() {
  const name = document.getElementById('q-name')?.value?.trim();
  const phone = document.getElementById('q-phone')?.value?.trim();
  const msg = document.getElementById('q-message')?.value?.trim();
  if (!name || !phone || !msg) { showToast('Please fill all fields!', 'warning'); return; }

  // Store query
  const queries = JSON.parse(localStorage.getItem('msd_queries') || '[]');
  queries.push({ name, phone, msg, type: queryType, time: new Date().toISOString() });
  localStorage.setItem('msd_queries', JSON.stringify(queries));

  document.getElementById('q-name').value = '';
  document.getElementById('q-phone').value = '';
  document.getElementById('q-message').value = '';

  const typeLabels = { query: 'query', complaint: 'complaint', feedback: 'feedback' };
  showToast(`✅ Your ${typeLabels[queryType]} has been submitted! We'll respond soon.`, 'success');
}

// ── Scroll Animations ─────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .stat-card, .shop-detail').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}
