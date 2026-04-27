import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Envelope,
  ChatCircle,
  UserGear,
  Globe,
  WarningCircle,
} from '@phosphor-icons/react';
import { getNodeSummaryLabel } from '../../../models/journey';
import type { JourneyNode, ActionSubType } from '../../../models/journey';
import styles from './nodeStyles.module.css';

export interface ActionNodeData {
  journeyNode: JourneyNode;
  hasError?: boolean;
}

const subTypeIcons: Record<ActionSubType, React.ComponentType<{ size?: number; weight?: string }>> = {
  'send-email': Envelope,
  'send-sms': ChatCircle,
  'update-contact': UserGear,
  'webhook': Globe,
};

function isIncomplete(node: JourneyNode): boolean {
  const { config } = node;
  switch (config.subType) {
    case 'send-email':
      return !config.emailRef;
    case 'send-sms':
      return !config.messageText;
    case 'update-contact':
      return !config.fieldKey || !config.value;
    case 'webhook':
      return !config.url;
    default:
      return false;
  }
}

export function ActionNode({ data, selected }: NodeProps & { data: ActionNodeData }) {
  const { journeyNode, hasError } = data;
  const subType = journeyNode.subType as ActionSubType;
  const Icon = subTypeIcons[subType] ?? Envelope;
  const summary = getNodeSummaryLabel(journeyNode);
  const incomplete = isIncomplete(journeyNode);

  const nodeClasses = [
    styles.node,
    styles.action,
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
