// ============================================================
// MSD BACKS AND SWEETS — Admin Panel
// ============================================================

const ADMIN_PASSWORD = 'admin123';
let adminLoggedIn = false;
let activeAdminTab = 'dashboard';

// Default workers data
const defaultWorkers = [
  { id: 'w1', name: 'Anbu Raja', role: 'Baker', salary: 12000, joinDate: '2024-01-15', attendance: {}, status: 'active' },
  { id: 'w2', name: 'Kavitha M', role: 'Cashier', salary: 10000, joinDate: '2024-03-20', attendance: {}, status: 'active' },
  { id: 'w3', name: 'Sakthi K', role: 'Helper', salary: 8000, joinDate: '2024-06-01', attendance: {}, status: 'active' },
  { id: 'w4', name: 'Priya S', role: 'Sweet Maker', salary: 11000, joinDate: '2023-12-01', attendance: {}, status: 'active' },
];

const defaultDeliveryPersons = [
  { id: 'dp1', name: 'Rajan Kumar', phone: '9876501234', vehicle: 'TVS Apache', vehicleNo: 'TN-47-AB-1234', salary: 8000, perDelivery: 20, deliveries: 45, status: 'active' },
  { id: 'dp2', name: 'Murugan S', phone: '9876502345', vehicle: 'Activa', vehicleNo: 'TN-47-CD-5678', salary: 7500, perDelivery: 20, deliveries: 38, status: 'active' },
  { id: 'dp3', name: 'Selvam K', phone: '9876503456', vehicle: 'Splendor', vehicleNo: 'TN-47-EF-9012', salary: 8000, perDelivery: 20, deliveries: 52, status: 'active' },
];

function getWorkers() {
  return JSON.parse(localStorage.getItem('msd_workers') || JSON.stringify(defaultWorkers));
}
function saveWorkers(w) { localStorage.setItem('msd_workers', JSON.stringify(w)); }
function getDeliveryPersons() {
  return JSON.parse(localStorage.getItem('msd_delivery_persons') || JSON.stringify(defaultDeliveryPersons));
}
function saveDeliveryPersons(d) { localStorage.setItem('msd_delivery_persons', JSON.stringify(d)); }

// ── Admin Init ────────────────────────────────────────────
function initAdmin() {
  // Check session
  if (sessionStorage.getItem('msd_admin') === 'true') {
    adminLoggedIn = true;
    showAdminPanel();
  }
}

function adminLogin() {
  const pw = document.getElementById('admin-password')?.value;
  if (pw === ADMIN_PASSWORD) {
    adminLoggedIn = true;
    sessionStorage.setItem('msd_admin', 'true');
    showAdminPanel();
    showToast('👑 Welcome, Admin!', 'success');
  } else {
    showToast('Wrong password!', 'error');
    document.getElementById('admin-password').style.borderColor = '#EF9A9A';
  }
}

function adminLogout() {
  adminLoggedIn = false;
  sessionStorage.removeItem('msd_admin');
  document.getElementById('admin-panel')?.classList.remove('visible');
  document.getElementById('admin-login')?.classList.remove('hidden');
  showToast('Logged out successfully', 'info');
}

