import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showError(toastMessage: string, error: string) {
  toast.error(`${toastMessage}: ${error}`)
  console.error(error)
}