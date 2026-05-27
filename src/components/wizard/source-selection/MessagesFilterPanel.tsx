import { cn } from '../../../lib/utils'
import { Checkbox } from '../../ui/checkbox'
import { Input } from '../../ui/input'
import { Combobox } from '../../ui/combobox'
import { Info, Warning } from '@phosphor-icons/react'
import { validateDateRange } from '../../../utils/source-selection-validation'
import type { MessagesFilterConfig, MessagesFilterType, MessageStatus, Channel } from '../../../models/source-selection'

// Types
interface MessagesFilterPanelProps {
  config: MessagesFilterConfig
  onChange: (config: MessagesFilterConfig) => void
  channel: Channel
}

interface FilterOption {
  id: MessagesFilterType
  label: string
  description: string
}

interface CampaignOption {
  id: string
  name: string
  channel: Channel
}

// Constants
const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All sends', description: 'Include all message sends' },
  { id: 'by_status', label: 'By status', description: 'Filter by delivery status' },
  { id: 'for_campaign', label: 'For specific campaign', description: 'Filter by campaign' },
  { id: 'in_date_range', label: 'In date range', description: 'Filter by send date' },
]

const STATUS_OPTIONS: { id: MessageStatus; label: string }[] = [
  { id: 'delivered', label: 'Delivered' },
  { id: 'bounced', label: 'Bounced' },
  { id: 'failed', label: 'Failed' },
  { id: 'opened', label: 'Opened' },
]

const MOCK_CAMPAIGNS: CampaignOption[] = [
  { id: 'camp-welcome-email', name: 'Welcome Email', channel: 'email' },
  { id: 'camp-monthly-newsletter', name: 'Monthly Newsletter', channel: 'email' },
  { id: 'camp-promo-sms', name: 'Promo SMS', channel: 'sms' },
  { id: 'camp-flash-sale-sms', name: 'Flash Sale SMS', channel: 'sms' },
  { id: 'camp-app-update-push', name: 'App Update Push', channel: 'push' },
  { id: 'camp-weekly-digest-push', name: 'Weekly Digest Push', channel: 'push' },
]

// Component
export function MessagesFilterPanel({ config, onChange, channel }: MessagesFilterPanelProps) {
  // Derived
  const selectedStatuses = config.statuses ?? []
  const showStatusError = config.type === 'by_status' && selectedStatuses.length === 0
  const showDateError =
    config.type === 'in_date_range' &&
    config.startDate !== undefined &&
    config.endDate !== undefined &&
    config.startDate.length > 0 &&
    config.endDate.length > 0 &&
    !validateDateRange(config.startDate, config.endDate)

  const campaignsForChannel = MOCK_CAMPAIGNS.filter((c) => c.channel === channel)
  const campaignComboboxOptions = campaignsForChannel.map((c) => ({ value: c.id, label: c.name }))

  // Handlers
  function handleFilterTypeChange(type: MessagesFilterType) {
    if (type === config.type) return
    const newConfig: MessagesFilterConfig = { type }
    if (type === 'by_status') {
      newConfig.statuses = []
    }
    onChange(newConfig)
  }

  function handleStatusToggle(status: MessageStatus) {
    const current = [...selectedStatuses]
    const index = current.indexOf(status)
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(status)
    }
    onChange({ ...config, statuses: current })
  }

  function handleCampaignSelect(campaignId: string) {
    onChange({ ...config, campaignId })
  }

  function handleStartDateChange(startDate: string) {
    onChange({ ...config, startDate })
  }

  function handleEndDateChange(endDate: string) {
    onChange({ ...config, endDate })
  }

  return (
    <div className="flex flex-col gap-2" data-testid="messages-filter-panel" role="radiogroup" aria-label="Message filter type">
      {FILTER_OPTIONS.map((option) => (
        <div key={option.id} className="flex flex-col">
          <button
            type="button"
            role="radio"
            aria-checked={config.type === option.id}
            onClick={() => handleFilterTypeChange(option.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded border text-left transition-colors duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              config.type === option.id
                ? 'border-primary bg-accent shadow-sm'
                : 'border-border bg-background hover:border-primary hover:bg-accent/25',
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                config.type === option.id ? 'border-primary' : 'border-muted-foreground',
              )}
            >
              {config.type === option.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground m-0">{option.label}</p>
              <p className="text-xs text-muted-foreground m-0">{option.description}</p>
            </div>
          </button>

          {/* Secondary inputs in grey box — directly below selected card */}
          {config.type === option.id && option.id === 'by_status' && (
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3 flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground m-0">
                Select one or more statuses
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <label
                    key={status.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => handleStatusToggle(status.id)}
                      aria-label={status.label}
                    />
                    <span className="text-sm text-foreground">{status.label}</span>
                  </label>
                ))}
              </div>
              {showStatusError && (
                <div className="flex items-center gap-1.5 text-destructive" role="alert">
                  <Warning size={14} weight="fill" />
                  <p className="text-xs m-0">At least one status must be selected</p>
                </div>
              )}
            </div>
          )}

          {config.type === option.id && option.id === 'for_campaign' && (
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3 flex flex-col gap-3">
              <label className="text-xs font-medium text-muted-foreground">Campaign</label>
              {campaignsForChannel.length === 0 ? (
                <div className="flex items-center gap-1.5 text-muted-foreground" role="status">
                  <Info size={14} weight="fill" />
                  <p className="text-xs m-0">
                    No campaigns available for {channel} channel
                  </p>
                </div>
              ) : (
                <Combobox
                  value={config.campaignId ?? ''}
                  onValueChange={handleCampaignSelect}
                  options={campaignComboboxOptions}
                  placeholder="Select a campaign..."
                  searchPlaceholder="Search campaigns..."
                />
              )}
            </div>
          )}

          {config.type === option.id && option.id === 'in_date_range' && (
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="messages-start-date" className="text-xs font-medium text-muted-foreground">
                  Start date
                </label>
                <Input
                  id="messages-start-date"
                  type="date"
                  value={config.startDate ?? ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  aria-invalid={showDateError || undefined}
                  aria-label="Start date"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="messages-end-date" className="text-xs font-medium text-muted-foreground">
                  End date
                </label>
                <Input
                  id="messages-end-date"
                  type="date"
                  value={config.endDate ?? ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  aria-invalid={showDateError || undefined}
                  aria-label="End date"
                />
              </div>
              {showDateError && (
                <div className="flex items-center gap-1.5 text-destructive" role="alert">
                  <Warning size={14} weight="fill" />
                  <p className="text-xs m-0">Start date must be on or before end date</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
