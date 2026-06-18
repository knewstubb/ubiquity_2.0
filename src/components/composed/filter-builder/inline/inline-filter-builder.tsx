/**
 * @component InlineFilterBuilder
 * @description Recursive filter builder with left-border connector lines between conditions.
 * Supports nested AND/OR groups up to a configurable depth.
 *
 * @designDecisions
 * - Each group renders a header row: clickable logic badge (AND/OR) left, action buttons right
 * - Conditions indented under a left border-line (border-l-2 border-primary/30) for visual hierarchy
 * - "+Group" adds a nested sub-group with opposite logic; "+Filter" adds a row to current group
 * - Row layout: drag handle | field dropdown | operator dropdown (hidden) | value input (hidden) | trash
 * - Progressive disclosure: operator hidden until field selected, value hidden until operator selected
 * - Searchable field dropdown (Popover + Input + filtered list) for sourceCategories mode
 * - Full path displayed in the dropdown (e.g. "Transactional > Products > Price")
 * - Each row has a drag handle (DotsSixVertical) on the left for future reordering affordance
 * - Remove button uses Trash icon, muted-foreground → destructive colour on hover
 * - Nested groups wrap in a bordered container (bg-secondary/50) for depth contrast
 * - Max depth limits nesting (default: 3); "+Group" button disabled with tooltip at max depth
 * - Empty nested groups auto-remove from parent on last condition delete
 * - When allowNesting=false, only "+Filter" is shown (flat mode)
 * - Data-type-aware operators and value inputs (text, number, date, boolean, enum)
 * - Date inputs use library DateRangePicker for ranges and Popover+Calendar for single dates
 * - Logic badge uses rounded (4px) as a clickable toggle button, not a status indicator
 * - Supports legacy `fields` prop (flat list) OR new `sourceCategories` prop (hierarchical)
 *
 * @usage
 * - Exporter wizard: flat mode (allowNesting=false) for simple contact/message filters
 * - Journey builder: full nesting for complex audience criteria
 * - Segmentation: multi-level filter conditions with alternating AND/OR groups
 */

import { useMemo, useRef, useState } from 'react'
import { Plus, CalendarBlank, DotsSixVertical, Trash, MagnifyingGlass, CaretUpDown, Check } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type {
  FieldDataType,
  FilterLogic,
  FilterFieldDef,
  FilterRow,
  FilterGroup,
  FilterCondition,
  InlineFilterBuilderProps,
  SourceCategoryConfig,
  SubSourceConfig,
} from '../types'
import {
  TEXT_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
  NO_VALUE_OPERATORS,
  type OperatorDef,
} from '../operators'

// ─── Operators ───────────────────────────────────────────────────────────────

function getOps(dt: FieldDataType): OperatorDef[] {
  switch (dt) {
    case 'text': return TEXT_OPERATORS
    case 'number': return NUMBER_OPERATORS
    case 'date': return DATE_OPERATORS
    case 'boolean': return BOOLEAN_OPERATORS
    case 'enum': return ENUM_OPERATORS
  }
}

const NO_VALUE_OPS = NO_VALUE_OPERATORS

// ─── Searchable Field Index ──────────────────────────────────────────────────

interface IndexedField {
  fieldKey: string
  field: FilterFieldDef
  fullPath: string
  categoryKey?: string
  subSourcePath?: string[]
}

function buildFieldIndex(
  fields?: FilterFieldDef[],
  sourceCategories?: SourceCategoryConfig[]
): IndexedField[] {
  const results: IndexedField[] = []

  if (sourceCategories && sourceCategories.length > 0) {
    function walkSubSources(
      categoryKey: string,
      categoryTitle: string,
      subs: SubSourceConfig[],
      pathLabels: string[],
      pathKeys: string[]
    ) {
      for (const sub of subs) {
        const newLabels = [...pathLabels, sub.label]
        const newKeys = [...pathKeys, sub.key]

        if (sub.subSources && sub.subSources.length > 0) {
          walkSubSources(categoryKey, categoryTitle, sub.subSources, newLabels, newKeys)
        }

        for (const f of sub.fields) {
          results.push({
            fieldKey: f.key,
            field: f,
            fullPath: [categoryTitle, ...newLabels, f.label].join(' > '),
            categoryKey,
            subSourcePath: newKeys,
          })
        }
      }
    }

    for (const cat of sourceCategories) {
      if (cat.subSources && cat.subSources.length > 0) {
        walkSubSources(cat.key, cat.title, cat.subSources, [], [])
      }
      for (const f of cat.fields) {
        results.push({
          fieldKey: f.key,
          field: f,
          fullPath: [cat.title, f.label].join(' > '),
          categoryKey: cat.key,
          subSourcePath: [],
        })
      }
    }
  } else if (fields) {
    for (const f of fields) {
      results.push({
        fieldKey: f.key,
        field: f,
        fullPath: f.label,
      })
    }
  }

  return results
}

