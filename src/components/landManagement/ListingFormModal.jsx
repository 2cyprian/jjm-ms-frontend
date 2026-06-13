import React, { useState } from 'react';
import { FileText, MapPin, DollarSign, Sparkles, User, Image } from 'lucide-react';
import Button from '../Button';
import { useToast } from '../../utils/toast';
import { uploadMultipleImages } from '../../utils/cloudinary';
import BasicInfoSection from './formSections/BasicInfoSection';
import LocationSection from './formSections/LocationSection';
import PricingSection from './formSections/PricingSection';
import AmenitiesSection from './formSections/AmenitiesSection';
import AgentSection from './formSections/AgentSection';
import ImagesSection from './formSections/ImagesSection';

const defaultFormData = {
  name: '',
  description: '',
  identifier: '',
  category: 'Residential',
  addressLocality: '',
  addressRegion: '',
  addressCountry: 'Tanzania',
  latitude: '',
  longitude: '',
  price: '',
  priceCurrency: 'TZS',
  availability: 'InStock',
  floorSizeValue: '',
  floorSizeUnit: 'SQM',
  landUse: '',
  surveyStatus: 'Pending',
  titleDeed: '',
  amenityFeatures: [],
  agent: {
    name: '',
    jobTitle: ''
  },
  images: []
};

const ListingFormModal = ({ listing, onSave, onClose }) => {
  const [formData, setFormData] = useState(() => {
    if (!listing) return defaultFormData;
    return {
      ...defaultFormData,
      ...listing,
      agent: {
        name: listing?.agent?.name || '',
        jobTitle: listing?.agent?.jobTitle || ''
      },
      amenityFeatures: listing?.amenityFeatures || [],
      images: listing?.images || []
    };
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [newAmenity, setNewAmenity] = useState({ name: '', value: '' });
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      agent: {
        ...prev.agent,
        [field]: value
      }
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.name.trim() && newAmenity.value.trim()) {
      setFormData(prev => ({
        ...prev,
        amenityFeatures: [...prev.amenityFeatures, { ...newAmenity }]
      }));
      setNewAmenity({ name: '', value: '' });
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenityFeatures: prev.amenityFeatures.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadResults = await uploadMultipleImages(files, {
        folder: 'jjm-geodata/land-listings',
        tags: ['land', 'property'],
      });

      const newImages = uploadResults.map((result, index) => ({
        url: result.url,
        isCover: formData.images.length === 0 && index === 0,
        order: formData.images.length + index,
        label: files[index].name || `Image ${formData.images.length + index + 1}`,
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCoverImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isCover: i === index
      }))
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Plot name is required');
      return;
    }
    if (!formData.identifier.trim()) {
      toast.error('Identifier is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    const finalData = {
      ...formData,
      url: `/land/${formData.identifier.toLowerCase().replace(/\s+/g, '-')}`
    };

    onSave(finalData);
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <FileText size={18} /> },
    { id: 'location', label: 'Location', icon: <MapPin size={18} /> },
    { id: 'pricing', label: 'Pricing & Legal', icon: <DollarSign size={18} /> },
    { id: 'amenities', label: 'Amenities', icon: <Sparkles size={18} /> },
    { id: 'agent', label: 'Agent Info', icon: <User size={18} /> },
    { id: 'images', label: 'Images', icon: <Image size={18} /> }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{listing ? 'Edit Listing' : 'Create New Listing'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="form-sections">
          {sections.map(section => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        <div className="modal-body modal-scrollable">
          {activeSection === 'basic' && <BasicInfoSection formData={formData} handleChange={handleChange} />}
          {activeSection === 'location' && <LocationSection formData={formData} handleChange={handleChange} />}
          {activeSection === 'pricing' && <PricingSection formData={formData} handleChange={handleChange} />}
          {activeSection === 'amenities' && (
            <AmenitiesSection
              formData={formData}
              newAmenity={newAmenity}
              setNewAmenity={setNewAmenity}
              handleAddAmenity={handleAddAmenity}
              handleRemoveAmenity={handleRemoveAmenity}
            />
          )}
          {activeSection === 'agent' && <AgentSection formData={formData} handleAgentChange={handleAgentChange} />}
          {activeSection === 'images' && (
            <ImagesSection
              formData={formData}
              uploading={uploading}
              handleImageUpload={handleImageUpload}
              handleSetCoverImage={handleSetCoverImage}
              handleRemoveImage={handleRemoveImage}
            />
          )}
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {listing ? 'Update Listing' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingFormModal;
