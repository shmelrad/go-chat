import { useRef, useState, useEffect } from 'react';
import { SendMessageData, WebSocketMessage } from '@/types/websocket';
import { LuPaperclip, LuSendHorizontal, LuSmile } from 'react-icons/lu';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Chat } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/ui/spinner';

interface TextEditorProps {
    sendWebSocketMessage: (message: string) => void;
    chat: Chat;
    isSending?: boolean;
}

export default function TextEditor({ sendWebSocketMessage, chat, isSending }: TextEditorProps) {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const focusInput = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }

    const sendMessage = async () => {
        if (message.trim() === '' || isSending) return;
        
        const messageId = uuidv4();
        const wsMessage: WebSocketMessage<SendMessageData> = {
            action: 'send_message',
            message_id: messageId,
            data: {
                content: message.trim(),
                chat_id: chat.id
            }
        };

        sendWebSocketMessage(JSON.stringify(wsMessage));
        setMessage('');
        focusInput();
    };

    useEffect(() => {
        focusInput();
    }, []);

    return (
        <div className="border-t">
            <div className="flex items-center gap-2 px-4">
                <button className="p-2 text-muted-foreground hover:text-primary cursor-pointer">
                    <LuPaperclip className='size-6' />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 py-2.5 rounded-none border-none outline-none"
                    placeholder="Enter a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isSending}
                />
                <button 
                    className="p-2 text-muted-foreground hover:text-primary cursor-pointer" 
                    onClick={sendMessage}
                    disabled={isSending}
                >
                    {isSending ? <Spinner/> : <LuSendHorizontal className='size-6' />}
                </button>
                <Tooltip>
                    <TooltipTrigger className="p-2 text-muted-foreground hover:text-primary cursor-pointer">
                        <LuSmile className='size-6' />
                    </TooltipTrigger>
                    <TooltipContent>
                        <Picker theme='light' data={data} onEmojiSelect={(emoji: { native: string }) => setMessage(message + emoji.native)} />
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
