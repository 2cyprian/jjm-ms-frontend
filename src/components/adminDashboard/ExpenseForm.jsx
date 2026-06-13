import React from 'react';
import '../../css/components/form.css';
import { FiX, FiTag, FiFileText, FiCalendar, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { FaReceipt } from 'react-icons/fa';

const ExpenseForm = ({
  currentExpense,
  formData,
  loading,
  categories,
  onInputChange,
  onSubmit,
  onClose
}) => {
  const title = currentExpense ? 'Edit Expense' : 'New Expense';
  const subtitle = currentExpense ? `${currentExpense.description || 'Expense'}` : 'Add a new expense entry';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-modal-header">
          <div>
            <h2>{title}</h2>
            <p className="text-muted">{subtitle}</p>
          </div>
          <button className="btn-close" onClick={onClose} type="button">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-content">
          {/* Category & Amount */}
          <div className="form-section">
            <div className="form-section-header">
              <FiTag size={18} />
              <h3>Details</h3>
            </div>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={onInputChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Amount (Tzs) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={onInputChange}
                  placeholder="0"
                  className="form-input"
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Description & Date */}
          <div className="form-section">
            <div className="form-section-header">
              <FiFileText size={18} />
              <h3>Information</h3>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="What was this expense for?"
                className="form-textarea"
                disabled={loading}
                rows="3"
              />
            </div>
          </div>

          {/* Date & Payment */}
          <div className="form-section">
            <div className="form-section-header">
              <FiCalendar size={18} />
              <h3>Payment</h3>
            </div>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Expense Date *</label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={onInputChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={onInputChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Number */}
          <div className="form-section">
            <div className="form-section-header">
              <FaReceipt size={18} />
              <h3>Receipt</h3>
            </div>
            <div>
              <label className="form-label">Receipt Number</label>
              <input
                type="text"
                name="receipt_number"
                value={formData.receipt_number}
                onChange={onInputChange}
                placeholder="e.g., REC-20260521-001"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            onClick={onSubmit}
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
                {currentExpense ? 'Update' : 'Create'} Expense
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
