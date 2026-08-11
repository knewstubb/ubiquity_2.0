import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FlagCheckered } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';

export interface FixedEndNodeData {
  label?: string;
}

/**
 * Fixed End node — always present, anchors the end of the journey.
 * Cannot be deleted. Styled consistently with other journey nodes.
 */
export function FixedEndNode({ data, selected }: NodeProps & { data: FixedEndNodeData }) {
  const label = data?.label ?? 'End';

  return (
    <div
      className={cn(
        'relative min-w-[140px] max-w-[180px] rounded-sm border border-border border-l-[3px] border-l-zinc-400 bg-background shadow-sm font-sans cursor-default select-none transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-zinc-500 shadow-[0_0_0_2px_color-mix(in_srgb,var(--zinc-500)_25%,transparent)]',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-2 !h-2 !bg-zinc-400 !border-0"
      />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-zinc-400 text-white">
            <FlagCheckered size={14} weight="fill" />
          </div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
