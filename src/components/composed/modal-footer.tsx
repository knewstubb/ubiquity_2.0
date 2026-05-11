import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModalAction {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface ModalFooterProps {
  primaryAction?: ModalAction
  secondaryAction?: ModalAction
  tertiaryAction?: ModalAction
  className?: string
}

export function ModalFooter({
  primaryAction,
  secondaryAction,
  tertiaryAction,
  className,
}: ModalFooterProps) {
  if (!primaryAction && !secondaryAction && !tertiaryAction) return null

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 rounded-b-lg border-t border-border bg-background px-6 py-4',
        className
      )}
    >
      {tertiaryAction && (
        <Button
          type="button"
          variant={tertiaryAction.variant ?? 'ghost'}
          onClick={tertiaryAction.onClick}
          disabled={tertiaryAction.disabled}
          className="mr-auto"
        >
          {tertiaryAction.label}
        </Button>
      )}
      {secondaryAction && (
        <Button
          type="button"
          variant={secondaryAction.variant ?? 'outline'}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
        >
          {secondaryAction.label}
        </Button>
      )}
      {primaryAction && (
        <Button
          type="button"
          variant={primaryAction.variant ?? 'default'}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
        >
          {primaryAction.label}
        </Button>
      )}
    </div>
  )
}
