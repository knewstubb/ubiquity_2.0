import { cn } from '@/lib/utils'
import { CloseButton } from '@/components/ui/close-button'

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
        'rounded-t-lg border-b border-border px-6 pt-4 pb-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <h3 className="text-xl font-semibold text-foreground leading-6">
          {title}
        </h3>
        {onClose && (
          <CloseButton size="sm" onClick={onClose} aria-label="Close" />
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 mb-0 leading-normal">{description}</p>
      )}
    </div>
  )
}
