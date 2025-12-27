import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Settings, Printer, Zap, Save, Trash2, Plus, Download, Upload as UploadIcon } from 'lucide-react';
import {
  getSettings,
  updateSettings,
  getPrinters,
  addPrinter,
  updatePrinter,
  deletePrinter,
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  controlPrinter,
} from '../utils/api';
import { useToast } from '../utils/toast';
import {
  validatePrinter,
  validateRecipe,
  validateSettings,
  exportSettings,
  importSettings,
  formatRecipeType
} from '../utils/adminHelpers';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import '../css/components/admin.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [watchdogStatus, setWatchdogStatus] = useState(null);
  const toast = useToast();

  // General Settings State
  const [settings, setSettings] = useState({
    price_bw_a4: 0.05,
    price_color_a4: 0.15,
    price_bw_a3: 0.08,
    price_color_a3: 0.25,
  });

  // Printers State
  const [printers, setPrinters] = useState([]);
  const [newPrinter, setNewPrinter] = useState({ name: '', ip_address: '', modal: '' });

  // Recipes State
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    service_type: '',
    raw_material_id: '',
    amount: 0,
  });

  // Load data on mount
  useEffect(() => {
    // Auto-load now that backend supports GET
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data from backend...');
      const [settingsData, printersData, recipesData] = await Promise.all([
        getSettings(),
        getPrinters(),
        getRecipes(),
      ]);
      
      setSettings(settingsData);
      setPrinters(printersData);
      setRecipes(recipesData);
      
      // Check watchdog status
      await checkWatchdogStatus();
      
      toast.success('Admin data loaded!');
    } catch (err) {
      console.error('Error loading data:', err);
      console.error('Failed URL:', err.config?.url);
      console.error('Method:', err.config?.method);
      toast.error(`Error: ${err.response?.status} - ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeWatchdogStatus = (res) => {
    const asString = (value) =>
      value === undefined || value === null ? '' : String(value).toLowerCase();

    const statusValue =
      typeof res === 'string'
        ? res
        : res?.status || res?.state || res?.message || res?.detail || res?.running;

    const running =
      res?.running === true ||
      res?.running === 'true' ||
      asString(statusValue).includes('run');

    const message =
      typeof res === 'string'
        ? res
        : res?.message || res?.detail || statusValue || '';

    return { running: Boolean(running), message };
  };

  // Printer Watchdog Control
  const checkWatchdogStatus = async () => {
    try {
      const response = await controlPrinter('status');
      setWatchdogStatus(normalizeWatchdogStatus(response));
    } catch (err) {
      console.error('Failed to check watchdog status:', err);
      setWatchdogStatus({ running: false, message: err.response?.data?.message || 'Unavailable' });
    }
  };

  const handleStartWatchdog = async () => {
    setLoading(true);
    try {
      const response = await controlPrinter('start');
      setWatchdogStatus(normalizeWatchdogStatus(response));
      toast.success('Printer watchdog started successfully!');
    } catch (err) {
      console.error('Failed to start watchdog:', err);
      toast.error(err.response?.data?.message || 'Failed to start printer watchdog.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopWatchdog = async () => {
    setLoading(true);
    try {
      const response = await controlPrinter('stop');
      setWatchdogStatus(normalizeWatchdogStatus(response));
      toast.success('Printer watchdog stopped successfully!');
    } catch (err) {
      console.error('Failed to stop watchdog:', err);
      toast.error(err.response?.data?.message || 'Failed to stop printer watchdog.');
    } finally {
      setLoading(false);
    }
  };

  // General Settings Handlers
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    // Keep raw input to avoid flicker when typing; parse on save
    setSettings({ ...settings, [name]: value });
  };

  const handleSaveSettings = async () => {
    // Normalize numeric values before validation and saving
    const normalized = Object.fromEntries(
      Object.entries(settings).map(([key, val]) => [
        key,
        typeof val === 'string' ? (val.trim() === '' ? 0 : parseFloat(val)) : val
      ])
    );

    const validation = validateSettings(normalized);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      await updateSettings(normalized);
      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Printers Handlers
  const handlePrinterChange = (e) => {
    const { name, value } = e.target;
    setNewPrinter({ ...newPrinter, [name]: value });
  };

  const handleAddPrinter = async () => {
    const validation = validatePrinter(newPrinter);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.warning(error));
      return;
    }

    setLoading(true);
    try {
      const addedPrinter = await addPrinter(newPrinter);
      setPrinters([...printers, addedPrinter]);
      setNewPrinter({ name: '', ip_address: '', modal: '' });
      toast.success('Printer added successfully!');
    } catch (err) {
      console.error('Failed to add printer:', err);
      
      // Extract validation errors from 422 response
      if (err.response?.status === 422 && err.response?.data) {
        const errorData = err.response.data;
        
        // Handle field-level validation errors
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          Object.entries(errorData).forEach(([field, messages]) => {
            const errorMsg = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${errorMsg}`);
          });
        } else if (Array.isArray(errorData)) {
          errorData.forEach(err => toast.error(err.message || err));
        } else if (typeof errorData === 'string') {
          toast.error(errorData);
        }
      } else {
        toast.error(err.message || 'Failed to add printer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrinter = async (id) => {
    setLoading(true);
    try {
      await deletePrinter(id);
      setPrinters(printers.filter(p => p.id !== id));
      toast.success('Printer deleted successfully');
    } catch (err) {
      console.error('Failed to delete printer:', err);
      toast.error(err.message || 'Failed to delete printer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Recipes Handlers
  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe({ 
      ...newRecipe, 
      [name]: name === 'amount' || name === 'raw_material_id' ? (value ? Number(value) : '') : value 
    });
  };

  const handleAddRecipe = async () => {
    const validation = validateRecipe(newRecipe);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.warning(error));
      return;
    }

    setLoading(true);
    try {
      const addedRecipe = await addRecipe(newRecipe);
      setRecipes([...recipes, addedRecipe]);
      setNewRecipe({ service_type: '', raw_material_id: '', amount: 0 });
      toast.success('Recipe added successfully!');
    } catch (err) {
      console.error('Failed to add recipe:', err);
      toast.error(err.message || 'Failed to add recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setLoading(true);
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(r => r.id !== id));
        toast.success('Recipe deleted successfully');
      } catch (err) {
        console.error('Failed to delete recipe:', err);
        toast.error(err.message || 'Failed to delete recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export/Import Handlers
  const handleExportSettings = () => {
    try {
      exportSettings(settings, printers, recipes);
      toast.success('Settings exported successfully!');
    } catch (err) {
      toast.error('Failed to export settings');
      console.error(err);
    }
  };

  const handleImportSettings = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await importSettings(file);
      
      // Update all settings
      setSettings(data.settings);
      setPrinters(data.printers);
      setRecipes(data.recipes);
      
      // Save to backend
      await Promise.all([
        updateSettings(data.settings),
        // Note: You may need to add bulk update endpoints for printers and recipes
      ]);
      
      toast.success('Settings imported successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to import settings');
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <div style={{ backgroundColor: '#f4f7f6', padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Settings size={32} color="var(--primary)" />
            <h1 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>
              Admin Control Center
            </h1>
          </div>
          
          {/* Export/Import Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={handleExportSettings}
              variant="secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            >
              <Download size={18} />
              Export
            </Button>
            <label style={{ display: 'inline-block' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                style={{ display: 'none' }}
              />
              <Button
                as="span"
                variant="secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                <UploadIcon size={18} />
                Import
              </Button>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #ddd',
          flexWrap: 'wrap'
        }}>
          {['general', 'printers', 'recipes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab ? '700' : '600',
                color: activeTab === tab ? 'var(--primary)' : '#666',
                borderBottom: activeTab === tab ? '3px solid var(--primary)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {tab === 'general' && <Settings size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
              {tab === 'printers' && <Printer size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
              {tab === 'recipes' && <Zap size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Pricing Configuration</h2>
            <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#666' }}>
              Set per-page prices in TZS for A4 and A3 printing (B&W and Color). These values are used by the Staff Dashboard.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {Object.entries(settings).map(([key, value]) => (
                <div key={key}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#333',
                    textTransform: 'capitalize'
                  }}>
                    {key.replace(/_/g, ' ')} (TZS per page)
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleSettingsChange}
                    step="0.01"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              Save Settings
            </Button>
          </div>
        )}

        {/* Printers Tab */}
        {activeTab === 'printers' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Manage Printers</h2>

            {/* Printer Watchdog Control */}
            <div style={{
              backgroundColor: watchdogStatus?.running ? '#e8f5e9' : '#fff3e0',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: `2px solid ${watchdogStatus?.running ? '#4caf50' : '#ff9800'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Printer size={20} />
                    Printer Watchdog Service
                  </h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    Status: <strong style={{ color: watchdogStatus?.running ? '#4caf50' : '#ff9800' }}>
                      {watchdogStatus?.running ? 'Running' : 'Stopped'}
                    </strong>
                    {watchdogStatus?.message && <span> - {watchdogStatus.message}</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    onClick={handleStartWatchdog}
                    disabled={loading || watchdogStatus?.running}
                    variant="success"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Zap size={18} />
                    Start
                  </Button>
                  <Button
                    onClick={handleStopWatchdog}
                    disabled={loading || !watchdogStatus?.running}
                    variant="danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={18} />
                    Stop
                  </Button>
                  <Button
                    onClick={checkWatchdogStatus}
                    disabled={loading}
                    variant="secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Settings size={18} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Add New Printer */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '2px dashed var(--accent)'
            }}>
              <h3 style={{ color: '#333', marginTop: 0 }}>Add New Printer</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Printer Name"
                  value={newPrinter.name}
                  onChange={handlePrinterChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="text"
                  name="ip_address"
                  placeholder="IP Address"
                  value={newPrinter.ip_address}
                  onChange={handlePrinterChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="text"
                  name="modal"
                  placeholder="Modal (Optional)"
                  value={newPrinter.modal}
                  onChange={handlePrinterChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <Button
                onClick={handleAddPrinter}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} />
                Add Printer
              </Button>
            </div>

            {/* Printers List */}
            <div>
              <h3 style={{ color: '#333' }}>Connected Printers</h3>
              {printers.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No printers configured yet.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {printers.map((printer) => (
                    <div
                      key={printer.id}
                      style={{
                        backgroundColor: '#f9f9f9',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ margin: '0.25rem 0', fontWeight: '600', color: 'var(--primary)' }}>
                          {printer.name}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          {printer.ip_address}
                        </p>
                        {printer.modal && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#999' }}>
                            {printer.modal}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeletePrinter(printer.id)}
                        disabled={loading}
                        variant="danger"
                        style={{ padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Inventory Recipes</h2>

            {/* Add New Recipe */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '2px dashed var(--accent)'
            }}>
              <h3 style={{ color: '#333', marginTop: 0 }}>Add New Recipe</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="text"
                  name="service_type"
                  placeholder="Service Type"
                  value={newRecipe.service_type}
                  onChange={handleRecipeChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    gridColumn: '1 / -1'
                  }}
                />
                <input
                  type="number"
                  name="raw_material_id"
                  placeholder="Raw Material ID"
                  value={newRecipe.raw_material_id}
                  onChange={handleRecipeChange}
                  min="0"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={newRecipe.amount}
                  onChange={handleRecipeChange}
                  step="0.01"
                  min="0"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <Button
                onClick={handleAddRecipe}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} />
                Add Recipe
              </Button>
            </div>

            {/* Recipes List */}
            <div>
              <h3 style={{ color: '#333' }}>Configured Recipes</h3>
              {recipes.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No recipes configured yet.</p>
              ) : (
                <div style={{
                  overflowX: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Service Type</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Raw Material ID</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Amount</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((recipe) => (
                        <tr
                          key={recipe.id}
                          style={{
                            borderBottom: '1px solid #ddd',
                            backgroundColor: recipe.id % 2 === 0 ? '#f9f9f9' : 'white'
                          }}
                        >
                          <td style={{ padding: '1rem' }}>{recipe.service_type}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {recipe.raw_material_id}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {recipe.amount}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <Button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              disabled={loading}
                              variant="danger"
                              style={{ padding: '0.5rem' }}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
