import React, { useState, useEffect } from 'react';

const statuses = ['placed', 'preparing', 'picked', 'on_way', 'delivered'];
const statusLabels = { placed: 'Placed', preparing: 'Preparing', picked: 'Picked Up', on_way: 'On the Way', delivered: 'Delivered' };

export default function Navbar({ page, showPage, cartCount, onCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['home', 'Home', 'fa-house'],
    ['products', 'Menu', 'fa-utensils'],
    ['tracking', 'Track Order', 'fa-location-dot'],
    ['queries', 'Queries', 'fa-comments'],
    ['admin', 'Admin', 'fa-gear'],
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => showPage('home')}>
          <div className="nav-logo-icon"><i className="fa-solid fa-bread-slice"></i></div>
          <div className="nav-logo-text">
            <span className="logo-main">MSD BACKS</span>
            <span className="logo-sub">& SWEETS</span>
          </div>
        </div>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(([id, label, icon]) => (
            <li key={id}>
              <button
                className={`nav-link ${page === id ? 'active' : ''}`}
                onClick={() => { showPage(id); setMenuOpen(false); }}
              >
                <i className={`fa-solid ${icon}`}></i>
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="btn-cart" onClick={onCart}>
            <i className="fa-solid fa-bag-shopping"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export { statuses, statusLabels };
