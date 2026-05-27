import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PrimarySourceType,
  TransactionEnrichmentOptions,
  JoinStrategy,
} from '@/models/source-selection'
import { Warning } from '@phosphor-icons/react'

// Types

interface TransactionEnrichmentConfigProps {
  config: TransactionEnrichmentOptions
  primarySource: PrimarySourceType
  onChange: (config: TransactionEnrichmentOptions) => void
}

// Mock data

const MOCK_TRANSACTION_TABLES = [
  { id: 'tbl-purchases', name: 'Purchases' },
  { id: 'tbl-bookings', name: 'Bookings' },
  { id: 'tbl-subscriptions', name: 'Subscriptions' },
]

// Component

export function TransactionEnrichmentConfig({
  config,
  primarySource,
  onChange,
}: TransactionEnrichmentConfigProps) {
  // For Messages → Transactions enrichment, join strategy is fixed to most_recent (Req 6.5)
  const showJoinStrategy = primarySource !== 'messages'

  function handleTableChange(tableId: string) {
    onChange({ ...config, tableId })
  }

  function handleJoinStrategyChange(strategy: JoinStrategy) {
    onChange({ ...config, joinStrategy: strategy })
  }

  return (
    <div className="flex flex-col gap-3 pl-3 border-l-2 border-primary/20">
      {/* Table selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Transaction table
        </label>
        <Select value={config.tableId} onValueChange={handleTableChange}>
          <SelectTrigger className="max-w-[280px]">
            <SelectValue placeholder="Select a table..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_TRANSACTION_TABLES.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Join strategy selector */}
      {showJoinStrategy && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Join strategy
          </label>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Join strategy">
            <button
              type="button"
              role="radio"
              aria-checked={config.joinStrategy === 'most_recent'}
              onClick={() => handleJoinStrategyChange('most_recent')}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                config.joinStrategy === 'most_recent'
                  ? 'border-primary bg-accent'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent/25'
              )}
            >
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                  config.joinStrategy === 'most_recent' ? 'border-primary' : 'border-muted-foreground'
                )}
              >
                {config.joinStrategy === 'most_recent' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-medium text-foreground">Most recent record</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={config.joinStrategy === 'all_records'}
              onClick={() => handleJoinStrategyChange('all_records')}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                config.joinStrategy === 'all_records'
                  ? 'border-primary bg-accent'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent/25'
              )}
            >
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                  config.joinStrategy === 'all_records' ? 'border-primary' : 'border-muted-foreground'
                )}
              >
                {config.joinStrategy === 'all_records' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-medium text-foreground">All records</span>
            </button>
          </div>

          {/* Fan-out warning */}
          {config.joinStrategy === 'all_records' && (
            <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded px-2 py-1.5 m-0 flex items-start gap-1.5 max-w-[320px]">
              <Warning size={14} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                This may produce multiple output rows per primary record (fan-out).
              </span>
            </p>
          )}
        </div>
      )}

      {/* Fixed strategy note for Messages → Transactions */}
      {!showJoinStrategy && (
        <p className="text-xs text-muted-foreground m-0">
          Join strategy: Most recent record (fixed for this combination)
        </p>
      )}
    </div>
  )
}
