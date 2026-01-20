import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Spinner from '../Spinner';
import { getPersons, getEquipment, getSponsors, createRental } from '../../utils/api';
import { useToast } from '../../utils/toast';
import '../../css/components/rentalForms.css';

const CreateRentalFlow = ({ onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Data sources
  const [persons, setPersons] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  // Form state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [rentalData, setRentalData] = useState({
    start_date: '',
    expected_return_date: '',
    deposit_paid: 0,
    notes: '',
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [personsRes, equipmentRes, sponsorsRes] = await Promise.all([
        getPersons(),
        getEquipment(),
        getSponsors(),
      ]);
      setPersons(personsRes || []);
      setEquipment(equipmentRes || []);
      setSponsors(sponsorsRes || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    // Validate current step before moving next
    if (step === 1 && !selectedPerson) {
      toast.error('Please select a person');
      return;
    }
    if (step === 2 && !selectedEquipment) {
      toast.error('Please select equipment');
      return;
    }
    if (step === 3) {
      // Validate dates
      if (!rentalData.start_date || !rentalData.expected_return_date) {
        toast.error('Both start and return dates are required');
        return;
      }
      if (new Date(rentalData.start_date) >= new Date(rentalData.expected_return_date)) {
        toast.error('Return date must be after start date');
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Prepare rental data with EXACT API fields
      const submitData = {
        equipment_id: selectedEquipment.id,
        customer_name: selectedPerson.full_name,
        customer_phone: selectedPerson.phone || '',
        customer_identification: selectedPerson.identification || '',
        start_date: rentalData.start_date,
        expected_return_date: rentalData.expected_return_date,
        rate_per_day: parseFloat(selectedEquipment.rental_rate_per_day),
        deposit_paid: parseFloat(rentalData.deposit_paid) || 0,
      };

      // Add optional fields only if provided
      if (rentalData.notes && rentalData.notes.trim()) {
        submitData.notes = rentalData.notes;
      }

      console.log('===== RENTAL SUBMISSION DEBUG =====');
      console.log('Selected Person:', selectedPerson);
      console.log('Selected Equipment:', selectedEquipment);
      console.log('Rental Data (dates/deposit):', rentalData);
      console.log('Final Submit Payload:', submitData);
      console.log('===================================');

      await createRental(submitData);
      toast.success('Rental created successfully');
      onSave();
    } catch (err) {
      console.error('Rental creation error:', err);
      console.error('Error response:', err?.response);
      console.error('Error data:', err?.response?.data);
      
      // Handle validation errors from API
      const errorData = err?.response?.data;
      let errorMsg = 'Failed to create rental';
      
      if (Array.isArray(errorData)) {
        // Multiple validation errors - extract first error message
        const firstError = errorData[0];
        errorMsg = firstError?.msg || JSON.stringify(firstError) || 'Validation error';
      } else if (typeof errorData === 'object' && errorData?.msg) {
        // Single error object with msg field
        errorMsg = errorData.msg;
      } else if (errorData?.detail) {
        // String detail field or array of errors
        if (Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0];
          if (typeof firstError === 'object' && firstError?.msg) {
            errorMsg = firstError.msg;
          } else {
            errorMsg = JSON.stringify(firstError);
          }
        } else {
          errorMsg = errorData.detail;
        }
      } else if (typeof errorData === 'string') {
        // Direct string error
        errorMsg = errorData;
      }
      
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: s <= step ? '#1F2937' : '#e5e7eb',
                  color: s <= step ? '#fff' : '#9ca3af',
                }}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: s < step ? '#F3B33D' : '#e5e7eb',
                    margin: '0 10px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
          <span>Person</span>
          <span>Equipment</span>
          <span>Dates & Sponsor</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: Select Person */}
      {step === 1 && (
        <div className="rental-form-container">
          <h3 style={{ color: '#1F2937', marginBottom: '24px' }}>Step 1: Select Person</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {persons.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>
                No persons available. Create a person first.
              </p>
            ) : (
              persons.map((person) => (
                <div
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  style={{
                    padding: '16px',
                    border: selectedPerson?.id === person.id ? '2px solid #F3B33D' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedPerson?.id === person.id ? '#fffbf0' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#1F2937' }}>{person.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {person.role} • {person.phone || 'No phone'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Equipment */}
      {step === 2 && (
        <div className="rental-form-container">
          <h3 style={{ color: '#1F2937', marginBottom: '24px' }}>Step 2: Select Equipment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {equipment.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>
                No equipment available. Create equipment first.
              </p>
            ) : (
              equipment
                .filter((eq) => eq.is_available !== false)
                .map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq)}
                    style={{
                      padding: '16px',
                      border: selectedEquipment?.id === eq.id ? '2px solid #F3B33D' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: selectedEquipment?.id === eq.id ? '#fffbf0' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: '500', color: '#1F2937' }}>{eq.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {eq.category} • {eq.serial_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: '500' }}>
                      TZS {eq.rental_rate_per_day?.toLocaleString()} / day • Deposit: TZS {eq.deposit_amount?.toLocaleString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Step 3: Dates and Sponsor */}
      {step === 3 && (
        <div className="rental-form-container">
          <h3 style={{ color: '#1F2937', marginBottom: '24px' }}>Step 3: Rental Dates & Deposit</h3>

          <div className="rental-form-grid">
            <div className="rental-form-field">
              <label className="rental-form-label">
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={rentalData.start_date}
                onChange={(e) => setRentalData({ ...rentalData, start_date: e.target.value })}
                className="rental-form-input"
                required
              />
            </div>
            <div className="rental-form-field">
              <label className="rental-form-label">
                Expected Return Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={rentalData.expected_return_date}
                onChange={(e) => setRentalData({ ...rentalData, expected_return_date: e.target.value })}
                className="rental-form-input"
                required
              />
            </div>
            <div className="rental-form-field">
              <label className="rental-form-label">
                Deposit Paid (TZS)
              </label>
              <input
                type="number"
                value={rentalData.deposit_paid}
                onChange={(e) => setRentalData({ ...rentalData, deposit_paid: e.target.value })}
                placeholder={`${selectedEquipment?.deposit_amount || 0}`}
                className="rental-form-input"
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Equipment deposit required: TZS {selectedEquipment?.deposit_amount?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          <div className="rental-form-field">
            <label className="rental-form-label">Sponsor (Optional)</label>
            <select
              value={selectedSponsor?.id || ''}
              onChange={(e) => {
                const sponsor = sponsors.find((s) => s.id === parseInt(e.target.value));
                setSelectedSponsor(sponsor || null);
              }}
              className="rental-form-select"
            >
              <option value="">No Sponsor</option>
              {sponsors.map((sponsor) => (
                <option key={sponsor.id} value={sponsor.id}>
                  {sponsor.name} ({sponsor.type})
                </option>
              ))}
            </select>
          </div>

          <div className="rental-form-field">
            <label className="rental-form-label">Notes</label>
            <textarea
              value={rentalData.notes}
              onChange={(e) => setRentalData({ ...rentalData, notes: e.target.value })}
              placeholder="Special instructions, agreements, etc."
              className="rental-form-textarea"
            />
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="rental-form-container">
          <h3 style={{ color: '#1F2937', marginBottom: '24px' }}>Step 4: Review Rental</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Person Summary */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>PERSON</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{selectedPerson?.full_name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {selectedPerson?.role} • {selectedPerson?.phone}
              </div>
            </div>

            {/* Equipment Summary */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>EQUIPMENT</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{selectedEquipment?.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {selectedEquipment?.serial_number} • {selectedEquipment?.category}
              </div>
              <div style={{ fontSize: '13px', color: '#059669', marginTop: '8px', fontWeight: '500' }}>
                Rate: TZS {selectedEquipment?.rental_rate_per_day?.toLocaleString()} / day
              </div>
            </div>

            {/* Dates and Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>RENTAL PERIOD</div>
                <div style={{ fontSize: '13px', color: '#1F2937' }}>
                  {new Date(rentalData.start_date).toLocaleDateString()} to{' '}
                  {new Date(rentalData.expected_return_date).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  {Math.ceil(
                    (new Date(rentalData.expected_return_date) - new Date(rentalData.start_date)) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>DEPOSIT</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                  TZS {parseFloat(rentalData.deposit_paid || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  Required: TZS {selectedEquipment?.deposit_amount?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Sponsor */}
            {selectedSponsor && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>SPONSOR</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{selectedSponsor.name}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{selectedSponsor.type}</div>
              </div>
            )}

            {/* Notes */}
            {rentalData.notes && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>NOTES</div>
                <div style={{ fontSize: '13px', color: '#1F2937', whiteSpace: 'pre-wrap' }}>{rentalData.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={handlePreviousStep}
              disabled={submitting}
            >
              Back
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {step < 4 && (
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={submitting}
            >
              Next
            </Button>
          )}
          {step === 4 && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Creating Rental...' : 'Create Rental'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRentalFlow;
