import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useRef } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const viewportRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toasts.length === 0) return
      
      // Check if click is outside the viewport
      if (viewportRef.current && !viewportRef.current.contains(event.target as Node)) {
        // Dismiss all toasts
        toasts.forEach(toast => dismiss(toast.id))
      }
    }

    // Only add listener if there are active toasts
    if (toasts.length > 0) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [toasts, dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport ref={viewportRef} />
    </ToastProvider>
  )
}
