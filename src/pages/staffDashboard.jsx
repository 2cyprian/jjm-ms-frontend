import React, { useState, useEffect, useRef } from 'react';
import { fetchQueue, scanProduct, checkout, downloadJob, printJob, getSettings, getProducts, getRevenueData } from '../utils/api';
import { useToast } from '../utils/toast';
import CartItem from '../components/CartItem';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import '../css/components/dashboard.css';
import { formatCurrency } from '../utils/adminHelpers';
import { Search } from 'lucide-react';

// Import staff dashboard components
import SalesHeader from '../components/staffDashboard/SalesHeader';
import PrintQueueSection from '../components/staffDashboard/PrintQueueSection';
import ServicesGrid from '../components/staffDashboard/ServicesGrid';
import RetailGrid from '../components/staffDashboard/RetailGrid';
import SalesCart from '../components/staffDashboard/SalesCart';
import ServiceConfigModal from '../components/staffDashboard/ServiceConfigModal';
import PrintConfirmModal from '../components/staffDashboard/PrintConfirmModal';

const StaffDashboard = () => {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [queue, setQueue] = useState([]);
  const [retailItems, setRetailItems] = useState([]);
  const [dailySales, setDailySales] = useState(0);
  const [transactions, setTransactions] = useState(() => {
    try {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('todayTransactions');
      if (storedData) {
        const { date, txns } = JSON.parse(storedData);
        // Reset if it's a new day
        return date === today ? (Array.isArray(txns) ? txns : []) : [];
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
    return [];
  });
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
      id: `service_${savedService.id}_${Date.now()}`, // Unique cart item ID
      name: savedService.displayName,
      price: savedService.price * savedService.pages, // Total price (price per page × pages)
      qty: 1, // Each service config is 1 cart item
      serviceConfig: savedService,
      // Additional metadata for backend tracking
      service_type: savedService.serviceType,
      paper_size: savedService.paperSize,
      paper_type: savedService.paperType
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
      id: `service_${Date.now()}`, // Use string ID to avoid confusion with timestamps
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
            price: price * pages, // total cost derived from price per page * pages printed
            service_metadata: {
              service_type: 'print',
              print_type: confirmPrintType === 'print_bw' ? 'bw' : 'color',
              pages: pages,
              job_code: pendingPrintJob?.job_code
            }
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

  // Generate and download CSV report
  const generateCSVReport = () => {
    if (transactions.length === 0) {
      toast.warning('No transactions to export');
      return;
    }

    let csvContent = 'Transaction Report - ' + new Date().toDateString() + '\n\n';
    csvContent += 'Transaction Time,Item Name,Type,Quantity,Unit Price (TZS),Line Total (TZS),Payment Method\n';

    let totalRevenue = 0;
    let productRevenue = 0;
    let serviceRevenue = 0;
    let transactionCount = 0;

    transactions.forEach((txn, index) => {
      transactionCount++;
      const firstItemInTxn = txn.items.length > 0;

      txn.items.forEach((item, itemIndex) => {
        const timeStr = itemIndex === 0 ? txn.timestamp : ''; // Only show time on first item
        csvContent += `${timeStr},${item.name},${item.type},${item.quantity},${item.unitPrice},${item.lineTotal},${txn.paymentMethod}\n`;

        if (item.type === 'PRODUCT') {
          productRevenue += item.lineTotal;
        } else if (item.type === 'SERVICE') {
          serviceRevenue += item.lineTotal;
        }
      });

      // Transaction subtotal
      csvContent += `,,TRANSACTION TOTAL,,,${txn.total},\n\n`;
      totalRevenue += txn.total;
    });

    // Daily Summary
    csvContent += '\n\nDAILY SUMMARY\n';
    csvContent += `Total Transactions,${transactionCount}\n`;
    csvContent += `Total Revenue (TZS),${totalRevenue}\n`;
    csvContent += `Product Revenue (TZS),${productRevenue}\n`;
    csvContent += `Service Revenue (TZS),${serviceRevenue}\n`;

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  // Cancel Printed
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
      items: cart.map(i => {
        const baseItem = {
          id: String(i.id),
          type: String(i.type || "PRODUCT"),
          quantity: Number(i.qty) || 1,
          price: Number(i.price) || 0,
          name: i.name // Include name for service tracking
        };
        
        // Add product_id for PRODUCT types
        if (i.type === "PRODUCT") {
          baseItem.product_id = String(i.id);
        }
        
        // Add service metadata for SERVICE types
        if (i.type === "SERVICE" && i.serviceConfig) {
          baseItem.service_metadata = {
            service_type: i.serviceConfig.serviceType,
            print_type: i.serviceConfig.printType,
            paper_size: i.serviceConfig.paperSize,
            paper_type: i.serviceConfig.paperType,
            pages: i.serviceConfig.pages
          };
        }
        
        return baseItem;
      })
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
      
      // Save transaction to history
      const transaction = {
        id: `txn_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date().toDateString(),
        items: cart.map(i => ({
          name: i.name,
          type: i.type,
          quantity: i.qty,
          unitPrice: i.price,
          lineTotal: i.price * i.qty
        })),
        paymentMethod: 'CASH',
        total: totalAmount
      };
      
      const today = new Date().toDateString();
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('todayTransactions', JSON.stringify({ date: today, txns: updatedTransactions }));
      
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
        <SalesHeader 
          dailySales={dailySales} 
          transactionCount={transactions.length}
          onExportCSV={generateCSVReport}
        />

        <div className="staff-dashboard-layout">
          {/* LEFT SECTION: SEARCH + GRIDS */}
          <div className="sales-main">
            {/* Print Queue Container */}
            <PrintQueueSection 
              queue={queue}
              loading={loading}
              onDownload={handleDownload}
              onPrint={handlePrint}
            />

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
            <ServicesGrid 
              services={savedServices}
              onAddService={handleOpenServiceModal}
              onDeleteService={deleteSavedService}
              onSelectService={addSavedServiceToCart}
            />

            {/* Retail Grid */}
            <RetailGrid 
              items={retailItems}
              onSelectItem={addQuickItem}
            />
          </div>

          {/* RIGHT SECTION: CART */}
          <SalesCart 
            items={cart}
            total={calculateTotalNumber()}
            loading={loading}
            onCheckout={handleCheckout}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        </div>
      </div>

      {/* Service Configuration Modal */}
      <ServiceConfigModal 
        show={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        serviceType={serviceType}
        onServiceTypeChange={setServiceType}
        printType={printType}
        onPrintTypeChange={setPrintType}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
        paperType={paperType}
        onPaperTypeChange={setPaperType}
        servicePages={servicePages}
        onServicePagesChange={setServicePages}
        servicePrice={servicePrice}
        onServicePriceChange={setServicePrice}
        onSave={handleSaveService}
      />

      {/* Print Confirmation Modal */}
      <PrintConfirmModal 
        show={showConfirmModal}
        onClose={cancelPrinted}
        onConfirm={confirmPrintedSuccess}
        job={pendingPrintJob}
        printedPages={printedPages}
        onPrintedPagesChange={setPrintedPages}
        printType={confirmPrintType}
        onPrintTypeChange={setConfirmPrintType}
        price={confirmPrice}
        onPriceChange={setConfirmPrice}
        savedServices={savedServices}
      />
    </div>
  );
};

export default StaffDashboard;