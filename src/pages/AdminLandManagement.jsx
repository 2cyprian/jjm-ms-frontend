import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../utils/toast';
import { getLandListings, createLandListing, updateLandListing, deleteLandListing, publishLandListing, archiveLandListing } from '../utils/api';
import LandHeader from '../components/landManagement/LandHeader';
import LandFiltersBar from '../components/landManagement/LandFiltersBar';
import StatsCards from '../components/landManagement/StatsCards';
import ListingsTable from '../components/landManagement/ListingsTable';
import ListingFormModal from '../components/landManagement/ListingFormModal';
import ListingDetailModal from '../components/landManagement/ListingDetailModal';
import AllVisitRequestsModal from '../components/landManagement/AllVisitRequestsModal';
import '../css/components/landManagement.css';

const AdminLandManagement = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Load listings from API on mount
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getLandListings();
      const listingsArray = Array.isArray(data) ? data : [];
      setListings(listingsArray);
      setFilteredListings(listingsArray);
    } catch (err) {
      console.error('Error loading listings:', err);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(term) ||
        listing.identifier.toLowerCase().includes(term) ||
        (listing.addressLocality && listing.addressLocality.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(listing => listing.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(listing => listing.offers.availability === availabilityFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(listing => listing.addressRegion === regionFilter);
    }

    setFilteredListings(filtered);
  }, [searchTerm, categoryFilter, availabilityFilter, regionFilter, listings]);

  const handleCreateListing = () => {
    setSelectedListing(null);
    setShowCreateModal(true);
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        setLoading(true);
        await deleteLandListing(listingId);
        toast.success('Listing deleted successfully');
        await loadListings();
      } catch (err) {
        console.error('Error deleting listing:', err);
        const msg = err?.response?.data?.detail || 'Failed to delete listing';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveListing = async (listingData) => {
    try {
      setLoading(true);
      console.log('=== LAND LISTING DATA BEING SENT TO BACKEND ===');
      console.log('Full listing data:', listingData);
      console.log('Images data:', listingData.images);
      console.log('Images count:', listingData.images?.length || 0);
      if (listingData.images && listingData.images.length > 0) {
        console.log('First image:', listingData.images[0]);
      }
      console.log('Location - Latitude:', listingData.latitude, 'Longitude:', listingData.longitude);
      console.log('========================================');
      
      if (listingData.id) {
        // Edit existing
        console.log('Updating existing listing with ID:', listingData.id);
        await updateLandListing(listingData.id, listingData);
        toast.success('Listing updated successfully');
      } else {
        // Create new
        console.log('Creating new listing');
        await createLandListing(listingData);
        toast.success('Listing created successfully');
      }
      setShowCreateModal(false);
      setShowEditModal(false);
      await loadListings();
    } catch (err) {
      console.error('Error saving listing:', err);
      const msg = err?.response?.data?.detail || 'Failed to save listing';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishListing = async (listingId) => {
    try {
      setLoading(true);
      console.log('[PUBLISH] Publishing listing ID:', listingId);
      
      // Call API and get the updated listing data
      const updatedListing = await publishLandListing(listingId);
      console.log('[PUBLISH] API returned updated listing:', updatedListing);
      
      // Update listings with the API response (source of truth)
      setListings(prevListings =>
        prevListings.map(listing =>
          listing.id === listingId
            ? { ...listing, ...updatedListing }
            : listing
        )
      );
      
      setFilteredListings(prevListings =>
        prevListings.map(listing =>
          listing.id === listingId
            ? { ...listing, ...updatedListing }
            : listing
        )
      );
      
      console.log('[PUBLISH] State updated with API response');
      toast.success('Listing published successfully');
    } catch (err) {
      console.error('Error publishing listing:', err);
      const msg = err?.response?.data?.detail || 'Failed to publish listing';
      toast.error(msg);
      // Reload to revert on error
      await loadListings();
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveListing = async (listingId) => {
    if (window.confirm('Are you sure you want to archive this listing?')) {
      try {
        setLoading(true);
        console.log('[ARCHIVE] Archiving listing ID:', listingId);
        
        // Call API and get the updated listing data
        const updatedListing = await archiveLandListing(listingId);
        console.log('[ARCHIVE] API returned updated listing:', updatedListing);
        
        // Update listings with the API response (source of truth)
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === listingId
              ? { ...listing, ...updatedListing }
              : listing
          )
        );
        
        setFilteredListings(prevListings =>
          prevListings.map(listing =>
            listing.id === listingId
              ? { ...listing, ...updatedListing }
              : listing
          )
        );
        
        console.log('[ARCHIVE] State updated with API response');
        toast.success('Listing archived successfully');
      } catch (err) {
        console.error('Error archiving listing:', err);
        const msg = err?.response?.data?.detail || 'Failed to archive listing';
        toast.error(msg);
        // Reload to revert on error
        await loadListings();
      } finally {
        setLoading(false);
      }
    }
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(listings.map(l => l.addressRegion))];
    return regions.filter(Boolean);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <LandHeader 
          onCreateListing={handleCreateListing}
          onViewRequests={() => setShowAllRequests(true)}
        />
        <LandFiltersBar
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          availabilityFilter={availabilityFilter}
          regionFilter={regionFilter}
          regions={getUniqueRegions()}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onAvailabilityChange={setAvailabilityFilter}
          onRegionChange={setRegionFilter}
        />
        <StatsCards listings={listings} />
        <ListingsTable
          filteredListings={filteredListings}
          listings={listings}
          onViewDetails={(listing) => setSelectedListing(listing)}
          onEditListing={handleEditListing}
          onPublishListing={handlePublishListing}
          onArchiveListing={handleArchiveListing}
          onDeleteListing={handleDeleteListing}
          onCreateListing={handleCreateListing}
        />

        {(showCreateModal || showEditModal) && (
          <ListingFormModal
            listing={selectedListing}
            onSave={handleSaveListing}
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setSelectedListing(null);
            }}
          />
        )}

        {selectedListing && !showEditModal && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onEdit={() => {
              setShowEditModal(true);
            }}
          />
        )}

        {showAllRequests && (
          <AllVisitRequestsModal
            onClose={() => setShowAllRequests(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLandManagement;
