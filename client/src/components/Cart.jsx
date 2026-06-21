import React, { useState } from 'react';
import { PRODUCTS, SHOP_INFO } from '../productData';

function money(v) { return '\u20B9' + Number(v || 0); }

export default function Cart({ cart, setCart, open, setOpen, setOrderSuccess, notify }) {
  const [form, setForm] = useState({ name: '', phone: '', addr: '', payment: 'cod' });
  const [placing, setPlacing] = useState(false);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal > 0 ? 30 : 0;

  function updateQty(id, delta) {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }

  async function placeOrder() {
    if (!cart.length) return notify('Cart is empty', 'warning');
    if (!form.name || !/^\d{10}$/.test(form.phone) || !form.addr) return notify('Enter valid name, 10-digit phone and address', 'warning');
    setPlacing(true);
    try {
      const payload = {
        id: 'MSD' + Date.now().toString().slice(-6),
        ...form,
        items: cart,
        subtotal, delivery,
        total: subtotal + delivery,
        status: 'placed',
        estimatedMins: Math.floor(Math.random() * 15) + 20
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      setPlacing(false);
      if (!res.ok) return notify(json.message || 'Order failed', 'error');
      setCart([]); setOpen(false); setOrderSuccess(json.data);
      notify(`Order ${json.data.id} placed successfully!`, 'success');
    } catch (e) {
      setPlacing(false);
      notify('Network error', 'error');
    }
  }

  return (
    <>
      {open && <div className="cart-overlay" onClick={() => setOpen(false)}></div>}
      <div className={`cart-sidebar ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <h3><i className="fa-solid fa-bag-shopping"></i> Your Cart</h3>
          <button className="btn-close-cart" onClick={() => setOpen(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="cart-items">
          {cart.length ? cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-emoji">{item.emoji}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{money(item.price)}</div>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => updateQty(item.id, -1)}><i className="fa-solid fa-minus"></i></button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}><i className="fa-solid fa-plus"></i></button>
              </div>
            </div>
          )) : (
            <div className="cart-empty"><i className="fa-solid fa-bag-shopping"></i><p>Your cart is empty</p></div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="cart-subtotal"><span>Delivery</span><span>{money(delivery)}</span></div>
            <div className="cart-total"><span>Total</span><span>{money(subtotal + delivery)}</span></div>
            <div className="form-group"><input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><input placeholder="10-digit phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><textarea placeholder="Delivery address" value={form.addr} onChange={e => setForm({ ...form, addr: e.target.value })} rows={2}></textarea></div>
            <div className="payment-options">
              <button className={`pay-btn ${form.payment === 'cod' ? 'active' : ''}`} onClick={() => setForm({ ...form, payment: 'cod' })}><i className="fa-solid fa-money-bill"></i> COD</button>
              <button className={`pay-btn ${form.payment === 'upi' ? 'active' : ''}`} onClick={() => setForm({ ...form, payment: 'upi' })}><i className="fa-solid fa-mobile-screen"></i> UPI</button>
            </div>
            <button className="btn-checkout" onClick={placeOrder} disabled={placing}>
              {placing ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-check"></i> Place Order</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function OrderSuccess({ order, close, track }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-box glass">
        <button className="modal-close" onClick={close}><i className="fa-solid fa-xmark"></i></button>
        <div className="order-success">
          <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
          <h3>Order Placed!</h3>
          <p>Your order has been confirmed and saved.</p>
          <div className="order-id-display">{order.id}</div>
          <div className="estimated-time"><i className="fa-solid fa-clock"></i> Estimated delivery: <strong>{order.estimatedMins}</strong> minutes</div>
          <div className="success-actions">
            <button className="btn-primary btn-glow" onClick={track}><i className="fa-solid fa-location-dot"></i> Track Order</button>
            <button className="btn-secondary" onClick={close}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
