import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  SignOut,
  ArrowSquareRight,
  WarningCircle,
} from '@phosphor-icons/react';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, EndSubType } from '../../../models/journey';
import styles from './nodeStyles.module.css';

export interface EndNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

const subTypeIcons: Record<EndSubType, React.ComponentType<{ size?: number; weight?: string }>> = {
  'exit': SignOut,
  'move-to-journey': ArrowSquareRight,
};

function isIncomplete(node: JourneyNode): boolean {
  const { config } = node;
  switch (config.subType) {
    case 'exit':
      return false; // exit is always valid
    case 'move-to-journey':
      return !config.targetJourneyId;
    default:
      return false;
  }
}

export function EndNode({ data, selected }: NodeProps & { data: EndNodeData }) {
  const { journeyNode, hasError } = data;
  const subType = journeyNode.subType as EndSubType;
  const Icon = subTypeIcons[subType] ?? SignOut;
  const summary = getNodeSummaryLabel(journeyNode);
  const incomplete = isIncomplete(journeyNode);

  const nodeClasses = [
    styles.node,
    styles.end,
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
    </div>
  );
}
