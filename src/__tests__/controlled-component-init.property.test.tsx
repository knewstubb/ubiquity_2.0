import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ImportConfigStep } from '../components/importer/ImportConfigStep';
import { NotificationsStep } from '../components/importer/NotificationsStep';
import type {
  ContactConfig,
  TransactionalConfig,
  NotificationConfig,
  UpdateType,
  BlankValueHandling,
} from '../models/importer';
import {
  DEFAULT_CONTACT_CONFIG,
  DEFAULT_TRANSACTIONAL_CONFIG,
  DEFAULT_NOTIFICATION_CONFIG,
} from '../models/importer';

/**
 * Feature: connector-data-persistence, Property 3: Controlled component initialization
 *
 * For any non-default ImporterConfig section passed as the `value` prop to a step
 * component, the component SHALL render those values as its initial state rather
 * than falling back to empty defaults.
 *
 * **Validates: Requirements 6.5, 8.1, 8.2, 8.3, 8.4**
 */
describe('Feature: connector-data-persistence, Property 3: Controlled component initialization', () => {
  /* ── Arbitraries ── */

  const arbUpdateType: fc.Arbitrary<UpdateType> = fc.constantFrom(
    'append-update',
    'append',
    'update'
  );

  const arbBlankValueHandling: fc.Arbitrary<BlankValueHandling> = fc.constantFrom(
    'preserve',
    'import'
  );

  /** Generate a non-empty array of matching fields from the known set */
  const KNOWN_FIELDS = ['Email', 'Customer ID', 'Phone', 'First Name', 'Last Name'];
  const arbMatchingFields: fc.Arbitrary<string[]> = fc
    .subarray(KNOWN_FIELDS, { minLength: 1, maxLength: 5 })
    .filter((arr) => arr.length > 0);

  /** Generate an arbitrary ContactConfig that differs from the default */
  const arbContactConfig: fc.Arbitrary<ContactConfig> = fc
    .record({
      updateType: arbUpdateType,
      blankValueHandling: arbBlankValueHandling,
      matchingFields: arbMatchingFields,
    })
    .filter(
      (cfg) =>
        cfg.updateType !== DEFAULT_CONTACT_CONFIG.updateType ||
        cfg.blankValueHandling !== DEFAULT_CONTACT_CONFIG.blankValueHandling ||
        JSON.stringify(cfg.matchingFields) !== JSON.stringify(DEFAULT_CONTACT_CONFIG.matchingFields)
    );

  /** Generate an arbitrary TransactionalConfig that differs from the default */
  const arbTransactionalConfig: fc.Arbitrary<TransactionalConfig> = fc
    .record({
      updateType: arbUpdateType,
      blankValueHandling: arbBlankValueHandling,
      matchingFields: arbMatchingFields,
    })
    .filter(
      (cfg) =>
        cfg.updateType !== DEFAULT_TRANSACTIONAL_CONFIG.updateType ||
        cfg.blankValueHandling !== DEFAULT_TRANSACTIONAL_CONFIG.blankValueHandling ||
        JSON.stringify(cfg.matchingFields) !==
          JSON.stringify(DEFAULT_TRANSACTIONAL_CONFIG.matchingFields)
    );

  /** Generate a non-empty email list */
  const arbEmailList: fc.Arbitrary<string[]> = fc.array(
    fc.emailAddress().map((e) => e.toLowerCase()),
    { minLength: 1, maxLength: 3 }
  );

  /** Generate an arbitrary NotificationConfig that differs from the default */
  const arbNotificationConfig: fc.Arbitrary<NotificationConfig> = fc
    .record({
      failureEmails: arbEmailList,
      successEnabled: fc.boolean(),
      successEmails: arbEmailList,
      noFileAlertEnabled: fc.boolean(),
      noFileAlertEmails: arbEmailList,
    })
    .filter(
      (cfg) =>
        cfg.failureEmails.length !== DEFAULT_NOTIFICATION_CONFIG.failureEmails.length ||
        cfg.successEnabled !== DEFAULT_NOTIFICATION_CONFIG.successEnabled ||
        cfg.successEmails.length !== DEFAULT_NOTIFICATION_CONFIG.successEmails.length ||
        cfg.noFileAlertEnabled !== DEFAULT_NOTIFICATION_CONFIG.noFileAlertEnabled ||
        cfg.noFileAlertEmails.length !== DEFAULT_NOTIFICATION_CONFIG.noFileAlertEmails.length
    );

  /* ── Property Tests ── */

  it('ImportConfigStep (contact) renders with the provided value, not defaults', () => {
    fc.assert(
      fc.property(arbContactConfig, (config) => {
        const onUpdate = () => {};
        const { container } = render(
          <ImportConfigStep type="contact" value={config} onUpdate={onUpdate} />
        );

        // Verify the correct update type radio is checked
        const radios = container.querySelectorAll<HTMLInputElement>('input[name="updateType"]');
        const checkedRadio = Array.from(radios).find((r) => r.checked);
        expect(checkedRadio).toBeDefined();
        expect(checkedRadio!.value).toBe(config.updateType);

        // Verify matching fields chips are rendered
        for (const field of config.matchingFields) {
          expect(container.textContent).toContain(field);
        }

        // Verify blank value handling radio is checked (only visible when updateType !== 'append')
        if (config.updateType !== 'append') {
          const blankRadios = container.querySelectorAll<HTMLInputElement>(
            'input[name="blankMode"]'
          );
          const checkedBlank = Array.from(blankRadios).find((r) => r.checked);
          expect(checkedBlank).toBeDefined();
          expect(checkedBlank!.value).toBe(config.blankValueHandling);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('ImportConfigStep (transactional) renders with the provided value, not defaults', () => {
    fc.assert(
      fc.property(arbTransactionalConfig, (config) => {
        const onUpdate = () => {};
        const { container } = render(
          <ImportConfigStep type="transactional" value={config} onUpdate={onUpdate} />
        );

        // Verify the correct update type radio is checked
        const radios = container.querySelectorAll<HTMLInputElement>('input[name="updateType"]');
        const checkedRadio = Array.from(radios).find((r) => r.checked);
        expect(checkedRadio).toBeDefined();
        expect(checkedRadio!.value).toBe(config.updateType);

        // Verify matching fields chips are rendered
        for (const field of config.matchingFields) {
          expect(container.textContent).toContain(field);
        }

        // Verify blank value handling radio is checked (only visible when updateType !== 'append')
        if (config.updateType !== 'append') {
          const blankRadios = container.querySelectorAll<HTMLInputElement>(
            'input[name="blankMode"]'
          );
          const checkedBlank = Array.from(blankRadios).find((r) => r.checked);
          expect(checkedBlank).toBeDefined();
          expect(checkedBlank!.value).toBe(config.blankValueHandling);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('NotificationsStep renders with the provided value, not defaults', () => {
    fc.assert(
      fc.property(arbNotificationConfig, (config) => {
        const onUpdate = () => {};
        const { container } = render(
          <NotificationsStep value={config} onUpdate={onUpdate} />
        );

        // Verify failure emails are rendered as chips
        for (const email of config.failureEmails) {
          expect(container.textContent).toContain(email);
        }

        // Verify success toggle state matches config
        const successToggle = container.querySelector<HTMLButtonElement>(
          '#toggle-success-enable'
        );
        expect(successToggle).toBeDefined();
        if (config.successEnabled) {
          expect(successToggle!.getAttribute('data-state')).toBe('checked');
          // When success is enabled, success emails should be visible
          for (const email of config.successEmails) {
            expect(container.textContent).toContain(email);
          }
        } else {
          expect(successToggle!.getAttribute('data-state')).toBe('unchecked');
        }

        // Verify no-file alert toggle state matches config
        const noFileToggle = container.querySelector<HTMLButtonElement>(
          '#toggle-nofile-enable'
        );
        expect(noFileToggle).toBeDefined();
        if (config.noFileAlertEnabled) {
          expect(noFileToggle!.getAttribute('data-state')).toBe('checked');
          // When no-file is enabled, no-file emails should be visible
          for (const email of config.noFileAlertEmails) {
            expect(container.textContent).toContain(email);
          }
        } else {
          expect(noFileToggle!.getAttribute('data-state')).toBe('unchecked');
        }
      }),
      { numRuns: 100 }
    );
  });
});
