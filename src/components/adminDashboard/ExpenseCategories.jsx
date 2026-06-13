import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import ExpenseCategoryForm from './ExpenseCategoryForm';
import ExpenseCategoryList from './ExpenseCategoryList';
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../../utils/api';
import { useToast } from '../../utils/toast';
import '../../css/components/expenseCategories.css';

const ExpenseCategories = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenseCategories();
      setCategories(Array.isArray(data) ? data : []);
      onCategoriesChange?.();
    } catch (err) {
      console.error('Error loading categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      if (currentCategory?.id) {
        await updateExpenseCategory(currentCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await createExpenseCategory(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure? Expenses with this category will need to be updated.')) return;

    setLoading(true);
    try {
      await deleteExpenseCategory(categoryId);
      toast.success('Category deleted successfully');
      await loadCategories();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to delete category';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="expense-header">
        <div className="expense-header-left">
          <h2>Expense Categories</h2>
          <p className="expense-header-subtitle">Manage your expense categories efficiently</p>
        </div>
        <div className="expense-header-actions">
          <div className="expense-search-box">
            <FiSearch className="expense-search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-new-category" onClick={handleAddCategory} disabled={loading}>
            <FiPlus />
            New Category
          </button>
        </div>
      </div>

      {/* List */}
      <ExpenseCategoryList
        categories={filteredCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        loading={loading}
      />

      {/* Form Modal */}
      {showModal && (
        <ExpenseCategoryForm
          currentCategory={currentCategory}
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSaveCategory}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ExpenseCategories;
