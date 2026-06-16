import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { PRODUCTS, DELIVERY_PERSONS } from './productData.js';

const statuses = ['placed', 'preparing', 'picked', 'on_way', 'delivered'];
const statusLabels = {
  placed: 'Placed',
  preparing: 'Preparing',
  picked: 'Picked Up',
  on_way: 'On the Way',
  delivered: 'Delivered'
};

function money(value) {
  return `₹${Number(value || 0)}`;
}

function App() {
  const [page, setPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('milk');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('msd_cart') || '[]'));
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('msd_cart', JSON.stringify(cart));
  }, [cart]);

  function notify(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function showPage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Navbar page={page} showPage={showPage} cartCount={cartCount} onCart={() => setCheckoutOpen(true)} />
      {page === 'home' && <Home showPage={showPage} setActiveCategory={setActiveCategory} />}
      {page === 'products' && <Products activeCategory={activeCategory} setActiveCategory={setActiveCategory} cart={cart} setCart={setCart} notify={notify} onBuyNow={() => setCheckoutOpen(true)} />}
      {page === 'tracking' && <Tracking notify={notify} />}
      {page === 'queries' && <Queries notify={notify} />}
      {page === 'admin' && <Admin notify={notify} />}
      <Footer showPage={showPage} setActiveCategory={setActiveCategory} />
      <Cart cart={cart} setCart={setCart} open={checkoutOpen} setOpen={setCheckoutOpen} setOrderSuccess={setOrderSuccess} notify={notify} />
      {orderSuccess && <OrderSuccess order={orderSuccess} close={() => setOrderSuccess(null)} track={() => { setOrderSuccess(null); showPage('tracking'); }} />}
      {toast && <div id="toast-container"><div className={`toast ${toast.type}`}><span>🔔</span> {toast.message}</div></div>}
    </>
  );
}

function Navbar({ page, showPage, cartCount, onCart }) {
  const links = [['home', '🏠 Home'], ['products', '🛍️ Menu'], ['tracking', '📍 Track Order'], ['queries', '💬 Queries'], ['admin', '⚙️ Admin']];
  return <nav id="navbar">
    <div className="nav-logo"><div className="nav-logo-icon">🍞</div><span className="nav-logo-text">MSD BACKS & SWEETS</span></div>
    <ul className="nav-links">
      {links.map(([id, label]) => <li key={id}><button className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => showPage(id)}>{label}</button></li>)}
    </ul>
    <div className="nav-actions"><button className="btn-cart" onClick={onCart}>🛒{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</button></div>
  </nav>;
}

function Home({ showPage, setActiveCategory }) {
  const popular = [];
  Object.values(PRODUCTS).forEach(cat => {
    const groups = cat.subCategories ? Object.values(cat.subCategories).flatMap(s => s.items) : cat.items;
    groups.filter(item => item.popular).forEach(item => popular.length < 8 && popular.push({ ...item, catId: cat.id }));
  });
  return <section className="section active" id="home-section">
    <div id="hero">
      <HeroCanvas />
      <div className="hero-overlay"></div>
      <div className="floating-emojis">
        <span className="float-item" style={{ top: '15%', left: '8%', animationDelay: '0s', fontSize: '2.5rem' }}>🎂</span>
        <span className="float-item" style={{ top: '25%', right: '12%', animationDelay: '1s', fontSize: '2rem' }}>🍩</span>
        <span className="float-item" style={{ top: '60%', left: '5%', animationDelay: '2s', fontSize: '1.8rem' }}>☕</span>
        <span className="float-item" style={{ top: '70%', right: '8%', animationDelay: '0.5s', fontSize: '2.2rem' }}>🍫</span>
        <span className="float-item" style={{ top: '40%', left: '3%', animationDelay: '1.5s', fontSize: '1.5rem' }}>🥐</span>
        <span className="float-item" style={{ top: '80%', left: '20%', animationDelay: '3s', fontSize: '1.7rem' }}>🧁</span>
        <span className="float-item" style={{ top: '10%', right: '30%', animationDelay: '2.5s', fontSize: '1.6rem' }}>🍰</span>
        <span className="float-item" style={{ top: '85%', right: '25%', animationDelay: '4s', fontSize: '1.5rem' }}>🥛</span>
      </div>
      <div className="hero-content">
        <div className="hero-badge"><span>⭐</span> Karur's Favourite Bakery Since 2018</div>
        <h1 className="hero-title">MSD BACKS<br />AND SWEETS</h1>
        <p className="hero-subtitle">Freshly baked <span>cakes</span>, traditional <span>sweets</span>,<br />hot <span>meals</span>, chilled <span>drinks</span> & more delivered to your door!</p>
        <div className="hero-cta"><button className="btn-primary" onClick={() => showPage('products')}>🛍️ Explore Menu</button><button className="btn-secondary" onClick={() => showPage('tracking')}>📍 Track Order</button></div>
        <div className="hero-stats"><HeroStat n="500+" l="Happy Customers" /><HeroStat n="50+" l="Menu Items" /><HeroStat n="6 AM" l="Opens Daily" /><HeroStat n="10 KM" l="Delivery Radius" /></div>
      </div>
    </div>
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="section-header"><div className="section-tag">⭐ Popular Picks</div><h2 className="section-title">Our <span>Best Sellers</span></h2><p className="section-desc">The most loved items from our menu.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem' }}>{popular.map(item => <button key={item.id} className="product-card" onClick={() => { setActiveCategory(item.catId); showPage('products'); }}><span className="product-emoji">{item.emoji}</span><div className="product-name">{item.name}</div><div className="product-desc">{item.desc}</div><div className="product-price">{money(item.price)}</div></button>)}</div>
    </div>
  </section>;
}

