import React, { useState, useEffect } from 'react';
import { FiTag, FiSearch } from 'react-icons/fi';
import { IoReceipt } from 'react-icons/io5';  
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import ExpenseTable from '../components/adminDashboard/ExpenseTable';
import ExpenseForm from '../components/adminDashboard/ExpenseForm';
import ExpenseCategories from '../components/adminDashboard/ExpenseCategories';
import { getExpenses, getExpenseCategories, createExpense, updateExpense, deleteExpense } from '../utils/api';
import { useToast } from '../utils/toast';
import '../css/components/inventory.css';

const AdminExpenses = () => {
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'categories'
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    payment_method: 'cash'
  });
  const toast = useToast();

  // Load expenses and categories
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
      console.log('Loaded expenses:', data);
    } catch (err) {
      console.error('Error loading expenses:', err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(Array.isArray(data) ? data : []);
      console.log('Loaded categories:', data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleAddExpense = () => {
    setCurrentExpense(null);
    setFormData({
      category_id: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      payment_method: 'cash'
    });
    setShowModal(true);
  };

  const handleEditExpense = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      category_id: expense.category_id,
      amount: expense.amount,
      description: expense.description || '',
      expense_date: expense.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      receipt_number: expense.receipt_number || '',
      payment_method: expense.payment_method || 'cash'
    });
    setShowModal(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        category_id: formData.category_id,
        amount: parseInt(formData.amount),
        description: formData.description,
        expense_date: `${formData.expense_date}T00:00:00`,
        receipt_number: formData.receipt_number || null,
        payment_method: formData.payment_method
      };

      if (currentExpense?.id) {
        await updateExpense(currentExpense.id, submitData);
        toast.success('Expense updated successfully');
      } else {
        await createExpense(submitData);
        toast.success('Expense created successfully');
      }

      setShowModal(false);
      await loadExpenses();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save expense';
      toast.error(msg);
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setLoading(true);
    try {
      await deleteExpense(expenseId);
      toast.success('Expense deleted successfully');
      await loadExpenses();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to delete expense';
      toast.error(msg);
      console.error('Error deleting expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category_id === filterCategory;
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryOptions = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  if (loading && expenses.length === 0 && activeTab === 'expenses') {
    return <div className="flex items-center justify-center h-screen">Loading expenses...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {/* Tabs */}
        <div className="tab-bar" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          <button
            className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
            variant="primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderTop: 'none',
              borderRight: 'none',
              borderLeft: 'none',
              borderBottom: activeTab === 'expenses' ? '2px solid var(--primary)' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'expenses' ? '600' : '500',
              color: activeTab === 'expenses' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.3s ease'
            }}
          >
            <IoReceipt size={18} />
            Expenses
          </button>
          <button
            className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
            variant="primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderTop: 'none',
              borderRight: 'none',
              borderLeft: 'none',
              borderBottom: activeTab === 'categories' ? '2px solid var(--primary)' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'categories' ? '600' : '500',
              color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.3s ease'
            }}
          >
            <FiTag size={18} />
            Categories
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <>
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-left">
                <h2>Expenses</h2>
                <div className="subtitle">Track and manage business expenses</div>
              </div>
              <div className="header-actions">
                <div className="search-box">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '14px' }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Button 
                  variant="primary" 
                  onClick={handleAddExpense} 
                  icon="add"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  New Expense
                </Button>
              </div>
            </div>

            {/* Table */}
            <ExpenseTable
              expenses={filteredExpenses}
              categoryNames={categoryOptions}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              loading={loading}
            />
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <ExpenseCategories onCategoriesChange={loadCategories} />
        )}
      </main>

      {/* Expense Form Modal */}
      {showModal && (
        <ExpenseForm
          currentExpense={currentExpense}
          formData={formData}
          loading={loading}
          categories={categories}
          onInputChange={handleInputChange}
          onSubmit={handleSaveExpense}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AdminExpenses;
