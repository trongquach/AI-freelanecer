import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, DollarSign, Banknote, AlertTriangle, Megaphone, Briefcase } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

const getNotificationConfig = (type: string) => {
  switch (type) {
    case 'PAYMENT_RECEIVED':
    case 'DEPOSIT':
      return { icon: DollarSign, color: 'text-success-500', bg: 'bg-success-500/20' };
    case 'WITHDRAW_REQUEST':
    case 'WITHDRAW_APPROVED':
    case 'WITHDRAW_REJECTED':
      return { icon: Banknote, color: 'text-primary-500', bg: 'bg-primary-500/20' };
    case 'DISPUTE':
    case 'DISPUTE_RESOLVED':
      return { icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-500/20' };
    case 'ADMIN_BROADCAST':
      return { icon: Megaphone, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/20' };
    case 'CONTRACT_CREATED':
      return { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-500/20' };
    default:
      return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-500/20' };
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-white border border-slate-200"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Check size={14}/> Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {notifications.slice(0, 10).map(notif => {
                  const { icon: Icon, color, bg } = getNotificationConfig(notif.type);
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-3 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center ${color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{notif.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.content}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <Link 
            to="/notifications" 
            onClick={() => setIsOpen(false)}
            className="p-2 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border-t border-slate-200"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
