// Feature: field-mapping-source-panel, Property 2: Active Sources Disabled in Modal
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { AddSourceModal } from '../AddSourceModal';
import type {
  EnrichmentConfig,
  MessageEnrichmentOptions,
  TransactionEnrichmentOptions,
  Channel,
  JoinStrategy,
} from '../../../models/source-selection';
import { enrichmentKey } from '../../../models/source-selection';
import { transactionalDatabases } from '../../../data/transactionalData';

/**
 * Property 2: Active Sources Disabled in Modal
 *
 * For any set of currently active enrichments passed to the Add Source Modal,
 * every source whose enrichment config is present in the active set SHALL render
 * as a checked and disabled checkbox in the modal.
 *
 * **Validates: Requirements 3.3**
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

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
 * Generates a non-empty set of active enrichments (at least one source active).
 * This is the interesting case for this property — when sources are active, they
 * should appear as checked + disabled.
 */
const activeEnrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(messagesEnrichmentArb, transactionEnrichmentsArb)
  .map(([msgs, txns]) => [...msgs, ...txns])
  .filter((arr) => arr.length > 0);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps an enrichment config to the expected checkbox element ID in the modal.
 * The AddSourceModal uses:
 * - id="source-messages" for messages enrichment
 * - id="source-{tableId}" for transaction enrichments
 */
function getCheckboxId(config: EnrichmentConfig): string {
  switch (config.entity) {
    case 'messages':
      return 'source-messages';
    case 'transactions':
      return `source-${config.tableId}`;
    default:
      return '';
  }
}

// ─── Property Test ───────────────────────────────────────────────────────────

describe('Feature: field-mapping-source-panel, Property 2: Active Sources Disabled in Modal', () => {
  beforeAll(() => {
    // Radix Dialog uses ResizeObserver internally
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('every active source renders as a checked and disabled checkbox', () => {
    fc.assert(
      fc.property(activeEnrichmentsArb, (activeEnrichments) => {
        const { baseElement, unmount } = render(
          <AddSourceModal
            open={true}
            onOpenChange={() => {}}
            activeEnrichments={activeEnrichments}
            onConfirm={() => {}}
          />,
        );

        // Radix Dialog renders content in a portal, query the full document
        for (const enrichment of activeEnrichments) {
          const checkboxId = getCheckboxId(enrichment);
          const checkbox = document.getElementById(checkboxId);

          // The checkbox element must exist
          expect(checkbox, `Checkbox with id="${checkboxId}" should exist`).not.toBeNull();

          // Radix Checkbox renders data-state="checked" when checked
          expect(
            checkbox!.getAttribute('data-state'),
            `Checkbox "${checkboxId}" should have data-state="checked"`,
          ).toBe('checked');

          // Radix Checkbox renders data-disabled="" attribute when disabled
          expect(
            checkbox!.hasAttribute('data-disabled'),
            `Checkbox "${checkboxId}" should have data-disabled attribute`,
          ).toBe(true);

          // Also verify the disabled HTML attribute is set
          expect(
            checkbox!.hasAttribute('disabled'),
            `Checkbox "${checkboxId}" should have disabled attribute`,
          ).toBe(true);
        }

        unmount();
        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
