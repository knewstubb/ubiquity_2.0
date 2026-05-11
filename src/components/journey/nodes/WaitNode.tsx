import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Clock,
  Hourglass,
  CalendarCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, WaitSubType } from '../../../models/journey';

export interface WaitNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

const subTypeIcons: Record<WaitSubType, React.ComponentType<{ size?: number; weight?: string }>> = {
  'time-delay': Clock,
  'wait-for-event': Hourglass,
  'wait-until-date': CalendarCheck,
};

function isIncomplete(node: JourneyNode): boolean {
  const { config } = node;
  switch (config.subType) {
    case 'time-delay':
      return config.duration <= 0;
    case 'wait-for-event':
      return !config.eventType;
    case 'wait-until-date':
      return !config.targetDate;
    default:
      return false;
  }
}

export function WaitNode({ data, selected }: NodeProps & { data: WaitNodeData }) {
  const { journeyNode, hasError } = data;
  const subType = journeyNode.subType as WaitSubType;
  const Icon = subTypeIcons[subType] ?? Clock;
  const summary = getNodeSummaryLabel(journeyNode);
  const incomplete = isIncomplete(journeyNode);

  return (
    <div
      className={cn(
        'relative min-w-[180px] max-w-[240px] rounded-sm border border-border border-l-[3px] border-l-amber-500 bg-background shadow-sm font-sans cursor-grab transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-amber-500 shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-amber-500)_25%,transparent)]',
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
          <div className="flex items-center justify-center shrink-0 w-6 h-6 text-amber-500">
            <Icon size={20} weight="duotone" />
          </div>
          <div className="text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {journeyNode.label}
          </div>
        </div>
        <div className="mt-1 pl-8 text-xs text-muted-foreground leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
          {summary}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
