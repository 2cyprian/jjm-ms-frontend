
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { getProducts, getServices, checkout, scanProduct } from '../utils/api';
import { useToast } from '../utils/toast';
import '../css/components/staffDashboard.css';

const StaffDashboard = () => {
  const [dailySales, setDailySales] = useState(0);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemType, setItemType] = useState('products'); // 'products' or 'services'
  const scanInputRef = useRef(null);
  const toast = useToast();

  // Initialize daily sales
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('dailySalesData');
    if (storedData) {
      const { date, total } = JSON.parse(storedData);
      if (date === today) {
        setDailySales(total);
      } else {
        setDailySales(0);
        localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: 0 }));
      }
    } else {
      localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: 0 }));
      setDailySales(0);
    }
  }, []);

  // Load products and services - only once on component mount
  useEffect(() => {
    const loadData = async () => {
      // Load products
      try {
        const productsData = await getProducts();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      }
      
      // Load services
      try {
        const servicesData = await getServices();
        console.log('Loaded services in staff dashboard:', servicesData);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setServices([]);
      }
    };
    loadData();
  }, []); // Empty dependency - runs only once on mount

  // Helper to get price from product or service
  const getPrice = (item) => {
    if (item.price) return item.price; // products
    if (item.pricing_config?.base_price) return item.pricing_config.base_price; // services
    return 0;
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (getPrice(item) * item.qty), 0);
  };

  const currentItems = itemType === 'products' ? products : services;
  
  const filteredItems = currentItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    const cartKey = `${itemType === 'products' ? 'PRODUCT' : 'SERVICE'}_${item.id}`;
    const existing = cart.find(c => c.cartKey === cartKey);
    const price = getPrice(item);
    
    if (existing) {
      existing.qty += 1;
      existing.price = price;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...item, price, qty: 1, type: itemType === 'products' ? 'PRODUCT' : 'SERVICE', cartKey }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
    }
  };

  // const handleScan = async (e) => {
  //   e.preventDefault();
  //   if (!barcodeInput.trim()) return;

  //   try {
  //     const data = await scanProduct(barcodeInput);
  //     addToCart(data);
  //     setBarcodeInput('');
  //     if (scanInputRef.current) scanInputRef.current.focus();
  //   } catch (err) {
  //     toast.error('Product not found!');
  //     setBarcodeInput('');
  //   }
  // };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty!');
      return;
    }

    setLoading(true);
    try {
      // Build items array with both products and services
      const items = cart.map(i => ({
        type: i.type,  // 'PRODUCT' or 'SERVICE'
        id: String(i.id),
        quantity: i.qty,
        price: i.price,
        name: i.name,
        ...(i.type === 'PRODUCT' ? { product_id: String(i.id) } : { service_id: String(i.id) })
      }));

      const payload = {
        payment_method: 'CASH',
        items: items
      };

      console.log('🛒 Checkout with mixed items:', payload);
      const result = await checkout(payload);
      console.log('✅ Checkout Success:', result);
      
      toast.success('Order created successfully!');
      
      // Update daily sales
      const totalAmount = calculateTotal();
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('dailySalesData');
      let newTotal = totalAmount;
      if (storedData) {
        const { date, total } = JSON.parse(storedData);
        if (date === today) {
          newTotal = total + totalAmount;
        }
      }
      setDailySales(newTotal);
      localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: newTotal }));

      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      if (scanInputRef.current) scanInputRef.current.focus();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Checkout Failed';
      toast.error(msg);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from current items
  const getCategories = () => {
    const cats = new Set(currentItems.map(item => item.category || 'Other').filter(Boolean));
    return ['All', ...Array.from(cats)];
  };
  
  const categories = getCategories();

  return (
    <div className="pos-dashboard">
      <Sidebar />
      
      <main className="pos-main">
        {/* Header */}
        <header className="pos-header">
          <div className="pos-header-left">
            <h2 className="pos-header-title">New Order</h2>
            <div className="pos-header-status">
              <span className="pos-header-status-dot"></span>
              <span className="pos-header-status-text">Draft Auto-saved</span>
            </div>
          </div>
          <div className="pos-header-search">
            <span className="pos-header-search-icon">🔍</span>
            <input placeholder='Search orders, invoices, or clients...' type='text' />
          </div>
        
        </header>

        {/* Content Grid */}
        <div className="pos-content-grid">
          {/* Left: Services/Products (60%) */}
          <section className="pos-left-section">
            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => { setItemType('products'); setFilterCategory('all'); }}
                className={`pos-filter-btn ${itemType === 'products' ? 'active' : ''}`}
                style={{ marginBottom: 0 }}
              >
                 Inventory ({products.length})
              </button>
              <button
                onClick={() => { setItemType('services'); setFilterCategory('all'); }}
                className={`pos-filter-btn ${itemType === 'services' ? 'active' : ''}`}
                style={{ marginBottom: 0 }}
              >
                 Services ({services.length})
              </button>
            </div>

            {/* Filters */}
            <div className="pos-filters">
              <div className="pos-filter-buttons">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat.toLowerCase())}
                    className={`pos-filter-btn ${filterCategory === cat.toLowerCase() || (cat === 'All' && filterCategory === 'all') ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="pos-search-field">
                <span className="pos-search-icon">⚙️</span>
                <input
                  placeholder={itemType === 'products' ? 'Search inventory...' : 'Search services...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Service Grid */}
            <div className="pos-grid">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="pos-card"
                >
                  <div className="pos-card-header">
                    <div className="pos-card-icon">{itemType === 'products' ? '📦' : '🔧'}</div>
                    <span className="pos-card-badge">
                      {item.category || (itemType === 'products' ? 'Product' : 'Service')}
                    </span>
                  </div>
                  <h3 className="pos-card-title">{item.name}</h3>
                  <p className="pos-card-description">{item.description || 'Premium quality item'}</p>
                  <div className="pos-card-footer">
                    <div>
                      <p className="pos-card-price-label">Price</p>
                      <p className="pos-card-price">Tzs{getPrice(item).toFixed(2)}</p>
                    </div>
                    <span className="pos-card-unit">Per Unit</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: Cart (40%) */}
          <aside className="pos-right-section">
            <div className="pos-right-inner">
              {/* Customer Details */}
             

              {/* Cart Items */}
              <div className="pos-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pos-section-header" style={{ marginBottom: 0 }}>
                    <span className="pos-section-icon">🛒</span>
                    <h4 className="pos-section-title">Selected Items</h4>
                  </div>
                  <span className="pos-section-badge">{cart.length} Items</span>
                </div>
                <div className="pos-cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="pos-cart-item">
                      <div className="pos-cart-item-info">
                        <h5 className="pos-cart-item-name">{item.name}</h5>
                        <div className="pos-cart-item-details">
                          <span>Qty:</span>
                          <input type='number' min='1' value={item.qty} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} className="pos-cart-item-qty-input" />
                          <span>•</span>
                          <span>Tzs{item.price?.toFixed(2)} ea</span>
                        </div>
                      </div>
                      <div className="pos-cart-item-actions">
                        <p className="pos-cart-item-total">Tzs{(item.price * item.qty).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.id)} className="pos-cart-item-remove">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="pos-summary">
              <div className="pos-summary-row">
                <span>Subtotal</span>
                <span className="pos-summary-row-value">Tzs{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="pos-summary-total">
                <span className="pos-summary-total-label">Total Amount</span>
                <span className="pos-summary-total-amount">Tzs{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="pos-checkout-actions">
                <button disabled={loading} className="pos-btn pos-btn-draft">
                  <span>💾</span> Save as Draft
                </button>
                <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="pos-btn pos-btn-checkout">
                  <span>✓</span> {loading ? 'Processing...' : 'Create Order'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;