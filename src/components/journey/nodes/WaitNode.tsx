import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Clock,
  Hourglass,
  CalendarCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, WaitSubType } from '../../../models/journey';
import styles from './nodeStyles.module.css';

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

  const nodeClasses = [
    styles.node,
    styles.wait,
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
      <Handle type="target" position={Position.Top} />
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
