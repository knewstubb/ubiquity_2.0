import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { ArrowsIn } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import type { JourneyNode } from '../../../models/journey';

export interface JoinNodeData {
  journeyNode: JourneyNode;
}

export function JoinNode({ data, selected }: NodeProps & { data: JoinNodeData }) {
  const { journeyNode } = data;

  return (
    <div
      className={cn(
        'relative min-w-[180px] max-w-[240px] rounded-sm border border-border border-l-[3px] border-l-border-strong bg-background shadow-sm font-sans cursor-grab transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-border-strong shadow-[0_0_0_2px_color-mix(in_srgb,var(--border-strong)_25%,transparent)]',
      )}
    >
      <Handle type="target" position={Position.Top} id="input-0" />
      <Handle type="target" position={Position.Top} id="input-1" />
      <Handle type="target" position={Position.Top} id="input-2" />
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 text-border-strong">
            <ArrowsIn size={20} weight="duotone" />
          </div>
          <div className="text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {journeyNode.label}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
