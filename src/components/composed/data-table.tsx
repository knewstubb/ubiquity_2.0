import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ArrowsDownUp, ArrowUp, ArrowDown } from '@phosphor-icons/react'

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
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

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

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null || bVal == null) return 0
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDirection === 'asc' ? cmp : -cmp
  })

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={String(col.key)}
              className={cn(
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center',
                col.sortable && 'cursor-pointer select-none'
              )}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {col.sortable && (
                  <>
                    {sortKey === col.key && sortDirection === 'asc' && (
                      <ArrowUp className="h-3 w-3" />
                    )}
                    {sortKey === col.key && sortDirection === 'desc' && (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {sortKey !== col.key && (
                      <ArrowsDownUp className="h-3 w-3 opacity-40" />
                    )}
                  </>
                )}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, i) => (
          <TableRow key={i}>
            {columns.map((col) => (
              <TableCell
                key={String(col.key)}
                className={cn(
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
              >
                {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
