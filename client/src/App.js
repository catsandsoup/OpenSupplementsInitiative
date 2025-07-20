import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SupplementForm from './pages/SupplementForm';
import SupplementDetail from './pages/SupplementDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminReviewPage from './pages/AdminReviewPage';
import PublicCatalog from './pages/PublicCatalog';
import PublicProductDetail from './pages/PublicProductDetail';
import CertificateVerification from './pages/CertificateVerification';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/catalog" element={<PublicCatalog />} />
          <Route path="/product/:id" element={<PublicProductDetail />} />
          <Route path="/verify/:osiNumber?" element={<CertificateVerification />} />
          
          {/* Auth routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/review/:id" 
            element={user?.role === 'admin' ? <AdminReviewPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/supplement/new" 
            element={user ? <SupplementForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/supplement/:id/edit" 
            element={user ? <SupplementForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/supplement/:id" 
            element={user ? <SupplementDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/catalog"} />} 
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;