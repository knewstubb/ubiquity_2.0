/**
 * @component DataTable
 * @description Generic sortable data table with typed columns, density control, container styles,
 * selection, striping, and empty state handling.
 *
 * @designDecisions
 * - Header text uses font-semibold + muted-foreground for clear hierarchy without competing with cell data
 * - Sort cycles through asc → desc → unsorted (three-state) to allow clearing sort
 * - Sort indicator only appears on the actively sorted column to reduce visual noise
 * - Right-aligned columns automatically get tabular-nums for numeric readability
 * - Density prop controls cell padding (compact/default/relaxed) per docs/ui/patterns/tables.md
 * - Container prop controls outer wrapper (borderless/bordered/card)
 * - Row hover uses bg-secondary per documented standard
 * - Selection uses bg-accent/30 fill with Checkbox component
 * - Striped rows use bg-muted/30 on alternating rows
 *
 * @usage
 * - Use for structured tabular data with optional sorting
 * - Prefer over manual Table composition when columns are data-driven
 * - For tree/hierarchical data, use Table primitives directly
 * - For simple key-value display, use a description list instead
 *
 * @variants
 * - density: compact | default | relaxed — controls cell padding per docs/ui/patterns/tables.md
 * - container: borderless | bordered | card — controls outer wrapper presentation
 */
import { useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowsDownUp } from '@phosphor-icons/react'

export type DataTableDensity = 'compact' | 'default' | 'relaxed'
export type DataTableContainer = 'borderless' | 'bordered' | 'card'

export interface DataTableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Density controls cell padding. Default: 'default' */
  density?: DataTableDensity
  /** Container style. Default: 'borderless' */
  container?: DataTableContainer
  /** Enable row hover highlight. Default: true */
  hover?: boolean
  /** Enable alternating row backgrounds. Default: false */
  striped?: boolean
  /** Enable row selection with checkboxes. Default: false */
  selectable?: boolean
  /** Make header sticky on scroll. Default: false */
  stickyHeader?: boolean
  /** Message shown when data is empty */
  emptyMessage?: string
  /** Callback when selection changes (receives selected row indices) */
  onSelectionChange?: (selectedIndices: number[]) => void
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

const DENSITY_CELL: Record<DataTableDensity, string> = {
  compact: 'py-1.5 px-3 text-xs',
  default: 'py-3 px-4 text-sm',
  relaxed: 'py-4 px-4 text-sm',
}

const DENSITY_HEADER: Record<DataTableDensity, string> = {
  compact: 'py-1.5 px-3 text-xs',
  default: 'py-2.5 px-4 text-sm',
  relaxed: 'py-3 px-4 text-sm',
}

const CONTAINER_CLASSES: Record<DataTableContainer, string> = {
  borderless: '',
  bordered: 'border border-border rounded-md overflow-hidden',
  card: 'border border-border rounded-lg shadow-sm overflow-hidden',
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  density = 'default',
  container = 'borderless',
  hover = true,
  striped = false,
  selectable = false,
  stickyHeader = false,
  emptyMessage = 'No data available',
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const toggleRow = useCallback((index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      onSelectionChange?.(Array.from(next))
      return next
    })
  }, [onSelectionChange])

  const toggleAll = useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const all = new Set(data.map((_, i) => i))
      setSelectedRows(all)
      onSelectionChange?.(Array.from(all))
    }
  }, [data.length, selectedRows.size, onSelectionChange])

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null || bVal == null) return 0
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDirection === 'asc' ? cmp : -cmp
  })

  const allSelected = selectedRows.size === data.length && data.length > 0
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length

  return (
    <div className={cn(CONTAINER_CLASSES[container], className)}>
      <Table>
        <TableHeader>
          <TableRow className={cn(
            "hover:bg-transparent",
            stickyHeader && "sticky top-0 z-10 bg-background",
          )}>
            {selectable && (
              <TableHead className={cn(DENSITY_HEADER[density], 'w-10')}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={cn(
                  DENSITY_HEADER[density],
                  'font-semibold text-muted-foreground',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.sortable && 'cursor-pointer select-none hover:text-primary',
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={col.sortable && sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc'
                      ? <ArrowUp className="h-3 w-3" />
                      : <ArrowDown className="h-3 w-3" />
                  )}
                  {col.sortable && sortKey !== col.key && (
                    <ArrowsDownUp className="h-3 w-3 opacity-40" />
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="text-center py-12 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, i) => (
              <TableRow
                key={i}
                className={cn(
                  hover && 'hover:bg-secondary cursor-pointer',
                  striped && i % 2 === 1 && 'bg-muted/30',
                  selectable && selectedRows.has(i) && 'bg-accent/30 hover:bg-accent/40',
                )}
              >
                {selectable && (
                  <TableCell className={cn(DENSITY_CELL[density], 'w-10')}>
                    <Checkbox
                      checked={selectedRows.has(i)}
                      onCheckedChange={() => toggleRow(i)}
                      aria-label={`Select row ${i + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn(
                      DENSITY_CELL[density],
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Bulk action bar */}
      {selectable && selectedRows.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-accent rounded-md mt-3">
          <span className="text-sm font-medium text-primary">{selectedRows.size} selected</span>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-primary font-medium h-auto p-0"
            onClick={() => { setSelectedRows(new Set()); onSelectionChange?.([]); }}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  )
}
