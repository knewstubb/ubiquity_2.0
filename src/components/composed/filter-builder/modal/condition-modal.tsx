/**
 * @component ConditionModal
 * @description Filter condition configuration dialog with three numbered sections
 * progressively revealed as the user completes each step: 1. Source (database →
 * sub-sources → field), 2. Operator, 3. Value. A live summary breadcrumb at the
 * bottom of the modal shows the current selection path.
 *
 * @designDecisions
 * - Single-page layout (no wizard steps) reduces clicks and keeps context visible.
 * - Compact body spacing (px-6 py-3, gap-3 between sections) keeps the modal
 *   tight and avoids excessive whitespace between progressive steps.
 * - Section 1 (Source) has no outer padding or border — the drill-down container
 *   itself provides all visual structure. Sections 2 (Operator) and 3 (Value) are
 *   flat — separated from preceding content by a border-t divider with pt-3
 *   padding, no card wrapper. This reduces visual noise and avoids competing
 *   borders once the source card is already providing containment.
 * - Section headings use 10px uppercase tracked labels (text-[10px] font-semibold
 *   uppercase tracking-wide); teal when active, muted-foreground when complete.
 *   Unreachable sections are not rendered (progressive disclosure via conditional
 *   rendering, not disabled placeholders).
 * - Source drill-down uses a single rounded-lg bordered container with overflow-hidden;
 *   each level (database, sub-source, field) is separated by a border-t divider inside
 *   this container rather than overlapping individual cards. Select triggers remain
 *   borderless (border-0 shadow-none) — the container itself provides visual boundaries.
 * - Cross-category field search index (allFieldsIndex) flattens all fields from
 *   all categories/sub-sources into a single searchable list with full path labels.
 *   Allows power users to jump directly to a field without navigating the drill-down
 *   hierarchy, capped at 10 results for performance and readability.
 * - Summary breadcrumb (bg-primary/5 rounded pill) lives at the bottom of the modal
 *   content area, below all sections — provides a persistent full-path overview of
 *   the condition being built without competing with the source card's drill-down UI.
 *   Path segments joined by " > " (e.g. "Contacts > Treatments > Email"), with
 *   operator (lowercase) and value appended inline after the path rather than as
 *   separate breadcrumb segments.
 * - Modal positioned at top-[20%] with translate-y-0 override so the growing
 *   content expands downward without shifting the header off-screen — avoids the
 *   default 50% centred position that causes jumpiness when height changes.
 * - Value input is type-aware via the ValueInput sub-component: enum fields
 *   render a Select populated from enumOptions, date fields branch by operator —
 *   "between" renders a Calendar mode="range" popover storing the range as a
 *   comma-separated ISO date string, "in_last_n_days" renders a numeric Input
 *   with "days" suffix label, and single-date operators (on/before/after) render
 *   a Calendar mode="single" popover. Number fields render a SpinnerInput
 *   (increment/decrement arrows for precision), and text fields render a plain
 *   Input with 500-char max. SpinnerInput chosen over a raw numeric Input for
 *   number fields because it provides clear affordance for numeric-only entry
 *   and reduces miskeying on compact modal forms.
 * - Calendar PopoverContent uses z-[200] to stack above the drill-down container
 *   (which uses z-[10]–z-[40] for its layered rows) and above the search results
 *   dropdown (z-50). Without this, the popover renders behind drill-down rows.
 * - Data type badge shown both inside dropdown items (right-aligned) AND next to
 *   the field select trigger once a field is selected — provides persistent type
 *   context without reopening the dropdown. The trigger-adjacent badge uses the
 *   Badge component (variant="neutral-subtle") for consistent library styling.
 * - Compact h-7 triggers inside drill-down (borderless) + h-8 for Operator/Value
 *   selects; text-sm throughout for density.
 * - subSourcePath array (not single string) enables N-depth drill-down without
 *   refactoring when new nesting levels are added to SourceCategoryConfig.
 * - dateMode tracked in ModalFormState alongside operator/value — reset to null
 *   when operator changes to one that doesn't support modes (in_last_n_days,
 *   is_empty, is_not_empty) or when field changes to non-date type. Propagated
 *   to CardFilterRow on confirm, enabling anniversary and same-day comparisons.
 * - Collapse animation wrappers (CollapseSection / CollapseSectionLarge) use
 *   max-height + opacity transitions (duration-500 ease-out) to progressively
 *   reveal sections 2 and 3. Tailwind utility classes with cn() — max-h-20 for
 *   the small wrapper (dividers) and max-h-[200px] for the large wrapper
 *   (content sections). Toggled via conditional class application.
 *
 * @usage
 * - Use inside CardFilterBuilder for add/edit condition flows.
 * - Do not use standalone — relies on parent managing open state and sourceCategories.
 *
 * @variants
 * - add: Opens empty, user picks database → sub-sources → field → operator/value.
 * - edit: Opens pre-populated at all levels; upstream changes reset downstream selections.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { CloseButton } from '@/components/ui/close-button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarBlank } from '@phosphor-icons/react'

import type { CardFilterRow, FilterFieldDef, SourceCategoryConfig, SubSourceConfig } from '../types'
import { isConditionComplete } from '../validation'
import { getOperatorsForType, NO_VALUE_OPERATORS, ARRAY_VALUE_OPERATORS } from '../operators'
import { FilterChipInput } from './chip-input'
import { DateModeSelector } from '../date-mode-selector'
import type { DateMode } from '../date-mode-selector'

// ─── Collapse Wrapper — animates in/out using max-height transition ──────────

function CollapseSection({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(
      'overflow-hidden transition-all duration-500 ease-out',
      show ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
    )}>
      {children}
    </div>
  )
}

function CollapseSectionLarge({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(
      'overflow-hidden transition-all duration-500 ease-out',
      show ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
    )}>
      {children}
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ConditionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceCategories: SourceCategoryConfig[]
  mode: 'add' | 'edit'
  editRow?: CardFilterRow | null
  onConfirm: (row: CardFilterRow) => void
}

// ─── State ───────────────────────────────────────────────────────────────────

interface ModalFormState {
  sourceCategory: string | null
  subSourcePath: string[]
  field: string | null
  operator: string | null
  value: string | number | boolean | null | [string, string] | string[]
  dateMode: 'specific' | 'anniversary' | 'same_day' | null
}

function createInitialState(mode: 'add' | 'edit', editRow?: CardFilterRow | null): ModalFormState {
  if (mode === 'edit' && editRow) {
    return {
      sourceCategory: editRow.sourceCategory,
      subSourcePath: editRow.subSource ? editRow.subSource.split('/') : [],
      field: editRow.field,
      operator: editRow.operator,
      value: editRow.value,
      dateMode: editRow.dateMode ?? null,
    }
  }
  return { sourceCategory: null, subSourcePath: [], field: null, operator: null, value: null, dateMode: null }
}

const LEVEL_LABELS = ['Folder', 'Mailout', 'Item']
function getLevelLabel(depth: number): string { return LEVEL_LABELS[depth] ?? `Level ${depth + 1}` }

const DATA_TYPE_LABELS: Record<FilterFieldDef['dataType'], string> = {
  text: 'Txt', number: 'Num', date: 'Date', boolean: 'Bool', enum: 'Enum',
}

// ─── Value Input — renders type-specific input based on field dataType ────────

function ValueInput({
  field,
  operator,
  value,
  onValueChange,
  dateMode,
}: {
  field: FilterFieldDef | null
  operator: string | null
  value: string | number | boolean | null | [string, string]
  onValueChange: (v: string) => void
  dateMode?: 'specific' | 'anniversary' | 'same_day' | null
}) {
  if (!field || !operator) return null

  // Enum fields — show a select with the enum options
  if (field.dataType === 'enum' && field.enumOptions) {
    return (
      <Select value={typeof value === 'string' ? value : undefined} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Select value..." />
        </SelectTrigger>
        <SelectContent>
          {field.enumOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Date fields — handle different date operators
  if (field.dataType === 'date') {
    // "Anniversary" mode — month/day picker (no year), stores as "MM-DD"
    if (dateMode === 'anniversary') {
      const currentVal = typeof value === 'string' ? value : ''
      const parts = currentVal.split('-')
      const month = parts[0] || ''
      const day = parts[1] || ''

      const months = Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
      }))
      const days = Array.from({ length: 31 }, (_, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label: String(i + 1),
      }))

      return (
        <div className="flex items-center gap-2">
          <Select value={month || undefined} onValueChange={(m) => onValueChange(`${m}-${day || '01'}`)}>
            <SelectTrigger className="h-8 text-sm flex-1">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={day || undefined} onValueChange={(d) => onValueChange(`${month || '01'}-${d}`)}>
            <SelectTrigger className="h-8 text-sm w-20">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    // "Between" — date range picker
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
      )
    }

    // "In last N days" — spinner input with "days" suffix
    if (operator === 'in_last_n_days') {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Number of days"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onValueChange(e.target.value)}
            className="h-8 text-sm flex-1"
            min={1}
            max={3650}
          />
          <span className="text-xs text-muted-foreground shrink-0">days</span>
        </div>
      )
    }

    // Single date (On, Before, After)
    const dateValue = typeof value === 'string' && value ? new Date(value) : undefined
    const displayText = dateValue && !isNaN(dateValue.getTime())
      ? dateValue.toLocaleDateString()
      : null

    return (
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
    )
  }

  // Number fields — use SpinnerInput
  if (field.dataType === 'number') {
    return (
      <SpinnerInput
        value={value !== null && value !== '' ? (typeof value === 'number' ? value : parseFloat(String(value)) || undefined) : undefined}
        onChange={(v) => onValueChange(String(v))}
        placeholder="Enter number..."
      />
    )
  }

  // Default: text input
  return (
    <Input
      placeholder="Enter value..."
      value={typeof value === 'string' ? value : value !== null ? String(value) : ''}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-8 text-sm"
      maxLength={500}
    />
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ConditionModal({
  open, onOpenChange, sourceCategories, mode, editRow, onConfirm,
}: ConditionModalProps) {
  const [state, setState] = useState<ModalFormState>(() => createInitialState(mode, editRow))
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (open) { setState(createInitialState(mode, editRow)); setSearchQuery('') }
  }, [open, mode, editRow])

  // ─── Derived ───────────────────────────────────────────────────────────

  const selectedCategory = useMemo(
    () => sourceCategories.find((c) => c.key === state.sourceCategory) ?? null,
    [state.sourceCategory, sourceCategories]
  )

  const drillDownLevels = useMemo(() => {
    if (!selectedCategory) return []
    const levels: { depth: number; options: SubSourceConfig[]; selectedKey: string | undefined }[] = []
    let opts = selectedCategory.subSources ?? []
    for (let i = 0; i <= state.subSourcePath.length; i++) {
      if (opts.length === 0) break
      const key = state.subSourcePath[i]
      levels.push({ depth: i, options: opts, selectedKey: key })
      if (!key) break
      const sel = opts.find((s) => s.key === key)
      if (!sel) break
      opts = sel.subSources ?? []
    }
    return levels
  }, [selectedCategory, state.subSourcePath])

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

  // ─── Search Index: flat list of all fields with their full path ────────

  interface SearchableField {
    categoryKey: string
    categoryTitle: string
    subSourcePath: string[]
    pathLabels: string[]
    field: FilterFieldDef
    fullPath: string
  }

  const allFieldsIndex: SearchableField[] = useMemo(() => {
    const results: SearchableField[] = []

    function walkSubSources(
      categoryKey: string,
      categoryTitle: string,
      subs: SubSourceConfig[],
      pathKeys: string[],
      pathLabels: string[]
    ) {
      for (const sub of subs) {
        const newKeys = [...pathKeys, sub.key]
        const newLabels = [...pathLabels, sub.label]

        if (sub.subSources && sub.subSources.length > 0) {
          walkSubSources(categoryKey, categoryTitle, sub.subSources, newKeys, newLabels)
        } else {
          for (const f of sub.fields) {
            results.push({
              categoryKey, categoryTitle,
              subSourcePath: newKeys,
              pathLabels: newLabels,
              field: f,
              fullPath: [categoryTitle, ...newLabels, f.label].join(' > '),
            })
          }
        }
      }
    }

    for (const cat of sourceCategories) {
      if (cat.subSources && cat.subSources.length > 0) {
        walkSubSources(cat.key, cat.title, cat.subSources, [], [])
      } else {
        for (const f of cat.fields) {
          results.push({
            categoryKey: cat.key, categoryTitle: cat.title,
            subSourcePath: [],
            pathLabels: [],
            field: f,
            fullPath: [cat.title, f.label].join(' > '),
          })
        }
      }
    }

    return results
  }, [sourceCategories])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allFieldsIndex
      .filter((item) => item.fullPath.toLowerCase().includes(q) || item.field.label.toLowerCase().includes(q))
      .slice(0, 10)
  }, [searchQuery, allFieldsIndex])

  const currentRow: CardFilterRow = useMemo(() => ({
    sourceCategory: state.sourceCategory ?? '',
    subSource: state.subSourcePath.length > 0 ? state.subSourcePath.join('/') : null,
    field: state.field ?? '',
    operator: state.operator ?? '',
    value: state.value,
    dateMode: state.dateMode,
  }), [state])

  const canConfirm = isConditionComplete(currentRow)

  // Section states
  const sourceComplete = !!selectedField
  const operatorComplete = !!state.operator

  // Summary
  const summaryText = useMemo(() => {
    const pathParts: string[] = []
    if (selectedCategory) pathParts.push(selectedCategory.title)
    let subs = selectedCategory?.subSources ?? []
    for (const key of state.subSourcePath) {
      const f = subs.find((s) => s.key === key)
      if (f) { pathParts.push(f.label); subs = f.subSources ?? [] }
    }
    if (selectedField) pathParts.push(selectedField.label)

    let text = pathParts.join(' > ')

    if (state.operator && selectedField) {
      const ops = getOperatorsForType(selectedField.dataType)
      const op = ops.find((o) => o.value === state.operator)
      if (op) text += ` ${op.label.toLowerCase()}`
    }
    if (state.value !== null && state.value !== undefined && state.value !== '') {
      if (Array.isArray(state.value) && ARRAY_VALUE_OPERATORS.includes(state.operator ?? '')) {
        if (state.value.length > 0) {
          text += ` ${state.value.length} ${state.value.length === 1 ? 'value' : 'values'}`
        }
      } else if (Array.isArray(state.value)) {
        text += ` ${state.value.join(' – ')}`
      } else {
        text += ` ${String(state.value)}`
      }
    }

    return text || '...'
  }, [selectedCategory, state.subSourcePath, selectedField, state.operator, state.value])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleSearchResultSelect = useCallback((result: typeof allFieldsIndex[number]) => {
    setState({
      sourceCategory: result.categoryKey,
      subSourcePath: result.subSourcePath,
      field: result.field.key,
      operator: null,
      value: null,
      dateMode: null,
    })
    setSearchQuery('')
  }, [])

  const handleCategorySelect = useCallback((key: string) => {
    setState({ sourceCategory: key, subSourcePath: [], field: null, operator: null, value: null, dateMode: null })
  }, [])

  const handleSubSourceSelect = useCallback((depth: number, key: string) => {
    setState((prev) => ({
      ...prev, subSourcePath: [...prev.subSourcePath.slice(0, depth), key],
      field: null, operator: null, value: null, dateMode: null,
    }))
  }, [])

  const handleFieldChange = useCallback((k: string) => {
    setState((prev) => ({ ...prev, field: k, operator: null, value: null, dateMode: null }))
  }, [])

  const handleOperatorChange = useCallback((op: string) => {
    setState((prev) => {
      const wasArrayOp = ARRAY_VALUE_OPERATORS.includes(prev.operator ?? '')
      const isArrayOp = ARRAY_VALUE_OPERATORS.includes(op)

      // Reset dateMode when operator doesn't support it
      const DATE_MODE_UNSUPPORTED_OPS = ['in_last_n_days', 'is_empty', 'is_not_empty']
      const newDateMode = DATE_MODE_UNSUPPORTED_OPS.includes(op) ? null : prev.dateMode

      // Transitioning to array operator: clear value to empty array
      if (isArrayOp && !wasArrayOp) {
        return { ...prev, operator: op, value: [], dateMode: newDateMode }
      }
      // Transitioning from array operator to non-array: clear value to null
      if (!isArrayOp && wasArrayOp) {
        return { ...prev, operator: op, value: null, dateMode: newDateMode }
      }
      // Same kind of operator: just clear value
      return { ...prev, operator: op, value: isArrayOp ? [] : null, dateMode: newDateMode }
    })
  }, [])

  const handleValueChange = useCallback(
    (v: string) => { setState((prev) => ({ ...prev, value: v })) }, []
  )

  const handleChipValueChange = useCallback(
    (chips: string[]) => { setState((prev) => ({ ...prev, value: chips })) }, []
  )

  const handleDateModeChange = useCallback((mode: DateMode) => {
    setState((prev) => ({ ...prev, dateMode: mode, value: null }))
  }, [])

  // Auto-focus next select when a selection is made
  useEffect(() => {
    const timer = setTimeout(() => {
      // Determine which field to open next
      let nextId: string | null = null

      if (state.sourceCategory && !hasReachedFields && drillDownLevels.length > 0) {
        // Find the first unselected drill-down level
        const unselected = drillDownLevels.find((l) => !l.selectedKey)
        if (unselected) {
          nextId = `select-level-${unselected.depth}`
        }
      } else if (hasReachedFields && !state.field) {
        nextId = 'select-field'
      } else if (state.field && !state.operator) {
        nextId = 'select-operator'
      }

      if (nextId) {
        const trigger = document.querySelector(`[data-select-id="${nextId}"]`) as HTMLElement
        trigger?.click()
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [state.sourceCategory, state.subSourcePath, state.field, hasReachedFields, drillDownLevels])

  function handleConfirm() { if (!canConfirm) return; onConfirm(currentRow); onOpenChange(false) }
  function handleDismiss() { onOpenChange(false) }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] top-[20%] translate-y-0">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle>{mode === 'edit' ? 'Edit Filter Condition' : 'Add Filter Condition'}</DialogTitle>
          <CloseButton size="sm" onClick={handleDismiss} />
        </DialogHeader>

        <DialogBody className="px-6 py-3">
          <div className="flex flex-col gap-3">

            {/* ═══ Section 1: Source ═══ */}
            <div className="pt-1">
              <h3 className={cn('text-[10px] font-semibold uppercase tracking-wide mb-2', !sourceComplete ? 'text-primary' : 'text-muted-foreground')}>
                1. SOURCE
              </h3>

              {/* Search */}
              <div className="relative mb-2">
                <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search fields"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-md border border-border bg-popover shadow-md max-h-[200px] overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.categoryKey}-${result.subSourcePath.join('/')}-${result.field.key}`}
                        type="button"
                        onClick={() => handleSearchResultSelect(result)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-foreground truncate">{result.fullPath}</span>
                        <span className="text-[10px] uppercase font-medium text-muted-foreground shrink-0">{DATA_TYPE_LABELS[result.field.dataType]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Overlapping drill-down cards — single container with radius */}
              <div className="rounded-lg border border-border overflow-hidden shadow-sm">
                {/* Database — first row */}
                <div className="bg-card px-3 py-2 relative z-[40]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground w-14 shrink-0">Database</span>
                    <div className="flex-1">
                      <Select value={state.sourceCategory ?? undefined} onValueChange={handleCategorySelect}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select database..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceCategories.map((cat) => (
                            <SelectItem key={cat.key} value={cat.key}>{cat.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sub-source levels — separated by border */}
                {drillDownLevels.map((level) => (
                  <div key={level.depth} className="border-t border-border bg-card px-3 py-2 relative" style={{ animation: "slideDown 300ms ease-out both", zIndex: 30 - level.depth }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground w-14 shrink-0">{getLevelLabel(level.depth)}</span>
                      <div className="flex-1">
                        <Select value={level.selectedKey ?? undefined} onValueChange={(k) => handleSubSourceSelect(level.depth, k)}>
                          <SelectTrigger className="h-8 text-sm" data-select-id={`select-level-${level.depth}`}>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {level.options.map((sub) => (
                              <SelectItem key={sub.key} value={sub.key}>{sub.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Field — separated by border */}
                {hasReachedFields && (
                  <div key="field" className="border-t border-border bg-card px-3 py-2 relative" style={{ animation: "slideDown 300ms ease-out both", zIndex: 10 }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground w-14 shrink-0">Field</span>
                      <div className="flex-1">
                        <Select value={state.field ?? undefined} onValueChange={handleFieldChange}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select field...">
                              {selectedField?.label ?? 'Select Field'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {[...availableFields]
                              .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
                              .map((f) => (
                                <SelectItem key={f.key} value={f.key} textValue={f.label} className="[&>span:last-child]:flex-1">
                                  <span className="flex items-center justify-between w-full">
                                    <span>{f.label}</span>
                                    <span className="text-[10px] uppercase font-medium text-muted-foreground">{DATA_TYPE_LABELS[f.dataType]}</span>
                                  </span>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedField && (
                        <Badge variant="neutral-subtle" className="shrink-0 text-[10px] uppercase font-medium px-1.5 py-0">
                          {DATA_TYPE_LABELS[selectedField.dataType]}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary — moved to bottom */}

            </div>

            {/* Divider between source and operator */}
            <CollapseSection show={sourceComplete}>
              <div className="border-t border-border" />
            </CollapseSection>

            {/* ═══ Section 2: Operator ═══ */}
            <CollapseSectionLarge show={sourceComplete}>
              <div className="pt-3">
                <h3 className={cn('text-[10px] font-semibold uppercase tracking-wide mb-2', !operatorComplete ? 'text-primary' : 'text-muted-foreground')}>
                  2. OPERATOR
                </h3>
                <Select value={state.operator ?? undefined} onValueChange={handleOperatorChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select operator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedField && getOperatorsForType(selectedField.dataType).map((op) => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Mode Selector — shown for date fields with applicable operators */}
                {selectedField?.dataType === 'date' &&
                  state.operator &&
                  !['in_last_n_days', 'is_empty', 'is_not_empty'].includes(state.operator) && (
                    <DateModeSelector
                      value={state.dateMode ?? 'specific'}
                      onChange={handleDateModeChange}
                      className="mt-2"
                    />
                  )}
              </div>
            </CollapseSectionLarge>

            {/* Divider between operator and value */}
            <CollapseSection show={operatorComplete && !NO_VALUE_OPERATORS.includes(state.operator ?? '')}>
              <div className="border-t border-border" />
            </CollapseSection>

            {/* ═══ Section 3: Value ═══ */}
            <CollapseSectionLarge show={operatorComplete && !NO_VALUE_OPERATORS.includes(state.operator ?? '')}>
              <div className="pt-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wide mb-2 text-primary">
                  3. VALUE
                </h3>
                {ARRAY_VALUE_OPERATORS.includes(state.operator ?? '') ? (
                  <FilterChipInput
                    value={Array.isArray(state.value) ? state.value : []}
                    onChange={handleChipValueChange}
                  />
                ) : (
                  <ValueInput
                    field={selectedField}
                    operator={state.operator}
                    value={state.value}
                    onValueChange={handleValueChange}
                    dateMode={state.dateMode}
                  />
                )}
              </div>
            </CollapseSectionLarge>

            {/* Summary breadcrumb — at the very bottom */}
            {summaryText !== '...' && (
              <div className="mt-3 rounded-md bg-primary/5 px-3 py-2">
                <span className="text-xs font-medium text-primary">
                  {summaryText}
                </span>
              </div>
            )}

          </div>
        </DialogBody>

        <DialogFooter className="border-t border-border">
          <Button type="button" variant="ghost" onClick={handleDismiss}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            {mode === 'edit' ? 'Update' : 'Add Condition'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
