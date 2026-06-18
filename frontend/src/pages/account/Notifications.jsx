import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Loader2, Tag, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';

const FILTER_PILLS = [
  { label: 'All', value: 'ALL' },
  { label: 'Orders', value: 'ORDER_UPDATE' },
  { label: 'Offers', value: 'PROMO' }
];

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markNotificationsRead, loading } = accountStore();

  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await markNotificationsRead();
    uiStore.getState().addToast('All notifications marked as read.', 'success');
  };

  const getNotificationIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'ORDER_UPDATE':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck size={18} />
          </div>
        );
      case 'PROMO':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Tag size={18} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center flex-shrink-0">
            <Bell size={18} />
          </div>
        );
    }
  };

  const handleNotificationClick = (item) => {
    // Simulated read item logic. Let's redirect user.
    if (item.type === 'ORDER_UPDATE') {
      navigate('/account/orders');
    } else if (item.type === 'PROMO') {
      navigate('/account/coupons');
    } else {
      navigate('/account/dashboard');
    }
  };

  // Helper formatting for relative dates
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const diffMs = new Date() - date;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} min ago`;
    }
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }
    return 'Yesterday';
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 portal-body">
      {/* 1. Header with Mark all read */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="portal-heading text-lg font-bold">Inbox Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-full animate-pulse">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs transition-all bg-white"
          >
            <Check size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* 2. Filters pills row */}
      <div className="flex flex-wrap gap-2">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setActiveFilter(pill.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              activeFilter === pill.value
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                : 'bg-white border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Feed Display */}
      {loading.notifications ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-blue-100/50 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm font-semibold text-gray-400 mt-2">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-12 text-center shadow-sm max-w-md mx-auto">
          <Bell size={40} className="mx-auto text-gray-300 animate-bounce" />
          <h4 className="portal-heading text-base font-bold mt-4">All caught up!</h4>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            You don't have any notifications at the moment. We'll update you here!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-5 flex items-start gap-4 transition-all duration-200 hover:bg-blue-50/10 cursor-pointer relative border-l-4 ${
                !item.isRead 
                  ? 'bg-blue-50/20 border-blue-500' 
                  : 'border-transparent'
              }`}
            >
              {/* Icon */}
              {getNotificationIcon(item.type)}

              {/* Text */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className={`text-xs font-bold text-gray-800 ${!item.isRead ? 'font-extrabold' : ''}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold flex-shrink-0">
                    {formatRelativeDate(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {item.body}
                </p>
              </div>

              {/* Unread circle tag */}
              {!item.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" title="Unread"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
