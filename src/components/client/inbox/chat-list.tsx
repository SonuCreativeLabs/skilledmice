'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export type ChatStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

interface Chat {
  id: string;
  recipientName: string;
  recipientAvatar: string;
  recipientJobTitle: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  online: boolean;
  status: ChatStatus;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="space-y-4 py-4">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`group mx-4 p-4 flex items-start gap-4 rounded-xl border cursor-pointer transition-all duration-300 hover:border-purple-500/20 ${selectedChatId === chat.id ? 'bg-[#23232b] border-purple-500/40' : 'bg-[#23232b] border-[#23232b]'}`}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
              <AvatarImage src={chat.recipientAvatar} alt={chat.recipientName} />
              <AvatarFallback>{chat.recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            {chat.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#23232b]" />
            )}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                  {chat.recipientName}
                </h3>
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-white/40 font-medium truncate">
                      {chat.recipientJobTitle}
                    </p>
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        chat.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        chat.status === 'Ongoing' ? 'bg-purple-500/20 text-purple-400' :
                        chat.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 truncate w-full">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-white/40 tabular-nums">
                  {formatDistanceToNow(chat.timestamp, { addSuffix: false })} ago
                </span>
                {chat.unreadCount > 0 && (
                  <div className="h-5 w-5 rounded-full bg-purple-500/90 text-white text-xs font-medium flex items-center justify-center ring-2 ring-purple-500/20">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}