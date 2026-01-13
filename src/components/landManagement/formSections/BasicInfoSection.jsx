import React from 'react';

const BasicInfoSection = ({ formData, handleChange }) => {
  return (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Plot Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Sunset View Plot"
          />
        </div>
        <div className="form-group">
          <label>Identifier *</label>
          <input
            type="text"
            value={formData.identifier}
            onChange={(e) => handleChange('identifier', e.target.value)}
            placeholder="e.g., PLOT-001"
          />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed Use">Mixed Use</option>
          </select>
        </div>
        <div className="form-group">
          <label>Land Use</label>
          <input
            type="text"
            value={formData.landUse}
            onChange={(e) => handleChange('landUse', e.target.value)}
            placeholder="e.g., Residential Development"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Detailed description of the property..."
          rows={5}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
