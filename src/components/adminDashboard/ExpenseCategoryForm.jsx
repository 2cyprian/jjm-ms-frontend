import React from 'react';
import { FiX, FiTag, FiFileText, FiCheckCircle, FiLoader } from 'react-icons/fi';
import '../../css/components/expenseCategories.css';

const ExpenseCategoryForm = ({
  currentCategory,
  formData,
  loading,
  onInputChange,
  onSubmit,
  onClose
}) => {
  const title = currentCategory ? 'Edit Expense Category' : 'Create New Category';
  const subtitle = currentCategory ? `Editing: ${currentCategory.name}` : 'Add a new expense category to organize your finances';

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-form-modal" onClick={e => e.stopPropagation()}>
        <div className="expense-modal-header">
          <div>
            <h2>{title}</h2>
            <p className="expense-modal-subtitle">{subtitle}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" title="Close">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="expense-form-content">
          {/* Category Name Section */}
          <div className="form-section">
            <div className="section-title">
              <FiTag size={18} />
              <h3>Basic Information</h3>
            </div>
            <div className="form-group">
              <label className="form-label">
                Category Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="e.g., Electricity, Office Supplies, Travel..."
                className="form-input"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="form-section">
            <div className="section-title">
              <FiFileText size={18} />
              <h3>Additional Details</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Describe what expenses belong to this category..."
                className="form-textarea"
                disabled={loading}
                rows="4"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader size={16} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} />
                  {currentCategory ? 'Update' : 'Create'} Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseCategoryForm;
