import React, { useState, useEffect, useRef } from 'react';
import { fetchQueue, scanProduct, checkout, downloadJob, printJob, getSettings, getProducts, getRevenueData } from '../utils/api';
import { useToast } from '../utils/toast';
import CartItem from '../components/CartItem';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import '../css/components/dashboard.css';
import { formatCurrency } from '../utils/adminHelpers';
import { Search, Trash2, Download, Printer, X } from 'lucide-react';

const StaffDashboard = () => {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [queue, setQueue] = useState([]);
  const [retailItems, setRetailItems] = useState([]);
  const [dailySales, setDailySales] = useState(0);
  const [orderNumber] = useState(`#${Date.now().toString().slice(-3)}`);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [servicePages, setServicePages] = useState(1);
  const [servicePrice, setServicePrice] = useState("");
  const [serviceType, setServiceType] = useState('photocopy'); // photocopy or print
  const [printType, setPrintType] = useState('bw'); // bw or color
  const [paperSize, setPaperSize] = useState('A4'); // A0-A4
  const [paperType, setPaperType] = useState('plain'); // draft, film, gloss, plain, sticker, manila
  const [savedServices, setSavedServices] = useState(() => {
    try {
      const raw = localStorage.getItem('serviceConfigurations');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    return [];
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPrintJob, setPendingPrintJob] = useState(null);
  const [printedPages, setPrintedPages] = useState(1);
  const [confirmPrintType, setConfirmPrintType] = useState('print_bw');
  const [confirmPrice, setConfirmPrice] = useState('');
  const scanInputRef = useRef(null);
  const toast = useToast();

  // Persist service configurations whenever savedServices changes
  useEffect(() => {
    try {
      localStorage.setItem('serviceConfigurations', JSON.stringify(savedServices));
    } catch (err) {
      console.error('Failed to save service configurations:', err);
    }
  }, [savedServices]);

  // Initialize daily sales from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('dailySalesData');
    
    if (storedData) {
      const { date, total } = JSON.parse(storedData);
      // Reset if it's a new day
      if (date === today) {
        setDailySales(total);
      } else {
        // New day, reset sales
        setDailySales(0);
        localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: 0 }));
      }
    } else {
      // First time or localStorage cleared
      localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: 0 }));
      setDailySales(0);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-focus scan input when component mounts
  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load pricing settings");
    }
  };

  // Fetch products once (or when explicitly refreshed)
  const loadProductsOnce = useRef(false);
  const loadProducts = async () => {
    if (loadProductsOnce.current) return;
    loadProductsOnce.current = true;
    try {
      const productsData = await getProducts();
      setRetailItems(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    }
  };

  // Pollable data (settings + queue) without re-fetching products
  const loadLiveData = async () => {
    try {
      const [settingsData, queueData] = await Promise.all([
        getSettings(),
        fetchQueue(),
      ]);
      setSettings(settingsData);
      setQueue(Array.isArray(queueData) ? queueData : []);
    } catch (err) {
      console.error("Error loading live data:", err);
      toast.error("Failed to load dashboard data");
    }
  };

  // Update daily sales after successful checkout
  const updateDailySales = (amount) => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('dailySalesData');
    let newTotal = amount;

    if (storedData) {
      const { date, total } = JSON.parse(storedData);
      // Only add if same day
      if (date === today) {
        newTotal = total + amount;
      }
    }

    setDailySales(newTotal);
    localStorage.setItem('dailySalesData', JSON.stringify({ date: today, total: newTotal }));
  };

  useEffect(() => {
    loadSettings();
    loadProducts();
    loadLiveData();
    // Poll every 10 seconds to refresh queue + settings (products excluded)
    const interval = setInterval(loadLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Service configuration button
  const addNewServiceButton = { id: 'add_service', name: 'Add Service Configuration' };

  // Removed hardcoded retail array since we're fetching from backend

  // No conversion needed; settings already in TZS per page

  // Handle service modal - open configuration form
  const handleOpenServiceModal = () => {
    setServicePages(1);
    setServicePrice("");
    setServiceType('photocopy');
    setPrintType('bw');
    setPaperSize('A4');
    setPaperType('plain');
    setShowServiceModal(true);
  };

  // Add saved service to cart
  const addSavedServiceToCart = (savedService) => {
    const cartItem = {
      type: "SERVICE",
      id: `service_${Date.now()}`,
      name: savedService.displayName,
      price: savedService.price,
      qty: savedService.pages,
      serviceConfig: savedService
    };
    
    setCart([...cart, cartItem]);
    toast.success(`${savedService.displayName} added to cart`);
    if (scanInputRef.current) scanInputRef.current.focus();
  };

  // Save comprehensive service configuration
  const handleSaveService = () => {
    if (!servicePrice || parseFloat(servicePrice) <= 0) {
      toast.error("Please enter a valid price per page");
      return;
    }
    if (!servicePages || parseInt(servicePages) <= 0) {
      toast.error("Please enter valid number of pages");
      return;
    }

    // Build display name
    let displayName = serviceType === 'photocopy' ? 'Photocopy' : `Print (${printType.toUpperCase()})`;
    displayName += ` - ${paperSize} ${paperType}`;
    displayName += ` (${servicePages}p)`;

    const serviceConfig = {
      id: Date.now(),
      serviceType,
      printType: serviceType === 'print' ? printType : null,
      paperSize,
      paperType,
      pages: parseInt(servicePages),
      price: parseFloat(servicePrice),
      displayName
    };

    // Add to saved services only (not to cart)
    setSavedServices([...savedServices, serviceConfig]);

    setShowServiceModal(false);
    toast.success(`${displayName} configuration saved`);
    
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  };

  // Delete saved service configuration
  const deleteSavedService = (serviceId) => {
    setSavedServices(savedServices.filter(s => s.id !== serviceId));
    toast.success('Service configuration deleted');
  };

  // Add service/retail item to cart
  const addQuickItem = (item) => {
    const cartItem = {
      type: "PRODUCT",
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1
    };
    
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, cartItem]);
    }
    
    // Re-focus scan input
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  };

  // Handle Print & Confirm workflow
  const handlePrint = async (job) => {
    try {
      setPendingPrintJob({
        job_code: job.job_code,
        filename: job.filename || job.name,
        total_pages: job.total_pages || 1
      });
      setLoading(true);

      // Try to open the file and trigger browser print dialog
      const data = await downloadJob(job.job_code);
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      // Use a hidden iframe for reliable print dialog
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;
      document.body.appendChild(iframe);

      // Fallback timer: if afterprint never fires (e.g., browser blocks), still show confirm
      const fallbackTimer = setTimeout(() => {
        setPrintedPages(job.total_pages || 1);
        setShowConfirmModal(true);
        try {
          document.body.removeChild(iframe);
        } catch {}
        window.URL.revokeObjectURL(url);
      }, 5000);

      const onAfterPrint = () => {
        window.removeEventListener('afterprint', onAfterPrint);
        clearTimeout(fallbackTimer);
        setPrintedPages(job.total_pages || 1);
        // Prefill type and price from saved services
        const defaultType = 'print_bw';
        setConfirmPrintType(defaultType);
        // Find a matching saved service for default price
        const matchingService = savedServices.find(s => s.serviceType === 'print' && s.printType === 'bw');
        setConfirmPrice(matchingService?.price ? String(matchingService.price) : '');
        setShowConfirmModal(true);
        // Cleanup iframe & URL
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
          window.URL.revokeObjectURL(url);
        }, 0);
      };
      window.addEventListener('afterprint', onAfterPrint);

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Print dialog could not be opened via iframe:', e);
          // Fallback: open new tab and call print; if blocked, fallback timer still brings confirm modal
          const newTab = window.open(url, '_blank');
          try {
            newTab?.addEventListener('load', () => {
              newTab.focus();
              newTab.print();
            });
          } catch {}
        }
      };
    } catch (err) {
      console.error('Error preparing print:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to open print dialog.';
      toast.error(msg);
      setPendingPrintJob(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmPrintedSuccess = async () => {
    if (!pendingPrintJob) {
      setShowConfirmModal(false);
      return;
    }
    const pages = Number(printedPages) || 0;
    const price = Number(confirmPrice) || 0;
    if (pages < 0) {
      toast.error('Pages printed must be zero or more');
      return;
    }
    if (price <= 0) {
      toast.error('Please enter a valid price per page');
      return;
    }
    setLoading(true);
    try {
      // Complete the sale for this print job using checkout endpoint
      const itemName = pendingPrintJob?.file_name || 'Print Job';
      const payload = {
        payment_method: 'CASH',
        items: [
          {
            type: 'SERVICE',
            id: pendingPrintJob?.job_code || 'PRINT_JOB',
            name: itemName,
            quantity: 1,
            price: price * pages // total cost derived from price per page * pages printed
          }
        ]
      };
      await checkout(payload);
      toast.success('Sale completed for print job');
      setShowConfirmModal(false);
      setPendingPrintJob(null);
      loadLiveData();
    } catch (err) {
      console.error('Error completing sale for print job:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to complete sale for print job.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cancelPrinted = () => {
    setShowConfirmModal(false);
    setPendingPrintJob(null);
    toast.info('Print not confirmed. No stock deducted.');
  };

  // Handle Download Job
  const handleDownload = async (jobCode, filename) => {
    setLoading(true);
    try {
      const data = await downloadJob(jobCode);
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || jobCode);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Job ${jobCode} downloaded!`);
    } catch (err) {
      console.error("Error downloading job:", err);
      toast.error("Failed to download job.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Scan Product
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const data = await scanProduct(barcodeInput);
      
      const product = {
        type: "PRODUCT",
        id: barcodeInput,
        name: data.name,
        price: data.price,
        qty: 1
      };
      
      const existing = cart.find(c => c.id === product.id);
      if (existing) {
        existing.qty += 1;
        setCart([...cart]);
      } else {
        setCart([...cart, product]);
      }
      
      setBarcodeInput(""); // Clear input
      toast.success(`${data.name} added to cart`);
    } catch (err) {
      toast.error("Product not found!");
      setBarcodeInput("");
    }
  };

  // 4. Calculate Total
  const calculateTotalNumber = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  // 5. Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // 6. Update cart item quantity
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
    }
  };

  // 7. Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty!");
      return;
    }
    setLoading(true);

    const payload = {
      payment_method: "CASH",
      items: cart.map(i => ({
        id: String(i.id),
        type: String(i.type || "PRODUCT"),
        product_id: String(i.id),
        quantity: Number(i.qty) || 1,
        price: Number(i.price) || 0
      }))
    };

    try {
      console.log('=== CHECKOUT ATTEMPT ===');
      console.log('Cart items:', cart);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      const res = await checkout(payload);
      console.log('Checkout response:', res);
      
      // Update daily sales with transaction amount
      const totalAmount = calculateTotalNumber();
      updateDailySales(totalAmount);
      
      toast.success("Transaction Successful!");
      setCart([]); // Clear Cart
      // Re-focus scan input for next transaction
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error('=== CHECKOUT ERROR ===');
      console.error('Status:', status);
      console.error('Error data:', JSON.stringify(data, null, 2));
      
      // Handle 422 validation errors properly
      if (status === 422 && data?.detail) {
        if (Array.isArray(data.detail)) {
          console.error('=== VALIDATION ERRORS ===');
          data.detail.forEach((error, index) => {
            console.error(`Error ${index + 1}:`, {
              type: error.type,
              location: error.loc,
              message: error.msg,
              input: error.input
            });
            const field = Array.isArray(error.loc) ? error.loc.join('.') : 'field';
            const message = error.msg || error.message || 'Invalid value';
            toast.error(`Validation error at ${field}: ${message}`);
          });
        } else {
          toast.error(String(data.detail));
        }
      } else {
        // Generic error handling
        const errorMsg = data?.message || (typeof data?.detail === 'string' ? data.detail : null) || err.message || "Checkout Failed";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="main-content">
        {/* Header with Daily Sales */}
        <div className="dashboard-header" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Sales & Service</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '999px' }}>
              Daily Sales: {formatCurrency(dailySales || 0, 'TZS')}
            </span>
          </div>
        </div>

        <div className="staff-dashboard-layout">
          {/* LEFT SECTION: SEARCH + GRIDS */}
          <div className="sales-main">
            {/* Print Queue Container */}
            <div className="print-queue-container">
              <div className="queue-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Printer size={20} />
                  Print Queue
                </h3>
                <span className="queue-badge">{queue.length}</span>
              </div>

              
              {queue.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 1rem' }}>
                  No pending jobs
                </p>
              ) : (
                <div className="queue-items">
                  {queue.map((job) => (
                    <div key={job.id || job.job_code} className="queue-item">
                      <div className="queue-item-info">
                        <div className="queue-item-name">{job.filename || job.name || `Job ${job.job_code}`}
                          {job.job_code && <span>Order #{job.job_code}</span>}
                           
                        </div>
                        <div className="queue-item-meta">
                          {job.order_id && (job.total_pages || job.file_size) && <span> • </span>}
                          {job.total_pages && <span>{job.total_pages} pages</span>}
                          {job.total_pages && job.file_size && <span> • </span>}
                          {job.file_size && <span>{job.file_size}</span>}
                        </div>
                      </div>
                      <div className="queue-item-actions">
                        <button
                          onClick={() => handleDownload(job.job_code, job.filename)}
                          disabled={loading}
                          className="queue-btn download-btn"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handlePrint(job)}
                          disabled={loading}
                          className="queue-btn print-btn"
                          title="Print"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search/Scan Bar */}
            <form onSubmit={handleScan} className="scan-bar">
              <Search size={20} style={{ color: 'var(--muted)' }} />
              <input
                ref={scanInputRef}
                type="text"
                className="scan-input"
                placeholder="Scan Barcode or Search..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                autoFocus
              />
            </form>

            {/* Services Grid */}
            <div className="quick-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Services</h3>
                <button
                  onClick={handleOpenServiceModal}
                  type="button"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  + Add Service
                </button>
              </div>
              {savedServices.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
                  No service configurations. Click "Add Service" to create one.
                </p>
              ) : (
                <div className="quick-grid">
                  {savedServices.map(service => (
                    <div
                      key={service.id}
                      style={{
                        position: 'relative',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        background: 'white'
                      }}
                    >
                      <button
                        onClick={() => addSavedServiceToCart(service)}
                        type="button"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <div className="quick-item-name" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          {service.displayName}
                        </div>
                        <div className="quick-item-price">
                          {formatCurrency(service.price * service.pages, 'TZS')}
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSavedService(service.id)}
                        type="button"
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem'
                        }}
                        title="Delete configuration"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Retail Grid */}
            <div className="quick-section">
              <h3>Retail Items</h3>
              {retailItems.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
                  No retail items available
                </p>
              ) : (
                <div className="quick-grid">
                  {retailItems.map(item => (
                    <button
                      key={item.id}
                      className="quick-item"
                      onClick={() => addQuickItem({ id: item.id, name: item.name, price: item.price })}
                      type="button"
                    >
                      <div className="quick-item-name">{item.name}</div>
                      <div className="quick-item-price">{formatCurrency(item.price, 'TZS')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: CART */}
          <div className="sales-cart">
            <div className="cart-header">
              <h3>CART</h3>
              <span className="order-number">{orderNumber}</span>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
              {cart.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', paddingTop: '2rem' }}>
                  Cart is empty
                </p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item-row">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-qty">
                        <button 
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      {formatCurrency(item.price * item.qty, 'TZS')}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart-remove-btn"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total & Checkout */}
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">{formatCurrency(calculateTotalNumber(), 'TZS')}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="checkout-btn"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700' }}
              >
                {loading ? 'Processing...' : 'COMPLETE SALE'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Service Configuration Modal */}
      {showServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Add Service Configuration</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Service Type */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="photocopy">Photocopy</option>
                <option value="print">Print</option>
              </select>
            </div>

            {/* Print Type (only if service is Print) */}
            {serviceType === 'print' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Print Type
                </label>
                <select
                  value={printType}
                  onChange={(e) => setPrintType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="bw">Black & White</option>
                  <option value="color">Color</option>
                </select>
              </div>
            )}

            {/* Paper Size */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Paper Size
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="A0">A0</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="A4">A4</option>
              </select>
            </div>

            {/* Paper Type */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Paper Type
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="draft">Draft-Film</option>
                <option value="gloss">Gloss</option>
                <option value="plain">Plain</option>
                <option value="sticker">Sticker</option>
                <option value="manila">Manila</option>
              </select>
            </div>

            {/* Number of Pages */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Number of Pages
              </label>
              <input
                type="number"
                min="1"
                value={servicePages}
                onChange={(e) => setServicePages(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Price per Page */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Price per Page (TZS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                placeholder="Enter price per page"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Total Preview */}
            {servicePrice && servicePages && (
              <div style={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Configuration Summary:</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>
                  {serviceType === 'photocopy' ? 'Photocopy' : `Print (${printType.toUpperCase()})`} - {paperSize} {paperType} ({servicePages}p)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Total:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4CAF50' }}>
                    {formatCurrency(parseInt(servicePages || 0) * parseFloat(servicePrice || 0), 'TZS')}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, padding: '1.5rem', width: '90%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Did the document print successfully?</h3>
              <button onClick={cancelPrinted} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <p style={{ color: 'var(--muted)', marginTop: 0 }}>Confirm to deduct stock for this job.</p>
            {pendingPrintJob && (
              <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                <div style={{ marginBottom: '0.25rem' }}><strong>File:</strong> {pendingPrintJob.filename || pendingPrintJob.job_code}</div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Queued Pages:</strong> {pendingPrintJob.total_pages}</div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Pages actually printed</label>
                <input
                  type="number"
                  min="0"
                  value={printedPages}
                  onChange={(e) => setPrintedPages(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="printType"
                      value="print_bw"
                      checked={confirmPrintType === 'print_bw'}
                      onChange={() => {
                        setConfirmPrintType('print_bw');
                        const matchingService = savedServices.find(s => s.serviceType === 'print' && s.printType === 'bw');
                        setConfirmPrice(matchingService?.price ? String(matchingService.price) : '');
                      }}
                    />
                    B&W
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="printType"
                      value="print_color"
                      checked={confirmPrintType === 'print_color'}
                      onChange={() => {
                        setConfirmPrintType('print_color');
                        const matchingService = savedServices.find(s => s.serviceType === 'print' && s.printType === 'color');
                        setConfirmPrice(matchingService?.price ? String(matchingService.price) : '');
                      }}
                    />
                    Color
                  </label>
                </div>
                <label style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.25rem' }}>Price per page (TZS)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={confirmPrice}
                  onChange={(e) => setConfirmPrice(e.target.value)}
                  placeholder="Enter price per page"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}
                />
                {(confirmPrice && printedPages !== '') && (
                  <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: 6 }}>
                    <strong>Total:</strong> {formatCurrency((Number(printedPages) || 0) * (Number(confirmPrice) || 0), 'TZS')}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button onClick={cancelPrinted} className="secondary" style={{ flex: 1 }}>No</Button>
              <Button onClick={confirmPrintedSuccess} style={{ flex: 1 }}>Yes, Deduct</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;