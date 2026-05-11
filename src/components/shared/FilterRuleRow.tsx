import type { FilterRule } from '../../models/segment';
import type { FieldDefinition } from '../../data/fieldRegistry';
import {
  CONTACT_FIELDS,
  TREATMENT_FIELDS,
  PRODUCT_FIELDS,
  getFieldByKey,
} from '../../data/fieldRegistry';
import { OperatorDropdown } from './OperatorDropdown';
import { ValueInput } from './ValueInput';
import { cn } from '../../lib/utils';

interface FilterRuleRowProps {
  rule: FilterRule;
  onChange: (rule: FilterRule) => void;
  onRemove: () => void;
  canRemove?: boolean;
  readOnly?: boolean;
  fields?: FieldDefinition[];
}

const FIELD_GROUPS: { label: string; fields: FieldDefinition[] }[] = [
  { label: 'Contact', fields: CONTACT_FIELDS },
  { label: 'Treatment', fields: TREATMENT_FIELDS },
  { label: 'Product', fields: PRODUCT_FIELDS },
];

export function FilterRuleRow({
  rule,
  onChange,
  onRemove,
  canRemove = true,
  readOnly = false,
  fields,
}: FilterRuleRowProps) {
  const fieldDef = rule.field ? (fields ?? []).find((f) => f.key === rule.field) ?? getFieldByKey(rule.field) : undefined;

  const handleFieldChange = (key: string) => {
    const newFieldDef = (fields ?? []).find((f) => f.key === key) ?? getFieldByKey(key);
    const prevFieldDef = fieldDef;
    // Reset operator and value when field type changes
    if (newFieldDef?.dataType !== prevFieldDef?.dataType) {
      onChange({ field: key, operator: '', value: '' });
    } else {
      onChange({ ...rule, field: key });
    }
  };

  const handleOperatorChange = (operator: string) => {
    onChange({ ...rule, operator, value: '' });
  };

  const handleValueChange = (value: string | string[] | number) => {
    onChange({ ...rule, value });
  };

  // Build grouped options or flat list
  const groupedFields = fields
    ? [{ label: 'Fields', fields }]
    : FIELD_GROUPS;

  return (
    <div className="flex items-center gap-2">
      {/* Field Picker */}
      <div className="relative flex items-center min-w-[180px]">
        <select
          className="w-full appearance-none py-2 pr-8 pl-3 text-sm text-foreground bg-background border border-border rounded-sm cursor-pointer transition-[border-color,box-shadow] duration-150 leading-normal hover:border-tertiary-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--ring)/0.2] disabled:opacity-50 disabled:cursor-not-allowed"
          value={rule.field}
          onChange={(e) => handleFieldChange(e.target.value)}
          disabled={readOnly}
          aria-label="Field"
        >
          <option value="" disabled>
            Select field…
          </option>
          {groupedFields.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.fields.map((f) => (
                <option key={`${group.label}-${f.key}`} value={f.key}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="absolute right-3 pointer-events-none text-muted-foreground flex items-center" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Operator Dropdown */}
      <OperatorDropdown
        fieldDataType={fieldDef?.dataType}
        value={rule.operator}
        onChange={handleOperatorChange}
        disabled={readOnly || !rule.field}
      />

      {/* Value Input */}
      {rule.field && rule.operator && (
        <ValueInput
          fieldDataType={fieldDef?.dataType}
          operator={rule.operator}
          value={rule.value}
          enumValues={fieldDef?.enumValues}
          onChange={handleValueChange}
          disabled={readOnly}
        />
      )}

      {/* Remove button */}
      <button
        type="button"
        className={cn(
          "flex items-center justify-center w-7 h-7 border-none bg-transparent text-tertiary-foreground rounded-sm cursor-pointer transition-colors duration-150 shrink-0",
          "hover:text-destructive hover:bg-red-50",
          "disabled:opacity-0 disabled:cursor-default disabled:pointer-events-none"
        )}
        onClick={onRemove}
        disabled={!canRemove || readOnly}
        aria-label="Remove rule"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
