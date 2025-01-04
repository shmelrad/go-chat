import { useEffect, useRef, useState } from 'react';
import { messagesApi } from '@/lib/api/messages';
import { Message } from '@/types/message';
import { useAuthStore } from '@/stores/userStore';
import useWebSocket from 'react-use-websocket';
import MessageView from './MessageView';
import TextEditor from './TextEditor';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { token, user } = useAuthStore((state) => state)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage: sendWebSocketMessage } = useWebSocket('ws://localhost:8080/ws?access_token=' + token, {
    onOpen: () => {
      console.log('WebSocket connection established');
    },
    onMessage: (event) => {
      console.log('Received message:', event.data);
      const newMessage = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    },
  });

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages().then(scrollToBottom);
  }, []);

  const fetchMessages = async () => {
    try {
      const { messages } = await messagesApi.getMessages();
      setMessages(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-sky-400 to-sky-500 scroll-smooth"
      >
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageView 
              key={msg.id}
              message={msg} 
              isCurrentUser={user?.username === msg.author} 
              side='left'
            />
          ))}
        </div>
      </div>
      <TextEditor sendWebSocketMessage={sendWebSocketMessage} />
    </div>
  );
}
