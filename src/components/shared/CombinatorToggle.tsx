import { cn } from '../../lib/utils';

interface CombinatorToggleProps {
  value: 'AND' | 'OR';
  onChange: (value: 'AND' | 'OR') => void;
  readOnly?: boolean;
}

export function CombinatorToggle({ value, onChange, readOnly = false }: CombinatorToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border overflow-hidden bg-background" role="radiogroup" aria-label="Combinator">
      <button
        type="button"
        className={cn(
          "px-3 py-[2px] text-xs font-semibold uppercase tracking-[0.5px] border-none cursor-pointer transition-colors duration-150 leading-[22px] bg-transparent text-tertiary-foreground",
          "hover:not-disabled:text-muted-foreground",
          "disabled:cursor-default",
          value === 'AND' && "bg-primary text-primary-foreground hover:not-disabled:bg-accent-hover hover:not-disabled:text-primary-foreground"
        )}
        onClick={() => onChange('AND')}
        disabled={readOnly}
        role="radio"
        aria-checked={value === 'AND'}
      >
        And
      </button>
      <button
        type="button"
        className={cn(
          "px-3 py-[2px] text-xs font-semibold uppercase tracking-[0.5px] border-none cursor-pointer transition-colors duration-150 leading-[22px] bg-transparent text-tertiary-foreground",
          "hover:not-disabled:text-muted-foreground",
          "disabled:cursor-default",
          value === 'OR' && "bg-primary text-primary-foreground hover:not-disabled:bg-accent-hover hover:not-disabled:text-primary-foreground"
        )}
        onClick={() => onChange('OR')}
        disabled={readOnly}
        role="radio"
        aria-checked={value === 'OR'}
      >
        Or
      </button>
    </div>
  );
}
