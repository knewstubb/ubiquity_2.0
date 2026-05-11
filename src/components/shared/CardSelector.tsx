import { CheckCircle } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

interface CardSelectorProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CardSelector({
  icon,
  label,
  selected = false,
  disabled = false,
  onClick,
  className,
}: CardSelectorProps) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-md border-none cursor-pointer outline-none bg-background min-h-[80px] flex-1 transition-[border-color,box-shadow,background] duration-200 ease-in-out',
        selected && 'shadow-[inset_0_0_0_1px_var(--primary)] text-primary after:absolute after:inset-0 after:rounded-md after:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.12)] after:pointer-events-none',
        !selected && 'shadow-[inset_0_0_0_1px_var(--border)] text-muted-foreground',
        !disabled && !selected && 'hover:shadow-[inset_0_0_0_1px_var(--primary)] hover:text-primary hover:bg-accent',
        selected && !disabled && 'hover:bg-accent',
        'focus-visible:shadow-[inset_0_0_0_1px_var(--primary),0px_0px_10px_0px_rgba(77,212,182,0.30),0px_0px_4px_0px_rgba(20,184,138,0.5)]',
        disabled && 'shadow-[inset_0_0_0_1px_var(--disabled)] text-disabled-foreground cursor-not-allowed opacity-60 pointer-events-none',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center text-primary bg-background rounded-full">
          <CheckCircle size={20} weight="fill" />
        </span>
      )}
      <span className="flex items-center justify-center w-6 h-6">{icon}</span>
      <span className="font-sans text-[13px] font-semibold leading-[18px] uppercase text-center">
        {label}
      </span>
    </button>
  );
}
