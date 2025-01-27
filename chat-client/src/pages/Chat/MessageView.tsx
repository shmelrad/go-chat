import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import Markdown from "react-markdown";
interface MessageViewProps {
  message: Message;
  side: 'left' | 'right';
  isCurrentUser: boolean;
  user: User;
}

export default function MessageView({ message, side, isCurrentUser, user }: MessageViewProps) {
  const isRight = side === 'right';
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const messageClassName = isCurrentUser
    ? 'bg-purple-500'
    : 'bg-sidebar'

  const messageTextClassName = isCurrentUser
    ? 'text-white'
    : 'text-black dark:text-white'
  const messageBorderClassName = isRight
    ? 'rounded-br-none'
    : 'rounded-bl-none'

  return (
    <div className={`flex items-end gap-2 ${isRight ? 'justify-end' : ''}`}>
      {!isRight && <MessageAvatar user={user} />}

      <div className={`p-2 rounded-lg max-w-[40%] ${messageClassName} ${messageBorderClassName}`}>
        {!isCurrentUser && <p className="text-sm font-bold dark:text-white">{user.username}</p>}
        <div className="flex items-end gap-2">
          <p className={`prose whitespace-pre-wrap [overflow-wrap:anywhere] ${messageTextClassName}`}>
            <Markdown>{message.content}</Markdown>
          </p>
          <p className={`relative top-1 text-xs text-gray-400`}>
            {time}
          </p>
        </div>
      </div>

      {isRight && <MessageAvatar user={user} />}
    </div>
  );
}

const MessageAvatar = ({ user }: { user: User }) => {
  return (
    <Avatar>
      <AvatarImage src={user.avatar_url} />
      <AvatarFallback>
        {user.username.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}
