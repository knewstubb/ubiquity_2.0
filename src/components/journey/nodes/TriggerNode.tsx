import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Users,
  Lightning,
  Hand,
  CalendarBlank,
  WarningCircle,
} from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';

export interface TriggerNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

const subTypeIcons: Record<TriggerSubType, React.ComponentType<{ size?: number; weight?: string }>> = {
  'segment-entry': Users,
  'event-based': Lightning,
  'manual': Hand,
  'scheduled': CalendarBlank,
};

function isIncomplete(node: JourneyNode): boolean {
  const { config } = node;
  switch (config.subType) {
    case 'segment-entry':
      return !config.segmentId;
    case 'event-based':
      return !config.eventType;
    case 'scheduled':
      return !config.date;
    case 'manual':
      return false;
    default:
      return false;
  }
}

export function TriggerNode({ data, selected }: NodeProps & { data: TriggerNodeData }) {
  const { journeyNode, hasError } = data;
  const subType = journeyNode.subType as TriggerSubType;
  const Icon = subTypeIcons[subType] ?? Users;
  const summary = getNodeSummaryLabel(journeyNode);
  const incomplete = isIncomplete(journeyNode);

  return (
    <div
      className={cn(
        'relative min-w-[180px] max-w-[240px] rounded-sm border border-border border-l-[3px] border-l-mint-500 bg-background shadow-sm font-sans cursor-grab transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        selected && 'border-mint-500 shadow-[0_0_0_2px_color-mix(in_srgb,var(--mint-500)_25%,transparent)]',
        incomplete && !hasError && 'border-dashed border-border-strong border-l-dashed',
        hasError && 'border-red-500 border-l-red-500',
      )}
    >
      {hasError && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-primary-foreground text-[10px] leading-none">
          <WarningCircle size={10} weight="fill" />
        </div>
      )}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 text-mint-500">
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
