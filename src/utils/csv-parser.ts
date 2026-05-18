export interface CsvParseResult {
  headers: string[];
  exampleValues: Record<string, string>;
}

/**
 * Parses a single row of RFC 4180 CSV, handling quoted fields
 * (commas, newlines, escaped quotes via doubled double-quotes).
 * Returns the array of field values and the character index where the row ends.
 */
function parseRow(csv: string, startIndex: number): { fields: string[]; nextIndex: number } {
  const fields: string[] = [];
  let i = startIndex;
  const len = csv.length;

  while (i <= len) {
    if (i === len) {
      // End of string — push empty field only if we just saw a comma
      if (fields.length > 0 && i > startIndex && csv[i - 1] === ',') {
        fields.push('');
      } else if (fields.length === 0) {
        fields.push('');
      }
      break;
    }

    // Check for end of row (CRLF or LF)
    if (csv[i] === '\r' && i + 1 < len && csv[i + 1] === '\n') {
      if (fields.length === 0) {
        fields.push('');
      }
      return { fields, nextIndex: i + 2 };
    }
    if (csv[i] === '\n') {
      if (fields.length === 0) {
        fields.push('');
      }
      return { fields, nextIndex: i + 1 };
    }

    // Parse a single field
    if (csv[i] === '"') {
      // Quoted field
      let value = '';
      i++; // skip opening quote
      while (i < len) {
        if (csv[i] === '"') {
          if (i + 1 < len && csv[i + 1] === '"') {
            // Escaped quote
            value += '"';
            i += 2;
          } else {
            // End of quoted field
            i++; // skip closing quote
            break;
          }
        } else {
          value += csv[i];
          i++;
        }
      }
      fields.push(value);
      // After a quoted field, expect comma, CRLF, LF, or end
      if (i < len && csv[i] === ',') {
        i++; // skip comma
        // If this comma is at end of row or end of string, push empty field
        if (i === len || csv[i] === '\r' || csv[i] === '\n') {
          fields.push('');
          if (i === len) break;
          if (csv[i] === '\r' && i + 1 < len && csv[i + 1] === '\n') {
            return { fields, nextIndex: i + 2 };
          }
          return { fields, nextIndex: i + 1 };
        }
      }
    } else {
      // Unquoted field — read until comma, CRLF, LF, or end
      let value = '';
      while (i < len && csv[i] !== ',' && csv[i] !== '\r' && csv[i] !== '\n') {
        value += csv[i];
        i++;
      }
      fields.push(value);
      if (i < len && csv[i] === ',') {
        i++; // skip comma
        // If this comma is at end of row or end of string, push empty field
        if (i === len || csv[i] === '\r' || csv[i] === '\n') {
          fields.push('');
          if (i === len) break;
          if (csv[i] === '\r' && i + 1 < len && csv[i + 1] === '\n') {
            return { fields, nextIndex: i + 2 };
          }
          return { fields, nextIndex: i + 1 };
        }
      }
    }
  }

  return { fields, nextIndex: len };
}

/**
 * Trims whitespace from headers, assigns "Column N" for empty headers,
 * and deduplicates by appending _2, _3, etc.
 */
function normalizeHeaders(rawHeaders: string[]): string[] {
  const trimmed = rawHeaders.map((h, i) => {
    const t = h.trim();
    return t === '' ? `Column ${i + 1}` : t;
  });

  // Deduplicate
  const seen = new Map<string, number>();
  return trimmed.map((header) => {
    const lower = header;
    const count = seen.get(lower) ?? 0;
    seen.set(lower, count + 1);
    if (count === 0) {
      return header;
    }
    return `${header}_${count + 1}`;
  });
}

/**
 * Parses a CSV string and extracts the header row and first data row.
 * Handles RFC 4180 quoted fields (commas, newlines, escaped quotes).
 * Trims whitespace from headers, assigns "Column N" for empty headers.
 * Deduplicates headers by appending _2, _3, etc.
 */
export function parse(csvString: string): CsvParseResult {
  if (!csvString || csvString.trim() === '') {
    return { headers: [], exampleValues: {} };
  }

  // Parse header row
  const { fields: rawHeaders, nextIndex } = parseRow(csvString, 0);

  if (rawHeaders.length === 0 || (rawHeaders.length === 1 && rawHeaders[0] === '')) {
    return { headers: [], exampleValues: {} };
  }

  const headers = normalizeHeaders(rawHeaders);

  // Parse first data row (if it exists)
  const exampleValues: Record<string, string> = {};
  if (nextIndex < csvString.length) {
    const { fields: dataFields } = parseRow(csvString, nextIndex);
    headers.forEach((header, i) => {
      exampleValues[header] = i < dataFields.length ? dataFields[i] : '';
    });
  } else {
    // No data row — all example values are empty strings
    headers.forEach((header) => {
      exampleValues[header] = '';
    });
  }

  return { headers, exampleValues };
}

/**
 * Quotes a field value per RFC 4180 if it contains commas, newlines, or double quotes.
 */
function quoteField(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('\r') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats headers and example values into a valid RFC 4180 CSV string.
 * Header row on line 1, data row on line 2, separated by CRLF.
 * Quotes fields containing commas, newlines, or double quotes.
 * Returns empty string if headers array is empty.
 */
export function format(
  headers: string[],
  exampleValues: Record<string, string>
): string {
  if (headers.length === 0) {
    return '';
  }

  const headerRow = headers.map(quoteField).join(',');
  const dataRow = headers.map((h) => quoteField(exampleValues[h] ?? '')).join(',');

  return `${headerRow}\r\n${dataRow}`;
}
