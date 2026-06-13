import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import Button from '../Button';
import Field from '../Field';
import TextArea from '../TextArea';
import { useToast } from '../../utils/toast';

const VisitRequestModal = ({ listing, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const toast = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.visitor_name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.visitor_email.trim() || !/\S+@\S+\.\S+/.test(formData.visitor_email)) {
      toast.error('Valid email is required');
      return;
    }
    if (!formData.visitor_phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!formData.preferred_date) {
      toast.error('Preferred date is required');
      return;
    }
    if (!formData.preferred_time) {
      toast.error('Preferred time is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request a Visit</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body modal-scrollable">
          {listing && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{listing.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{listing.addressLocality}, {listing.addressRegion}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field
              label="Your Name"
              icon={<User size={18} />}
              value={formData.visitor_name}
              onChange={(e) => handleChange('visitor_name', e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <Field
              label="Email Address"
              icon={<Mail size={18} />}
              type="email"
              value={formData.visitor_email}
              onChange={(e) => handleChange('visitor_email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />

            <Field
              label="Phone Number"
              icon={<Phone size={18} />}
              type="tel"
              value={formData.visitor_phone}
              onChange={(e) => handleChange('visitor_phone', e.target.value)}
              placeholder="+255 xxx xxx xxx"
              required
            />

            <Field
              label="Preferred Date"
              icon={<Calendar size={18} />}
              type="date"
              value={formData.preferred_date}
              onChange={(e) => handleChange('preferred_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <Field
              label="Preferred Time"
              icon={<Clock size={18} />}
              type="time"
              value={formData.preferred_time}
              onChange={(e) => handleChange('preferred_time', e.target.value)}
              required
            />

            <TextArea
              label="Additional Message (Optional)"
              icon={<MessageSquare size={18} />}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Any specific requirements or questions..."
              rows={4}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </div>
      </div>
    </div>
  );
};

export default VisitRequestModal;
