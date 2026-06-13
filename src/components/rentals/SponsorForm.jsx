import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Field from '../Field';
import TextArea from '../TextArea';
import FormGrid from '../FormGrid';
import { getSponsor, createSponsor, updateSponsor } from '../../utils/api';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';
import '../../css/components/rentalForms.css';

const SponsorForm = ({ sponsorId, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    type: '',
    contact_person: '',
    phone: '',
    email: '',
    agreement_reference: '',
    notes: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(!!sponsorId);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const sponsorTypes = ['Company', 'NGO', 'Individual'];

  useEffect(() => {
    if (sponsorId) {
      loadSponsor();
    }
  }, [sponsorId]);

  const loadSponsor = async () => {
    try {
      setLoading(true);
      const data = await getSponsor(sponsorId);
      setForm(data || {});
    } catch (err) {
      toast.error('Failed to load sponsor');
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
    if (!form.name || form.name.length < 2) {
      toast.error('Sponsor name must be at least 2 characters');
      return;
    }
    if (!form.type) {
      toast.error('Sponsor type is required');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      setSubmitting(true);

      if (sponsorId) {
        await updateSponsor(sponsorId, form);
        toast.success('Sponsor updated successfully');
      } else {
        await createSponsor(form);
        toast.success('Sponsor created successfully');
      }

      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save sponsor');
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
            Sponsor Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="ABC Survey Company Ltd"
            className="rental-form-input"
            required
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">
            Type <span className="required">*</span>
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rental-form-select"
            required
          >
            <option value="">Select sponsor type</option>
            {sponsorTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            placeholder="Mr. Kamau"
            className="rental-form-input"
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+255754123456"
            className="rental-form-input"
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="info@example.co.tz"
            className="rental-form-input"
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Agreement Reference</label>
          <input
            type="text"
            name="agreement_reference"
            value={form.agreement_reference}
            onChange={handleChange}
            placeholder="AGR-2026-001"
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
          placeholder="Main equipment sponsor for 2026, special terms, etc."
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
          {submitting ? 'Saving...' : sponsorId ? 'Update Sponsor' : 'Create Sponsor'}
        </Button>
      </div>
    </form>
  );
};

export default SponsorForm;
