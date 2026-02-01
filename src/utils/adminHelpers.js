// Admin utility functions for validation and helpers

/**
 * Validate printer data before submission
 */
export const validatePrinter = (printer) => {
  const errors = [];
  
  if (!printer.name || printer.name.trim() === '') {
    errors.push('Printer name is required');
  }
  
  if (!printer.ip_address || printer.ip_address.trim() === '') {
    errors.push('IP address is required');
  } else if (!isValidIP(printer.ip_address)) {
    errors.push('Invalid IP address format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate IP address format
 */
export const isValidIP = (ip) => {
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipPattern.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

/**
 * Validate recipe data before submission
 */
export const validateRecipe = (recipe) => {
  const errors = [];
  
  if (!recipe.name || recipe.name.trim() === '') {
    errors.push('Recipe name is required');
  }
  
  if (recipe.paper_usage < 0) {
    errors.push('Paper usage must be a positive number');
  }
  
  if (recipe.ink_usage < 0) {
    errors.push('Ink usage must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate settings data before submission
 */
export const validateSettings = (settings) => {
  const errors = [];
  
  Object.entries(settings).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`${key.replace(/_/g, ' ')} must be a positive number`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'TZS') => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format a YYYY-MM-DD string into a short label (e.g., Jan 15)
export const formatDayLabel = (dateStr, locale = 'en-US') => {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
};

/**
 * Format recipe type for display
 */
export const formatRecipeType = (type) => {
  const typeMap = {
    'COLOR_PRINT': 'Color Print',
    'BW_PRINT': 'B&W Print',
    'COPY': 'Copy',
    'SCAN': 'Scan'
  };
  return typeMap[type] || type;
};

/**
 * Calculate total cost based on recipe
 */
export const calculateRecipeCost = (recipe, settings) => {
  // This is a basic calculation - adjust based on your business logic
  const paperCost = recipe.paper_usage * 10; // Assuming 10 TZS per sheet
  const inkCost = recipe.ink_usage * 100; // Assuming 100 TZS per unit
  return paperCost + inkCost;
};

/**
 * Generate printer status badge color
 */
export const getPrinterStatusColor = (status) => {
  const statusColors = {
    'online': '#10b981',
    'offline': '#ef4444',
    'busy': '#f59e0b',
    'idle': '#3b82f6'
  };
  return statusColors[status] || '#999';
};

/**
 * Sort printers by name
 */
export const sortPrinters = (printers, order = 'asc') => {
  return [...printers].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Sort recipes by type or name
 */
export const sortRecipes = (recipes, sortBy = 'name', order = 'asc') => {
  return [...recipes].sort((a, b) => {
    const comparison = a[sortBy].toString().localeCompare(b[sortBy].toString());
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Filter recipes by type
 */
export const filterRecipesByType = (recipes, type) => {
  if (!type || type === 'all') return recipes;
  return recipes.filter(recipe => recipe.type === type);
};

/**
 * Export settings to JSON file
 */
export const exportSettings = (settings, printers, recipes) => {
  const data = {
    settings,
    printers,
    recipes,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `admin-settings-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import settings from JSON file
 */
export const importSettings = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.settings || !data.printers || !data.recipes) {
          reject(new Error('Invalid settings file format'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse settings file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Check if admin has unsaved changes
 */
export const hasUnsavedChanges = (original, current) => {
  return JSON.stringify(original) !== JSON.stringify(current);
};

/**
 * Generate unique printer ID
 */
export const generatePrinterId = () => {
  return `printer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique recipe ID
 */
export const generateRecipeId = () => {
  return `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Printer Logs helpers for modularized table
 */
export const getLogStatusStyle = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PRINTED') return { bg: '#bbf7d0', color: '#065f46' };
  if (s === 'FAILED') return { bg: '#fecaca', color: '#991b1b' };
  if (s === 'CANCELED' || s === 'CANCELLED') return { bg: '#fde68a', color: '#92400e' };
  return { bg: '#e5e7eb', color: '#374151' };
};

export const logStatusOrder = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PRINTED') return 1;
  if (s === 'FAILED') return 2;
  if (s === 'CANCELED' || s === 'CANCELLED') return 3;
  return 4;
};

export const parseIntSafe = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

export const toTimestamp = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d.getTime() : 0;
};

export const sortPrinterLogs = (logs = [], sortField = 'printed_at', direction = 'desc') => {
  const dir = direction === 'asc' ? 1 : -1;
  const af = (sortField || '').toLowerCase();
  return [...logs].sort((a, b) => {
    switch (af) {
      case 'id':
        return dir * (parseIntSafe(a.id) - parseIntSafe(b.id));
      case 'printer_name':
        return dir * String(a.printer_name || '').localeCompare(String(b.printer_name || ''));
      case 'job_name':
        return dir * String(a.job_name || '').localeCompare(String(b.job_name || ''));
      case 'status':
        return dir * (logStatusOrder(a.status) - logStatusOrder(b.status));
      case 'pages':
        return dir * (parseIntSafe(a.pages) - parseIntSafe(b.pages));
      case 'source_machine':
        return dir * String(a.source_machine || '').localeCompare(String(b.source_machine || ''));
      case 'sent':
        return dir * ((!!a.received_at === !!b.received_at) ? 0 : (!!a.received_at ? 1 : -1));
      case 'printed_at':
      case 'date':
        return dir * (toTimestamp(a.printed_at) - toTimestamp(b.printed_at));
      default:
        return 0;
    }
  });
};

export const paginateItems = (items = [], page = 1, pageSize = 25) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    total,
    totalPages,
    pageItems: items.slice(start, start + pageSize),
  };
};

export const getSortIndicator = (field, activeField, direction) => {
  if (activeField !== field) return '';
  return direction === 'asc' ? ' ▲' : ' ▼';
};

export const formatDateTime = (value, locale = 'en-US') => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(d);
};

/**
 * Format number with comma separators for money display
 * e.g., 1000000 -> 1,000,000
 */
export const formatMoneyInput = (value) => {
  if (!value && value !== 0) return '';
  const num = String(value).replace(/[^0-9.-]/g, '');
  const parts = num.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/**
 * Parse money input with commas back to plain number
 * e.g., 1,000,000 -> 1000000
 */
export const parseMoneyInput = (value) => {
  if (!value && value !== 0) return '';
  return String(value).replace(/,/g, '');
};
