import { MagnifyingGlass } from '@phosphor-icons/react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search assets…' }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-tertiary-foreground pointer-events-none flex items-center" aria-hidden="true">
        <MagnifyingGlass size={16} />
      </span>
      <input
        type="text"
        className="w-full py-2 pr-3 pl-8 text-sm text-foreground bg-background border border-border rounded-md transition-[border-color,box-shadow] duration-150 leading-normal placeholder:text-tertiary-foreground hover:border-border-strong focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--accent)] focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--accent)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
