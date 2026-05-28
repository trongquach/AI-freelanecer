import { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ChatWidget({ contractId }: { contractId: number }) {
  const { user } = useAuthStore();
  const { messages, isLoading, sendMessage, sendTypingEvent, typingUsers, markAsRead } = useChat(contractId);
  
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    markAsRead();
  }, [messages.length, markAsRead]);

  let typingTimeout: ReturnType<typeof setTimeout>;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    sendTypingEvent(true);
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      sendTypingEvent(false);
    }, 2000);
  };

  const handleSend = () => {
    if (content.trim()) {
      sendMessage(content.trim());
      setContent('');
      sendTypingEvent(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="md" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.sender.id === user?.id;
          const showAvatar = !isMine && (idx === messages.length - 1 || messages[idx + 1]?.sender.id !== msg.sender.id);
          
          return (
            <div key={msg.id || `temp-${idx}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for others */}
                {!isMine && (
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                    {showAvatar ? (
                      <img src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender.fullName}`} alt={msg.sender.fullName} />
                    ) : null}
                  </div>
                )}
                
                <div className={`px-4 py-2 rounded-2xl ${isMine ? 'bg-primary-600 text-slate-900 rounded-br-sm' : 'bg-white border border-slate-200 text-surface-200 rounded-bl-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2 max-w-[75%]">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0" />
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-surface-200 rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border border-slate-200 border-t border-slate-300 flex items-end gap-2">
        <textarea
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:border-primary-500 max-h-32 min-h-[44px]"
          rows={1}
        />
        <button 
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-2.5 bg-primary-500 hover:bg-primary-400 text-slate-900 rounded-xl disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
