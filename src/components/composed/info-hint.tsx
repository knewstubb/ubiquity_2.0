/**
 * @component InfoHint
 * @description Lightweight informational annotation used below form controls
 * and card selectors in wizard steps. Non-blocking "FYI" content that doesn't
 * require user action.
 *
 * @designDecisions
 * - Uses Info icon at 14px to stay proportional with text-xs body
 * - items-center vertically centres icon with single-line text for cleaner alignment
 * - No interactive elements — purely informational (not a dismissible alert)
 *
 * @usage
 * - Below card selectors to explain behaviour of a selection
 * - Below frequency/schedule options to note system behaviour
 * - Anywhere a non-blocking "FYI" annotation is needed
 * - NOT for warnings or errors — use Alert or toast for those
 *
 * @variants
 * - inline: transparent background, icon + text only (default) — use within form groups
 * - panel: contained muted card (bg-muted/text-muted-foreground) with centred layout — use when the hint needs visual separation from surrounding content
 */

import { Info } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface InfoHintProps {
  children: React.ReactNode
  /** 'inline' = no container (icon + text only), 'panel' = contained card */
  variant?: 'inline' | 'panel'
  className?: string
}

export function InfoHint({ children, variant = 'inline', className }: InfoHintProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-xs',
      variant === 'inline' && 'text-tertiary-foreground',
      variant === 'panel' && 'rounded bg-muted text-muted-foreground px-3 py-2 justify-center',
      className,
    )}>
      <Info size={14} weight="regular" className="shrink-0" />
      <p className="m-0">{children}</p>
    </div>
  )
}
