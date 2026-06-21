import React, { useState, useEffect, useRef } from 'react';
import { SHOP_INFO } from '../productData';

export default function Queries({ notify }) {
  const [queryType, setQueryType] = useState('query');
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const faqs = [
    ['What are your delivery hours?', 'We deliver from 7 AM to 10 PM daily. Meals section is available after 6 PM.'],
    ['How do I track my order?', 'Go to the Track Order page and enter your Order ID or phone number.'],
    ['Do you do customized cakes?', 'Yes! We specialize in customized cakes. Contact us or place an order and we will call you to confirm the design.'],
    ['What is the delivery charge?', 'Flat \u20B930 delivery charge for all orders within 10 km radius.'],
    ['What payment methods do you accept?', 'Cash on Delivery (COD) and UPI payment.'],
    ['Where is your shop located?', 'Palayam to Trichy Main Road, Mylampatty, Karur (DT), Kadavur (TK) - 621301.'],
  ];

  useEffect(() => {
    if (!window.L || mapInstance.current) return;
    const map = window.L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([SHOP_INFO.lat, SHOP_INFO.lng], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    const icon = window.L.divIcon({
      html: `<div class="map-marker shop-marker"><i class="fa-solid fa-store"></i></div>`,
      iconSize: [40, 40], iconAnchor: [20, 20], className: ''
    });
    window.L.marker([SHOP_INFO.lat, SHOP_INFO.lng], { icon }).addTo(map).bindPopup(`<b>MSD BACKS AND SWEETS</b><br>Mylampatty, Karur`).openPopup();
    mapInstance.current = map;
  }, []);

  async function submitQuery() {
    if (!form.name || !form.phone || !form.message) return notify('Please fill all fields', 'warning');
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: queryType })
      });
      const json = await res.json();
      if (!res.ok) return notify(json.message || 'Submit failed', 'error');
      setForm({ name: '', phone: '', message: '' });
      notify(`Your ${queryType} has been submitted successfully!`, 'success');
    } catch (e) {
      notify('Network error', 'error');
    }
  }

  return (
    <section className="queries-page">
      <div className="container">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-comments"></i> Help & Support</div>
          <h2 className="section-title">Queries & <span className="gradient-text">Complaints</span></h2>
          <p className="section-desc">Have a question or concern? We're here to help! Reach out anytime.</p>
        </div>

        <div className="queries-grid">
          <div className="contact-form-card glass">
            <h3><i className="fa-solid fa-paper-plane"></i> Send Us a Message</h3>
            <div className="query-type-btns">
              {[['query', 'Question', 'fa-circle-question'], ['complaint', 'Complaint', 'fa-triangle-exclamation'], ['feedback', 'Feedback', 'fa-lightbulb']].map(([type, label, icon]) => (
                <button key={type} className={`query-type-btn ${queryType === type ? 'active' : ''}`} onClick={() => setQueryType(type)}>
                  <i className={`fa-solid ${icon}`}></i> {label}
                </button>
              ))}
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-user"></i> Your Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-phone"></i> Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-message"></i> Your Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your query or complaint..." rows={4}></textarea>
            </div>
            <button className="btn-primary btn-glow" onClick={submitQuery}>
              <i className="fa-solid fa-paper-plane"></i> Submit Message
            </button>
            <div className="quick-contacts">
              <p>Or reach us directly:</p>
              <div className="quick-contact-btns">
                <a href="tel:+919876543210" className="quick-contact call"><i className="fa-solid fa-phone"></i> Call Us</a>
                <a href={`https://wa.me/${SHOP_INFO.whatsapp}?text=Hi MSD BACKS!`} target="_blank" className="quick-contact whatsapp" rel="noreferrer"><i className="fa-brands fa-whatsapp"></i> WhatsApp</a>
              </div>
            </div>
          </div>

          <div className="faq-card glass">
            <h3><i className="fa-solid fa-circle-question"></i> Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map(([q, a], i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{q}</span>
                    <i className={`fa-solid fa-chevron-${openFaq === i ? 'up' : 'down'}`}></i>
                  </button>
                  <div className="faq-answer"><p>{a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shop-info-card glass">
          <div className="shop-info-text">
            <h3><i className="fa-solid fa-store"></i> Shop Information</h3>
            <div className="shop-details">
              <div className="shop-detail"><i className="fa-solid fa-location-dot"></i><div><label>Address</label><p>{SHOP_INFO.address}</p></div></div>
              <div className="shop-detail"><i className="fa-solid fa-phone"></i><div><label>Phone</label><p>{SHOP_INFO.phone}</p></div></div>
              <div className="shop-detail"><i className="fa-solid fa-clock"></i><div><label>Opening Hours</label><p>{SHOP_INFO.openHours} (Daily)</p></div></div>
              <div className="shop-detail"><i className="fa-solid fa-motorcycle"></i><div><label>Delivery Area</label><p>Within {SHOP_INFO.deliveryRadius} radius &bull; {'\u20B9'}30 delivery fee</p></div></div>
            </div>
          </div>
          <div className="shop-info-map">
            <div ref={mapRef} className="contact-map"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
