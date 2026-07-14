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
    mutationFn: (content: string) => chatApi.sendMessage(contractId, content),
    onMutate: async (content) => {
      if (!user) return { tempId: null };
      const tempId = -Date.now();
      const tempMsg: ChatMessage = {
        id: tempId,
        contractId,
        sender: {
          id: user.id,
          fullName: user.fullName || user.email,
          avatarUrl: (user as any).avatarUrl || ''
        },
        content,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      setRealtimeMessages(prev => [tempMsg, ...prev]);
      return { tempId };
    },
    onSuccess: (newMsg, variables, context) => {
      if (context?.tempId) {
        setRealtimeMessages(prev => prev.map(m => m.id === context.tempId ? newMsg : m));
      }
    },
    onError: (err, variables, context) => {
      if (context?.tempId) {
        setRealtimeMessages(prev => prev.filter(m => m.id !== context.tempId));
      }
    }
  });

  const sendMessage = useCallback((content: string) => {
    sendMsgMut.mutate(content);
  }, [sendMsgMut]);

  const sendTypingEvent = useCallback((typing: boolean) => {
    if (contractId) {
      chatApi.sendTypingEvent(contractId, typing).catch(console.error);
    }
  }, [contractId]);

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
