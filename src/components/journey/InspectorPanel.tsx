import {
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
import { cn } from '../../lib/utils';
import { CloseButton } from '../ui/close-button';
import { useJourneys } from '../../contexts/JourneysContext';
import type { JourneyNode, NodeType } from '../../models/journey';
import { TriggerConfig } from './config/TriggerConfig';
import { ActionConfig } from './config/ActionConfig';
import { WaitConfig } from './config/WaitConfig';
import { BranchConfig } from './config/BranchConfig';
import { EndConfig } from './config/EndConfig';
import { JourneySettingsForm } from './config/JourneySettingsForm';

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

const headerIconClasses: Record<string, string> = {
  trigger: 'text-mint-500 bg-[color-mix(in_srgb,var(--mint-500)_10%,transparent)]',
  action: 'text-blue-500 bg-[color-mix(in_srgb,var(--color-blue-500)_10%,transparent)]',
  wait: 'text-amber-500 bg-[color-mix(in_srgb,var(--color-amber-500)_10%,transparent)]',
  branch: 'text-purple-500 bg-[color-mix(in_srgb,var(--color-purple-500)_10%,transparent)]',
  end: 'text-tertiary-foreground bg-[color-mix(in_srgb,var(--tertiary-foreground)_10%,transparent)]',
  join: 'text-border-strong bg-[color-mix(in_srgb,var(--border-strong)_10%,transparent)]',
  settings: 'text-muted-foreground bg-secondary',
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
      <aside className="relative w-[300px] min-w-[300px] h-full bg-background border-l border-border font-sans flex flex-col animate-in slide-in-from-right duration-150">
        <div className="flex items-center gap-2 p-4 border-b border-border min-h-[52px]">
          <div className={cn('flex items-center justify-center shrink-0 w-7 h-7 rounded-sm', headerIconClasses.settings)}>
            <GearSix size={18} weight="duotone" />
          </div>
          <span className="flex-1 text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Journey Settings
          </span>
          <CloseButton onClick={onClose} aria-label="Close inspector" className="shrink-0" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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
    <aside className="relative w-[300px] min-w-[300px] h-full bg-background border-l border-border font-sans flex flex-col animate-in slide-in-from-right duration-150">
      <div className="flex items-center gap-2 p-4 border-b border-border min-h-[52px]">
        <div className={cn('flex items-center justify-center shrink-0 w-7 h-7 rounded-sm', headerIconClasses[nodeType] ?? '')}>
          <Icon size={18} weight="duotone" />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {selectedNode.label}
        </span>
        <CloseButton onClick={onClose} aria-label="Close inspector" className="shrink-0" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {getConfigForm(nodeType, journeyId, selectedNode, onEditContent)}
      </div>
      <div className="p-4 border-t border-border">
        <button
          className="flex items-center justify-center gap-1 w-full px-4 py-2 border border-red-500 rounded-sm bg-transparent text-red-500 font-sans text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-red-500 hover:text-primary-foreground"
          onClick={() => onDeleteNode(selectedNode.id)}
        >
          <Trash size={16} weight="bold" />
          Delete Node
        </button>
      </div>
    </aside>
  );
}
