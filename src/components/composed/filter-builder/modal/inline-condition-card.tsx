/**
 * @component InlineConditionCard
 * @description Inline card-based progressive drill-down for configuring filter
 * conditions. Replaces the ConditionModal with an in-place card that appears
 * within the filter list. Supports two condition modes:
 * 1. Field-based: source → subsource → field → operator/value
 * 2. Relationship-based: source → subsource (transactional) → relationship
 *    operator → optional sub-filter conditions (WHERE clause)
 *
 * @designDecisions
 * - White card with border replaces modal overlay — keeps user in context
 * - Progressive drill-down: source → sub-sources → field → operator → value
 * - Combobox replaced by DrilldownNavigator — a slide-animated list navigator
 *   handles source → sub-source → field selection with visible breadcrumbs,
 *   better suited for deep (3+ level) hierarchies than a flat popover
 * - Header row only visible during operator-value phase — drill-down phases
 *   (source/subsource/field) rely on the DrilldownNavigator's own breadcrumb
 *   for context, avoiding redundant header UI during selection
 * - Operator-value phase promotes the field label to text-base font-semibold as
 *   the primary header, with source path demoted to secondary muted text — this
 *   establishes clear information hierarchy once the user is configuring values
 * - Date mode uses an inline Select dropdown (same component as operator) rather
 *   than a separate segmented control — consistent visual density, reduces
 *   vertical space usage in the compact card layout
 * - Anniversary date mode uses a full Calendar picker (same as other date modes)
 *   rather than separate Month/Day dropdowns — consistent UX, stores as MM-DD
 * - Operator/value phase uses a single inline row (no wrap): operator, date
 *   mode (when applicable), and value input all sit in the same row with
 *   progressive reveal. Each element uses flex-1 basis-1/3 for equal
 *   distribution — operator, date mode (when applicable), and value input
 *   each occupy ~1/3 of available width regardless of selection state.
 *   No-value operators keep only the operator visible. Elements shrink rather
 *   than wrap to maintain a single-line layout at all widths.
 * - Relationship operators (has_transactions, has_matching_transactions, etc.)
 *   skip the field phase entirely — sub-sources with sourceType 'transactional'
 *   jump straight to operator-value with field='__relationship__'. This models
 *   the "does this contact have records where...?" pattern from the audit
 *   (see docs/research/filter-builder-audit.md)
 * - Sub-filter section (WHERE clause) renders as a bordered sub-card with
 *   field/operator/value rows and AND chaining — only appears for matching
 *   operators (has_matching_transactions, does_not_have_matching). Stored as
 *   a FilterGroup on the condition row's subFilters field. Initializes with
 *   one empty row so the user immediately sees an editable condition rather
 *   than an empty state requiring an explicit "add" click. Sub-filter rows
 *   use the same progressive reveal pattern as the main condition phase:
 *   field select starts at flex-[3] (full width), shrinks to flex-[1.5] once
 *   selected, then to flex-1 once operator appears. Operator and value inputs
 *   are conditionally rendered (not disabled) and slide in from the right via
 *   slideInRight animation — keeps the row compact until each piece is needed.
 * - Aggregate section ("And those transactions have") renders below the WHERE
 *   clause for matching operators. Allows users to add a measure condition
 *   (number_of_rows, total_value, highest_value, lowest_value, average) with
 *   an optional numeric field, comparison operator, and value. Stored as an
 *   AggregateCondition on the condition row's aggregate field. For
 *   number_of_rows the field picker is hidden since it counts records rather
 *   than summing a field. Aggregate Row 2 (field/operator/value) uses the same
 *   progressive reveal pattern as sub-filter rows: field starts at flex-[3]
 *   (full width), shrinks to flex-[1.5] once selected, then to flex-1 once
 *   operator appears. Operator and value are conditionally rendered with
 *   slideInRight animation (250ms ease-out). Each row includes a trailing X
 *   button to reset the row's field/operator/value without removing the entire
 *   aggregate — allows quick re-configuration of the measure condition.
 *   Additional aggregate field rows are separated by AND pill dividers (teal
 *   text on accent background, horizontal lines either side) matching the
 *   sub-filter WHERE clause visual language — reinforces that conditions are
 *   combined with AND logic. Each additional row uses the same progressive
 *   flex reveal and slideInRight animation as the primary aggregate row.
 * - Phase transitions use custom @keyframes animations defined in globals.css:
 *   "drillForward" (450ms ease, translateX 24px→0 + opacity) for the
 *   operator-value phase container and header row — conveys forward
 *   navigation from the drilldown selection into configuration. "slideUp"
 *   (200ms ease-out, translateY 12px→0) for sub-sections (WHERE clause,
 *   aggregate) that reveal vertically within the phase. "slideInRight"
 *   (250ms ease-out, translateX 16px→0) for inline progressive reveals
 *   (date mode, value inputs, sub-filter operator/value). Applied via
 *   inline style attributes rather than Tailwind animate-in utilities for
 *   reliable play-once behaviour with React conditional rendering.
 * - Operator Select trigger uses conditional cn() to apply text-primary when no
 *   operator is selected (placeholder state) — cleaner than descendant selectors
 * - Date mode Select uses default styling (no teal emphasis) since it always
 *   has a value selected (defaults to "Specific date")
 * - "Change" link resets to source phase without requiring modal re-open
 * - Summary bar (green accent strip) shows a natural language condition preview
 *   once a field is selected — reads like the final condition card
 *   ("Field Name operator value") rather than a breadcrumb path. Only appears
 *   after field selection; appends "..." while the condition is still incomplete.
 *   For relationship conditions, the summary is comprehensive: includes the
 *   sub-source label + relationship operator + sub-filter WHERE clause
 *   (field/operator/value joined by logic connector) + aggregate measure
 *   ("with {type} of {field} {operator} {value}") + any additional aggregate
 *   field conditions joined with "and" (e.g. "and Quantity greater than 5").
 *   This gives users a full natural-language read of their transactional
 *   condition as they build it.
 *   Always visible regardless of chip input expansion state — user can read
 *   their condition summary and confirm at any point during bulk value entry.
 * - Footer (Cancel + Add to filter) is always visible once the card renders —
 *   never hidden by chip input expansion. This ensures users always have a
 *   clear exit path and can confirm without dismissing the chip textarea first.
 * - "+ Add to filter" button only active when condition is complete (via isConditionComplete)
 * - Edit mode starts at Phase 4 with pre-populated values from existing row
 * - Cancelling removes the card entirely — no empty cards persist in the filter tree
 * - Click-outside dismissal disabled due to Radix Select portal timing conflicts —
 *   Radix portals render outside the card DOM and tear down asynchronously,
 *   making reliable outside-click detection impractical without race conditions.
 *   Users close via the Cancel button instead.
 * - Card uses overflow-visible + relative z-10 to allow popovers/Calendar
 *   popovers to render above surrounding filter rows without clipping — Radix
 *   portals anchor visually to the trigger, so the card must participate in
 *   the stacking context above sibling condition rows
 * - 4px radius per docs/ui/borders-radius.md
 *
 * @usage
 * - Use inside the FilterBuilder as the inline condition editor
 * - Preferred over ConditionModal when conditions should be added in-place within the list
 * - Not used standalone — always rendered within a LogicGroupRenderer
 * - For transactional sources: set sourceType 'transactional' on SubSourceConfig
 *   to enable relationship operator mode instead of field selection
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UsersThree, Table, EnvelopeSimple, ChatCentered, Confetti, ClipboardText, ListChecks, Bell, Funnel, TextAa, ListBullets, X, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { SpinnerInput } from '@/components/ui/spinner-input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarBlank } from '@phosphor-icons/react'

import type { CardFilterRow, FilterFieldDef, FilterGroup, SourceCategoryConfig, SubSourceConfig, AggregateCondition, AggregateType } from '../types'
import { isConditionComplete } from '../validation'
import { getOperatorsForType, NO_VALUE_OPERATORS, ARRAY_VALUE_OPERATORS, RELATIONSHIP_OPERATORS, SUB_FILTER_OPERATORS } from '../operators'
import { FilterChipInput } from './chip-input'
import { DrilldownNavigator, type DrilldownSelection } from './drilldown-navigator'
import type { DateMode } from '../date-mode-selector'

// ─── Props ───────────────────────────────────────────────────────────────────

export interface InlineConditionCardProps {
  sourceCategories: SourceCategoryConfig[]
  mode: 'add' | 'edit'
  editRow?: CardFilterRow | null
  onConfirm: (row: CardFilterRow) => void
  onCancel: () => void
}

// ─── Internal State ──────────────────────────────────────────────────────────

interface InlineCardState {
  phase: 'source' | 'subsource' | 'field' | 'operator-value'
  sourceCategory: string | null
  subSourcePath: string[]
  field: string | null
  operator: string | null
  value: string | number | boolean | null | [string, string] | string[]
  dateMode: 'specific' | 'anniversary' | 'same_day' | null
  subFilters: FilterGroup | null
  aggregate: AggregateCondition | null
}

interface SubFilterRowState {
  field: string
  operator: string
  value: string
}

function createInitialState(
  mode: 'add' | 'edit',
  editRow?: CardFilterRow | null
): InlineCardState {
  if (mode === 'edit' && editRow) {
    return {
      phase: 'operator-value',
      sourceCategory: editRow.sourceCategory,
      subSourcePath: editRow.subSource ? editRow.subSource.split('/') : [],
      field: editRow.field,
      operator: editRow.operator,
      value: editRow.value,
      dateMode: editRow.dateMode ?? null,
      subFilters: editRow.subFilters ?? null,
      aggregate: editRow.aggregate ?? null,
    }
  }
  return {
    phase: 'source',
    sourceCategory: null,
    subSourcePath: [],
    field: null,
    operator: null,
    value: null,
    dateMode: null,
    subFilters: null, aggregate: null,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSourceIcon(sourceCategory: string): React.ReactNode {
  const key = sourceCategory.toLowerCase()
  if (key.includes('contact') || key.includes('people') || key.includes('audience')) {
    return <UsersThree size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('email') || key.includes('mail')) {
    return <EnvelopeSimple size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('sms') || key.includes('chat') || key.includes('text')) {
    return <ChatCentered size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('event') || key.includes('conference') || key.includes('webinar')) {
    return <Confetti size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('survey') || key.includes('feedback') || key.includes('nps')) {
    return <ClipboardText size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('form') || key.includes('signup') || key.includes('submission')) {
    return <ListChecks size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('push') || key.includes('notification')) {
    return <Bell size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('filter') || key.includes('saved')) {
    return <Funnel size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  return <Table size={16} weight="regular" className="shrink-0 text-muted-foreground" />
}

const DATA_TYPE_LABELS: Record<FilterFieldDef['dataType'], string> = {
  text: 'Txt', number: 'Num', date: 'Date', boolean: 'Bool', enum: 'Enum',
}

// ─── Inline Value Input ──────────────────────────────────────────────────────

function InlineValueInput({
  field,
  operator,
  value,
  onValueChange,
  dateMode,
}: {
  field: FilterFieldDef | null
  operator: string | null
  value: string | number | boolean | null | [string, string] | string[]
  onValueChange: (v: string) => void
  dateMode?: 'specific' | 'anniversary' | 'same_day' | null
}) {
  if (!field || !operator) return null

  // Enum fields
  if (field.dataType === 'enum' && field.enumOptions) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <ListBullets size={14} />
        </span>
        <Select value={typeof value === 'string' ? value : undefined} onValueChange={onValueChange}>
          <SelectTrigger className="h-8 text-sm pl-8">
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent>
            {field.enumOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Date fields
  if (field.dataType === 'date') {
    if (dateMode === 'anniversary') {
      // Anniversary: use a date picker but store as MM-DD (ignore year)
      const currentVal = typeof value === 'string' ? value : ''
      // Parse MM-DD back to a displayable date (use 2000 as placeholder year)
      const parts = currentVal.split('-')
      const displayDate = parts.length === 2 && parts[0] && parts[1]
        ? new Date(2000, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10))
        : undefined
      const displayText = displayDate && !isNaN(displayDate.getTime())
        ? displayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : null

      return (
        <div className="w-56">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal h-8 text-sm', !displayText && 'text-muted-foreground')}
              >
                <CalendarBlank size={14} className="mr-2 shrink-0" />
                {displayText ?? 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[200]" align="start">
              <Calendar
                mode="single"
                selected={displayDate}
                onSelect={(date) => {
                  if (date) {
                    const mm = String(date.getMonth() + 1).padStart(2, '0')
                    const dd = String(date.getDate()).padStart(2, '0')
                    onValueChange(`${mm}-${dd}`)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }

    if (operator === 'between') {
      const rangeValue: [string, string] = Array.isArray(value) ? value as [string, string] : ['', '']
      const from = rangeValue[0] ? new Date(rangeValue[0]) : undefined
      const to = rangeValue[1] ? new Date(rangeValue[1]) : undefined
      const displayText = from && to
        ? `${from.toLocaleDateString()} – ${to.toLocaleDateString()}`
        : from
          ? `${from.toLocaleDateString()} – ...`
          : null

      return (
        <div className="w-64">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal h-8 text-sm', !displayText && 'text-muted-foreground')}
              >
                <CalendarBlank size={14} className="mr-2 shrink-0" />
                {displayText ?? 'Select date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[200]" align="start">
              <Calendar
                mode="range"
                selected={from && to ? { from, to } : from ? { from, to: undefined } : undefined}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onValueChange(`${range.from.toISOString().split('T')[0]},${range.to.toISOString().split('T')[0]}`)
                  } else if (range?.from) {
                    onValueChange(range.from.toISOString().split('T')[0])
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }

    if (operator === 'in_last_n_days') {
      return (
        <div className="flex rounded-md border border-input overflow-hidden focus-within:border-ring focus-within:shadow-ring h-8">
          <Input
            type="number"
            placeholder="Number of days"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onValueChange(e.target.value)}
            className="h-full text-sm flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none rounded-none"
            min={1}
            max={3650}
          />
          <span className="inline-flex items-center border-l border-input bg-muted px-3 text-sm text-muted-foreground select-none shrink-0">
            days
          </span>
        </div>
      )
    }

    // Single date
    const dateValue = typeof value === 'string' && value ? new Date(value) : undefined
    const displayText = dateValue && !isNaN(dateValue.getTime())
      ? dateValue.toLocaleDateString()
      : null

    return (
      <div className="w-56">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal h-8 text-sm', !displayText && 'text-muted-foreground')}
            >
              <CalendarBlank size={14} className="mr-2 shrink-0" />
              {displayText ?? 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[200]" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => {
                if (date) onValueChange(date.toISOString().split('T')[0])
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Number fields
  if (field.dataType === 'number') {
    return (
      <div className="w-48">
        <SpinnerInput
          value={value !== null && value !== '' ? (typeof value === 'number' ? value : parseFloat(String(value)) || undefined) : undefined}
          onChange={(v) => onValueChange(String(v))}
          placeholder="Enter number..."
        />
      </div>
    )
  }

  // Default: text input
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
        <TextAa size={14} />
      </span>
      <Input
        placeholder="Enter value..."
        value={typeof value === 'string' ? value : value !== null ? String(value) : ''}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-8 text-sm pl-8"
        maxLength={500}
      />
    </div>
  )
}

// ─── Sub-Filter Section (Transactional relationship matching) ─────────────────

function SubFilterSection({
  fields,
  subFilters,
  onChange,
}: {
  fields: FilterFieldDef[]
  subFilters: FilterGroup | null
  onChange: (sf: FilterGroup) => void
}) {
  const rows: SubFilterRowState[] = useMemo(() => {
    if (!subFilters) return []
    return subFilters.conditions
      .filter((c) => c.type === 'row')
      .map((c) => {
        const r = c.row
        return {
          field: r.field ?? '',
          operator: r.operator ?? '',
          value: typeof r.value === 'string' ? r.value : r.value !== null && r.value !== undefined ? String(r.value) : '',
        }
      })
  }, [subFilters])

  const handleRowChange = useCallback((index: number, patch: Partial<SubFilterRowState>) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], ...patch }
    // If field changed, reset operator and value
    if (patch.field !== undefined) {
      newRows[index].operator = ''
      newRows[index].value = ''
    }
    onChange({
      logic: 'and',
      conditions: newRows.map((r) => ({
        type: 'row' as const,
        row: { field: r.field, operator: r.operator, value: r.value },
      })),
    })
  }, [rows, onChange])

  const handleAddRow = useCallback(() => {
    const newRows = [...rows, { field: '', operator: '', value: '' }]
    onChange({
      logic: 'and',
      conditions: newRows.map((r) => ({
        type: 'row' as const,
        row: { field: r.field, operator: r.operator, value: r.value },
      })),
    })
  }, [rows, onChange])

  const handleRemoveRow = useCallback((index: number) => {
    const newRows = rows.filter((_, i) => i !== index)
    onChange({
      logic: 'and',
      conditions: newRows.map((r) => ({
        type: 'row' as const,
        row: { field: r.field, operator: r.operator, value: r.value },
      })),
    })
  }, [rows, onChange])

  return (
    <div className="mt-3 rounded-md border border-border p-3" style={{ animation: "slideUp 200ms ease-out both" }}>
      <span className="text-xs font-semibold uppercase tracking-wide text-primary mb-2 block">
        WHERE
      </span>

      {rows.map((row, idx) => {
        const fieldDef = fields.find((f) => f.key === row.field)
        const operators = fieldDef ? getOperatorsForType(fieldDef.dataType) : []

        return (
          <div key={idx}>
            {idx > 0 && (
              <div className="flex items-center gap-2 my-1.5">
                <div className="w-4 h-px bg-primary/50" />
                <button
                  type="button"
                  onClick={() => {
                    if (subFilters) {
                      onChange({ ...subFilters, logic: subFilters.logic === 'and' ? 'or' : 'and' })
                    }
                  }}
                  className="px-2 py-0.5 rounded-full border border-primary/40 text-[10px] font-bold uppercase text-primary bg-accent cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {subFilters?.logic?.toUpperCase() ?? 'AND'}
                </button>
                <div className="flex-1 h-px bg-primary/50" />
              </div>
            )}
            <div className="flex items-center gap-2">
              {/* Field select — full width initially, shrinks as siblings appear */}
              <div className={cn(
                "min-w-0 transition-all duration-300 ease-out",
                !row.field ? "flex-[3]" : row.operator ? "flex-1" : "flex-[1.5]"
              )}>
                <Select value={row.field || undefined} onValueChange={(v) => handleRowChange(idx, { field: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator select — appears after field is selected */}
              {row.field && (
                <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                  <Select
                    value={row.operator || undefined}
                    onValueChange={(v) => handleRowChange(idx, { operator: v })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Value input — appears after operator is selected */}
              {row.field && row.operator && !NO_VALUE_OPERATORS.includes(row.operator) && (
                <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                  {fieldDef?.dataType === 'enum' && fieldDef.enumOptions ? (
                    <Select value={row.value || undefined} onValueChange={(v) => handleRowChange(idx, { value: v })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Value" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldDef.enumOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Value"
                      type={fieldDef?.dataType === 'number' ? 'number' : fieldDef?.dataType === 'date' ? 'date' : 'text'}
                      value={row.value}
                      onChange={(e) => handleRowChange(idx, { value: e.target.value })}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )
      })}

      {/* Add condition button */}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="self-start mt-1"
        onClick={handleAddRow}
      >
        <Plus size={12} className="mr-1" />
        Add field filter
      </Button>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InlineConditionCard({
  sourceCategories,
  mode,
  editRow,
  onConfirm,
  onCancel,
}: InlineConditionCardProps) {
  const [state, setState] = useState<InlineCardState>(() => createInitialState(mode, editRow))
  const [chipExpanded, setChipExpanded] = useState(false)
  const [returningFromOperator, setReturningFromOperator] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Reset state when mode/editRow changes
  useEffect(() => {
    setState(createInitialState(mode, editRow))
  }, [mode, editRow])

  // Clear the returning flag once the drilldown has mounted
  useEffect(() => {
    if (returningFromOperator && state.phase !== 'operator-value') {
      const timer = setTimeout(() => setReturningFromOperator(false), 500)
      return () => clearTimeout(timer)
    }
  }, [returningFromOperator, state.phase])

  // Click-outside disabled for now due to Radix Select portal timing conflicts
  // Users close via the Cancel button instead

  // ─── Derived ───────────────────────────────────────────────────────────

  const selectedCategory = useMemo(
    () => sourceCategories.find((c) => c.key === state.sourceCategory) ?? null,
    [state.sourceCategory, sourceCategories]
  )

  const hasReachedFields = useMemo(() => {
    if (!selectedCategory) return false
    if (!selectedCategory.subSources || selectedCategory.subSources.length === 0) return true
    let cur: SubSourceConfig | undefined
    let subs = selectedCategory.subSources
    for (const key of state.subSourcePath) {
      cur = subs.find((s) => s.key === key)
      if (!cur) return false
      subs = cur.subSources ?? []
    }
    return cur ? subs.length === 0 : false
  }, [selectedCategory, state.subSourcePath])

  const currentSubSources: SubSourceConfig[] = useMemo(() => {
    if (!selectedCategory) return []
    if (!selectedCategory.subSources || selectedCategory.subSources.length === 0) return []
    let subs = selectedCategory.subSources
    for (const key of state.subSourcePath) {
      const cur = subs.find((s) => s.key === key)
      if (!cur) return subs
      if (cur.subSources && cur.subSources.length > 0) {
        subs = cur.subSources
      } else {
        return []
      }
    }
    return subs
  }, [selectedCategory, state.subSourcePath])

  const availableFields: FilterFieldDef[] = useMemo(() => {
    if (!selectedCategory) return []
    if (!selectedCategory.subSources || selectedCategory.subSources.length === 0) return selectedCategory.fields
    let cur: SubSourceConfig | undefined
    let subs = selectedCategory.subSources
    for (const key of state.subSourcePath) {
      cur = subs.find((s) => s.key === key)
      if (!cur) return []
      subs = cur.subSources ?? []
    }
    return cur?.fields ?? []
  }, [selectedCategory, state.subSourcePath])

  const selectedField = useMemo(
    () => state.field ? availableFields.find((f) => f.key === state.field) ?? null : null,
    [state.field, availableFields]
  )

  const currentRow: CardFilterRow = useMemo(() => ({
    sourceCategory: state.sourceCategory ?? '',
    subSource: state.subSourcePath.length > 0 ? state.subSourcePath.join('/') : null,
    field: state.field ?? '',
    operator: state.operator ?? '',
    value: state.value,
    dateMode: state.dateMode,
    subFilters: state.subFilters,
    aggregate: state.aggregate,
  }), [state])

  const canConfirm = isConditionComplete(currentRow)

  // Summary text for the green bar — only shown once field is selected
  // Reads like the final condition card: "Field Name operator value"
  const summaryText = useMemo(() => {
    // For relationship conditions, build comprehensive summary
    if (state.field === '__relationship__') {
      const parts: string[] = []
      let subs = selectedCategory?.subSources ?? []
      for (const key of state.subSourcePath) {
        const f = subs.find((s) => s.key === key)
        if (f) { parts.push(f.label); subs = f.subSources ?? [] }
      }
      if (state.operator) {
        const op = RELATIONSHIP_OPERATORS.find((o) => o.value === state.operator)
        if (op) parts.push(op.label.toLowerCase())
      }
      if (parts.length === 0) return null

      // Add sub-filter summary (WHERE clause)
      if (state.subFilters && state.subFilters.conditions.length > 0) {
        const filterParts: string[] = []
        for (const cond of state.subFilters.conditions) {
          if (cond.type === 'row' && cond.row.field && cond.row.operator) {
            const fieldDef = availableFields.find((f) => f.key === cond.row.field)
            const fieldLabel = fieldDef?.label ?? cond.row.field
            const ops = fieldDef ? getOperatorsForType(fieldDef.dataType) : []
            const opLabel = ops.find((o) => o.value === cond.row.operator)?.label?.toLowerCase() ?? cond.row.operator
            const val = cond.row.value ? ` ${cond.row.value}` : ''
            filterParts.push(`${fieldLabel} ${opLabel}${val}`)
          }
        }
        if (filterParts.length > 0) {
          const logic = state.subFilters.logic === 'or' ? ' or ' : ' and '
          parts.push(`where ${filterParts.join(logic)}`)
        }
      }

      // Add aggregate summary (AND THOSE TRANSACTIONS HAVE)
      if (state.aggregate && state.aggregate.type) {
        const aggLabel = state.aggregate.type.replace(/_/g, ' ')
        const aggParts: string[] = [aggLabel]
        if (state.aggregate.type !== 'number_of_rows' && state.aggregate.field) {
          const fieldDef = availableFields.find((f) => f.key === state.aggregate.field)
          aggParts.push(`of ${fieldDef?.label ?? state.aggregate.field}`)
        }
        if (state.aggregate.operator) {
          const opLabel = state.aggregate.operator.replace(/_/g, ' ')
          aggParts.push(opLabel)
        }
        if (state.aggregate.value) {
          aggParts.push(state.aggregate.value)
        }

        // Include additional aggregate field rows
        if (state.aggregate.additionalFields && state.aggregate.additionalFields.length > 0) {
          for (const addField of state.aggregate.additionalFields) {
            if (addField.field && addField.operator) {
              const fieldDef = availableFields.find((f) => f.key === addField.field)
              const fLabel = fieldDef?.label ?? addField.field
              const opLabel = addField.operator.replace(/_/g, ' ')
              const val = addField.value ? ` ${addField.value}` : ''
              aggParts.push(`and ${fLabel} ${opLabel}${val}`)
            }
          }
        }

        parts.push(`and those transactions have ${aggParts.join(' ')}`)
      }

      return parts.join(' ') + (canConfirm ? '' : '...')
    }

    if (!selectedField) return null
    const parts: string[] = [selectedField.label]
    if (state.operator) {
      const ops = getOperatorsForType(selectedField.dataType)
      const op = ops.find((o) => o.value === state.operator)
      if (op) parts.push(op.label.toLowerCase())
    }
    if (state.value !== null && state.value !== undefined && state.value !== '') {
      if (Array.isArray(state.value) && ARRAY_VALUE_OPERATORS.includes(state.operator ?? '')) {
        if (state.value.length > 0) parts.push(`${state.value.length} values`)
      } else if (Array.isArray(state.value)) {
        parts.push(state.value.join(' – '))
      } else {
        parts.push(String(state.value))
      }
    }
    return parts.join(' ') + (canConfirm ? '' : '...')
  }, [selectedField, selectedCategory, state.field, state.operator, state.value, state.subSourcePath, state.subFilters, state.aggregate, availableFields, canConfirm])

  // Header text for current phase
  const headerText = useMemo(() => {
    switch (state.phase) {
      case 'source': return 'New condition'
      case 'subsource': {
        const parts = [selectedCategory?.title ?? 'Select sub-source']
        let subs = selectedCategory?.subSources ?? []
        for (const key of state.subSourcePath) {
          const f = subs.find((s) => s.key === key)
          if (f) { parts.push(f.label); subs = f.subSources ?? [] }
        }
        return parts.join(' > ') + ' > ...'
      }
      case 'field': {
        const parts = [selectedCategory?.title ?? '']
        let subs = selectedCategory?.subSources ?? []
        for (const key of state.subSourcePath) {
          const f = subs.find((s) => s.key === key)
          if (f) { parts.push(f.label); subs = f.subSources ?? [] }
        }
        return parts.join(' > ') + ' > ...'
      }
      case 'operator-value': {
        if (state.field === '__relationship__') {
          // For relationship, show the last sub-source label as the header
          let subs = selectedCategory?.subSources ?? []
          let lastLabel = 'Configure condition'
          for (const key of state.subSourcePath) {
            const f = subs.find((s) => s.key === key)
            if (f) { lastLabel = f.label; subs = f.subSources ?? [] }
          }
          return lastLabel
        }
        return selectedField?.label ?? 'Configure condition'
      }
    }
  }, [state.phase, selectedCategory, state.subSourcePath, selectedField, state.field])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback((key: string) => {
    const cat = sourceCategories.find((c) => c.key === key)
    if (!cat) return

    if (!cat.subSources || cat.subSources.length === 0) {
      // No sub-sources, go straight to field selection
      setState((prev) => ({
        ...prev,
        phase: 'field',
        sourceCategory: key,
        subSourcePath: [],
        field: null,
        operator: null,
        value: null,
        dateMode: null,
        subFilters: null, aggregate: null,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        phase: 'subsource',
        sourceCategory: key,
        subSourcePath: [],
        field: null,
        operator: null,
        value: null,
        dateMode: null,
        subFilters: null, aggregate: null,
      }))
    }
  }, [sourceCategories])

  const handleSubSourceSelect = useCallback((key: string) => {
    setState((prev) => {
      const newPath = [...prev.subSourcePath, key]
      // Check if there are more sub-sources at this level
      const cat = sourceCategories.find((c) => c.key === prev.sourceCategory)
      if (!cat) return prev
      let subs = cat.subSources ?? []
      let lastSub: SubSourceConfig | undefined
      for (const k of newPath) {
        const found = subs.find((s) => s.key === k)
        if (!found) return prev
        lastSub = found
        subs = found.subSources ?? []
      }

      // If no more sub-sources and this is a transactional source, skip field phase
      if (subs.length === 0 && lastSub?.sourceType === 'transactional') {
        return {
          ...prev,
          phase: 'operator-value' as const,
          subSourcePath: newPath,
          field: '__relationship__',
          operator: null,
          value: null,
          dateMode: null,
          subFilters: null, aggregate: null,
        }
      }

      // If no more sub-sources, move to field selection
      const nextPhase = subs.length === 0 ? 'field' as const : 'subsource' as const
      return {
        ...prev,
        phase: nextPhase,
        subSourcePath: newPath,
        field: null,
        operator: null,
        value: null,
        dateMode: null,
        subFilters: null, aggregate: null,
      }
    })
  }, [sourceCategories])

  const handleFieldSelect = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      phase: 'operator-value',
      field: key,
      operator: null,
      value: null,
      dateMode: null,
      subFilters: null, aggregate: null,
    }))
  }, [])

  const handleOperatorChange = useCallback((op: string) => {
    setState((prev) => {
      // For relationship sub-filter operators, initialize subFilters
      if (SUB_FILTER_OPERATORS.includes(op)) {
        return { ...prev, operator: op, value: null, subFilters: { logic: 'and' as const, conditions: [{ type: 'row' as const, row: { field: '', operator: '', value: '' } }] } }
      }

      const wasArrayOp = ARRAY_VALUE_OPERATORS.includes(prev.operator ?? '')
      const isArrayOp = ARRAY_VALUE_OPERATORS.includes(op)
      const DATE_MODE_UNSUPPORTED_OPS = ['in_last_n_days', 'is_empty', 'is_not_empty']
      const newDateMode = DATE_MODE_UNSUPPORTED_OPS.includes(op) ? null : prev.dateMode

      if (isArrayOp && !wasArrayOp) {
        return { ...prev, operator: op, value: [], dateMode: newDateMode, subFilters: null, aggregate: null }
      }
      if (!isArrayOp && wasArrayOp) {
        return { ...prev, operator: op, value: null, dateMode: newDateMode, subFilters: null, aggregate: null }
      }
      return { ...prev, operator: op, value: isArrayOp ? [] : null, dateMode: newDateMode, subFilters: null, aggregate: null }
    })
  }, [])

  const handleValueChange = useCallback((v: string) => {
    setState((prev) => ({ ...prev, value: v }))
  }, [])

  const handleChipValueChange = useCallback((chips: string[]) => {
    setState((prev) => ({ ...prev, value: chips }))
  }, [])

  const handleDateModeChange = useCallback((dateMode: DateMode) => {
    setState((prev) => ({ ...prev, dateMode, value: null }))
  }, [])

  const handleChangeSource = useCallback(() => {
    setReturningFromOperator(true)
    setState((prev) => ({
      ...prev,
      phase: 'source',
      sourceCategory: null,
      subSourcePath: [],
      field: null,
      operator: null,
      value: null,
      dateMode: null,
      subFilters: null, aggregate: null,
    }))
  }, [])

  const handleDrilldownSelect = useCallback((selection: DrilldownSelection) => {
    if (selection.isTransactional) {
      // Transactional sub-source — skip field phase, go to relationship operators
      setState((prev) => ({
        ...prev,
        phase: 'operator-value',
        sourceCategory: selection.sourceCategory,
        subSourcePath: selection.subSourcePath,
        field: '__relationship__',
        operator: null,
        value: null,
        dateMode: null,
        subFilters: null,
        aggregate: null,
      }))
    } else {
      // Field selected — move to operator/value phase
      setState((prev) => ({
        ...prev,
        phase: 'operator-value',
        sourceCategory: selection.sourceCategory,
        subSourcePath: selection.subSourcePath,
        field: selection.field,
        operator: null,
        value: null,
        dateMode: null,
        subFilters: null,
        aggregate: null,
      }))
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return
    onConfirm(currentRow)
  }, [canConfirm, currentRow, onConfirm])

  // ─── Determine which operators support date mode ────────────────────────
  const showDateMode = useMemo(() => {
    if (!selectedField || selectedField.dataType !== 'date') return false
    if (!state.operator) return false
    const noModOps = ['in_last_n_days', 'is_empty', 'is_not_empty', 'between']
    return !noModOps.includes(state.operator)
  }, [selectedField, state.operator])

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div ref={cardRef} className="rounded-lg border border-primary bg-card p-4 shadow-md overflow-visible">
      {/* Header row — hidden during drilldown phases (navigator has its own breadcrumb) */}
      {state.phase === 'operator-value' && (
      <div className="flex items-center justify-between mb-2 h-7" style={{ animation: "drillForward 450ms ease both" }}>
        <div className="flex items-center gap-2 min-w-0">
          {state.sourceCategory && (
            <span className="shrink-0">{getSourceIcon(state.sourceCategory)}</span>
          )}
          {selectedField ? (
            <>
              <span className="text-base font-semibold text-foreground truncate">
                {selectedField.label}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {(() => {
                  const parts: string[] = []
                  if (selectedCategory) parts.push(selectedCategory.title)
                  let subs = selectedCategory?.subSources ?? []
                  for (const key of state.subSourcePath) {
                    const f = subs.find((s) => s.key === key)
                    if (f) { parts.push(f.label); subs = f.subSources ?? [] }
                  }
                  return parts.join(' > ')
                })()}
              </span>
            </>
          ) : state.field === '__relationship__' ? (
            <>
              <span className="text-base font-semibold text-foreground truncate">
                {headerText}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {selectedCategory?.title ?? ''}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleChangeSource}
            className="text-xs text-primary font-medium hover:underline"
          >
            Change
          </button>
        </div>
      </div>
      )}

      {/* Phase-specific content */}
      <div className="flex flex-col gap-3">
        {/* Phases 1–3: Drilldown Navigator (source → sub-source → field) */}
        {(state.phase === 'source' || state.phase === 'subsource' || state.phase === 'field') && (
          <DrilldownNavigator
            sourceCategories={sourceCategories}
            onSelect={handleDrilldownSelect}
            slideInFromLeft={returningFromOperator}
          />
        )}

        {/* Phase 4: Operator/Value configuration — all inline, progressive reveal */}
        {state.phase === 'operator-value' && selectedField && (
          <div key="phase-operator" className="flex items-start gap-2" style={{ animation: "drillForward 450ms ease both" }}>
            {/* Operator select — always 1/3 width, animates expansion */}
            <div className="relative flex-1 min-w-0 basis-1/3 transition-all duration-300 ease-out">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Funnel size={14} />
              </span>
              <Select value={state.operator ?? undefined} onValueChange={handleOperatorChange}>
                <SelectTrigger className="h-8 text-sm pl-8">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorsForType(selectedField.dataType).map((op) => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date mode — appears inline between operator and value when applicable */}
            {showDateMode && (
              <div key={`datemode-${state.operator}`} className="relative flex-1 min-w-0 basis-1/3" style={{ animation: "slideInRight 250ms ease-out both" }}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <CalendarBlank size={14} />
                </span>
                <Select value={state.dateMode ?? 'specific'} onValueChange={(v) => handleDateModeChange(v as DateMode)}>
                  <SelectTrigger className="h-8 text-sm pl-8">
                    <SelectValue placeholder="Date mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specific">Specific date</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="same_day">Same day as</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Value input — slides in after operator (and date mode if present) */}
            {state.operator && !NO_VALUE_OPERATORS.includes(state.operator) && (
              <div key={`value-${state.operator}`} className="flex-1 min-w-0 basis-1/3" style={{ animation: "slideInRight 250ms ease-out both" }}>
                {ARRAY_VALUE_OPERATORS.includes(state.operator) ? (
                  <FilterChipInput
                    value={Array.isArray(state.value) ? state.value as string[] : []}
                    onChange={handleChipValueChange}
                    onExpandedChange={setChipExpanded}
                  />
                ) : (
                  <InlineValueInput
                    field={selectedField}
                    operator={state.operator}
                    value={state.value as string | number | boolean | null | [string, string]}
                    onValueChange={handleValueChange}
                    dateMode={state.dateMode}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase 4 (Relationship): Operator selection for transactional sub-sources */}
        {state.phase === 'operator-value' && state.field === '__relationship__' && !selectedField && (
          <div key="phase-relationship" style={{ animation: "drillForward 450ms ease both" }}>
            <div className="flex items-start gap-2">
              <div className="relative flex-1 min-w-0 basis-1/3 transition-all duration-300 ease-out">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Funnel size={14} />
                </span>
                <Select value={state.operator ?? undefined} onValueChange={handleOperatorChange}>
                  <SelectTrigger className="h-8 text-sm pl-8">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-filter section for matching operators */}
            {state.operator && SUB_FILTER_OPERATORS.includes(state.operator) && (
              <SubFilterSection
                fields={availableFields}
                subFilters={state.subFilters}
                onChange={(sf) => setState((prev) => ({ ...prev, subFilters: sf }))}
              />
            )}

            {/* Aggregate section — "And those transactions have" */}
            {state.operator && SUB_FILTER_OPERATORS.includes(state.operator) && (
              <div className="mt-3 rounded-md border border-border p-3" style={{ animation: "slideUp 200ms ease-out both" }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary mb-2 block">
                  AND THOSE TRANSACTIONS HAVE
                </span>
                <div className="flex flex-col gap-2">
                  {/* Row 1: Aggregate type with X button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <Select
                        value={state.aggregate?.type ?? undefined}
                        onValueChange={(v) => setState((prev) => ({
                          ...prev,
                          aggregate: { type: v as AggregateType, field: null, operator: '', value: '', additionalFields: [] },
                        }))}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select measure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number_of_rows">Number of Rows</SelectItem>
                          <SelectItem value="total_value">Total Value</SelectItem>
                          <SelectItem value="highest_value">Highest Value</SelectItem>
                          <SelectItem value="lowest_value">Lowest Value</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({
                        ...prev,
                        aggregate: null,
                      }))}
                      className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Row 2: Field + Operator + Value on one line (for value-based aggregates) */}
                  {state.aggregate && state.aggregate.type !== 'number_of_rows' && (
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "min-w-0 transition-all duration-300 ease-out",
                        !state.aggregate.field ? "flex-[3]" : state.aggregate.operator ? "flex-1" : "flex-[1.5]"
                      )}>
                        <Select
                          value={state.aggregate.field ?? undefined}
                          onValueChange={(v) => setState((prev) => ({
                            ...prev,
                            aggregate: prev.aggregate ? { ...prev.aggregate, field: v } : null,
                          }))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields
                              .filter((f) => f.dataType === 'number')
                              .map((f) => (
                                <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {state.aggregate.field && (
                        <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                          <Select
                            value={state.aggregate.operator || undefined}
                            onValueChange={(v) => setState((prev) => ({
                              ...prev,
                              aggregate: prev.aggregate ? { ...prev.aggregate, operator: v } : null,
                            }))}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not equals</SelectItem>
                              <SelectItem value="greater_than">Greater than</SelectItem>
                              <SelectItem value="less_than">Less than</SelectItem>
                              <SelectItem value="greater_or_equal">Greater or equal</SelectItem>
                              <SelectItem value="less_or_equal">Less or equal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {state.aggregate.operator && (
                        <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                          <Input
                            type="number"
                            placeholder="Value"
                            value={state.aggregate.value}
                            onChange={(e) => setState((prev) => ({
                              ...prev,
                              aggregate: prev.aggregate ? { ...prev.aggregate, value: e.target.value } : null,
                            }))}
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                      {/* Spacer to match X button width on row above */}
                      <div className="shrink-0 w-[22px]" />
                    </div>
                  )}

                  {/* Row 2 alt: Operator + Value for number_of_rows (no field needed) */}
                  {state.aggregate && state.aggregate.type === 'number_of_rows' && (
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "min-w-0 transition-all duration-300 ease-out",
                        state.aggregate.operator ? "flex-1" : "flex-[3]"
                      )}>
                        <Select
                          value={state.aggregate.operator || undefined}
                          onValueChange={(v) => setState((prev) => ({
                            ...prev,
                            aggregate: prev.aggregate ? { ...prev.aggregate, operator: v } : null,
                          }))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not equals</SelectItem>
                            <SelectItem value="greater_than">Greater than</SelectItem>
                            <SelectItem value="less_than">Less than</SelectItem>
                            <SelectItem value="greater_or_equal">Greater or equal</SelectItem>
                            <SelectItem value="less_or_equal">Less or equal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {state.aggregate.operator && (
                        <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                          <Input
                            type="number"
                            placeholder="Value"
                            value={state.aggregate.value}
                            onChange={(e) => setState((prev) => ({
                              ...prev,
                              aggregate: prev.aggregate ? { ...prev.aggregate, value: e.target.value } : null,
                            }))}
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                      {/* Spacer to match X button width on row above */}
                      <div className="shrink-0 w-[22px]" />
                    </div>
                  )}

                  {/* Additional field rows with AND/OR dividers */}
                  {state.aggregate?.additionalFields?.map((addField, idx) => (
                    <div key={idx}>
                      {/* AND/OR pill divider */}
                      <div className="flex items-center gap-2 my-1.5">
                        <div className="w-4 h-px bg-primary/50" />
                        <span className="px-2 py-0.5 rounded-full border border-primary/40 text-[10px] font-bold uppercase text-primary bg-accent select-none">
                          AND
                        </span>
                        <div className="flex-1 h-px bg-primary/50" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "min-w-0 transition-all duration-300 ease-out",
                          !addField.field ? "flex-[3]" : addField.operator ? "flex-1" : "flex-[1.5]"
                        )}>
                          <Select
                            value={addField.field ?? undefined}
                            onValueChange={(v) => setState((prev) => {
                              if (!prev.aggregate) return prev
                              const updated = [...(prev.aggregate.additionalFields ?? [])]
                              updated[idx] = { ...updated[idx], field: v, operator: '', value: '' }
                              return { ...prev, aggregate: { ...prev.aggregate, additionalFields: updated } }
                            })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields
                                .filter((f) => f.dataType === 'number')
                                .map((f) => (
                                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {addField.field && (
                          <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                            <Select
                              value={addField.operator || undefined}
                              onValueChange={(v) => setState((prev) => {
                                if (!prev.aggregate) return prev
                                const updated = [...(prev.aggregate.additionalFields ?? [])]
                                updated[idx] = { ...updated[idx], operator: v }
                                return { ...prev, aggregate: { ...prev.aggregate, additionalFields: updated } }
                              })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not equals</SelectItem>
                                <SelectItem value="greater_than">Greater than</SelectItem>
                                <SelectItem value="less_than">Less than</SelectItem>
                                <SelectItem value="greater_or_equal">Greater or equal</SelectItem>
                                <SelectItem value="less_or_equal">Less or equal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {addField.operator && (
                          <div className="flex-1 min-w-0" style={{ animation: "slideInRight 250ms ease-out both" }}>
                            <Input
                              type="number"
                              placeholder="Value"
                              value={addField.value}
                              onChange={(e) => setState((prev) => {
                                if (!prev.aggregate) return prev
                                const updated = [...(prev.aggregate.additionalFields ?? [])]
                                updated[idx] = { ...updated[idx], value: e.target.value }
                                return { ...prev, aggregate: { ...prev.aggregate, additionalFields: updated } }
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setState((prev) => {
                            if (!prev.aggregate) return prev
                            const updated = (prev.aggregate.additionalFields ?? []).filter((_, i) => i !== idx)
                            return { ...prev, aggregate: { ...prev.aggregate, additionalFields: updated } }
                          })}
                          className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* + Add field filter */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="self-start mt-1"
                    onClick={() => setState((prev) => {
                      if (!prev.aggregate) return prev
                      const updated = [...(prev.aggregate.additionalFields ?? []), { field: null, operator: '', value: '' }]
                      return { ...prev, aggregate: { ...prev.aggregate, additionalFields: updated } }
                    })}
                  >
                    <Plus size={12} className="mr-1" />
                    Add field filter
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary bar — only shown once field is selected */}
      {summaryText && (
        <div className="bg-accent rounded-md px-3 py-2 mt-3">
          <span className="text-xs text-primary font-medium leading-relaxed break-words">
            {summaryText}
          </span>
        </div>
      )}

      {/* Footer: Cancel + Add to filter */}
      <div className="flex items-center justify-end gap-3 mt-3 pt-3">
        <Button
          type="button"
          variant="secondaryGhost"
          size="xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="default"
          size="xs"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          + Add to filter
        </Button>
      </div>
    </div>
  )
}
