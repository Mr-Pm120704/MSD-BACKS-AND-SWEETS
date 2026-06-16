// ============================================================
// MSD BACKS AND SWEETS — Delivery Tracking
// ============================================================

let deliveryMap = null;
let contactMap = null;
let deliveryMarker = null;
let shopMarker = null;
let routeLine = null;
let trackingInterval = null;
let currentTrackedOrder = null;

// ── Init Tracking Map ─────────────────────────────────────
function initTrackingMap() {
  if (deliveryMap) return; // Already initialized
  setTimeout(() => {
    const mapEl = document.getElementById('delivery-map');
    if (!mapEl) return;

    deliveryMap = L.map('delivery-map', {
      zoomControl: true,
      attributionControl: false,
    }).setView([SHOP_INFO.lat, SHOP_INFO.lng], 14);

    // Dark tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(deliveryMap);

    // Shop marker
    const shopIcon = L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#FF6B2B,#8B1A4A);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;border:3px solid #fff;box-shadow:0 4px 20px rgba(255,107,43,0.5);animation:pulse 2s infinite">🏪</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      className: ''
    });
    shopMarker = L.marker([SHOP_INFO.lat, SHOP_INFO.lng], { icon: shopIcon })
      .addTo(deliveryMap)
      .bindPopup(`<b style="color:#FF6B2B">🏪 MSD BACKS AND SWEETS</b><br><small>Mylampatty, Karur</small>`);

    // Show placeholder
    showTrackingPlaceholder();
  }, 100);
}

function showTrackingPlaceholder() {
  const infoPanel = document.getElementById('tracking-info-panel');
  if (infoPanel) {
    infoPanel.innerHTML = `
      <div class="tracking-placeholder">
        <span>🚴</span>
        <h4 style="font-weight:700;margin-bottom:0.5rem;">Enter your Order ID</h4>
        <p>Track your delivery in real-time<br>with live GPS location</p>
        <p style="font-size:0.75rem;margin-top:1rem;color:var(--text-dim)">Format: MSD + 6 digits (e.g. MSD123456)</p>
      </div>`;
  }
}

// ── Search Order ──────────────────────────────────────────
function searchOrder() {
  const input = document.getElementById('tracking-input')?.value?.trim().toUpperCase();
  if (!input) { showToast('Enter an Order ID or phone number', 'warning'); return; }

  const orders = JSON.parse(localStorage.getItem('msd_orders') || '[]');
  let order = orders.find(o => o.id === input || o.phone === input);

  if (!order) {
    // Demo: create a sample order if not found
    if (input === 'DEMO' || input === 'MSD999999') {
      order = createDemoOrder();
    } else {
      showToast('Order not found. Try "DEMO" to see tracking demo', 'error');
      return;
    }
  }

  currentTrackedOrder = order;
  displayOrderTracking(order);
  showToast(`📦 Tracking order ${order.id}`, 'info');
}

function createDemoOrder() {
  return {
    id: 'MSD999999',
    name: 'Demo User',
    phone: '9876543210',
    addr: 'Near Temple, Mylampatty, Karur - 621301',
    status: 'on_way',
    items: [
      { name: 'Masala Tea', emoji: '☕', qty: 2, price: 15 },
      { name: 'Veg Puff', emoji: '🥧', qty: 3, price: 15 },
    ],
    total: 105,
    deliveryPersonId: 'dp1',
    placedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedMins: 10,
  };
}

