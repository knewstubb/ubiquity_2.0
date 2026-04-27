import {
  X,
  Trash,
  Users,
  Lightning,
  Hand,
  CalendarBlank,
  Envelope,
  ChatCircle,
  UserGear,
  Globe,
  Clock,
  Hourglass,
  CalendarCheck,
  GitBranch,
  Percent,
  SignOut,
  ArrowSquareRight,
  ArrowsIn,
  GearSix,
} from '@phosphor-icons/react';
import { useJourneys } from '../../contexts/JourneysContext';
import type { JourneyNode, NodeType } from '../../models/journey';
import { TriggerConfig } from './config/TriggerConfig';
import { ActionConfig } from './config/ActionConfig';
import { WaitConfig } from './config/WaitConfig';
import { BranchConfig } from './config/BranchConfig';
import { EndConfig } from './config/EndConfig';
import { JourneySettingsForm } from './config/JourneySettingsForm';
import styles from './InspectorPanel.module.css';

export interface InspectorPanelProps {
  journeyId: string;
  selectedNodeId: string | null;
  settingsMode: boolean;
  onClose: () => void;
  onDeleteNode: (nodeId: string) => void;
  onEditContent?: (contentType: 'email' | 'form' | 'survey') => void;
}

/* ── Icon lookup by node type + subType ── */

const nodeTypeIcons: Record<string, React.ComponentType<{ size?: number; weight?: string }>> = {
  // Triggers
  'segment-entry': Users,
  'event-based': Lightning,
  'manual': Hand,
  'scheduled': CalendarBlank,
  // Actions
  'send-email': Envelope,
  'send-sms': ChatCircle,
  'update-contact': UserGear,
  'webhook': Globe,
  // Waits
  'time-delay': Clock,
  'wait-for-event': Hourglass,
  'wait-until-date': CalendarCheck,
  // Branches
  'if-else': GitBranch,
  'ab-split': Percent,
  'multi-way': GitBranch,
  // Ends
  'exit': SignOut,
  'move-to-journey': ArrowSquareRight,
  // Join
  'join': ArrowsIn,
};

function getNodeIcon(node: JourneyNode): React.ComponentType<{ size?: number; weight?: string }> {
  return nodeTypeIcons[node.subType] ?? nodeTypeIcons[node.type] ?? Users;
}

function getConfigForm(
  nodeType: NodeType,
  journeyId: string,
  node: JourneyNode,
  onEditContent?: (contentType: 'email' | 'form' | 'survey') => void,
): React.ReactNode {
  switch (nodeType) {
    case 'trigger':
      return <TriggerConfig journeyId={journeyId} node={node} />;
    case 'action':
      return <ActionConfig journeyId={journeyId} node={node} onEditContent={onEditContent} />;
    case 'wait':
      return <WaitConfig journeyId={journeyId} node={node} />;
    case 'branch':
      return <BranchConfig journeyId={journeyId} node={node} />;
    case 'end':
      return <EndConfig journeyId={journeyId} node={node} />;
    case 'join':
      return null; // Join nodes have no configuration
    default:
      return null;
  }
}

/* ── InspectorPanel component ── */

export function InspectorPanel({
  journeyId,
  selectedNodeId,
  settingsMode,
  onClose,
  onDeleteNode,
  onEditContent,
}: InspectorPanelProps) {
  const { journeys } = useJourneys();

  // Find the journey
  const journey = journeys.find((j) => j.id === journeyId);

  // Find the selected node
  const selectedNode = selectedNodeId
    ? journey?.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  // Panel is hidden when no node is selected and not in settings mode
  if (!settingsMode && !selectedNode) {
    return null;
  }

  // Settings mode
  if (settingsMode) {
    return (
      <aside className={styles.panel}>
        <div className={styles.header}>
          <div className={`${styles.headerIcon} ${styles.settings}`}>
            <GearSix size={18} weight="duotone" />
          </div>
          <span className={styles.headerLabel}>Journey Settings</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close inspector"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className={styles.content}>
          <JourneySettingsForm journeyId={journeyId} />
        </div>
      </aside>
    );
  }

  // Node config mode
  if (!selectedNode) return null;

  const Icon = getNodeIcon(selectedNode);
  const nodeType = selectedNode.type;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={`${styles.headerIcon} ${styles[nodeType]}`}>
          <Icon size={18} weight="duotone" />
        </div>
        <span className={styles.headerLabel}>{selectedNode.label}</span>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close inspector"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
      <div className={styles.content}>
        {getConfigForm(nodeType, journeyId, selectedNode, onEditContent)}
      </div>
      <div className={styles.footer}>
        <button
          className={styles.deleteButton}
          onClick={() => onDeleteNode(selectedNode.id)}
        >
          <Trash size={16} weight="bold" />
          Delete Node
        </button>
      </div>
    </aside>
  );
}
