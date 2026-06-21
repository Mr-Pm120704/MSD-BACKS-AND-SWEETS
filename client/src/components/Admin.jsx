import React, { useState, useEffect } from 'react';
import { statuses, statusLabels } from './Navbar';
import API_BASE_URL from '../config';

function money(v) { return '\u20B9' + Number(v || 0); }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Admin({ notify }) {
  const [token, setToken] = useState(() => localStorage.getItem('msd_admin_token') || '');
  const [login, setLogin] = useState({ username: 'admin', password: '' });
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '', role: 'delivery', salary: 0, vehicle: '', vehicleNo: '' });
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [salaryMonth, setSalaryMonth] = useState(currentMonth);
  const [salaryYear, setSalaryYear] = useState(currentYear);

  const authHeaders = { Authorization: `Bearer ${token}` };

  async function doLogin() {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
    const json = await res.json();
    if (!res.ok) return notify(json.message || 'Login failed', 'error');
    localStorage.setItem('msd_admin_token', json.token);
    setToken(json.token);
    notify('Welcome, Admin!', 'success');
  }

  async function loadOrders() {
    const res = await fetch(`${API_BASE_URL}/api/orders`, { headers: authHeaders });
    const json = await res.json();
    if (res.ok) setOrders(json.data);
  }

  async function loadWorkers() {
    const res = await fetch(`${API_BASE_URL}/api/workers`, { headers: authHeaders });
    const json = await res.json();
    if (res.ok) setWorkers(json.data);
  }

  async function loadQueries() {
    const res = await fetch(`${API_BASE_URL}/api/queries`, { headers: authHeaders });
    const json = await res.json();
    if (res.ok) setQueries(json.data);
  }

  useEffect(() => {
    if (token) { loadOrders(); loadWorkers(); loadQueries(); }
  }, [token]);

  async function updateStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ status }) });
    const json = await res.json();
    if (res.ok) { setOrders(prev => prev.map(o => o.id === id ? json.data : o)); notify(`Order ${id} updated`, 'success'); }
  }

  async function addWorker() {
    if (!newWorker.name || !newWorker.phone) return notify('Name and phone required', 'warning');
    const res = await fetch(`${API_BASE_URL}/api/workers`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(newWorker) });
    const json = await res.json();
    if (!res.ok) return notify(json.message || 'Error', 'error');
    setWorkers(prev => [...prev, json.data]);
    setShowAddWorker(false);
    setNewWorker({ name: '', phone: '', role: 'delivery', salary: 0, vehicle: '', vehicleNo: '' });
    notify('Worker added', 'success');
  }

  async function checkIn(workerId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/${workerId}/checkin`, { method: 'POST', headers: authHeaders });
    const json = await res.json();
    if (res.ok) notify('Checked in', 'success');
  }

  async function checkOut(workerId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/${workerId}/checkout`, { method: 'POST', headers: authHeaders });
    const json = await res.json();
    if (res.ok) notify('Checked out', 'success');
  }

  async function loadAttendance(workerId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/${workerId}/attendance?month=${salaryMonth}&year=${salaryYear}`, { headers: authHeaders });
    const json = await res.json();
    if (res.ok) setAttendanceRecords(json.data);
  }

  async function calculateSalary(workerId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/salary/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ workerId, month: salaryMonth, year: salaryYear }) });
    const json = await res.json();
    if (!res.ok) return notify(json.message || 'Error', 'error');
    setSalaryRecords(prev => [...prev.filter(s => s.workerId !== workerId), json.data]);
    notify('Salary calculated', 'success');
  }

  async function loadSalary(workerId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/salary/${workerId}`, { headers: authHeaders });
    const json = await res.json();
    if (res.ok) setSalaryRecords(json.data);
  }

  async function paySalary(salaryId) {
    const res = await fetch(`${API_BASE_URL}/api/workers/salary/${salaryId}/pay`, { method: 'POST', headers: authHeaders });
    const json = await res.json();
    if (res.ok) { setSalaryRecords(prev => prev.map(s => s._id === salaryId ? json.data : s)); notify('Salary marked as paid', 'success'); }
  }

  async function updateQueryStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/api/queries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ status }) });
    const json = await res.json();
    if (res.ok) setQueries(prev => prev.map(q => q._id === id ? json.data : q));
  }

  async function deactivateWorker(id) {
    const res = await fetch(`${API_BASE_URL}/api/workers/${id}`, { method: 'DELETE', headers: authHeaders });
    const json = await res.json();
    if (res.ok) { setWorkers(prev => prev.map(w => w._id === id ? { ...w, isActive: false } : w)); notify('Worker deactivated', 'success'); }
  }

  if (!token) return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-login glass">
          <div className="admin-login-icon"><i className="fa-solid fa-user-shield"></i></div>
          <h3>Admin Login</h3>
          <div className="form-group">
            <label><i className="fa-solid fa-user"></i> Username</label>
            <input value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} placeholder="Username" />
          </div>
          <div className="form-group">
            <label><i className="fa-solid fa-lock"></i> Password</label>
            <input type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} placeholder="Password" onKeyDown={e => e.key === 'Enter' && doLogin()} />
          </div>
          <button className="btn-primary btn-glow" onClick={doLogin}><i className="fa-solid fa-right-to-bracket"></i> Login</button>
        </div>
      </div>
    </section>
  );

  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = orders.filter(o => o.status !== 'delivered').length;

  return (
    <section className="admin-page">
      <div className="container">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-gauge-high"></i> Admin</div>
          <h2 className="section-title">Admin <span className="gradient-text">Dashboard</span></h2>
        </div>

        <div className="admin-stats">
          <div className="stat-card glass"><i className="fa-solid fa-shopping-bag"></i><div className="stat-num">{orders.length}</div><div className="stat-label">Total Orders</div></div>
          <div className="stat-card glass"><i className="fa-solid fa-indian-rupee-sign"></i><div className="stat-num">{money(revenue)}</div><div className="stat-label">Revenue</div></div>
          <div className="stat-card glass"><i className="fa-solid fa-clock"></i><div className="stat-num">{pending}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card glass"><i className="fa-solid fa-users"></i><div className="stat-num">{workers.length}</div><div className="stat-label">Workers</div></div>
        </div>

        <div className="admin-tabs">
          {[
            ['orders', 'Orders', 'fa-shopping-bag'],
            ['workers', 'Workers', 'fa-users'],
            ['attendance', 'Attendance', 'fa-calendar-check'],
            ['salary', 'Salary', 'fa-wallet'],
            ['queries', 'Queries', 'fa-comments'],
          ].map(([id, label, icon]) => (
            <button key={id} className={`admin-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              <i className={`fa-solid ${icon}`}></i> {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="admin-section">
            <div className="table-wrapper glass">
              <table className="data-table">
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td>{o.name}</td>
                      <td>{o.phone}</td>
                      <td>{money(o.total)}</td>
                      <td><span className={`badge badge-${o.status}`}>{statusLabels[o.status]}</span></td>
                      <td>
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                          {statuses.map(s => <option value={s} key={s}>{statusLabels[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'workers' && (
          <div className="admin-section">
            <div className="section-actions">
              <button className="btn-primary" onClick={() => setShowAddWorker(!showAddWorker)}>
                <i className="fa-solid fa-plus"></i> Add Worker
              </button>
            </div>
            {showAddWorker && (
              <div className="add-worker-form glass">
                <h4><i className="fa-solid fa-user-plus"></i> Add New Worker</h4>
                <div className="form-row">
                  <div className="form-group"><label>Name</label><input value={newWorker.name} onChange={e => setNewWorker({ ...newWorker, name: e.target.value })} placeholder="Full name" /></div>
                  <div className="form-group"><label>Phone</label><input value={newWorker.phone} onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })} placeholder="Phone number" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Role</label>
                    <select value={newWorker.role} onChange={e => setNewWorker({ ...newWorker, role: e.target.value })}>
                      <option value="delivery">Delivery</option>
                      <option value="baker">Baker</option>
                      <option value="helper">Helper</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Monthly Salary</label><input type="number" value={newWorker.salary} onChange={e => setNewWorker({ ...newWorker, salary: Number(e.target.value) })} /></div>
                </div>
                {newWorker.role === 'delivery' && (
                  <div className="form-row">
                    <div className="form-group"><label>Vehicle</label><input value={newWorker.vehicle} onChange={e => setNewWorker({ ...newWorker, vehicle: e.target.value })} placeholder="e.g., Activa" /></div>
                    <div className="form-group"><label>Vehicle No</label><input value={newWorker.vehicleNo} onChange={e => setNewWorker({ ...newWorker, vehicleNo: e.target.value })} placeholder="TN-47-XX-1234" /></div>
                  </div>
                )}
                <div className="form-actions">
                  <button className="btn-primary" onClick={addWorker}><i className="fa-solid fa-check"></i> Save</button>
                  <button className="btn-secondary" onClick={() => setShowAddWorker(false)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="workers-grid">
              {workers.map(w => (
                <div key={w._id} className={`worker-card glass ${!w.isActive ? 'inactive' : ''}`}>
                  <div className="worker-avatar">{w.photo || (w.role === 'delivery' ? '🚴' : w.role === 'baker' ? '👨‍🍳' : '👷')}</div>
                  <div className="worker-info">
                    <h4>{w.name}</h4>
                    <p><i className="fa-solid fa-phone"></i> {w.phone}</p>
                    <p><i className="fa-solid fa-briefcase"></i> {w.role.charAt(0).toUpperCase() + w.role.slice(1)}</p>
                    {w.vehicle && <p><i className="fa-solid fa-motorcycle"></i> {w.vehicle} ({w.vehicleNo})</p>}
                    <p><i className="fa-solid fa-indian-rupee-sign"></i> {money(w.salary)}/month</p>
                    {w.rating && <p><i className="fa-solid fa-star"></i> {w.rating}</p>}
                  </div>
                  <div className="worker-actions">
                    {w.isActive && w.role === 'delivery' && (
                      <>
                        <button className="btn-sm btn-success" onClick={() => checkIn(w._id)}><i className="fa-solid fa-right-to-bracket"></i> In</button>
                        <button className="btn-sm btn-warning" onClick={() => checkOut(w._id)}><i className="fa-solid fa-right-from-bracket"></i> Out</button>
                      </>
                    )}
                    {w.isActive && <button className="btn-sm btn-danger" onClick={() => deactivateWorker(w._id)}><i className="fa-solid fa-user-slash"></i></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'attendance' && (
          <div className="admin-section">
            <div className="section-actions">
              <div className="month-selector">
                <select value={salaryMonth} onChange={e => setSalaryMonth(Number(e.target.value))}>
                  {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={salaryYear} onChange={e => setSalaryYear(Number(e.target.value))}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="workers-grid">
              {workers.map(w => (
                <div key={w._id} className="worker-card glass">
                  <div className="worker-avatar">{w.photo || '👷'}</div>
                  <div className="worker-info"><h4>{w.name}</h4><p>{w.role}</p></div>
                  <div className="worker-actions">
                    <button className="btn-sm btn-success" onClick={() => { setSelectedWorker(w); checkIn(w._id); }}>Check In</button>
                    <button className="btn-sm btn-warning" onClick={() => { setSelectedWorker(w); checkOut(w._id); }}>Check Out</button>
                    <button className="btn-sm btn-primary" onClick={() => { setSelectedWorker(w); loadAttendance(w._id); }}>View</button>
                  </div>
                </div>
              ))}
            </div>
            {attendanceRecords.length > 0 && selectedWorker && (
              <div className="table-wrapper glass" style={{ marginTop: '1.5rem' }}>
                <h4>Attendance for {selectedWorker.name} - {monthNames[salaryMonth - 1]} {salaryYear}</h4>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Overtime</th></tr></thead>
                  <tbody>
                    {attendanceRecords.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</td>
                        <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</td>
                        <td>{a.hoursWorked || 0}h</td>
                        <td>{a.overtime || 0}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'salary' && (
          <div className="admin-section">
            <div className="section-actions">
              <div className="month-selector">
                <select value={salaryMonth} onChange={e => setSalaryMonth(Number(e.target.value))}>
                  {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={salaryYear} onChange={e => setSalaryYear(Number(e.target.value))}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="workers-grid">
              {workers.map(w => (
                <div key={w._id} className="worker-card glass">
                  <div className="worker-avatar">{w.photo || '👷'}</div>
                  <div className="worker-info">
                    <h4>{w.name}</h4>
                    <p>{w.role} &bull; {money(w.salary)}/mo</p>
                  </div>
                  <div className="worker-actions">
                    <button className="btn-sm btn-primary" onClick={() => { setSelectedWorker(w); calculateSalary(w._id); loadSalary(w._id); }}>
                      <i className="fa-solid fa-calculator"></i> Calculate
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {salaryRecords.length > 0 && (
              <div className="table-wrapper glass" style={{ marginTop: '1.5rem' }}>
                <h4>Salary Records - {monthNames[salaryMonth - 1]} {salaryYear}</h4>
                <table className="data-table">
                  <thead><tr><th>Worker</th><th>Base</th><th>Days</th><th>OT Hours</th><th>Net Salary</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {salaryRecords.map(s => {
                      const worker = workers.find(w => w._id === (typeof s.workerId === 'string' ? s.workerId : s.workerId?._id));
                      return (
                        <tr key={s._id}>
                          <td>{worker?.name || 'N/A'}</td>
                          <td>{money(s.baseSalary)}</td>
                          <td>{s.daysPresent}/{s.totalDays}</td>
                          <td>{s.overtimeHours}h</td>
                          <td><strong>{money(s.netSalary)}</strong></td>
                          <td>{s.isPaid ? <span className="badge badge-delivered">Paid</span> : <span className="badge badge-placed">Unpaid</span>}</td>
                          <td>{!s.isPaid && <button className="btn-sm btn-success" onClick={() => paySalary(s._id)}><i className="fa-solid fa-check"></i> Pay</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'queries' && (
          <div className="admin-section">
            <div className="queries-list">
              {queries.length === 0 && <p className="no-data">No queries yet.</p>}
              {queries.map(q => (
                <div key={q._id} className={`query-card glass status-${q.status}`}>
                  <div className="query-header">
                    <span className={`query-type-badge type-${q.type}`}>{q.type}</span>
                    <span className={`badge badge-${q.status === 'resolved' ? 'delivered' : 'placed'}`}>{q.status}</span>
                  </div>
                  <div className="query-body">
                    <p><strong>{q.name}</strong> ({q.phone})</p>
                    <p>{q.message}</p>
                    <small>{new Date(q.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="query-actions">
                    <select value={q.status} onChange={e => updateQueryStatus(q._id, e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
