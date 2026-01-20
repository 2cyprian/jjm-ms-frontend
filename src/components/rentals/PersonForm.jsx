import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Field from '../Field';
import TextArea from '../TextArea';
import FormGrid from '../FormGrid';
import { getPerson, createPerson, updatePerson } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';
import '../../css/components/rentalForms.css';

const PersonForm = ({ personId, onSave, onCancel }) => {
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    phone: '',
    identification: '',
    notes: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(!!personId);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const roles = ['Technician', 'Custodian', 'Manager'];

  useEffect(() => {
    if (personId) {
      loadPerson();
    }
  }, [personId]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const data = await getPerson(personId);
      setForm(data || {});
    } catch (err) {
      toast.error('Failed to load person');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.full_name || form.full_name.length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }
    if (!form.role) {
      toast.error('Role is required');
      return;
    }

    try {
      setSubmitting(true);

      if (personId) {
        await updatePerson(personId, form);
        toast.success('Person updated successfully');
      } else {
        await createPerson(form);
        toast.success('Person created successfully');
      }

      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save person');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit} className="rental-form-container">
      <div className="rental-form-grid">
        <div className="rental-form-field">
          <label className="rental-form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            className="rental-form-input"
            required
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">
            Role <span className="required">*</span>
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rental-form-select"
            required
          >
            <option value="">Select a role</option>
              {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+255722123456"
            className="rental-form-input"
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Identification (ID/Passport)</label>
          <input
            type="text"
            name="identification"
            value={form.identification}
            onChange={handleChange}
            placeholder="ID-123456"
            className="rental-form-input"
          />
        </div>
      </div>

      <div className="rental-form-field">
        <label className="rental-form-label">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Special skills, certifications, or risk flags"
          className="rental-form-textarea"
        />
      </div>

      <div className="rental-form-checkbox">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
        />
        <label htmlFor="is_active">Active</label>
      </div>

      <div className="rental-form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : personId ? 'Update Person' : 'Create Person'}
        </Button>
      </div>
    </form>
  );
};

export default PersonForm;
