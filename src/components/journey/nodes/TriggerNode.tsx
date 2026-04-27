import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Users,
  Lightning,
  Hand,
  CalendarBlank,
  WarningCircle,
} from '@phosphor-icons/react';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';
import styles from './nodeStyles.module.css';

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

  const nodeClasses = [
    styles.node,
    styles.trigger,
    selected ? styles.selected : '',
    incomplete && !hasError ? styles.incomplete : '',
    hasError ? styles.error : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={nodeClasses}>
      {hasError && (
        <div className={styles.errorIcon}>
          <WarningCircle size={10} weight="fill" />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Icon size={20} weight="duotone" />
          </div>
          <div className={styles.label}>{journeyNode.label}</div>
        </div>
        <div className={styles.summary}>{summary}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
