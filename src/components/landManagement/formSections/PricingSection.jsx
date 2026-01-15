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
          <select
            value={formData.titleDeed}
            onChange={(e) => handleChange('titleDeed', e.target.value)}
          >
            <option value="">Select Title Deed Status</option>
            <option value="Available">Available</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Not Available">Not Available</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
