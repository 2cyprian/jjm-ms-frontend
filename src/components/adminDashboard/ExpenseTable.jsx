import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../../css/components/inventory.css';

const ExpenseTable = ({ expenses, categoryNames, onEdit, onDelete, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `Tzs${(amount || 0).toLocaleString()}`;
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="data-table">
        <table>
          <tbody>
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No expenses found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Receipt #</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense.id}>
              <td className="text-sm">{formatDate(expense.expense_date)}</td>
              <td className="text-sm">
                <span className="badge badge-info">
                  {categoryNames[expense.category_id] || 'Unknown'}
                </span>
              </td>
              <td className="text-sm">{expense.description || '-'}</td>
              <td className="text-sm font-semibold">{formatAmount(expense.amount)}</td>
              <td className="text-sm">
                <span className="badge badge-success">
                  {expense.payment_method?.replace('_', ' ').toUpperCase() || 'Cash'}
                </span>
              </td>
              <td className="text-sm text-muted">{expense.receipt_number || '-'}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-icon"
                    onClick={() => onEdit(expense)}
                    disabled={loading}
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => onDelete(expense.id)}
                    disabled={loading}
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
