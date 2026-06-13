import React, { useState, useEffect } from 'react';
import { Plus, Eye, Undo2, AlertTriangle } from 'lucide-react';
import Button from '../Button';
import { getRentals, getEquipmentDetail } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';

const RentalsList = ({ onCreateRental, onViewDetail, onReturn }) => {
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadRentals();
  }, []); // Only load once, filtering is now frontend only

  const loadRentals = async () => {
    try {
      setLoading(true);
      let data = await getRentals();
      let rentalsList = data.rentals || data || [];
      
      // DEBUG: Log raw rental response to see quantity field names
      console.log('===== RENTALS API RESPONSE DEBUG =====');
      console.log('Raw response:', data);
      if (rentalsList.length > 0) {
        console.log('First rental keys:', Object.keys(rentalsList[0]));
        console.log('First rental FULL object:', JSON.stringify(rentalsList[0], null, 2));
        console.log('Quantity fields - quantity:', rentalsList[0].quantity, 'qty:', rentalsList[0].qty, 'units:', rentalsList[0].units);
      }
      console.log('=====================================');
      
      // Fetch equipment details for each rental since equipment is null in the response
      rentalsList = await Promise.all(
        rentalsList.map(async (rental) => {
          if (rental.equipment_id && !rental.equipment) {
            try {
              const equipmentData = await getEquipmentDetail(rental.equipment_id);
              return { ...rental, equipment: equipmentData };
            } catch (err) {
              console.error('Failed to load equipment for rental', rental.id);
              return rental;
            }
          }
          return rental;
        })
      );
      setRentals(rentalsList);
    } catch (err) {
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: '#dbeafe', color: '#0c4a6e', label: 'Active' },
      returned: { bg: '#bbf7d0', color: '#065f46', label: 'Returned' },
      overdue: { bg: '#fecaca', color: '#991b1b', label: 'Overdue' },
      request: { bg: '#fef9c3', color: '#92400e', label: 'Request' },
    };
    return config[status] || { bg: '#e5e7eb', color: '#6b7280', label: status || 'Unknown' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <Spinner />;

  const tabs = [
    { id: 'all', label: 'All', count: rentals.length },
    { id: 'active', label: 'Active', count: rentals.filter((r) => r.status === 'active').length },
    { id: 'overdue', label: 'Overdue', count: rentals.filter((r) => r.status === 'overdue').length },
    { id: 'request', label: 'Request', count: rentals.filter((r) => r.status === 'request').length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Rentals Management</h3>
        <Button
          variant="primary"
          onClick={onCreateRental}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> New Rental
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '20px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '8px 16px',
              border: filter === tab.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: filter === tab.id ? '#eff6ff' : '#fff',
              color: filter === tab.id ? '#0c4a6e' : '#6b7280',
              cursor: 'pointer',
              fontWeight: filter === tab.id ? '600' : '500',
              fontSize: '14px',
            }}
          >
            {tab.label} <span style={{ marginLeft: '4px', opacity: 0.7 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Person
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Equipment
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Start Date
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Due Date
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Out (Units)
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Days
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals
              .filter((rental) => {
                if (filter === 'all') return true;
                return rental.status === filter;
              })
              .map((rental) => {
              const statusConfig = getStatusBadge(rental.status);
              const now = new Date();
              const dueDate = new Date(rental.expected_return_date);
              const startDate = new Date(rental.start_date);
              const days = Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24));
              const overdueFlag = rental.status === 'overdue' && now > dueDate;
              const rentalQty = rental.quantity ?? rental.qty ?? rental.units ?? 1;
              
              // DEBUG: Log quantity for each rental to verify
              if (rental.id % 2 === 0) { // Log every other one to avoid spam
                console.log(`Rental ${rental.id} qty check - quantity: ${rental.quantity}, qty: ${rental.qty}, units: ${rental.units}, final: ${rentalQty}`);
              }
              
              // Extract person and equipment names from nested objects or direct fields
              const personName = rental.customer_name || rental.person?.full_name || 'N/A';
              const equipmentName = rental.equipment?.name || rental.equipment_name || 'N/A';

              return (
                <tr key={rental.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                    <div>{personName}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      {rental.days_rented || days} day(s) rented
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {equipmentName ? (
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{equipmentName}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                          {rental.equipment?.category || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>Loading...</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {formatDate(rental.start_date)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {formatDate(rental.expected_return_date)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {overdueFlag && <AlertTriangle size={14} color="#991b1b" />}
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
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#fef3c7',
                        color: '#78350f',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                      }}
                    >
                      {rentalQty} unit{rentalQty !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    {days}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => onViewDetail(rental.id)}
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
                      {rental.status === 'active' && (
                        <button
                          onClick={() => onReturn(rental.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#10b981',
                            padding: '4px',
                          }}
                          title="Return Equipment"
                        >
                          <Undo2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rentals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No rentals in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default RentalsList;
