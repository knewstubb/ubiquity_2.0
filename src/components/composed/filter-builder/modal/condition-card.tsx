/**
 * @component ConditionCard
 * @description Renders a single filter condition as a full-width white card with
 * drag handle, source icon, natural language summary (bold field + value), source
 * path breadcrumb, and remove/clone/disable actions.
 *
 * @designDecisions
 * - Full-width white card with rounded-lg border for a clean scannable list
 * - Drag handle (DotsSixVertical) on the left signals reorder affordance
 * - Source type icon resolved by category key convention — domain-specific icons
 *   provide instant visual identification of the data source:
 *   UsersThree (contacts/audience), EnvelopeSimple (email), ChatCentered (SMS),
 *   Confetti (events), ClipboardText (surveys), ListChecks (forms),
 *   Bell (push notifications), Funnel (saved filters), Table (transactional/default)
 * - Summary line: bold field name, normal operator, bold value
 * - Source path line below in muted small text (Category > SubSource > ...)
 * - Action buttons (clone + disable + remove) use explicit isHovered state via
 *   onMouseEnter/onMouseLeave — avoids CSS group-hover which can bleed
 *   through when cards are rendered inside nested flex/grid containers
 * - Clone (Copy icon) duplicates the condition — optional via onClone prop,
 *   only shown on hover when not disabled. Hover uses teal (primary) colour
 *   to signal a constructive/additive action. disableClone prop renders the
 *   button in a disabled state (opacity-40, cursor-not-allowed) with a
 *   "Condition limit reached" tooltip — used when maxConditions is hit.
 * - Remove (X icon) with destructive (red) hover styling for clear affordance —
 *   shown only on hover, positioned before disable for quick access
 * - Disable toggle (Eye/EyeSlash icon) lets users temporarily exclude a
 *   condition without removing it — placed last (rightmost) so it's always
 *   visible when condition is disabled for re-enable discoverability. Hover
 *   uses amber colour to signal caution (non-destructive but impactful).
 * - Action button hover colours follow semantic intent: teal = constructive,
 *   red = destructive, amber = caution
 * - Clicking the card body (not action buttons) opens edit modal
 * - Empty/unconfigured rows show a dashed-border "Configure condition" CTA
 * - Invalid conditions: opacity-50 on entire card + amber Warning icon —
 *   still removable, edit disabled; action buttons hidden entirely when invalid
 * - Disabled conditions: per-element opacity-40 on drag handle, icon, and
 *   content area — card border remains full opacity so the card outline stays
 *   visible in the list, avoiding a "ghost" card effect. Action buttons
 *   (especially the eye icon) stay at full opacity for re-enable discoverability.
 *   Card-level hover border (border-primary + shadow-md) still applies to
 *   disabled conditions so the user can tell they are interactive.
 *
 * @usage
 * - Used inside LogicGroupRenderer for each configured condition in modal variant
 * - Not standalone — relies on parent for onEdit, onRemove, and optionally onClone/onToggleDisabled callbacks
 */

