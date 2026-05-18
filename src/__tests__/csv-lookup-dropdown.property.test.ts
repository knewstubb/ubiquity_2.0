import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { ImportMappingStep } from '../components/importer/ImportMappingStep';

/**
 * Feature: csv-sample-upload, Property 6: Lookup dropdown populated from CSV headers
 *
 * For any non-empty array of CSV headers passed to the transactional mapping step,
 * the "File Column" dropdown in the Lookup Field Mapping section SHALL contain
 * exactly those headers as selectable options, in the same order as the array.
 *
 * **Validates: Requirements 5.2**
 */
describe('Feature: csv-sample-upload, Property 6: Lookup dropdown populated from CSV headers', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /* ── Arbitrary generators ── */

  // Generate unique header strings: simple alphanumeric with no leading/trailing whitespace
  const arbHeader = fc
    .stringMatching(/^[A-Za-z][A-Za-z0-9 _\-]*[A-Za-z0-9]$/, { minLength: 2, maxLength: 30 })
    .filter((h) => h.trim() === h && h.length >= 2);

  // Generate unique headers array (1–15 items for practical test speed)
  const arbUniqueHeaders = fc
    .uniqueArray(arbHeader, { minLength: 1, maxLength: 15 })
    .filter((arr) => arr.length > 0);

  it('lookup "File Column" dropdown contains exactly the CSV headers as options in order', () => {
    fc.assert(
      fc.property(arbUniqueHeaders, (headers) => {
        const onUpdate = vi.fn();
        const onLookupUpdate = vi.fn();

        // Build a minimal example values record
        const csvExampleValues: Record<string, string> = {};
        for (const h of headers) {
          csvExampleValues[h] = '';
        }

        const { container } = render(
          createElement(ImportMappingStep, {
            type: 'transactional',
            value: [],
            onUpdate,
            csvHeaders: headers,
            csvExampleValues,
            lookupMappings: [{ sourceField: '', contactField: '' }],
            onLookupUpdate,
          }),
        );

        // Find the lookup section
        const lookupSection = container.querySelector('[data-testid="lookup-field-mapping-section"]');
        expect(lookupSection).not.toBeNull();

        // Find the first lookup source dropdown
        const sourceDropdown = container.querySelector('[data-testid="lookup-source-0"]') as HTMLSelectElement;
        expect(sourceDropdown).not.toBeNull();

        // Get all option elements inside the dropdown
        const options = Array.from(sourceDropdown.querySelectorAll('option'));

        // First option should be the placeholder "— select —"
        expect(options[0].textContent).toBe('— select —');
        expect(options[0].value).toBe('');

        // Remaining options should be exactly the CSV headers in order
        const headerOptions = options.slice(1);
        expect(headerOptions.length).toBe(headers.length);

        headerOptions.forEach((option, idx) => {
          expect(option.textContent).toBe(headers[idx]);
          expect(option.value).toBe(headers[idx]);
        });

        cleanup();
      }),
      { numRuns: 20 },
    );
  });
});
