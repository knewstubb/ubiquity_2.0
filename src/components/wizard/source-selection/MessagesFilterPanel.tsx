import { useCallback } from 'react'
import { Plus, X, Info } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { MessagesFilterConfig, FieldFilterRow, Channel } from '@/models/source-selection'
import { MESSAGE_SYSTEM_FIELDS } from '@/models/source-selection'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MessagesFilterPanelProps {
  config: MessagesFilterConfig
  onChange: (config: MessagesFilterConfig) => void
  channel: Channel
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'is_true', label: 'Is true' },
  { value: 'is_false', label: 'Is false' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
]

const MAX_FILTER_ROWS = 10

/** Mock emails/messages available for selection */
const MOCK_EMAILS = [
  { id: 'email-welcome-series', name: 'Welcome Series' },
  { id: 'email-monthly-newsletter', name: 'Monthly Newsletter' },
  { id: 'email-promo-summer-2026', name: 'Summer Promo 2026' },
  { id: 'email-re-engagement', name: 'Re-engagement Campaign' },
  { id: 'email-product-update', name: 'Product Update Q2' },
  { id: 'email-black-friday', name: 'Black Friday Sale' },
]

const MOCK_SMS = [
  { id: 'sms-appointment-reminder', name: 'Appointment Reminder' },
  { id: 'sms-delivery-update', name: 'Delivery Update' },
  { id: 'sms-flash-sale', name: 'Flash Sale Alert' },
]

const MOCK_PUSH = [
  { id: 'push-app-update', name: 'App Update Notification' },
  { id: 'push-weekly-digest', name: 'Weekly Digest' },
]

function getMessagesForChannel(channel: Channel) {
  switch (channel) {
    case 'email': return MOCK_EMAILS
    case 'sms': return MOCK_SMS
    case 'push': return MOCK_PUSH
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MessagesFilterPanel({ config, onChange, channel }: MessagesFilterPanelProps) {
  const rows = config.fieldFilters && config.fieldFilters.length > 0
    ? config.fieldFilters
    : [{ field: '', operator: '', value: '' }]

  const availableMessages = getMessagesForChannel(channel)
  const selectedIds = config.selectedMessageIds ?? []

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

  function handleMessageToggle(messageId: string) {
    const current = [...selectedIds]
    const index = current.indexOf(messageId)
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(messageId)
    }
    onChange({ ...config, selectedMessageIds: current })
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function isRowIncomplete(row: FieldFilterRow): boolean {
    if (row.operator === 'is_true' || row.operator === 'is_false') {
      return row.field === '' || row.operator === ''
    }
    return row.field === '' || row.operator === '' || row.value === ''
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4" data-testid="messages-filter-panel">
      {/* Delta export info */}
      <div className="flex items-start gap-2 rounded bg-accent/50 border border-primary/20 px-3 py-2.5">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground m-0">
          The first export includes data from the previous 24 hours. Subsequent exports deliver only the delta — records changed or added since the last run.
        </p>
      </div>

      {/* Email/message selection */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">
          Select {channel === 'email' ? 'emails' : channel === 'sms' ? 'SMS messages' : 'push notifications'}
        </Label>
        <p className="text-xs text-muted-foreground m-0 -mt-1">
          Choose which specific {channel === 'email' ? 'emails' : 'messages'} to include in this export.
        </p>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-3 max-h-[180px] overflow-y-auto">
          {availableMessages.map((msg) => (
            <label key={msg.id} className="flex items-center gap-2 cursor-pointer py-1">
              <Checkbox
                checked={selectedIds.includes(msg.id)}
                onCheckedChange={() => handleMessageToggle(msg.id)}
                aria-label={msg.name}
              />
              <span className="text-sm text-foreground">{msg.name}</span>
            </label>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <p className="text-xs text-muted-foreground m-0">
            {selectedIds.length} selected
          </p>
        )}
      </div>

      {/* Field filter builder */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Filter by mailout fields</Label>
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
                        {MESSAGE_SYSTEM_FIELDS.map((f) => (
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

                  {row.operator !== 'is_true' && row.operator !== 'is_false' && (
                    <div className="flex-1 min-w-0">
                      <Input
                        value={row.value}
                        onChange={(e) => handleFilterRowChange(index, { value: e.target.value })}
                        placeholder="Value"
                        aria-label={`Filter row ${index + 1} value`}
                      />
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
    </div>
  )
}
