/**
 * @component ChipInput
 * @description Multi-value input that converts typed text into removable chips.
 * Supports free-text entry (Enter/Tab/comma to commit) and optional dropdown selection.
 *
 * @designDecisions
 * - Chips use pill shape (rounded-full) with primary border to distinguish from static badges
 * - Validation pill appears below the input to give immediate feedback without blocking entry
 * - Dropdown stays open after selection so users can pick multiple options in sequence
 * - 4px radius on the container per docs/ui/borders-radius.md
 *
 * @usage
 * - Use for multi-email fields (recipients, CC, alert emails)
 * - Use with options prop for constrained multi-select (e.g. selecting from a list of roles)
 * - Prefer over a multi-select dropdown when users need to see all selected values at once
 *
 * @sizes
 * - sm: compact contexts like table filters or inline forms
 * - default: standard form fields
 * - lg: prominent inputs or touch-friendly contexts
 */
import { useState, useRef, type KeyboardEvent } from 'react';
import { X, CaretDown, EnvelopeSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  type?: string;
  size?: 'sm' | 'default' | 'lg';
  options?: string[];
  /** Validation function — returns true if value is valid */
  validate?: (value: string) => boolean;
  /** Label for the "copy from above" action */
  copyLabel?: string;
  /** Callback when "copy from above" is clicked */
  onCopy?: () => void;
  /** Field label shown above the input */
  label?: string;
  className?: string;
  'aria-label'?: string;
}

function defaultEmailValidate(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ChipInput({
  values,
  onChange,
  placeholder = 'Add item…',
  type = 'text',
  size = 'default',
  options,
  validate,
  copyLabel,
  onCopy,
  label,
  className,
  'aria-label': ariaLabel,
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingOptions = options?.filter((o) => !values.includes(o)) ?? [];
  const hasDropdown = options && options.length > 0;

  // Use provided validate, or default email validation when type is email
  const validateFn = validate ?? (type === 'email' ? defaultEmailValidate : undefined);

  // Determine validation state of current input
  const trimmed = inputValue.trim();
  const isTyping = trimmed.length > 0;
  const isValid = isTyping && validateFn ? validateFn(trimmed) : false;
  const isInvalid = isTyping && validateFn ? !validateFn(trimmed) : false;
  const showValidation = isTyping && validateFn !== undefined;

  function addValue(raw: string) {
    const value = raw.trim();
    if (!value) return;
    // If validation exists, only add valid values
    if (validateFn && !validateFn(value)) return;
    if (!values.includes(value)) {
      onChange([...values, value]);
    }
    setInputValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      if (trimmed) {
        e.preventDefault();
        addValue(inputValue);
      }
    }
    if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
    if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  }

  function handleBlur() {
    if (inputValue.trim()) addValue(inputValue);
    setTimeout(() => setDropdownOpen(false), 150);
  }

  function handleFocus() {
    if (hasDropdown) setDropdownOpen(true);
  }

  function handleClearAll() {
    onChange([]);
    inputRef.current?.focus();
  }

  function handleSelectOption(option: string) {
    if (!values.includes(option)) {
      onChange([...values, option]);
    }
    setInputValue('');
    inputRef.current?.focus();
  }

  function handleValidationPillClick() {
    addValue(inputValue);
  }

  const sizeClasses = {
    sm: 'min-h-8 py-1 px-1.5 text-xs',
    default: 'min-h-10 py-1.5 px-2 text-sm',
    lg: 'min-h-12 py-2 px-3 text-base',
  };

  const chipSizeClasses = {
    sm: 'py-0.5 px-1.5 text-[10px]',
    default: 'py-1 px-2 text-xs',
    lg: 'py-1.5 px-2.5 text-sm',
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Label row with optional copy action */}
      {(label || copyLabel) && (
        <div className="flex items-center justify-between">
          {label && <p className="text-xs font-medium text-muted-foreground m-0">{label}</p>}
          {copyLabel && onCopy && (
            <button
              type="button"
              className="bg-transparent border-none text-primary text-xs font-medium cursor-pointer p-0 hover:underline"
              onClick={onCopy}
            >
              {copyLabel}
            </button>
          )}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div
          className={cn(
            'border border-input rounded-md flex flex-wrap items-center gap-1.5 cursor-text bg-background',
            'focus-within:border-ring focus-within:shadow-ring',
            sizeClasses[size],
            className,
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {values.map((value) => (
            <span
              key={value}
              className={cn(
                'inline-flex items-center gap-1 border border-primary text-primary rounded-full font-medium leading-none whitespace-nowrap hover:bg-accent',
                chipSizeClasses[size],
              )}
            >
              {value}
              <button
                type="button"
                className="bg-transparent border-none text-primary cursor-pointer p-0 leading-none flex items-center hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(values.filter((v) => v !== value));
                }}
                aria-label={`Remove ${value}`}
              >
                <X size={size === 'sm' ? 8 : size === 'lg' ? 12 : 10} weight="bold" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className={cn(
              'border-none outline-none text-foreground bg-transparent flex-1 min-w-20 py-0.5 placeholder:text-muted-foreground',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
            )}
            type={type}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={values.length === 0 ? placeholder : ''}
            aria-label={ariaLabel}
          />
          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            {values.length > 0 && (
              <button
                type="button"
                className="bg-transparent border-none text-muted-foreground cursor-pointer p-1 leading-none flex items-center hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                aria-label="Clear all"
              >
                <X size={12} />
              </button>
            )}
            {hasDropdown && (
              <button
                type="button"
                className="bg-transparent border-none text-muted-foreground cursor-pointer p-0.5 leading-none flex items-center hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((v) => !v);
                  inputRef.current?.focus();
                }}
                aria-label="Toggle dropdown"
              >
                <CaretDown size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Validation pill */}
        {showValidation && (
          <div
            className={cn(
              'mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors duration-150 border',
              isValid && 'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
              isInvalid && 'bg-background text-destructive border-destructive',
            )}
            onClick={handleValidationPillClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleValidationPillClick();
            }}
            aria-label={isValid ? `Add ${trimmed}` : `Invalid: ${trimmed}`}
          >
            <EnvelopeSimple size={14} weight={isValid ? 'fill' : 'regular'} />
            <span>{trimmed}</span>
          </div>
        )}

        {/* Dropdown */}
        {hasDropdown && dropdownOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-popover border border-border rounded-md shadow-md max-h-[180px] overflow-y-auto">
            {remainingOptions.length > 0 ? (
              remainingOptions.map((option) => (
                <div
                  key={option}
                  className="py-2 px-3 text-sm text-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(option);
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                No more options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
