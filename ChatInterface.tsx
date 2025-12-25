import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage } from '../types';
import { Send, Search, ChevronLeft, MoreVertical, CheckCheck, Clock } from 'lucide-react';

interface Props {
  conversations: ChatConversation[];
  currentUserAvatar?: string;
  lang: 'it' | 'en';
}

const ChatInterface: React.FC<Props> = ({ conversations: initialConversations, currentUserAvatar, lang }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    it: {
      search: "Cerca nelle chat...",
      typeMessage: "Scrivi un messaggio...",
      noChatSelected: "Seleziona una conversazione per iniziare a chattare.",
      online: "Online",
      chats: "Messaggi"
    },
    en: {
      search: "Search chats...",
      typeMessage: "Type a message...",
      noChatSelected: "Select a conversation to start chatting.",
      online: "Online",
      chats: "Messages"
    }
  }[lang];

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString()
        };
      }
      return c;
    }));

    setNewMessage('');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-[600px] flex overflow-hidden">
      
      {/* SIDEBAR (List) */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900 mb-3">{t.chats}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={t.search} 
              className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedId(chat.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 ${selectedId === chat.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
            >
              <div className="relative shrink-0">
                <img src={chat.participantAvatar} alt={chat.participantName} className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm font-bold truncate ${selectedId === chat.id ? 'text-blue-900' : 'text-slate-900'}`}>
                    {chat.participantName}
                  </h4>
                  <span className="text-[10px] text-slate-400">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs text-slate-500 truncate max-w-[140px]">{chat.lastMessage}</p>
                   {chat.unreadCount > 0 && (
                     <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                       {chat.unreadCount}
                     </span>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                  <ChevronLeft size={20} />
                </button>
                <img src={selectedConversation.participantAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedConversation.participantName}</h4>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {t.online}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-full">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map(msg => {
                const isMe = msg.senderId === 'me';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 md:p-4 text-sm shadow-sm relative group ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isMe ? 'text-slate-400' : 'text-slate-300'}`}>
                        {formatTime(msg.timestamp)}
                        {isMe && (
                           msg.read ? <CheckCheck size={12} className="text-blue-400" /> : <CheckCheck size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.typeMessage}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors shadow-lg shadow-slate-200"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Clock size={32} />
             </div>
             <p>{t.noChatSelected}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;