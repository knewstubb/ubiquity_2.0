import { Plus } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

export interface InsertNodeButtonProps {
  /** Position in canvas coordinates */
  x: number;
  y: number;
  /** Edge ID this button is associated with */
  edgeId: string;
  /** Called when the button is clicked */
  onClick: (edgeId: string, x: number, y: number) => void;
  /** Whether the picker is currently open for this edge */
  isActive?: boolean;
}

/**
 * Inline (+) button that appears on edges between nodes.
 * Clicking opens the NodeTypePicker to insert a new node at this position.
 */
export function InsertNodeButton({
  x,
  y,
  edgeId,
  onClick,
  isActive = false,
}: InsertNodeButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(edgeId, x, y);
      }}
      className={cn(
        'absolute flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 bg-white text-zinc-400 cursor-pointer transition-all duration-150 hover:border-mint-500 hover:bg-mint-50 hover:text-mint-500 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2',
        isActive && 'border-solid border-mint-500 bg-mint-500 text-white scale-110',
      )}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      aria-label="Insert node"
    >
      <Plus size={14} weight="bold" />
    </button>
  );
}
