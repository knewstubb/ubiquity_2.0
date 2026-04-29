import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { BillingLineItem } from '../models/billing';
import { UNIT_PRICES } from '../models/billing';
import { downloadBillingCsv } from './billingCsv';

const defaultPrices = { ...UNIT_PRICES };

function makeLine(overrides: Partial<BillingLineItem> = {}): BillingLineItem {
  return {
    id: 'test-1',
    accountId: 'acc-auckland',
    category: 'Mailouts',
    description: 'Summer Campaign Send 1',
    sendDate: '2025-01-15',
    items: 1200,
    createdDate: '2025-01-10',
    user: 'Jane Doe',
    ...overrides,
  };
}

function captureCsv(fn: () => void): string {
  const originalBlob = globalThis.Blob;
  let blobContent = '';
  globalThis.Blob = class extends originalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      blobContent = (parts ?? []).join('');
    }
  } as typeof Blob;
  fn();
  globalThis.Blob = originalBlob;
  return blobContent;
}

const EXPECTED_HEADER = 'Account,Type,Description,Send Date,Created/Activated,User,Items,Unit Price,Total';

describe('downloadBillingCsv', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = vi.fn();
    clickSpy = vi.fn();

    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickSpy;
      }
      return node;
    });
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a CSV blob with correct content type', () => {
    downloadBillingCsv([makeLine()], defaultPrices);

    const blobArg = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe('text/csv;charset=utf-8;');
  });

  it('triggers a download link click', () => {
    downloadBillingCsv([makeLine()], defaultPrices);

    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the correct filename pattern', () => {
    downloadBillingCsv([makeLine()], defaultPrices);

    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toMatch(/^billing-report-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('looks up full account name from accounts data', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine({ accountId: 'acc-auckland' })], defaultPrices));
    expect(csv).toContain('Serenity Spa Auckland');
    expect(csv).not.toContain('acc-auckland');
  });

  it('formats dates as DD MMM YYYY', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine({ sendDate: '2025-01-15', createdDate: '2025-01-10' })], defaultPrices));
    expect(csv).toContain('15 Jan 2025');
    expect(csv).toContain('10 Jan 2025');
  });

  it('handles null sendDate as empty string', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine({ sendDate: null })], defaultPrices));
    const lines = csv.split('\n');
    const dataLine = lines[1];
    const cols = dataLine.split(',');
    // col[3] is Send Date
    expect(cols[3]).toBe('');
  });

  it('escapes values containing commas', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine({ description: 'Campaign A, Phase 1' })], defaultPrices));
    expect(csv).toContain('"Campaign A, Phase 1"');
  });

  it('escapes values containing double quotes', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine({ description: 'The "Big" Send' })], defaultPrices));
    expect(csv).toContain('"The ""Big"" Send"');
  });

  it('produces correct CSV header row', () => {
    const csv = captureCsv(() => downloadBillingCsv([makeLine()], defaultPrices));
    const headerLine = csv.split('\n')[0];
    expect(headerLine).toBe(EXPECTED_HEADER);
  });

  it('handles empty items array', () => {
    const csv = captureCsv(() => downloadBillingCsv([], defaultPrices));
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(EXPECTED_HEADER);
  });
});
