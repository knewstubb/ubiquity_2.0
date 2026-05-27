import { useEffect } from 'react'
import { Envelope, ChatText, Bell, Info } from '@phosphor-icons/react'
import { cn } from '../../../lib/utils'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { PrimarySourceType, Channel } from '../../../models/source-selection'

interface SubSourceSelectorProps {
  primarySource: PrimarySourceType
  selectedTableId?: string
  selectedChannel?: Channel
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

const CHANNEL_OPTIONS: {
  id: Channel
  label: string
  icon: React.ReactNode
}[] = [
  { id: 'email', label: 'Email', icon: <Envelope weight="duotone" /> },
  { id: 'sms', label: 'SMS', icon: <ChatText weight="duotone" /> },
  { id: 'push', label: 'Push', icon: <Bell weight="duotone" /> },
]

export function SubSourceSelector({
  primarySource,
  selectedTableId,
  selectedChannel,
  onTableChange,
  onChannelChange,
  availableChannels,
}: SubSourceSelectorProps) {
  // Auto-select channel when only one exists
  useEffect(() => {
    if (
      primarySource === 'messages' &&
      availableChannels.length === 1 &&
      selectedChannel !== availableChannels[0]
    ) {
      onChannelChange(availableChannels[0])
    }
  }, [primarySource, availableChannels, selectedChannel, onChannelChange])

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

    // Single channel: auto-selected (handled by useEffect above), show confirmation
    if (availableChannels.length === 1) {
      const channel = CHANNEL_OPTIONS.find((c) => c.id === availableChannels[0])
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground m-0">
            Only one channel is available — automatically selected.
          </p>
          {channel && (
            <div className="flex items-center gap-3 rounded border border-primary bg-accent px-4 py-3 shadow-sm">
              <span className="text-primary">{channel.icon}</span>
              <span className="text-sm font-semibold text-foreground">{channel.label}</span>
            </div>
          )}
        </div>
      )
    }

    // Multiple channels: radio-style cards
    return (
      <div className="flex flex-col gap-3">
        <div
          className="grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Channel selection"
        >
          {CHANNEL_OPTIONS.filter((opt) => availableChannels.includes(opt.id)).map(
            (option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selectedChannel === option.id}
                onClick={() => onChannelChange(option.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded border px-4 py-4 text-center transition-colors duration-150 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selectedChannel === option.id
                    ? 'border-primary bg-accent shadow-sm'
                    : 'border-border bg-background hover:border-primary hover:bg-accent/25'
                )}
              >
                <span
                  className={cn(
                    'text-xl',
                    selectedChannel === option.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {option.icon}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {option.label}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  return null
}
