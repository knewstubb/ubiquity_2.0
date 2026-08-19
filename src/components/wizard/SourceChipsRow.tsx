import { Chip } from '../molecules/chip';
import { transactionalDatabases } from '../../data/transactionalData';
import type { PrimarySourceType, EnrichmentConfig } from '../../models/source-selection';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SourceChipsRowProps {
  primarySource: PrimarySourceType;
  enrichments: EnrichmentConfig[];
  onRemoveEnrichment: (index: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEnrichmentLabel(config: EnrichmentConfig): string {
  switch (config.entity) {
    case 'messages':
      return 'Mailout';
    case 'transactions': {
      const table = transactionalDatabases.find((t) => t.id === config.tableId);
      return table?.name ?? config.tableId;
    }
    case 'contacts':
      return 'Contacts';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SourceChipsRow({
  primarySource,
  enrichments,
  onRemoveEnrichment,
}: SourceChipsRowProps) {
  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      data-testid="source-chips-row"
    >
      {/* Removable chip for each enrichment */}
      {enrichments.map((enrichment, index) => {
        const label = getEnrichmentLabel(enrichment);
        return (
          <Chip
            key={`${enrichment.entity}-${index}`}
            label={label}
            variant="default"
            size="sm"
            onDismiss={() => onRemoveEnrichment(index)}
          />
        );
      })}
    </div>
  );
}

export type { SourceChipsRowProps };
