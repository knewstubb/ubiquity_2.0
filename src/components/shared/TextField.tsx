import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'default' | 'small';
  state?: 'default' | 'error';
  sectionLabel?: string;
  fieldLabel?: string;
  validationMessage?: string;
  prefix?: string;
  suffix?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    size = 'default',
    state = 'default',
    sectionLabel,
    fieldLabel,
    validationMessage,
    prefix,
    suffix,
    leadingIcon,
    trailingIcon,
    disabled,
    id,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {sectionLabel && (
        <span className="font-sans text-base font-semibold text-foreground pb-1">
          {sectionLabel}
        </span>
      )}
      {fieldLabel && (
        <label htmlFor={id} className="font-sans text-sm font-semibold leading-[14px] text-muted-foreground">
          {fieldLabel}
        </label>
      )}
      <div
        className={cn(
          'flex flex-row rounded-md border border-border overflow-hidden',
          'transition-[border-color,box-shadow] duration-200 ease-in-out',
          'hover:not-[.disabled]:not-[.error]:border-border-strong',
          'focus-within:not-[.disabled]:not-[.error]:border-primary focus-within:not-[.disabled]:not-[.error]:shadow-[0px_0px_10px_0px_rgba(77,212,182,0.15),0px_0px_4px_0px_rgba(20,184,138,0.3)]',
          state === 'error' && 'error border-destructive focus-within:border-destructive focus-within:shadow-[0px_0px_10px_0px_rgba(239,68,68,0.15),0px_0px_4px_0px_rgba(239,68,68,0.3)]',
          disabled && 'disabled opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        {prefix && (
          <span className="flex items-center justify-center px-3 py-2 bg-secondary font-sans text-base font-normal text-muted-foreground whitespace-nowrap shrink-0 border-r border-border">
            {prefix}
          </span>
        )}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 bg-background flex-1',
          size === 'default' && 'min-h-9',
          size === 'small' && 'min-h-8 py-1.5',
        )}>
          {leadingIcon && (
            <span className="flex items-center justify-center w-5 h-5 shrink-0 text-muted-foreground">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className="flex-1 border-none bg-transparent outline-none font-sans text-base font-normal text-foreground min-w-0 placeholder:text-muted-foreground disabled:cursor-not-allowed"
            disabled={disabled}
            {...rest}
          />
          {trailingIcon && (
            <span className="flex items-center justify-center w-5 h-5 shrink-0 text-muted-foreground">
              {trailingIcon}
            </span>
          )}
        </div>
        {suffix && (
          <span className="flex items-center justify-center px-3 py-2 bg-secondary font-sans text-base font-normal text-muted-foreground whitespace-nowrap shrink-0 border-l border-border">
            {suffix}
          </span>
        )}
      </div>
      {validationMessage && (
        <span className={cn(
          'font-sans text-xs font-semibold text-muted-foreground',
          state === 'error' && 'text-danger-text',
        )}>
          {validationMessage}
        </span>
      )}
    </div>
  );
});
