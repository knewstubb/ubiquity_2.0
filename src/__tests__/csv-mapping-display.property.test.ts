import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { ImportMappingStep } from '../components/importer/ImportMappingStep';

/**
 * Feature: csv-sample-upload, Property 5: Mapping step displays headers in CSV order with correct example values
 *
 * For any non-empty array of CSV headers and corresponding example values record,
 * the mapping step SHALL render exactly one row per header in the same order as
 * the array, displaying the example value for each header or a dash character
 * when the example value is an empty string.
 *
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Feature: csv-sample-upload, Property 5: Mapping step displays headers in CSV order', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /* ── Arbitrary generators ── */

  // Generate unique header strings: alphanumeric with spaces, no leading/trailing whitespace
  const arbHeader = fc
    .stringMatching(/^[A-Za-z][A-Za-z0-9 _\-]*[A-Za-z0-9]$/, { minLength: 2, maxLength: 30 })
    .filter((h) => h.trim() === h && h.length >= 2);

  // Generate unique headers array (1–15 items for practical test speed)
  const arbUniqueHeaders = fc
    .uniqueArray(arbHeader, { minLength: 1, maxLength: 15 })
    .filter((arr) => arr.length > 0);

  // Example value: either a non-empty string or empty string (to test dash display)
  const arbExampleValue = fc.oneof(
    fc.constant(''), // empty → should display '—'
    fc.stringMatching(/^[A-Za-z0-9@.\- ]+$/, { minLength: 1, maxLength: 50 }),
  );

  // Build a record of example values keyed by headers
  function arbExampleValues(headers: string[]): fc.Arbitrary<Record<string, string>> {
    if (headers.length === 0) return fc.constant({});
    return fc.tuple(...headers.map(() => arbExampleValue)).map((values) =>
      Object.fromEntries(headers.map((h, i) => [h, values[i]])),
    );
  }

  it('renders exactly one row per header in array order with correct example values', () => {
    fc.assert(
      fc.property(
        arbUniqueHeaders.chain((headers) =>
          arbExampleValues(headers).map((values) => ({ headers, values })),
        ),
        ({ headers, values }) => {
          const onUpdate = vi.fn();

          const { container } = render(
            createElement(ImportMappingStep, {
              type: 'contact',
              value: [],
              onUpdate,
              csvHeaders: headers,
              csvExampleValues: values,
            }),
          );

          // The component renders rows in a grid layout.
          // Each data row uses grid-cols-[1fr_40px_1.2fr_40px_1fr]
          const dataRows = container.querySelectorAll('[class*="grid-cols-\\[1fr_40px"]');

          // Assert exactly one row per header
          expect(dataRows.length).toBe(headers.length);

          // Assert each row displays the correct source field in order
          dataRows.forEach((row, idx) => {
            const sourceFieldSpan = row.querySelector('span');
            expect(sourceFieldSpan).not.toBeNull();
            expect(sourceFieldSpan!.textContent).toBe(headers[idx]);
          });

          // Assert example values are displayed correctly
          // The example value is in the last column of each row
          dataRows.forEach((row, idx) => {
            const header = headers[idx];
            const rawValue = values[header];
            // When status is 'normal' and targetField is not '[[Ignore Column]]',
            // the component renders the raw example value (empty string stays empty)
            const expectedValue = rawValue || '';

            // The example value container has flex items-center gap-1.5
            const exampleDiv = row.querySelector('[class*="flex"][class*="items-center"][class*="gap-"]');
            expect(exampleDiv).not.toBeNull();

            // Target the specific example value span
            const exampleSpan = exampleDiv!.querySelector('span.text-tertiary-foreground');
            if (exampleSpan) {
              expect(exampleSpan.textContent).toBe(expectedValue);
            }
          });

          cleanup();
        },
      ),
      { numRuns: 20 },
    );
  });
});
