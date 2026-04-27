import { useEffect } from 'react';
import { getOperatorsForFieldType, operatorLabels } from '../../data/operatorRegistry';
import styles from './OperatorDropdown.module.css';

interface OperatorDropdownProps {
  fieldDataType: string | undefined;
  value: string;
  onChange: (operator: string) => void;
  disabled?: boolean;
}

export function OperatorDropdown({ fieldDataType, value, onChange, disabled = false }: OperatorDropdownProps) {
  const operators = fieldDataType ? getOperatorsForFieldType(fieldDataType) : [];

  // Reset operator when field type changes and current value is no longer valid
  useEffect(() => {
    if (fieldDataType && value && !operators.includes(value)) {
      onChange('');
    }
  }, [fieldDataType]);

  return (
    <div className={styles.wrapper}>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !fieldDataType}
        aria-label="Operator"
      >
        <option value="" disabled>
          Select operator…
        </option>
        {operators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op] ?? op}
          </option>
        ))}
      </select>
      <span className={styles.chevron} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
