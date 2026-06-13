import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button';
import { returnEquipment, getRentalDetail, updateEquipment, getEquipmentDetail } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';

const ReturnRentalModal = ({ rentalId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rental, setRental] = useState(null);
  const toast = useToast();

  const [returnData, setReturnData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    condition_on_return: 'Good',
    damage_notes: '',
    overdue_reason: ''
  });

  useEffect(() => {
    loadRental();
  }, [rentalId]);

  const loadRental = async () => {
    try {
      setLoading(true);
      const data = await getRentalDetail(rentalId);
      setRental(data);
    } catch (err) {
      toast.error('Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = () => {
    if (!rental?.expected_return_date) return false;
    const expectedDate = new Date(rental.expected_return_date);
    const actualDate = new Date(returnData.actual_return_date);
    return actualDate > expectedDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (isOverdue() && !returnData.overdue_reason.trim()) {
      toast.error('Please provide a reason for late return');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare payload - only include fields that are needed
      const payload = {
        actual_return_date: returnData.actual_return_date,
        condition_on_return: returnData.condition_on_return
      };

      // Add optional fields only if they have values
      if (returnData.damage_notes.trim()) {
        payload.damage_notes = returnData.damage_notes;
      }
      if (returnData.overdue_reason.trim()) {
        payload.overdue_reason = returnData.overdue_reason;
      }

      await returnEquipment(rentalId, payload);
      
      // Update equipment quantity - add back the rented quantity
      if (rental?.equipment_id && rental?.quantity) {
        try {
          const equipmentDetail = await getEquipmentDetail(rental.equipment_id);
          const currentQty = equipmentDetail.qty || 0;
          const newQty = currentQty + rental.quantity;
          
          await updateEquipment(rental.equipment_id, {
            qty: newQty
          });
        } catch (err) {
          console.error('Failed to update equipment quantity:', err);
          // Don't fail the return just because quantity update failed
        }
      }
      
      toast.success('Equipment returned successfully');
      onSuccess();
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to return equipment';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>
              Return Equipment
            </h2>
            {rental && (
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                {rental.equipment?.name || 'Equipment'} - Rental #{rental.rental_number || rental.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '24px' }}>
              {/* Rental Info Summary */}
              {rental && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>
                    RENTAL DETAILS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Start Date:</span>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(rental.start_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Expected Return:</span>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(rental.expected_return_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Customer:</span>
                      <div style={{ fontWeight: 500 }}>
                        {rental.person?.full_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Status:</span>
                      <div style={{ 
                        fontWeight: 500,
                        color: rental.status === 'active' ? '#0c4a6e' : '#991b1b'
                      }}>
                        {rental.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--primary)'
                }}>
                  Actual Return Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={returnData.actual_return_date}
                  onChange={(e) => setReturnData({ ...returnData, actual_return_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.95rem'
                  }}
                />
                {isOverdue() && (
                  <p style={{
                    margin: '6px 0 0 0',
                    fontSize: '0.85rem',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚠️ This rental is overdue. Overdue reason is required.
                  </p>
                )}
              </div>

              {/* Condition on Return */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--primary)'
                }}>
                  Condition on Return <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={returnData.condition_on_return}
                  onChange={(e) => setReturnData({ ...returnData, condition_on_return: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="New">New - No wear</option>
                  <option value="Good">Good - Minor wear</option>
                  <option value="Needs Service">Needs Service - Requires maintenance</option>
                </select>
              </div>

              {/* Damage Notes */}
              {(returnData.condition_on_return === 'Needs Service') && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--primary)'
                  }}>
                    Damage Notes {returnData.condition_on_return === 'Needs Service' && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <textarea
                    value={returnData.damage_notes}
                    onChange={(e) => setReturnData({ ...returnData, damage_notes: e.target.value })}
                    placeholder="Describe any damage or issues with the equipment..."
                    required={returnData.condition_on_return === 'Needs Service'}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Overdue Reason */}
              {isOverdue() && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--primary)'
                  }}>
                    Overdue Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={returnData.overdue_reason}
                    onChange={(e) => setReturnData({ ...returnData, overdue_reason: e.target.value })}
                    placeholder="Explain why the equipment is being returned late..."
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white'
            }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Return Equipment'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReturnRentalModal;
