import { cn } from '../../lib/utils';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onToggle }: TagFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by type">
      {tags.map((tag) => {
        const isActive = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            className={cn(
              'inline-flex items-center px-3 py-1 border rounded-full bg-transparent text-xs font-medium text-muted-foreground cursor-pointer transition-[background-color,color,border-color] duration-150 ease-out whitespace-nowrap leading-tight',
              'hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
              isActive && 'bg-accent text-accent-foreground border-primary hover:bg-accent',
              !isActive && 'border-border'
            )}
            onClick={() => onToggle(tag)}
            aria-pressed={isActive}
            type="button"
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
