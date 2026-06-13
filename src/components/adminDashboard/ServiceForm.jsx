import React from 'react';
import '../../css/components/form.css';

const ServiceForm = ({ currentService, formData, loading, onInputChange, onSubmit, onClose }) => {
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
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-content">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="material-symbols-outlined section-icon">info</span>
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
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="e.g., Business Card Printing"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="printing">Printing</option>
                  <option value="branding">Branding</option>
                  <option value="stationary">Stationary</option>
                  <option value="logistics">Logistics</option>
                  <option value="manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
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
              <span className="material-symbols-outlined section-icon">payments</span>
              <h3>Pricing Configuration</h3>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="pricing_model" className="form-label">Pricing Model</label>
                <select
                  id="pricing_model"
                  name="pricing_model"
                  value={formData.pricing_config.model}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="fixed">Fixed Package</option>
                  <option value="per_quantity">Per Quantity</option>
                  <option value="per_area">Per Square Foot</option>
                  <option value="formula">Formula Based</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="pricing_base_price" className="form-label">Base Price</label>
                <div className="form-input-group">
                  <span className="input-prefix">Tzs</span>
                  <input
                    id="pricing_base_price"
                    type="number"
                    step="0.01"
                    name="pricing_base_price"
                    value={isNaN(formData.pricing_config.base_price) ? '' : formData.pricing_config.base_price}
                    onChange={onInputChange}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined spin">hourglass_top</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  {currentService ? 'Update Service' : 'Create Service'}
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
