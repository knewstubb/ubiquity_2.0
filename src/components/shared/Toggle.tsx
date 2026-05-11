import { cn } from '../../lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, id, className }: ToggleProps) {
  const inputId = id ?? (label ? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
      htmlFor={inputId}
    >
      <input
        type="checkbox"
        id={inputId}
        className="absolute opacity-0 w-0 h-0 pointer-events-none peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      />
      <span
        className={cn(
          'relative inline-flex items-center w-[44px] h-[24px] rounded-[12px] shrink-0 border transition-colors duration-150 ease-out peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2',
          checked
            ? 'bg-primary border-primary'
            : 'bg-background-sunken border-border',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 w-5 h-5 bg-background rounded-full shadow-[0px_1px_3px_rgba(0,0,0,0.15),0px_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-150 ease-out',
            checked && 'translate-x-5',
          )}
        />
      </span>
      {label && (
        <span className="font-sans text-sm font-medium text-foreground leading-5">
          {label}
        </span>
      )}
    </label>
  );
}
