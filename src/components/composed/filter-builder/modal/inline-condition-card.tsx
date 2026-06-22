/**
 * @component InlineConditionCard
 * @description Inline card-based progressive drill-down for configuring filter
 * conditions. Replaces the ConditionModal with an in-place card that appears
 * within the filter list. Phases: source → subsource → field → operator/value.
 *
 * @designDecisions
 * - White card with border replaces modal overlay — keeps user in context
 * - Progressive drill-down: source → sub-sources → field → operator → value
 * - Combobox (searchable popover) for source, sub-source, and field selection —
 *   replaces Select + custom search overlay for a unified search-and-select UX
 * - Header row fixed at h-7 to prevent layout shift between phases
 * - Operator-value phase promotes the field label to text-base font-semibold as
 *   the primary header, with source path demoted to secondary muted text — this
 *   establishes clear information hierarchy once the user is configuring values
 * - Earlier phases (source/subsource/field) use muted text for contextual guidance
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
 * - Phase transitions use custom @keyframes animations defined in globals.css:
 *   "slideUp" (200ms ease-out, translateY 12px→0) for each phase container
 *   appearing, and "slideInRight" (250ms ease-out, translateX 16px→0) for
 *   date mode and value inputs revealing inline. Applied via inline style
 *   attributes rather than Tailwind animate-in utilities for reliable
 *   play-once behaviour with React conditional rendering.
 * - Operator Select trigger uses conditional cn() to apply text-primary when no
 *   operator is selected (placeholder state) — cleaner than descendant selectors
 * - Date mode Select uses default styling (no teal emphasis) since it always
 *   has a value selected (defaults to "Specific date")
 * - "Change" link resets to source phase without requiring modal re-open
 * - Summary bar (green accent strip) shows a natural language condition preview
 *   once a field is selected — reads like the final condition card
 *   ("Field Name operator value") rather than a breadcrumb path. Only appears
 *   after field selection; appends "..." while the condition is still incomplete.
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
 * - Card uses overflow-visible + relative z-10 to allow Combobox/Calendar
 *   popovers to render above surrounding filter rows without clipping — Radix
 *   portals anchor visually to the trigger, so the card must participate in
 *   the stacking context above sibling condition rows
 * - 4px radius per docs/ui/borders-radius.md
 *
 * @usage
 * - Use inside the FilterBuilder "modal" variant as the inline condition editor
 * - Preferred over ConditionModal when conditions should be added in-place within the list
 * - Not used standalone — always rendered within a LogicGroupRenderer
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Users, Lightning, Table, Database, FolderSimple, TextAa, Funnel, ListBullets } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { SpinnerInput } from '@/components/ui/spinner-input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarBlank } from '@phosphor-icons/react'

import type { CardFilterRow, FilterFieldDef, SourceCategoryConfig, SubSourceConfig } from '../types'
import { isConditionComplete } from '../validation'
import { getOperatorsForType, NO_VALUE_OPERATORS, ARRAY_VALUE_OPERATORS } from '../operators'
import { FilterChipInput } from './chip-input'
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
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSourceIcon(sourceCategory: string): React.ReactNode {
  const key = sourceCategory.toLowerCase()
  if (key.includes('contact') || key.includes('people') || key.includes('audience')) {
    return <Users size={16} weight="regular" className="shrink-0 text-muted-foreground" />
  }
  if (key.includes('activity') || key.includes('event') || key.includes('behaviour') || key.includes('behavior')) {
    return <Lightning size={16} weight="regular" className="shrink-0 text-muted-foreground" />
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
  const cardRef = useRef<HTMLDivElement>(null)

  // Reset state when mode/editRow changes
  useEffect(() => {
    setState(createInitialState(mode, editRow))
  }, [mode, editRow])

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
  }), [state])

  const canConfirm = isConditionComplete(currentRow)

  // Summary text for the green bar — only shown once field is selected
  // Reads like the final condition card: "Field Name operator value"
  const summaryText = useMemo(() => {
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
  }, [selectedField, state.operator, state.value, canConfirm])

  // Header text for current phase
  const headerText = useMemo(() => {
    switch (state.phase) {
      case 'source': return 'New condition'
      case 'subsource': return (selectedCategory?.title ?? 'Select sub-source') + ' > ...'
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
        return selectedField?.label ?? 'Configure condition'
      }
    }
  }, [state.phase, selectedCategory, state.subSourcePath, selectedField])

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
      for (const k of newPath) {
        const found = subs.find((s) => s.key === k)
        if (!found) return prev
        subs = found.subSources ?? []
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
    }))
  }, [])

  const handleOperatorChange = useCallback((op: string) => {
    setState((prev) => {
      const wasArrayOp = ARRAY_VALUE_OPERATORS.includes(prev.operator ?? '')
      const isArrayOp = ARRAY_VALUE_OPERATORS.includes(op)
      const DATE_MODE_UNSUPPORTED_OPS = ['in_last_n_days', 'is_empty', 'is_not_empty']
      const newDateMode = DATE_MODE_UNSUPPORTED_OPS.includes(op) ? null : prev.dateMode

      if (isArrayOp && !wasArrayOp) {
        return { ...prev, operator: op, value: [], dateMode: newDateMode }
      }
      if (!isArrayOp && wasArrayOp) {
        return { ...prev, operator: op, value: null, dateMode: newDateMode }
      }
      return { ...prev, operator: op, value: isArrayOp ? [] : null, dateMode: newDateMode }
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
    setState((prev) => ({
      ...prev,
      phase: 'source',
      sourceCategory: null,
      subSourcePath: [],
      field: null,
      operator: null,
      value: null,
      dateMode: null,
    }))
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
      {/* Header row — fixed 26px height equivalent via h-7 */}
      <div className="flex items-center justify-between mb-2 h-7">
        <div className="flex items-center gap-2 min-w-0">
          {state.phase !== 'source' && state.sourceCategory && (
            <span className="shrink-0">{getSourceIcon(state.sourceCategory)}</span>
          )}
          {state.phase === 'operator-value' && selectedField ? (
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
          ) : (
            <span className="text-sm text-muted-foreground truncate">
              {headerText}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {state.phase !== 'source' && (
            <button
              type="button"
              onClick={handleChangeSource}
              className="text-xs text-primary font-medium hover:underline"
            >
              Change
            </button>
          )}
        </div>
      </div>

      {/* Phase-specific content */}
      <div className="flex flex-col gap-3">
        {/* Phase 1: Source selection */}
        {state.phase === 'source' && (
          <div key="phase-source" className="relative" style={{ animation: "slideUp 200ms ease-out both" }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              <Database size={14} />
            </span>
            <Combobox
              className="pl-8"
              value={state.sourceCategory ?? ''}
              onValueChange={handleCategorySelect}
              options={sourceCategories.map((cat) => ({ value: cat.key, label: cat.title }))}
              placeholder="Select source"
              searchPlaceholder="Search sources..."
              defaultOpen
            />
          </div>
        )}

        {/* Phase 2: Sub-source drill-down */}
        {state.phase === 'subsource' && currentSubSources.length > 0 && (
          <div key="phase-subsource" className="relative" style={{ animation: "slideUp 200ms ease-out both" }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              <FolderSimple size={14} />
            </span>
            <Combobox
              className="pl-8"
              value={state.subSourcePath.length > 0 ? state.subSourcePath[state.subSourcePath.length - 1] : ''}
              onValueChange={handleSubSourceSelect}
              options={currentSubSources.map((sub) => ({ value: sub.key, label: sub.label }))}
              placeholder="Select folder"
              searchPlaceholder="Search folders..."
              defaultOpen
            />
          </div>
        )}

        {/* Phase 3: Field selection */}
        {state.phase === 'field' && availableFields.length > 0 && (
          <div key="phase-field" className="relative" style={{ animation: "slideUp 200ms ease-out both" }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              <TextAa size={14} />
            </span>
            <Combobox
              className="pl-8"
              value={state.field ?? ''}
              onValueChange={handleFieldSelect}
              options={availableFields.map((f) => ({ value: f.key, label: f.label, badge: DATA_TYPE_LABELS[f.dataType] }))}
              placeholder="Select field"
              searchPlaceholder="Search fields..."
              defaultOpen
            />
          </div>
        )}

        {/* Phase 4: Operator/Value configuration — all inline, progressive reveal */}
        {state.phase === 'operator-value' && selectedField && (
          <div key="phase-operator" className="flex items-start gap-2" style={{ animation: "slideUp 200ms ease-out both" }}>
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
      </div>

      {/* Summary bar — only shown once field is selected */}
      {summaryText && (
        <div className="bg-accent rounded-md px-3 py-2 mt-3">
          <span className="text-xs text-primary font-medium">
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
