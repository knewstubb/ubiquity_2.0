import type { FilterGroup, FilterRule } from '../models/segment';
import type { Contact } from '../models/contact';
import { getFieldByKey } from '../data/fieldRegistry';

/**
 * Evaluate a FilterGroup against a list of contacts, returning those that match.
 */
export function evaluateFilterGroup(group: FilterGroup, contacts: Contact[]): Contact[] {
  return contacts.filter((contact) => matchesGroup(group, contact));
}

function matchesGroup(group: FilterGroup, contact: Contact): boolean {
  const ruleResults = group.rules.map((rule) => evaluateRule(rule, contact));
  const groupResults = group.groups.map((child) => matchesGroup(child, contact));

  // Filter out null results (incomplete rules that should be skipped)
  const allResults = [
    ...ruleResults.filter((r): r is boolean => r !== null),
    ...groupResults,
  ];

  // If no evaluable conditions, treat as matching
  if (allResults.length === 0) return true;

  if (group.combinator === 'AND') {
    return allResults.every(Boolean);
  }
  return allResults.some(Boolean);
}

/**
 * Evaluate a single rule against a contact.
 * Returns null if the rule is incomplete (should be skipped).
 */
function evaluateRule(rule: FilterRule, contact: Contact): boolean | null {
  if (!rule.field || !rule.operator) return null;

  // is_empty / is_not_empty don't need a value
  const needsValue = !['is_empty', 'is_not_empty'].includes(rule.operator);
  if (needsValue && (rule.value === '' || rule.value === undefined || rule.value === null)) {
    return null;
  }

  const fieldDef = getFieldByKey(rule.field);
  if (!fieldDef) return null;

  const contactValue = getContactFieldValue(contact, rule.field);

  switch (fieldDef.dataType) {
    case 'string':
      return evaluateString(rule.operator, contactValue, rule.value);
    case 'number':
      return evaluateNumber(rule.operator, contactValue, rule.value);
    case 'date':
      return evaluateDate(rule.operator, contactValue, rule.value);
    case 'enum':
      return evaluateEnum(rule.operator, contactValue, rule.value);
    default:
      return null;
  }
}


function getContactFieldValue(contact: Contact, fieldKey: string): unknown {
  // Contact fields are accessed directly on the contact object
  return (contact as Record<string, unknown>)[fieldKey];
}

function toString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return '';
  return String(val);
}

function isEmpty(val: unknown): boolean {
  return val === null || val === undefined || val === '';
}

// --- String evaluation ---

function evaluateString(
  operator: string,
  fieldValue: unknown,
  ruleValue: string | string[] | number,
): boolean {
  const fv = toString(fieldValue).toLowerCase();
  const rv = toString(ruleValue).toLowerCase();

  switch (operator) {
    case 'equals':
      return fv === rv;
    case 'not_equals':
      return fv !== rv;
    case 'contains':
      return fv.includes(rv);
    case 'does_not_contain':
      return !fv.includes(rv);
    case 'is_empty':
      return isEmpty(fieldValue);
    case 'is_not_empty':
      return !isEmpty(fieldValue);
    default:
      return false;
  }
}

// --- Number evaluation ---

function evaluateNumber(
  operator: string,
  fieldValue: unknown,
  ruleValue: string | string[] | number,
): boolean {
  if (operator === 'is_empty') return isEmpty(fieldValue);
  if (operator === 'is_not_empty') return !isEmpty(fieldValue);

  const fv = Number(fieldValue);
  if (isNaN(fv)) return false;

  if (operator === 'between') {
    const parts = String(ruleValue).split('|');
    if (parts.length !== 2) return false;
    const min = Number(parts[0]);
    const max = Number(parts[1]);
    if (isNaN(min) || isNaN(max)) return false;
    return fv >= min && fv <= max;
  }

  const rv = Number(ruleValue);
  if (isNaN(rv)) return false;

  switch (operator) {
    case 'equals':
      return fv === rv;
    case 'not_equals':
      return fv !== rv;
    case 'greater_than':
      return fv > rv;
    case 'less_than':
      return fv < rv;
    default:
      return false;
  }
}

// --- Date evaluation ---

function evaluateDate(
  operator: string,
  fieldValue: unknown,
  ruleValue: string | string[] | number,
): boolean {
  if (operator === 'is_empty') return isEmpty(fieldValue);
  if (operator === 'is_not_empty') return !isEmpty(fieldValue);

  const fvStr = toString(fieldValue);
  if (!fvStr) return false;
  const fvDate = new Date(fvStr);
  if (isNaN(fvDate.getTime())) return false;

  if (operator === 'in_the_last') {
    const days = Number(ruleValue);
    if (isNaN(days) || days <= 0) return false;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return fvDate >= cutoff;
  }

  if (operator === 'between') {
    const parts = String(ruleValue).split('|');
    if (parts.length !== 2) return false;
    const start = new Date(parts[0]);
    const end = new Date(parts[1]);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    return fvDate >= start && fvDate <= end;
  }

  const rvDate = new Date(String(ruleValue));
  if (isNaN(rvDate.getTime())) return false;

  switch (operator) {
    case 'equals':
      return fvDate.toISOString().slice(0, 10) === rvDate.toISOString().slice(0, 10);
    case 'before':
      return fvDate < rvDate;
    case 'after':
      return fvDate > rvDate;
    default:
      return false;
  }
}

// --- Enum evaluation ---

function evaluateEnum(
  operator: string,
  fieldValue: unknown,
  ruleValue: string | string[] | number,
): boolean {
  if (operator === 'is_empty') return isEmpty(fieldValue);
  if (operator === 'is_not_empty') return !isEmpty(fieldValue);

  const fv = toString(fieldValue);

  switch (operator) {
    case 'is':
      return fv === String(ruleValue);
    case 'is_not':
      return fv !== String(ruleValue);
    case 'is_any_of': {
      const values = Array.isArray(ruleValue) ? ruleValue : String(ruleValue).split(',');
      return values.some((v) => String(v).trim() === fv);
    }
    default:
      return false;
  }
}
