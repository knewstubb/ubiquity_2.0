import type { ExporterWizardDraft } from '../../models/wizard'
import type {
  PrimarySourceType,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  ContactsFilterConfig,
  TransactionsFilterConfig,
  MessagesFilterConfig,
  EnrichmentConfig,
  Channel,
} from '../../models/source-selection'
import { isFilterComplete } from '../../utils/source-selection-validation'
import { resetDownstreamOnSourceChange } from '../../utils/source-config-utils'
import { useMatchCount } from '../../hooks/useMatchCount'
import { PrimarySourceSelector } from './source-selection/PrimarySourceSelector'
import { SubSourceSelector } from './source-selection/SubSourceSelector'
import { ContactsFilterPanel } from './source-selection/ContactsFilterPanel'
import { TransactionsFilterPanel } from './source-selection/TransactionsFilterPanel'
import { MessagesFilterPanel } from './source-selection/MessagesFilterPanel'
import { MatchCountIndicator } from './source-selection/MatchCountIndicator'
import { EnrichmentSection } from './source-selection/EnrichmentSection'

// Types

interface SourceSelectionStepProps {
  draft: ExporterWizardDraft
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void
}

// Available channels for Messages path (all three in prototype)
const AVAILABLE_CHANNELS: Channel[] = ['email', 'sms', 'push']

// Component

