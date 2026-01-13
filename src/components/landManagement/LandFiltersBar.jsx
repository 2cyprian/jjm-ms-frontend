import React from 'react';
import { Search } from 'lucide-react';

const LandFiltersBar = ({
  searchTerm,
  categoryFilter,
  availabilityFilter,
  regionFilter,
  regions,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onRegionChange
}) => {
  return (
    <div className="land-filters">
      <div className="filter-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by name, identifier, or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-dropdowns">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Mixed Use">Mixed Use</option>
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="InStock">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>

        <select
          value={regionFilter}
          onChange={(e) => onRegionChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LandFiltersBar;
