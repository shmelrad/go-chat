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
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const focusInput = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 250); // 10 lines ≈ 250px
            textarea.style.height = `${newHeight}px`;
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        adjustTextareaHeight();
    };

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
        if (inputRef.current) {
            inputRef.current.style.height = '40px';
        }
        focusInput();
    };

    useEffect(() => {
        focusInput();
    }, []);

    return (
        <div className="border-t">
            <div className="flex items-end gap-2 px-4">
                <button className="p-2 text-muted-foreground hover:text-primary cursor-pointer">
                    <LuPaperclip className='size-6' />
                </button>
                <textarea
                    ref={inputRef}
                    className="flex-1 py-2.5 rounded-none border-none outline-none resize-none min-h-[40px] max-h-[250px] overflow-y-auto"
                    placeholder="Enter a message..."
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyPress}
                    disabled={isSending}
                    rows={1}
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
