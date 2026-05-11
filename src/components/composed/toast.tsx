import { toast as sonnerToast } from 'sonner'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default'

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export function showToast({ title, description, variant = 'default', action, duration }: ToastOptions) {
  const options = {
    description,
    duration,
    action: action ? { label: action.label, onClick: action.onClick } : undefined,
  }

  switch (variant) {
    case 'success':
      return sonnerToast.success(title, options)
    case 'error':
      return sonnerToast.error(title, options)
    case 'warning':
      return sonnerToast.warning(title, options)
    case 'info':
      return sonnerToast.info(title, options)
    default:
      return sonnerToast(title, options)
  }
}
