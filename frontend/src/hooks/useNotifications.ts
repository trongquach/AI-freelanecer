import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, Notification } from '@/api/notificationApi';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const { isConnected, subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(0, 20),
    enabled: !!user,
  });

  useEffect(() => {
    if (isConnected && user) {
      const sub = subscribe(`/topic/notifications/${user.id}`, (newNotif: Notification) => {
        setRealtimeNotifications(prev => [newNotif, ...prev]);
      });
      return () => sub?.unsubscribe();
    }
  }, [isConnected, user, subscribe]);

  const markAsReadMut = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: (_, id) => {
      setRealtimeNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMut = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      setRealtimeNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const allNotifications = [
    ...realtimeNotifications,
    ...(data?.content || [])
  ].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // unique by id
   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return {
    notifications: allNotifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMut.mutate,
    markAllAsRead: markAllAsReadMut.mutate,
  };
}
