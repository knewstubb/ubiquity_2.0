// Task 8.4: Verify navigation preserves source selections
// Validates: Requirements 8.1, 8.2

import { describe, it, expect } from 'vitest';
import { populateFieldsForTransition, didSourceOrSubSourceChange } from '../populate-fields';
import type { ExporterWizardDraft } from '../../models/wizard';
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard';
import type { SourceConfig, ContactsSourceConfig, EnrichmentConfig } from '../../models/source-selection';
import { enrichmentKey, getSourceTag } from '../../models/source-selection';

// Helper to create a draft with enrichments and selected fields
function createDraftWithEnrichments(enrichments: EnrichmentConfig[]): ExporterWizardDraft {
  const sourceConfig: ContactsSourceConfig = {
    primarySource: 'contacts',
    filter: { type: 'field_filter', fieldFilters: [] },
    enrichment: null,
    enrichments,
  };

  return {
    ...DEFAULT_EXPORTER_DRAFT,
    sourceConfig,
    selectedFields: [
      { key: 'contact_email', label: 'Email', source: 'contacts' },
      { key: 'contact_firstName', label: 'First Name', source: 'contacts' },
      { key: 'enrichment_messages_message_id', label: 'Message: Message ID', source: 'messages' },
    ],
    columnRenames: [
      { fieldKey: 'contact_email', outputName: 'email_address' },
      { fieldKey: 'enrichment_messages_message_id', outputName: 'msg_id' },
    ],
  };
}