function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return undefined;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [new THREE.Color(0xFF6B2B), new THREE.Color(0xFFD700), new THREE.Color(0x8B1A4A), new THREE.Color(0xFF4081)];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true }));
    scene.add(particles);

    function shape(type, color, x, y, z, size) {
      const geo = type === 'torus' ? new THREE.TorusGeometry(size, size * 0.3, 8, 16) : type === 'oct' ? new THREE.OctahedronGeometry(size) : new THREE.IcosahedronGeometry(size);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.2 }));
      mesh.position.set(x, y, z);
      mesh.userData = { rotX: Math.random() * 0.01, rotY: Math.random() * 0.01, initY: y, floatSpeed: Math.random() * 0.01 + 0.005 };
      scene.add(mesh);
      return mesh;
    }

    const shapes = [
      shape('torus', 0xFF6B2B, 3, 1.5, -2, 0.8),
      shape('oct', 0xFFD700, -3, -1, -1, 0.5),
      shape('ico', 0x8B1A4A, 4, -2, -3, 0.6),
      shape('torus', 0xFF4081, -4, 2, -2, 0.5),
      shape('oct', 0xFF6B2B, 0, -3, -4, 0.7)
    ];

    let mouse = { x: 0, y: 0 };
    function onMouseMove(e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2.5;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2.5;
    }

    let frame;
    let t = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      t += 0.01;
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      shapes.forEach(s => {
        s.rotation.x += s.userData.rotX;
        s.rotation.y += s.userData.rotY;
        s.position.y = s.userData.initY + Math.sin(t * s.userData.floatSpeed * 100) * 0.3;
      });
      camera.position.x += (mouse.x - camera.position.x) * 0.05;
      camera.position.y += (mouse.y - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      geometry.dispose();
    };
  }, []);

  return <canvas id="hero-canvas" ref={canvasRef}></canvas>;
}

function HeroStat({ n, l }) { return <div className="hero-stat"><div className="hero-stat-num">{n}</div><div className="hero-stat-label">{l}</div></div>; }

