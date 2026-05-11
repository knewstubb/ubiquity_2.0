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
import { cn } from '../../lib/utils';
import type { NodeType } from '../../models/journey';

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
    iconClass: 'text-mint-500 bg-[color-mix(in_srgb,var(--mint-500)_10%,transparent)]',
    items: [
      { label: 'Segment Entry', nodeType: 'trigger', subType: 'segment-entry', icon: Users },
      { label: 'Event-Based', nodeType: 'trigger', subType: 'event-based', icon: Lightning },
      { label: 'Manual', nodeType: 'trigger', subType: 'manual', icon: Hand },
      { label: 'Scheduled', nodeType: 'trigger', subType: 'scheduled', icon: CalendarBlank },
    ],
  },
  {
    name: 'Actions',
    iconClass: 'text-blue-500 bg-[color-mix(in_srgb,var(--color-blue-500)_10%,transparent)]',
    items: [
      { label: 'Send Email', nodeType: 'action', subType: 'send-email', icon: Envelope },
      { label: 'Send SMS', nodeType: 'action', subType: 'send-sms', icon: ChatCircle },
      { label: 'Update Contact', nodeType: 'action', subType: 'update-contact', icon: UserGear },
      { label: 'Webhook', nodeType: 'action', subType: 'webhook', icon: Globe },
    ],
  },
  {
    name: 'Waits',
    iconClass: 'text-amber-500 bg-[color-mix(in_srgb,var(--color-amber-500)_10%,transparent)]',
    items: [
      { label: 'Time Delay', nodeType: 'wait', subType: 'time-delay', icon: Clock },
      { label: 'Wait for Event', nodeType: 'wait', subType: 'wait-for-event', icon: Hourglass },
      { label: 'Wait Until Date', nodeType: 'wait', subType: 'wait-until-date', icon: CalendarCheck },
    ],
  },
  {
    name: 'Branches',
    iconClass: 'text-purple-500 bg-[color-mix(in_srgb,var(--color-purple-500)_10%,transparent)]',
    items: [
      { label: 'If/Else', nodeType: 'branch', subType: 'if-else', icon: GitBranch },
      { label: 'A/B Split', nodeType: 'branch', subType: 'ab-split', icon: Percent },
      { label: 'Multi-way', nodeType: 'branch', subType: 'multi-way', icon: GitBranch },
    ],
  },
  {
    name: 'Ends',
    iconClass: 'text-tertiary-foreground bg-[color-mix(in_srgb,var(--tertiary-foreground)_10%,transparent)]',
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
    <aside className="w-[220px] min-w-[220px] h-full bg-background border-r border-border overflow-y-auto font-sans py-4 select-none">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 mb-2">
        Node Palette
      </div>
      {categories.map((category) => {
        const isTriggerCategory = category.name === 'Triggers';
        const isDisabled = isTriggerCategory && hasTrigger;

        return (
          <div
            key={category.name}
            className={cn('mb-4', isDisabled && 'opacity-50')}
          >
            <div className="text-[10px] font-semibold text-tertiary-foreground uppercase tracking-wide px-4 py-1">
              {category.name}
            </div>
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.subType}
                  className={cn(
                    'flex items-center gap-2 px-4 py-1 cursor-grab rounded-sm mx-1 transition-colors duration-150 hover:bg-secondary active:cursor-grabbing',
                    isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                  draggable={!isDisabled}
                  onDragStart={isDisabled ? undefined : (e) => handleDragStart(e, item)}
                >
                  <div className={cn('flex items-center justify-center shrink-0 w-7 h-7 rounded-sm', category.iconClass)}>
                    <Icon size={18} weight="duotone" />
                  </div>
                  <span className="text-sm font-medium text-foreground leading-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
