/**
 * @component ConditionCard
 * @description Renders a single filter condition as a full-width white card with
 * drag handle, source icon, natural language summary (bold field + value), source
 * path breadcrumb, and remove/clone/disable actions.
 *
 * @designDecisions
 * - Full-width white card with rounded-lg border for a clean scannable list
 * - Drag handle (DotsSixVertical) on the left signals reorder affordance
 * - Source type icon (Users/Lightning/Table) based on category config
 * - Summary line: bold field name, normal operator, bold value
 * - Source path line below in muted small text (Category > SubSource > ...)
 * - Action buttons (clone + disable + remove) use explicit isHovered state via
 *   onMouseEnter/onMouseLeave — avoids CSS group-hover which can bleed
 *   through when cards are rendered inside nested flex/grid containers
 * - Clone (Copy icon) duplicates the condition — optional via onClone prop,
 *   only shown on hover when not disabled
 * - Disable toggle (Eye/EyeSlash icon) lets users temporarily exclude a
 *   condition without removing it — always visible when condition is disabled
 *   so users can re-enable without hovering
 * - Remove (X icon) with destructive hover styling for clear affordance
 * - Clicking the card body (not action buttons) opens edit modal
 * - Empty/unconfigured rows show a dashed-border "Configure condition" CTA
 * - Invalid conditions: opacity-50 + amber Warning icon — still removable,
 *   edit disabled; action buttons hidden entirely when invalid
 * - Disabled conditions: opacity-40 — still editable and removable, eye icon
 *   persists even when not hovered for discoverability
 *
 * @usage
 * - Used inside LogicGroupRenderer for each configured condition in modal variant
 * - Not standalone — relies on parent for onEdit, onRemove, and optionally onClone/onToggleDisabled callbacks
 */

