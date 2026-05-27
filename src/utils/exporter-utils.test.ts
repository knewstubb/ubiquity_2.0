import { describe, it, expect } from 'vitest';
import {
  getFieldsForSources,
  getEventFields,
  resolveColumnName,
  validateColumnName,
  validateColumnNames,
  validatePrefix,
  resolveTimestamp,
  reorderFields,
} from './exporter-utils';
import type { ColumnRename } from '../models/wizard';
import type { SelectedField } from '../models/automation';

describe('getFieldsForSources', () => {
  it('returns contact fields for contact source', () => {
    const fields = getFieldsForSources(['contact']);
    expect(fields.length).toBeGreaterThan(0);
    expect(fields.every((f) => f.source === 'contact')).toBe(true);
  });

  it('returns transactional fields for transactional source', () => {
    const fields = getFieldsForSources(['transactional']);
    expect(fields.length).toBeGreaterThan(0);
    expect(fields.every((f) => f.source === 'treatment')).toBe(true);
  });

  it('returns mailout fields for mailout source', () => {
    const fields = getFieldsForSources(['mailout']);
    expect(fields.length).toBeGreaterThan(0);
  });

  it('returns deduplicated union for multiple sources', () => {
    const fields = getFieldsForSources(['contact', 'transactional', 'mailout']);
    const keys = fields.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('returns empty array for empty sources', () => {
    const fields = getFieldsForSources([]);
    expect(fields).toEqual([]);
  });
});

describe('getEventFields', () => {
  it('returns fields for a single event source', () => {
    const fields = getEventFields(['mailout_sends']);
    expect(fields.length).toBeGreaterThan(0);
    expect(fields.every((f) => f.source === 'event')).toBe(true);
  });

  it('deduplicates shared fields across event sources', () => {
    const fields = getEventFields(['mailout_sends', 'campaign_events', 'failed_sends']);
    const keys = fields.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('returns empty array for empty event sources', () => {
    const fields = getEventFields([]);
    expect(fields).toEqual([]);
  });

  it('includes event_timestamp and recipient_email for all sources', () => {
    const fields = getEventFields(['mailout_sends']);
    const keys = fields.map((f) => f.key);
    expect(keys).toContain('event_timestamp');
    expect(keys).toContain('recipient_email');
  });
});

describe('resolveColumnName', () => {
  it('returns custom name when rename exists', () => {
    const renames: ColumnRename[] = [{ fieldKey: 'email', outputName: 'Email Address' }];
    expect(resolveColumnName('email', renames, 'Email')).toBe('Email Address');
  });

  it('returns default label when no rename exists', () => {
    const renames: ColumnRename[] = [{ fieldKey: 'phone', outputName: 'Phone Number' }];
    expect(resolveColumnName('email', renames, 'Email')).toBe('Email');
  });

  it('returns default label when renames array is empty', () => {
    expect(resolveColumnName('email', [], 'Email')).toBe('Email');
  });
});

describe('validateColumnName', () => {
  it('rejects empty string', () => {
    const result = validateColumnName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects whitespace-only string', () => {
    const result = validateColumnName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects string exceeding 128 characters', () => {
    const result = validateColumnName('a'.repeat(129));
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('accepts valid column name', () => {
    const result = validateColumnName('First Name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts exactly 128 characters', () => {
    const result = validateColumnName('a'.repeat(128));
    expect(result.valid).toBe(true);
  });
});

describe('validateColumnNames', () => {
  it('detects duplicate names', () => {
    const result = validateColumnNames(['Email', 'Name', 'Email']);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toContain('Email');
  });

  it('returns valid for unique names', () => {
    const result = validateColumnNames(['Email', 'Name', 'Phone']);
    expect(result.valid).toBe(true);
    expect(result.duplicates).toEqual([]);
  });

  it('returns valid for empty array', () => {
    const result = validateColumnNames([]);
    expect(result.valid).toBe(true);
    expect(result.duplicates).toEqual([]);
  });

  it('is case-sensitive', () => {
    const result = validateColumnNames(['Email', 'email']);
    expect(result.valid).toBe(true);
  });
});

describe('validatePrefix', () => {
  it('accepts valid prefix with alphanumeric and hyphens/underscores', () => {
    expect(validatePrefix('my-export_2024')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validatePrefix('')).toBe(false);
  });

  it('rejects string over 100 characters', () => {
    expect(validatePrefix('a'.repeat(101))).toBe(false);
  });

  it('accepts exactly 100 characters', () => {
    expect(validatePrefix('a'.repeat(100))).toBe(true);
  });

  it('accepts single character', () => {
    expect(validatePrefix('a')).toBe(true);
  });

  it('rejects spaces', () => {
    expect(validatePrefix('my export')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(validatePrefix('my.export')).toBe(false);
    expect(validatePrefix('my@export')).toBe(false);
    expect(validatePrefix('my/export')).toBe(false);
  });
});

describe('resolveTimestamp', () => {
  it('formats date as YYYYMMDD-HHmmss in UTC', () => {
    const date = new Date('2024-03-15T14:30:45Z');
    expect(resolveTimestamp(date)).toBe('20240315-143045');
  });

  it('pads single-digit values with zeros', () => {
    const date = new Date('2024-01-05T03:07:09Z');
    expect(resolveTimestamp(date)).toBe('20240105-030709');
  });

  it('handles midnight correctly', () => {
    const date = new Date('2024-12-31T00:00:00Z');
    expect(resolveTimestamp(date)).toBe('20241231-000000');
  });

  it('handles end of day correctly', () => {
    const date = new Date('2024-06-15T23:59:59Z');
    expect(resolveTimestamp(date)).toBe('20240615-235959');
  });
});

describe('reorderFields', () => {
  const fields: SelectedField[] = [
    { key: 'a', label: 'A', source: 'contact' },
    { key: 'b', label: 'B', source: 'contact' },
    { key: 'c', label: 'C', source: 'contact' },
    { key: 'd', label: 'D', source: 'contact' },
  ];

  it('moves field from earlier to later position', () => {
    const result = reorderFields(fields, 0, 2);
    expect(result.map((f) => f.key)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves field from later to earlier position', () => {
    const result = reorderFields(fields, 3, 1);
    expect(result.map((f) => f.key)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('preserves all fields (no additions or removals)', () => {
    const result = reorderFields(fields, 1, 3);
    expect(result.length).toBe(fields.length);
    const originalKeys = new Set(fields.map((f) => f.key));
    const resultKeys = new Set(result.map((f) => f.key));
    expect(resultKeys).toEqual(originalKeys);
  });

  it('does not mutate the original array', () => {
    const original = [...fields];
    reorderFields(fields, 0, 2);
    expect(fields).toEqual(original);
  });

  it('returns copy when fromIndex is out of bounds', () => {
    const result = reorderFields(fields, -1, 2);
    expect(result).toEqual(fields);
  });

  it('returns copy when toIndex is out of bounds', () => {
    const result = reorderFields(fields, 0, 10);
    expect(result).toEqual(fields);
  });

  it('handles same from and to index', () => {
    const result = reorderFields(fields, 1, 1);
    expect(result).toEqual(fields);
  });
});
