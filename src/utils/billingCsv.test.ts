import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { BillingLineItem } from '../models/billing';
import { downloadBillingCsv } from './billingCsv';

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
    const items = [makeLine()];
    downloadBillingCsv(items);

    const blobArg = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe('text/csv;charset=utf-8;');
  });

  it('triggers a download link click', () => {
    downloadBillingCsv([makeLine()]);

    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the correct filename pattern', () => {
    downloadBillingCsv([makeLine()]);

    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toMatch(/^billing-report-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('looks up full account name from accounts data', () => {
    // acc-auckland should resolve to "Serenity Spa Auckland"
    let capturedCsv = '';
    createObjectURLMock.mockImplementation((blob: Blob) => {
      // We can't read blob synchronously in jsdom, so we'll verify via a different approach
      return 'blob:mock-url';
    });

    // Instead, let's capture the Blob content by intercepting the constructor
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine({ accountId: 'acc-auckland' })]);

    globalThis.Blob = originalBlob;

    expect(blobContent).toContain('Serenity Spa Auckland');
    expect(blobContent).not.toContain('acc-auckland');
  });

  it('formats dates as DD MMM YYYY', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine({ sendDate: '2025-01-15', createdDate: '2025-01-10' })]);

    globalThis.Blob = originalBlob;

    expect(blobContent).toContain('15 Jan 2025');
    expect(blobContent).toContain('10 Jan 2025');
  });

  it('handles null sendDate as empty string', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine({ sendDate: null })]);

    globalThis.Blob = originalBlob;

    const lines = blobContent.split('\n');
    const dataLine = lines[1];
    // Send Date field should be empty (two consecutive commas around it)
    // Headers: Account,Type,Description,Send Date,Items,Created/Activated Date,User
    // So after Description and before Items, the Send Date should be empty
    const cols = dataLine.split(',');
    // col[3] is Send Date
    expect(cols[3]).toBe('');
  });

  it('escapes values containing commas', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine({ description: 'Campaign A, Phase 1' })]);

    globalThis.Blob = originalBlob;

    expect(blobContent).toContain('"Campaign A, Phase 1"');
  });

  it('escapes values containing double quotes', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine({ description: 'The "Big" Send' })]);

    globalThis.Blob = originalBlob;

    expect(blobContent).toContain('"The ""Big"" Send"');
  });

  it('produces correct CSV header row', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([makeLine()]);

    globalThis.Blob = originalBlob;

    const headerLine = blobContent.split('\n')[0];
    expect(headerLine).toBe('Account,Type,Description,Send Date,Items,Created/Activated Date,User');
  });

  it('handles empty items array', () => {
    const originalBlob = globalThis.Blob;
    let blobContent = '';
    globalThis.Blob = class extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobContent = (parts ?? []).join('');
      }
    } as typeof Blob;

    downloadBillingCsv([]);

    globalThis.Blob = originalBlob;

    const lines = blobContent.split('\n');
    expect(lines).toHaveLength(1); // header only
    expect(lines[0]).toBe('Account,Type,Description,Send Date,Items,Created/Activated Date,User');
  });
});
