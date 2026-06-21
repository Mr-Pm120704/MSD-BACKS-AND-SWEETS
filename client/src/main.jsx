import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Products from './components/Products';
import Tracking from './components/Tracking';
import Queries from './components/Queries';
import Admin from './components/Admin';
import Cart, { OrderSuccess } from './components/Cart';
import Footer from './components/Footer';

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
    setTimeout(() => setToast(null), 3500);
  }

  function showPage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Navbar page={page} showPage={showPage} cartCount={cartCount} onCart={() => setCheckoutOpen(true)} />
      <main>
        {page === 'home' && <Home showPage={showPage} setActiveCategory={setActiveCategory} />}
        {page === 'products' && <Products activeCategory={activeCategory} setActiveCategory={setActiveCategory} cart={cart} setCart={setCart} notify={notify} onBuyNow={() => setCheckoutOpen(true)} />}
        {page === 'tracking' && <Tracking notify={notify} />}
        {page === 'queries' && <Queries notify={notify} />}
        {page === 'admin' && <Admin notify={notify} />}
      </main>
      <Footer showPage={showPage} setActiveCategory={setActiveCategory} />
      <Cart cart={cart} setCart={setCart} open={checkoutOpen} setOpen={setCheckoutOpen} setOrderSuccess={setOrderSuccess} notify={notify} />
      {orderSuccess && <OrderSuccess order={orderSuccess} close={() => setOrderSuccess(null)} track={() => { setOrderSuccess(null); showPage('tracking'); }} />}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : toast.type === 'error' ? 'fa-circle-xmark' : toast.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
