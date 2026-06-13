import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../Button';

const AmenitiesSection = ({
  formData,
  newAmenity,
  setNewAmenity,
  handleAddAmenity,
  handleRemoveAmenity
}) => {
  return (
    <div className="form-section">
      <h3>Amenities & Features</h3>
      <div className="amenities-list">
        {formData.amenityFeatures && formData.amenityFeatures.map((amenity, index) => (
          <div key={index} className="amenity-item">
            <div className="amenity-content">
              <strong>{amenity.name}:</strong> {amenity.value}
            </div>
            <button
              className="btn-remove"
              onClick={() => handleRemoveAmenity(index)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Amenity Name</label>
          <input
            type="text"
            value={newAmenity.name}
            onChange={(e) => setNewAmenity(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Water Supply"
          />
        </div>
        <div className="form-group">
          <label>Value</label>
          <input
            type="text"
            value={newAmenity.value}
            onChange={(e) => setNewAmenity(prev => ({ ...prev, value: e.target.value }))}
            placeholder="e.g., Available"
          />
        </div>
      </div>
      <Button onClick={handleAddAmenity} disabled={!newAmenity.name.trim() || !newAmenity.value.trim()}>
        <Plus size={16} /> Add Amenity
      </Button>
    </div>
  );
};

export default AmenitiesSection;