// ─── Date picker sub-components ──────────────────────────────────────────────

function DatePickerInput({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false)
  const sel = value ? new Date(value) : undefined
  const txt = sel ? sel.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }) : null
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn('w-full justify-start gap-2 font-normal', !txt && 'text-muted-foreground')}
        >
          <CalendarBlank size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{txt ?? 'Pick a date'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
        <Calendar mode="single" selected={sel} onSelect={(d) => { if (d) { onChange(d.toISOString().split('T')[0]); setOpen(false) } }} />
      </PopoverContent>
    </Popover>
  )
}

function DateRangePickerInput({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false)
  const [lm, setLm] = useState<Date>(new Date())
  const [rm, setRm] = useState<Date>(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d })
  const [s, e] = value ? value.split('|') : ['', '']
  const sel: import('react-day-picker').DateRange | undefined = s && e ? { from: new Date(s), to: new Date(e) } : s ? { from: new Date(s), to: undefined } : undefined
  const txt = s && e ? `${new Date(s).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} — ${new Date(e).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}` : null
  function onSel(r: import('react-day-picker').DateRange | undefined) { if (r?.from) { const st = r.from.toISOString().split('T')[0]; onChange(r.to ? `${st}|${r.to.toISOString().split('T')[0]}` : `${st}|`) } }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn('w-full justify-start gap-2 font-normal', !txt && 'text-muted-foreground')}
        >
          <CalendarBlank size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{txt ?? 'Select range'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex overflow-hidden" align="start">
        <Calendar mode="range" selected={sel} onSelect={onSel} month={lm} onMonthChange={setLm} numberOfMonths={1} />
        <div className="border-l border-border" />
        <Calendar mode="range" selected={sel} onSelect={onSel} month={rm} onMonthChange={setRm} numberOfMonths={1} />
      </PopoverContent>
    </Popover>
  )
}

// ─── Searchable Field Combobox ───────────────────────────────────────────────

