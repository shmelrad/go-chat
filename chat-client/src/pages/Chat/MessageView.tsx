import { Message } from "@/types/message";

export default function MessageView({ message }: { message: Message }) {
  return (
    <div className="bg-gray-100 p-2 rounded-lg shadow w my-2 w-fit">
      <div className="flex justify-between items-center">
        <p className="font-bold text-sm">{message.author}</p>
        <p className="text-xs text-gray-500 ml-2">{message.created_at}</p>
      </div>
      <p>{message.content}</p>
    </div>
  );
}