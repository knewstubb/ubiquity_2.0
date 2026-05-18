import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { ImportConfigStep } from '../components/importer/ImportConfigStep';
import { NotificationsStep } from '../components/importer/NotificationsStep';
import { ImportMappingStep } from '../components/importer/ImportMappingStep';
import type {
  ContactConfig,
  TransactionalConfig,
  NotificationConfig,
  FieldMapping,
} from '../models/importer';

/**
 * Feature: connector-data-persistence, Property 2: Step callback state lifting
 *
 * For any valid field value change within a wizard step component
 * (ImportConfigStep, ImportMappingStep, or NotificationsStep), invoking the
 * onUpdate callback SHALL pass the complete current state of that section,
 * and the parent ImporterConfig SHALL contain exactly those values after the update.
 *
 * **Validates: Requirements 1.1, 2.1, 3.1, 3.2, 4.1, 6.1, 6.2, 6.3**
 */
describe('Feature: connector-data-persistence, Property 2: Step callback state lifting', () => {
  beforeAll(() => {
    // Mock ResizeObserver for any components that may need it
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /* ── Arbitrary generators ── */

  const arbUpdateType = fc.constantFrom(
    'append-update' as const,
    'append' as const,
    'update' as const,
  );

  const arbBlankValueHandling = fc.constantFrom(
    'preserve' as const,
    'import' as const,
  );

  // Matching fields must come from the set the component supports
  const ALL_FIELD_OPTIONS = ['Email', 'Customer ID', 'Phone', 'First Name', 'Last Name'];
  const arbMatchingFields = fc.subarray(ALL_FIELD_OPTIONS, { minLength: 0, maxLength: 5 });

  const arbContactConfig: fc.Arbitrary<ContactConfig> = fc.record({
    updateType: arbUpdateType,
    blankValueHandling: arbBlankValueHandling,
    matchingFields: arbMatchingFields,
  });

  const arbTransactionalConfig: fc.Arbitrary<TransactionalConfig> = fc.record({
    updateType: arbUpdateType,
    blankValueHandling: arbBlankValueHandling,
    matchingFields: arbMatchingFields,
  });

  const arbEmail = fc.emailAddress();

  const arbNotificationConfig: fc.Arbitrary<NotificationConfig> = fc.record({
    failureEmails: fc.array(arbEmail, { minLength: 0, maxLength: 3 }),
    successEnabled: fc.boolean(),
    successEmails: fc.array(arbEmail, { minLength: 0, maxLength: 3 }),
    noFileAlertEnabled: fc.boolean(),
    noFileAlertEmails: fc.array(arbEmail, { minLength: 0, maxLength: 3 }),
  });

  // For ImportMappingStep, generate valid FieldMapping arrays using the source fields
  // the component knows about
  const CONTACT_SOURCE_FIELDS = [
    'policy_number',
    'policy_start',
    'policy_expire',
    'email_id',
    'test_1_1_2',
    'salutation',
    'email_address',
    'first_name',
    'last_name',
  ];

  const CONTACT_TARGET_FIELDS = [
    'policy_id',
    'policy_start_date',
    'policy_expiry_date',
    'email_address',
    'greeting',
    'first_name',
    'last_name',
    'phone',
    'membership_tier',
  ];

  const arbContactFieldMappings: fc.Arbitrary<FieldMapping[]> = fc
    .shuffledSubarray(CONTACT_SOURCE_FIELDS, { minLength: 1, maxLength: CONTACT_SOURCE_FIELDS.length })
    .chain((sources) =>
      fc.tuple(
        fc.constant(sources),
        fc.array(fc.constantFrom(...CONTACT_TARGET_FIELDS), {
          minLength: sources.length,
          maxLength: sources.length,
        }),
      ),
    )
    .map(([sources, targets]) =>
      sources.map((s, i) => ({ sourceField: s, targetField: targets[i] })),
    );

  /* ── Tests ── */

  it('ImportConfigStep (contact): onUpdate receives the complete ContactConfig on mount', () => {
    fc.assert(
      fc.property(arbContactConfig, (config) => {
        const onUpdate = vi.fn();

        render(
          <ImportConfigStep type="contact" value={config} onUpdate={onUpdate} />,
        );

        // The component calls onUpdate on mount via useEffect
        expect(onUpdate).toHaveBeenCalled();

        // The last call should contain the full config matching input
        const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
        expect(lastCall.updateType).toBe(config.updateType);
        expect(lastCall.blankValueHandling).toBe(config.blankValueHandling);
        expect(lastCall.matchingFields).toEqual(config.matchingFields);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('ImportConfigStep (transactional): onUpdate receives the complete TransactionalConfig on mount', () => {
    fc.assert(
      fc.property(arbTransactionalConfig, (config) => {
        const onUpdate = vi.fn();

        render(
          <ImportConfigStep type="transactional" value={config} onUpdate={onUpdate} />,
        );

        expect(onUpdate).toHaveBeenCalled();

        const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
        expect(lastCall.updateType).toBe(config.updateType);
        expect(lastCall.blankValueHandling).toBe(config.blankValueHandling);
        expect(lastCall.matchingFields).toEqual(config.matchingFields);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('NotificationsStep: onUpdate receives the complete NotificationConfig on mount', () => {
    fc.assert(
      fc.property(arbNotificationConfig, (config) => {
        const onUpdate = vi.fn();

        render(
          <NotificationsStep value={config} onUpdate={onUpdate} />,
        );

        expect(onUpdate).toHaveBeenCalled();

        const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0] as NotificationConfig;
        expect(lastCall.failureEmails).toEqual(config.failureEmails);
        expect(lastCall.successEnabled).toBe(config.successEnabled);
        expect(lastCall.successEmails).toEqual(config.successEmails);
        expect(lastCall.noFileAlertEnabled).toBe(config.noFileAlertEnabled);
        expect(lastCall.noFileAlertEmails).toEqual(config.noFileAlertEmails);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('ImportMappingStep: onUpdate receives field mappings derived from value prop on mount', () => {
    fc.assert(
      fc.property(arbContactFieldMappings, (mappings) => {
        const onUpdate = vi.fn();

        render(
          <ImportMappingStep
            type="contact"
            value={mappings}
            onUpdate={onUpdate}
            csvHeaders={CONTACT_SOURCE_FIELDS}
            csvExampleValues={{}}
          />,
        );

        expect(onUpdate).toHaveBeenCalled();

        // The component filters out [[Ignore Field]] and empty targets,
        // so the output should contain all mappings we provided (since we only
        // generate valid target fields, not [[Ignore Field]])
        const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0] as FieldMapping[];

        // Every mapping we provided should appear in the output
        for (const mapping of mappings) {
          const found = lastCall.find(
            (m) => m.sourceField === mapping.sourceField && m.targetField === mapping.targetField,
          );
          expect(found).toBeDefined();
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
