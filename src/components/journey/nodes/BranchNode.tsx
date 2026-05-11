import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { GitBranch, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import { getNodeSummaryLabel } from '../../../models/journey';
import type {
  JourneyNode,
  BranchSubType,
  BranchConfig,
  MultiWayConfig,
  AbSplitConfig,
} from '../../../models/journey';

export interface BranchNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

interface OutputHandle {
  id: string;
  label: string;
}

function getOutputHandles(config: BranchConfig): OutputHandle[] {
  switch (config.subType) {
    case 'if-else':
      return [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' },
      ];
    case 'ab-split': {
      const abConfig = config as AbSplitConfig;
      const bPercent = 100 - abConfig.variantAPercent;
      return [
        { id: 'variant-a', label: `Variant A (${abConfig.variantAPercent}%)` },
        { id: 'variant-b', label: `Variant B (${bPercent}%)` },
      ];
    }
    case 'multi-way': {
      const mwConfig = config as MultiWayConfig;
      const handles: OutputHandle[] = mwConfig.conditions.map((c) => ({
        id: c.id,
        label: c.label || c.id,
      }));
      handles.push({ id: 'everyone-else', label: 'Everyone Else' });
      return handles;
    }
    default:
      return [{ id: 'default', label: '' }];
  }
}

function isIncomplete(node: JourneyNode): boolean {
  const { config } = node;
  switch (config.subType) {
    case 'if-else':
      return config.condition.rules.length === 0;
    case 'ab-split':
      return config.variantAPercent < 1 || config.variantAPercent > 99;
    case 'multi-way':
      return config.conditions.length === 0;
    default:
      return false;
  }
}

export function BranchNode({ data, selected }: NodeProps & { data: BranchNodeData }) {
  const { journeyNode, hasError } = data;
  const _subType = journeyNode.subType as BranchSubType;
  const summary = getNodeSummaryLabel(journeyNode);
  const incomplete = isIncomplete(journeyNode);
  const outputHandles = getOutputHandles(journeyNode.config as BranchConfig);

  return (
    <div
      className={cn(
        'relative min-w-[180px] max-w-[240px] rounded-sm border border-border border-l-[3px] border-l-purple-500 bg-background shadow-sm font-sans cursor-grab transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-purple-500 shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-purple-500)_25%,transparent)]',
        incomplete && !hasError && 'border-dashed border-border-strong border-l-dashed',
        hasError && 'border-red-500 border-l-red-500',
      )}
    >
      {hasError && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-primary-foreground text-[10px] leading-none">
          <WarningCircle size={10} weight="fill" />
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 text-purple-500">
            <GitBranch size={20} weight="duotone" />
          </div>
          <div className="text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {journeyNode.label}
          </div>
        </div>
        <div className="mt-1 pl-8 text-xs text-muted-foreground leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
          {summary}
        </div>
      </div>
      {outputHandles.map((handle, index) => {
        const count = outputHandles.length;
        const left = count === 1 ? 50 : (index / (count - 1)) * 100;
        return (
          <div
            key={handle.id}
            style={{
              position: 'absolute',
              bottom: -18,
              left: `${left}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Handle
              type="source"
              position={Position.Bottom}
              id={handle.id}
              style={{ position: 'relative', left: 0, transform: 'none' }}
            />
            {handle.label && (
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {handle.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
