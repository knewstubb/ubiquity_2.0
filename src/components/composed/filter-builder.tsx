/**
 * @component FilterBuilder
 * @description Reusable multi-row filter builder for constructing field conditions combined with AND or OR logic.
 * Fields declare their data type, which determines available operators and value input type.
 *
 * @designDecisions
 * - Rows are combined with configurable AND/OR logic (toggle between first and second row)
 * - Logic defaults to AND when no onLogicChange handler provided (read-only label)
 * - When onLogicChange is provided, clickable AND/OR toggle appears between row 1 and 2; subsequent rows show the chosen logic as a label
 * - Operators adapt per field based on its dataType (text, number, date, boolean, enum)
 * - Value input adapts: text for strings, number for numbers, calendar picker for dates, select for enums, hidden for booleans
 * - Date fields use an inline Popover + Calendar picker (not a text input) for "on", "before", "after" operators
 * - "Between" operator uses a dual-calendar DateRangePickerInput (side-by-side months, range selection stored as "start|end" ISO dates)
 * - "In last N days" operator uses a numeric input instead of the calendar (days count, not a date)
 * - Progressive disclosure: operator only appears after field selection, value only after operator selection
 * - Changing field resets operator and value (operators differ per data type)
 * - No-value operators (is_true, is_false, is_empty, is_not_empty) hide the value input
 * - At least one row always exists — removing the last row resets to an empty row
 * - Max 10 rows by default (configurable via maxRows prop)
 * - Inline validation: shows error when a row is partially filled (but not on untouched rows)
 *
 * @usage
 * - Exporter wizard: filter contacts by system fields, messages by mailout fields
 * - Segment builder: define audience conditions by contact attributes
 * - Transaction filters: filter by table-specific fields
 * - Any pattern needing a composable field + operator + value filter builder
 *
 * @accessibility
 * - Each row's controls have descriptive aria-labels with row number
 * - Date picker button has aria-label for screen readers
 * - Remove button has accessible label
 * - Error messages linked to incomplete rows
 */

import { useCallback, useMemo, useState } from 'react'
import { Plus, X, CalendarBlank } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export type FieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

export interface FilterField {
  key: string
  label: string
  /** Data type determines available operators and value input */
  dataType: FieldDataType
  /** For enum fields: the available options */
  enumOptions?: { value: string; label: string }[]
}

export interface FilterOperator {
  value: string
  label: string
}

export type FilterLogic = 'and' | 'or'

export interface FilterRow {
  field: string
  operator: string
  value: string
}

export interface FilterBuilderProps {
  /** Available fields to filter on (each declares its data type) */
  fields: FilterField[]
  /** Current filter rows */
  rows: FilterRow[]
  /** Called when rows change */
  onChange: (rows: FilterRow[]) => void
  /** Logic connector between rows */
  logic?: FilterLogic
  /** Called when logic changes */
  onLogicChange?: (logic: FilterLogic) => void
  /** Maximum number of filter rows (default: 10) */
  maxRows?: number
}

// ─── Operators per data type ─────────────────────────────────────────────────

