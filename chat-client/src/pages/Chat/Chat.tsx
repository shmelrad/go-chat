import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { messagesApi } from '@/lib/api/messages';
import { Message } from '@/types/message';
import { SendMessageData, WebSocketMessage } from '@/types/websocket';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/userStore';
import MessageView from './MessageView';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const token = useAuthStore((state) => state.token)

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
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-sky-300 to-sky-400">
        <div className="flex flex-col-reverse">
          {messages.map((msg) => (
            <MessageView key={msg.id} message={msg} />
          ))}
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
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
