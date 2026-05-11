import { cn } from '../../lib/utils';

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-tertiary-foreground',
        'cursor-grab p-1 rounded-sm transition-colors duration-150',
        'hover:text-muted-foreground hover:bg-secondary',
        'active:cursor-grabbing',
        className,
      )}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </span>
  );
}
