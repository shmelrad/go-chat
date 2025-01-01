import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  author: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("User");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('Establishing WebSocket connection...');
    fetchMessages();

    wsRef.current = new WebSocket('ws://localhost:8080/ws');
    
    wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
    };
    
    wsRef.current.onmessage = (event) => {
        console.log('Received message:', event.data);
        const newMessage = JSON.parse(event.data);
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
    };

    return () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
    };
  }, []);

  const fetchMessages = async () => {
    const response = await fetch('http://localhost:8080/messages');
    const data = await response.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!wsRef.current || message.trim() === '') return;

    wsRef.current.send(JSON.stringify({
      author: username,
      content: message
    }));

    setMessage('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input
          type="text"
          className="border p-2"
          placeholder="Enter your nickname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Input
          type="text"
          className="border p-2"
          placeholder="Enter a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2">
          Send
        </Button>
      </div>

      <div className="border-t pt-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.author}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
