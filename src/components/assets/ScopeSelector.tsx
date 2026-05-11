import { cn } from '../../lib/utils';
import type { AssetScope } from '../../models/asset';

interface ScopeSelectorProps {
  activeScope: AssetScope;
  onScopeChange: (scope: AssetScope) => void;
}

const SCOPES: { value: AssetScope; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'account', label: 'Account' },
];

export function ScopeSelector({ activeScope, onScopeChange }: ScopeSelectorProps) {
  return (
    <div className="inline-flex border border-border rounded-md overflow-hidden" role="tablist" aria-label="Asset scope">
      {SCOPES.map(({ value, label }, index) => (
        <button
          key={value}
          role="tab"
          type="button"
          aria-selected={activeScope === value}
          className={cn(
            "py-2 px-4 border-none text-sm font-medium cursor-pointer transition-colors duration-150 leading-tight",
            index < SCOPES.length - 1 && "border-r border-border",
            activeScope === value
              ? "bg-background text-primary font-semibold hover:bg-background"
              : "bg-secondary text-muted-foreground hover:bg-background-sunken focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
          )}
          onClick={() => onScopeChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
