import { Bell, Check, Info, DollarSign, Banknote, AlertTriangle, Megaphone, Briefcase, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { notificationApi } from '@/api/notificationApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  // Fix timezone issue if backend sends local datetime string without Z
  if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
    dateStr += 'Z';
  }
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function NotificationsPage() {
  const { markAsRead, markAllAsRead } = useNotifications();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', page],
    queryFn: () => notificationApi.getNotifications(page, 20),
  });

  if (isLoading && page === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const notifications = data?.content || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with your platform activity</p>
        </div>
        <button
          onClick={() => markAllAsRead()}
          className="btn-secondary btn-sm flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          Mark all as read
        </button>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No notifications yet</p>
            <p className="text-sm mt-1">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const { icon: Icon, color, bg } = getNotificationConfig(notif.type);
            return (
              <div 
                key={notif.id} 
                className={`p-6 flex gap-4 transition-colors ${!notif.isRead ? 'bg-primary-50/30' : 'hover:bg-slate-50'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-base ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{notif.content}</p>
                      <p className="text-xs font-medium text-slate-400 mt-2">
                        {formatTimeAgo(notif.createdAt)} · {notif.createdAt ? new Date(!notif.createdAt.endsWith('Z') && !notif.createdAt.includes('+') ? notif.createdAt + 'Z' : notif.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary btn-sm"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