// ── Display Tracking ──────────────────────────────────────
function displayOrderTracking(order) {
  const dp = DELIVERY_PERSONS.find(d => d.id === order.deliveryPersonId) || DELIVERY_PERSONS[0];
  const statuses = ['placed', 'preparing', 'picked', 'on_way', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);

  const statusLabels = {
    placed:    { label: 'Order Placed', icon: '📋', desc: 'Your order has been received', time: formatTime(order.placedAt) },
    preparing: { label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is preparing your order', time: formatTime(new Date(new Date(order.placedAt).getTime() + 5*60000).toISOString()) },
    picked:    { label: 'Picked Up', icon: '🛵', desc: 'Delivery person picked up order', time: formatTime(new Date(new Date(order.placedAt).getTime() + 12*60000).toISOString()) },
    on_way:    { label: 'On the Way', icon: '📍', desc: 'Racing to your location!', time: 'Now', isActive: true },
    delivered: { label: 'Delivered', icon: '✅', desc: 'Order delivered successfully!', time: '' },
  };

  const infoPanel = document.getElementById('tracking-info-panel');
  if (!infoPanel) return;

  infoPanel.innerHTML = `
    <div class="tracking-info-card">
      <div class="tracking-info-header">
        <div class="delivery-avatar">${dp.photo}</div>
        <div class="delivery-info">
          <h4>${dp.name}</h4>
          <p>${dp.vehicle} • ${dp.vehicleNo}</p>
        </div>
        <div class="delivery-rating">⭐ ${dp.rating}</div>
      </div>
      <div class="tracking-body">
        <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:0.75rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem;">
            <span>Order ID</span><span style="color:var(--accent);font-weight:700">${order.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);">
            <span>Total</span><span style="color:var(--accent);font-weight:700">₹${order.total}</span>
          </div>
        </div>
        <div class="delivery-contact">
          <a href="tel:${dp.phone}" class="btn-call">📞 Call</a>
          <a href="https://wa.me/91${dp.phone}?text=Hi, I'm tracking order ${order.id}" target="_blank" class="btn-whatsapp">💬 WhatsApp</a>
        </div>
        <div class="order-status-timeline">
          ${statuses.map((s, i) => {
            const info = statusLabels[s];
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return `
              <div class="status-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
                <div class="status-dot">${isDone ? '✓' : info.icon}</div>
                <div class="status-text">
                  <h5>${info.label}</h5>
                  <p>${info.desc}</p>
                  ${isDone || isActive ? `<span class="status-time">${info.time || ''}</span>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;

  // Animate delivery person on map
  startDeliveryAnimation(dp, order);
}

// ── GPS Animation ─────────────────────────────────────────
function startDeliveryAnimation(dp, order) {
  if (!deliveryMap) return;

  // Clear previous
  if (deliveryMarker) deliveryMap.removeLayer(deliveryMarker);
  if (routeLine) deliveryMap.removeLayer(routeLine);
  if (trackingInterval) clearInterval(trackingInterval);

  // Delivery person's start position (slightly away from shop)
  let lat = dp.lat;
  let lng = dp.lng;

  // Destination (simulate user address near shop)
  const destLat = SHOP_INFO.lat + (Math.random() - 0.5) * 0.04;
  const destLng = SHOP_INFO.lng + (Math.random() - 0.5) * 0.04;

  const dpIcon = L.divIcon({
    html: `<div style="
      background:linear-gradient(135deg,#FF6B2B,#FFD700);
      width:50px;height:50px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:1.6rem;
      border:3px solid #fff;
      box-shadow:0 0 20px rgba(255,107,43,0.7);
      animation:pulse 1.5s infinite;
      position:relative;
    ">🏍️<div style="
      position:absolute;inset:-6px;
      border-radius:50%;
      border:2px solid rgba(255,107,43,0.4);
      animation:ping 1.5s infinite;
    "></div></div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    className: ''
  });

  const destIcon = L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#43A047,#1B5E20);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:3px solid #fff;box-shadow:0 4px 15px rgba(67,160,71,0.4)">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: ''
  });

  deliveryMarker = L.marker([lat, lng], { icon: dpIcon })
    .addTo(deliveryMap)
    .bindPopup(`<b>${dp.name}</b><br>${dp.vehicle}`);

  L.marker([destLat, destLng], { icon: destIcon })
    .addTo(deliveryMap)
    .bindPopup(`<b>📍 Delivery Location</b>`);

  // Draw route line
  routeLine = L.polyline([[lat, lng], [destLat, destLng]], {
    color: '#FF6B2B',
    weight: 3,
    opacity: 0.7,
    dashArray: '8, 12',
    lineCap: 'round',
  }).addTo(deliveryMap);

  // Fit bounds
  deliveryMap.fitBounds([[lat, lng], [destLat, destLng], [SHOP_INFO.lat, SHOP_INFO.lng]], { padding: [60, 60] });

  // Animate movement
  const steps = 80;
  let step = 0;
  const stepLat = (destLat - lat) / steps;
  const stepLng = (destLng - lng) / steps;

  trackingInterval = setInterval(() => {
    if (step >= steps) {
      clearInterval(trackingInterval);
      showToast('🎉 Order delivered!', 'success');
      return;
    }
    lat += stepLat + (Math.random() - 0.5) * 0.0002; // slight wiggle
    lng += stepLng + (Math.random() - 0.5) * 0.0002;
    deliveryMarker.setLatLng([lat, lng]);

    // Update route line
    routeLine.setLatLngs([[lat, lng], [destLat, destLng]]);
    step++;
  }, 800); // Move every 800ms = ~64 seconds total animation
}

// ── Contact Map ───────────────────────────────────────────
function initContactMap() {
  if (contactMap) return;
  setTimeout(() => {
    const mapEl = document.getElementById('contact-map');
    if (!mapEl) return;

    contactMap = L.map('contact-map', { zoomControl: false, attributionControl: false })
      .setView([SHOP_INFO.lat, SHOP_INFO.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
      .addTo(contactMap);

    const icon = L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#FF6B2B,#8B1A4A);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;border:3px solid #fff;box-shadow:0 4px 20px rgba(255,107,43,0.5)">🍞</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      className: ''
    });

    L.marker([SHOP_INFO.lat, SHOP_INFO.lng], { icon })
      .addTo(contactMap)
      .bindPopup(`<b>MSD BACKS AND SWEETS</b><br>Mylampatty, Karur`)
      .openPopup();
  }, 200);
}

// ── Utils ─────────────────────────────────────────────────
function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
