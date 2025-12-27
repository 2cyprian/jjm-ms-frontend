import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBranches, createBranch, updateBranch, deleteBranch, getStaff, createStaff, updateStaff, deleteStaff } from '../utils/api';
import { useToast } from '../utils/toast';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import '../css/components/branch.css';

const BranchManagement = () => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      return {};
    }
  }, []);

  const userRole = (currentUser?.role || currentUser?.user_type || '').toString().toUpperCase();
  const isStaffUser = userRole === 'STAFF';

  useEffect(() => {
    if (isStaffUser) {
      navigate('/staff', { replace: true });
    }
  }, [isStaffUser, navigate]);

  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('branches');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!isStaffUser) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchData, staffData] = await Promise.all([
        getBranches(),
        getStaff()
      ]);
      console.log('Branch data received:', branchData);
      console.log('Staff data received:', staffData);
      console.log('Staff with branches:', staffData.map(s => ({ name: s.name, branch_id: s.branch_id })));
      setBranches(Array.isArray(branchData) ? branchData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Branch Handlers
  const handleAddBranch = () => {
    setCurrentBranch({
      name: '',
      location: '',
      phone: '',
      is_active: true
    });
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch) => {
    setCurrentBranch(branch);
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: currentBranch.name,
        location: currentBranch.location,
        phone: currentBranch.phone,
        owner_id: currentBranch.owner_id ?? currentUser?.id ?? currentUser?.user_id ?? null,
        is_active: currentBranch.is_active ?? true,
      };
      if (currentBranch.id) {
        await updateBranch(currentBranch.id, payload);
        toast.success("Branch updated successfully");
      } else {
        await createBranch(payload);
        toast.success("Branch created successfully");
      }
      setShowBranchModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving branch:", err);
      toast.error("Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = (branch) => {
    setDeleteTarget({ type: 'branch', id: branch.id, name: branch.name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      if (deleteTarget.type === 'branch') {
        await deleteBranch(deleteTarget.id);
        toast.success("Branch deleted successfully");
      } else if (deleteTarget.type === 'staff') {
        await deleteStaff(deleteTarget.id);
        toast.success("Staff deleted successfully");
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setLoading(false);
    }
  };

  // Staff Handlers
  const handleAddStaff = () => {
    setCurrentStaff({
      name: '',
      email: '',
      phone: '',
      branch_id: branches[0]?.id || null,
      role: 'staff',
      password: ''
    });
    setShowStaffModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setCurrentStaff({...staffMember, password: ''});
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert branch_id properly: handle empty string, null, and numeric values
      let branchId = currentStaff.branch_id;
      if (branchId === '' || branchId === 'null' || branchId === undefined) {
        branchId = null;
      } else {
        branchId = Number(branchId);
      }

      const payload = {
        username: currentStaff.username || currentStaff.name,
        name: currentStaff.name,
        email: currentStaff.email,
        phone: currentStaff.phone,
        branch_id: branchId,
        role: (currentStaff.role || 'staff').toUpperCase(),
        is_active: currentStaff.is_active ?? true,
      };

      if (currentStaff.password) {
        payload.password = currentStaff.password;
      }

      console.log('Payload being sent to backend:', payload);

      if (currentStaff.id) {
        await updateStaff(currentStaff.id, payload);
        toast.success("Staff updated successfully");
      } else {
        await createStaff(payload);
        toast.success("Staff created successfully");
      }
      setShowStaffModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving staff:", err);
      toast.error("Failed to save staff");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    setLoading(true);
    try {
      await deleteStaff(id);
      toast.success("Staff deleted successfully");
      loadData();
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error("Failed to delete staff");
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (branchId) => {
    if (!branchId) return '—';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || `Branch #${branchId}`;
  };

  return (
    isStaffUser ? null : (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        {/* Header */}
        <div className="branch-header">
          <div>
            <h2>Branch & Staff Management</h2>
            <p className="subtitle">Manage branches and assign staff members</p>
          </div>
          <Button variant="success" onClick={activeTab === 'branches' ? handleAddBranch : handleAddStaff}>
            + Add {activeTab === 'branches' ? 'Branch' : 'Staff'}
          </Button>
        </div>

        {/* Content */}
        <div className="branch-content">
          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'branches' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('branches')}
            >
              🏢 Branches ({branches.length})
            </button>
            <button
              className={`tab ${activeTab === 'staff' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              👥 Staff ({staff.length})
            </button>
          </div>

          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <div className="table-card">
              <div className="table-container">
                <table className="branch-table">
                  <thead>
                    <tr>
                      <th>Branch Name</th>
                      <th>Location</th>
                      <th>Phone</th>
                      <th>Manager</th>
                      <th>Staff Count</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          Loading...
                        </td>
                      </tr>
                    ) : branches.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No branches found. Create your first branch!
                        </td>
                      </tr>
                    ) : (
                      branches.map((branch) => (
                        <tr key={branch.id}>
                          <td>
                            <div className="branch-name">
                              <span className="branch-icon">🏢</span>
                              {branch.name}
                            </div>
                          </td>
                          <td>{branch.location}</td>
                          <td>{branch.phone}</td>
                          <td>{branch.manager}</td>
                          <td>
                            <span className="staff-count">
                              {staff.filter(s => s.branch_id === branch.id).length}
                            </span>
                          </td>
                          <td>
                            <div className="action-menu">
                              <button onClick={() => handleEditBranch(branch)}>✏️</button>
                              <button onClick={() => handleDeleteBranch(branch)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="table-card">
              <div className="table-container">
                <table className="branch-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Branch</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          Loading...
                        </td>
                      </tr>
                    ) : staff.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No staff members found. Add your first staff member!
                        </td>
                      </tr>
                    ) : (
                      staff.map((staffMember) => (
                        <tr key={staffMember.id}>
                          <td>
                            <div className="staff-name">
                              <span className="staff-avatar">{(staffMember.name || staffMember.username || '?').charAt(0)}</span>
                              {staffMember.name || staffMember.username || 'N/A'}
                            </div>
                          </td>
                          <td>{staffMember.email}</td>
                          <td>{staffMember.phone}</td>
                          <td>
                            {staffMember.branch_id ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>🏢</span>
                                {getBranchName(staffMember.branch_id)}
                              </span>
                            ) : (
                              <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>No branch</span>
                            )}
                          </td>
                          <td>
                            <span className={`role-badge ${staffMember.role}`}>
                              {(staffMember.role || '').toString().toUpperCase() || 'STAFF'}
                            </span>
                          </td>
                          <td>
                            <div className="action-menu">
                              <button onClick={() => handleEditStaff(staffMember)}>✏️</button>
                              <button onClick={() => handleDeleteStaff(staffMember)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="modal-overlay" onClick={() => setShowBranchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentBranch?.id ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button className="modal-close" onClick={() => setShowBranchModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveBranch}>
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  required
                  value={currentBranch.name}
                  onChange={(e) => setCurrentBranch({...currentBranch, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  required
                  value={currentBranch.location}
                  onChange={(e) => setCurrentBranch({...currentBranch, location: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    required
                    value={currentBranch.phone}
                    onChange={(e) => setCurrentBranch({...currentBranch, phone: e.target.value})}
                  />
                </div>
                {/* Manager removed from payload; keep optional UI if needed */}
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowBranchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentStaff?.id ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button className="modal-close" onClick={() => setShowStaffModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveStaff}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={currentStaff.name}
                  onChange={(e) => setCurrentStaff({...currentStaff, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={currentStaff.email}
                  onChange={(e) => setCurrentStaff({...currentStaff, email: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    required
                    value={currentStaff.phone}
                    onChange={(e) => setCurrentStaff({...currentStaff, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    required
                    value={currentStaff.branch_id || ''}
                    onChange={(e) => setCurrentStaff({...currentStaff, branch_id: e.target.value})}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    required
                    value={currentStaff.role}
                    onChange={(e) => setCurrentStaff({...currentStaff, role: e.target.value})}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Password {currentStaff?.id && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    required={!currentStaff?.id}
                    value={currentStaff.password}
                    onChange={(e) => setCurrentStaff({...currentStaff, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowStaffModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Staff'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>⚠️ Confirm Deletion</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Are you sure you want to delete this {deleteTarget.type}?
              </p>
              <p style={{ fontWeight: 'bold', color: '#e74c3c', marginBottom: '1rem' }}>
                {deleteTarget.name}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={confirmDelete} 
                disabled={loading}
                style={{ backgroundColor: '#e74c3c' }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    )
  );
};

export default BranchManagement;
