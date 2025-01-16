import { createContext, useContext, useState } from "react"
import { ImageModal } from "@/pages/ImageModal"

interface ImageModalContextType {
    openImageModal: (imageUrl: string, alt?: string) => void
}

const ImageModalContext = createContext<ImageModalContextType | null>(null)

export function useImageModal() {
    const context = useContext(ImageModalContext)
    if (!context) {
        throw new Error("useImageModal must be used within an ImageModalProvider")
    }
    return context
}

export function ImageModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState("")
    const [imageAlt, setImageAlt] = useState<string>()

    const openImageModal = (imageUrl: string, alt?: string) => {
        setImageUrl(imageUrl)
        setImageAlt(alt)
        setIsOpen(true)
    }

    return (
        <ImageModalContext.Provider value={{ openImageModal }}>
            {children}
            <ImageModal
                open={isOpen}
                onOpenChange={setIsOpen}
                imageUrl={imageUrl}
                alt={imageAlt}
            />
        </ImageModalContext.Provider>
    )
}