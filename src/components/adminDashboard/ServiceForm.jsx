import React from 'react';
import { 
  FiX, 
  FiInfo, 
  FiDollarSign, 
  FiTag, 
  FiAlignLeft, 
  FiSettings,
  FiCheckCircle,
  FiSave,
  FiClock,
  FiRefreshCw,
  FiPackage,
  FiGrid,
  FiFileText,
  FiTool,
  FiPrinter,
  FiBox,
  FiTruck,
  FiCpu,
  FiPenTool,
  FiBriefcase,
  FiMoreHorizontal
} from 'react-icons/fi';
import { TfiPalette } from "react-icons/tfi";
import '../../css/components/form.css';

const ServiceForm = ({ currentService, formData, loading, onInputChange, onSubmit, onClose }) => {
  // Category icons mapping
  const getCategoryIcon = (category) => {
    const icons = {
      printing: <FiPrinter size={16} />,
      branding: <TfiPalette size={16} />,
      stationary: <FiFileText size={16} />,
      logistics: <FiTruck size={16} />,
      manufacturing: <FiCpu size={16} />,
      design: <FiPenTool size={16} />,
      consulting: <FiBriefcase size={16} />,
      other: <FiMoreHorizontal size={16} />
    };
    return icons[category] || icons.other;
  };

  // Pricing model icons mapping
  const getPricingIcon = (model) => {
    const icons = {
      fixed: <FiPackage size={16} />,
      per_quantity: <FiTag size={16} />,
      per_area: <FiGrid size={16} />,
      per_hour: <FiClock size={16} />,
      formula: <FiSettings size={16} />
    };
    return icons[model] || icons.fixed;
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <div className="form-modal-header">
          <div>
            <h2 className="form-modal-title">
              {currentService ? 'Edit Service' : 'New Service'}
            </h2>
            <p className="form-modal-subtitle">
              {currentService 
                ? 'Update service details and pricing configuration' 
                : 'Create a new service offering for your customers'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="form-modal-close"
            aria-label="Close form"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-content">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <h3>Basic Information</h3>
            </div>
            
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="name" className="form-label">
                  Service Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={onInputChange}
                  placeholder="e.g., Business Card Printing"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || 'printing'}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="printing">
                    {getCategoryIcon('printing')} Printing
                  </option>
                  <option value="branding">
                    {getCategoryIcon('branding')} Branding
                  </option>
                  <option value="stationary">
                    {getCategoryIcon('stationary')} Stationary
                  </option>
                  <option value="logistics">
                    {getCategoryIcon('logistics')} Logistics
                  </option>
                  <option value="manufacturing">
                    {getCategoryIcon('manufacturing')} Manufacturing
                  </option>
                  <option value="design">
                    {getCategoryIcon('design')} Design
                  </option>
                  <option value="consulting">
                    {getCategoryIcon('consulting')} Consulting
                  </option>
                  <option value="other">
                    {getCategoryIcon('other')} Other
                  </option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={onInputChange}
                placeholder="Describe the service, what it includes, and any special features..."
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="form-section">
            <div className="form-section-header">
              <h3>Pricing Configuration</h3>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="pricing_model" className="form-label">
                  Pricing Model
                </label>
                <select
                  id="pricing_model"
                  name="pricing_model"
                  value={formData.pricing_config?.model || 'fixed'}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="fixed">
                    {getPricingIcon('fixed')} Fixed Package
                  </option>
                  <option value="per_quantity">
                    {getPricingIcon('per_quantity')} Per Quantity
                  </option>
                  <option value="per_area">
                    {getPricingIcon('per_area')} Per Square Foot
                  </option>
                  <option value="per_hour">
                    {getPricingIcon('per_hour')} Per Hour
                  </option>
                  <option value="formula">
                    {getPricingIcon('formula')} Formula Based
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pricing_base_price" className="form-label">
                  Base Price
                </label>
                <div className="form-input-group">
                  <span className="input-prefix">TZS</span>
                  <input
                    id="pricing_base_price"
                    type="number"
                    step="0.01"
                    name="pricing_base_price"
                    value={formData.pricing_config?.base_price || ''}
                    onChange={onInputChange}
                    placeholder="0.00"
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Pricing Options */}
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="min_order" className="form-label">
                  Minimum Order
                </label>
                <input
                  id="min_order"
                  type="number"
                  name="min_order"
                  value={formData.min_order || ''}
                  onChange={onInputChange}
                  placeholder="1"
                  className="form-input"
                  min="1"
                />
              </div>

              <div className="form-field">
                <label htmlFor="turnaround_time" className="form-label">
                  Turnaround Time
                </label>
                <select
                  id="turnaround_time"
                  name="turnaround_time"
                  value={formData.turnaround_time || 'standard'}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="express">⚡ Express (24hrs)</option>
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="economy">Economy (7-10 days)</option>
                  <option value="custom"> Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service Features Section */}
          {/* <div className="form-section">
            <div className="form-section-header">
              <h3>Service Features</h3>
            </div>

            <div className="form-field">
              <label className="form-label">
                Included Features
              </label>
              <div className="features-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="free_delivery"
                    checked={formData.features?.free_delivery || false}
                    onChange={onInputChange}
                  />
                  <span>Free Delivery</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="digital_proof"
                    checked={formData.features?.digital_proof || false}
                    onChange={onInputChange}
                  />
                  <span>Digital Proof</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="custom_design"
                    checked={formData.features?.custom_design || false}
                    onChange={onInputChange}
                  />
                  <span>Custom Design</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="bulk_discount"
                    checked={formData.features?.bulk_discount || false}
                    onChange={onInputChange}
                  />
                  <span>Bulk Discount</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="express_service"
                    checked={formData.features?.express_service || false}
                    onChange={onInputChange}
                  />
                  <span>Express Service</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="free_samples"
                    checked={formData.features?.free_samples || false}
                    onChange={onInputChange}
                  />
                  <span>Free Samples</span>
                </label>
              </div>
            </div>
          </div> */}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              <FiX size={18} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  {currentService ? (
                    <>
                      <FiSave size={18} />
                      Update Service
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={18} />
                      Create Service
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;