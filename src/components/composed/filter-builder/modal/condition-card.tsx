/**
 * @component ConditionCard
 * @description Renders a single filter condition as a full-width row card with
 * drag handle, natural language summary text, and remove action.
 *
 * @designDecisions
 * - Full-width row card (not chip) so conditions read as a scannable list
 *   rather than wrapping inline tags — mirrors the inline variant's row pattern
 * - Drag handle (DotsSixVertical) on the left signals reorder affordance
 * - Summary text uses CSS truncate; tooltip shown when text > 60 chars
 * - bg-background keeps the row visually distinct from the group background
 *   without competing with the logic toggle or action buttons
 * - Invalid conditions: opacity-50 + amber Warning icon — still removable
 *   but edit is disabled (prevents re-opening stale config in the modal)
 * - "Is in" / "Is not in" conditions: value portion ("{N} values") has its own
 *   tooltip showing the first 10 values with "+N more" for longer lists
 *
 * @usage
 * - Used inside LogicGroupRenderer for each configured condition in modal variant
 * - Not standalone — relies on parent for onEdit (opens ConditionModal) and
 *   onRemove (mutates the group via CardFilterBuilder state)
 *
 * @states
 * - Default: clickable summary, drag handle visible, remove icon on right
 * - Invalid: opacity-50, amber warning, edit disabled, remove still active
 * - Long text (>60 chars): tooltip wraps full summary on hover
 * - Is in/Is not in: value portion tooltip shows first 10 values + overflow count
 */

import { DotsSixVertical, Trash, Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { generateConditionSummary } from '../summary'
import { ARRAY_VALUE_OPERATORS } from '../operators'
import type { CardFilterRow, SourceCategoryConfig } from '../types'

interface ConditionCardProps {
  row: CardFilterRow
  sourceCategories: SourceCategoryConfig[]
  onRemove: () => void
  onEdit: () => void
  isInvalid?: boolean
}

/**
 * Builds the tooltip content for "is_in" / "is_not_in" conditions.
 * Shows the first 10 values, one per line, with "+N more" if the list exceeds 10.
 */
function buildArrayValueTooltip(values: string[]): React.ReactNode {
  const maxDisplay = 10
  const displayValues = values.slice(0, maxDisplay)
  const remaining = values.length - maxDisplay

  return (
    <div className="flex flex-col gap-0.5 text-xs max-w-xs">
      {displayValues.map((v, i) => (
        <span key={i} className="break-words">{v}</span>
      ))}
      {remaining > 0 && (
        <span className="text-tooltip-foreground/70 mt-0.5">+{remaining} more</span>
      )}
    </div>
  )
}

/**
 * Renders the summary text content for a condition.
 * For "is_in"/"is_not_in" operators, wraps the value portion in a tooltip
 * showing the first 10 values. Otherwise renders plain text.
 */
function SummaryContent({
  row,
  fullText,
}: {
  row: CardFilterRow
  fullText: string
}) {
  const isArrayOp = ARRAY_VALUE_OPERATORS.includes(row.operator) && Array.isArray(row.value)

  if (!isArrayOp) {
    return <span className="truncate">{fullText}</span>
  }

  // Split the summary into the prefix (everything before the value count) and value portion
  const values = row.value as string[]
  const valuePortion = `${values.length} values`
  const valueIndex = fullText.lastIndexOf(valuePortion)

  if (valueIndex === -1) {
    // Fallback: can't split, just show plain text
    return <span className="truncate">{fullText}</span>
  }

  const prefix = fullText.slice(0, valueIndex)

  return (
    <span className="truncate">
      {prefix}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="underline decoration-dotted underline-offset-2 cursor-default">
              {valuePortion}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {buildArrayValueTooltip(values)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
}

export function ConditionCard({
  row,
  sourceCategories,
  onRemove,
  onEdit,
  isInvalid = false,
}: ConditionCardProps) {
  const isEmpty = !row.sourceCategory && !row.field && !row.operator
  const fullText = isEmpty ? '' : generateConditionSummary(row, sourceCategories)

  const card = (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-2 py-2',
        isEmpty ? 'border-dashed border-primary/40 bg-primary/5' : 'border-border bg-background',
        isInvalid && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <span className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
        <DotsSixVertical size={16} weight="bold" />
      </span>

      {/* Summary text — clickable to edit */}
      <button
        type="button"
        onClick={isInvalid ? undefined : onEdit}
        disabled={isInvalid}
        className={cn(
          'flex-1 text-left text-sm truncate rounded px-2 py-1 transition-colors',
          !isInvalid && 'hover:bg-muted cursor-pointer',
          isInvalid && 'cursor-default'
        )}
      >
        <span className="flex items-center gap-1.5">
          {isInvalid && <Warning size={12} weight="fill" className="shrink-0 text-amber-500" />}
          {isEmpty ? (
            <span className="text-primary font-medium">Configure condition</span>
          ) : (
            <SummaryContent row={row} fullText={fullText} />
          )}
        </span>
      </button>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="shrink-0 p-1 h-auto text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
        aria-label="Remove condition"
      >
        <Trash size={14} />
      </Button>
    </div>
  )

  // Tooltip for long summaries (but not for array-op conditions — those have their own value tooltip)
  const isArrayOp = ARRAY_VALUE_OPERATORS.includes(row.operator) && Array.isArray(row.value)
  if (fullText.length > 60 && !isArrayOp) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent>
            <span className="max-w-xs break-words text-xs">{fullText}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return card
}
