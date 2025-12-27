// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './utils/toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CustomerUpload from './pages/CustomerUpload';
import StaffDashboard from './pages/staffDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminInventory from './pages/AdminInventory';
import AdminDashboard from './pages/AdminDashboard';
import BranchManagement from './pages/BranchManagement';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer" element={<CustomerUpload />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminSettings />} />
          <Route path="/inventory" element={<AdminInventory />} />
          <Route path="/branches" element={<BranchManagement />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;