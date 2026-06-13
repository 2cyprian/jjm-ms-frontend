import React from 'react';
import { FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../../css/components/expenseCategories.css';

const ExpenseCategoryList = ({ categories, onEdit, onDelete, loading }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="expense-categories-card">
        <div className="categories-empty">
          <FiTag size={64} className="empty-icon" />
          <h3 className="empty-title">No Categories Found</h3>
          <p className="empty-message">Create your first expense category to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-categories-card">
      <table className="categories-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>
                <div className="category-name">
                  <div className="category-icon">
                    <FiTag size={18} />
                  </div>
                  <span>{category.name}</span>
                </div>
              </td>
              <td>
                <div className="category-description">{category.description || '-'}</div>
              </td>
              <td>
                <span className={`category-badge ${category.is_active ? 'active' : 'inactive'}`}>
                  {category.is_active ? '✓ Active' : '○ Inactive'}
                </span>
              </td>
              <td>
                <div className="category-actions">
                  <button
                    className="action-button"
                    onClick={() => onEdit(category)}
                    disabled={loading}
                    title="Edit category"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => onDelete(category.id)}
                    disabled={loading}
                    title="Delete category"
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

export default ExpenseCategoryList;
