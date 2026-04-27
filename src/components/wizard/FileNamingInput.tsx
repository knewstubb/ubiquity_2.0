import { useRef } from 'react';
import styles from './FileNamingInput.module.css';

interface FileNamingInputProps {
  value: string;
  onChange: (pattern: string) => void;
}

const TOKENS = [
  { token: '{connector_name}', label: 'Connector Name' },
  { token: '{date}', label: 'Date' },
  { token: '{timestamp}', label: 'Timestamp' },
];

export function FileNamingInput({ value, onChange }: FileNamingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function insertToken(token: string) {
    const input = inputRef.current;
    if (!input) {
      onChange(value + token);
      return;
    }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + token + value.slice(end);
    onChange(newValue);
    // Restore cursor position after token
    requestAnimationFrame(() => {
      const pos = start + token.length;
      input.setSelectionRange(pos, pos);
      input.focus();
    });
  }

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="file-naming-input">File Naming Pattern</label>
      <input
        ref={inputRef}
        id="file-naming-input"
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="{connector_name}_{date}"
      />
      <div className={styles.tokens}>
        {TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            className={styles.tokenChip}
            onClick={() => insertToken(t.token)}
            title={`Insert ${t.label}`}
          >
            {t.token}
          </button>
        ))}
      </div>
    </div>
  );
}
