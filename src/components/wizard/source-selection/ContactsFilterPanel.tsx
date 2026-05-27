import { useState } from 'react'
import { MagnifyingGlass, Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactsFilterConfig, ContactsFilterType } from '@/models/source-selection'
import { validateDays } from '@/utils/source-selection-validation'

// Types

interface ContactsFilterPanelProps {
  config: ContactsFilterConfig
  onChange: (config: ContactsFilterConfig) => void
}

interface FilterOption {
  id: ContactsFilterType
  label: string
  description?: string
}

// Mock data

const MOCK_SEGMENTS = [
  { id: 'seg-gold-members', name: 'Gold Members' },
  { id: 'seg-newsletter', name: 'Newsletter Subscribers' },
  { id: 'seg-vip', name: 'VIP Customers' },
  { id: 'seg-inactive', name: 'Inactive 90 Days' },
  { id: 'seg-high-value', name: 'High Value Purchasers' },
]

const MOCK_CAMPAIGNS = [
  { id: 'camp-summer-2024', name: 'Summer Sale 2024' },
  { id: 'camp-welcome', name: 'Welcome Series' },
  { id: 'camp-reengagement', name: 'Re-engagement Q1' },
  { id: 'camp-black-friday', name: 'Black Friday 2024' },
]

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All contacts' },
  { id: 'created_in_last_n_days', label: 'Created in last N days' },
  { id: 'in_list_segment', label: 'In list/segment' },
  { id: 'unsubscribed', label: 'Unsubscribed' },
  { id: 'not_sent_campaign', label: 'Not sent campaign' },
]

// Component

export function ContactsFilterPanel({ config, onChange }: ContactsFilterPanelProps) {
  // State
  const [segmentSearch, setSegmentSearch] = useState('')
  const [daysInputValue, setDaysInputValue] = useState(
    config.days !== undefined ? String(config.days) : ''
  )

  // Derived
  const daysError = getDaysError(daysInputValue, config.type)
  const filteredSegments = MOCK_SEGMENTS.filter((seg) =>
    seg.name.toLowerCase().includes(segmentSearch.toLowerCase())
  )

  // Handlers

  function handleFilterTypeChange(type: ContactsFilterType) {
    const newConfig: ContactsFilterConfig = { type }

    // Preserve relevant secondary values when switching back to a type
    if (type === 'created_in_last_n_days' && config.days !== undefined) {
      newConfig.days = config.days
    }
    if (type === 'in_list_segment' && config.segmentId !== undefined) {
      newConfig.segmentId = config.segmentId
    }
    if (type === 'not_sent_campaign' && config.campaignId !== undefined) {
      newConfig.campaignId = config.campaignId
    }

    // Reset days input when switching to days filter
    if (type === 'created_in_last_n_days') {
      setDaysInputValue(config.days !== undefined ? String(config.days) : '')
    }

    onChange(newConfig)
  }

  function handleDaysChange(rawValue: string) {
    setDaysInputValue(rawValue)

    const parsed = Number(rawValue)
    if (rawValue === '' || isNaN(parsed)) {
      onChange({ ...config, days: undefined })
      return
    }

    // Only update config with valid integer values
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 365) {
      onChange({ ...config, days: parsed })
    } else {
      // Store the raw parsed value so validation can show error
      onChange({ ...config, days: parsed })
    }
  }

  function handleSegmentChange(segmentId: string) {
    onChange({ ...config, segmentId })
  }

  function handleCampaignChange(campaignId: string) {
    onChange({ ...config, campaignId })
  }

  // Render

  return (
    <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Contact filter options">
      {FILTER_OPTIONS.map((option) => (
        <div key={option.id} className="flex flex-col">
          <button
            type="button"
            role="radio"
            aria-checked={config.type === option.id}
            onClick={() => handleFilterTypeChange(option.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              config.type === option.id
                ? 'border-primary bg-accent'
                : 'border-border bg-background hover:border-primary/50 hover:bg-accent/25'
            )}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                config.type === option.id
                  ? 'border-primary'
                  : 'border-muted-foreground'
              )}
            >
              {config.type === option.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-medium text-foreground">{option.label}</span>
          </button>

          {/* Secondary input — rendered directly below the selected card */}
          {config.type === option.id && option.id === 'created_in_last_n_days' && (
            <div className="ml-7 mt-2 mb-1 flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Number of days (1–365)
              </label>
              <Input
                type="number"
                min={1}
                max={365}
                step={1}
                value={daysInputValue}
                onChange={(e) => handleDaysChange(e.target.value)}
                placeholder="e.g. 30"
                aria-invalid={!!daysError}
                aria-describedby={daysError ? 'days-error' : undefined}
                className="max-w-[140px]"
              />
              {daysError && (
                <p id="days-error" className="text-xs text-destructive flex items-center gap-1 m-0">
                  <Warning size={12} weight="fill" />
                  {daysError}
                </p>
              )}
            </div>
          )}

          {config.type === option.id && option.id === 'in_list_segment' && (
            <div className="ml-7 mt-2 mb-1 flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select a list or segment
              </label>
              <div className="relative max-w-[280px]">
                <MagnifyingGlass
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  type="text"
                  value={segmentSearch}
                  onChange={(e) => setSegmentSearch(e.target.value)}
                  placeholder="Search segments..."
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto rounded-md border border-border p-1">
                {filteredSegments.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-1.5 m-0">No segments found</p>
                ) : (
                  filteredSegments.map((segment) => (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => handleSegmentChange(segment.id)}
                      className={cn(
                        'text-left text-sm px-2 py-1.5 rounded cursor-pointer transition-colors duration-150',
                        config.segmentId === segment.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {segment.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {config.type === option.id && option.id === 'not_sent_campaign' && (
            <div className="ml-7 mt-2 mb-1 flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select a campaign
              </label>
              <Select
                value={config.campaignId ?? ''}
                onValueChange={handleCampaignChange}
              >
                <SelectTrigger className="max-w-[280px]">
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CAMPAIGNS.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded px-2 py-1.5 m-0 max-w-[280px]">
                <span className="font-medium">Cross-entity filter:</span> This filters contacts based on campaign send history from the Messages entity.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Helpers

function getDaysError(inputValue: string, filterType: ContactsFilterType): string | null {
  if (filterType !== 'created_in_last_n_days') return null
  if (inputValue === '') return null

  const parsed = Number(inputValue)
  if (isNaN(parsed)) return 'Please enter a valid number'
  if (!Number.isInteger(parsed)) return 'Must be a whole number (no decimals)'
  if (parsed < 1) return 'Must be at least 1 day'
  if (parsed > 365) return 'Must be 365 days or fewer'

  return null
}
