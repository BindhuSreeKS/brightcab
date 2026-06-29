import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import OTPVerification from './pages/auth/OTPVerification';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import DriverManagement from './pages/admin/Drivers';
import CustomerManagement from './pages/admin/Customers';
import RideManagement from './pages/admin/Rides';
import LiveTracking from './pages/admin/LiveTracking';
import WhatsAppBot from './pages/admin/WhatsAppBot';
import PaymentManagement from './pages/admin/Payments';
import ComplaintManagement from './pages/admin/Complaints';
import NotificationManagement from './pages/admin/Notifications';
import ReportsAnalytics from './pages/admin/Reports';

// Driver Onboarding Pages
import OnboardingOverview from './pages/admin/onboarding/Overview';
import ApplicationsList from './pages/admin/onboarding/Applications';
import DocumentVerification from './pages/admin/onboarding/DocumentVerification';
import VehicleVerification from './pages/admin/onboarding/VehicleVerification';
import BackgroundChecks from './pages/admin/onboarding/BackgroundChecks';
import ActivationQueue from './pages/admin/onboarding/ActivationQueue';
import DriverProfileDetails from './pages/admin/onboarding/ApplicationDetails';
import OnboardingAnalytics from './pages/admin/onboarding/Analytics';

// Super Admin Pages
import SuperAdminOverview from './pages/superadmin/Overview';
import SuperAdminManagement from './pages/superadmin/Admins';
import PricingCommission from './pages/superadmin/Pricing';
import CityAreaManagement from './pages/superadmin/Cities';
import RolePermissionSystem from './pages/superadmin/Roles';
import PromotionManagement from './pages/superadmin/Promotions';
import PlatformAnalytics from './pages/superadmin/Analytics';
import AuditLogs from './pages/superadmin/AuditLogs';
import SecurityMonitoring from './pages/superadmin/Security';
import PlatformSettings from './pages/superadmin/Settings';
import FareZonesPage from './pages/superadmin/FareZones';
import SettingsPage from './pages/Settings';



// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverRides from './pages/driver/Rides';
import DriverEarnings from './pages/driver/Earnings';
import DriverNotifications from './pages/driver/Notifications';
import DriverProfile from './pages/driver/Profile';
import ActiveRide from './pages/driver/ActiveRide';
import DriverLogin from './pages/driver/auth/Login';
import DriverRegister from './pages/driver/auth/Register';
import { DriverLayout } from './components/DriverLayout';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import BookRide from './pages/customer/BookRide';
import CustomerActivity from './pages/customer/Activity';
import CustomerWallet from './pages/customer/Wallet';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerProfile from './pages/customer/Profile';
import RideTracking from './pages/customer/Tracking';
import CustomerLogin from './pages/customer/auth/Login';
import CustomerRegister from './pages/customer/auth/Register';
import CustomerOTP from './pages/customer/auth/OTP';
import { CustomerLayout } from './components/CustomerLayout';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OTPVerification />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout role="ADMIN"><AdminDashboard /></DashboardLayout>} />
            
            {/* Driver Onboarding Sub-routes */}
            <Route path="/admin/onboarding" element={<DashboardLayout role="ADMIN"><OnboardingOverview /></DashboardLayout>} />
            <Route path="/admin/onboarding/applications" element={<DashboardLayout role="ADMIN"><ApplicationsList /></DashboardLayout>} />
            <Route path="/admin/onboarding/applications/:id" element={<DashboardLayout role="ADMIN"><DriverProfileDetails /></DashboardLayout>} />
            <Route path="/admin/onboarding/documents" element={<DashboardLayout role="ADMIN"><DocumentVerification /></DashboardLayout>} />
            <Route path="/admin/onboarding/vehicles" element={<DashboardLayout role="ADMIN"><VehicleVerification /></DashboardLayout>} />
            <Route path="/admin/onboarding/approvals" element={<DashboardLayout role="ADMIN"><ApplicationsList /></DashboardLayout>} />
            <Route path="/admin/onboarding/approved" element={<DashboardLayout role="ADMIN"><ApplicationsList /></DashboardLayout>} />
            <Route path="/admin/onboarding/rejected" element={<DashboardLayout role="ADMIN"><ApplicationsList /></DashboardLayout>} />
            <Route path="/admin/onboarding/background" element={<DashboardLayout role="ADMIN"><BackgroundChecks /></DashboardLayout>} />
            <Route path="/admin/onboarding/activation" element={<DashboardLayout role="ADMIN"><ActivationQueue /></DashboardLayout>} />
            <Route path="/admin/onboarding/analytics" element={<DashboardLayout role="ADMIN"><OnboardingAnalytics /></DashboardLayout>} />

            <Route path="/admin/drivers" element={<DashboardLayout role="ADMIN"><DriverManagement /></DashboardLayout>} />
            <Route path="/admin/customers" element={<DashboardLayout role="ADMIN"><CustomerManagement /></DashboardLayout>} />
            <Route path="/admin/rides" element={<DashboardLayout role="ADMIN"><RideManagement /></DashboardLayout>} />
            <Route path="/admin/tracking" element={<DashboardLayout role="ADMIN"><LiveTracking /></DashboardLayout>} />
            <Route path="/admin/whatsapp-bot" element={<DashboardLayout role="ADMIN"><WhatsAppBot /></DashboardLayout>} />
            <Route path="/admin/payments" element={<DashboardLayout role="ADMIN"><PaymentManagement /></DashboardLayout>} />
            <Route path="/admin/complaints" element={<DashboardLayout role="ADMIN"><ComplaintManagement /></DashboardLayout>} />
            <Route path="/admin/notifications" element={<DashboardLayout role="ADMIN"><NotificationManagement /></DashboardLayout>} />
            <Route path="/admin/reports" element={<DashboardLayout role="ADMIN"><ReportsAnalytics /></DashboardLayout>} />
            <Route path="/admin/settings" element={<DashboardLayout role="ADMIN"><SettingsPage /></DashboardLayout>} />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<DashboardLayout role="SUPER_ADMIN"><SuperAdminOverview /></DashboardLayout>} />
            <Route path="/super-admin/admins" element={<DashboardLayout role="SUPER_ADMIN"><SuperAdminManagement /></DashboardLayout>} />
            <Route path="/super-admin/roles" element={<DashboardLayout role="SUPER_ADMIN"><RolePermissionSystem /></DashboardLayout>} />
            <Route path="/super-admin/cities" element={<DashboardLayout role="SUPER_ADMIN"><CityAreaManagement /></DashboardLayout>} />
            <Route path="/super-admin/pricing" element={<DashboardLayout role="SUPER_ADMIN"><PricingCommission /></DashboardLayout>} />
            <Route path="/super-admin/promotions" element={<DashboardLayout role="SUPER_ADMIN"><PromotionManagement /></DashboardLayout>} />
            <Route path="/super-admin/analytics" element={<DashboardLayout role="SUPER_ADMIN"><PlatformAnalytics /></DashboardLayout>} />
            <Route path="/super-admin/audit" element={<DashboardLayout role="SUPER_ADMIN"><AuditLogs /></DashboardLayout>} />
            <Route path="/super-admin/security" element={<DashboardLayout role="SUPER_ADMIN"><SecurityMonitoring /></DashboardLayout>} />
            <Route path="/super-admin/settings" element={<DashboardLayout role="SUPER_ADMIN"><PlatformSettings /></DashboardLayout>} />
            <Route path="/super-admin/fare-zones" element={<DashboardLayout role="SUPER_ADMIN"><FareZonesPage /></DashboardLayout>} />

            {/* Customer Auth */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/customer/verify" element={<CustomerOTP />} />

            {/* Customer App */}
            <Route path="/customer" element={<CustomerLayout><CustomerDashboard /></CustomerLayout>} />
            <Route path="/customer/book" element={<CustomerLayout><BookRide /></CustomerLayout>} />
            <Route path="/customer/activity" element={<CustomerLayout><CustomerActivity /></CustomerLayout>} />
            <Route path="/customer/wallet" element={<CustomerLayout><CustomerWallet /></CustomerLayout>} />
            <Route path="/customer/notifications" element={<CustomerLayout><CustomerNotifications /></CustomerLayout>} />
            <Route path="/customer/profile" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
            <Route path="/customer/tracking" element={<RideTracking />} />
            <Route path="/customer/safety" element={<CustomerLayout><div className="p-4">Safety Center Coming Soon</div></CustomerLayout>} />
            <Route path="/customer/support" element={<CustomerLayout><div className="p-4">Help & Support Coming Soon</div></CustomerLayout>} />
            <Route path="/customer/settings" element={<CustomerLayout><div className="p-4">Settings Coming Soon</div></CustomerLayout>} />

            {/* Driver Auth */}
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/driver/register" element={<DriverRegister />} />

            {/* Driver App */}
            <Route path="/driver" element={<DriverLayout><DriverDashboard /></DriverLayout>} />
            <Route path="/driver/rides" element={<DriverLayout><DriverRides /></DriverLayout>} />
            <Route path="/driver/earnings" element={<DriverLayout><DriverEarnings /></DriverLayout>} />
            <Route path="/driver/notifications" element={<DriverLayout><DriverNotifications /></DriverLayout>} />
            <Route path="/driver/profile" element={<DriverLayout><DriverProfile /></DriverLayout>} />
            <Route path="/driver/active-ride" element={<ActiveRide />} />
            <Route path="/driver/safety" element={<DriverLayout><div className="p-4">Safety Center Coming Soon</div></DriverLayout>} />
            <Route path="/driver/support" element={<DriverLayout><div className="p-4">Support Center Coming Soon</div></DriverLayout>} />
            <Route path="/driver/settings" element={<DriverLayout><div className="p-4">Settings Coming Soon</div></DriverLayout>} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
