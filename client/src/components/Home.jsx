import React, { useRef, useEffect } from 'react';
import { PRODUCTS } from '../productData';

function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color(0xFF6B2B),
      new THREE.Color(0xFFD700),
      new THREE.Color(0x8B1A4A),
      new THREE.Color(0xFF4081),
      new THREE.Color(0x00E5FF),
      new THREE.Color(0x7C4DFF)
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true
    }));
    scene.add(particles);

    function makeShape(type, color, x, y, z, size) {
      let geo;
      if (type === 'torus') geo = new THREE.TorusGeometry(size, size * 0.3, 8, 16);
      else if (type === 'oct') geo = new THREE.OctahedronGeometry(size);
      else if (type === 'ico') geo = new THREE.IcosahedronGeometry(size);
      else geo = new THREE.DodecahedronGeometry(size);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.15 }));
      mesh.position.set(x, y, z);
      mesh.userData = { rotX: Math.random() * 0.01, rotY: Math.random() * 0.01, initY: y, floatSpeed: Math.random() * 0.02 + 0.005 };
      scene.add(mesh);
      return mesh;
    }

    const shapes = [
      makeShape('torus', 0xFF6B2B, 3, 1.5, -2, 0.8),
      makeShape('oct', 0xFFD700, -3, -1, -1, 0.5),
      makeShape('ico', 0x8B1A4A, 4, -2, -3, 0.6),
      makeShape('torus', 0xFF4081, -4, 2, -2, 0.5),
      makeShape('dodec', 0x00E5FF, 0, -3, -4, 0.7),
      makeShape('oct', 0x7C4DFF, 2, 3, -3, 0.4),
      makeShape('ico', 0xFF6B2B, -2, -2.5, -2, 0.3),
    ];

    let mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2.5;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2.5;
    };

    let frame;
    let t = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      t += 0.01;
      particles.rotation.y += 0.0015;
      particles.rotation.x += 0.0007;
      shapes.forEach(s => {
        s.rotation.x += s.userData.rotX;
        s.rotation.y += s.userData.rotY;
        s.position.y = s.userData.initY + Math.sin(t * s.userData.floatSpeed * 100) * 0.4;
      });
      camera.position.x += (mouse.x - camera.position.x) * 0.05;
      camera.position.y += (mouse.y - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas"></canvas>;
}

export default function Home({ showPage, setActiveCategory }) {
  const popular = [];
  Object.values(PRODUCTS).forEach(cat => {
    const groups = cat.subCategories ? Object.values(cat.subCategories).flatMap(s => s.items) : cat.items;
    groups.filter(item => item.popular).forEach(item => popular.length < 8 && popular.push({ ...item, catId: cat.id }));
  });

  return (
    <section className="home-page">
      <div className="hero">
        <HeroCanvas />
        <div className="hero-overlay"></div>
        <div className="floating-emojis">
          {['🎂','🍩','☕','🍫','🥐','🧁','🍰','🥛','🍪','🍬'].map((e, i) => (
            <span key={i} className="float-item" style={{
              top: `${10 + Math.random() * 75}%`,
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: `${1.2 + Math.random() * 1.5}rem`,
              opacity: 0.5 + Math.random() * 0.3
            }}>{e}</span>
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge"><i className="fa-solid fa-star"></i> Karur's Favourite Bakery Since 2018</div>
          <h1 className="hero-title">MSD BACKS<br /><span className="gradient-text">AND SWEETS</span></h1>
          <p className="hero-subtitle">Freshly baked <span>cakes</span>, traditional <span>sweets</span>,<br />hot <span>meals</span>, chilled <span>drinks</span> & more delivered to your door!</p>
          <div className="hero-cta">
            <button className="btn-primary btn-glow" onClick={() => showPage('products')}>
              <i className="fa-solid fa-utensils"></i> Explore Menu
            </button>
            <button className="btn-secondary" onClick={() => showPage('tracking')}>
              <i className="fa-solid fa-location-dot"></i> Track Order
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-num">500+</div><div className="hero-stat-label">Happy Customers</div></div>
            <div className="hero-stat"><div className="hero-stat-num">50+</div><div className="hero-stat-label">Menu Items</div></div>
            <div className="hero-stat"><div className="hero-stat-num">6 AM</div><div className="hero-stat-label">Opens Daily</div></div>
            <div className="hero-stat"><div className="hero-stat-num">10 KM</div><div className="hero-stat-label">Delivery Radius</div></div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-fire"></i> Popular Picks</div>
          <h2 className="section-title">Our <span className="gradient-text">Best Sellers</span></h2>
          <p className="section-desc">The most loved items from our menu.</p>
        </div>
        <div className="products-grid">
          {popular.map(item => (
            <button key={item.id} className="product-card" onClick={() => { setActiveCategory(item.catId); showPage('products'); }}>
              <div className="product-emoji-wrap"><span className="product-emoji">{item.emoji}</span></div>
              <div className="product-name">{item.name}</div>
              <div className="product-desc">{item.desc}</div>
              <div className="product-price">{'\u20B9'}{item.price}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="container categories-preview">
        <div className="section-header">
          <div className="section-tag"><i className="fa-solid fa-grid"></i> Categories</div>
          <h2 className="section-title">Browse Our <span className="gradient-text">Menu</span></h2>
        </div>
        <div className="cat-cards-grid">
          {Object.values(PRODUCTS).map(cat => (
            <button key={cat.id} className="cat-preview-card" onClick={() => { setActiveCategory(cat.id); showPage('products'); }} style={{ '--accent': cat.color }}>
              <div className="cat-preview-icon">{cat.icon}</div>
              <div className="cat-preview-name">{cat.name}</div>
              <div className="cat-preview-count">{cat.items?.length || Object.values(cat.subCategories || {}).reduce((s, sc) => s + sc.items.length, 0)} items</div>
              <i className="fa-solid fa-arrow-right cat-preview-arrow"></i>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
