import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import RentalSubnav from '../components/RentalSubnav';
import PersonsList from '../components/rentals/PersonsList';
import PersonForm from '../components/rentals/PersonForm';
import EquipmentList from '../components/rentals/EquipmentList';
import EquipmentDetail from '../components/rentals/EquipmentDetail';
import EquipmentForm from '../components/rentals/EquipmentForm';
import RentalsList from '../components/rentals/RentalsList';
import RentalDetail from '../components/rentals/RentalDetail';
import SponsorsList from '../components/rentals/SponsorsList';
import SponsorForm from '../components/rentals/SponsorForm';
import CreateRentalFlow from '../components/rentals/CreateRentalFlow';
import ReturnRentalModal from '../components/rentals/ReturnRentalModal';
import '../css/components/dashboard.css';

function RentalManagement() {
  const [activeTab, setActiveTab] = useState('rentals');
  const [view, setView] = useState('list'); // list, form, detail
  const [selectedId, setSelectedId] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [equipmentRefreshTrigger, setEquipmentRefreshTrigger] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setView('list');
    setSelectedId(null);
  };

  const handleEditPerson = (personId) => {
    setSelectedId(personId);
    setView('form');
  };

  const handleSavePerson = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleViewPerson = (personId) => {
    setSelectedId(personId);
    setView('detail');
  };

  const handleCreateRentalFromPerson = (personId) => {
    setSelectedId(personId);
    setActiveTab('rentals');
    setView('createRental');
  };

  const handleEditEquipment = (equipmentId) => {
    setSelectedId(equipmentId);
    setView('form');
  };

  const handleSaveEquipment = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleViewEquipment = (equipmentId) => {
    setSelectedId(equipmentId);
    setView('detail');
  };

  const handleEditSponsor = (sponsorId) => {
    setSelectedId(sponsorId);
    setView('form');
  };

  const handleSaveSponsor = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleViewSponsor = (sponsorId) => {
    setSelectedId(sponsorId);
    setView('detail');
  };

  const handleCreateRental = () => {
    setSelectedId(null);
    setView('createRental');
  };

  const handleViewRentalDetail = (rentalId) => {
    setSelectedId(rentalId);
    setView('detail');
  };

  const handleReturnRental = (rentalId) => {
    console.log('Opening return modal for rental:', rentalId);
    setSelectedId(rentalId);
    setShowReturnModal(true);
  };

  const renderContent = () => {
    if (activeTab === 'rentals') {
      if (view === 'list') {
        return (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <RentalsList
              onCreateRental={handleCreateRental}
              onViewDetail={handleViewRentalDetail}
              onReturn={handleReturnRental}
              key={refreshTrigger}
            />
          </div>
        );
      } else if (view === 'createRental') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <CreateRentalFlow
              onSave={() => {
                setView('list');
                setSelectedId(null);
                setRefreshTrigger(prev => prev + 1);
                setEquipmentRefreshTrigger(prev => prev + 1);
              }}
              onCancel={() => {
                setView('list');
                setSelectedId(null);
              }}
            />
          </div>
        );
      } else if (view === 'detail') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <RentalDetail
              rentalId={selectedId}
              onBack={() => {
                setView('list');
                setSelectedId(null);
              }}
              onReturn={handleReturnRental}
            />
          </div>
        );
      }
    } else if (activeTab === 'persons') {
      if (view === 'list') {
        return (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <PersonsList
                onEdit={handleEditPerson}
                onView={handleViewPerson}
                onCreateRental={handleCreateRentalFromPerson}
              />
            </div>
          </div>
        );
      } else if (view === 'form') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{selectedId ? 'Edit Person' : 'Create Person'}</h3>
            <PersonForm
              personId={selectedId}
              onSave={handleSavePerson}
              onCancel={() => {
                setView('list');
                setSelectedId(null);
              }}
            />
          </div>
        );
      } else if (view === 'detail') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Person Profile</h3>
            <p style={{ color: '#6b7280' }}>Person ID: {selectedId}</p>
            <p style={{ color: '#9ca3af' }}>Profile tabs: Details | Rental History | Active Rentals | Overdue Incidents</p>
          </div>
        );
      }
    } else if (activeTab === 'equipment') {
      if (view === 'list') {
        return (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <EquipmentList
                onEdit={handleEditEquipment}
                onView={handleViewEquipment}
                onCreateRental={handleCreateRental}
                key={equipmentRefreshTrigger}
              />
            </div>
          </div>
        );
      } else if (view === 'form') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto', maxWidth: '100%' }}>
            <h3 style={{ marginTop: 0 }}>{selectedId ? 'Edit Equipment' : 'Add Equipment'}</h3>
            <EquipmentForm
              equipmentId={selectedId}
              onSave={handleSaveEquipment}
              onCancel={() => {
                setView('list');
                setSelectedId(null);
              }}
            />
          </div>
        );
      } else if (view === 'detail') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <EquipmentDetail
              equipmentId={selectedId}
              onBack={() => {
                setView('list');
                setSelectedId(null);
              }}
              onEdit={(equipmentId) => {
                setSelectedId(equipmentId);
                setView('form');
              }}
            />
          </div>
        );
      }
    } else if (activeTab === 'sponsors') {
      if (view === 'list') {
        return (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <SponsorsList
                onEdit={handleEditSponsor}
                onView={handleViewSponsor}
              />
            </div>
          </div>
        );
      } else if (view === 'form') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto', maxWidth: '100%' }}>
            <h3 style={{ marginTop: 0 }}>{selectedId ? 'Edit Sponsor' : 'Create Sponsor'}</h3>
            <SponsorForm
              sponsorId={selectedId}
              onSave={handleSaveSponsor}
              onCancel={() => {
                setView('list');
                setSelectedId(null);
              }}
            />
          </div>
        );
      } else if (view === 'detail') {
        return (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Sponsor Profile</h3>
            <p style={{ color: '#6b7280' }}>Sponsor ID: {selectedId}</p>
            <p style={{ color: '#9ca3af' }}>Profile tabs: Info | Sponsored Rentals | Financial Summary</p>
          </div>
        );
      }
    } else if (activeTab === 'reports') {
      return (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>Reports & Statistics</h3>
          <p style={{ color: '#9ca3af' }}>Component placeholder - RentalsDashboard with stats and charts to be implemented</p>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', overflow: 'hidden' }}>
        <RentalSubnav active={activeTab} onTabChange={handleTabChange} />
        <div style={{ 
          padding: '24px', 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          flex: 1,
          backgroundColor: '#f3f4f6'
        }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ margin: 0 }}>Rental Management System</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Professional flow: Actors → Assets → Contracts → Lifecycle
            </p>
          </header>

          {renderContent()}
        </div>
      </div>
      
      {/* Return Rental Modal */}
      {showReturnModal && (
        <>
          {console.log('Rendering ReturnRentalModal with rentalId:', selectedId)}
          <ReturnRentalModal
            rentalId={selectedId}
            onClose={() => {
              console.log('Closing return modal');
              setShowReturnModal(false);
              setSelectedId(null);
            }}
            onSuccess={() => {
              console.log('Return successful');
              setShowReturnModal(false);
              setSelectedId(null);
              setView('list');
              setRefreshTrigger(prev => prev + 1);
              setEquipmentRefreshTrigger(prev => prev + 1);
            }}
          />
        </>
      )}
    </div>
  );
}

export default RentalManagement;
