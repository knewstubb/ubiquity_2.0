import type { DragEvent } from 'react';
import {
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
} from '@phosphor-icons/react';
import type { NodeType } from '../../models/journey';
import styles from './NodePalette.module.css';

export interface NodePaletteProps {
  hasTrigger: boolean;
}

interface PaletteItem {
  label: string;
  nodeType: NodeType;
  subType: string;
  icon: React.ComponentType<{ size?: number; weight?: string }>;
}

interface PaletteCategory {
  name: string;
  iconClass: string;
  items: PaletteItem[];
}

const categories: PaletteCategory[] = [
  {
    name: 'Triggers',
    iconClass: styles.triggerIcon,
    items: [
      { label: 'Segment Entry', nodeType: 'trigger', subType: 'segment-entry', icon: Users },
      { label: 'Event-Based', nodeType: 'trigger', subType: 'event-based', icon: Lightning },
      { label: 'Manual', nodeType: 'trigger', subType: 'manual', icon: Hand },
      { label: 'Scheduled', nodeType: 'trigger', subType: 'scheduled', icon: CalendarBlank },
    ],
  },
  {
    name: 'Actions',
    iconClass: styles.actionIcon,
    items: [
      { label: 'Send Email', nodeType: 'action', subType: 'send-email', icon: Envelope },
      { label: 'Send SMS', nodeType: 'action', subType: 'send-sms', icon: ChatCircle },
      { label: 'Update Contact', nodeType: 'action', subType: 'update-contact', icon: UserGear },
      { label: 'Webhook', nodeType: 'action', subType: 'webhook', icon: Globe },
    ],
  },
  {
    name: 'Waits',
    iconClass: styles.waitIcon,
    items: [
      { label: 'Time Delay', nodeType: 'wait', subType: 'time-delay', icon: Clock },
      { label: 'Wait for Event', nodeType: 'wait', subType: 'wait-for-event', icon: Hourglass },
      { label: 'Wait Until Date', nodeType: 'wait', subType: 'wait-until-date', icon: CalendarCheck },
    ],
  },
  {
    name: 'Branches',
    iconClass: styles.branchIcon,
    items: [
      { label: 'If/Else', nodeType: 'branch', subType: 'if-else', icon: GitBranch },
      { label: 'A/B Split', nodeType: 'branch', subType: 'ab-split', icon: Percent },
      { label: 'Multi-way', nodeType: 'branch', subType: 'multi-way', icon: GitBranch },
    ],
  },
  {
    name: 'Ends',
    iconClass: styles.endIcon,
    items: [
      { label: 'Exit Journey', nodeType: 'end', subType: 'exit', icon: SignOut },
      { label: 'Move to Journey', nodeType: 'end', subType: 'move-to-journey', icon: ArrowSquareRight },
    ],
  },
];

function handleDragStart(e: DragEvent, item: PaletteItem) {
  e.dataTransfer.setData('application/reactflow-type', item.nodeType);
  e.dataTransfer.setData('application/reactflow-subtype', item.subType);
  e.dataTransfer.effectAllowed = 'move';
}

export function NodePalette({ hasTrigger }: NodePaletteProps) {
  return (
    <aside className={styles.palette}>
      <div className={styles.paletteTitle}>Node Palette</div>
      {categories.map((category) => {
        const isTriggerCategory = category.name === 'Triggers';
        const isDisabled = isTriggerCategory && hasTrigger;

        return (
          <div
            key={category.name}
            className={`${styles.category} ${isDisabled ? styles.categoryDisabled : ''}`}
          >
            <div className={styles.categoryHeader}>{category.name}</div>
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.subType}
                  className={`${styles.item} ${isDisabled ? styles.itemDisabled : ''}`}
                  draggable={!isDisabled}
                  onDragStart={isDisabled ? undefined : (e) => handleDragStart(e, item)}
                >
                  <div className={`${styles.itemIcon} ${category.iconClass}`}>
                    <Icon size={18} weight="duotone" />
                  </div>
                  <span className={styles.itemLabel}>{item.label}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