import { useState } from 'react'
import { DotsSixVertical, X, Users, Lightning, Table, Warning, Copy, Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { generateConditionSummary } from '../summary'
import { ARRAY_VALUE_OPERATORS } from '../operators'
import { getOperatorsForType } from '../operators'
import type { CardFilterRow, SourceCategoryConfig, SubSourceConfig, FilterFieldDef } from '../types'

interface ConditionCardProps {
  row: CardFilterRow
  sourceCategories: SourceCategoryConfig[]
  onRemove: () => void
  onEdit: () => void
  onClone?: () => void
  onToggleDisabled?: () => void
  isInvalid?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves the source category icon based on key convention.
 * Falls back to Table icon for transactional/unknown sources.
 */
function getSourceIcon(sourceCategory: string): React.ReactNode {
  const key = sourceCategory.toLowerCase()
  if (key.includes('contact') || key.includes('people') || key.includes('audience')) {
    return <Users size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('activity') || key.includes('event') || key.includes('behaviour') || key.includes('behavior')) {
    return <Lightning size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  return <Table size={24} weight="regular" className="shrink-0 text-muted-foreground" />
}

/**
 * Resolves the source path breadcrumb string.
 * e.g. "Contacts" or "Mailout > Summer 2026 > Sony Sale"
 */
function resolveSourcePath(row: CardFilterRow, sourceCategories: SourceCategoryConfig[]): string {
  const category = sourceCategories.find((c) => c.key === row.sourceCategory)
  if (!category) return row.sourceCategory || ''

  if (!row.subSource || !category.subSources) {
    return category.title
  }

  // Walk the sub-source tree to build path
  const pathParts = [category.title]

  function findSubSource(subs: SubSourceConfig[], targetKey: string): boolean {
    for (const sub of subs) {
      pathParts.push(sub.label)
      if (sub.key === targetKey) return true
      if (sub.subSources && findSubSource(sub.subSources, targetKey)) return true
      pathParts.pop()
    }
    return false
  }

  findSubSource(category.subSources, row.subSource)
  return pathParts.join(' > ')
}

/**
 * Resolves the field definition for formatting purposes.
 */
function resolveFieldDef(
  row: CardFilterRow,
  sourceCategories: SourceCategoryConfig[]
): FilterFieldDef | undefined {
  const category = sourceCategories.find((c) => c.key === row.sourceCategory)
  if (!category) return undefined

  if (row.subSource && category.subSources) {
    const subSource = category.subSources.find((s) => s.key === row.subSource)
    if (subSource) {
      const field = subSource.fields.find((f) => f.key === row.field)
      if (field) return field
    }
  }

  return category.fields.find((f) => f.key === row.field)
}

/**
 * Resolves the operator display label.
 */
function resolveOperatorLabel(operatorKey: string, dataType?: string): string {
  if (!dataType) return operatorKey
  const ops = getOperatorsForType(dataType as 'text' | 'number' | 'date' | 'boolean' | 'enum')
  const op = ops.find((o) => o.value === operatorKey)
  return op?.label?.toLowerCase() ?? operatorKey
}

/**
 * Formats the value portion for display.
 */
function formatDisplayValue(row: CardFilterRow, fieldDef?: FilterFieldDef): string | null {
  const noValueOps = ['is_true', 'is_false', 'is_empty', 'is_not_empty']
  if (noValueOps.includes(row.operator)) return null

  if (ARRAY_VALUE_OPERATORS.includes(row.operator) && Array.isArray(row.value)) {
    return `${row.value.length} values`
  }

  if (row.operator === 'between' && Array.isArray(row.value)) {
    const [start, end] = row.value
    return `${start} – ${end}`
  }

  if (row.operator === 'in_last_n_days') {
    return `last ${row.value} days`
  }

  if (fieldDef?.dataType === 'enum' && fieldDef.enumOptions && typeof row.value === 'string') {
    const option = fieldDef.enumOptions.find((o) => o.value === row.value)
    return option?.label ?? row.value
  }

  if (row.value === null || row.value === undefined) return null
  return String(row.value)
}

/**
 * Builds tooltip for array values (is_in / is_not_in).
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

// ─── Summary Renderer ────────────────────────────────────────────────────────

function SummaryLine({
  row,
  sourceCategories,
}: {
  row: CardFilterRow
  sourceCategories: SourceCategoryConfig[]
}) {
  const fieldDef = resolveFieldDef(row, sourceCategories)
  const fieldLabel = fieldDef?.label ?? row.field
  const operatorLabel = resolveOperatorLabel(row.operator, fieldDef?.dataType)
  const valuePortion = formatDisplayValue(row, fieldDef)

  const isArrayOp = ARRAY_VALUE_OPERATORS.includes(row.operator) && Array.isArray(row.value)

  return (
    <span className="text-base text-foreground leading-snug">
      <span className="font-semibold">{fieldLabel}</span>
      {' '}{operatorLabel}
      {valuePortion !== null && (
        <>
          {' '}
          {isArrayOp ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-semibold underline decoration-dotted underline-offset-2 cursor-default">
                    {valuePortion}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  {buildArrayValueTooltip(row.value as string[])}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="font-semibold">{valuePortion}</span>
          )}
        </>
      )}
    </span>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ConditionCard({
  row,
  sourceCategories,
  onRemove,
  onEdit,
  onClone,
  onToggleDisabled,
  isInvalid = false,
}: ConditionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isEmpty = !row.sourceCategory && !row.field && !row.operator
  const isDisabled = row.disabled === true

  // Empty state: dashed border CTA
  if (isEmpty) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="w-full flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
      >
        <span className="flex-1 text-left text-sm text-primary font-medium">
          Configure condition
        </span>
      </button>
    )
  }

  const sourcePath = resolveSourcePath(row, sourceCategories)

  return (
    <div
      data-condition-card
      className={cn(
        'relative rounded-lg border bg-card p-2 flex items-center gap-3 transition-all duration-150',
        isInvalid ? 'opacity-50 border-border' : isDisabled ? 'opacity-40 border-border' : isHovered ? 'border-primary shadow-md' : 'border-border'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag handle */}
      <span className="shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing">
        <DotsSixVertical size={18} weight="bold" />
      </span>

      {/* Source type icon */}
      <span className="shrink-0">
        {isInvalid ? (
          <Warning size={24} weight="fill" className="text-amber-500" />
        ) : (
          getSourceIcon(row.sourceCategory)
        )}
      </span>

      {/* Centre content — clickable to edit */}
      <button
        type="button"
        onClick={isInvalid ? undefined : onEdit}
        disabled={isInvalid}
        className={cn(
          'flex-1 flex flex-col gap-0 text-left min-w-0',
          !isInvalid && 'cursor-pointer',
          isInvalid && 'cursor-default'
        )}
      >
        {/* Line 1: summary — Body/Base */}
        <SummaryLine row={row} sourceCategories={sourceCategories} />

        {/* Line 2: source path — Body/S */}
        <span className="text-sm text-muted-foreground truncate">
          {sourcePath}
        </span>
      </button>

      {/* Action buttons — shown only when this specific card is hovered, or eye always visible when disabled */}
      {(isHovered || isDisabled) && !isInvalid && (
        <div className="shrink-0 flex items-center gap-1">
          {isHovered && !isDisabled && onClone && (
            <button
              type="button"
              onClick={onClone}
              className="p-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
              aria-label="Clone condition"
            >
              <Copy size={14} weight="regular" />
            </button>
          )}
          {onToggleDisabled && (
            <button
              type="button"
              onClick={onToggleDisabled}
              className="p-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
              aria-label={isDisabled ? 'Enable condition' : 'Disable condition'}
            >
              {isDisabled ? <EyeSlash size={14} weight="regular" /> : <Eye size={14} weight="regular" />}
            </button>
          )}
          {isHovered && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors"
              aria-label="Remove condition"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
