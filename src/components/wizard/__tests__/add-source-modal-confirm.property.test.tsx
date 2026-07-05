// Feature: field-mapping-source-panel, Property 3: Confirm Adds Source Chips
// Feature: field-mapping-source-panel, Property 5: Cancel Preserves State
import { describe, it, expect, beforeAll, vi } from 'vitest';
import fc from 'fast-check';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { AddSourceModal } from '../AddSourceModal';
import type {
  EnrichmentConfig,
  MessageEnrichmentOptions,
  TransactionEnrichmentOptions,
  Channel,
  JoinStrategy,
} from '../../../models/source-selection';
import { transactionalDatabases } from '../../../data/transactionalData';

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

/**
 * All possible source keys that can be selected in the modal:
 * "messages" and "txn:{tableId}" for each transaction database.
 */
const ALL_SOURCE_KEYS = ['messages', ...AVAILABLE_TABLE_IDS.map((id) => `txn:${id}`)];

// ─── Generators ──────────────────────────────────────────────────────────────

const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const joinStrategyArb = fc.constantFrom<JoinStrategy>('most_recent', 'all_records');

/**
 * Generates 0 or 1 messages enrichment config.
 */
const messagesEnrichmentArb: fc.Arbitrary<MessageEnrichmentOptions[]> = fc.oneof(
  fc.constant([] as MessageEnrichmentOptions[]),
  fc.tuple(channelArb, fc.constantFrom<Array<'delivered' | 'bounced' | 'failed' | 'opened'>>(
    ['delivered'], ['bounced', 'failed'], ['delivered', 'opened'],
  )).map(([channel, statuses]): MessageEnrichmentOptions[] => [{
    entity: 'messages',
    channel,
    statuses,
  }]),
);

/**
 * Generates 0-N transaction enrichment configs with unique table IDs.
 */
const transactionEnrichmentsArb: fc.Arbitrary<TransactionEnrichmentOptions[]> = fc
  .subarray(AVAILABLE_TABLE_IDS, { minLength: 0, maxLength: AVAILABLE_TABLE_IDS.length })
  .chain((tableIds) =>
    fc.tuple(
      fc.constant(tableIds),
      fc.array(joinStrategyArb, { minLength: tableIds.length, maxLength: tableIds.length }),
    )
  )
  .map(([tableIds, strategies]) =>
    tableIds.map((tableId, i): TransactionEnrichmentOptions => ({
      entity: 'transactions',
      tableId,
      joinStrategy: strategies[i],
    }))
  );

/**
 * Generates a set of active enrichments (can be empty).
 */
const activeEnrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(messagesEnrichmentArb, transactionEnrichmentsArb)
  .map(([msgs, txns]) => [...msgs, ...txns]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the checkbox element ID for a given source key.
 */
function getCheckboxIdForKey(key: string): string {
  if (key === 'messages') return 'source-messages';
  if (key.startsWith('txn:')) return `source-${key.slice(4)}`;
  return '';
}

/**
 * Returns all available source keys that are NOT already in the active set.
 */
function getAvailableKeys(activeEnrichments: EnrichmentConfig[]): string[] {
  const activeKeys = new Set<string>();
  for (const e of activeEnrichments) {
    if (e.entity === 'messages') activeKeys.add('messages');
    if (e.entity === 'transactions') activeKeys.add(`txn:${e.tableId}`);
  }
  return ALL_SOURCE_KEYS.filter((k) => !activeKeys.has(k));
}

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Feature: field-mapping-source-panel, Property 3: Confirm Adds Source Chips', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Property 3: Confirm Adds Source Chips
   *
   * For any subset of available sources selected (checked) in the Add Source Modal,
   * clicking the confirmation button SHALL result in `onConfirm` being called with
   * exactly the count of newly selected sources.
   *
   * **Validates: Requirements 4.1**
   */
  it('onConfirm is called with exactly the count of newly selected sources', () => {
    // Generate: random active enrichments + random non-empty subset of remaining available sources
    const testArb = activeEnrichmentsArb.chain((active) => {
      const available = getAvailableKeys(active);
      if (available.length === 0) {
        // All sources already active — skip this case by returning empty subset
        return fc.constant({ active, toSelect: [] as string[] });
      }
      return fc
        .subarray(available, { minLength: 1, maxLength: available.length })
        .map((toSelect) => ({ active, toSelect }));
    }).filter((x) => x.toSelect.length > 0);

    fc.assert(
      fc.property(testArb, ({ active, toSelect }) => {
        const onConfirm = vi.fn();
        const onOpenChange = vi.fn();

        render(
          <AddSourceModal
            open={true}
            onOpenChange={onOpenChange}
            activeEnrichments={active}
            onConfirm={onConfirm}
          />,
        );

        // Check each source we want to select
        for (const key of toSelect) {
          const checkboxId = getCheckboxIdForKey(key);
          const checkbox = document.getElementById(checkboxId);
          expect(checkbox, `Checkbox "${checkboxId}" should exist`).not.toBeNull();
          fireEvent.click(checkbox!);
        }

        // Click the Done button
        const doneButton = document.querySelector('button:not([disabled])');
        // Find the Done button by text content
        const buttons = Array.from(document.querySelectorAll('button'));
        const doneBtn = buttons.find((btn) => btn.textContent?.trim() === 'Done');
        expect(doneBtn, 'Done button should exist').not.toBeNull();
        expect(doneBtn!.hasAttribute('disabled')).toBe(false);
        fireEvent.click(doneBtn!);

        // Assert onConfirm was called with exactly the right count
        expect(onConfirm).toHaveBeenCalledTimes(1);
        const confirmedEnrichments = onConfirm.mock.calls[0][0] as EnrichmentConfig[];
        expect(confirmedEnrichments.length).toBe(toSelect.length);

        // Verify each confirmed enrichment matches the expected entity type
        for (const key of toSelect) {
          if (key === 'messages') {
            expect(
              confirmedEnrichments.some((e) => e.entity === 'messages'),
              'Should include messages enrichment',
            ).toBe(true);
          } else if (key.startsWith('txn:')) {
            const tableId = key.slice(4);
            expect(
              confirmedEnrichments.some(
                (e) => e.entity === 'transactions' && (e as TransactionEnrichmentOptions).tableId === tableId,
              ),
              `Should include transaction enrichment for ${tableId}`,
            ).toBe(true);
          }
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Feature: field-mapping-source-panel, Property 5: Cancel Preserves State', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Property 5: Cancel Preserves State
   *
   * For any pending checkbox state in the Add Source Modal, closing the modal via
   * cancel SHALL leave the state unchanged — `onConfirm` is never called.
   *
   * **Validates: Requirements 4.4**
   */
  it('cancel discards pending selections and onConfirm is never called', () => {
    // Generate: random active enrichments + random subset of available sources to check (pending)
    const testArb = activeEnrichmentsArb.chain((active) => {
      const available = getAvailableKeys(active);
      if (available.length === 0) {
        return fc.constant({ active, pendingKeys: [] as string[] });
      }
      return fc
        .subarray(available, { minLength: 0, maxLength: available.length })
        .map((pendingKeys) => ({ active, pendingKeys }));
    });

    fc.assert(
      fc.property(testArb, ({ active, pendingKeys }) => {
        const onConfirm = vi.fn();
        const onOpenChange = vi.fn();

        render(
          <AddSourceModal
            open={true}
            onOpenChange={onOpenChange}
            activeEnrichments={active}
            onConfirm={onConfirm}
          />,
        );

        // Check some boxes to create pending state
        for (const key of pendingKeys) {
          const checkboxId = getCheckboxIdForKey(key);
          const checkbox = document.getElementById(checkboxId);
          expect(checkbox, `Checkbox "${checkboxId}" should exist`).not.toBeNull();
          fireEvent.click(checkbox!);
        }

        // Click the Cancel button
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find((btn) => btn.textContent?.trim() === 'Cancel');
        expect(cancelBtn, 'Cancel button should exist').not.toBeNull();
        fireEvent.click(cancelBtn!);

        // Assert onConfirm was NEVER called
        expect(onConfirm).not.toHaveBeenCalled();

        // Assert onOpenChange was called with false (modal closes)
        expect(onOpenChange).toHaveBeenCalledWith(false);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
