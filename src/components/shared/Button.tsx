import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'destructive' | 'ghost';
  size?: 'large' | 'regular' | 'compact' | 'xs';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  solid: 'bg-primary text-primary-foreground hover:bg-accent-hover focus-visible:bg-accent-hover',
  outline: [
    'bg-background text-muted-foreground shadow-[inset_0_0_0_0.5px_var(--border)]',
    'hover:shadow-[inset_0_0_0_0.5px_var(--border-strong)] hover:bg-secondary',
  ].join(' '),
  destructive: [
    'bg-destructive text-primary-foreground',
    'hover:bg-danger-hover',
    'focus-visible:bg-danger-hover focus-visible:shadow-[0px_0px_10px_0px_rgba(239,68,68,0.30),0px_0px_10px_0px_rgba(239,68,68,0.15),0px_0px_4px_0px_rgba(239,68,68,0.5)]',
  ].join(' '),
  ghost: 'bg-transparent text-muted-foreground hover:bg-secondary',
} as const;

const sizeStyles = {
  large: 'px-4 py-2 text-base rounded-md gap-3',
  regular: 'px-4 py-1.5 text-base rounded-md gap-3',
  compact: 'px-3 py-1.5 text-sm font-semibold rounded-md gap-2',
  xs: 'px-3 py-1 text-sm font-semibold rounded-sm gap-2',
} as const;

export function Button({
  variant = 'solid',
  size = 'regular',
  leadingIcon,
  trailingIcon,
  disabled = false,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center border-none font-sans font-semibold cursor-pointer',
        'transition-[opacity,transform] duration-200 ease-in-out outline-none relative',
        'active:not-disabled:translate-y-px',
        'focus-visible:shadow-[0px_0px_10px_0px_rgba(77,212,182,0.30),0px_0px_10px_0px_rgba(20,184,138,0.15),0px_0px_4px_0px_rgba(20,184,138,0.5)]',
        variantStyles[variant],
        sizeStyles[size],
        disabled && [
          'opacity-60 cursor-not-allowed pointer-events-none',
          variant === 'outline' && 'bg-transparent shadow-[inset_0_0_0_0.5px_var(--disabled)]',
          variant === 'ghost' && 'bg-transparent',
          variant !== 'outline' && variant !== 'ghost' && 'bg-disabled text-disabled-foreground',
        ],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {leadingIcon && <span className="inline-flex items-center shrink-0">{leadingIcon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {trailingIcon && <span className="inline-flex items-center shrink-0">{trailingIcon}</span>}
    </button>
  );
}
