import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, ChatMessage } from '@/api/chatApi';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '@/store/authStore';

export function useChat(contractId: number) {
  const { user } = useAuthStore();
  const { isConnected, subscribe, publish } = useWebSocket();
  const queryClient = useQueryClient();

  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['messages', contractId],
    queryFn: () => chatApi.getMessages(contractId, 0, 50),
    enabled: !!contractId,
  });

  useEffect(() => {
    if (isConnected && contractId) {
      const sub = subscribe(`/topic/contract.${contractId}`, (msg: any) => {
        if (msg.type === 'TYPING') {
          if (msg.userId !== user?.id) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (msg.typing) newSet.add(msg.userId);
              else newSet.delete(msg.userId);
              return newSet;
            });
          }
        } else {
          setRealtimeMessages(prev => [msg, ...prev]);
        }
      });
      return () => sub?.unsubscribe();
    }
  }, [isConnected, contractId, user, subscribe]);

  const sendMsgMut = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(contractId, content)
  });

  const sendMessage = useCallback((content: string) => {
    sendMsgMut.mutate(content);
  }, [sendMsgMut]);

  const sendTypingEvent = useCallback((typing: boolean) => {
    // If backend doesn't support typing indicator, we can just skip or keep the WS publish if it has a handler.
    // Since there is no WS handler in backend, typing events won't work anyway. We just do nothing to prevent errors.
  }, []);

  const { mutate: mutateMarkAsRead } = useMutation({
    mutationFn: () => chatApi.markAsRead(contractId)
  });

  const markAsRead = useCallback(() => {
    mutateMarkAsRead();
  }, [mutateMarkAsRead]);

  const allMessages = React.useMemo(() => {
    return [
      ...realtimeMessages,
      ...(data?.content || [])
    ].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
     .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [realtimeMessages, data?.content]);

  return {
    messages: allMessages,
    isLoading,
    sendMessage,
    sendTypingEvent,
    typingUsers,
    markAsRead
  };
}
