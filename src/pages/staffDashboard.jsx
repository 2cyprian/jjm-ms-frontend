import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiPackage, 
  FiTool, 
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCheckCircle,
  FiDollarSign,
  FiBox,
  FiRefreshCw,
  FiGrid,
  FiTag,
  FiUser,
  FiMail,
  FiPhone,
  FiClock,
  FiSave
} from 'react-icons/fi';
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
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemType, setItemType] = useState('products');
  const scanInputRef = useRef(null);
  const toast = useToast();

  // Format currency with commas
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getDailySalesSnapshot = () => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('dailySalesData');

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed?.date === today) {
          return parsed;
        }
      } catch (err) {
        console.error('Error parsing daily sales data from localStorage:', err);
      }
    }

    const resetSnapshot = { date: today, total: 0 };
    localStorage.setItem('dailySalesData', JSON.stringify(resetSnapshot));
    return resetSnapshot;
  };

  const persistDailySales = (total) => {
    const today = new Date().toDateString();
    const snapshot = { date: today, total };
    localStorage.setItem('dailySalesData', JSON.stringify(snapshot));
    setDailySales(total);
  };

  useEffect(() => {
    const snapshot = getDailySalesSnapshot();
    setDailySales(snapshot.total);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      }
      
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
  }, []);

  const getPrice = (item) => {
    if (item.price) return item.price;
    if (item.pricing_config?.base_price) return item.pricing_config.base_price;
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

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const data = await scanProduct(barcodeInput);
      addToCart(data);
      setBarcodeInput('');
      if (scanInputRef.current) scanInputRef.current.focus();
    } catch (err) {
      toast.error('Product not found!');
      setBarcodeInput('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty!');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(i => ({
        type: i.type,
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
      
      const totalAmount = calculateTotal();
      const snapshot = getDailySalesSnapshot();
      const newTotal = snapshot.total + totalAmount;
      persistDailySales(newTotal);

      setCart([]);
      if (scanInputRef.current) scanInputRef.current.focus();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Checkout Failed';
      toast.error(msg);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="pos-header-status-text">
                {cart.length > 0 ? `${cart.length} items in cart` : 'Ready to start'}
              </span>
            </div>
          </div>
        
          <div className="pos-header-actions">
            <div className="pos-header-sales">
              <span>Tzs {formatCurrency(dailySales)}</span>
            </div>
            <button className="pos-header-btn">
            </button>
            <div className="pos-header-avatar">
              <img src="https://ui-avatars.com/api/?name=Staff&background=4f46e5&color=fff" alt="Staff" />
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="pos-content-grid">
          {/* Left: Services/Products */}
          <section className="pos-left-section">
            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => { setItemType('products'); setFilterCategory('all'); }}
                className={`pos-filter-btn ${itemType === 'products' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiPackage size={16} />
                Products ({products.length})
              </button>
              <button
                onClick={() => { setItemType('services'); setFilterCategory('all'); }}
                className={`pos-filter-btn ${itemType === 'services' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiTool size={16} />
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
                <FiSearch className="pos-search-icon" />
                <input
                  placeholder={itemType === 'products' ? 'Search products...' : 'Search services...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Items Grid */}
            <div className="pos-grid">
              {filteredItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <FiBox size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No {itemType} found</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="pos-card"
                  >
                    <div className="pos-card-header">
                      <div className="pos-card-icon">
                        {itemType === 'products' ? <FiPackage size={20} /> : <FiTool size={20} />}
                      </div>
                      <span className="pos-card-badge">
                        {item.category || (itemType === 'products' ? 'Product' : 'Service')}
                      </span>
                    </div>
                    <h3 className="pos-card-title">{item.name}</h3>
                    <p className="pos-card-description">{item.description || 'Premium quality item'}</p>
                    <div className="pos-card-footer">
                      <div>
                        <p className="pos-card-price-label">Price</p>
                        <p className="pos-card-price">Tzs {formatCurrency(getPrice(item))}</p>
                      </div>
                      <span className="pos-card-unit">Per Unit</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right: Cart */}
          <aside className="pos-right-section">
            <div className="pos-right-inner">
              {/* Cart Items */}
              <div className="pos-section">
                <div className="pos-section-header">
                  <FiShoppingCart className="pos-section-icon" />
                  <h4 className="pos-section-title">Selected Items</h4>
                  <span className="pos-section-badge">{cart.length} Items</span>
                </div>
                <div className="pos-cart-items">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <FiShoppingCart size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                      <p>Your cart is empty</p>
                      <span style={{ fontSize: '0.85rem' }}>Add items from the left panel</span>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="pos-cart-item">
                        <div className="pos-cart-item-info">
                          <h5 className="pos-cart-item-name">{item.name}</h5>
                          <div className="pos-cart-item-details">
                            <span>Qty:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button 
                                onClick={() => updateQuantity(item.id, item.qty - 1)}
                                style={{ 
                                  width: '24px', height: '24px', 
                                  border: '1px solid var(--border-regular)', 
                                  borderRadius: '4px',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiMinus size={12} />
                              </button>
                              <input 
                                type='number' 
                                min='1' 
                                value={item.qty} 
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} 
                                className="pos-cart-item-qty-input" 
                              />
                              <button 
                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                                style={{ 
                                  width: '24px', height: '24px', 
                                  border: '1px solid var(--border-regular)', 
                                  borderRadius: '4px',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            <span>•</span>
                            <span>Tzs {formatCurrency(item.price)} ea</span>
                          </div>
                        </div>
                        <div className="pos-cart-item-actions">
                          <p className="pos-cart-item-total">Tzs {formatCurrency(item.price * item.qty)}</p>
                          <button onClick={() => removeFromCart(item.id)} className="pos-cart-item-remove">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="pos-summary">
              <div className="pos-summary-row">
                <span>Subtotal</span>
                <span className="pos-summary-row-value">Tzs {formatCurrency(calculateTotal())}</span>
              </div>
              <div className="pos-summary-total">
                <span className="pos-summary-total-label">Total Amount</span>
                <span className="pos-summary-total-amount">Tzs {formatCurrency(calculateTotal())}</span>
              </div>
              <div className="pos-checkout-actions">
                <button 
                  disabled={loading} 
                  className="pos-btn pos-btn-draft"
                >
                  <FiSave size={16} />
                  Save as Draft
                </button>
                <button 
                  onClick={handleCheckout} 
                  disabled={loading || cart.length === 0} 
                  className="pos-btn pos-btn-checkout"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={16} />
                      Create Order
                    </>
                  )}
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