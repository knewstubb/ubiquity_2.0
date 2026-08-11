import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';

export interface InsertableEdgeData {
  onInsertClick?: (edgeId: string, screenX: number, screenY: number) => void;
  isPickerOpen?: boolean;
}

/**
 * Custom edge with an inline (+) button at the midpoint.
 * Uses smooth Bezier curves for organic flow.
 * Clicking the button triggers node insertion.
 */
export function InsertableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<InsertableEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.isPickerOpen ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pass screen coordinates for positioning the picker near the cursor
    data?.onInsertClick?.(id, e.clientX, e.clientY);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 bg-white text-zinc-400 cursor-pointer transition-all duration-150',
              'hover:border-mint-500 hover:bg-mint-50 hover:text-mint-500 hover:scale-110',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2',
              isActive && 'border-solid border-mint-500 bg-mint-500 text-white scale-110',
            )}
            aria-label="Insert node"
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
