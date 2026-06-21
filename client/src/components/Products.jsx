import React, { useState } from 'react';
import { PRODUCTS } from '../productData';

function money(v) { return '\u20B9' + Number(v || 0); }

export default function Products({ activeCategory, setActiveCategory, cart, setCart, notify, onBuyNow }) {
  const cat = PRODUCTS[activeCategory];
  const items = cat.subCategories ? Object.values(cat.subCategories) : [{ name: '', items: cat.items }];
  const mealsAvailable = new Date().getHours() >= 18;
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <section className="products-page">
      <div className="container">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-utensils"></i> Our Menu</div>
          <h2 className="section-title">Fresh <span className="gradient-text">Every Day</span></h2>
          <p className="section-desc">From hot teas to custom cakes, we have it all.</p>
        </div>

        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search items..." />
        </div>

        <div className="category-tabs">
          {Object.values(PRODUCTS).map(c => {
            const locked = c.timeRestricted && !mealsAvailable;
            return (
              <button key={c.id} disabled={locked} className={`cat-tab ${activeCategory === c.id ? 'active' : ''}`} onClick={() => !locked && setActiveCategory(c.id)} style={{ '--tab-color': c.color }}>
                <span className="cat-tab-icon">{c.icon}</span>
                <span className="cat-tab-name">{c.name}</span>
                {locked && <span className="lock-badge"><i className="fa-solid fa-lock"></i> After 6PM</span>}
              </button>
            );
          })}
        </div>

        {mealsAvailable && cat.timeRestricted && (
          <div className="time-notice success"><i className="fa-solid fa-clock"></i> Meals are now available! Order hot food now.</div>
        )}

        {items.map(group => (
          <React.Fragment key={group.name || cat.id}>
            {group.name && <div className="subcategory-label"><i className="fa-solid fa-tag"></i> {group.name}</div>}
            <div className="products-grid">
              {group.items
                .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => {
                  const inCart = cart.find(x => x.id === item.id);
                  return (
                    <div className="product-card" key={item.id}>
                      {item.popular && <div className="product-popular"><i className="fa-solid fa-fire"></i> Popular</div>}
                      {item.customizable && <div className="product-customizable"><i className="fa-solid fa-paintbrush"></i> Customizable</div>}
                      <div className="product-emoji-wrap"><span className="product-emoji">{item.emoji}</span></div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-desc">{item.desc}</div>
                      {item.unit && <div className="product-unit"><i className="fa-solid fa-box"></i> {item.unit}</div>}
                      <div className="product-footer">
                        <div className="product-price">{money(item.price)}<span className="price-each"> each</span></div>
                        {inCart ? (
                          <div className="btn-qty">
                            <button onClick={() => update(item, -1)}><i className="fa-solid fa-minus"></i></button>
                            <span>{inCart.qty}</span>
                            <button onClick={() => update(item, 1)}><i className="fa-solid fa-plus"></i></button>
                          </div>
                        ) : (
                          <div className="product-actions">
                            <button className="btn-add-cart" onClick={() => add(item)}>
                              <i className="fa-solid fa-cart-plus"></i> Add
                            </button>
                            <button className="btn-buy-now" onClick={() => buyNow(item)}>
                              <i className="fa-solid fa-bolt"></i> Buy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