import { useState } from 'react'
import { DotsSixVertical, X, UsersThree, Table, EnvelopeSimple, ChatCentered, Confetti, ClipboardText, ListChecks, Bell, Funnel, Warning, Copy, Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { generateConditionSummary } from '../summary'
import { ARRAY_VALUE_OPERATORS, RELATIONSHIP_OPERATORS, SUB_FILTER_OPERATORS } from '../operators'
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
  disableClone?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves the source category icon based on key convention.
 * Falls back to Table icon for transactional/unknown sources.
 */
function getSourceIcon(sourceCategory: string): React.ReactNode {
  const key = sourceCategory.toLowerCase()
  if (key.includes('contact') || key.includes('people') || key.includes('audience')) {
    return <UsersThree size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('email') || key.includes('mail')) {
    return <EnvelopeSimple size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('sms') || key.includes('chat') || key.includes('text')) {
    return <ChatCentered size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('event') || key.includes('conference') || key.includes('webinar')) {
    return <Confetti size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('survey') || key.includes('feedback') || key.includes('nps')) {
    return <ClipboardText size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('form') || key.includes('signup') || key.includes('submission')) {
    return <ListChecks size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('push') || key.includes('notification')) {
    return <Bell size={24} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('filter') || key.includes('saved')) {
    return <Funnel size={24} weight="regular" className="shrink-0 text-muted-foreground" />
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

  // Walk the sub-source tree using the slash-separated path
  const pathKeys = row.subSource.split('/')
  const pathParts = [category.title]
  let currentSubs = category.subSources

  for (const key of pathKeys) {
    const found = currentSubs.find((s) => s.key === key)
    if (!found) break
    pathParts.push(found.label)
    currentSubs = found.subSources ?? []
  }

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
 * Resolves the fields available from the sub-source (for transactional conditions).
 */
function resolveSubSourceFields(
  row: CardFilterRow,
  sourceCategories: SourceCategoryConfig[]
): FilterFieldDef[] {
  const category = sourceCategories.find((c) => c.key === row.sourceCategory)
  if (!category) return []

  if (row.subSource && category.subSources) {
    const subSource = category.subSources.find((s) => s.key === row.subSource)
    if (subSource) return subSource.fields
  }

  return category.fields
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
  // Special case: relationship/transactional conditions
  if (row.field === '__relationship__') {
    const relOp = RELATIONSHIP_OPERATORS.find((o) => o.value === row.operator)
    const operatorLabel = relOp?.label?.toLowerCase() ?? row.operator

    // Resolve sub-source label for the header
    const category = sourceCategories.find((c) => c.key === row.sourceCategory)
    let subSourceLabel = ''
    if (row.subSource && category?.subSources) {
      const sub = category.subSources.find((s) => s.key === row.subSource)
      if (sub) subSourceLabel = sub.label
    }

    // Build comprehensive summary parts
    const summaryParts: React.ReactNode[] = [
      <span key="op" className="font-semibold">{subSourceLabel || row.sourceCategory}</span>,
      <span key="rel"> {operatorLabel}</span>,
    ]

    // Add WHERE clause summary
    if (row.subFilters && row.subFilters.conditions.length > 0) {
      const fields = resolveSubSourceFields(row, sourceCategories)
      const filterDescriptions: string[] = []
      for (const cond of row.subFilters.conditions) {
        if (cond.type === 'row' && cond.row.field && cond.row.operator) {
          const fieldDef = fields.find((f) => f.key === cond.row.field)
          const fLabel = fieldDef?.label ?? cond.row.field
          const ops = fieldDef ? getOperatorsForType(fieldDef.dataType) : []
          const opLabel = ops.find((o) => o.value === cond.row.operator)?.label?.toLowerCase() ?? cond.row.operator
          const val = cond.row.value ? ` ${cond.row.value}` : ''
          filterDescriptions.push(`${fLabel} ${opLabel}${val}`)
        }
      }
      if (filterDescriptions.length > 0) {
        const logic = row.subFilters.logic === 'or' ? ' or ' : ' and '
        summaryParts.push(
          <span key="where" className="text-muted-foreground"> where </span>,
          <span key="filters">{filterDescriptions.join(logic)}</span>,
        )
      }
    }

    // Add aggregate summary
    if (row.aggregate && row.aggregate.type) {
      const fields = resolveSubSourceFields(row, sourceCategories)
      const aggType = row.aggregate.type.replace(/_/g, ' ')
      let aggText = aggType
      if (row.aggregate.type !== 'number_of_rows' && row.aggregate.field) {
        const fieldDef = fields.find((f) => f.key === row.aggregate!.field)
        aggText += ` of ${fieldDef?.label ?? row.aggregate.field}`
      }
      if (row.aggregate.operator) {
        aggText += ` ${row.aggregate.operator.replace(/_/g, ' ')}`
      }
      if (row.aggregate.value) {
        aggText += ` ${row.aggregate.value}`
      }

      // Include additional aggregate field rows
      if (row.aggregate.additionalFields && row.aggregate.additionalFields.length > 0) {
        for (const addField of row.aggregate.additionalFields) {
          if (addField.field && addField.operator) {
            const fieldDef = fields.find((f) => f.key === addField.field)
            const fLabel = fieldDef?.label ?? addField.field
            const opLabel = addField.operator.replace(/_/g, ' ')
            const val = addField.value ? ` ${addField.value}` : ''
            aggText += ` and ${fLabel} ${opLabel}${val}`
          }
        }
      }

      summaryParts.push(
        <span key="agg" className="text-muted-foreground"> and those transactions have </span>,
        <span key="aggval" className="font-semibold">{aggText}</span>,
      )
    }

    return (
      <span className="text-base text-foreground leading-snug">
        {summaryParts}
      </span>
    )
  }

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
  disableClone = false,
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
        isInvalid ? 'opacity-50 border-border' : isHovered ? 'border-primary shadow-md' : 'border-border'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag handle */}
      <span className={cn("shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing", isDisabled && "opacity-40")}>
        <DotsSixVertical size={18} weight="bold" />
      </span>

      {/* Source type icon */}
      <span className={cn("shrink-0", isDisabled && "opacity-40")}>
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
          isInvalid && 'cursor-default',
          isDisabled && 'opacity-40'
        )}
      >
        {/* Line 1: summary — Body/Base */}
        <SummaryLine row={row} sourceCategories={sourceCategories} />

        {/* Line 2: source path — Body/S */}
        <span className="text-sm text-muted-foreground break-words">
          {sourcePath}
        </span>
      </button>

      {/* Action buttons — shown only when this specific card is hovered, or eye always visible when disabled */}
      {(isHovered || isDisabled) && !isInvalid && (
        <div className="shrink-0 flex items-center gap-1">
          {isHovered && !isDisabled && onClone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={disableClone ? undefined : onClone}
                    disabled={disableClone}
                    className={cn(
                      "p-1 rounded border border-border text-muted-foreground transition-colors",
                      disableClone ? "opacity-40 cursor-not-allowed" : "hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                    )}
                    aria-label="Clone condition"
                  >
                    <Copy size={14} weight="regular" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{disableClone ? 'Condition limit reached' : 'Clone'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isHovered && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="p-1 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors"
                    aria-label="Remove condition"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Remove</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onToggleDisabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleDisabled}
                    className="p-1 rounded border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-400/40 hover:bg-amber-50 transition-colors"
                    aria-label={isDisabled ? 'Enable condition' : 'Disable condition'}
                  >
                    {isDisabled ? <EyeSlash size={14} weight="regular" /> : <Eye size={14} weight="regular" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isDisabled ? 'Enable' : 'Disable'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  )
}
