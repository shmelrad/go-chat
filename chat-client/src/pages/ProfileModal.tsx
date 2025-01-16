import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/authStore"

interface ProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
    const { user } = useAuthStore()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-3xl">{user?.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h3 className="font-semibold text-xl">{user?.username}</h3>
                        <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}