import { DotsSixVertical } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-muted-foreground',
        'cursor-grab p-1 rounded-sm transition-colors duration-150',
        'hover:text-foreground hover:bg-secondary',
        'active:cursor-grabbing',
        className,
      )}
      aria-hidden="true"
    >
      <DotsSixVertical size={16} weight="bold" />
    </span>
  );
}
