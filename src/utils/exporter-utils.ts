import type { ExportDataType, SelectedField } from '../models/automation';
import type { EventSource, ColumnRename } from '../models/wizard';
import { EVENT_FIELDS } from '../models/wizard';
import {
  CONTACT_FIELDS,
  TREATMENT_FIELDS,
  PRODUCT_FIELDS,
} from '../data/fieldRegistry';
import type { FieldDefinition } from '../data/fieldRegistry';

// Mailout-specific fields for the 'mailout' data source
const MAILOUT_FIELDS: FieldDefinition[] = [
  { key: 'mailout_id', label: 'Mailout ID', source: 'contact', dataType: 'string' },
  { key: 'mailout_name', label: 'Mailout Name', source: 'contact', dataType: 'string' },
  { key: 'send_date', label: 'Send Date', source: 'contact', dataType: 'date' },
  { key: 'recipient_count', label: 'Recipient Count', source: 'contact', dataType: 'number' },
  { key: 'open_rate', label: 'Open Rate', source: 'contact', dataType: 'number' },
  { key: 'click_rate', label: 'Click Rate', source: 'contact', dataType: 'number' },
];

/**
 * Maps an ExportDataType to its corresponding FieldDefinition array.
 */
function getFieldDefinitionsForSource(source: ExportDataType): FieldDefinition[] {
  switch (source) {
    case 'contact':
      return CONTACT_FIELDS;
    case 'transactional':
      return TREATMENT_FIELDS;
    case 'mailout':
      return MAILOUT_FIELDS;
    default:
      return [];
  }
}

/**
 * Converts a FieldDefinition to a SelectedField.
 */
function toSelectedField(def: FieldDefinition): SelectedField {
  return {
    key: def.key,
    label: def.label,
    source: def.source,
  };
}

/**
 * Returns the deduplicated union of fields for selected contact/transactional sources.
 * Deduplication is by field key — first occurrence wins.
 */
export function getFieldsForSources(sources: ExportDataType[]): SelectedField[] {
  const seen = new Set<string>();
  const result: SelectedField[] = [];

  for (const source of sources) {
    const definitions = getFieldDefinitionsForSource(source);
    for (const def of definitions) {
      if (!seen.has(def.key)) {
        seen.add(def.key);
        result.push(toSelectedField(def));
      }
    }
  }

  return result;
}

/**
 * Returns the deduplicated union of predefined event fields for selected event sources.
 * Deduplication is by field key — first occurrence wins.
 */
export function getEventFields(eventSources: EventSource[]): SelectedField[] {
  const seen = new Set<string>();
  const result: SelectedField[] = [];

  for (const source of eventSources) {
    const fields = EVENT_FIELDS[source];
    for (const field of fields) {
      if (!seen.has(field.key)) {
        seen.add(field.key);
        result.push(field);
      }
    }
  }

  return result;
}

/**
 * Returns the custom output column name if one exists for the given field key,
 * otherwise returns the default label.
 */
export function resolveColumnName(
  fieldKey: string,
  renames: ColumnRename[],
  defaultLabel: string
): string {
  const rename = renames.find((r) => r.fieldKey === fieldKey);
  return rename ? rename.outputName : defaultLabel;
}

/**
 * Validates a single column name.
 * Rejects empty strings, whitespace-only strings, or strings exceeding 128 characters.
 */
export function validateColumnName(name: string): { valid: boolean; error?: string } {
  if (name.length === 0) {
    return { valid: false, error: 'Column name cannot be empty' };
  }
  if (name.trim().length === 0) {
    return { valid: false, error: 'Column name cannot be whitespace only' };
  }
  if (name.length > 128) {
    return { valid: false, error: 'Column name cannot exceed 128 characters' };
  }
  return { valid: true };
}

/**
 * Detects duplicate output column names (case-sensitive comparison).
 * Returns the list of duplicated names.
 */
export function validateColumnNames(names: string[]): { valid: boolean; duplicates: string[] } {
  const counts = new Map<string, number>();
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const duplicates: string[] = [];
  for (const [name, count] of counts) {
    if (count > 1 && !duplicates.includes(name)) {
      duplicates.push(name);
    }
  }

  return { valid: duplicates.length === 0, duplicates };
}

/**
 * Validates a file naming prefix.
 * Must be 1–100 characters, containing only [a-zA-Z0-9_-].
 */
export function validatePrefix(prefix: string): boolean {
  if (prefix.length < 1 || prefix.length > 100) {
    return false;
  }
  return /^[a-zA-Z0-9_-]+$/.test(prefix);
}

/**
 * Formats a Date as YYYYMMDD-HHmmss in UTC.
 */
export function resolveTimestamp(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Moves a field from one index to another, preserving set membership.
 * Returns a new array — does not mutate the input.
 */
export function reorderFields(
  fields: SelectedField[],
  fromIndex: number,
  toIndex: number
): SelectedField[] {
  if (
    fromIndex < 0 ||
    fromIndex >= fields.length ||
    toIndex < 0 ||
    toIndex >= fields.length
  ) {
    return [...fields];
  }

  const result = [...fields];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
