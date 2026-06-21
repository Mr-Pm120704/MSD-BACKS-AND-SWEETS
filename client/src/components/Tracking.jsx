import React, { useState, useEffect, useRef } from 'react';
import { SHOP_INFO } from '../productData';
import { statuses, statusLabels } from './Navbar';

function money(v) { return '\u20B9' + Number(v || 0); }

export default function Tracking({ notify }) {
  const [term, setTerm] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const dpMarkerRef = useRef(null);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const intervalRef = useRef(null);

  async function search() {
    if (!term) return notify('Enter order id or phone', 'warning');
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(term)}`);
      const json = await res.json();
      setLoading(false);
      if (!res.ok) return notify(json.message || 'Order not found', 'error');
      setOrder(json.data);
      if (json.data.deliveryPersonId) {
        setDeliveryPerson(typeof json.data.deliveryPersonId === 'object' ? json.data.deliveryPersonId : null);
      }
      notify(`Tracking ${json.data.id}`, 'info');
    } catch (e) {
      setLoading(false);
      notify('Network error', 'error');
    }
  }

  useEffect(() => {
    if (!order || !window.L) return;
    if (!mapInstance.current) {
      const map = window.L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([SHOP_INFO.lat, SHOP_INFO.lng], 14);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      mapInstance.current = map;
    }

    const shopIcon = window.L.divIcon({
      html: `<div class="map-marker shop-marker"><i class="fa-solid fa-store"></i></div>`,
      iconSize: [40, 40], iconAnchor: [20, 20], className: ''
    });

    if (!markerRef.current) {
      markerRef.current = window.L.marker([SHOP_INFO.lat, SHOP_INFO.lng], { icon: shopIcon }).addTo(mapInstance.current)
        .bindPopup(`<b>MSD BACKS AND SWEETS</b><br>Mylampatty, Karur`);
    }

    if (deliveryPerson && deliveryPerson.lat && deliveryPerson.lng) {
      const dpIcon = window.L.divIcon({
        html: `<div class="map-marker dp-marker"><i class="fa-solid fa-motorcycle"></i></div>`,
        iconSize: [40, 40], iconAnchor: [20, 20], className: ''
      });
      if (dpMarkerRef.current) {
        dpMarkerRef.current.setLatLng([deliveryPerson.lat, deliveryPerson.lng]);
      } else {
        dpMarkerRef.current = window.L.marker([deliveryPerson.lat, deliveryPerson.lng], { icon: dpIcon }).addTo(mapInstance.current)
          .bindPopup(`<b>${deliveryPerson.name}</b><br>${deliveryPerson.vehicle}`);
      }
      mapInstance.current.fitBounds([
        [SHOP_INFO.lat, SHOP_INFO.lng],
        [deliveryPerson.lat, deliveryPerson.lng]
      ], { padding: [50, 50] });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order, deliveryPerson]);

  // Simulate delivery movement for demo
  useEffect(() => {
    if (!order || order.status === 'delivered') return;
    const dp = deliveryPerson || { lat: 10.9601, lng: 78.0766 };
    let lat = dp.lat, lng = dp.lng;
    intervalRef.current = setInterval(() => {
      lat += (Math.random() - 0.4) * 0.001;
      lng += (Math.random() - 0.4) * 0.001;
      setDeliveryPerson(prev => prev ? { ...prev, lat, lng } : prev);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [order]);

  return (
    <section className="tracking-page">
      <div className="container">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-location-dot"></i> Live Tracking</div>
          <h2 className="section-title">Track Your <span className="gradient-text">Order</span></h2>
          <p className="section-desc">Enter your Order ID or phone number to track your delivery in real-time.</p>
        </div>

        <div className="tracking-search">
          <div className="tracking-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Enter Order ID (MSD123456) or phone number" onKeyDown={e => e.key === 'Enter' && search()} />
          </div>
          <button className="btn-primary btn-glow" onClick={search} disabled={loading}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-search"></i> Track</>}
          </button>
        </div>

        {order && (
          <div className="tracking-result">
            <div className="tracking-map-section">
              <div ref={mapRef} className="tracking-map"></div>
            </div>

            <div className="tracking-details-section">
              <div className="tracking-info-card glass">
                <div className="tracking-info-header">
                  <div className="order-id-badge">{order.id}</div>
                  <div className="order-amount">{money(order.total)}</div>
                </div>

                {deliveryPerson && (
                  <div className="delivery-person-card glass">
                    <div className="dp-avatar">{deliveryPerson.photo || '🚴'}</div>
                    <div className="dp-info">
                      <h4>{deliveryPerson.name || order.deliveryPersonName}</h4>
                      <p><i className="fa-solid fa-phone"></i> {deliveryPerson.phone || order.deliveryPersonPhone}</p>
                      {deliveryPerson.vehicle && <p><i className="fa-solid fa-motorcycle"></i> {deliveryPerson.vehicle} ({deliveryPerson.vehicleNo})</p>}
                      {deliveryPerson.rating && <p><i className="fa-solid fa-star"></i> {deliveryPerson.rating} rating</p>}
                    </div>
                    <div className="dp-actions">
                      <a href={`tel:${deliveryPerson.phone || order.deliveryPersonPhone}`} className="btn-call-dp">
                        <i className="fa-solid fa-phone"></i> Call
                      </a>
                      <a href={`https://wa.me/91${deliveryPerson.phone || order.deliveryPersonPhone}`} target="_blank" className="btn-whatsapp-dp" rel="noreferrer">
                        <i className="fa-brands fa-whatsapp"></i> WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                <div className="order-status-timeline">
                  {statuses.map((s, i) => (
                    <div key={s} className={`status-step ${i < statuses.indexOf(order.status) ? 'done' : ''} ${s === order.status ? 'active' : ''}`}>
                      <div className="status-dot">
                        {i < statuses.indexOf(order.status) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-circle"></i>}
                      </div>
                      <div className="status-text">
                        <h5>{statusLabels[s]}</h5>
                        <p>{s === order.status ? 'Current status' : i < statuses.indexOf(order.status) ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-items-summary">
                  <h4>Order Items</h4>
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span>{item.emoji} {item.name}</span>
                      <span>{item.qty} x {money(item.price)}</span>
                    </div>
                  ))}
                  <div className="order-item-row total">
                    <span>Total</span>
                    <span>{money(order.total)}</span>
                  </div>
                </div>

                <div className="estimated-time">
                  <i className="fa-solid fa-clock"></i> Estimated delivery: <strong>{order.estimatedMins || 30}</strong> minutes
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
