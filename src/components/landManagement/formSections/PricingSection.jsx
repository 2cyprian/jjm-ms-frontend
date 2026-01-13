import React from 'react';
import { DollarSign } from 'lucide-react';

const PricingSection = ({ formData, handleChange }) => {
  return (
    <div className="form-section">
      <h3>Pricing & Legal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Price (TZS) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="e.g., 50000000"
          />
        </div>
        <div className="form-group">
          <label>Availability Status *</label>
          <select
            value={formData.availability}
            onChange={(e) => handleChange('availability', e.target.value)}
          >
            <option value="InStock">Available (In Stock)</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
        <div className="form-group">
          <label>Floor Size *</label>
          <input
            type="number"
            value={formData.floorSizeValue}
            onChange={(e) => handleChange('floorSizeValue', e.target.value)}
            placeholder="e.g., 1000"
          />
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select
            value={formData.floorSizeUnit}
            onChange={(e) => handleChange('floorSizeUnit', e.target.value)}
          >
            <option value="SQM">Square Meters (SQM)</option>
            <option value="ACRE">Acres</option>
            <option value="HECTARE">Hectares</option>
          </select>
        </div>
        <div className="form-group">
          <label>Survey Status *</label>
          <select
            value={formData.surveyStatus}
            onChange={(e) => handleChange('surveyStatus', e.target.value)}
          >
            <option value="Pending">Pending Survey</option>
            <option value="Fully Surveyed">Fully Surveyed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Title Deed Status</label>
          <input
            type="text"
            value={formData.titleDeed}
            onChange={(e) => handleChange('titleDeed', e.target.value)}
            placeholder="e.g., Available, Processing, etc."
          />
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
