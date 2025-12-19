import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/Dashboard/HomePage';
import MembersPage from './pages/Dashboard/MembersPage';
import MembershipPlansPage from './pages/Dashboard/MembershipPlansPage';
import AttendancePage from './pages/Dashboard/AttendancePage';
import ReportsPage from './pages/Dashboard/ReportsPage';
import BillingPage from './pages/Dashboard/BillingPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <HomePage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/members" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <MembersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/membership-plans" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <MembershipPlansPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route             path="/dashboard/attendance" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <AttendancePage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/reports" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/billing" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <BillingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute requireActive={true}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;