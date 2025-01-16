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
import { useMutation } from "@tanstack/react-query"
import { chatsApi } from "@/lib/api/chats"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface CreateChatModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateChatModal({ open, onOpenChange }: CreateChatModalProps) {
    const [name, setName] = useState("")
    const navigate = useNavigate()

    const createChatMutation = useMutation({
        mutationFn: () => chatsApi.createGroupChat({ name }),
        onSuccess: (data) => {
            toast.success('Chat created successfully')
            navigate(`/chat/${data.chat.id}?type=group&name=${data.chat.name}&isChatId=true`)
            onOpenChange(false)
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