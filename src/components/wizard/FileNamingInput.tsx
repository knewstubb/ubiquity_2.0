import { useRef } from 'react';

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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor="file-naming-input">File Naming Pattern</label>
      <input
        ref={inputRef}
        id="file-naming-input"
        className="w-full py-2 px-3 border border-border rounded-md text-sm text-foreground bg-background outline-none box-border placeholder:text-tertiary-foreground focus:border-primary focus:shadow-[--ring-shadow]"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="{connector_name}_{date}"
      />
      <div className="flex gap-2 flex-wrap">
        {TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            className="px-2 py-0.5 text-xs bg-accent text-accent-foreground border border-accent rounded-full cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
