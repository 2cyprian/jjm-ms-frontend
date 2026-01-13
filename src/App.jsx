// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './utils/toast';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CustomerUpload from './pages/CustomerUpload';
import StaffDashboard from './pages/staffDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminInventory from './pages/AdminInventory';
import AdminDashboard from './pages/AdminDashboard';
import BranchManagement from './pages/BranchManagement';
import AdminLandManagement from './pages/AdminLandManagement';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute>
                <CustomerUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin-only routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner']}>
                <AdminInventory />
              </ProtectedRoute>
            } 
          />
          
          {/* Manager/Admin routes */}
          <Route 
            path="/branches" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner', 'manager']}>
                <BranchManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Land Management route */}
          <Route 
            path="/land" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner']}>
                <AdminLandManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;