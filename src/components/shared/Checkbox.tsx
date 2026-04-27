import { useEffect, useRef, type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
}

export function Checkbox({ label, id, className = '', indeterminate = false, ...rest }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? (label ? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={`${styles.wrapper} ${className}`} htmlFor={inputId}>
      <input ref={inputRef} type="checkbox" id={inputId} className={styles.input} {...rest} />
      <span className={styles.checkmark} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
