'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, ShoppingCart, Package, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { adminApi, type Notification } from '@/lib/api/admin';
import { formatTimeAgo } from '@/lib/utils/date';

export function AdminHeader() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSeen, setLastSeen] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const newNotifications = await adminApi.getNotifications(lastSeen);
      
      // Merge with existing notifications, avoiding duplicates
      setNotifications((prev) => {
        const existingIds = new Set(prev.map(n => `${n.id}-${n.type}`));
        const uniqueNew = newNotifications.filter(n => !existingIds.has(`${n.id}-${n.type}`));
        const merged = [...prev, ...uniqueNew];
        
        // Sort by created_at descending
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Limit to most recent 100
        return merged.slice(0, 100);
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [lastSeen]);

  // Initial fetch and polling
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  // Update lastSeen when dropdown is opened
  useEffect(() => {
    if (notificationsOpen && !lastSeen) {
      setLastSeen(new Date().toISOString());
    }
  }, [notificationsOpen, lastSeen]);

  // Calculate unread count (notifications created after lastSeen)
  const unreadCount = lastSeen
    ? notifications.filter(n => new Date(n.created_at) > new Date(lastSeen)).length
    : notifications.length;

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Update lastSeen to mark as seen
    if (!lastSeen || new Date(notification.created_at) > new Date(lastSeen)) {
      setLastSeen(new Date().toISOString());
    }
    
    // Navigate if link is provided
    if (notification.link) {
      router.push(notification.link);
      setNotificationsOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const isUnread = (notification: Notification): boolean => {
    if (!lastSeen) return true;
    return new Date(notification.created_at) > new Date(lastSeen);
  };

  return (
    <header className="h-16 bg-black-100/95 backdrop-blur-sm border-b border-gold-600/10 flex items-center justify-between px-6 shadow-lg z-30 shrink-0 relative">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-black-50/50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30 focus:bg-black-50 transition-all duration-200 hover:border-gold-600/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 text-gray-400 hover:text-white hover:bg-black-50 rounded-lg transition-all duration-200 group"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-black-100 border border-gold-600/20 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gold-600/10">
                <h3 className="text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {loading && notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p>Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gold-600/10">
                    {notifications.map((notification) => {
                      const unread = isUnread(notification);
                      return (
                        <div
                          key={`${notification.id}-${notification.type}`}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-black-50/50 transition-colors cursor-pointer ${
                            unread ? 'bg-gold-600/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                              notification.type === 'product' ? 'bg-yellow-500/20 text-yellow-400' :
                              notification.type === 'user' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm">{notification.title}</p>
                              <p className="text-gray-400 text-xs mt-1 truncate">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-2">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                            {unread && (
                              <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gold-600/10 bg-black-50/30">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    router.push('/admin/notifications');
                  }}
                  className="w-full text-center text-sm text-gold-600 hover:text-gold-500 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gold-600/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">{user?.email || ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-600/10 flex items-center justify-center border border-gold-600/30 shadow-md hover:shadow-gold-600/20 transition-shadow duration-200">
            <span className="text-gold-600 font-semibold text-sm">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
