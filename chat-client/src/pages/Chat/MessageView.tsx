import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/types/message";

interface MessageViewProps {
  message: Message;
  side: 'left' | 'right';
  isCurrentUser: boolean;
}

export default function MessageView({ message, side, isCurrentUser }: MessageViewProps) {
  const isRight = side === 'right';
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const messageClassName = isCurrentUser
    ? 'bg-sky-200'
    : 'bg-gray-100'

  const messageBorderClassName = isRight
    ? 'rounded-br-none'
    : 'rounded-bl-none'

  return (
    <div className={`flex items-end my-2 gap-2`}>
      {!isRight && <MessageAvatar message={message} />}

      <div className={`p-2 rounded-lg max-w-[40%] ${messageClassName} ${messageBorderClassName}`}>

        {!isCurrentUser && <p className="text-sm font-bold">{message.author}</p>}
        <div className="flex items-end gap-2">
          <p className="[overflow-wrap:anywhere]">{message.content}</p>
          <p className={`relative top-1 text-xs ${isRight ? 'text-blue-100' : 'text-gray-500'}`}>
            {time}
          </p>
        </div>
      </div>

      {isRight && <MessageAvatar message={message} />}
    </div>
  );
}

const MessageAvatar = ({ message }: { message: Message }) => {
  return (
    <Avatar>
      <AvatarImage src="https://placehold.jp/150x150.png" />
      <AvatarFallback>
        {message.author.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}
