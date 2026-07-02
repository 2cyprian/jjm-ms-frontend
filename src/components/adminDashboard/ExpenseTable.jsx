import React from 'react';
import { 
  FiEdit2, 
  FiTrash2, 
  FiCalendar, 
  FiTag, 
  FiFileText, 
  FiDollarSign, 
  FiCreditCard,
  FiMoreVertical
} from 'react-icons/fi';
import { TfiReceipt } from "react-icons/tfi";
import '../../css/components/inventory.css';
import '../../css/components/expenseTable.css';

const ExpenseTable = ({ expenses, categoryNames, onEdit, onDelete, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '-';
    }
  };

  const formatAmount = (amount) => {
    return `TZS ${(amount || 0).toLocaleString()}`;
  };

  // Get payment method icon and color
  const getPaymentMethodIcon = (method) => {
    const methods = {
      cash: { icon: FiDollarSign, color: '#22c55e', label: 'Cash' },
      card: { icon: FiCreditCard, color: '#3b82f6', label: 'Card' },
      bank: { icon: FiCreditCard, color: '#8b5cf6', label: 'Bank' },
      mobile_money: { icon: FiCreditCard, color: '#f59e0b', label: 'Mobile Money' },
      cheque: { icon: FiFileText, color: '#ef4444', label: 'Cheque' }
    };
    
    const key = method?.toLowerCase() || 'cash';
    return methods[key] || methods.cash;
  };

  const getCategoryColor = (categoryId) => {
    const colors = [
      '#4f46e5', '#7c3aed', '#ec4899', '#ef4444', 
      '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6'
    ];
    const index = (categoryId || 0) % colors.length;
    return colors[index];
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="expense-table-empty">
        <div className="empty-state">
          <FiFileText size={48} color="#d1d5db" />
          <h3 style={{ marginTop: '1rem', color: '#6b7280' }}>No Expenses Found</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            No expenses have been recorded for this period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-table-wrapper">
      <div className="expense-table-header">
        <div className="table-title">
          <FiFileText size={20} />
          <span>Expense Transactions</span>
        </div>
        <div className="table-stats">
          <span className="stat-badge">
            Total: {expenses.length} entries
          </span>
        </div>
      </div>
      
      <div className="expense-table-container">
        <table className="expense-table">
          <thead>
            <tr>
              <th>
                <div className="th-content">
                  <FiCalendar size={14} />
                  <span>Date</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <FiTag size={14} />
                  <span>Category</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <FiFileText size={14} />
                  <span>Description</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <FiDollarSign size={14} />
                  <span>Amount</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <FiCreditCard size={14} />
                  <span>Payment</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <TfiReceipt size={14} />
                  <span>Receipt #</span>
                </div>
              </th>
              <th className="actions-header">
                <FiMoreVertical size={14} />
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => {
              const paymentMethod = getPaymentMethodIcon(expense.payment_method);
              const PaymentIcon = paymentMethod.icon;
              const categoryColor = getCategoryColor(expense.category_id);
              
              return (
                <tr key={expense.id || index} className="expense-row">
                  <td>
                    <div className="date-cell">
                      <FiCalendar size={14} color="#6b7280" />
                      <span>{formatDate(expense.expense_date)}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="category-badge"
                      style={{ 
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                        border: `1px solid ${categoryColor}30`
                      }}
                    >
                      {categoryNames[expense.category_id] || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <div className="description-cell">
                      <span>{expense.description || '-'}</span>
                      {expense.notes && (
                        <span className="notes-preview">
                          {expense.notes.length > 50 
                            ? `${expense.notes.substring(0, 50)}...` 
                            : expense.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="amount-cell">
                      {formatAmount(expense.amount)}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="payment-badge"
                      style={{ 
                        backgroundColor: `${paymentMethod.color}15`,
                        color: paymentMethod.color,
                        border: `1px solid ${paymentMethod.color}30`
                      }}
                    >
                      <PaymentIcon size={12} />
                      <span>{paymentMethod.label}</span>
                    </span>
                  </td>
                  <td>
                    <span className="receipt-cell">
                      {expense.receipt_number || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit-btn"
                        onClick={() => onEdit(expense)}
                        disabled={loading}
                        title="Edit Expense"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => onDelete(expense.id || expense.expense_id)}
                        disabled={loading}
                        title="Delete Expense"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;