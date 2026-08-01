import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Bell,
  CheckCircle2,
  Archive,
  AlertTriangle,
  HeartHandshake,
  Truck,
  UserPlus,
  ShieldAlert,
  Inbox,
} from 'lucide-react';

export const NotificationCenterModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('UNREAD');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(activeTab);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      // Demo offline fallback notifications
      setNotifications([
        {
          id: 'n1',
          title: '🚨 1-Day Urgent Expiry Warning',
          message: 'Artisanal Sourdough Bread expires TOMORROW!',
          notification_type: 'EXPIRY_ALERT',
          is_read: false,
          is_archived: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'n2',
          title: '🚛 Pickup Scheduled',
          message: 'Pickup scheduled by Hope Shelter for "Surplus Pastries". Vehicle: VAN-8891.',
          notification_type: 'PICKUP_SCHEDULED',
          is_read: false,
          is_archived: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'n3',
          title: '🎁 New Surplus Donation Listing',
          message: 'Fresh Organic Produce (50 kg) published by Green Grocery Market.',
          notification_type: 'NEW_DONATION',
          is_read: true,
          is_archived: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, activeTab]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifs();
    } catch (err) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setFeedback('All notifications marked as read.');
      fetchNotifs();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archiveNotification(id);
      setFeedback('Notification moved to Archive.');
      fetchNotifs();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EXPIRY_ALERT':
        return <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />;
      case 'DONATION_ACCEPTED':
      case 'NEW_DONATION':
        return <HeartHandshake className="h-4 w-4 text-emerald-600 flex-shrink-0" />;
      case 'PICKUP_SCHEDULED':
      case 'PICKUP_COMPLETED':
      case 'PICKUP_REMINDER':
        return <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />;
      case 'NEW_REGISTRATION':
      case 'VERIFICATION_REQUEST':
        return <UserPlus className="h-4 w-4 text-purple-600 flex-shrink-0" />;
      case 'SYSTEM_ERROR':
        return <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification & Alert Center">
      <div className="space-y-4">
        {/* Status Tabs (Unread, Read, Archive) */}
        <div className="flex border-b border-gray-200 justify-between items-center pb-2">
          <div className="flex space-x-2">
            {['UNREAD', 'READ', 'ARCHIVE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'UNREAD' ? 'Unread' : tab === 'READ' ? 'Read' : 'Archived'}
              </button>
            ))}
          </div>

          {activeTab === 'UNREAD' && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark All Read
            </button>
          )}
        </div>

        {feedback && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
            {feedback}
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs transition-all flex items-start space-x-3 ${
                  n.is_read ? 'bg-white border-gray-200 opacity-80' : 'bg-amber-50/70 border-amber-200 font-medium'
                }`}
              >
                <div className="mt-0.5">{getTypeIcon(n.notification_type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900">{n.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-snug">{n.message}</p>

                  <div className="flex items-center space-x-3 pt-1">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px]"
                      >
                        Mark Read
                      </button>
                    )}
                    {!n.is_archived && (
                      <button
                        onClick={() => handleArchive(n.id)}
                        className="text-gray-500 hover:text-gray-700 font-medium text-[11px] flex items-center"
                      >
                        <Archive className="h-3 w-3 mr-1" /> Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Inbox className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-500">No {activeTab.toLowerCase()} notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
