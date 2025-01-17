import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { chatsApi } from "@/lib/api/chats"
import { toast } from "sonner"
import { Chat } from "@/types/chat"

interface CreateChatModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    openChat: (id: number, type: "dm" | "group", name: string, isChatId: boolean, avatarUrl: string) => void
}

export function CreateChatModal({ open, onOpenChange, openChat }: CreateChatModalProps) {
    const [name, setName] = useState("")
    const queryClient = useQueryClient()

    const createChatMutation = useMutation({
        mutationFn: () => chatsApi.createGroupChat({ name }),
        onSuccess: (data) => {
            toast.success('Chat created successfully')
            openChat(data.chat.id, "group", data.chat.name, true, data.chat.settings.avatar_url)
            onOpenChange(false)
            
            queryClient.setQueryData(['user-chats'], (old: { chats: Chat[] } | undefined) => ({
                chats: [data.chat, ...(old?.chats || [])]
            }))
        },
        onError: (error: Error) => {
            toast.error(`Failed to create chat: ${error.message}`)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error('Please enter a chat name')
            return
        }
        createChatMutation.mutate()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a new group chat</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Chat name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter chat name..."
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createChatMutation.isPending}
                    >
                        {createChatMutation.isPending ? "Creating..." : "Create chat"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
} 