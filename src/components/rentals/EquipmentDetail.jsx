import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Spinner from '../Spinner';
import { getEquipmentDetail } from '../../utils/api';
import { useToast } from '../../utils/toast';
import '../../css/components/rentalForms.css';

const EquipmentDetail = ({ equipmentId, onBack, onEdit }) => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadEquipment();
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await getEquipmentDetail(equipmentId);
      setEquipment(data);
    } catch (err) {
      toast.error('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  if (loading) return <Spinner />;
  if (!equipment) return <div style={{ padding: '24px', color: '#9ca3af' }}>Equipment not found</div>;

  const availableQty = equipment.available_qty ?? equipment.qty ?? equipment.quantity ?? 0;
  const totalQty = equipment.qty ?? equipment.quantity ?? 0;
  const rentedQty = equipment.rented_qty ?? 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header with Back and Edit buttons */}
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>{equipment.name}</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Serial: {equipment.serial_number}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" onClick={() => onEdit(equipmentId)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Images Section */}
      {equipment.images && equipment.images.length > 0 && (
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Images
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {equipment.images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f3f4f6',
                }}
              >
                <img
                  src={typeof img === 'string' ? img : img.url}
                  alt={`Equipment ${idx + 1}`}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column */}
        <div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Brand
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              {equipment.brand || '-'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Model
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              {equipment.model || '-'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Category
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              {equipment.category || '-'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Condition
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              {equipment.condition || '-'}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Rental Rate
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
              {formatCurrency(equipment.rental_rate_per_day)} / day
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Deposit Required
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              {formatCurrency(equipment.deposit_amount)}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Times Rented
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
              {equipment.times_rented || 0} times
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
              Status
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: equipment.status === 'available' ? '#bbf7d0' : equipment.status === 'rented' ? '#bfdbfe' : '#fecaca',
                  color: equipment.status === 'available' ? '#065f46' : equipment.status === 'rented' ? '#0c4a6e' : '#991b1b',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {equipment.status || 'unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: '#bbf7d0', borderRadius: '6px', border: '1px solid #6ee7b7' }}>
          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Available
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#065f46' }}>
            {availableQty}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde047' }}>
          <div style={{ fontSize: '12px', color: '#78350f', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Rented Out
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#78350f' }}>
            {rentedQty}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
          <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Total Units
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>
            {totalQty}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {equipment.notes && (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Notes
          </div>
          <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {equipment.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetail;
