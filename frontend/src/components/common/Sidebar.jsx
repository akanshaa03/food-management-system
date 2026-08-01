import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Sparkles,
  HeartHandshake,
  FileText,
  BarChart3,
  Settings,
  Users,
  Shield,
  Truck,
  History,
  Award,
  MessageSquare,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() || 'NGO';

  const navItems = {
    BUSINESS: [
      { to: '/business/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/business/inventory', label: 'Inventory', icon: Package },
      { to: '/business/expiry-alerts', label: 'Expiry Alerts', icon: AlertTriangle },
      { to: '/business/waste-prediction', label: 'Waste Prediction', icon: Sparkles },
      { to: '/business/donations', label: 'Donations', icon: HeartHandshake },
      { to: '/business/reports', label: 'Reports', icon: FileText },
      { to: '/business/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/business/settings', label: 'Settings', icon: Settings },
    ],
    NGO: [
      { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/ngo/available-food', label: 'Available Donations', icon: Package },
      { to: '/ngo/my-claims', label: 'Accepted Donations', icon: HeartHandshake },
      { to: '/ngo/pickup-schedule', label: 'Pickup Schedule', icon: Truck },
      { to: '/ngo/donation-history', label: 'Donation History', icon: History },
      { to: '/ngo/beneficiary-impact', label: 'Beneficiary Impact', icon: Award },
      { to: '/ngo/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    SUPER_ADMIN: [
      { to: '/admin/dashboard', label: 'Admin Command Center', icon: LayoutDashboard },
      { to: '/business/dashboard', label: 'Business Module', icon: Package },
      { to: '/ngo/dashboard', label: 'NGO Module', icon: HeartHandshake },
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/analytics', label: 'Waste Analytics', icon: BarChart3 },
    ],
  };

  const currentNav = navItems[role] || navItems.NGO;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          {role} Portal Navigation
        </div>
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {role === 'SUPER_ADMIN' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-amber-800 text-xs font-semibold">
          <Shield className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <span>Super Admin Override Active</span>
        </div>
      )}
    </aside>
  );
};
