const stringOperators = [
  'equals',
  'not_equals',
  'contains',
  'does_not_contain',
  'is_empty',
  'is_not_empty',
] as const;

const numberOperators = [
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'between',
  'is_empty',
  'is_not_empty',
] as const;

const dateOperators = [
  'equals',
  'before',
  'after',
  'between',
  'in_the_last',
  'is_empty',
  'is_not_empty',
] as const;

const enumOperators = [
  'is',
  'is_not',
  'is_any_of',
  'is_empty',
  'is_not_empty',
] as const;

const operatorsByType: Record<string, readonly string[]> = {
  string: stringOperators,
  number: numberOperators,
  date: dateOperators,
  enum: enumOperators,
};

export function getOperatorsForFieldType(dataType: string): readonly string[] {
  return operatorsByType[dataType] ?? stringOperators;
}

export const operatorLabels: Record<string, string> = {
  equals: 'equals',
  not_equals: 'not equals',
  contains: 'contains',
  does_not_contain: 'does not contain',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  greater_than: 'greater than',
  less_than: 'less than',
  between: 'between',
  before: 'before',
  after: 'after',
  in_the_last: 'in the last',
  is: 'is',
  is_not: 'is not',
  is_any_of: 'is any of',
};
