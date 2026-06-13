import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '../utils/api';
import { useToast } from '../utils/toast';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import ServiceForm from '../components/adminDashboard/ServiceForm';
import ServiceTable from '../components/adminDashboard/ServiceTable';
import '../css/components/inventory.css';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'printing',
    description: '',
    field_schema: {
      fields: []
    },
    pricing_config: {
      model: 'fixed',
      base_price: 0
    }
  });
  const toast = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      console.log('Loaded services:', data);
      setServices(data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setCurrentService(null);
    setFormData({
      name: '',
      category: 'printing',
      description: '',
      field_schema: {
        fields: []
      },
      pricing_config: {
        model: 'fixed',
        base_price: 0
      }
    });
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setFormData({
      name: service.name || '',
      category: service.category || 'printing',
      description: service.description || '',
      field_schema: service.field_schema || {
        fields: []
      },
      pricing_config: service.pricing_config || {
        model: 'fixed',
        base_price: 0
      }
    });
    setShowModal(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      await deleteService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service");
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API - convert empty price to 0
      const submitData = {
        ...formData,
        pricing_config: {
          model: formData.pricing_config.model,
          base_price: formData.pricing_config.base_price === '' || isNaN(formData.pricing_config.base_price)
            ? 0
            : parseFloat(formData.pricing_config.base_price)
        }
      };

      if (currentService) {
        await updateService(currentService.id, submitData);
        setServices(services.map(s => s.id === currentService.id ? { ...currentService, ...submitData } : s));
        toast.success('Service updated successfully');
      } else {
        const newService = await createService(submitData);
        setServices([...services, newService]);
        toast.success('Service created successfully');
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('pricing_')) {
      const pricingField = name.replace('pricing_', '');
      // For price field, allow empty string but don't parse it yet
      const fieldValue = pricingField === 'base_price'
        ? (value === '' ? '' : value)
        : value;
      
      setFormData({
        ...formData,
        pricing_config: {
          ...formData.pricing_config,
          [pricingField]: fieldValue
        }
      });
    } else if (name.startsWith('field_schema_')) {
      // Placeholder for field_schema changes
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && services.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading services...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h2>Services</h2>
            <div className="subtitle">Manage your service offerings</div>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleAddService} icon="add">
              Add Service
            </Button>
          </div>
        </div>

        {/* Services Table */}
        <ServiceTable 
          services={filteredServices}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      </main>

      {/* Service Modal */}
      {showModal && (
        <ServiceForm
          currentService={currentService}
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSaveService}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AdminServices;
