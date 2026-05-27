import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  MessageEnrichmentOptions,
  Channel,
  MessageStatus,
} from '@/models/source-selection'

// Types

interface MessageEnrichmentConfigProps {
  config: MessageEnrichmentOptions
  onChange: (config: MessageEnrichmentOptions) => void
}

// Constants

const AVAILABLE_CHANNELS: { id: Channel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'push', label: 'Push' },
]

const STATUS_OPTIONS: { id: MessageStatus; label: string }[] = [
  { id: 'delivered', label: 'Delivered' },
  { id: 'bounced', label: 'Bounced' },
  { id: 'failed', label: 'Failed' },
  { id: 'opened', label: 'Opened' },
]

// Component

export function MessageEnrichmentConfig({ config, onChange }: MessageEnrichmentConfigProps) {
  function handleChannelChange(channel: string) {
    onChange({ ...config, channel: channel as Channel })
  }

  function handleStatusToggle(status: MessageStatus) {
    const current = config.statuses ?? []
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status]
    onChange({ ...config, statuses: updated })
  }

  return (
    <div className="flex flex-col gap-3 pl-3 border-l-2 border-primary/20">
      {/* Channel selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Channel
        </label>
        <Select value={config.channel || ''} onValueChange={handleChannelChange}>
          <SelectTrigger className="max-w-[280px]">
            <SelectValue placeholder="Select a channel..." />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_CHANNELS.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status multi-select */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Message statuses (select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => {
            const isSelected = config.statuses?.includes(status.id) ?? false
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => handleStatusToggle(status.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-xs font-medium transition-colors duration-150 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
                aria-pressed={isSelected}
              >
                {status.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
