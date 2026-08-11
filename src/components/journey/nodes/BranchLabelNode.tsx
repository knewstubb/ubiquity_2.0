import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { cn } from '../../../lib/utils';
import type { JourneyNode, BranchLabelConfig } from '../../../models/journey';

export interface BranchLabelNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

/**
 * BranchLabelNode - A compact inline node that displays on branch connection lines.
 * 
 * Design: Small pill with minimal padding
 * - Rounded pill shape
 * - Compact padding: 4px vertical, 10px horizontal
 * - Text: 11px semibold
 * - Just shows "True" or "False" text, no icons
 */
export function BranchLabelNode({ data, selected }: NodeProps & { data: BranchLabelNodeData }) {
  const { journeyNode } = data;
  const config = journeyNode.config as BranchLabelConfig;
  
  const isTrue = config.branchId === 'true';
  const label = isTrue ? 'True' : 'False';

  return (
    <div
      className={cn(
        'relative px-2.5 py-1 rounded-full bg-white border border-border shadow-sm font-sans cursor-default transition-all duration-150',
        'hover:shadow-md hover:border-primary/30',
        selected && 'ring-2 ring-primary ring-offset-1',
      )}
    >
      {/* Input handle (top) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target"
        className="!w-2 !h-2 !bg-muted-foreground !border-2 !border-background"
      />

      {/* Label - 11px semibold */}
      <span className="text-[11px] font-semibold text-foreground leading-none">
        {label}
      </span>

      {/* Output handle (bottom) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="default"
        className="!w-2 !h-2 !bg-muted-foreground !border-2 !border-background"
      />
    </div>
  );
}
