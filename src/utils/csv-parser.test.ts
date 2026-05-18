import { describe, it, expect } from 'vitest';
import { parse, format } from './csv-parser';

describe('csv-parser', () => {
  describe('parse', () => {
    it('extracts headers and first data row from simple CSV', () => {
      const csv = 'Name,Email,Age\r\nAlice,alice@example.com,30';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Email', 'Age']);
      expect(result.exampleValues).toEqual({
        Name: 'Alice',
        Email: 'alice@example.com',
        Age: '30',
      });
    });

    it('handles RFC 4180 quoted fields with commas', () => {
      const csv = '"Last, First",Email\r\n"Doe, Jane",jane@test.com';
      const result = parse(csv);
      expect(result.headers).toEqual(['Last, First', 'Email']);
      expect(result.exampleValues).toEqual({
        'Last, First': 'Doe, Jane',
        Email: 'jane@test.com',
      });
    });

    it('handles quoted fields with escaped double quotes', () => {
      const csv = 'Name,Quote\r\nAlice,"She said ""hello"""\r\n';
      const result = parse(csv);
      expect(result.exampleValues['Quote']).toBe('She said "hello"');
    });

    it('handles quoted fields with newlines', () => {
      const csv = 'Name,Address\r\nAlice,"123 Main St\nApt 4"';
      const result = parse(csv);
      expect(result.exampleValues['Address']).toBe('123 Main St\nApt 4');
    });

    it('trims whitespace from headers', () => {
      const csv = '  Name  , Email ,Age\r\nAlice,alice@test.com,30';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Email', 'Age']);
    });

    it('assigns "Column N" for empty headers', () => {
      const csv = 'Name,,Age\r\nAlice,value,30';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Column 2', 'Age']);
    });

    it('assigns "Column N" for whitespace-only headers', () => {
      const csv = 'Name,   ,Age\r\nAlice,value,30';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Column 2', 'Age']);
    });

    it('deduplicates headers with _2, _3 suffixes', () => {
      const csv = 'Name,Name,Name\r\nA,B,C';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Name_2', 'Name_3']);
    });

    it('returns empty strings for example values when no data row', () => {
      const csv = 'Name,Email,Age';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Email', 'Age']);
      expect(result.exampleValues).toEqual({ Name: '', Email: '', Age: '' });
    });

    it('returns empty result for empty string', () => {
      const result = parse('');
      expect(result.headers).toEqual([]);
      expect(result.exampleValues).toEqual({});
    });

    it('returns empty result for whitespace-only string', () => {
      const result = parse('   \n  ');
      expect(result.headers).toEqual([]);
      expect(result.exampleValues).toEqual({});
    });

    it('handles LF line endings', () => {
      const csv = 'Name,Email\nAlice,alice@test.com';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name', 'Email']);
      expect(result.exampleValues).toEqual({ Name: 'Alice', Email: 'alice@test.com' });
    });

    it('handles single-column CSV', () => {
      const csv = 'Name\r\nAlice';
      const result = parse(csv);
      expect(result.headers).toEqual(['Name']);
      expect(result.exampleValues).toEqual({ Name: 'Alice' });
    });
  });

  describe('format', () => {
    it('produces RFC 4180 CSV with CRLF separator', () => {
      const headers = ['Name', 'Email'];
      const values = { Name: 'Alice', Email: 'alice@test.com' };
      const result = format(headers, values);
      expect(result).toBe('Name,Email\r\nAlice,alice@test.com');
    });

    it('quotes fields containing commas', () => {
      const headers = ['Name'];
      const values = { Name: 'Doe, Jane' };
      const result = format(headers, values);
      expect(result).toBe('Name\r\n"Doe, Jane"');
    });

    it('quotes fields containing double quotes and escapes them', () => {
      const headers = ['Quote'];
      const values = { Quote: 'She said "hello"' };
      const result = format(headers, values);
      expect(result).toBe('Quote\r\n"She said ""hello"""');
    });

    it('quotes fields containing newlines', () => {
      const headers = ['Address'];
      const values = { Address: '123 Main\nApt 4' };
      const result = format(headers, values);
      expect(result).toBe('Address\r\n"123 Main\nApt 4"');
    });

    it('outputs empty field for missing keys in exampleValues', () => {
      const headers = ['Name', 'Email'];
      const values = { Name: 'Alice' };
      const result = format(headers, values);
      expect(result).toBe('Name,Email\r\nAlice,');
    });

    it('returns empty string for empty headers array', () => {
      const result = format([], {});
      expect(result).toBe('');
    });

    it('quotes header fields that contain special characters', () => {
      const headers = ['Last, First', 'Email'];
      const values = { 'Last, First': 'Doe, Jane', Email: 'jane@test.com' };
      const result = format(headers, values);
      expect(result).toBe('"Last, First",Email\r\n"Doe, Jane",jane@test.com');
    });
  });

  describe('round-trip', () => {
    it('parse(format(headers, values)) returns identical data', () => {
      const headers = ['Name', 'Email', 'Notes'];
      const values = { Name: 'Alice', Email: 'alice@test.com', Notes: 'Has a "nickname"' };
      const csv = format(headers, values);
      const result = parse(csv);
      expect(result.headers).toEqual(headers);
      expect(result.exampleValues).toEqual(values);
    });
  });
});
