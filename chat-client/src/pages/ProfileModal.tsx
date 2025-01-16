import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import { useImageModal } from "@/components/ImageModalProvider"

interface ProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
    const { user, updateUser } = useAuthStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { openImageModal } = useImageModal()

    const uploadMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData()
            formData.append('avatar', file)
            return usersApi.uploadAvatar(formData)
        },
        onSuccess: (data) => {
            updateUser({ ...user!, avatar_url: data.avatar_url })
            useAuthStore.getState().login(data.token)
            toast.success('Avatar updated successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to update avatar: ${error.message}`)
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                        <Avatar 
                            className="h-36 w-36 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => user?.avatar_url && openImageModal(user.avatar_url, `${user.username}'s avatar`)}
                        >
                            <AvatarImage src={user?.avatar_url} />
                            <AvatarFallback className="text-3xl">{user?.username[0]}</AvatarFallback>
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
                        <h3 className="font-semibold text-xl">{user?.username}</h3>
                        <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}