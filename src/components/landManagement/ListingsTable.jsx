import React from 'react';
import { Eye, Edit2, Trash2, MapPin, Plus } from 'lucide-react';
import Button from '../Button';

const ListingsTable = ({
  filteredListings,
  listings,
  onViewDetails,
  onEditListing,
  onPublishListing,
  onArchiveListing,
  onDeleteListing,
  onCreateListing
}) => {
  const getStatusBadgeColor = (listing) => {
    if (listing.is_archived) return 'badge-secondary';
    if (listing.is_published) return 'badge-success';
    return 'badge-warning';
  };

  const getStatusText = (listing) => {
    if (listing.is_archived) return 'Archived';
    if (listing.is_published) return 'Published';
    return 'Draft';
  };

  const formatPrice = (price) => {
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
      return `TZS ${formatted}`;
    } catch (error) {
      return `TZS ${price.toLocaleString()}`;
    }
  };

  if (filteredListings.length === 0) {
    return (
      <div className="empty-state">
        <MapPin size={48} />
        <h3>No listings found</h3>
        <p>
          {listings.length === 0
            ? 'Create your first property listing to get started'
            : 'Try adjusting your filters'}
        </p>
        {listings.length === 0 && (
          <Button onClick={onCreateListing}>
            <Plus size={18} /> Create First Listing
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="land-table-container">
      <table className="land-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Plot Name</th>
            <th>Location</th>
            <th>Category</th>
            <th>Price in M</th>
            <th>Size</th>
            <th>Status</th>
            <th>Date Posted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredListings.map(listing => (
            <tr key={listing.id}>
              <td>
                <div className="listing-thumbnail">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images.find(img => img.isCover)?.url || listing.images[0].url}
                      alt={listing.name}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <MapPin size={24} />
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="listing-name">
                  {listing.name}
                  <span className="listing-identifier">{listing.identifier}</span>
                </div>
              </td>
              <td>
                <div className="listing-location">
                  <MapPin size={14} />
                  {listing.addressLocality}, {listing.addressRegion}
                </div>
              </td>
              <td>
                <span className="category-badge">{listing.category}</span>
              </td>
              <td>
                <div className="listing-price">
                  {formatPrice(listing.price)}
                </div>
              </td>
              <td>
                {listing.floorSizeValue} {listing.floorSizeUnit}
              </td>
              <td>
                <span className={`status-badge ${getStatusBadgeColor(listing)}`}>
                  {getStatusText(listing)}
                </span>
              </td>
              <td>
                {listing.datePosted ? new Date(listing.datePosted).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="action-btn action-view"
                    onClick={() => onViewDetails(listing)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-btn action-edit"
                    onClick={() => onEditListing(listing)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  {!listing.is_published && !listing.is_archived && (
                    <button
                      className="action-btn action-publish"
                      onClick={() => onPublishListing(listing.id)}
                      title="Publish"
                    >
                      ✓
                    </button>
                  )}
                  {listing.is_published && !listing.is_archived && (
                    <button
                      className="action-btn action-archive"
                      onClick={() => onArchiveListing(listing.id)}
                      title="Archive"
                    >
                      📦
                    </button>
                  )}
                  <button
                    className="action-btn action-delete"
                    onClick={() => onDeleteListing(listing.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingsTable;
