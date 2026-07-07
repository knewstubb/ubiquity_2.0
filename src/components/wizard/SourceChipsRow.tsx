import { Plus } from '@phosphor-icons/react';
import { Chip } from '../composed/chip';
import { Button } from '../ui/button';
import { transactionalDatabases } from '../../data/transactionalData';
import type { PrimarySourceType, EnrichmentConfig } from '../../models/source-selection';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SourceChipsRowProps {
  primarySource: PrimarySourceType;
  enrichments: EnrichmentConfig[];
  onRemoveEnrichment: (index: number) => void;
  onOpenAddModal: () => void;
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
  onOpenAddModal,
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

      {/* Add source button */}
      <Button
        type="button"
        variant="secondaryOutline"
        size="xs"
        onClick={onOpenAddModal}
        data-testid="add-source-button"
      >
        <Plus size={14} weight="bold" />
        Add source
      </Button>
    </div>
  );
}

export type { SourceChipsRowProps };