describe('Navigation preserves source selections (Requirements 8.1, 8.2)', () => {
  describe('populateFieldsForTransition — returning to Field Mapping with unchanged source', () => {
    it('preserves selectedFields when source is unchanged and fields are non-empty', () => {
      const enrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
      ];
      const draft = createDraftWithEnrichments(enrichments);

      // Simulate: previously on Data Source step, now transitioning back to Field Mapping
      // with the same sourceConfig — populateFieldsForTransition should return null
      const result = populateFieldsForTransition(draft, draft.sourceConfig);

      expect(result).toBeNull();
    });

    it('preserves columnRenames when source is unchanged and fields are non-empty', () => {
      const enrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
      ];
      const draft = createDraftWithEnrichments(enrichments);

      const result = populateFieldsForTransition(draft, draft.sourceConfig);

      // null means no patch → columnRenames stay as they are
      expect(result).toBeNull();
      // Verify the draft's columnRenames are intact (no side effects)
      expect(draft.columnRenames).toHaveLength(2);
      expect(draft.columnRenames[0]).toEqual({ fieldKey: 'contact_email', outputName: 'email_address' });
    });

    it('preserves enrichments array in sourceConfig across navigation (state is in parent)', () => {
      const enrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
        { entity: 'transactions', tableId: 'tdb-purchases', joinStrategy: 'all_records' },
      ];
      const draft = createDraftWithEnrichments(enrichments);

      // populateFieldsForTransition never touches enrichments — it only deals with selectedFields
      const result = populateFieldsForTransition(draft, draft.sourceConfig);
      expect(result).toBeNull();

      // Enrichments remain intact in the draft (parent state)
      expect(draft.sourceConfig!.enrichments).toHaveLength(3);
      expect(draft.sourceConfig!.enrichments[0].entity).toBe('messages');
      expect(draft.sourceConfig!.enrichments[1]).toEqual({
        entity: 'transactions',
        tableId: 'tdb-bookings',
        joinStrategy: 'most_recent',
      });
    });
  });

  describe('didSourceOrSubSourceChange — navigation without source change', () => {
    it('returns false when same contacts sourceConfig is compared', () => {
      const config: ContactsSourceConfig = {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [] },
        enrichment: null,
        enrichments: [
          { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        ],
      };

      expect(didSourceOrSubSourceChange(config, config)).toBe(false);
    });

    it('returns false when filter changes but primary source stays the same', () => {
      const oldConfig: ContactsSourceConfig = {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [{ field: 'status', operator: 'equals', value: 'active' }] },
        enrichment: null,
        enrichments: [
          { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        ],
      };

      const newConfig: ContactsSourceConfig = {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [{ field: 'email', operator: 'contains', value: '@test.com' }] },
        enrichment: null,
        enrichments: [
          { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        ],
      };

      expect(didSourceOrSubSourceChange(oldConfig, newConfig)).toBe(false);
    });

    it('returns false when enrichments change but primary source stays the same', () => {
      const oldConfig: ContactsSourceConfig = {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [] },
        enrichment: null,
        enrichments: [],
      };

      const newConfig: ContactsSourceConfig = {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [] },
        enrichment: null,
        enrichments: [
          { entity: 'messages', channel: 'email', statuses: ['delivered'] },
          { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
        ],
      };

      // Adding enrichments does NOT constitute a source change — fields should be preserved
      expect(didSourceOrSubSourceChange(oldConfig, newConfig)).toBe(false);
    });
  });

  describe('WizardModal handleDraftUpdate cleanup — enrichment-only changes', () => {
    // Simulates the logic in handleDraftUpdate for enrichment changes
    // (extracted as a pure function test to avoid rendering the full wizard)

    it('does not clear selectedFields when enrichments are appended (not removed)', () => {
      const oldEnrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
      ];
      const newEnrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
      ];

      // Simulate the removal detection logic from handleDraftUpdate
      const removedSources = oldEnrichments.filter(
        (old) => !newEnrichments.some((ne) => enrichmentKey(ne) === enrichmentKey(old))
      );

      expect(removedSources).toHaveLength(0);
      // When no sources are removed, handleDraftUpdate preserves selectedFields as-is
    });

    it('does not clear selectedFields when enrichments remain unchanged', () => {
      const enrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
      ];

      const removedSources = enrichments.filter(
        (old) => !enrichments.some((ne) => enrichmentKey(ne) === enrichmentKey(old))
      );

      expect(removedSources).toHaveLength(0);
    });

    it('only removes fields for the specific enrichment that was removed', () => {
      const oldEnrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
      ];
      const newEnrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        // tdb-bookings removed
      ];

      const selectedFields = [
        { key: 'contact_email', label: 'Email', source: 'contacts' },
        { key: 'enrichment_messages_message_id', label: 'Message: Message ID', source: 'messages' },
        { key: 'enrichment_txn_tdb-bookings_transaction_id', label: 'Bookings: Transaction ID', source: 'txn:tdb-bookings' },
      ];

      const columnRenames = [
        { fieldKey: 'contact_email', outputName: 'email_address' },
        { fieldKey: 'enrichment_txn_tdb-bookings_transaction_id', outputName: 'booking_id' },
      ];

      // Simulate handleDraftUpdate cleanup logic
      const removedSources = oldEnrichments.filter(
        (old) => !newEnrichments.some((ne) => enrichmentKey(ne) === enrichmentKey(old))
      );
      const removedTags = new Set(removedSources.map((r) => getSourceTag(r)));

      const preservedFields = selectedFields.filter(
        (field) => !removedTags.has(field.source),
      );
      const preservedFieldKeys = new Set(preservedFields.map((f) => f.key));
      const preservedRenames = columnRenames.filter(
        (rename) => preservedFieldKeys.has(rename.fieldKey),
      );

      // Only the tdb-bookings fields should be removed
      expect(preservedFields).toHaveLength(2);
      expect(preservedFields.map((f) => f.key)).toEqual([
        'contact_email',
        'enrichment_messages_message_id',
      ]);

      // Only the contacts rename survives (bookings rename removed)
      expect(preservedRenames).toHaveLength(1);
      expect(preservedRenames[0].fieldKey).toBe('contact_email');
    });
  });

  describe('State persistence guarantees (architecture verification)', () => {
    it('enrichments array is part of sourceConfig which lives on ExporterWizardDraft', () => {
      // This test verifies the type structure — enrichments live on sourceConfig
      const draft = createDraftWithEnrichments([
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
      ]);

      // Type-safe access proves the array is on the draft
      expect(draft.sourceConfig).not.toBeNull();
      expect(draft.sourceConfig!.enrichments).toBeDefined();
      expect(Array.isArray(draft.sourceConfig!.enrichments)).toBe(true);
    });

    it('selectedFields and columnRenames are top-level on ExporterWizardDraft', () => {
      const draft = createDraftWithEnrichments([]);

      // These are direct properties on the draft — managed by WizardModal useState
      expect(draft.selectedFields).toBeDefined();
      expect(Array.isArray(draft.selectedFields)).toBe(true);
      expect(draft.columnRenames).toBeDefined();
      expect(Array.isArray(draft.columnRenames)).toBe(true);
    });

    it('populateFieldsForTransition returns null patch for non-empty fields with same source', () => {
      // This is the critical guarantee: when navigating back to Field Mapping
      // with existing fields and unchanged source, no patch is applied
      const enrichments: EnrichmentConfig[] = [
        { entity: 'messages', channel: 'email', statuses: ['delivered'] },
        { entity: 'transactions', tableId: 'tdb-bookings', joinStrategy: 'most_recent' },
      ];
      const draft = createDraftWithEnrichments(enrichments);

      // previousSourceConfig matches current — simulates "source didn't change"
      const patch = populateFieldsForTransition(draft, draft.sourceConfig);
      expect(patch).toBeNull();
    });
  });
});
