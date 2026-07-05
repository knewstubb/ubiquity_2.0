import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { SelectorCard } from '../composed/selector-card';
import { Button } from '../ui/button';
import { transactionalDatabases } from '../../data/transactionalData';
import type { EnrichmentConfig } from '../../models/source-selection';
import type { PrimarySourceType } from '../../models/source-selection';
import { enrichmentKey } from '../../models/source-selection';

// ─── Source category definitions ─────────────────────────────────────────────

interface SourceItem {
  key: string;
  label: string;
  description: string;
  fieldCount: number;
}

interface SourceCategory {
  id: string;
  label: string;
  items: SourceItem[];
  /** Only show this category when the primary source matches */
  showWhenPrimary?: PrimarySourceType[];
  /** Hide this category when primary source matches */
  hideWhenPrimary?: PrimarySourceType[];
}

function buildCategories(primarySource: PrimarySourceType): SourceCategory[] {
  const categories: SourceCategory[] = [];

  // Contacts — available when primary source is mailout (messages)
  if (primarySource === 'messages') {
    categories.push({
      id: 'contacts',
      label: 'Contacts',
      items: [
        { key: 'contacts', label: 'Contacts', description: 'Profile and attribute fields', fieldCount: 7 },
      ],
    });
  }

  // Messages — available when primary source is contacts
  if (primarySource === 'contacts') {
    categories.push({
      id: 'messages',
      label: 'Messages',
      items: [
        { key: 'messages', label: 'Messages', description: 'Email send and engagement data', fieldCount: 6 },
      ],
    });
  }

  // Transaction Databases — always available
  const txnItems: SourceItem[] = transactionalDatabases.map((table) => ({
    key: `txn:${table.id}`,
    label: table.name,
    description: 'Purchase and activity data',
    fieldCount: 6,
  }));

  if (txnItems.length > 0) {
    categories.push({
      id: 'transactions',
      label: 'Transaction Databases',
      items: txnItems,
    });
  }

  return categories;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEnrichments: EnrichmentConfig[];
  primarySource: PrimarySourceType;
  onConfirm: (newEnrichments: EnrichmentConfig[]) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddSourceModal({
  open,
  onOpenChange,
  activeEnrichments,
  primarySource,
  onConfirm,
}: AddSourceModalProps) {
  const [pendingSelections, setPendingSelections] = useState<Set<string>>(new Set());

  // Reset pending selections when modal opens
  useEffect(() => {
    if (open) {
      setPendingSelections(new Set());
    }
  }, [open]);

  // Build categories based on primary source
  const categories = useMemo(() => buildCategories(primarySource), [primarySource]);

  // Build a set of active enrichment keys for quick lookup
  const activeKeys = new Set(activeEnrichments.map(enrichmentKey));

  function isActive(key: string) {
    return activeKeys.has(key);
  }

  function isChecked(key: string) {
    return activeKeys.has(key) || pendingSelections.has(key);
  }

  function handleToggle(key: string) {
    if (activeKeys.has(key)) return;

    setPendingSelections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleDone() {
    const newEnrichments: EnrichmentConfig[] = [];

    for (const key of pendingSelections) {
      if (key === 'contacts') {
        newEnrichments.push({ entity: 'contacts' });
      } else if (key === 'messages') {
        newEnrichments.push({
          entity: 'messages',
          channel: 'email',
          statuses: ['delivered'],
        });
      } else if (key.startsWith('txn:')) {
        const tableId = key.slice(4);
        newEnrichments.push({
          entity: 'transactions',
          tableId,
          joinStrategy: 'most_recent',
        });
      }
    }

    onConfirm(newEnrichments);
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  // Compute dynamic button label
  const totalNewFields = useMemo(() => {
    let count = 0;
    for (const category of categories) {
      for (const item of category.items) {
        if (pendingSelections.has(item.key)) {
          count += item.fieldCount;
        }
      }
    }
    return count;
  }, [pendingSelections, categories]);

  const buttonLabel = pendingSelections.size === 0
    ? 'Add source'
    : `Add ${pendingSelections.size} source${pendingSelections.size > 1 ? 's' : ''} (${totalNewFields} fields)`;

  // Check if all possible sources are already active
  const allSourcesActive = categories.every((cat) =>
    cat.items.every((item) => activeKeys.has(item.key))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
          <DialogDescription className="sr-only">
            Select additional data sources to add fields from
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {allSourcesActive ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All available sources have been added.
            </p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {category.label}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <SelectorCard
                      key={item.key}
                      variant="checkbox"
                      selected={isChecked(item.key)}
                      disabled={isActive(item.key)}
                      onToggle={() => handleToggle(item.key)}
                      label={item.label}
                      description={`${item.description} · ${item.fieldCount} fields`}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondaryOutline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDone}
            disabled={pendingSelections.size === 0}
          >
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
