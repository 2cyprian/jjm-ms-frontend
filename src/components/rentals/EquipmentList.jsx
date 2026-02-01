import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Eye } from 'lucide-react';
import Button from '../Button';
import { getEquipment, getRentals } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';

const EquipmentList = ({ onEdit, onView, onCreateRental }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadEquipment();
  }, []);

  const parseQty = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const loadEquipment = async () => {
    try {
      setLoading(true);

      // Load equipment and rentals together so we can compute available units
      const [equipmentRes, rentalsRes] = await Promise.all([getEquipment(), getRentals()]);

      const list = equipmentRes.equipment || equipmentRes || [];
      const rentalsList = rentalsRes?.rentals || rentalsRes || [];

      // Sum rented quantities per equipment for active/overdue rentals
      const rentedByEquipment = {};
      rentalsList.forEach((rental) => {
        const status = rental?.status;
        if (status === 'active' || status === 'overdue') {
          const eqId = rental.equipment_id || rental.equipment?.id;
          if (eqId) {
            const rentedQty = parseQty(rental.quantity ?? rental.qty ?? rental.units ?? 1);
            rentedByEquipment[eqId] = (rentedByEquipment[eqId] || 0) + rentedQty;
          }
        }
      });

      // Normalize quantity fields and compute available
      const normalized = (Array.isArray(list) ? list : []).map((item) => {
        const baseQty = parseQty(item?.qty ?? item?.quantity ?? item?.available_quantity ?? 0);
        const rentedQty = parseQty(rentedByEquipment[item.id] || 0);
        const availableQty = Math.max(baseQty - rentedQty, 0);
        return {
          ...item,
          qty: baseQty,
          available_qty: availableQty,
          rented_qty: rentedQty,
        };
      });

      console.log('Equipment availability debug:', { list: normalized, rentedByEquipment });

      setEquipment(normalized);
    } catch (err) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: { bg: '#bbf7d0', color: '#065f46', label: '✓ Available' },
      rented: { bg: '#bfdbfe', color: '#0c4a6e', label: '🔒 Rented' },
      maintenance: { bg: '#fecaca', color: '#991b1b', label: '🔧 Maintenance' },
    };
    return colors[status] || colors.available;
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Equipment Inventory</h3>
        <Button
          variant="primary"
          onClick={() => onEdit(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> New Equipment
        </Button>
      </div>

      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Name / Code
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Category
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Serial Number
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Condition
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Available
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Times Rented
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => {
              const statusConfig = getStatusColor(item.status);
              const availableQty = item.available_qty ?? item.qty ?? item.quantity ?? 0;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {item.category}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {item.serial_number}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {item.condition}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: availableQty > 0 ? '#059669' : '#dc2626' }}>
                        {availableQty} available
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Total: {item.qty ?? item.quantity ?? 0} | Out: {item.rented_qty ?? 0}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    {item.times_rented || 0}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => onView(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          padding: '4px',
                        }}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#10b981',
                          padding: '4px',
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {equipment.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No equipment yet. Add your first item to get started.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
