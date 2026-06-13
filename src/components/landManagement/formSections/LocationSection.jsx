import React from 'react';
import { MapPin } from 'lucide-react';

const LocationSection = ({ formData, handleChange }) => {
  return (
    <div className="form-section">
      <h3>Location Details</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Locality (City/Town) *</label>
          <input
            type="text"
            value={formData.addressLocality}
            onChange={(e) => handleChange('addressLocality', e.target.value)}
            placeholder="e.g., Dar es Salaam"
          />
        </div>
        <div className="form-group">
          <label>District *</label>
          <input
            type="text"
            value={formData.addressDistrict}
            onChange={(e) => handleChange('addressDistrict', e.target.value)}
            placeholder="e.g., Kinondoni"
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={formData.addressCountry}
            onChange={(e) => handleChange('addressCountry', e.target.value)}
            disabled
          />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Coordinates (Latitude, Longitude)</label>
          <input
            type="text"
            value={
              formData.latitude && formData.longitude
                ? `${formData.latitude},${formData.longitude}`
                : ''
            }
            onChange={(e) => {
              const value = e.target.value.trim();
              if (value === '') {
                handleChange('latitude', '');
                handleChange('longitude', '');
              } else {
                const coords = value.split(',').map(c => c.trim());
                if (coords.length === 2) {
                  const lat = coords[0];
                  const lng = coords[1];
                  if (!isNaN(lat) && !isNaN(lng)) {
                    handleChange('latitude', lat);
                    handleChange('longitude', lng);
                  }
                }
              }
            }}
            placeholder="e.g., -6.7924,39.2083"
          />
        </div>
      </div>
      <div className="info-box">
        <MapPin size={18} />
        <span>Interactive map integration can be added for visual pin placement</span>
      </div>
    </div>
  );
};

export default LocationSection;
