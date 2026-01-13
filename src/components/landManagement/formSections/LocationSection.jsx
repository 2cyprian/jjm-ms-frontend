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
          <label>Region *</label>
          <input
            type="text"
            value={formData.addressRegion}
            onChange={(e) => handleChange('addressRegion', e.target.value)}
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
          <label>Latitude</label>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleChange('latitude', e.target.value)}
            placeholder="e.g., -6.7924"
          />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleChange('longitude', e.target.value)}
            placeholder="e.g., 39.2083"
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