function Products({ activeCategory, setActiveCategory, cart, setCart, notify, onBuyNow }) {
  const cat = PRODUCTS[activeCategory];
  const items = cat.subCategories ? Object.values(cat.subCategories) : [{ name: '', items: cat.items }];
  const mealsAvailable = new Date().getHours() >= 18;
  function add(item) {
    setCart(prev => {
      const existing = prev.find(x => x.id === item.id);
      if (existing) return prev.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id: item.id, name: item.name, price: item.price, emoji: item.emoji, catId: cat.id, qty: 1 }];
    });
    notify(`${item.name} added to cart`, 'success');
  }
  function update(item, delta) {
    setCart(prev => prev.map(x => x.id === item.id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }
  function buyNow(item) {
    add(item);
    onBuyNow?.();
  }
  return <section className="section active"><div className="container"><div className="section-header"><div className="section-tag">🛍️ Our Menu</div><h2 className="section-title">Fresh <span>Every Day</span></h2><p className="section-desc">From hot teas to custom cakes, we have it all.</p></div>
    <div className="category-tabs">{Object.values(PRODUCTS).map(c => {
      const locked = c.timeRestricted && !mealsAvailable;
      return <button key={c.id} disabled={locked} className={`cat-tab ${activeCategory === c.id ? 'active' : ''}`} onClick={() => !locked && setActiveCategory(c.id)}>{c.icon} {c.name}{locked && <span className="lock-badge">🔒 After 6PM</span>}</button>;
    })}</div>
    {items.map(group => <React.Fragment key={group.name || cat.id}>{group.name && <div className="subcategory-label">{group.name}</div>}<div className="products-grid">{group.items.map(item => {
      const inCart = cart.find(x => x.id === item.id);
      return <div className="product-card" key={item.id}>{item.popular && <div className="product-popular">⭐ Popular</div>}<span className="product-emoji">{item.emoji}</span><div className="product-name">{item.name}</div><div className="product-desc">{item.desc}</div>{item.unit && <div className="product-unit">📦 {item.unit}</div>}<div className="product-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}><div className="product-price" style={{ marginBottom: '0.5rem' }}>{money(item.price)}<span> each</span></div>{inCart ? <div className="btn-qty" style={{ alignSelf: 'center' }}><button onClick={() => update(item, -1)}>−</button><span>{inCart.qty}</span><button onClick={() => update(item, 1)}>+</button></div> : <div className="product-actions" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}><button className="btn-add-cart" onClick={() => add(item)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>Add to Cart</button><button className="btn-buy-now" onClick={() => buyNow(item)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Buy Now</button></div>}</div></div>;
    })}</div></React.Fragment>)}
  </div></section>;
}

function Cart({ cart, setCart, open, setOpen, setOrderSuccess, notify }) {
  const [form, setForm] = useState({ name: '', phone: '', addr: '', payment: 'cod' });
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  async function placeOrder() {
    if (!cart.length) return notify('Cart is empty', 'warning');
    if (!form.name || !/^\d{10}$/.test(form.phone) || !form.addr) return notify('Enter valid name, phone and address', 'warning');
    const dp = DELIVERY_PERSONS[Math.floor(Math.random() * DELIVERY_PERSONS.length)];
    const payload = { id: 'MSD' + Date.now().toString().slice(-6), ...form, items: cart, subtotal, delivery, total: subtotal + delivery, status: 'placed', deliveryPersonId: dp.id, estimatedMins: Math.floor(Math.random() * 15) + 20 };
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) return notify(json.message || 'Order failed', 'error');
    setCart([]); setOpen(false); setOrderSuccess(json.data); notify(`Order ${json.data.id} placed`, 'success');
  }
  return <>{open && <div className="cart-overlay open" onClick={() => setOpen(false)}></div>}<div className={`cart-sidebar ${open ? 'open' : ''}`}><div className="cart-header"><h3>🛒 Your Cart</h3><button className="btn-close-cart" onClick={() => setOpen(false)}>✕</button></div><div className="cart-items">{cart.length ? cart.map(item => <div className="cart-item" key={item.id}><div className="cart-item-emoji">{item.emoji}</div><div className="cart-item-info"><div className="cart-item-name">{item.name}</div><div className="cart-item-price">{money(item.price)} × {item.qty}</div></div></div>) : <div className="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>}</div><div className="cart-footer"><div className="cart-subtotal"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="cart-subtotal"><span>Delivery</span><span>{money(delivery)}</span></div><div className="cart-total"><span>Total</span><span>{money(subtotal + delivery)}</span></div><div className="form-group"><input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="form-group"><input placeholder="10-digit phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div><div className="form-group"><textarea placeholder="Delivery address" value={form.addr} onChange={e => setForm({ ...form, addr: e.target.value })}></textarea></div><button className="btn-checkout" onClick={placeOrder}>✅ Place Order</button></div></div></>;
}

function OrderSuccess({ order, close, track }) { return <div className="modal-overlay open"><div className="modal-box"><button className="modal-close" onClick={close}>✕</button><div className="order-success"><div className="success-icon">✅</div><h3>Order Placed!</h3><p>Your order has been saved in MongoDB.</p><div className="order-id-display">{order.id}</div><div className="estimated-time">⏱️ Estimated delivery: <strong>{order.estimatedMins}</strong> minutes</div><div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}><button className="btn-primary" onClick={track}>📍 Track Order</button><button className="btn-secondary" onClick={close}>Close</button></div></div></div></div>; }

