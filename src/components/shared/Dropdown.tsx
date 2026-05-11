import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
}

export function Dropdown({ options, label, placeholder, id, className = '', ...rest }: DropdownProps) {
  const selectId = id ?? (label ? `dropdown-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none py-2 pl-3 pr-8 text-sm text-foreground',
            'bg-background border border-border rounded-md leading-normal',
            'cursor-pointer transition-[border-color,box-shadow] duration-150',
            'hover:border-tertiary-foreground',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent',
            'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 pointer-events-none text-muted-foreground flex items-center" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </span>
      </div>
    </div>
  );
}
