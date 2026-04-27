import type { FilterGroup as FilterGroupType, FilterRule } from '../../models/segment';
import type { FieldDefinition } from '../../data/fieldRegistry';
import { FilterRuleRow } from './FilterRuleRow';
import { CombinatorToggle } from './CombinatorToggle';
import styles from './FilterGroup.module.css';

interface FilterGroupProps {
  group: FilterGroupType;
  onChange: (group: FilterGroupType) => void;
  onRemove?: () => void;
  readOnly?: boolean;
  fields?: FieldDefinition[];
  depth?: number;
  isRoot?: boolean;
}

const MAX_DEPTH = 2;

const emptyRule = (): FilterRule => ({ field: '', operator: '', value: '' });
const emptyGroup = (): FilterGroupType => ({
  combinator: 'AND',
  rules: [emptyRule()],
  groups: [],
});

export function FilterGroupComponent({
  group,
  onChange,
  onRemove,
  readOnly = false,
  fields,
  depth = 0,
  isRoot = false,
}: FilterGroupProps) {
  const isNested = depth > 0;

  const handleRuleChange = (index: number, rule: FilterRule) => {
    const rules = [...group.rules];
    rules[index] = rule;
    onChange({ ...group, rules });
  };

  const handleRuleRemove = (index: number) => {
    const rules = group.rules.filter((_, i) => i !== index);
    onChange({ ...group, rules });
  };

  const handleAddRule = () => {
    onChange({ ...group, rules: [...group.rules, emptyRule()] });
  };

  const handleAddGroup = () => {
    onChange({ ...group, groups: [...group.groups, emptyGroup()] });
  };

  const handleCombinatorChange = (combinator: 'AND' | 'OR') => {
    onChange({ ...group, combinator });
  };

  const handleChildGroupChange = (index: number, childGroup: FilterGroupType) => {
    const groups = [...group.groups];
    groups[index] = childGroup;
    onChange({ ...group, groups });
  };

  const handleChildGroupRemove = (index: number) => {
    const groups = group.groups.filter((_, i) => i !== index);
    onChange({ ...group, groups });
  };

  const canRemoveRule = group.rules.length > 1;
  const showRootRemove = !isRoot || group.groups.length > 0;

  return (
    <div className={`${styles.group} ${isNested ? styles.nested : ''}`}>
      {/* Rules */}
      {group.rules.map((rule, i) => (
        <div key={i} className={styles.ruleItem}>
          <FilterRuleRow
            rule={rule}
            onChange={(r) => handleRuleChange(i, r)}
            onRemove={() => handleRuleRemove(i)}
            canRemove={canRemoveRule}
            readOnly={readOnly}
            fields={fields}
          />
          {/* Combinator between rules */}
          {i < group.rules.length - 1 && (
            <div className={styles.combinatorRow}>
              <CombinatorToggle
                value={group.combinator}
                onChange={handleCombinatorChange}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      ))}

      {/* Combinator between rules section and nested groups */}
      {group.groups.length > 0 && group.rules.length > 0 && (
        <div className={styles.combinatorRow}>
          <CombinatorToggle
            value={group.combinator}
            onChange={handleCombinatorChange}
            readOnly={readOnly}
          />
        </div>
      )}

      {/* Nested groups */}
      {group.groups.map((childGroup, i) => (
        <div key={`group-${i}`} className={styles.nestedGroupItem}>
          <FilterGroupComponent
            group={childGroup}
            onChange={(g) => handleChildGroupChange(i, g)}
            onRemove={() => handleChildGroupRemove(i)}
            readOnly={readOnly}
            fields={fields}
            depth={depth + 1}
          />
          {/* Combinator between sibling groups */}
          {i < group.groups.length - 1 && (
            <div className={styles.combinatorRow}>
              <CombinatorToggle
                value={group.combinator}
                onChange={handleCombinatorChange}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      {!readOnly && (
        <div className={styles.actions}>
          <button type="button" className={styles.addBtn} onClick={handleAddRule}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add filter
          </button>
          {depth < MAX_DEPTH && (
            <button type="button" className={styles.addBtn} onClick={handleAddGroup}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add filter group
            </button>
          )}
        </div>
      )}

      {/* Remove group button (for nested groups) */}
      {onRemove && !readOnly && showRootRemove && (
        <div className={styles.nestedGroupHeader}>
          <button
            type="button"
            className={styles.removeGroupBtn}
            onClick={onRemove}
            aria-label="Remove group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
