'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShoppingCart, Package, Users, Filter, Check, X, ArrowLeft } from 'lucide-react';
import { adminApi, type Notification } from '@/lib/api/admin';
import { formatTimeAgo } from '@/lib/utils/date';
import { useNotificationReadStatus } from '@/lib/hooks/useNotificationReadStatus';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
  const { isRead, markAsRead, markAsUnread, markAllAsRead, getUnreadCount } = useNotificationReadStatus();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNotifications();
      // Sort by created_at descending
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(data);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5" />;
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'user':
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'product':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'user':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredNotifications = useMemo(() => {
    if (typeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === typeFilter);
  }, [notifications, typeFilter]);

  const unreadCount = getUnreadCount(filteredNotifications);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!isRead(notification)) {
      markAsRead(notification);
    }
    
    // Navigate if link is provided
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAsRead = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRead(notification)) {
      markAsUnread(notification);
    } else {
      markAsRead(notification);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(filteredNotifications);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 rounded-lg bg-black-50 hover:bg-black-50/80 border border-gold-600/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">View and manage all your notifications</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              <span className="text-white font-semibold">{unreadCount}</span> unread
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 rounded-lg border border-gold-600/30 transition-colors text-sm font-medium"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | Notification['type'])}
            className="pl-10 pr-8 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30 appearance-none"
          >
            <option value="all">All Types</option>
            <option value="order">Orders</option>
            <option value="product">Products</option>
            <option value="user">Users</option>
          </select>
        </div>
        <div className="text-sm text-gray-400 flex items-center">
          Total: <span className="text-white font-semibold ml-1 mr-1">{filteredNotifications.length}</span> notifications
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50 animate-pulse" />
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">No notifications</p>
            <p className="text-gray-500 text-sm">
              {typeFilter === 'all' 
                ? 'You have no notifications at this time.'
                : `No ${typeFilter} notifications found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-black-50/50 border border-gold-600/10 rounded-lg overflow-hidden">
          <div className="divide-y divide-gold-600/10">
            {filteredNotifications.map((notification) => {
              const read = isRead(notification);
              return (
                <div
                  key={`${notification.id}-${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-black-50 transition-colors cursor-pointer ${
                    !read ? 'bg-gold-600/5 border-l-4 border-l-gold-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg border ${getNotificationTypeColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold text-base">{notification.title}</p>
                            {!read && (
                              <span className="px-2 py-0.5 bg-gold-600/20 text-gold-400 text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-gray-500 text-xs">{formatTimeAgo(notification.created_at)}</p>
                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                              notification.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                              notification.type === 'product' ? 'bg-yellow-500/20 text-yellow-400' :
                              notification.type === 'user' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleMarkAsRead(notification, e)}
                          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                            read
                              ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                              : 'bg-gold-600/20 hover:bg-gold-600/30 text-gold-600'
                          }`}
                          title={read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {read ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

