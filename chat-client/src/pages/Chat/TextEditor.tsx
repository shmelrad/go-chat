import { useRef, useState } from 'react';
import { SendMessageData, WebSocketMessage } from '@/types/websocket';
import { LuPaperclip, LuSendHorizontal, LuSmile } from 'react-icons/lu';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TextEditorProps {
    sendWebSocketMessage: (message: string) => void;
}

export default function TextEditor({ sendWebSocketMessage }: TextEditorProps) {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

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
                />
                <button className="p-2 text-muted-foreground hover:text-primary cursor-pointer" onClick={sendMessage}>
                    <LuSendHorizontal className='size-6' />
                </button>
                <Tooltip>
                    <TooltipTrigger>
                        <button className="p-2 text-muted-foreground hover:text-primary cursor-pointer">
                            <LuSmile className='size-6' />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <Picker theme='light' data={data} onEmojiSelect={(emoji: { native: string }) => setMessage(message + emoji.native)} />
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
