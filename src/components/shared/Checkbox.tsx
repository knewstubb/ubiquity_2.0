import { useEffect, useRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

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
    <label
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        'has-[input:disabled]:cursor-not-allowed',
        className,
      )}
      htmlFor={inputId}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={inputId}
        className="peer absolute opacity-0 w-0 h-0 pointer-events-none"
        {...rest}
      />
      <span
        className={cn(
          'inline-flex items-center justify-center w-[18px] h-[18px]',
          'border-2 border-tertiary-foreground rounded-sm bg-background',
          'transition-[background-color,border-color] duration-150 shrink-0',
          'peer-checked:bg-primary peer-checked:border-primary',
          'peer-indeterminate:bg-primary peer-indeterminate:border-primary',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          /* Checkmark via after pseudo-element */
          'peer-checked:after:content-[""] peer-checked:after:block peer-checked:after:w-[5px] peer-checked:after:h-[9px]',
          'peer-checked:after:border-primary-foreground peer-checked:after:border-solid',
          'peer-checked:after:border-t-0 peer-checked:after:border-l-0 peer-checked:after:border-r-2 peer-checked:after:border-b-2',
          'peer-checked:after:rotate-45 peer-checked:after:mb-0.5',
          /* Indeterminate dash via after pseudo-element */
          'peer-indeterminate:after:content-[""] peer-indeterminate:after:block peer-indeterminate:after:w-2.5 peer-indeterminate:after:h-0.5',
          'peer-indeterminate:after:bg-primary-foreground peer-indeterminate:after:rounded-[1px]',
        )}
      />
      {label && <span className="text-sm text-foreground leading-normal">{label}</span>}
    </label>
  );
}
