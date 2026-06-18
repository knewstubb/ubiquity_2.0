/**
 * @component ModalFooter
 * @description Standardised footer bar for modal dialogs. Provides up to three
 * action slots (primary, secondary, tertiary) with consistent spacing and alignment.
 *
 * @designDecisions
 * - No explicit background colour — inherits from the parent Dialog overlay so it
 *   blends with whatever surface it sits on (light or dark mode).
 * - Tertiary action pushed left with `mr-auto` to create visual separation from
 *   primary/secondary group (common "Delete" or "Reset" pattern).
 * - 4px bottom radius matches Dialog panel radius per docs/ui/borders-radius.md.
 *
 * @usage
 * - Use inside a Dialog/modal as the bottom-pinned action bar.
 * - Pass `primaryAction` for the main CTA, `secondaryAction` for cancel/back,
 *   `tertiaryAction` for destructive or less-common actions.
 * - Returns null when no actions are provided.
 */
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ModalAction {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'destructiveOutline' | 'destructiveGhost' | 'outline' | 'secondary' | 'secondaryOutline' | 'ghost' | 'secondaryGhost' | 'link'
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
        'flex items-center justify-end gap-3 rounded-b-lg border-t border-border px-6 py-4',
        className
      )}
    >
      {tertiaryAction && (
        <Button
          type="button"
          variant={tertiaryAction.variant ?? 'secondaryGhost'}
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
          variant={secondaryAction.variant ?? 'secondaryGhost'}
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
