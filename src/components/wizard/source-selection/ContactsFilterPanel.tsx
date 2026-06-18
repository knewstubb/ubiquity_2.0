import { useCallback } from 'react'
import { Plus, X, Info } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { ContactsFilterConfig, FieldFilterRow } from '@/models/source-selection'
import { CONTACT_SYSTEM_FIELDS } from '@/models/source-selection'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactsFilterPanelProps {
  config: ContactsFilterConfig
  onChange: (config: ContactsFilterConfig) => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

const MAX_FILTER_ROWS = 10

// ─── Component ───────────────────────────────────────────────────────────────

export function ContactsFilterPanel({ config, onChange }: ContactsFilterPanelProps) {
  // Ensure we always have at least one row
  const rows = config.fieldFilters && config.fieldFilters.length > 0
    ? config.fieldFilters
    : [{ field: '', operator: '', value: '' }]

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleFilterRowChange = useCallback(
    (index: number, patch: Partial<FieldFilterRow>) => {
      const updated = [...rows]
      updated[index] = { ...updated[index], ...patch }
      onChange({ ...config, fieldFilters: updated })
    },
    [config, rows, onChange],
  )

  const handleAddRow = useCallback(() => {
    if (rows.length >= MAX_FILTER_ROWS) return
    onChange({ ...config, fieldFilters: [...rows, { field: '', operator: '', value: '' }] })
  }, [config, rows, onChange])

  const handleRemoveRow = useCallback(
    (index: number) => {
      const updated = [...rows]
      updated.splice(index, 1)
      if (updated.length === 0) {
        updated.push({ field: '', operator: '', value: '' })
      }
      onChange({ ...config, fieldFilters: updated })
    },
    [config, rows, onChange],
  )

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function isRowIncomplete(row: FieldFilterRow): boolean {
    return row.field === '' || row.operator === '' || row.value === ''
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3" data-testid="contacts-filter-panel">
      {/* Delta export info */}
      <div className="flex items-start gap-2 rounded bg-accent/50 border border-primary/20 px-3 py-2.5">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground m-0">
          The first export includes data from the previous 24 hours. Subsequent exports deliver only the delta — records changed or added since the last run.
        </p>
      </div>

      {/* Field filter builder — shown directly */}
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const showAnd = index > 0
          const incomplete = isRowIncomplete(row)

          return (
            <div key={index} className="flex flex-col gap-2">
              {showAnd && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  AND
                </span>
              )}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Select
                    value={row.field || undefined}
                    onValueChange={(v) => handleFilterRowChange(index, { field: v })}
                  >
                    <SelectTrigger aria-label={`Filter row ${index + 1} field`}>
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_SYSTEM_FIELDS.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-0">
                  <Select
                    value={row.operator || undefined}
                    onValueChange={(v) => handleFilterRowChange(index, { operator: v })}
                  >
                    <SelectTrigger aria-label={`Filter row ${index + 1} operator`}>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-0">
                  <Input
                    value={row.value}
                    onChange={(e) => handleFilterRowChange(index, { value: e.target.value })}
                    placeholder="Value"
                    aria-label={`Filter row ${index + 1} value`}
                  />
                </div>

                <Button
                  type="button"
                  variant="secondaryGhost"
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
                  All fields are required — select a field, operator, and enter a value
                </p>
              )}
            </div>
          )
        })}

        {rows.length < MAX_FILTER_ROWS && (
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
    </div>
  )
}
