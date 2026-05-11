import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

export function RadioCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  disabled = false,
  name,
  value,
  className,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center w-[140px] h-[82px] p-2 border rounded-md cursor-pointer select-none gap-1 transition-[border-color,box-shadow,background-color] duration-150 ease-out',
        selected
          ? 'border-primary bg-background shadow-lg'
          : 'border-border bg-secondary hover:border-accent',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input
        type="radio"
        className="absolute opacity-0 w-0 h-0 pointer-events-none peer"
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        name={name}
        value={value}
      />
      <div className="flex flex-col items-center justify-center gap-1 w-full peer-focus-visible:outline-2 peer-focus-visible:outline-ring peer-focus-visible:outline-offset-2 peer-focus-visible:rounded-md">
        {icon && (
          <span
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-md shrink-0',
              selected ? 'text-primary' : 'text-tertiary-foreground',
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col items-center gap-0 min-w-0">
          <span
            className={cn(
              'text-[13px] font-semibold leading-[18px] text-center',
              selected ? 'text-primary' : 'text-tertiary-foreground',
            )}
          >
            {title}
          </span>
          {description && (
            <span className="text-xs text-tertiary-foreground leading-normal text-center hidden">
              {description}
            </span>
          )}
        </div>
      </div>
      {/* Radio dot hidden in card mode */}
      <span className="hidden" />
    </label>
  );
}
