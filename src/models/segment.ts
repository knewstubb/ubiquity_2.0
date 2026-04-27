export interface FilterRule {
  field: string;
  operator: string;
  value: string | string[] | number;
}

export interface FilterGroup {
  combinator: 'AND' | 'OR';
  rules: FilterRule[];
  groups: FilterGroup[];
}

export interface Segment {
  id: string;
  name: string;
  accountId: string;
  type: 'smart' | 'manual';
  rootGroup: FilterGroup;
  memberCount: number;
}
