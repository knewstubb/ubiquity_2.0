import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { ArrowsIn } from '@phosphor-icons/react';
import type { JourneyNode } from '../../../models/journey';
import styles from './nodeStyles.module.css';

export interface JoinNodeData {
  journeyNode: JourneyNode;
}

export function JoinNode({ data, selected }: NodeProps & { data: JoinNodeData }) {
  const { journeyNode } = data;

  const nodeClasses = [
    styles.node,
    styles.join,
    selected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={nodeClasses}>
      <Handle type="target" position={Position.Top} id="input-0" />
      <Handle type="target" position={Position.Top} id="input-1" />
      <Handle type="target" position={Position.Top} id="input-2" />
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <ArrowsIn size={20} weight="duotone" />
          </div>
          <div className={styles.label}>{journeyNode.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
