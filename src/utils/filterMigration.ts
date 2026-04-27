import type { FilterGroup } from '../models/segment';

const EMPTY_FILTER_GROUP: FilterGroup = {
  combinator: 'AND',
  rules: [{ field: '', operator: '', value: '' }],
  groups: [],
};

/**
 * Detects legacy FilterConfig objects by checking for the `dateRange` property,
 * which FilterGroup never has.
 */
export function isLegacyFilterConfig(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dateRange' in value
  );
}

function isValidFilterGroup(value: unknown): value is FilterGroup {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj.combinator === 'AND' || obj.combinator === 'OR') &&
    Array.isArray(obj.rules) &&
    Array.isArray(obj.groups)
  );
}

/**
 * Migrates any filter value to a valid FilterGroup.
 * - Legacy FilterConfig shapes (with `dateRange`) → empty FilterGroup
 * - Valid FilterGroup values → passed through unchanged
 * - Corrupted / invalid values → empty FilterGroup
 */
export function migrateFilters(value: unknown): FilterGroup {
  if (isLegacyFilterConfig(value)) {
    return { ...EMPTY_FILTER_GROUP, rules: [...EMPTY_FILTER_GROUP.rules] };
  }

  if (isValidFilterGroup(value)) {
    return value;
  }

  return { ...EMPTY_FILTER_GROUP, rules: [...EMPTY_FILTER_GROUP.rules] };
}
