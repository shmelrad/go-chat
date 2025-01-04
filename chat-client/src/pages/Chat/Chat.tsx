import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { messagesApi } from '@/lib/api/messages';
import { Message } from '@/types/message';
import { SendMessageData, WebSocketMessage } from '@/types/websocket';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/userStore';
import MessageView from './MessageView';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const {token, user } = useAuthStore((state) => state)
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { messages } = await messagesApi.getMessages();
      setMessages(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const wsMessage: WebSocketMessage<SendMessageData> = {
      action: 'send_message',
      data: {
        content: message.trim()
      }
    };

    sendWebSocketMessage(JSON.stringify(wsMessage));
    setMessage('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-sky-400 to-sky-500">
          {messages.map((msg) => (
            <MessageView key={msg.id} message={msg} isCurrentUser={user?.username === msg.author} side='left'/>
          ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            className="flex-1"
            placeholder="Enter a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
