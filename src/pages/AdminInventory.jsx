import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';
import { useToast } from '../utils/toast';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import '../css/components/inventory.css';
import { formatCurrency } from '../utils/adminHelpers';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [importing, setImporting] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct({
      name: '',
      barcode: '',
      price: 0,
      stock_quantity: 0,
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentProduct.id) {
        await updateProduct(currentProduct.id, currentProduct);
        toast.success("Product updated successfully");
      } else {
        await createProduct(currentProduct);
        toast.success("Product added successfully");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setLoading(true);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setParsedProducts([]);
    setImportSummary(null);
  };

  const parseRowToProduct = (row) => {
    const normalized = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      normalized[key.toString().trim().toLowerCase()] = value;
    });

    const name = normalized.name || normalized['product name'] || normalized.item || normalized.title;
    const barcode = normalized.barcode || normalized['bar code'] || normalized.sku || normalized.code;
    const priceRaw = normalized.price ?? normalized.cost ?? normalized.amount;
    const qtyRaw = normalized.stock_quantity ?? normalized.stock ?? normalized.quantity ?? normalized.qty;

    if (!name || !barcode) return null;

    const price = parseFloat(String(priceRaw ?? '0').replace(/,/g, ''));
    const stock = parseFloat(String(qtyRaw ?? '0').replace(/,/g, ''));

    return {
      name: String(name).trim(),
      barcode: String(barcode).trim(),
      price: Number.isFinite(price) ? price : 0,
      stock_quantity: Number.isFinite(stock) ? stock : 0,
    };
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames?.[0];

      if (!firstSheet) throw new Error('No sheet found in the file');

      const sheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const productsFromFile = rows.map(parseRowToProduct).filter(Boolean);

      setImportFile(file);
      setParsedProducts(productsFromFile);
      setImportSummary({
        fileName: file.name,
        total: rows.length,
        ready: productsFromFile.length,
        skipped: rows.length - productsFromFile.length,
        success: 0,
        failed: 0,
      });

      if (productsFromFile.length === 0) {
        toast.error('No valid rows found. Ensure columns include Name, Barcode, Price, Stock Quantity.');
      }
    } catch (error) {
      console.error('Error parsing import file:', error);
      toast.error('Failed to read file. Please use CSV or Excel with valid columns.');
      resetImportState();
    } finally {
      event.target.value = '';
    }
  };

  const handleImportProducts = async () => {
    if (!parsedProducts.length) {
      toast.error('No valid products to import');
      return;
    }

    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const product of parsedProducts) {
      try {
        await createProduct(product);
        success += 1;
      } catch (error) {
        failed += 1;
        console.error('Error importing product:', error);
      }
    }

    setImportSummary((prev) => prev ? { ...prev, success, failed } : { success, failed });

    if (failed === 0) {
      toast.success(`Imported ${success} products successfully`);
    } else {
      toast.error(`Imported ${success} products. Failed ${failed}. Check logs for details.`);
    }

    setImporting(false);
    setShowImportModal(false);
    resetImportState();
    loadProducts();
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'low' ? product.stock_quantity < 10 :
      filter === 'out' ? product.stock_quantity === 0 : true;
    
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (product) => {
    if (product.stock_quantity === 0) {
      return <span className="status-badge status-critical">Out of Stock</span>;
    } else if (product.stock_quantity < 10) {
      return <span className="status-badge status-low">Low Stock</span>;
    } else {
      return <span className="status-badge status-in-stock">In Stock</span>;
    }
  };

  const getRowClass = (product) => {
    if (product.stock_quantity === 0) return 'row-critical';
    if (product.stock_quantity < 10) return 'row-low';
    return '';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        {/* Header */}
        <div className="inventory-header">
          <div className="header-left">
            <h2>Inventory Manager</h2>
            <p className="subtitle">Manage paper, ink, toner & supplies</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={() => { resetImportState(); setShowImportModal(true); }}>
              Import
            </Button>
            <Button variant="secondary">Export List</Button>
            <Button variant="success" onClick={handleAddProduct}>
              + Add New Stock
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="inventory-content">
          {/* Tabs */}
          <div className="tabs-container">
            <button className="tab">Settings</button>
            <button className="tab tab-active">Inventory</button>
            <button className="tab">Reports</button>
          </div>

          {/* Table Card */}
          <div className="table-card">
            {/* Toolbar */}
            <div className="table-toolbar">
              <div className="filter-buttons">
                <button
                  className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('all')}
                >
                  All Items
                </button>
                <button
                  className={filter === 'low' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('low')}
                >
                  Low Stock
                </button>
                <button
                  className={filter === 'out' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('out')}
                >
                  Out of Stock
                </button>
              </div>
              <div className="toolbar-icons">
                <span>⚙️</span>
                <span>↕️</span>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Barcode</th>
                    <th>Price</th>
                    <th>Stock Qty</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No products found
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className={getRowClass(product)}>
                        <td>
                          <div className="product-name">
                            <span className="product-icon">�</span>
                            {product.name}
                          </div>
                        </td>
                        <td className="barcode-cell">{product.barcode}</td>
                        <td>{formatCurrency(product.price || 0, 'TZS')}</td>
                        <td className="stock-cell">{product.stock_quantity} Units</td>
                        <td>{getStatusBadge(product)}</td>
                        <td className="date-cell">
                          {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div className="action-menu">
                            <button onClick={() => handleEditProduct(product)}>✏️</button>
                            <button onClick={() => handleDeleteProduct(product.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
              </span>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={currentPage === i + 1 ? 'active' : ''}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => { setShowImportModal(false); resetImportState(); }}>
          <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bulk Import Products</h3>
              <button className="modal-close" onClick={() => { setShowImportModal(false); resetImportState(); }}>×</button>
            </div>

            <div className="import-body">
              <div className="import-upload">
                <div>
                  <p className="import-title">Upload CSV or Excel</p>
                  <p className="import-hint">Required columns: Name, Barcode, Price, Stock Quantity.</p>
                  <p className="import-hint">Supported formats: .csv, .xlsx, .xls</p>
                </div>
                <div className="import-upload-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleImportFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  {importFile && <span className="import-file-name">{importFile.name}</span>}
                </div>
              </div>

              {importSummary && (
                <div className="import-summary">
                  <div><strong>File:</strong> {importSummary.fileName}</div>
                  <div className="pill">Total rows: {importSummary.total}</div>
                  <div className="pill success">Ready: {importSummary.ready}</div>
                  <div className="pill warning">Skipped: {importSummary.skipped}</div>
                </div>
              )}

              {parsedProducts.length > 0 && (
                <div className="import-preview">
                  <div className="import-preview-header">Preview ({Math.min(parsedProducts.length, 5)} of {parsedProducts.length})</div>
                  <table className="import-preview-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Barcode</th>
                        <th>Price</th>
                        <th>Stock Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedProducts.slice(0, 5).map((item, index) => (
                        <tr key={`${item.barcode}-${index}`}>
                          <td>{item.name}</td>
                          <td>{item.barcode}</td>
                          <td>{formatCurrency(item.price || 0, 'TZS')}</td>
                          <td>{item.stock_quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedProducts.length > 5 && <p className="import-hint">+ {parsedProducts.length - 5} more rows ready</p>}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => { setShowImportModal(false); resetImportState(); }}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleImportProducts}
                disabled={importing || parsedProducts.length === 0}
              >
                {importing ? 'Importing...' : `Import ${parsedProducts.length || ''} items`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentProduct?.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Barcode</label>
                <input
                  type="text"
                  required
                  value={currentProduct.barcode}
                  onChange={(e) => setCurrentProduct({...currentProduct, barcode: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (TZS)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={currentProduct.stock_quantity}
                    onChange={(e) => setCurrentProduct({...currentProduct, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
