import styles from './CombinatorToggle.module.css';

interface CombinatorToggleProps {
  value: 'AND' | 'OR';
  onChange: (value: 'AND' | 'OR') => void;
  readOnly?: boolean;
}

export function CombinatorToggle({ value, onChange, readOnly = false }: CombinatorToggleProps) {
  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="Combinator">
      <button
        type="button"
        className={`${styles.option} ${value === 'AND' ? styles.active : ''}`}
        onClick={() => onChange('AND')}
        disabled={readOnly}
        role="radio"
        aria-checked={value === 'AND'}
      >
        And
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === 'OR' ? styles.active : ''}`}
        onClick={() => onChange('OR')}
        disabled={readOnly}
        role="radio"
        aria-checked={value === 'OR'}
      >
        Or
      </button>
    </div>
  );
}
