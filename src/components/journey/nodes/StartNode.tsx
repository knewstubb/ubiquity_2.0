import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Play } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';

export interface StartNodeData {
  label?: string;
}

/**
 * Fixed Start node — always present, anchors the beginning of the journey.
 * Cannot be deleted. Styled consistently with other journey nodes.
 */
export function StartNode({ data, selected }: NodeProps & { data: StartNodeData }) {
  const label = data?.label ?? 'Start';

  return (
    <div
      className={cn(
        'relative min-w-[140px] max-w-[180px] rounded-sm border border-border border-l-[3px] border-l-mint-500 bg-background shadow-sm font-sans cursor-default select-none transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-mint-500 shadow-[0_0_0_2px_color-mix(in_srgb,var(--mint-500)_25%,transparent)]',
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-mint-500 text-white">
            <Play size={14} weight="fill" />
          </div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="!w-2 !h-2 !bg-mint-500 !border-0"
      />
    </div>
  );
}
