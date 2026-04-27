import type { FilterGroup, FilterRule } from '../models/segment';
import type { FieldDefinition } from '../data/fieldRegistry';
import { operatorLabels } from '../data/operatorRegistry';

export interface RuleSummary {
  text: string; // e.g. "First Name contains John"
}

export interface GroupSummary {
  combinator: 'AND' | 'OR';
  items: (RuleSummary | GroupSummary)[];
}

function isCompleteRule(rule: FilterRule): boolean {
  const { field, operator, value } = rule;
  if (!field || !operator) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value !== '' && value !== undefined && value !== null;
}

function summariseRule(
  rule: FilterRule,
  fieldLookup: (key: string) => FieldDefinition | undefined,
): RuleSummary {
  const fieldDef = fieldLookup(rule.field);
  const fieldLabel = fieldDef?.label ?? rule.field;
  const opLabel = operatorLabels[rule.operator] ?? rule.operator;
  const valueText = Array.isArray(rule.value)
    ? rule.value.join(', ')
    : String(rule.value);

  return { text: `${fieldLabel} ${opLabel} ${valueText}` };
}

export function summariseFilterGroup(
  group: FilterGroup,
  fieldLookup: (key: string) => FieldDefinition | undefined,
): GroupSummary {
  const items: (RuleSummary | GroupSummary)[] = [];

  for (const rule of group.rules) {
    if (isCompleteRule(rule)) {
      items.push(summariseRule(rule, fieldLookup));
    }
  }

  for (const nested of group.groups) {
    const nestedSummary = summariseFilterGroup(nested, fieldLookup);
    if (nestedSummary.items.length > 0) {
      items.push(nestedSummary);
    }
  }

  return { combinator: group.combinator, items };
}

export function hasCompleteRules(group: FilterGroup): boolean {
  if (group.rules.some(isCompleteRule)) return true;
  return group.groups.some(hasCompleteRules);
}
