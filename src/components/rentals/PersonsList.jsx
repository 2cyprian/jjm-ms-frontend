import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, Zap } from 'lucide-react';
import Button from '../Button';
import { getPersons } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';

const PersonsList = ({ onEdit, onView, onCreateRental }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const data = await getPersons();
      setPersons(data.persons || data || []);
    } catch (err) {
      toast.error('Failed to load persons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Persons (Renters)</h3>
        <Button
          variant="primary"
          onClick={() => onEdit(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> New Person
        </Button>
      </div>

      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Phone
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Identification
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Active Rentals
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                  {person.full_name || person.name}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {person.phone || '-'}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {person.identification || '-'}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#dbeafe',
                      color: '#0c4a6e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                    }}
                  >
                    {person.active_rentals_count || 0}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: person.has_overdue ? '#fecaca' : '#bbf7d0',
                      color: person.has_overdue ? '#991b1b' : '#065f46',
                    }}
                  >
                    {person.has_overdue ? '⚠️ Overdue' : '✓ Clear'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => onView(person.id)}
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
                      onClick={() => onEdit(person.id)}
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
                    <button
                      onClick={() => onCreateRental(person.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#f59e0b',
                        padding: '4px',
                      }}
                      title="New Rental"
                    >
                      <Zap size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {persons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No persons yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
};

export default PersonsList;
