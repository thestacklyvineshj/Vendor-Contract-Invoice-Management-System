import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, APP_SHORT_NAME } from '../utils/constants';

const NAV_LINKS = {
  ADMIN: [
    { to: '/admin', label: 'Analytics', icon: '📊' },
    { to: '/admin/vendors', label: 'Vendors', icon: '🏢' },
    { to: '/admin/contracts', label: 'Contracts', icon: '📄' },
  ],
  FINANCE_MANAGER: [
    { to: '/finance', label: 'Dashboard', icon: '📊' },
    { to: '/finance/approvals', label: 'Approvals', icon: '✅' },
    { to: '/finance/pending', label: 'Pending Review', icon: '⏳' },
    { to: '/finance/payments', label: 'Payments', icon: '💳' },
  ],
  VENDOR: [
    { to: '/vendor', label: 'Dashboard', icon: '📊' },
    { to: '/vendor/upload', label: 'Upload Invoice', icon: '📤' },
    { to: '/vendor/contracts', label: 'My Contracts', icon: '📄' },
    { to: '/vendor/invoices', label: 'Invoice History', icon: '📋' },
  ],
};

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = NAV_LINKS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-brand-900 text-white transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-brand-800 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold">
            {APP_SHORT_NAME}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{APP_SHORT_NAME}</p>
            <p className="truncate text-[10px] text-brand-200 leading-tight">Contract & Invoice Mgmt</p>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-brand-700 text-white' : 'text-brand-100 hover:bg-brand-800'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-brand-800 p-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-brand-300">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              <p className="hidden text-xs text-slate-500 sm:block">{APP_NAME}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
