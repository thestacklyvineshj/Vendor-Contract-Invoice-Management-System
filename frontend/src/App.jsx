import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import VendorDashboard from './pages/vendor/VendorDashboard';
import UploadInvoice from './pages/vendor/UploadInvoice';
import MyContracts from './pages/vendor/MyContracts';
import InvoiceHistory from './pages/vendor/InvoiceHistory';

import FinanceDashboard from './pages/finance/FinanceDashboard';
import ApprovalDashboard from './pages/finance/ApprovalDashboard';
import PendingReview from './pages/finance/PendingReview';
import PaymentManagement from './pages/finance/PaymentManagement';

import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import ContractManagement from './pages/admin/ContractManagement';

const RoleRedirect = () => {
  const { user, loading, getDashboardRoute } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardRoute()} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          <Route path="/vendor" element={<ProtectedRoute allowedRoles={['VENDOR']}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/upload" element={<ProtectedRoute allowedRoles={['VENDOR']}><UploadInvoice /></ProtectedRoute>} />
          <Route path="/vendor/contracts" element={<ProtectedRoute allowedRoles={['VENDOR']}><MyContracts /></ProtectedRoute>} />
          <Route path="/vendor/invoices" element={<ProtectedRoute allowedRoles={['VENDOR']}><InvoiceHistory /></ProtectedRoute>} />

          <Route path="/finance" element={<ProtectedRoute allowedRoles={['FINANCE_MANAGER']}><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/finance/approvals" element={<ProtectedRoute allowedRoles={['FINANCE_MANAGER']}><ApprovalDashboard /></ProtectedRoute>} />
          <Route path="/finance/pending" element={<ProtectedRoute allowedRoles={['FINANCE_MANAGER']}><PendingReview /></ProtectedRoute>} />
          <Route path="/finance/payments" element={<ProtectedRoute allowedRoles={['FINANCE_MANAGER']}><PaymentManagement /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsDashboard /></ProtectedRoute>} />
          <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['ADMIN']}><VendorManagement /></ProtectedRoute>} />
          <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={['ADMIN']}><ContractManagement /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