function Tracking({ notify }) {
  const [term, setTerm] = useState(''); const [order, setOrder] = useState(null);
  async function search() { if (!term) return notify('Enter order id or phone', 'warning'); const res = await fetch(`/api/orders/track/${encodeURIComponent(term)}`); const json = await res.json(); if (!res.ok) return notify(json.message || 'Order not found', 'error'); setOrder(json.data); notify(`Tracking ${json.data.id}`, 'info'); }
  return <section className="section active"><div className="container"><div className="section-header"><div className="section-tag">📍 Live Tracking</div><h2 className="section-title">Track Your <span>Order</span></h2><p className="section-desc">Enter your Order ID or phone number.</p></div><div className="tracking-search"><input value={term} onChange={e => setTerm(e.target.value.toUpperCase())} placeholder="Enter Order ID or phone" /><button onClick={search}>🔍 Track</button></div>{order && <div className="tracking-info-card"><div className="tracking-info-header"><div className="delivery-avatar">🚴</div><div className="delivery-info"><h4>{order.id}</h4><p>{order.name} • {order.phone}</p></div><div className="delivery-rating">{money(order.total)}</div></div><div className="order-status-timeline">{statuses.map((s, i) => <div key={s} className={`status-step ${i < statuses.indexOf(order.status) ? 'done' : ''} ${s === order.status ? 'active' : ''}`}><div className="status-dot">{i < statuses.indexOf(order.status) ? '✓' : '📦'}</div><div className="status-text"><h5>{statusLabels[s]}</h5><p>{s === order.status ? 'Current status' : 'Order progress'}</p></div></div>)}</div></div>}</div></section>;
}

function Queries({ notify }) {
  const [queryType, setQueryType] = useState('query');
  const [form, setForm] = useState({ name: '', phone: '', msg: '' });
  const [openFaq, setOpenFaq] = useState(null);
  const mapRef = useRef(null);
  const faqs = [
    ['What are your delivery hours?', 'We deliver from 7 AM to 10 PM. Meals section is available after 6 PM.'],
    ['How do I track my order?', 'Go to the Tracking page and enter your Order ID or phone number.'],
    ['Do you do customized cakes?', 'Yes! Contact us and we will call you to confirm the design.'],
    ['What is the delivery charge?', 'Flat ₹30 delivery charge for all orders.'],
    ['What payment methods do you accept?', 'Cash on Delivery and UPI payment.']
  ];

  useEffect(() => {
    if (!window.L || mapRef.current) return;
    mapRef.current = window.L.map('contact-map', { zoomControl: false, attributionControl: false }).setView([10.9601, 78.0766], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
    const icon = window.L.divIcon({ html: '<div style="background:linear-gradient(135deg,#FF6B2B,#8B1A4A);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;border:3px solid #fff;box-shadow:0 4px 20px rgba(255,107,43,0.5)">🍞</div>', iconSize: [44, 44], iconAnchor: [22, 22], className: '' });
    window.L.marker([10.9601, 78.0766], { icon }).addTo(mapRef.current).bindPopup('<b>MSD BACKS AND SWEETS</b><br>Mylampatty, Karur').openPopup();
  }, []);

  function submitQuery() {
    if (!form.name || !form.phone || !form.msg) return notify('Please fill all fields', 'warning');
    const queries = JSON.parse(localStorage.getItem('msd_queries') || '[]');
    queries.push({ ...form, type: queryType, time: new Date().toISOString() });
    localStorage.setItem('msd_queries', JSON.stringify(queries));
    setForm({ name: '', phone: '', msg: '' });
    notify(`Your ${queryType} has been submitted`, 'success');
  }

  return <section id="queries-section" className="section active"><div className="container"><div className="section-header"><div className="section-tag">💬 Help & Support</div><h2 className="section-title">Queries & <span>Complaints</span></h2><p className="section-desc">Have a question or concern? We're here to help! Reach out anytime.</p></div>
    <div className="queries-grid"><div className="contact-form-card"><h3>📝 Send Us a Message</h3><div className="query-type-btns">{[['query', '❓ Query'], ['complaint', '⚠️ Complaint'], ['feedback', '💡 Feedback']].map(([type, label]) => <button key={type} className={`query-type-btn ${queryType === type ? 'active' : ''}`} onClick={() => setQueryType(type)}>{label}</button>)}</div><div className="form-group"><label>Your Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" /></div><div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" /></div><div className="form-group"><label>Your Message</label><textarea value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} placeholder="Describe your query or complaint..."></textarea></div><button className="btn-submit" onClick={submitQuery}>📤 Submit Message</button><div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Or reach us directly:</p><div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}><a href="tel:+919876543210" className="quick-contact call">📞 Call</a><a href="https://wa.me/919876543210?text=Hi MSD BACKS!" target="_blank" className="quick-contact whatsapp">💬 WhatsApp</a></div></div></div>
    <div className="faq-card"><h3>❓ Frequently Asked Questions</h3><div id="faq-list">{faqs.map(([q, a], i) => <div key={q} className={`faq-item ${openFaq === i ? 'open' : ''}`}><button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q}<span className="faq-icon">+</span></button><div className="faq-answer">{a}</div></div>)}</div></div></div>
    <div className="shop-info-card" style={{ marginTop: '2rem' }}><div><h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>🏪 Shop Information</h3><div style={{ display: 'grid', gap: '0.75rem' }}><ShopDetail icon="📍" label="Address" text="Palayam to Trichy Main Road, Mylampatty, Karur (dt), Kadavur (tk) - 621301" /><ShopDetail icon="📞" label="Phone" text="+91 98765 43210" /><ShopDetail icon="⏰" label="Opening Hours" text="6:00 AM – 11:00 PM (Daily)" /><ShopDetail icon="🚴" label="Delivery Area" text="Within 10 km radius • ₹30 delivery fee" /></div></div><div><div id="contact-map"></div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>📍 Mylampatty, Karur</p></div></div>
  </div></section>;
}