const TEXT_OPERATORS: FilterOperator[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

const NUMBER_OPERATORS: FilterOperator[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'greater_or_equal', label: 'Greater or equal' },
  { value: 'less_or_equal', label: 'Less or equal' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

const DATE_OPERATORS: FilterOperator[] = [
  { value: 'equals', label: 'On' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'in_last_n_days', label: 'In last N days' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

const BOOLEAN_OPERATORS: FilterOperator[] = [
  { value: 'is_true', label: 'Is true' },
  { value: 'is_false', label: 'Is false' },
]

const ENUM_OPERATORS: FilterOperator[] = [
  { value: 'equals', label: 'Is' },
  { value: 'not_equals', label: 'Is not' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

/** Operators that don't require a value input */
const NO_VALUE_OPERATORS = ['is_true', 'is_false', 'is_empty', 'is_not_empty']

function getOperatorsForType(dataType: FieldDataType): FilterOperator[] {
  switch (dataType) {
    case 'text': return TEXT_OPERATORS
    case 'number': return NUMBER_OPERATORS
    case 'date': return DATE_OPERATORS
    case 'boolean': return BOOLEAN_OPERATORS
    case 'enum': return ENUM_OPERATORS
  }
}

// ─── Date Picker Input ───────────────────────────────────────────────────────

function DatePickerInput({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false)

  const selectedDate = value ? new Date(value) : undefined
  const displayText = selectedDate
    ? selectedDate.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(date.toISOString().split('T')[0])
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors',
            'hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            !displayText && 'text-muted-foreground',
          )}
        >
          <CalendarBlank size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{displayText ?? 'Pick a date'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

function DateRangePickerInput({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false)
  const [leftMonth, setLeftMonth] = useState<Date>(new Date())
  const [rightMonth, setRightMonth] = useState<Date>(() => {
    const next = new Date()
    next.setMonth(next.getMonth() + 1)
    return next
  })

  // Value stored as "start|end" ISO dates
  const [startStr, endStr] = value ? value.split('|') : ['', '']
  const selected: import('react-day-picker').DateRange | undefined =
    startStr && endStr
      ? { from: new Date(startStr), to: new Date(endStr) }
      : startStr
        ? { from: new Date(startStr), to: undefined }
        : undefined

  const displayText = startStr && endStr
    ? `${new Date(startStr).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} — ${new Date(endStr).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : null

  function handleRangeSelect(range: import('react-day-picker').DateRange | undefined) {
    if (range?.from) {
      const start = range.from.toISOString().split('T')[0]
      if (range.to) {
        const end = range.to.toISOString().split('T')[0]
        onChange(`${start}|${end}`)
      } else {
        onChange(`${start}|`)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors',
            'hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            !displayText && 'text-muted-foreground',
          )}
        >
          <CalendarBlank size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{displayText ?? 'Select range'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex overflow-hidden" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleRangeSelect}
          month={leftMonth}
          onMonthChange={setLeftMonth}
          numberOfMonths={1}
        />
        <div className="border-l border-border" />
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleRangeSelect}
          month={rightMonth}
          onMonthChange={setRightMonth}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FilterBuilder({
  fields,
  rows,
  onChange,
  logic = 'and',
  onLogicChange,
  maxRows = 10,
}: FilterBuilderProps) {
  // Ensure at least one row
  const effectiveRows = rows.length > 0 ? rows : [{ field: '', operator: '', value: '' }]

  // Build a lookup for field definitions
  const fieldMap = useMemo(
    () => new Map(fields.map((f) => [f.key, f])),
    [fields],
  )

  const handleRowChange = useCallback(
    (index: number, patch: Partial<FilterRow>) => {
      const updated = [...effectiveRows]
      const current = updated[index]

      // Reset operator and value when field changes (operators differ per type)
      if (patch.field && patch.field !== current.field) {
        updated[index] = { field: patch.field, operator: '', value: '' }
      } else {
        // Reset value when operator changes to a no-value operator
        if (patch.operator && NO_VALUE_OPERATORS.includes(patch.operator)) {
          updated[index] = { ...current, ...patch, value: '' }
        } else {
          updated[index] = { ...current, ...patch }
        }
      }

      onChange(updated)
    },
    [effectiveRows, onChange],
  )

  const handleAddRow = useCallback(() => {
    if (effectiveRows.length >= maxRows) return
    onChange([...effectiveRows, { field: '', operator: '', value: '' }])
  }, [effectiveRows, maxRows, onChange])

  const handleRemoveRow = useCallback(
    (index: number) => {
      const updated = [...effectiveRows]
      updated.splice(index, 1)
      if (updated.length === 0) {
        updated.push({ field: '', operator: '', value: '' })
      }
      onChange(updated)
    },
    [effectiveRows, onChange],
  )

  function isRowIncomplete(row: FilterRow): boolean {
    if (!row.field || !row.operator) return true
    if (NO_VALUE_OPERATORS.includes(row.operator)) return false
    return row.value === ''
  }

  return (
    <div className="flex flex-col gap-3" data-testid="filter-builder">
      {effectiveRows.map((row, index) => {
        const showAnd = index > 0
        const incomplete = isRowIncomplete(row)
        const selectedField = row.field ? fieldMap.get(row.field) : null
        const operators = selectedField ? getOperatorsForType(selectedField.dataType) : []
        const hideValue = NO_VALUE_OPERATORS.includes(row.operator)

        return (
          <div key={index} className="flex flex-col gap-2">
            {showAnd && (
              index === 1 && onLogicChange ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onLogicChange('and')}
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-colors',
                      logic === 'and'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    AND
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogicChange('or')}
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-colors',
                      logic === 'or'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    OR
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {logic.toUpperCase()}
                </span>
              )
            )}
            <div className="flex items-start gap-2">
              {/* Field selector */}
              <div className="flex-1 min-w-0">
                <Select
                  value={row.field || undefined}
                  onValueChange={(v) => handleRowChange(index, { field: v })}
                >
                  <SelectTrigger aria-label={`Filter row ${index + 1} field`}>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator selector — only shown when field is selected */}
              {selectedField && (
                <div className="flex-1 min-w-0">
                  <Select
                    value={row.operator || undefined}
                    onValueChange={(v) => handleRowChange(index, { operator: v })}
                  >
                    <SelectTrigger aria-label={`Filter row ${index + 1} operator`}>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Value input — adapts to field data type */}
              {selectedField && !hideValue && row.operator && (
                <div className="flex-1 min-w-0">
                  {selectedField.dataType === 'enum' && selectedField.enumOptions ? (
                    <Select
                      value={row.value || undefined}
                      onValueChange={(v) => handleRowChange(index, { value: v })}
                    >
                      <SelectTrigger aria-label={`Filter row ${index + 1} value`}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedField.enumOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : selectedField.dataType === 'number' ? (
                    <Input
                      type="number"
                      value={row.value}
                      onChange={(e) => handleRowChange(index, { value: e.target.value })}
                      placeholder="0"
                      aria-label={`Filter row ${index + 1} value`}
                    />
                  ) : selectedField.dataType === 'date' ? (
                    row.operator === 'in_last_n_days' ? (
                      <Input
                        type="number"
                        value={row.value}
                        onChange={(e) => handleRowChange(index, { value: e.target.value })}
                        placeholder="Days"
                        aria-label={`Filter row ${index + 1} days`}
                      />
                    ) : row.operator === 'between' ? (
                      <DateRangePickerInput
                        value={row.value}
                        onChange={(v) => handleRowChange(index, { value: v })}
                        ariaLabel={`Filter row ${index + 1} date range`}
                      />
                    ) : (
                      <DatePickerInput
                        value={row.value}
                        onChange={(v) => handleRowChange(index, { value: v })}
                        ariaLabel={`Filter row ${index + 1} date`}
                      />
                    )
                  ) : (
                    <Input
                      value={row.value}
                      onChange={(e) => handleRowChange(index, { value: e.target.value })}
                      placeholder="Value"
                      aria-label={`Filter row ${index + 1} value`}
                    />
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(index)}
                aria-label={`Remove filter row ${index + 1}`}
                className="shrink-0"
              >
                <X weight="bold" />
              </Button>
            </div>

            {incomplete && (row.field !== '' || row.operator !== '' || row.value !== '') && (
              <p className="text-xs text-destructive m-0">
                Complete all fields — select a field, operator, and enter a value
              </p>
            )}
          </div>
        )
      })}

      {effectiveRows.length < maxRows && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="self-start"
        >
          <Plus weight="bold" />
          Add filter
        </Button>
      )}
    </div>
  )
}
