import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { Users, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../../../lib/utils';
import type { JourneyNode } from '../../../models/journey';

export interface JourneyNodeCardProps {
  /** Node title displayed in header */
  title: string;
  /** Icon component from Phosphor */
  icon: PhosphorIcon;
  /** Icon color class (e.g., 'text-primary', 'text-amber-500') */
  iconColor?: string;
  /** Description/summary text - can include JSX for bold formatting */
  description?: React.ReactNode;
  /** Audience count to display (e.g., 533000 → "533k") */
  audienceCount?: number;
  /** Whether the node is selected */
  selected?: boolean;
  /** Whether the node has a validation error */
  hasError?: boolean;
  /** Whether the node configuration is incomplete (shows dashed border) */
  isIncomplete?: boolean;
  /** Custom className for the card */
  className?: string;
  /** Source handles configuration - defaults to single bottom handle */
  sourceHandles?: Array<{
    id: string;
    position: Position;
    style?: React.CSSProperties;
  }>;
  /** Whether to show the target (input) handle - defaults to true */
  showTargetHandle?: boolean;
}

/**
 * Formats a number for display (e.g., 533000 → "533k")
 */
function formatAudienceCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(count % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`;
  }
  return count.toString();
}

/**
 * JourneyNodeCard - A flexible card component for journey builder nodes.
 * 
 * Design based on Figma:
 * - Compact rounded card with subtle shadow
 * - Header row: Icon (20px, regular) + Title (12px semibold) + Audience count badge
 * - Body: Description text (14px, centered) supporting bold emphasis
 * - Connection handles for ReactFlow
 */
export function JourneyNodeCard({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  description,
  audienceCount,
  selected = false,
  hasError = false,
  isIncomplete = false,
  className,
  sourceHandles = [{ id: 'default', position: Position.Bottom }],
  showTargetHandle = true,
}: JourneyNodeCardProps) {
  return (
    <div
      className={cn(
        'relative w-[240px] rounded-lg bg-white shadow-sm font-sans cursor-default transition-all duration-150',
        'border border-border',
        'hover:shadow-md hover:border-primary/30',
        selected && 'ring-2 ring-primary ring-offset-2',
        isIncomplete && !hasError && 'border-dashed border-muted-foreground',
        hasError && 'border-red-500',
        className,
      )}
    >
      {/* Error indicator badge */}
      {hasError && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white">
          <WarningCircle size={10} weight="fill" />
        </div>
      )}

      {/* Target handle (input - top center) */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
        />
      )}

      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          {/* Icon */}
          <div className={cn('flex items-center justify-center shrink-0', iconColor)}>
            <Icon size={20} weight="regular" />
          </div>
          {/* Title - Body S Semi Bold (12px/600) */}
          <span className="text-sm font-semibold text-secondary-foreground">{title}</span>
        </div>

        {/* Audience count badge */}
        {audienceCount !== undefined && (
          <div className="flex items-center gap-1 text-secondary-foreground">
            <span className="text-sm font-semibold">{formatAudienceCount(audienceCount)}</span>
            <Users size={14} weight="regular" />
          </div>
        )}
      </div>

      {/* Description body */}
      {description && (
        <>
          <div className="border-t border-border" />
          <div className="px-3 py-3">
            <p className={cn(
              'text-base leading-snug m-0 text-center',
              isIncomplete ? 'text-warning font-medium' : 'text-foreground'
            )}>
              {description}
            </p>
          </div>
        </>
      )}

      {/* Source handles (output) */}
      {sourceHandles.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position}
          id={handle.id}
          style={handle.style}
          className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
        />
      ))}
    </div>
  );
}

/**
 * Wrapper for use as a ReactFlow node component.
 * Extracts props from the node data and passes to JourneyNodeCard.
 */
export interface JourneyNodeCardData {
  title: string;
  icon: PhosphorIcon;
  iconColor?: string;
  description?: React.ReactNode;
  audienceCount?: number;
  hasError?: boolean;
  isIncomplete?: boolean;
  sourceHandles?: JourneyNodeCardProps['sourceHandles'];
  showTargetHandle?: boolean;
  nodeType?: string;
  subType?: string;
  journeyNode?: JourneyNode;
}

export function JourneyNodeCardWrapper({ data, selected }: NodeProps & { data: JourneyNodeCardData }) {
  return (
    <JourneyNodeCard
      title={data.title}
      icon={data.icon}
      iconColor={data.iconColor}
      description={data.description}
      audienceCount={data.audienceCount}
      selected={selected}
      hasError={data.hasError}
      isIncomplete={data.isIncomplete}
      sourceHandles={data.sourceHandles}
      showTargetHandle={data.showTargetHandle}
    />
  );
}
