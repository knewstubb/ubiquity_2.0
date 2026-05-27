import { Users, Receipt, ChatCircle, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { CardSelector } from '@/components/composed/card-selector'
import { getAvailableEnrichments } from '@/utils/source-config-utils'
import type {
  PrimarySourceType,
  EnrichmentEntity,
  EnrichmentConfig,
} from '@/models/source-selection'
import { TransactionEnrichmentConfig } from './TransactionEnrichmentConfig'
import { MessageEnrichmentConfig } from './MessageEnrichmentConfig'
import { ContactEnrichmentConfig } from './ContactEnrichmentConfig'

// Types

interface EnrichmentSectionProps {
  primarySource: PrimarySourceType
  config: EnrichmentConfig | null
  onChange: (config: EnrichmentConfig | null) => void
}

interface EnrichmentOption {
  entity: EnrichmentEntity
  label: string
  icon: React.ReactNode
}

// Constants

const ENRICHMENT_META: Record<EnrichmentEntity, { label: string; icon: React.ReactNode }> = {
  contacts: { label: 'Contacts', icon: <Users weight="duotone" /> },
  transactions: { label: 'Transactions', icon: <Receipt weight="duotone" /> },
  messages: { label: 'Messages', icon: <ChatCircle weight="duotone" /> },
}

// Component

export function EnrichmentSection({ primarySource, config, onChange }: EnrichmentSectionProps) {
  // Derived
  const availableEntities = getAvailableEnrichments(primarySource)
  const options: EnrichmentOption[] = availableEntities.map((entity) => ({
    entity,
    ...ENRICHMENT_META[entity],
  }))

  // Handlers

  function handleSelectEnrichment(entity: EnrichmentEntity) {
    switch (entity) {
      case 'contacts':
        onChange({ entity: 'contacts' })
        break
      case 'transactions':
        onChange({ entity: 'transactions', tableId: '', joinStrategy: 'most_recent' })
        break
      case 'messages':
        onChange({ entity: 'messages', channel: '' as never, statuses: [] })
        break
    }
  }

  function handleRemoveEnrichment() {
    onChange(null)
  }

  // Render

  return (
    <div className="flex flex-col gap-3">
      {/* Enrichment option cards — show only when no enrichment is selected */}
      {config === null && (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Enrichment options">
          {options.map((option) => (
            <CardSelector
              key={option.entity}
              icon={option.icon}
              label={option.label}
              selected={false}
              onClick={() => handleSelectEnrichment(option.entity)}
            />
          ))}
        </div>
      )}

      {/* Inline config for selected enrichment */}
      {config !== null && (
        <div className="flex flex-col gap-3">
          {/* Selected enrichment header with remove action */}
          <div className="flex items-center justify-between rounded-md border border-primary bg-accent px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center [&_svg]:size-5 text-primary">
                {ENRICHMENT_META[config.entity].icon}
              </span>
              <span className="text-sm font-semibold text-primary">
                {ENRICHMENT_META[config.entity].label}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveEnrichment}
              className={cn(
                'flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer',
                'hover:text-destructive transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
              )}
              aria-label="Remove enrichment"
            >
              <X size={14} weight="bold" />
              Remove
            </button>
          </div>

          {/* Enrichment-specific config */}
          {config.entity === 'transactions' && (
            <TransactionEnrichmentConfig
              config={config}
              primarySource={primarySource}
              onChange={(updated) => onChange(updated)}
            />
          )}
          {config.entity === 'messages' && (
            <MessageEnrichmentConfig
              config={config}
              onChange={(updated) => onChange(updated)}
            />
          )}
          {config.entity === 'contacts' && (
            <ContactEnrichmentConfig />
          )}
        </div>
      )}
    </div>
  )
}
