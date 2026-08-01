import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import { NotificationCenterModal } from './NotificationCenterModal';
import { LogOut, Utensils, Bell } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getNotifications('UNREAD');
      if (res.success && res.data) {
        setUnreadCount(res.data.length);
      }
    } catch (err) {
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, isNotifModalOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow">
            <Utensils className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            Food<span className="text-emerald-600">Save</span> AI
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell Button -> Opens NotificationCenterModal */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors relative"
            title="Notification Center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {user && (
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-800">{user.name || user.email}</span>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role-Based Notification Center Modal */}
      <NotificationCenterModal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} />
    </header>
  );
};