function ShopDetail({ icon, label, text }) {
  return <div className="shop-detail"><div className="shop-detail-icon">{icon}</div><div className="shop-detail-text"><label>{label}</label><p>{text}</p></div></div>;
}

function Admin({ notify }) {
  const [token, setToken] = useState(() => localStorage.getItem('msd_admin_token') || '');
  const [login, setLogin] = useState({ username: 'admin', password: '' });
  const [orders, setOrders] = useState([]);
  async function doLogin() { const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) }); const json = await res.json(); if (!res.ok) return notify(json.message || 'Login failed', 'error'); localStorage.setItem('msd_admin_token', json.token); setToken(json.token); notify('Welcome, Admin', 'success'); }
  async function loadOrders(authToken = token) { const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${authToken}` } }); const json = await res.json(); if (res.ok) setOrders(json.data); else notify(json.message || 'Could not load orders', 'error'); }
  async function updateStatus(id, status) { const res = await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); const json = await res.json(); if (!res.ok) return notify(json.message || 'Update failed', 'error'); setOrders(prev => prev.map(o => o.id === id ? json.data : o)); notify(`Order ${id} updated`, 'success'); }
  useEffect(() => { if (token) loadOrders(token); }, [token]);
  if (!token) return <section className="section active"><div className="container"><div className="admin-login"><h3>👑 Admin Login</h3><div className="form-group"><input value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} placeholder="Username" /></div><div className="form-group"><input type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} placeholder="Password" /></div><button className="btn-submit" onClick={doLogin}>Login</button></div></div></section>;
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  return <section className="section active"><div className="container"><div className="section-header"><div className="section-tag">⚙️ Admin</div><h2 className="section-title">Admin <span>Dashboard</span></h2></div><div className="stats-grid"><HeroStat n={orders.length} l="Total Orders" /><HeroStat n={money(revenue)} l="Revenue" /><HeroStat n={orders.filter(o => o.status !== 'delivered').length} l="Pending" /></div><div className="table-wrapper"><table className="data-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><strong>{o.id}</strong></td><td>{o.name}</td><td>{o.phone}</td><td>{money(o.total)}</td><td><span className="badge badge-info">{statusLabels[o.status]}</span></td><td><select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>{statuses.map(s => <option value={s} key={s}>{statusLabels[s]}</option>)}</select></td></tr>)}</tbody></table></div></div></section>;
}

function Footer({ showPage, setActiveCategory }) { return <footer><div className="container"><div className="footer-grid"><div className="footer-col"><div className="nav-logo"><div className="nav-logo-icon">🍞</div><span className="nav-logo-text">MSD BACKS & SWEETS</span></div><p>Freshly baked with love every single day.</p></div><div className="footer-col"><h4>Menu</h4><ul>{Object.values(PRODUCTS).slice(0, 6).map(c => <li key={c.id}><button onClick={() => { setActiveCategory(c.id); showPage('products'); }}>{c.icon} {c.name}</button></li>)}</ul></div><div className="footer-col"><h4>Contact</h4><ul><li>📞 +91 98765 43210</li><li>📍 Mylampatty, Karur - 621301</li><li>⏰ 6 AM - 11 PM</li></ul></div></div><div className="footer-bottom"><p>© 2024 MSD BACKS AND SWEETS.</p></div></div></footer>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
