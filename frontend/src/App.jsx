import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Business Module Pages (All 9 Sub-Pages)
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { BusinessInventoryPage } from './pages/business/BusinessInventoryPage';
import { BusinessCategoriesPage } from './pages/business/BusinessCategoriesPage';
import { BusinessExpiryAlertsPage } from './pages/business/BusinessExpiryAlertsPage';
import { BusinessWastePredictionPage } from './pages/business/BusinessWastePredictionPage';
import { BusinessDonationsPage } from './pages/business/BusinessDonationsPage';
import { BusinessReportsPage } from './pages/business/BusinessReportsPage';
import { BusinessAnalyticsPage } from './pages/business/BusinessAnalyticsPage';
import { BusinessSettingsPage } from './pages/business/BusinessSettingsPage';

// NGO Module Pages (All 7 Sub-Pages)
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { AvailableFoodPage } from './pages/ngo/AvailableFoodPage';
import { ClaimRequestsPage } from './pages/ngo/ClaimRequestsPage';
import { NgoPickupSchedulePage } from './pages/ngo/NgoPickupSchedulePage';
import { NgoDonationHistoryPage } from './pages/ngo/NgoDonationHistoryPage';
import { NgoBeneficiaryImpactPage } from './pages/ngo/NgoBeneficiaryImpactPage';
import { NgoFeedbackPage } from './pages/ngo/NgoFeedbackPage';

// Super Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { WasteAnalyticsPage } from './pages/admin/WasteAnalyticsPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Dashboard Route Aliases */}
          <Route path="/business-dashboard" element={<Navigate to="/business/dashboard" replace />} />
          <Route path="/ngo-dashboard" element={<Navigate to="/ngo/dashboard" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/super-admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Business Module Routes */}
          <Route
            path="/business/*"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS', 'SUPER_ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<BusinessDashboard />} />
                    <Route path="inventory" element={<BusinessInventoryPage />} />
                    <Route path="categories" element={<BusinessCategoriesPage />} />
                    <Route path="expiry-alerts" element={<BusinessExpiryAlertsPage />} />
                    <Route path="waste-prediction" element={<BusinessWastePredictionPage />} />
                    <Route path="donations" element={<BusinessDonationsPage />} />
                    <Route path="reports" element={<BusinessReportsPage />} />
                    <Route path="analytics" element={<BusinessAnalyticsPage />} />
                    <Route path="settings" element={<BusinessSettingsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* NGO Module Routes */}
          <Route
            path="/ngo/*"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'SUPER_ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<NgoDashboard />} />
                    <Route path="available-food" element={<AvailableFoodPage />} />
                    <Route path="my-claims" element={<ClaimRequestsPage />} />
                    <Route path="pickup-schedule" element={<NgoPickupSchedulePage />} />
                    <Route path="donation-history" element={<NgoDonationHistoryPage />} />
                    <Route path="beneficiary-impact" element={<NgoBeneficiaryImpactPage />} />
                    <Route path="feedback" element={<NgoFeedbackPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Module Routes */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="analytics" element={<WasteAnalyticsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="analytics" element={<WasteAnalyticsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
