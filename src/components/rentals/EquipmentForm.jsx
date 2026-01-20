import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Field from '../Field';
import TextArea from '../TextArea';
import FormGrid from '../FormGrid';
import ImageUploadSection from './ImageUploadSection';
import { getEquipmentDetail, createEquipment, updateEquipment } from '../../utils/api';
import { uploadMultipleImages } from '../../utils/cloudinary';
import { useToast } from '../../utils/toast';
import Spinner from '../Spinner';
import '../../css/components/rentalForms.css';

const EquipmentForm = ({ equipmentId, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    serial_number: '',
    category: '',
    rental_rate_per_day: '',
    deposit_amount: '',
    condition: 'Good',
    sponsor_id: '',
    responsible_person_id: '',
    images: [],
    notes: '',
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(!!equipmentId);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const categories = ['Survey', 'GPS', 'Drone', 'Level', 'Theodolite', 'Total Station', 'Other'];
  const conditions = ['New', 'Good', 'Needs Service'];

  useEffect(() => {
    if (equipmentId) {
      loadEquipment();
    }
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await getEquipmentDetail(equipmentId);
      setForm(data || {});
    } catch (err) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (form.images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadResults = await uploadMultipleImages(files, {
        folder: 'jjm-geodata/equipment',
        tags: ['equipment', 'rental'],
      });

      const newImages = uploadResults.map((result) => ({
        url: result.url,
        name: result.publicId,
      }));

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5),
      }));

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || form.name.length < 2) {
      toast.error('Equipment name must be at least 2 characters');
      return;
    }
    if (!form.serial_number) {
      toast.error('Serial number is required');
      return;
    }
    if (!form.category) {
      toast.error('Category is required');
      return;
    }
    if (!form.rental_rate_per_day || form.rental_rate_per_day <= 0) {
      toast.error('Rental rate must be greater than 0');
      return;
    }
    if (form.deposit_amount < 0) {
      toast.error('Deposit cannot be negative');
      return;
    }

    try {
      setSubmitting(true);

      // Build submit data, only including fields with values
      const submitData = {
        name: form.name,
        serial_number: form.serial_number,
        category: form.category,
        rental_rate_per_day: parseFloat(form.rental_rate_per_day),
        deposit_amount: parseFloat(form.deposit_amount) || 0,
        condition: form.condition || 'Good',
      };

      // Add optional fields only if they have values
      if (form.brand) submitData.brand = form.brand;
      if (form.model) submitData.model = form.model;
      if (form.notes) submitData.notes = form.notes;
      if (form.sponsor_id) submitData.sponsor_id = form.sponsor_id;
      if (form.responsible_person_id) submitData.responsible_person_id = form.responsible_person_id;
      
      // Send images as URL array
      if (form.images && form.images.length > 0) {
        submitData.images = form.images.map(img => img.url || img);
      }

      if (equipmentId) {
        await updateEquipment(equipmentId, submitData);
        toast.success('Equipment updated successfully');
      } else {
        await createEquipment(submitData);
        toast.success('Equipment created successfully');
      }

      onSave();
    } catch (err) {
      // Handle validation errors from API
      const errorData = err?.response?.data;
      if (Array.isArray(errorData)) {
        // Multiple validation errors
        const firstError = errorData[0];
        const errorMsg = firstError?.msg || 'Validation error';
        toast.error(errorMsg);
      } else if (errorData?.detail) {
        // Single error message
        toast.error(errorData.detail);
      } else if (typeof errorData === 'string') {
        toast.error(errorData);
      } else {
        toast.error('Failed to save equipment');
      }
      console.error('Equipment save error:', err);
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
            Equipment Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Survey Equipment Set 1"
            className="rental-form-input"
            required
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">
            Serial Number <span className="required">*</span>
          </label>
          <input
            type="text"
            name="serial_number"
            value={form.serial_number}
            onChange={handleChange}
            placeholder="SN-001-2026"
            className="rental-form-input"
            required
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Leica"
            className="rental-form-input"
          />
        </div>
        <div className="rental-form-field">
          <label className="rental-form-label">Model</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="TS09"
            className="rental-form-input"
          />
        </div>
      </div>

      <div className="rental-form-grid">
        <div className="rental-form-field">
          <label className="rental-form-label">
            Category <span className="required">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rental-form-select"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="rental-form-field">
          <label className="rental-form-label">Condition</label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="rental-form-select"
          >
            {conditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        <div className="rental-form-field">
          <label className="rental-form-label">
            Rental Rate Per Day (TZS) <span className="required">*</span>
          </label>
          <input
            type="number"
            name="rental_rate_per_day"
            value={form.rental_rate_per_day}
            onChange={handleChange}
            placeholder="150000"
            className="rental-form-input"
            required
          />
        </div>

        <div className="rental-form-field">
          <label className="rental-form-label">Deposit Amount (TZS)</label>
          <input
            type="number"
            name="deposit_amount"
            value={form.deposit_amount}
            onChange={handleChange}
            placeholder="500000"
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
          placeholder="Calibration info, maintenance notes, etc."
          className="rental-form-textarea"
        />
      </div>

      {/* Image Upload Section */}
      <ImageUploadSection
        images={form.images}
        uploading={uploadingImages}
        onUpload={handleImageUpload}
        onRemove={handleRemoveImage}
      />

      <div className="rental-form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting || uploadingImages}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting || uploadingImages}>
          {submitting ? 'Saving...' : equipmentId ? 'Update Equipment' : 'Create Equipment'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
