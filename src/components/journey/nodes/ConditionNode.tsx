import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { GitFork, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import type { JourneyNode, IfElseConfig } from '../../../models/journey';

export interface ConditionNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

function isIncomplete(node: JourneyNode): boolean {
  const config = node.config as IfElseConfig;
  return config.condition.rules.length === 0;
}

/**
 * ConditionNode - A compact decision point node for conditional splits.
 * 
 * This is just the decision node itself. The True/False labels are
 * separate BranchLabelNode components that sit on the connection lines.
 * 
 * Design matches JourneyNodeCard:
 * - Fixed width 240px, rounded-lg, shadow-sm
 * - Header with icon (20px) and title (12px semibold)
 * - Separator line
 * - Condition summary text below
 * - Two output handles (true/false) that connect to BranchLabelNodes
 */
export function ConditionNode({ data, selected }: NodeProps & { data: ConditionNodeData }) {
  const { journeyNode, hasError } = data;
  const incomplete = isIncomplete(journeyNode);
  const config = journeyNode.config as IfElseConfig;
  
  // Build a summary of the condition
  const conditionSummary = config.condition.rules.length > 0
    ? `${config.condition.rules[0].field} ${config.condition.rules[0].operator}`
    : 'Set condition...';

  return (
    <div
      className={cn(
        'relative w-[240px] rounded-lg bg-white shadow-sm font-sans cursor-default transition-all duration-150',
        'border border-border',
        'hover:shadow-md hover:border-primary/30',
        selected && 'ring-2 ring-primary ring-offset-2',
        incomplete && !hasError && 'border-dashed border-muted-foreground',
        hasError && 'border-red-500',
      )}
    >
      {/* Error indicator */}
      {hasError && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white">
          <WarningCircle size={10} weight="fill" />
        </div>
      )}

      {/* Input handle (top center) */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GitFork size={20} weight="regular" className="text-sky-500" />
        <span className="text-sm font-semibold text-secondary-foreground">Conditional split</span>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Condition summary */}
      <div className="px-3 py-3">
        <p className="text-base text-foreground leading-snug m-0 text-center">{conditionSummary}</p>
      </div>

      {/* Output handles - two branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
        style={{ left: '70%' }}
      />
    </div>
  );
}
