import { useState } from 'react'
import { Warning } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { RadioCard } from '@/components/composed/radio-card'
import type { ContactsFilterConfig, ContactsFilterType } from '@/models/source-selection'

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
        <RadioCard
          key={option.id}
          selected={config.type === option.id}
          onSelect={() => handleFilterTypeChange(option.id)}
          label={option.label}
        >
          {option.id === 'created_in_last_n_days' && (
            <div className="flex flex-col gap-2">
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

          {option.id === 'in_list_segment' && (
            <Combobox
              value={config.segmentId ?? ''}
              onValueChange={handleSegmentChange}
              options={SEGMENT_OPTIONS}
              placeholder="Search segments..."
              searchPlaceholder="Search segments..."
            />
          )}

          {option.id === 'not_sent_campaign' && (
            <div className="flex flex-col gap-2">
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
        </RadioCard>
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
