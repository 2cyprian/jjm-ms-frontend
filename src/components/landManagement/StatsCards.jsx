import React from 'react';

const StatsCards = ({ listings }) => {
  return (
    <div className="land-stats">
      <div className="stat-card">
        <div className="stat-value">{listings.length}</div>
        <div className="stat-label">Total Listings</div>
      </div>
      <div className="stat-card stat-success">
        <div className="stat-value">
          {listings.filter(l => l.is_published && !l.is_archived).length}
        </div>
        <div className="stat-label">Published</div>
      </div>
      <div className="stat-card stat-warning">
        <div className="stat-value">
          {listings.filter(l => !l.is_published && !l.is_archived).length}
        </div>
        <div className="stat-label">Drafts</div>
      </div>
      <div className="stat-card stat-danger">
        <div className="stat-value">
          {listings.filter(l => l.is_archived).length}
        </div>
        <div className="stat-label">Archived</div>
      </div>
    </div>
  );
};

export default StatsCards;
