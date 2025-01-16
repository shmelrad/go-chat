import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

interface ImageModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageUrl: string
    alt?: string
}

export function ImageModal({ open, onOpenChange, imageUrl, alt }: ImageModalProps) {
    if (!imageUrl) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-6">
                <img
                    src={imageUrl}
                    alt={alt || "Full size image"}
                    className="w-full h-full max-h-[80vh] object-contain rounded-lg"
                />
            </DialogContent>
        </Dialog>
    )
}
