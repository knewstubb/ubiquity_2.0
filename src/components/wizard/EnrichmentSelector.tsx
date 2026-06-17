import { useCallback } from 'react';
import { cn } from '../../lib/utils';
import { getAvailableEnrichments, createDefaultEnrichmentConfig } from '../../utils/source-config-utils';
import type { PrimarySourceType, EnrichmentConfig, EnrichmentEntity } from '../../models/source-selection';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EnrichmentSelectorProps {
  primarySource: PrimarySourceType;
  currentEnrichment: EnrichmentConfig | null;
  onEnrichmentChange: (enrichment: EnrichmentConfig | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEntityLabel(entity: EnrichmentEntity): string {
  return entity.charAt(0).toUpperCase() + entity.slice(1);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EnrichmentSelector({
  primarySource,
  currentEnrichment,
  onEnrichmentChange,
}: EnrichmentSelectorProps) {
  // Derived
  const availableEntities = getAvailableEnrichments(primarySource);

  // Handlers
  const handleChipClick = useCallback(
    (entity: EnrichmentEntity) => {
      if (currentEnrichment?.entity === entity) {
        onEnrichmentChange(null);
      } else {
        onEnrichmentChange(createDefaultEnrichmentConfig(entity));
      }
    },
    [currentEnrichment, onEnrichmentChange],
  );

  // Render
  return (
    <div
      className="flex items-center gap-2"
      data-testid="enrichment-selector"
    >
      <span className="text-xs font-medium text-muted-foreground shrink-0">
        Enrich with:
      </span>
      {availableEntities.map((entity) => {
        const isActive = currentEnrichment?.entity === entity;

        return (
          <button
            key={entity}
            type="button"
            onClick={() => handleChipClick(entity)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-transparent text-foreground hover:bg-muted',
            )}
            aria-pressed={isActive}
            data-testid={`enrichment-chip-${entity}`}
          >
            {formatEntityLabel(entity)}
          </button>
        );
      })}
    </div>
  );
}
