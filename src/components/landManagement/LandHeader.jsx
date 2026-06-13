import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import Button from '../Button';

const LandHeader = ({ onCreateListing, onViewRequests }) => {
  return (
    <div className="land-header">
      <div>
        <h1 className="land-title">Land & Plot Management</h1>
        <p className="land-subtitle">Manage property listings for JJM GEODATA</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="info" onClick={onViewRequests}>
          <Calendar size={18} /> View All Requests
        </Button>
        <Button onClick={onCreateListing}>
          <Plus size={18} /> Add New Listing
        </Button>
      </div>
    </div>
  );
};

export default LandHeader;
