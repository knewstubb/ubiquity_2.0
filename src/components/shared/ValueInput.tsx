import { useState, useRef, useEffect } from 'react';
import styles from './ValueInput.module.css';

interface ValueInputProps {
  fieldDataType: string | undefined;
  operator: string;
  value: string | string[] | number;
  enumValues?: string[];
  onChange: (value: string | string[] | number) => void;
  disabled?: boolean;
}

export function ValueInput({ fieldDataType, operator, value, enumValues, onChange, disabled = false }: ValueInputProps) {
  // No-value operators
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return null;
  }

  // Between operator — two inputs
  if (operator === 'between') {
    return (
      <BetweenInput
        fieldDataType={fieldDataType}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // In the last — number + "days"
  if (operator === 'in_the_last') {
    return (
      <InTheLastInput value={value} onChange={onChange} disabled={disabled} />
    );
  }

  // Enum multi-select
  if (fieldDataType === 'enum' && enumValues && (operator === 'is_any_of')) {
    return (
      <MultiSelectInput
        enumValues={enumValues}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // Enum single select
  if (fieldDataType === 'enum' && enumValues) {
    return (
      <EnumSelectInput
        enumValues={enumValues}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // Date input
  if (fieldDataType === 'date') {
    return (
      <input
        type="date"
        className={styles.input}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Value"
      />
    );
  }

  // Number input
  if (fieldDataType === 'number') {
    return (
      <input
        type="number"
        className={styles.input}
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        disabled={disabled}
        placeholder="Enter value…"
        aria-label="Value"
      />
    );
  }

  // Default: string text input
  return (
    <input
      type="text"
      className={styles.input}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Enter value…"
      aria-label="Value"
    />
  );
}


/* ── Between input (min/max or start/end) ── */
function BetweenInput({
  fieldDataType,
  value,
  onChange,
  disabled,
}: {
  fieldDataType: string | undefined;
  value: string | string[] | number;
  onChange: (v: string | string[] | number) => void;
  disabled: boolean;
}) {
  const parts = typeof value === 'string' ? value.split('|') : ['', ''];
  const inputType = fieldDataType === 'date' ? 'date' : fieldDataType === 'number' ? 'number' : 'text';
  const labels = fieldDataType === 'date' ? ['Start', 'End'] : ['Min', 'Max'];

  const handleChange = (index: number, v: string) => {
    const next = [...parts];
    next[index] = v;
    onChange(next.join('|'));
  };

  return (
    <div className={styles.betweenRow}>
      <input
        type={inputType}
        className={styles.input}
        value={parts[0] ?? ''}
        onChange={(e) => handleChange(0, e.target.value)}
        disabled={disabled}
        placeholder={labels[0]}
        aria-label={labels[0]}
      />
      <span className={styles.betweenLabel}>and</span>
      <input
        type={inputType}
        className={styles.input}
        value={parts[1] ?? ''}
        onChange={(e) => handleChange(1, e.target.value)}
        disabled={disabled}
        placeholder={labels[1]}
        aria-label={labels[1]}
      />
    </div>
  );
}

/* ── In the last N days ── */
function InTheLastInput({
  value,
  onChange,
  disabled,
}: {
  value: string | string[] | number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.inLastRow}>
      <input
        type="number"
        className={styles.input}
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
        disabled={disabled}
        min={1}
        placeholder="30"
        aria-label="Number of days"
      />
      <span className={styles.daysLabel}>days</span>
    </div>
  );
}

/* ── Enum single select ── */
function EnumSelectInput({
  enumValues,
  value,
  onChange,
  disabled,
}: {
  enumValues: string[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 160 }}>
      <select
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Value"
        style={{ appearance: 'none', paddingRight: 32 }}
      >
        <option value="" disabled>Select value…</option>
        {enumValues.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 12, pointerEvents: 'none', color: 'var(--color-zinc-500)', display: 'flex', alignItems: 'center' }} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/* ── Multi-select dropdown for enum fields ── */
function MultiSelectInput({
  enumValues,
  value,
  onChange,
  disabled,
}: {
  enumValues: string[];
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
    onChange(next);
  };

  const displayText = value.length > 0 ? value.join(', ') : undefined;

  return (
    <div className={styles.multiSelect} ref={ref}>
      <button
        type="button"
        className={styles.multiSelectTrigger}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-label="Select values"
      >
        {displayText ? (
          <span>{displayText}</span>
        ) : (
          <span className={styles.placeholder}>Select values…</span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className={styles.multiSelectDropdown}>
          {enumValues.map((v) => (
            <label key={v} className={styles.multiSelectOption}>
              <input
                type="checkbox"
                checked={value.includes(v)}
                onChange={() => toggle(v)}
              />
              {v}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
