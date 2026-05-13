import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ModalHeaderProps {
  title: React.ReactNode
  onClose?: () => void
  description?: string
  className?: string
}

export function ModalHeader({ title, onClose, description, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-t-lg border-b border-border px-6 py-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <h3 className="text-xl font-semibold text-foreground leading-6">
          {title}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 h-5 w-5 flex items-center justify-center rounded-sm text-muted-foreground transition-all hover:text-foreground hover:bg-secondary active:scale-90 focus:outline-none focus-visible:text-foreground"
            aria-label="Close"
          >
            <X size={16} weight="regular" />
          </button>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5 leading-none">{description}</p>
      )}
    </div>
  )
}
