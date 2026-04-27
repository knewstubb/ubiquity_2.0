import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { GitBranch, WarningCircle } from '@phosphor-icons/react';
import { getNodeSummaryLabel } from '../../../models/journey';
import type {
  JourneyNode,
  BranchSubType,
  BranchConfig,
  MultiWayConfig,
  AbSplitConfig,
} from '../../../models/journey';
import styles from './nodeStyles.module.css';

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

  const nodeClasses = [
    styles.node,
    styles.branch,
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
            <GitBranch size={20} weight="duotone" />
          </div>
          <div className={styles.label}>{journeyNode.label}</div>
        </div>
        <div className={styles.summary}>{summary}</div>
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
              <span className={styles.handleLabel}>{handle.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
