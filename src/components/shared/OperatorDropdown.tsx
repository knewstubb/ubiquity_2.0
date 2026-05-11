import { useEffect } from 'react';
import { getOperatorsForFieldType, operatorLabels } from '../../data/operatorRegistry';
import { cn } from '../../lib/utils';

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
    <div className="relative flex items-center min-w-[160px]">
      <select
        className={cn(
          'w-full appearance-none py-2 pl-3 pr-8 text-sm text-foreground',
          'bg-background border border-border rounded-sm leading-normal',
          'cursor-pointer transition-[border-color,box-shadow] duration-150',
          'hover:border-tertiary-foreground',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
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
      <span className="absolute right-3 pointer-events-none text-muted-foreground flex items-center" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
