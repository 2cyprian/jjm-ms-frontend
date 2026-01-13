import React from 'react';
import { Edit2 } from 'lucide-react';
import Button from '../Button';

const ListingDetailModal = ({ listing, onClose, onEdit }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{listing.name}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body modal-scrollable">
          {listing.images && listing.images.length > 0 && (
            <div className="detail-images">
              <img
                src={listing.images.find(img => img.isCover)?.url || listing.images[0].url}
                alt={listing.name}
                className="detail-cover-image"
              />
              {listing.images.length > 1 && (
                <div className="detail-gallery">
                  {listing.images.map((img, index) => (
                    <img key={index} src={img.url} alt={`${listing.name} ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-row">
                <span className="detail-label">Identifier:</span>
                <span className="detail-value">{listing.identifier}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{listing.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Land Use:</span>
                <span className="detail-value">{listing.landUse || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{listing.description}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Location</h3>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">
                  {listing.addressLocality}, {listing.addressRegion}, {listing.addressCountry}
                </span>
              </div>
              {listing.latitude && listing.longitude && (
                <div className="detail-row">
                  <span className="detail-label">Coordinates:</span>
                  <span className="detail-value">
                    {listing.latitude}, {listing.longitude}
                  </span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Pricing & Legal</h3>
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value detail-price">{formatPrice(listing.price)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Availability:</span>
                <span className="detail-value">{listing.availability}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Size:</span>
                <span className="detail-value">
                  {listing.floorSizeValue} {listing.floorSizeUnit}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Survey Status:</span>
                <span className="detail-value">{listing.surveyStatus}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Title Deed:</span>
                <span className="detail-value">{listing.titleDeed || 'N/A'}</span>
              </div>
            </div>

            {listing.amenityFeatures && listing.amenityFeatures.length > 0 && (
              <div className="detail-section">
                <h3>Amenities</h3>
                {listing.amenityFeatures.map((amenity, index) => (
                  <div key={index} className="detail-row">
                    <span className="detail-label">{amenity.name}:</span>
                    <span className="detail-value">{amenity.value}</span>
                  </div>
                ))}
              </div>
            )}

            {listing.agent && listing.agent.name && (
              <div className="detail-section">
                <h3>Agent Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{listing.agent.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{listing.agent.jobTitle}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>
            <Edit2 size={16} /> Edit Listing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal;