function SearchableFieldDropdown({
  fieldIndex,
  selectedKey,
  onSelect,
  ariaLabel,
}: {
  fieldIndex: IndexedField[]
  selectedKey: string
  onSelect: (key: string) => void
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedItem = useMemo(
    () => fieldIndex.find((item) => item.fieldKey === selectedKey) ?? null,
    [fieldIndex, selectedKey]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return fieldIndex
    const q = search.toLowerCase()
    return fieldIndex.filter((item) => item.fullPath.toLowerCase().includes(q))
  }, [fieldIndex, search])

  function handleSelect(key: string) {
    onSelect(key)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setTimeout(() => inputRef.current?.focus(), 0) }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            'w-full justify-between font-normal h-9 text-sm',
            !selectedKey && 'text-muted-foreground'
          )}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.fullPath : 'Select field...'}
          </span>
          <CaretUpDown size={14} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center border-b border-border px-3 py-2">
          <MagnifyingGlass size={14} className="shrink-0 text-muted-foreground mr-2" />
          <input
            ref={inputRef}
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No fields found.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item.categoryKey ?? ''}-${(item.subSourcePath ?? []).join('/')}-${item.fieldKey}`}
                type="button"
                onClick={() => handleSelect(item.fieldKey)}
                className={cn(
                  'w-full text-left rounded-sm px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2',
                  'hover:bg-secondary transition-colors',
                  selectedKey === item.fieldKey && 'bg-secondary'
                )}
              >
                <Check
                  size={14}
                  className={cn('shrink-0', selectedKey === item.fieldKey ? 'opacity-100' : 'opacity-0')}
                />
                <span className="flex-1 truncate">{item.fullPath}</span>
                <span className="text-[10px] uppercase font-medium text-muted-foreground shrink-0">
                  {item.field.dataType}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Row component ───────────────────────────────────────────────────────────

function ConditionRow({ row, fieldIndex, fieldMap, onChange, onRemove, idx, useSearchableDropdown }: {
  row: FilterRow
  fieldIndex: IndexedField[]
  fieldMap: Map<string, FilterFieldDef>
  onChange: (p: Partial<FilterRow>) => void
  onRemove: () => void
  idx: number
  useSearchableDropdown: boolean
}) {
  const f = row.field ? fieldMap.get(row.field) : null
  const ops = f ? getOps(f.dataType) : []
  const hide = NO_VALUE_OPS.includes(row.operator)
  const hasField = !!row.field && !!f
  const hasOperator = !!row.operator
  const showOperator = hasField
  const showValue = hasOperator && !hide

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
      {/* Drag handle */}
      <span className="shrink-0 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing">
        <DotsSixVertical size={16} weight="bold" />
      </span>

      {/* Field */}
      <div className="flex-1 min-w-0">
        {useSearchableDropdown ? (
          <SearchableFieldDropdown
            fieldIndex={fieldIndex}
            selectedKey={row.field}
            onSelect={(v) => onChange({ field: v, operator: '', value: '' })}
            ariaLabel={`Row ${idx + 1} field`}
          />
        ) : (
          <Select value={row.field || undefined} onValueChange={(v) => onChange({ field: v, operator: '', value: '' })}>
            <SelectTrigger aria-label={`Row ${idx + 1} field`}><SelectValue placeholder="Field" /></SelectTrigger>
            <SelectContent>{fieldIndex.map((fi) => <SelectItem key={fi.fieldKey} value={fi.fieldKey}>{fi.fullPath}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      {/* Operator — hidden until field selected */}
      <div
        className={cn(
          'min-w-0 transition-all duration-300 ease-out',
          showOperator ? 'flex-1 opacity-100 max-w-[200px]' : 'flex-0 opacity-0 max-w-0 overflow-hidden'
        )}
      >
        <Select value={row.operator || undefined} onValueChange={(v) => onChange(NO_VALUE_OPS.includes(v) ? { operator: v, value: '' } : { operator: v })} disabled={!f}>
          <SelectTrigger aria-label={`Row ${idx + 1} operator`}><SelectValue placeholder="Operator" /></SelectTrigger>
          <SelectContent>{ops.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Value — hidden until operator selected AND operator requires a value */}
      <div
        className={cn(
          'min-w-0 transition-all duration-300 ease-out',
          showValue ? 'flex-1 opacity-100 max-w-[200px]' : 'flex-0 opacity-0 max-w-0 overflow-hidden'
        )}
      >
        {f && f.dataType === 'enum' && f.enumOptions && showValue ? (
          <Select value={row.value || undefined} onValueChange={(v) => onChange({ value: v })} disabled={!row.operator}>
            <SelectTrigger aria-label={`Row ${idx + 1} value`}><SelectValue placeholder="Value" /></SelectTrigger>
            <SelectContent>{f.enumOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        ) : f && f.dataType === 'number' && showValue ? (
          <Input type="number" value={row.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="Value" aria-label={`Row ${idx + 1} value`} disabled={!row.operator} />
        ) : f && f.dataType === 'date' && showValue && row.operator === 'in_last_n_days' ? (
          <Input type="number" value={row.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="Days" aria-label={`Row ${idx + 1} days`} />
        ) : f && f.dataType === 'date' && showValue && row.operator === 'between' ? (
          <DateRangePickerInput value={row.value} onChange={(v) => onChange({ value: v })} ariaLabel={`Row ${idx + 1} date range`} />
        ) : f && f.dataType === 'date' && showValue && row.operator ? (
          <DatePickerInput value={row.value} onChange={(v) => onChange({ value: v })} ariaLabel={`Row ${idx + 1} date`} />
        ) : (
          <Input value={row.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="Value" aria-label={`Row ${idx + 1} value`} disabled={!row.operator || hide} />
        )}
      </div>

      {/* Delete */}
      <Button type="button" variant="secondaryGhost" size="icon" onClick={onRemove} aria-label={`Remove filter row ${idx + 1}`} className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive">
        <Trash size={16} />
      </Button>
    </div>
  )
}

// ─── Group component (recursive) ─────────────────────────────────────────────

function GroupRenderer({ group, fieldIndex, fieldMap, onChange, allowNesting, maxDepth, depth, useSearchableDropdown }: {
  group: FilterGroup
  fieldIndex: IndexedField[]
  fieldMap: Map<string, FilterFieldDef>
  onChange: (g: FilterGroup) => void
  allowNesting: boolean
  maxDepth: number
  depth: number
  useSearchableDropdown: boolean
}) {
  const canNest = allowNesting && depth < maxDepth - 1
  const atMaxDepth = allowNesting && depth >= maxDepth - 1

  function updateCondition(i: number, c: FilterCondition) {
    const u = [...group.conditions]
    // Auto-remove nested groups that become empty
    if (c.type === 'group' && c.group.conditions.length === 0) {
      u.splice(i, 1)
    } else {
      u[i] = c
    }
    onChange({ ...group, conditions: u })
  }
  function removeCondition(i: number) {
    const updated = group.conditions.filter((_, j) => j !== i)
    onChange({ ...group, conditions: updated })
  }
  function addFilter() {
    onChange({ ...group, conditions: [...group.conditions, { type: 'row', row: { field: '', operator: '', value: '' } }] })
  }
  function addGroup() {
    const logic: FilterLogic = group.logic === 'and' ? 'or' : 'and'
    onChange({ ...group, conditions: [...group.conditions, { type: 'group', group: { logic, conditions: [{ type: 'row', row: { field: '', operator: '', value: '' } }] } }] })
  }
  function toggleLogic() {
    onChange({ ...group, logic: group.logic === 'and' ? 'or' : 'and' })
  }

  return (
    <div className="flex flex-col gap-0" role="group" aria-label={`${group.logic.toUpperCase()} filter group`}>
      {/* Header: badge + actions on same row */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="default"
          size="xs"
          onClick={toggleLogic}
          aria-label={`Toggle group logic, currently ${group.logic.toUpperCase()}`}
          className="text-xs font-bold uppercase w-10 text-center"
        >
          {group.logic}
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {canNest && (
            <Button type="button" variant="outline" size="xs" onClick={addGroup} className="text-xs text-primary border-primary/30 hover:bg-primary/5">
              <Plus weight="bold" size={12} />
              Group
            </Button>
          )}
          {atMaxDepth && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button type="button" variant="outline" size="xs" disabled className="text-xs opacity-50">
                      <Plus weight="bold" size={12} />
                      Group
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Maximum nesting depth reached</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button type="button" variant="outline" size="xs" onClick={addFilter} className="text-xs text-primary border-primary/30 hover:bg-primary/5">
            <Plus weight="bold" size={12} />
            Filter
          </Button>
        </div>
      </div>

      {/* Conditions with left connector line */}
      {group.conditions.length > 0 && (
        <div className="ml-[18px] pl-4 border-l-2 border-primary flex flex-col gap-2">
          {group.conditions.map((condition, index) => (
            <div key={`${depth}-${index}`}>
              {condition.type === 'row' ? (
                <ConditionRow
                  row={condition.row as FilterRow}
                  fieldIndex={fieldIndex}
                  fieldMap={fieldMap}
                  onChange={(p) => updateCondition(index, { type: 'row', row: { ...(condition.row as FilterRow), ...p } })}
                  onRemove={() => removeCondition(index)}
                  idx={index}
                  useSearchableDropdown={useSearchableDropdown}
                />
              ) : (
                <div className="rounded border border-border p-3 bg-secondary/50">
                  <GroupRenderer
                    group={condition.group}
                    fieldIndex={fieldIndex}
                    fieldMap={fieldMap}
                    onChange={(g) => updateCondition(index, { type: 'group', group: g })}
                    allowNesting={allowNesting}
                    maxDepth={maxDepth}
                    depth={depth + 1}
                    useSearchableDropdown={useSearchableDropdown}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function InlineFilterBuilder({ fields, sourceCategories, value, onChange, allowNesting = true, maxDepth = 3 }: InlineFilterBuilderProps) {
  const fieldIndex = useMemo(
    () => buildFieldIndex(fields, sourceCategories),
    [fields, sourceCategories]
  )

  const fieldMap = useMemo(
    () => new Map(fieldIndex.map((item) => [item.fieldKey, item.field])),
    [fieldIndex]
  )

  // Use searchable dropdown when sourceCategories are provided (hierarchical data needs search)
  const useSearchableDropdown = !!sourceCategories && sourceCategories.length > 0

  return (
    <div data-testid="filter-builder">
      <GroupRenderer
        group={value}
        fieldIndex={fieldIndex}
        fieldMap={fieldMap}
        onChange={onChange}
        allowNesting={allowNesting}
        maxDepth={maxDepth}
        depth={0}
        useSearchableDropdown={useSearchableDropdown}
      />
    </div>
  )
}