function showAdminPanel() {
  document.getElementById('admin-login')?.classList.add('hidden');
  document.getElementById('admin-panel')?.classList.add('visible');
  switchAdminTab('dashboard');
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
  document.getElementById('admin-' + tab)?.classList.add('active');

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'orders') renderAdminOrders();
  if (tab === 'workers') renderAdminWorkers();
  if (tab === 'delivery') renderAdminDelivery();
  if (tab === 'salary') renderSalary();
  if (tab === 'queries') renderAdminQueries();
}

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  const orders = JSON.parse(localStorage.getItem('msd_orders') || '[]');
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === today);
  const revenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status !== 'delivered').length;
  const workers = getWorkers();

  document.getElementById('stat-orders') && (document.getElementById('stat-orders').textContent = todayOrders.length);
  document.getElementById('stat-revenue') && (document.getElementById('stat-revenue').textContent = '₹' + revenue);
  document.getElementById('stat-pending') && (document.getElementById('stat-pending').textContent = pending);
  document.getElementById('stat-workers') && (document.getElementById('stat-workers').textContent = workers.filter(w => w.status === 'active').length);

  // Recent orders table
  const recentContainer = document.getElementById('recent-orders-table');
  if (recentContainer) {
    const recent = [...orders].reverse().slice(0, 8);
    if (recent.length === 0) {
      recentContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">No orders yet</p>';
      return;
    }
    recentContainer.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th>Order ID</th><th>Customer</th><th>Phone</th>
            <th>Amount</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${recent.map(o => `
              <tr>
                <td><strong style="color:var(--accent)">${o.id}</strong></td>
                <td>${o.name || '-'}</td>
                <td>${o.phone || '-'}</td>
                <td>₹${o.total || 0}</td>
                <td>${statusBadge(o.status)}</td>
                <td>
                  <select onchange="updateOrderStatus('${o.id}', this.value)"
                    style="background:var(--bg-card2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:0.75rem;">
                    <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
                    <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="picked" ${o.status === 'picked' ? 'selected' : ''}>Picked Up</option>
                    <option value="on_way" ${o.status === 'on_way' ? 'selected' : ''}>On the Way</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                  </select>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

function updateAdminDashboard() {
  if (activeAdminTab === 'dashboard') renderDashboard();
}

function statusBadge(status) {
  const map = {
    placed:    '<span class="badge badge-info">Placed</span>',
    preparing: '<span class="badge badge-warning">Preparing</span>',
    picked:    '<span class="badge badge-warning">Picked Up</span>',
    on_way:    '<span class="badge badge-warning">On the Way</span>',
    delivered: '<span class="badge badge-success">Delivered</span>',
  };
  return map[status] || '<span class="badge">Unknown</span>';
}

function updateOrderStatus(orderId, newStatus) {
  let orders = JSON.parse(localStorage.getItem('msd_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('msd_orders', JSON.stringify(orders));
    showToast(`Order ${orderId} → ${newStatus}`, 'success');
  }
}

// ── Admin Orders ──────────────────────────────────────────
function renderAdminOrders() {
  const orders = JSON.parse(localStorage.getItem('msd_orders') || '[]');
  const container = document.getElementById('admin-orders');
  if (!container) return;

  const filterStatus = document.getElementById('order-status-filter')?.value || 'all';
  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const tableArea = container.querySelector('#orders-table-area');
  if (!tableArea) return;

  if (filtered.length === 0) {
    tableArea.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">No orders found</p>';
    return;
  }

  tableArea.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th>Order ID</th><th>Customer</th><th>Phone</th><th>Address</th>
          <th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${[...filtered].reverse().map(o => `
            <tr>
              <td><strong style="color:var(--accent)">${o.id}</strong></td>
              <td>${o.name || '-'}</td>
              <td><a href="tel:${o.phone}" style="color:var(--primary)">${o.phone}</a></td>
              <td style="max-width:150px;word-break:break-word;font-size:0.8rem">${o.addr || '-'}</td>
              <td>${(o.items || []).length} items</td>
              <td style="color:var(--accent);font-weight:700">₹${o.total}</td>
              <td><span class="badge badge-info">${o.payment === 'cod' ? 'COD' : 'UPI'}</span></td>
              <td>${statusBadge(o.status)}</td>
              <td>
                <select onchange="updateOrderStatus('${o.id}', this.value)"
                  style="background:var(--bg-card2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:0.75rem;">
                  <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
                  <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                  <option value="picked" ${o.status === 'picked' ? 'selected' : ''}>Picked Up</option>
                  <option value="on_way" ${o.status === 'on_way' ? 'selected' : ''}>On the Way</option>
                  <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Workers ───────────────────────────────────────────────
function renderAdminWorkers() {
  const workers = getWorkers();
  const container = document.getElementById('workers-table-area');
  if (!container) return;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th>Name</th><th>Role</th><th>Salary</th><th>Join Date</th>
          <th>Attendance (${currentMonth})</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${workers.map(w => {
            const monthAttendance = w.attendance[currentMonth] || {};
            const daysPresent = Object.values(monthAttendance).filter(v => v === 'present').length;
            const totalDays = Object.keys(monthAttendance).length;
            return `
              <tr>
                <td><strong>${w.name}</strong></td>
                <td>${w.role}</td>
                <td style="color:var(--accent)">₹${w.salary.toLocaleString()}</td>
                <td>${new Date(w.joinDate).toLocaleDateString('en-IN')}</td>
                <td>
                  <span class="badge badge-success">${daysPresent}P</span>
                  <span class="badge badge-danger">${totalDays - daysPresent}A</span>
                  <button onclick="markAttendance('${w.id}')" class="btn-sm btn-sm-primary" style="margin-left:0.5rem">Mark Today</button>
                </td>
                <td><span class="badge ${w.status === 'active' ? 'badge-success' : 'badge-danger'}">${w.status}</span></td>
                <td>
                  <button onclick="viewWorkerAttendance('${w.id}')" class="btn-sm btn-sm-primary">📅 Attend</button>
                  <button onclick="removeWorker('${w.id}')" class="btn-sm btn-sm-danger">🗑️ Remove</button>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function markAttendance(workerId) {
  const workers = getWorkers();
  const worker = workers.find(w => w.id === workerId);
  if (!worker) return;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const month = today.slice(0, 7);
  if (!worker.attendance[month]) worker.attendance[month] = {};

  if (worker.attendance[month][today]) {
    // Toggle
    worker.attendance[month][today] = worker.attendance[month][today] === 'present' ? 'absent' : 'present';
  } else {
    worker.attendance[month][today] = 'present';
  }
  saveWorkers(workers);
  renderAdminWorkers();
  showToast(`✅ Attendance marked for ${worker.name}`, 'success');
}

function viewWorkerAttendance(workerId) {
  const workers = getWorkers();
  const worker = workers.find(w => w.id === workerId);
  if (!worker) return;

  const month = new Date().toISOString().slice(0, 7);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const attendance = worker.attendance[month] || {};

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    const status = attendance[dateStr];
    return `<div class="att-day ${status || ''}" onclick="toggleAttendanceDay('${workerId}', '${dateStr}')" title="${dateStr}">
      ${status === 'present' ? '✓' : status === 'absent' ? '✗' : i + 1}
    </div>`;
  }).join('');

  const present = Object.values(attendance).filter(v => v === 'present').length;
  const absent  = Object.values(attendance).filter(v => v === 'absent').length;

  // Show in a modal-like section
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(8px)';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:2rem;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;animation:bounceIn 0.4s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h3 style="font-size:1.2rem;font-weight:700">📅 ${worker.name} — ${month}</h3>
        <button onclick="this.closest('[style]').remove()" style="width:32px;height:32px;background:rgba(255,255,255,0.05);border-radius:8px;color:var(--text-muted);font-size:1rem">✕</button>
      </div>
      <div style="display:flex;gap:1rem;margin-bottom:1rem">
        <span class="badge badge-success">✓ ${present} Present</span>
        <span class="badge badge-danger">✗ ${absent} Absent</span>
        <span class="badge badge-info">— ${daysInMonth - present - absent} Unmarked</span>
      </div>
      <div class="attendance-grid">${days}</div>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-top:1rem;text-align:center">Click any day to toggle Present/Absent</p>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function toggleAttendanceDay(workerId, dateStr) {
  const workers = getWorkers();
  const worker = workers.find(w => w.id === workerId);
  if (!worker) return;
  const month = dateStr.slice(0, 7);
  if (!worker.attendance[month]) worker.attendance[month] = {};
  const current = worker.attendance[month][dateStr];
  worker.attendance[month][dateStr] = current === 'present' ? 'absent' : 'present';
  saveWorkers(workers);
  // Refresh modal
  document.querySelector('[style*="position:fixed"]')?.remove();
  viewWorkerAttendance(workerId);
}

function showAddWorkerForm() {
  const modal = createFormModal('👤 Add New Worker', `
    <div class="form-group"><label>Full Name</label><input id="new-w-name" placeholder="Worker name"></div>
    <div class="form-group"><label>Role</label>
      <select id="new-w-role">
        <option>Baker</option><option>Cashier</option><option>Helper</option>
        <option>Sweet Maker</option><option>Cleaner</option><option>Security</option>
      </select>
    </div>
    <div class="form-group"><label>Monthly Salary (₹)</label><input id="new-w-salary" type="number" placeholder="10000"></div>
    <div class="form-group"><label>Join Date</label><input id="new-w-date" type="date"></div>
    <button onclick="addWorker()" class="btn-submit" style="margin-top:0.5rem">Add Worker</button>
  `);
  document.body.appendChild(modal);
  document.getElementById('new-w-date').value = new Date().toISOString().slice(0, 10);
}

function addWorker() {
  const name = document.getElementById('new-w-name')?.value?.trim();
  const role = document.getElementById('new-w-role')?.value;
  const salary = parseInt(document.getElementById('new-w-salary')?.value);
  const joinDate = document.getElementById('new-w-date')?.value;
  if (!name || !salary) { showToast('Fill all fields!', 'warning'); return; }

  const workers = getWorkers();
  workers.push({ id: 'w' + Date.now(), name, role, salary, joinDate, attendance: {}, status: 'active' });
  saveWorkers(workers);
  document.querySelector('[style*="position:fixed"]')?.remove();
  renderAdminWorkers();
  showToast(`✅ ${name} added!`, 'success');
}

function removeWorker(id) {
  if (!confirm('Remove this worker?')) return;
  let workers = getWorkers();
  workers = workers.filter(w => w.id !== id);
  saveWorkers(workers);
  renderAdminWorkers();
  showToast('Worker removed', 'info');
}

// ── Delivery Persons ──────────────────────────────────────
function renderAdminDelivery() {
  const dps = getDeliveryPersons();
  const container = document.getElementById('delivery-table-area');
  if (!container) return;

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th>Name</th><th>Phone</th><th>Vehicle</th><th>Vehicle No.</th>
          <th>Base Salary</th><th>Per Delivery</th><th>Deliveries</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${dps.map(dp => `
            <tr>
              <td><strong>${dp.name}</strong></td>
              <td><a href="tel:${dp.phone}" style="color:var(--primary)">${dp.phone}</a></td>
              <td>${dp.vehicle}</td>
              <td>${dp.vehicleNo}</td>
              <td style="color:var(--accent)">₹${dp.salary.toLocaleString()}</td>
              <td>₹${dp.perDelivery}</td>
              <td><span class="badge badge-info">${dp.deliveries}</span></td>
              <td><span class="badge ${dp.status === 'active' ? 'badge-success' : 'badge-danger'}">${dp.status}</span></td>
              <td>
                <button onclick="removeDp('${dp.id}')" class="btn-sm btn-sm-danger">🗑️ Remove</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function showAddDeliveryForm() {
  const modal = createFormModal('🚴 Add Delivery Person', `
    <div class="form-group"><label>Full Name</label><input id="new-dp-name" placeholder="Full name"></div>
    <div class="form-group"><label>Phone</label><input id="new-dp-phone" placeholder="10-digit phone"></div>
    <div class="form-group"><label>Vehicle Type</label><input id="new-dp-vehicle" placeholder="e.g. Activa, Apache"></div>
    <div class="form-group"><label>Vehicle Number</label><input id="new-dp-vno" placeholder="TN-47-XX-0000"></div>
    <div class="form-group"><label>Base Monthly Salary (₹)</label><input id="new-dp-salary" type="number" placeholder="8000"></div>
    <div class="form-group"><label>Per Delivery Bonus (₹)</label><input id="new-dp-per" type="number" placeholder="20"></div>
    <button onclick="addDeliveryPerson()" class="btn-submit" style="margin-top:0.5rem">Add Delivery Person</button>
  `);
  document.body.appendChild(modal);
}

function addDeliveryPerson() {
  const name    = document.getElementById('new-dp-name')?.value?.trim();
  const phone   = document.getElementById('new-dp-phone')?.value?.trim();
  const vehicle = document.getElementById('new-dp-vehicle')?.value?.trim();
  const vno     = document.getElementById('new-dp-vno')?.value?.trim();
  const salary  = parseInt(document.getElementById('new-dp-salary')?.value);
  const per     = parseInt(document.getElementById('new-dp-per')?.value) || 20;
  if (!name || !phone || !vehicle) { showToast('Fill all required fields!', 'warning'); return; }

  const dps = getDeliveryPersons();
  const newDp = { id: 'dp' + Date.now(), name, phone, vehicle, vehicleNo: vno, salary, perDelivery: per, deliveries: 0, status: 'active' };
  dps.push(newDp);
  saveDeliveryPersons(dps);
  // Also update DELIVERY_PERSONS array for tracking
  DELIVERY_PERSONS.push({ ...newDp, photo: '🏍️', rating: 5.0, lat: SHOP_INFO.lat, lng: SHOP_INFO.lng });
  document.querySelector('[style*="position:fixed"]')?.remove();
  renderAdminDelivery();
  showToast(`✅ ${name} added as delivery person!`, 'success');
}

function removeDp(id) {
  if (!confirm('Remove this delivery person?')) return;
  let dps = getDeliveryPersons();
  dps = dps.filter(d => d.id !== id);
  saveDeliveryPersons(dps);
  renderAdminDelivery();
  showToast('Delivery person removed', 'info');
}

// ── Salary ────────────────────────────────────────────────
function renderSalary() {
  const workers = getWorkers();
  const dps = getDeliveryPersons();
  const month = new Date().toISOString().slice(0, 7);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const container = document.getElementById('salary-content');
  if (!container) return;

  const workerSalaries = workers.map(w => {
    const att = w.attendance[month] || {};
    const present = Object.values(att).filter(v => v === 'present').length;
    const absent  = Object.values(att).filter(v => v === 'absent').length;
    const perDay  = Math.round(w.salary / 26); // 26 working days
    const deduct  = absent * perDay;
    const net     = w.salary - deduct;
    return { ...w, present, absent, perDay, deduct, net };
  });

  const dpSalaries = dps.map(dp => {
    const deliveryBonus = dp.deliveries * dp.perDelivery;
    const net = dp.salary + deliveryBonus;
    return { ...dp, deliveryBonus, net };
  });

  container.innerHTML = `
    <h4 style="font-size:1rem;font-weight:700;margin-bottom:1rem;color:var(--primary)">👨‍🍳 Worker Salaries — ${month}</h4>
    <div class="table-wrapper" style="margin-bottom:2rem">
      <table class="data-table">
        <thead><tr>
          <th>Name</th><th>Role</th><th>Base Salary</th><th>Days Present</th>
          <th>Days Absent</th><th>Deduction</th><th>Net Salary</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${workerSalaries.map(w => `
            <tr>
              <td><strong>${w.name}</strong></td>
              <td>${w.role}</td>
              <td>₹${w.salary.toLocaleString()}</td>
              <td><span class="badge badge-success">${w.present} days</span></td>
              <td><span class="badge badge-danger">${w.absent} days</span></td>
              <td style="color:#EF9A9A">-₹${w.deduct.toLocaleString()}</td>
              <td style="color:var(--accent);font-weight:800;font-size:1rem">₹${w.net.toLocaleString()}</td>
              <td><button onclick="showSalarySlip('${w.id}','worker')" class="btn-sm btn-sm-primary">📄 Slip</button></td>
            </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:rgba(255,107,43,0.05)">
            <td colspan="6" style="font-weight:700;text-align:right">Total Salary Outflow:</td>
            <td style="color:var(--accent);font-weight:900;font-size:1.1rem">₹${workerSalaries.reduce((s,w) => s + w.net, 0).toLocaleString()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <h4 style="font-size:1rem;font-weight:700;margin-bottom:1rem;color:var(--primary)">🚴 Delivery Person Salaries</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th>Name</th><th>Vehicle</th><th>Base Salary</th>
          <th>Deliveries</th><th>Delivery Bonus</th><th>Total Salary</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${dpSalaries.map(dp => `
            <tr>
              <td><strong>${dp.name}</strong></td>
              <td>${dp.vehicle}</td>
              <td>₹${dp.salary.toLocaleString()}</td>
              <td><span class="badge badge-info">${dp.deliveries}</span></td>
              <td style="color:#81C784">+₹${dp.deliveryBonus.toLocaleString()}</td>
              <td style="color:var(--accent);font-weight:800;font-size:1rem">₹${dp.net.toLocaleString()}</td>
              <td><button onclick="showSalarySlip('${dp.id}','dp')" class="btn-sm btn-sm-primary">📄 Slip</button></td>
            </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:rgba(255,107,43,0.05)">
            <td colspan="5" style="font-weight:700;text-align:right">Total Delivery Salary:</td>
            <td style="color:var(--accent);font-weight:900;font-size:1.1rem">₹${dpSalaries.reduce((s,d) => s + d.net, 0).toLocaleString()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div style="margin-top:1.5rem;padding:1.5rem;background:rgba(255,107,43,0.08);border:1px solid rgba(255,107,43,0.2);border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <p style="font-size:0.85rem;color:var(--text-muted)">Total Monthly Salary Outflow</p>
          <p style="font-size:2rem;font-weight:900;color:var(--accent)">₹${(workerSalaries.reduce((s,w) => s + w.net, 0) + dpSalaries.reduce((s,d) => s + d.net, 0)).toLocaleString()}</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:0.75rem;color:var(--text-muted)">Staff: ${workers.length} | Delivery: ${dps.length}</p>
          <p style="font-size:0.75rem;color:var(--text-dim)">Month: ${month}</p>
        </div>
      </div>
    </div>`;
}

function showSalarySlip(id, type) {
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  let person, salaryDetails;

  if (type === 'worker') {
    const workers = getWorkers();
    const w = workers.find(x => x.id === id);
    if (!w) return;
    const m = new Date().toISOString().slice(0, 7);
    const att = w.attendance[m] || {};
    const present = Object.values(att).filter(v => v === 'present').length;
    const absent  = Object.values(att).filter(v => v === 'absent').length;
    const perDay  = Math.round(w.salary / 26);
    const deduct  = absent * perDay;
    person = w;
    salaryDetails = `
      <div class="salary-row"><span>Basic Salary</span><span>₹${w.salary.toLocaleString()}</span></div>
      <div class="salary-row"><span>Days Present</span><span>${present} days</span></div>
      <div class="salary-row"><span>Days Absent</span><span>${absent} days</span></div>
      <div class="salary-row"><span>Deduction (${absent} × ₹${perDay})</span><span style="color:#EF9A9A">-₹${deduct.toLocaleString()}</span></div>
      <div class="salary-row" style="border-top:2px solid var(--primary);margin-top:0.5rem"><span>Net Salary</span><span>₹${(w.salary - deduct).toLocaleString()}</span></div>`;
  } else {
    const dps = getDeliveryPersons();
    const dp = dps.find(x => x.id === id);
    if (!dp) return;
    const bonus = dp.deliveries * dp.perDelivery;
    person = dp;
    salaryDetails = `
      <div class="salary-row"><span>Base Salary</span><span>₹${dp.salary.toLocaleString()}</span></div>
      <div class="salary-row"><span>Deliveries Done</span><span>${dp.deliveries}</span></div>
      <div class="salary-row"><span>Delivery Bonus (${dp.deliveries} × ₹${dp.perDelivery})</span><span style="color:#81C784">+₹${bonus.toLocaleString()}</span></div>
      <div class="salary-row" style="border-top:2px solid var(--primary);margin-top:0.5rem"><span>Total Salary</span><span>₹${(dp.salary + bonus).toLocaleString()}</span></div>`;
  }

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(8px)';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:2rem;max-width:400px;width:100%;animation:bounceIn 0.4s ease">
      <div style="text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px">Salary Slip</p>
        <h3 style="font-size:1.3rem;font-weight:800;margin:0.25rem 0">MSD BACKS AND SWEETS</h3>
        <p style="font-size:0.8rem;color:var(--text-muted)">${month}</p>
      </div>
      <div style="margin-bottom:1.5rem">
        <p style="font-size:0.75rem;color:var(--text-muted)">Employee Name</p>
        <p style="font-size:1rem;font-weight:700">${person.name}</p>
        <p style="font-size:0.8rem;color:var(--text-muted)">${person.role || person.vehicle}</p>
      </div>
      <div class="salary-card">${salaryDetails}</div>
      <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
        <button onclick="window.print()" class="btn-sm btn-sm-primary" style="flex:1;padding:0.6rem">🖨️ Print</button>
        <button onclick="this.closest('[style]').remove()" class="btn-sm btn-sm-danger" style="flex:1;padding:0.6rem">✕ Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ── Queries Admin ─────────────────────────────────────────
function renderAdminQueries() {
  const queries = JSON.parse(localStorage.getItem('msd_queries') || '[]');
  const container = document.getElementById('queries-table-area');
  if (!container) return;

  if (queries.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">No queries yet</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>Type</th><th>Name</th><th>Phone</th><th>Message</th><th>Time</th><th>Action</th></tr></thead>
        <tbody>
          ${[...queries].reverse().map((q, i) => `
            <tr>
              <td><span class="badge ${q.type === 'complaint' ? 'badge-danger' : q.type === 'feedback' ? 'badge-success' : 'badge-info'}">${q.type}</span></td>
              <td>${q.name}</td>
              <td><a href="tel:${q.phone}" style="color:var(--primary)">${q.phone}</a></td>
              <td style="max-width:200px;word-break:break-word;font-size:0.85rem">${q.msg}</td>
              <td style="font-size:0.75rem;color:var(--text-muted)">${new Date(q.time).toLocaleString('en-IN')}</td>
              <td><a href="tel:${q.phone}" class="btn-sm btn-sm-primary">📞 Call</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Helper: Create Modal ──────────────────────────────────
function createFormModal(title, bodyHTML) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(8px)';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:2rem;max-width:460px;width:100%;max-height:90vh;overflow-y:auto;animation:bounceIn 0.4s ease;position:relative">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h3 style="font-size:1.2rem;font-weight:700">${title}</h3>
        <button onclick="this.closest('[style]').remove()" style="width:32px;height:32px;background:rgba(255,255,255,0.05);border-radius:8px;color:var(--text-muted);font-size:1rem;cursor:pointer">✕</button>
      </div>
      ${bodyHTML}
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  return modal;
}
