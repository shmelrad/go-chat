import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserPlus, Trash2 } from "lucide-react"
import { useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { chatsApi } from "@/lib/api/chats"
import { toast } from "sonner"
import { Chat } from "@/types/chat"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { ApiError } from "@/lib/api/base"

interface ChatSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    chat: Chat
}

export function ChatSettingsModal({ open, onOpenChange, chat }: ChatSettingsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const queryClient = useQueryClient()
    const [username, setUsername] = useState("")
    const { user } = useAuthStore()

    const uploadMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData()
            formData.append('avatar', file)
            return chatsApi.uploadAvatar(chat.id, formData)
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['chat', undefined, chat.id], (old: Chat | undefined) => ({
                ...old,
                settings: { ...old?.settings, avatar_url: data.avatar_url }
            }))
            toast.success('Avatar updated successfully')
        },
        onError: (error: ApiError) => {
            toast.error(`Failed to update avatar: ${error.error}`)
        }
    })

    const addParticipantMutation = useMutation({
        mutationFn: (username: string) => chatsApi.addParticipant(chat.id, username),
        onSuccess: (data) => {
            queryClient.setQueryData(['chat', undefined, chat.id], (old: Chat | undefined) => ({
                ...old,
                members: [...(old?.members || []), data.member]
            }))
            setUsername("")
            toast.success('Participant added successfully')
        },
        onError: (error: ApiError) => {
            toast.error(`Failed to add participant: ${error.error}`)
        }
    })

    const removeParticipantMutation = useMutation({
        mutationFn: (userId: number) => chatsApi.removeParticipant(chat.id, userId),
        onSuccess: (_, userId) => {
            queryClient.setQueryData(['chat', undefined, chat.id], (old: Chat | undefined) => ({
                ...old,
                members: (old?.members || []).filter(m => m.user.id !== userId)
            }))
            toast.success('Participant removed successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove participant: ${error.message}`)
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('File must be an image')
            return
        }

        uploadMutation.mutate(file)
    }

    const handleAddParticipant = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) {
            toast.error('Please enter a username')
            return
        }
        addParticipantMutation.mutate(username)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chat Settings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                        <Avatar className="h-36 w-36">
                            <AvatarImage src={chat.settings.avatar_url} />
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute bottom-0 right-0 rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-xl">{chat.name}</h3>
                        <p className="text-sm text-muted-foreground">{chat.members.length} participants</p>
                    </div>

                    {chat.type === 'group' && (
                        <form onSubmit={handleAddParticipant} className="w-full space-y-4">
                            <div className="space-y-2">
                                <Label>Add participant</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter username..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <Button 
                                        type="submit" 
                                        size="icon"
                                        disabled={addParticipantMutation.isPending}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="w-full">
                        <Label>Participants</Label>
                        <div className="mt-2 space-y-2">
                            {chat.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarImage src={member.user.avatar_url} />
                                            <AvatarFallback>{member.user.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.user.username}</p>
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                    {member.role !== 'admin' && user?.id !== member.user.id && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => removeParticipantMutation.mutate(member.user.id)}
                                            disabled={removeParticipantMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}