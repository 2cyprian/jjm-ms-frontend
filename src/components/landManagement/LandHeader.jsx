import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../Button';

const LandHeader = ({ onCreateListing }) => {
  return (
    <div className="land-header">
      <div>
        <h1 className="land-title">Land & Plot Management</h1>
        <p className="land-subtitle">Manage property listings for JJM GEODATA</p>
      </div>
      <Button onClick={onCreateListing}>
        <Plus size={18} /> Create New Listing
      </Button>
    </div>
  );
};

export default LandHeader;
