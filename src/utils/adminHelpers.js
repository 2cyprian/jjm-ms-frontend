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
