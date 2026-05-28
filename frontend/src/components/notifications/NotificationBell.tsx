import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

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
          <div className="p-3 border-b border-slate-300 flex justify-between items-center bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
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
                {notifications.slice(0, 10).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 flex gap-3 hover:bg-white border border-slate-200 transition-colors cursor-pointer ${!notif.isRead ? 'bg-white border border-slate-200/50' : ''}`}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                      setIsOpen(false);
                      // In a real app, this would use react-router navigate to the referenceId
                    }}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <Info size={16} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{notif.title}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.content}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            to="/notifications" 
            onClick={() => setIsOpen(false)}
            className="p-2 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 border-t border-slate-300"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
