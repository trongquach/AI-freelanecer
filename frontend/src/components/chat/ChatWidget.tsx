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
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
        {messages.map((msg, idx) => {
          const isMine = msg.sender.id === user?.id;
          const showAvatar = !isMine && (idx === messages.length - 1 || messages[idx + 1]?.sender.id !== msg.sender.id);
          
          return (
            <div key={msg.id || `temp-${idx}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-3 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for others */}
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0 overflow-hidden shadow-sm">
                    {showAvatar ? (
                      <img src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender.fullName}`} alt={msg.sender.fullName} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                )}
                
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                  isMine 
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}>
                  <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  <p className={`text-[11px] mt-1.5 text-right font-medium ${isMine ? 'text-primary-100' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="flex items-end gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0 shadow-sm" />
              <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm">
                <div className="flex gap-1.5 items-center justify-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-5 pr-12 py-3.5 text-[15px] text-slate-900 resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all max-h-32 min-h-[52px]"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!content.trim()}
            className="p-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0 flex items-center justify-center"
          >
            <Send size={20} className={content.trim() ? "translate-x-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