export function SourceSelectionStep({ draft, onUpdate }: SourceSelectionStepProps) {
  const sourceConfig = draft.sourceConfig

  // Wire match count hook to current source config
  const { count, loading, error, retry } = useMatchCount(sourceConfig)

  // ─── Beat visibility logic ───────────────────────────────────────────────────

  const beat1Complete = sourceConfig !== null

  const beat2Complete =
    sourceConfig !== null &&
    (sourceConfig.primarySource === 'contacts' ||
      (sourceConfig.primarySource === 'transactions' && sourceConfig.tableId.length > 0) ||
      (sourceConfig.primarySource === 'messages' && sourceConfig.channels.length > 0))

  const beat3Complete = sourceConfig !== null && isFilterComplete(sourceConfig)

  // ─── Derived values ──────────────────────────────────────────────────────────

  const hasDownstreamConfig =
    sourceConfig !== null &&
    (sourceConfig.primarySource !== 'contacts' ||
      sourceConfig.filter.type !== 'all' ||
      sourceConfig.enrichment !== null)

  const entityLabel = sourceConfig?.primarySource ?? 'records'

  // Filter section label
  const filterLabel = sourceConfig
    ? sourceConfig.primarySource === 'contacts'
      ? 'Filter Contacts'
      : sourceConfig.primarySource === 'transactions'
        ? 'Filter Records'
        : 'Filter Messages'
    : 'Filter'

  const filterDescription = sourceConfig
    ? sourceConfig.primarySource === 'contacts'
      ? 'Choose which contacts to include in this export.'
      : sourceConfig.primarySource === 'transactions'
        ? 'Choose which records to include in this export.'
        : 'Choose which messages to include in this export.'
    : ''

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handlePrimarySourceChange(type: PrimarySourceType) {
    if (sourceConfig && sourceConfig.primarySource === type) return

    const newConfig = sourceConfig
      ? resetDownstreamOnSourceChange(sourceConfig, type)
      : resetDownstreamOnSourceChange(
          { primarySource: 'contacts', filter: { type: 'all' }, enrichment: null },
          type
        )

    onUpdate({ sourceConfig: newConfig })
  }

  function handleTableChange(tableId: string) {
    if (!sourceConfig || sourceConfig.primarySource !== 'transactions') return
    onUpdate({
      sourceConfig: { ...sourceConfig, tableId },
    })
  }

  function handleChannelChange(channel: Channel) {
    if (!sourceConfig || sourceConfig.primarySource !== 'messages') return
    const current = (sourceConfig as MessagesSourceConfig).channels
    const updated = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel]
    onUpdate({
      sourceConfig: { ...sourceConfig, channels: updated },
    })
  }

  function handleContactsFilterChange(filter: ContactsFilterConfig) {
    if (!sourceConfig || sourceConfig.primarySource !== 'contacts') return
    onUpdate({
      sourceConfig: { ...sourceConfig, filter },
    })
  }

  function handleTransactionsFilterChange(filter: TransactionsFilterConfig) {
    if (!sourceConfig || sourceConfig.primarySource !== 'transactions') return
    onUpdate({
      sourceConfig: { ...sourceConfig, filter },
    })
  }

  function handleMessagesFilterChange(filter: MessagesFilterConfig) {
    if (!sourceConfig || sourceConfig.primarySource !== 'messages') return
    onUpdate({
      sourceConfig: { ...sourceConfig, filter },
    })
  }

  function handleEnrichmentChange(enrichment: EnrichmentConfig | null) {
    if (!sourceConfig) return
    onUpdate({
      sourceConfig: { ...sourceConfig, enrichment },
    })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">
      {/* Beat 1: Primary Source Type — always visible */}
      <div className="flex items-start gap-10 pb-8 border-b border-border">
        <div className="w-40 shrink-0 pt-0">
          <p className="text-sm font-semibold text-foreground m-0">Primary Source</p>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Choose the primary source that determines what each row represents.
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <PrimarySourceSelector
            selected={sourceConfig?.primarySource ?? null}
            onChange={handlePrimarySourceChange}
            hasDownstreamConfig={hasDownstreamConfig}
          />
        </div>
      </div>

      {/* Beat 2: Sub-Source — visible when Beat 1 is complete */}
      {beat1Complete && sourceConfig!.primarySource !== 'contacts' && (
        <div className="flex items-start gap-10 pb-8 border-b border-border">
          <div className="w-40 shrink-0 pt-0">
            <p className="text-sm font-semibold text-foreground m-0">
              {sourceConfig!.primarySource === 'transactions' ? 'Transaction Table' : 'Channels'}
            </p>
            <p className="text-xs text-tertiary-foreground mt-1 mb-0">
              {sourceConfig!.primarySource === 'transactions'
                ? 'Choose which transaction table to export from.'
                : 'Select which messaging channels to include.'}
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <SubSourceSelector
              primarySource={sourceConfig!.primarySource}
              selectedTableId={
                sourceConfig!.primarySource === 'transactions'
                  ? (sourceConfig as TransactionsSourceConfig).tableId
                  : undefined
              }
              selectedChannels={
                sourceConfig!.primarySource === 'messages'
                  ? (sourceConfig as MessagesSourceConfig).channels
                  : undefined
              }
              onTableChange={handleTableChange}
              onChannelChange={handleChannelChange}
              availableChannels={AVAILABLE_CHANNELS}
            />
          </div>
        </div>
      )}

      {/* Beat 3: Record Filter — visible when Beat 2 is complete */}
      {beat2Complete && (
        <div className="flex items-start gap-10 pb-8 border-b border-border">
          <div className="w-40 shrink-0 pt-0">
            <p className="text-sm font-semibold text-foreground m-0">{filterLabel}</p>
            <p className="text-xs text-tertiary-foreground mt-1 mb-0">{filterDescription}</p>
          </div>
          <div className="flex-1 min-w-0">
            {sourceConfig!.primarySource === 'contacts' && (
              <ContactsFilterPanel
                config={(sourceConfig as ContactsSourceConfig).filter}
                onChange={handleContactsFilterChange}
              />
            )}

            {sourceConfig!.primarySource === 'transactions' && (
              <TransactionsFilterPanel
                config={(sourceConfig as TransactionsSourceConfig).filter}
                onChange={handleTransactionsFilterChange}
                tableFields={[]}
              />
            )}

            {sourceConfig!.primarySource === 'messages' && (
              <MessagesFilterPanel
                config={(sourceConfig as MessagesSourceConfig).filter}
                onChange={handleMessagesFilterChange}
                channel={(sourceConfig as MessagesSourceConfig).channels[0]}
              />
            )}
          </div>
        </div>
      )}

      {/* Match Count — always visible once filter section shows */}
      {beat2Complete && (
        <div className="flex items-start gap-10">
          <div className="w-40 shrink-0" />
          <div className="flex-1 min-w-0">
            <MatchCountIndicator
              count={count}
              loading={loading}
              error={error}
              onRetry={retry}
              entityLabel={entityLabel}
              pending={!beat3Complete}
            />
          </div>
        </div>
      )}

      {/* Beat 4: Enrichment — visible when Beat 3 is complete */}
      {beat3Complete && (
        <div className="flex items-start gap-10">
          <div className="w-40 shrink-0 pt-0">
            <p className="text-sm font-semibold text-foreground m-0">Add Context</p>
            <p className="text-xs text-tertiary-foreground mt-1 mb-0">
              Enrich your export with columns from related entities.
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <EnrichmentSection
              primarySource={sourceConfig!.primarySource}
              config={sourceConfig!.enrichment}
              onChange={handleEnrichmentChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}
