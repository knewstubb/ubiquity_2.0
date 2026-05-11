import { cn } from '../../lib/utils';

interface TypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onToggle: (type: string) => void;
}

export function TypeFilter({ types, selectedTypes, onToggle }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by asset type">
      {types.map((type) => {
        const isActive = selectedTypes.includes(type);
        return (
          <button
            key={type}
            className={cn(
              "inline-flex items-center py-1 px-3 border rounded-full text-xs font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap leading-tight capitalize",
              isActive
                ? "bg-accent text-accent-foreground border-primary hover:bg-accent"
                : "bg-transparent text-muted-foreground border-border hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            )}
            onClick={() => onToggle(type)}
            aria-pressed={isActive}
            type="button"
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
