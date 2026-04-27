import type { FilterGroup } from '../../models/segment';
import type { FieldDefinition } from '../../data/fieldRegistry';
import type { Contact } from '../../models/contact';
import { FilterGroupComponent } from './FilterGroup';
import { evaluateFilterGroup } from '../../utils/filterEngine';
import { useAccount } from '../../contexts/AccountContext';
import { spaContacts } from '../../data/spaContacts';
import styles from './FilterBuilder.module.css';

interface FilterBuilderProps {
  value: FilterGroup;
  onChange: (group: FilterGroup) => void;
  readOnly?: boolean;
  fields?: FieldDefinition[];
}

function countCompleteRules(group: FilterGroup): number {
  let count = 0;
  for (const rule of group.rules) {
    if (rule.field && rule.operator) {
      const needsValue = !['is_empty', 'is_not_empty'].includes(rule.operator);
      if (!needsValue || (rule.value !== '' && rule.value !== undefined)) {
        count++;
      }
    }
  }
  for (const child of group.groups) {
    count += countCompleteRules(child);
  }
  return count;
}

export function FilterBuilder({ value, onChange, readOnly = false, fields }: FilterBuilderProps) {
  const { filterByAccount } = useAccount();
  const accountContacts: Contact[] = filterByAccount(spaContacts);

  const hasCompleteRules = countCompleteRules(value) > 0;
  const matchedContacts = hasCompleteRules
    ? evaluateFilterGroup(value, accountContacts)
    : accountContacts;

  return (
    <div className={styles.filterBuilder}>
      <FilterGroupComponent
        group={value}
        onChange={onChange}
        readOnly={readOnly}
        fields={fields}
        isRoot
      />
      <div className={styles.matchCount}>
        <strong>{matchedContacts.length}</strong>
        {matchedContacts.length === 1 ? ' contact matches' : ' contacts match'}
        {!hasCompleteRules && ' (all contacts)'}
      </div>
    </div>
  );
}
