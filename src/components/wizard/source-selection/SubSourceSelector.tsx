import { useEffect } from 'react'
import { Info } from '@phosphor-icons/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CheckboxCard } from '@/components/composed/checkbox-card'
import type { PrimarySourceType, Channel } from '../../../models/source-selection'

interface SubSourceSelectorProps {
  primarySource: PrimarySourceType
  selectedTableId?: string
  selectedChannels?: Channel[]
  onTableChange: (tableId: string) => void
  onChannelChange: (channel: Channel) => void
  availableChannels: Channel[]
}

const TRANSACTION_TABLES = [
  { id: 'purchases', label: 'Purchases' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'returns', label: 'Returns' },
]

const CHANNEL_OPTIONS: { id: Channel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'push', label: 'Push' },
]

export function SubSourceSelector({
  primarySource,
  selectedTableId,
  selectedChannels = [],
  onTableChange,
  onChannelChange,
  availableChannels,
}: SubSourceSelectorProps) {
  // Auto-select channel when only one exists
  useEffect(() => {
    if (
      primarySource === 'messages' &&
      availableChannels.length === 1 &&
      !selectedChannels.includes(availableChannels[0])
    ) {
      onChannelChange(availableChannels[0])
    }
  }, [primarySource, availableChannels, selectedChannels, onChannelChange])

  // Contacts have no sub-source
  if (primarySource === 'contacts') {
    return null
  }

  // Transactions: dropdown of available tables
  if (primarySource === 'transactions') {
    return (
      <div className="flex flex-col gap-3">
        <Select value={selectedTableId ?? ''} onValueChange={onTableChange}>
          <SelectTrigger
            className="w-full"
            aria-label="Transaction table"
          >
            <SelectValue placeholder="Select a transaction table..." />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TABLES.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedTableId && (
          <p className="text-xs text-muted-foreground m-0">
            A transaction table must be selected to continue.
          </p>
        )}
      </div>
    )
  }

  // Messages: channel selector
  if (primarySource === 'messages') {
    // No channels configured
    if (availableChannels.length === 0) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded border border-border bg-muted/50 px-4 py-3">
            <Info size={16} className="text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground m-0">
              No channels configured. Please configure at least one messaging channel to continue.
            </p>
          </div>
        </div>
      )
    }

    // Single channel: auto-selected
    if (availableChannels.length === 1) {
      const channelLabel = CHANNEL_OPTIONS.find((c) => c.id === availableChannels[0])?.label ?? availableChannels[0]
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground m-0">
            Only one channel is available — automatically selected.
          </p>
          <CheckboxCard
            selected={true}
            onToggle={() => {}}
            label={channelLabel}
            disabled
          />
        </div>
      )
    }

    // Multiple channels: checkbox cards (multi-select)
    return (
      <div className="flex flex-col gap-2">
        {CHANNEL_OPTIONS.filter((opt) => availableChannels.includes(opt.id)).map((option) => (
          <CheckboxCard
            key={option.id}
            selected={selectedChannels.includes(option.id)}
            onToggle={() => onChannelChange(option.id)}
            label={option.label}
          />
        ))}
        {selectedChannels.length === 0 && (
          <p className="text-xs text-muted-foreground m-0">
            Select at least one channel to continue.
          </p>
        )}
      </div>
    )
  }

  return null
}
