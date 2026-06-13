import React from 'react';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '../Button';

const VisitRequestsTable = ({ requests, onUpdateStatus, loading }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: '#f59e0b', icon: <AlertCircle size={14} />, label: 'New' },
      contacted: { color: '#3b82f6', icon: <CheckCircle size={14} />, label: 'Contacted' },
      completed: { color: '#10b981', icon: <CheckCircle size={14} />, label: 'Completed' },
      cancelled: { color: '#ef4444', icon: <XCircle size={14} />, label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '500',
          backgroundColor: `${config.color}15`,
          color: config.color,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        Loading visit requests...
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        No visit requests yet
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Contact</th>
            <th>Preferred Date & Time</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="#666" />
                  <strong>{request.visitor_name}</strong>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} color="#666" />
                    {request.visitor_email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="#666" />
                    {request.visitor_phone}
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} color="#666" />
                    {formatDate(request.preferred_date)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} color="#666" />
                    {formatTime(request.preferred_time)}
                  </div>
                </div>
              </td>
              <td>
                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {request.message || '-'}
                </div>
              </td>
              <td>{getStatusBadge(request.status)}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Status Actions */}
                  
                  {/* Status Dropdown */}
                  <select
                    value={request.status || 'new'}
                    onChange={(e) => onUpdateStatus(request.id, e.target.value)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitRequestsTable;
