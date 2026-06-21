import React from 'react';
import { PRODUCTS, SHOP_INFO } from '../productData';

export default function Footer({ showPage, setActiveCategory }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <div className="nav-logo-icon"><i className="fa-solid fa-bread-slice"></i></div>
              <div className="nav-logo-text">
                <span className="logo-main">MSD BACKS</span>
                <span className="logo-sub">& SWEETS</span>
              </div>
            </div>
            <p>Freshly baked with love every single day. {SHOP_INFO.tagline}</p>
            <div className="footer-social">
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href={`https://wa.me/${SHOP_INFO.whatsapp}`} target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Menu</h4>
            <ul>
              {Object.values(PRODUCTS).slice(0, 7).map(c => (
                <li key={c.id}>
                  <button onClick={() => { setActiveCategory(c.id); showPage('products'); }}>
                    {c.icon} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><i className="fa-solid fa-phone"></i> {SHOP_INFO.phone}</li>
              <li><i className="fa-solid fa-location-dot"></i> Mylampatty, Karur - 621301</li>
              <li><i className="fa-solid fa-clock"></i> 6 AM - 11 PM (Daily)</li>
              <li><i className="fa-solid fa-envelope"></i> {SHOP_INFO.email}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MSD BACKS AND SWEETS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
