import React from 'react';
import Sidebar from '../components/Sidebar';
import Section from '../components/Section';
import FormGrid from '../components/FormGrid';
import Field from '../components/Field';
import TextArea from '../components/TextArea';
import '../css/components/dashboard.css';

function RentalSystem() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={{ margin: 0 }}>Rental Management</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Stub UI components mapped to the integration guide: persons, sponsors, equipment, rentals, and returns. Wire these to
            the backend endpoints in the guide and keep calculations server-side.
          </p>
        </header>

        <Section title="Person (Technician/Custodian/Manager)">
          <FormGrid>
            <Field label="Full Name" required placeholder="John Doe" />
            <Field label="Role" required placeholder="Technician | Custodian | Manager" />
            <Field label="Phone" placeholder="+2557..." />
            <Field label="Identification" placeholder="ID / Passport" />
          </FormGrid>
          <div style={{ marginTop: '12px' }}>
            <TextArea label="Notes" rows={2} placeholder="Special skills, certifications" />
          </div>
        </Section>

        <Section title="Sponsor">
          <FormGrid>
            <Field label="Name" required placeholder="ACME Survey Corp" />
            <Field label="Type" required placeholder="Company | NGO | Individual" />
            <Field label="Contact Person" placeholder="Jane Smith" />
            <Field label="Phone" placeholder="+2557..." />
            <Field label="Email" type="email" placeholder="contact@example.com" />
            <Field label="Agreement Reference" placeholder="AGR-2024-001" />
          </FormGrid>
          <div style={{ marginTop: '12px' }}>
            <TextArea label="Notes" rows={2} placeholder="Contract notes" />
          </div>
        </Section>

        <Section title="Equipment (max 5 images)">
          <FormGrid>
            <Field label="Name" required placeholder="Trimble GPS R10" />
            <Field label="Brand" placeholder="Trimble" />
            <Field label="Model" placeholder="R10" />
            <Field label="Serial Number" required placeholder="SN-12345-UNIQUE" />
            <Field label="Category" required placeholder="Survey | GPS | Drone | Level" />
            <Field label="Rental Rate (TZS/day)" required type="number" placeholder="50000" />
            <Field label="Deposit Amount (TZS)" required type="number" placeholder="500000" />
            <Field label="Condition" placeholder="Good" />
            <Field label="Sponsor ID" placeholder="Optional" />
            <Field label="Responsible Person ID" placeholder="Optional" />
          </FormGrid>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextArea label="Notes" rows={2} placeholder="Calibration info" />
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Images</span>
              <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Drag/drop up to 5, compress before upload)</span>
            </div>
            <div style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', color: '#9ca3af', textAlign: 'center' }}>
              ImageUploader placeholder — hook to /equipment-images then pass URLs to `images` array
            </div>
          </div>
        </Section>

        <Section title="Create Rental">
          <FormGrid>
            <Field label="Equipment ID" required placeholder="Equipment reference" />
            <Field label="Customer Name" required placeholder="ABC Construction Ltd" />
            <Field label="Customer Phone" required placeholder="+2557..." />
            <Field label="Customer ID/Passport" placeholder="ID-67890" />
            <Field label="Start Date" required type="date" />
            <Field label="Expected Return Date" required type="date" />
            <Field label="Rate Per Day (TZS)" type="number" placeholder="Override or leave blank" />
            <Field label="Deposit Paid (TZS)" type="number" placeholder="Override or leave blank" />
          </FormGrid>
          <div style={{ marginTop: '12px' }}>
            <TextArea label="Notes" rows={2} placeholder="Project notes" />
          </div>
        </Section>

        <Section title="Process Return">
          <FormGrid>
            <Field label="Rental ID" required placeholder="Rental reference" />
            <Field label="Actual Return Date" required type="date" />
            <Field label="Condition On Return" required placeholder="New | Good | Needs Service" />
            <Field label="Overdue Reason" placeholder="Required if late" />
          </FormGrid>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextArea label="Damage Notes" rows={2} placeholder="Required if damaged/needs service" />
            <p style={{ margin: 0, color: '#9ca3af' }}>
              Days rented, overdue flag, and total revenue come from the backend response. Do not compute in the UI.
            </p>
          </div>
        </Section>

        {/* Reusable component for displaying KPIs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <KPI title="Total Rentals" value="124" />
          <KPI title="Active Rentals" value="32" />
          <KPI title="Overdue Rentals" value="5" />
          <KPI title="Total Revenue (TZS)" value="2,500,000" />
        </div>

        {/* Reusable component for displaying equipment details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Available Equipment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            <EquipmentCard equipment={{ name: 'Trimble GPS R10', condition: 'Good', available: true }} />
            <EquipmentCard equipment={{ name: 'DJI Phantom 4', condition: 'New', available: false }} />
            <EquipmentCard equipment={{ name: 'Leica Total Station', condition: 'Good', available: true }} />
            <EquipmentCard equipment={{ name: 'Sokkia Set 5', condition: 'Needs Service', available: false }} />
          </div>
        </div>

        {/* Reusable component for displaying rental details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Recent Rentals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RentalDetails rental={{ id: 'RNT-2024-001', customerName: 'ABC Construction Ltd', startDate: '2024-01-10', returnDate: '2024-01-15' }} />
            <RentalDetails rental={{ id: 'RNT-2024-002', customerName: 'XYZ Corp', startDate: '2024-01-12', returnDate: '2024-01-18' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable component for displaying KPIs
function KPI({ title, value }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

// Reusable component for displaying equipment details
function EquipmentCard({ equipment }) {
  return (
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fff' }}>{equipment.name}</h4>
      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>Condition: {equipment.condition}</p>
      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>Available: {equipment.available ? 'Yes' : 'No'}</p>
      <button style={{
        padding: '8px 12px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        marginTop: '8px'
      }}>Rent</button>
    </div>
  );
}

// Reusable component for displaying rental details
function RentalDetails({ rental }) {
  return (
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fff' }}>Rental ID: {rental.id}</h4>
      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>Customer: {rental.customerName}</p>
      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>Start Date: {rental.startDate}</p>
      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>Return Date: {rental.returnDate}</p>
    </div>
  );
}

export default RentalSystem;
