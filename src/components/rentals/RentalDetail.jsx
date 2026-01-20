import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Spinner from '../Spinner';
import { getRentalDetail, returnEquipment, getEquipmentDetail } from '../../utils/api';
import { useToast } from '../../utils/toast';
import '../../css/components/rentalForms.css';

const RentalDetail = ({ rentalId, onBack }) => {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnData, setReturnData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    condition_on_return: 'Good',
    damage_notes: '',
    overdue_reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const conditions = ['New', 'Good', 'Needs Service'];
  const overdueReasons = ['Customer delayed', 'Project extended', 'Weather conditions', 'Equipment issue', 'Communication failure', 'Other'];

  useEffect(() => {
    loadRental();
  }, [rentalId]);

  const loadRental = async () => {
    try {
      setLoading(true);
      let data = await getRentalDetail(rentalId);
      
      // Fetch equipment details if not included in rental response
      if (data.equipment_id && !data.equipment) {
        try {
          const equipmentData = await getEquipmentDetail(data.equipment_id);
          data = { ...data, equipment: equipmentData };
        } catch (err) {
          console.error('Failed to load equipment details');
        }
      }
      
      setRental(data);
    } catch (err) {
      toast.error('Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async () => {
    try {
      setSubmitting(true);

      const submitData = {
        actual_return_date: returnData.actual_return_date,
        condition_on_return: returnData.condition_on_return,
      };

      if (returnData.damage_notes) submitData.damage_notes = returnData.damage_notes;
      if (returnData.overdue_reason) submitData.overdue_reason = returnData.overdue_reason;

      await returnEquipment(rentalId, submitData);
      toast.success('Equipment returned successfully');
      onBack();
    } catch (err) {
      const errorData = err?.response?.data;
      let errorMsg = 'Failed to return equipment';

      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.detail) {
        errorMsg = errorData.detail;
      }

      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  if (loading) return <Spinner />;
  if (!rental) return <div style={{ padding: '24px', color: '#9ca3af' }}>Rental not found</div>;

  const person = rental.person || {};
  const equipment = rental.equipment || {};
  const customer_name = rental.customer_name || person.full_name || 'N/A';
  const equipment_name = equipment.name || 'N/A';
  const rental_days = Math.ceil(
    (new Date(rental.expected_return_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>Rental #{rental.id}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Created: {formatDate(rental.created_at)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: rental.status === 'active' ? '#dbeafe' : rental.status === 'returned' ? '#bbf7d0' : '#fecaca',
                color: rental.status === 'active' ? '#0c4a6e' : rental.status === 'returned' ? '#065f46' : '#991b1b',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {rental.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Person Section */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
            Person / Customer
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
            {customer_name}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {person.role && <div>Role: {person.role}</div>}
            {rental.customer_phone && <div>Phone: {rental.customer_phone}</div>}
            {rental.customer_identification && <div>ID: {rental.customer_identification}</div>}
          </div>
        </div>

        {/* Equipment Section */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
            Equipment
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
            {equipment_name}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {equipment.category && <div>Category: {equipment.category}</div>}
            {equipment.serial_number && <div>Serial: {equipment.serial_number}</div>}
            {equipment.condition && <div>Condition: {equipment.condition}</div>}
          </div>
        </div>
      </div>

      {/* Rental Period */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Start Date
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
            {formatDate(rental.start_date)}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Due Date
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
            {formatDate(rental.expected_return_date)}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Days
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
            {rental_days} days
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Rate Per Day
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
            {formatCurrency(rental.rate_per_day)}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Deposit Paid
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
            {formatCurrency(rental.deposit_paid)}
          </div>
        </div>
      </div>

      {/* Return Information (if returned) */}
      {rental.actual_return_date && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
            Return Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Returned:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>{formatDate(rental.actual_return_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Condition:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>{rental.condition_on_return}</div>
            </div>
            {rental.damage_notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Damage Notes:</div>
                <div style={{ fontSize: '14px', color: '#065f46' }}>{rental.damage_notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {rental.notes && (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Notes
          </div>
          <div style={{ fontSize: '14px', color: '#1F2937', whiteSpace: 'pre-wrap' }}>{rental.notes}</div>
        </div>
      )}

      {/* Return Form */}
      {showReturnForm && rental.status === 'active' && (
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fcd34d', marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, color: '#92400e' }}>Return Equipment</h3>

          <div className="rental-form-grid">
            <div className="rental-form-field">
              <label className="rental-form-label">
                Return Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={returnData.actual_return_date}
                onChange={(e) => setReturnData({ ...returnData, actual_return_date: e.target.value })}
                className="rental-form-input"
              />
            </div>

            <div className="rental-form-field">
              <label className="rental-form-label">Condition</label>
              <select
                value={returnData.condition_on_return}
                onChange={(e) => setReturnData({ ...returnData, condition_on_return: e.target.value })}
                className="rental-form-select"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rental-form-field">
            <label className="rental-form-label">Damage Notes</label>
            <textarea
              value={returnData.damage_notes}
              onChange={(e) => setReturnData({ ...returnData, damage_notes: e.target.value })}
              placeholder="Describe any damage if applicable"
              className="rental-form-textarea"
            />
          </div>

          {new Date(returnData.actual_return_date) > new Date(rental.expected_return_date) && (
            <div>
              <div className="rental-form-field">
                <label className="rental-form-label">Overdue Reason</label>
                <select
                  value={returnData.overdue_reason}
                  onChange={(e) => setReturnData({ ...returnData, overdue_reason: e.target.value })}
                  className="rental-form-select"
                >
                  <option value="">Select reason</option>
                  {overdueReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              variant="secondary"
              onClick={() => setShowReturnForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReturnSubmit}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Return'}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onBack}>
          Back to Rentals
        </Button>

        {rental.status === 'active' && !showReturnForm && (
          <Button
            variant="primary"
            onClick={() => setShowReturnForm(true)}
            style={{ backgroundColor: '#10b981' }}
          >
            Return Equipment
          </Button>
        )}
      </div>
    </div>
  );
};

export default RentalDetail;
