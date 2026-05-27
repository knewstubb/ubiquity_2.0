import { useState } from 'react'
import { Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
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
}

// Mock data

const SEGMENT_OPTIONS = [
  { value: 'seg-gold-members', label: 'Gold Members' },
  { value: 'seg-newsletter', label: 'Newsletter Subscribers' },
  { value: 'seg-vip', label: 'VIP Customers' },
  { value: 'seg-inactive', label: 'Inactive 90 Days' },
  { value: 'seg-high-value', label: 'High Value Purchasers' },
]

const CAMPAIGN_OPTIONS = [
  { value: 'camp-summer-2024', label: 'Summer Sale 2024' },
  { value: 'camp-welcome', label: 'Welcome Series' },
  { value: 'camp-reengagement', label: 'Re-engagement Q1' },
  { value: 'camp-black-friday', label: 'Black Friday 2024' },
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
  const [daysInputValue, setDaysInputValue] = useState(
    config.days !== undefined ? String(config.days) : ''
  )

  // Derived
  const daysError = getDaysError(daysInputValue, config.type)

  // Handlers

  function handleFilterTypeChange(type: ContactsFilterType) {
    const newConfig: ContactsFilterConfig = { type }

    if (type === 'created_in_last_n_days' && config.days !== undefined) {
      newConfig.days = config.days
    }
    if (type === 'in_list_segment' && config.segmentId !== undefined) {
      newConfig.segmentId = config.segmentId
    }
    if (type === 'not_sent_campaign' && config.campaignId !== undefined) {
      newConfig.campaignId = config.campaignId
    }

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

    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 365) {
      onChange({ ...config, days: parsed })
    } else {
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

          {/* Secondary input in grey box — rendered directly below the selected card */}
          {config.type === option.id && option.id === 'created_in_last_n_days' && (
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3 flex flex-col gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                step={1}
                value={daysInputValue}
                onChange={(e) => handleDaysChange(e.target.value)}
                placeholder="Number of days (1–365)"
                aria-invalid={!!daysError}
                aria-describedby={daysError ? 'days-error' : undefined}
                className="max-w-[160px]"
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
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3">
              <Combobox
                value={config.segmentId ?? ''}
                onValueChange={handleSegmentChange}
                options={SEGMENT_OPTIONS}
                placeholder="Search segments..."
                searchPlaceholder="Search segments..."
              />
            </div>
          )}

          {config.type === option.id && option.id === 'not_sent_campaign' && (
            <div className="mt-2 mb-1 rounded-lg bg-muted p-3 flex flex-col gap-2">
              <Combobox
                value={config.campaignId ?? ''}
                onValueChange={handleCampaignChange}
                options={CAMPAIGN_OPTIONS}
                placeholder="Choose a campaign..."
                searchPlaceholder="Search campaigns..."
              />
              <p className="text-xs text-muted-foreground m-0">
                <span className="font-medium">Cross-entity filter:</span> This filters contacts based on campaign send history.
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
