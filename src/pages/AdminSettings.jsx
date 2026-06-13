import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Settings, Printer, Zap, Save, Trash2, Plus, Download, Upload as UploadIcon, List } from 'lucide-react';
import {
  getSettings,
  updateSettings,
  getPrinters,
  addPrinter,
  updatePrinter,
  deletePrinter,
  controlPrinter,
} from '../utils/api';
import { useToast } from '../utils/toast';
import {
  validatePrinter,
  validateSettings,
  exportSettings,
  importSettings,
} from '../utils/adminHelpers';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import PrinterLogsTable from '../components/adminDashboard/PrinterLogsTable';
import PrinterLogsStats from '../components/adminDashboard/PrinterLogsStats';
import '../css/components/admin.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // General & MVP Settings State
  const [settings, setSettings] = useState({
    business_name: '',
    logo_url: '',
    timezone: 'Africa/Nairobi',
    currency: 'TZS',
    // User roles are static for MVP
    printer_server_status: 'Unknown', // Display only
    printer_auto_start: true,
    printer_log_retention_days: 30,
    rental_default_duration_days: 7,
    rental_grace_period_days: 2,
    rental_max_active_per_person: 2,
  });

  // Printers State
  const [printers, setPrinters] = useState([]);
  const [newPrinter, setNewPrinter] = useState({ name: '', ip_address: '', modal: '' });
  const [printerLogs, setPrinterLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPrinter, setLogsPrinter] = useState(null);
  // Logs sorting & pagination state
  const [logsSortField, setLogsSortField] = useState('printed_at');
  const [logsSortDirection, setLogsSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(25);

  const handleSort = (field) => {
    if (logsSortField === field) {
      setLogsSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setLogsSortField(field);
      setLogsSortDirection('asc');
    }
    setLogsPage(1);
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data from backend...');
      const [settingsData, printersData] = await Promise.all([
        getSettings(),
        getPrinters(),
      ]);
      
      setSettings(settingsData);
      setPrinters(printersData);
      
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

  const openPrinterPortal = (ipAddress) => {
    if (!ipAddress) {
      toast.error('No IP address available for this printer');
      return;
    }
    
    // Try both http and https, most printers use http
    const url = ipAddress.startsWith('http') ? ipAddress : `http://${ipAddress}`;
    
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening printer portal at ${ipAddress}`);
    } catch (err) {
      console.error('Failed to open printer portal:', err);
      toast.error('Failed to open printer portal');
    }
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
      
      // Automatically open printer portal after adding
      if (addedPrinter.ip_address) {
        setTimeout(() => {
          openPrinterPortal(addedPrinter.ip_address);
        }, 500);
      }
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



  // Export/Import Handlers
  const handleExportSettings = () => {
    try {
      exportSettings(settings, printers);
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
      
      // Save to backend
      await Promise.all([
        updateSettings(data.settings),
        // Note: You may need to add bulk update endpoints for printers
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
          {['general', 'printers', 'printer-logs'].map((tab) => (
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
              {tab === 'printer-logs' && <List size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>


        {/* General Settings Tab (MVP) */}
        {activeTab === 'general' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Organization Basics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontWeight: 600 }}>System / Business Name</label>
                <input type="text" name="business_name" value={settings.business_name} onChange={handleSettingsChange} placeholder="Business Name" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Logo (for printouts & reports)</label>
                <input type="text" name="logo_url" value={settings.logo_url} onChange={handleSettingsChange} placeholder="Logo URL or upload" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
                {/* TODO: Add upload button if needed */}
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Timezone</label>
                <select name="timezone" value={settings.timezone} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option>
                  <option value="Africa/Kampala">Africa/Kampala</option>
                  <option value="Africa/Lagos">Africa/Lagos</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Default Currency</label>
                <select name="currency" value={settings.currency} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}>
                  <option value="TZS">TZS (Tanzanian Shilling)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="UGX">UGX (Ugandan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            <h2 style={{ color: 'var(--primary)', margin: '2rem 0 1.5rem' }}>User Roles</h2>
            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
              <strong>Roles:</strong> Admin, Staff<br />
              <strong>Permissions:</strong> Admin (everything), Staff (no delete, no overrides)<br />
              <span style={{ color: '#888', fontSize: '0.95rem' }}>Roles are enforced across the app. Avoid complex permission matrices for now.</span>
            </div>

            <h2 style={{ color: 'var(--primary)', margin: '2rem 0 1.5rem' }}>Printer Settings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontWeight: 600 }}>Printer Server Status</label>
                <input type="text" name="printer_server_status" value={settings.printer_server_status} disabled style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', background: '#f5f5f5' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Auto-start Printer Agent</label>
                <select name="printer_auto_start" value={settings.printer_auto_start ? 'true' : 'false'} onChange={e => setSettings(s => ({ ...s, printer_auto_start: e.target.value === 'true' }))} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}>
                  <option value="true">ON</option>
                  <option value="false">OFF</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Print Log Retention (days)</label>
                <input type="number" name="printer_log_retention_days" value={settings.printer_log_retention_days} min={1} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
            </div>

            <h2 style={{ color: 'var(--primary)', margin: '2rem 0 1.5rem' }}>Rental Rules</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontWeight: 600 }}>Default Rental Duration (days)</label>
                <input type="number" name="rental_default_duration_days" value={settings.rental_default_duration_days} min={1} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Grace Period (days)</label>
                <input type="number" name="rental_grace_period_days" value={settings.rental_grace_period_days} min={0} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Max Active Rentals per Person</label>
                <input type="number" name="rental_max_active_per_person" value={settings.rental_max_active_per_person} min={1} onChange={handleSettingsChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          onClick={() => openPrinterPortal(printer.ip_address)}
                          disabled={loading || !printer.ip_address}
                          style={{ 
                            padding: '0.5rem',
                            backgroundColor: '#4CAF50',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Open Printer Portal"
                        >
                          <Printer size={18} />
                        </Button>
                        <Button
                          onClick={() => handleDeletePrinter(printer.id)}
                          disabled={loading}
                          variant="danger"
                          style={{ padding: '0.5rem' }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Printer Logs Tab */}
        {activeTab === 'printer-logs' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Printer Logs</h2>

            {/* Stats Panel */}
            <PrinterLogsStats printersCount={printers.length} logsCount={printerLogs.length} selectedPrinterName={logsPrinter?.name || '-'} />

            {/* Available Printers List with View Logs buttons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>Available Printers</h3>
              {printers.length === 0 ? (
                <p style={{ color: '#999' }}>No printers configured. Add a printer in the Printers tab.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {printers.map((p) => (
                    <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1f2937' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.ip_address}</div>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            setLogsLoading(true);
                            setLogsPrinter(p);
                            const data = await (await import('../utils/api')).getPrinterLogs({ printerId: p.id, printerName: p.name, limit: 200 });
                            // Normalize logs shape as per provided mapping
                            const rows = Array.isArray(data?.logs) ? data.logs : (Array.isArray(data) ? data : []);
                            const normalized = rows.map((row) => {
                              if (Array.isArray(row)) {
                                return {
                                  id: row[0],
                                  printer_name: row[1],
                                  job_name: row[2],
                                  status: row[3],
                                  pages: row[4],
                                  source_machine: row[5],
                                  printed_at: row[6],
                                  received_at: row[7],
                                };
                              }
                              return row;
                            });
                            setPrinterLogs(normalized);
                          } catch (e) {
                            console.error('Failed to load printer logs', e);
                            (await import('../utils/toast')).useToast().error('Failed to load printer logs');
                          } finally {
                            setLogsLoading(false);
                          }
                        }}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        View Logs
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logs Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{logsPrinter ? `Logs: ${logsPrinter.name}` : 'Logs'}</h3>
                <div>
                  <Button
                    onClick={async () => {
                      if (!logsPrinter) return;
                      try {
                        setLogsLoading(true);
                        const data = await (await import('../utils/api')).getPrinterLogs({ printerId: logsPrinter.id, printerName: logsPrinter.name, limit: 200 });
                        const rows = Array.isArray(data?.logs) ? data.logs : (Array.isArray(data) ? data : []);
                        const normalized = rows.map((row) => {
                          if (Array.isArray(row)) {
                            return {
                              id: row[0],
                              printer_name: row[1],
                              job_name: row[2],
                              status: row[3],
                              pages: row[4],
                              source_machine: row[5],
                              printed_at: row[6],
                              received_at: row[7],
                            };
                          }
                          return row;
                        });
                        setPrinterLogs(normalized);
                      } catch (e) {
                        console.error('Failed to refresh logs', e);
                        (await import('../utils/toast')).useToast().error('Failed to refresh logs');
                      } finally {
                        setLogsLoading(false);
                      }
                    }}
                    disabled={!logsPrinter || logsLoading}
                    variant="secondary"
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              <PrinterLogsTable
                logs={printerLogs}
                loading={logsLoading}
                sortField={logsSortField}
                sortDirection={logsSortDirection}
                onSort={handleSort}
                page={logsPage}
                pageSize={logsPageSize}
                onPageChange={(newPage) => setLogsPage(newPage)}
                onPageSizeChange={(size) => { setLogsPageSize(size); setLogsPage(1); }}
              />
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
