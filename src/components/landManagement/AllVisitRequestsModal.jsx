import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button';
import VisitRequestsTable from './VisitRequestsTable';
import { getAllVisitRequests, updateVisitRequestStatus } from '../../utils/api';
import { useToast } from '../../utils/toast';

const AllVisitRequestsModal = ({ onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllVisitRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load visit requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setLoading(true);
      await updateVisitRequestStatus(requestId, status);
      toast.success(`Status updated to ${status}`);
      await loadRequests();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to update status';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  const getStatusCount = (status) => {
    return requests.filter(req => req.status === status).length;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Visit Requests</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body modal-scrollable">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: filter === 'all' ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                  background: filter === 'all' ? '#eef2ff' : '#fff',
                  color: filter === 'all' ? '#4f46e5' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: filter === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  background: filter === 'pending' ? '#fef3c7' : '#fff',
                  color: filter === 'pending' ? '#f59e0b' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Pending ({getStatusCount('pending')})
              </button>
              <button
                onClick={() => setFilter('approved')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: filter === 'approved' ? '2px solid #10b981' : '1px solid #e5e7eb',
                  background: filter === 'approved' ? '#d1fae5' : '#fff',
                  color: filter === 'approved' ? '#10b981' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Approved ({getStatusCount('approved')})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: filter === 'rejected' ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  background: filter === 'rejected' ? '#fee2e2' : '#fff',
                  color: filter === 'rejected' ? '#ef4444' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Rejected ({getStatusCount('rejected')})
              </button>
              <button
                onClick={() => setFilter('completed')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: filter === 'completed' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  background: filter === 'completed' ? '#e0e7ff' : '#fff',
                  color: filter === 'completed' ? '#6366f1' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Completed ({getStatusCount('completed')})
              </button>
            </div>
          </div>

          <VisitRequestsTable
            requests={filteredRequests}
            onUpdateStatus={handleUpdateStatus}
            loading={loading}
          />
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default AllVisitRequestsModal;
