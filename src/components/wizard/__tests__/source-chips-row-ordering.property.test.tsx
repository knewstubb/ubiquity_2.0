// Feature: field-mapping-source-panel, Property 1: Chip Row Ordering Invariant
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { SourceChipsRow } from '../SourceChipsRow';
import type {
  EnrichmentConfig,
  Channel,
  JoinStrategy,
  MessageEnrichmentOptions,
  TransactionEnrichmentOptions,
} from '../../../models/source-selection';
import { transactionalDatabases } from '../../../data/transactionalData';

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_TABLE_IDS = transactionalDatabases.map((t) => t.id);

// ─── Generators ──────────────────────────────────────────────────────────────

const channelArb = fc.constantFrom<Channel>('email', 'sms', 'push');
const joinStrategyArb = fc.constantFrom<JoinStrategy>('most_recent', 'all_records');

/**
 * Generates 0 or 1 messages enrichment configs.
 */
const messagesEnrichmentArb: fc.Arbitrary<MessageEnrichmentOptions[]> = fc.oneof(
  fc.constant([] as MessageEnrichmentOptions[]),
  fc.tuple(
    channelArb,
    fc.constantFrom<Array<'delivered' | 'bounced' | 'failed' | 'opened'>>(
      ['delivered'],
      ['bounced', 'failed'],
      ['delivered', 'opened'],
    ),
  ).map(([channel, statuses]): MessageEnrichmentOptions[] => [{
    entity: 'messages',
    channel,
    statuses,
  }]),
);

/**
 * Generates 0-N transaction enrichment configs with unique tableIds
 * drawn from actual transactionalDatabases data.
 */
const transactionEnrichmentsArb: fc.Arbitrary<TransactionEnrichmentOptions[]> = fc
  .subarray(AVAILABLE_TABLE_IDS, { minLength: 0, maxLength: AVAILABLE_TABLE_IDS.length })
  .chain((tableIds) =>
    fc.tuple(
      fc.constant(tableIds),
      fc.array(joinStrategyArb, { minLength: tableIds.length, maxLength: tableIds.length }),
    ),
  )
  .map(([tableIds, strategies]) =>
    tableIds.map((tableId, i): TransactionEnrichmentOptions => ({
      entity: 'transactions',
      tableId,
      joinStrategy: strategies[i],
    })),
  );

/**
 * Generates a valid enrichments array: 0-1 messages + 0-N transactions.
 */
const enrichmentsArb: fc.Arbitrary<EnrichmentConfig[]> = fc
  .tuple(messagesEnrichmentArb, transactionEnrichmentsArb)
  .map(([msgs, txns]) => [...msgs, ...txns]);

// ─── Helper: derive expected label for an enrichment ─────────────────────────

function getExpectedLabel(config: EnrichmentConfig): string {
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

// ─── Property Tests ──────────────────────────────────────────────────────────

/**
 * Property 1: Chip Row Ordering Invariant
 *
 * For any array of enrichments (0 to N items), the Source Chips Row SHALL render
 * enrichment chips in array order. The total rendered element count SHALL equal
 * `enrichments.length` (one chip per enrichment).
 *
 * **Validates: Requirements 1.2, 1.4, 1.5**
 */
describe('Feature: field-mapping-source-panel, Property 1: Chip Row Ordering Invariant', () => {
  it('rendered element count equals enrichments.length', () => {
    fc.assert(
      fc.property(enrichmentsArb, (enrichments) => {
        const { container, unmount } = render(
          <SourceChipsRow
            primarySource="contacts"
            enrichments={enrichments}
            onRemoveEnrichment={() => {}}
          />,
        );

        const row = container.querySelector('[data-testid="source-chips-row"]')!;
        const children = Array.from(row.children);

        expect(children.length).toBe(enrichments.length);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('order matches enrichments in array order', () => {
    fc.assert(
      fc.property(enrichmentsArb.filter((e) => e.length > 0), (enrichments) => {
        const { container, unmount } = render(
          <SourceChipsRow
            primarySource="contacts"
            enrichments={enrichments}
            onRemoveEnrichment={() => {}}
          />,
        );

        const row = container.querySelector('[data-testid="source-chips-row"]')!;
        const children = Array.from(row.children);

        // Each element should be an enrichment chip in array order
        for (let i = 0; i < enrichments.length; i++) {
          const expectedLabel = getExpectedLabel(enrichments[i]);
          expect(children[i].textContent).toContain(expectedLabel);
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('each enrichment chip has a dismiss button', () => {
    fc.assert(
      fc.property(
        enrichmentsArb.filter((e) => e.length > 0),
        (enrichments) => {
          const { container, unmount } = render(
            <SourceChipsRow
              primarySource="contacts"
              enrichments={enrichments}
              onRemoveEnrichment={() => {}}
            />,
          );

          const row = container.querySelector('[data-testid="source-chips-row"]')!;
          const children = Array.from(row.children);

          // Each enrichment chip should have a dismiss button
          for (let i = 0; i < enrichments.length; i++) {
            const dismissBtn = children[i].querySelector('button[aria-label^="Remove"]');
            expect(dismissBtn).not.toBeNull();
          }

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
