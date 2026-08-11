import { useRef, useEffect } from 'react';
import {
  Envelope,
  ChatCircle,
  UserGear,
  Globe,
  Clock,
  Hourglass,
  CalendarCheck,
  GitBranch,
  Percent,
  Question,
} from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { NodeType } from '../../models/journey';
import { useJourneyFeatureFlags } from '../../hooks/useJourneyFeatureFlags';

export interface NodeTypeOption {
  label: string;
  nodeType: NodeType;
  subType: string;
  icon: React.ComponentType<{ size?: number; weight?: string }>;
  /** Optional feature flag key - if provided, option only shows when flag is enabled */
  featureFlag?: 'mlp' | 'v2';
}

export interface NodeTypeCategory {
  name: string;
  iconClass: string;
  items: NodeTypeOption[];
}

/**
 * Node categories available for insertion.
 * Note: Triggers and Ends are excluded — Start/End nodes are fixed.
 */
const categories: NodeTypeCategory[] = [
  {
    name: 'Actions',
    iconClass: 'text-blue-500 bg-blue-50',
    items: [
      { label: 'Send Email', nodeType: 'action', subType: 'send-email', icon: Envelope },
      { label: 'Send SMS', nodeType: 'action', subType: 'send-sms', icon: ChatCircle },
      { label: 'Update Contact', nodeType: 'action', subType: 'update-contact', icon: UserGear },
      { label: 'Webhook', nodeType: 'action', subType: 'webhook', icon: Globe },
    ],
  },
  {
    name: 'Waits',
    iconClass: 'text-amber-500 bg-amber-50',
    items: [
      { label: 'Time Delay', nodeType: 'wait', subType: 'time-delay', icon: Clock },
      { label: 'Wait for Event', nodeType: 'wait', subType: 'wait-for-event', icon: Hourglass },
      { label: 'Wait Until Date', nodeType: 'wait', subType: 'wait-until-date', icon: CalendarCheck },
    ],
  },
  {
    name: 'Branches',
    iconClass: 'text-purple-500 bg-purple-50',
    items: [
      { label: 'Conditional Split', nodeType: 'branch', subType: 'conditional-split', icon: Question, featureFlag: 'mlp' },
      { label: 'If/Else', nodeType: 'branch', subType: 'if-else', icon: GitBranch },
      { label: 'A/B Split', nodeType: 'branch', subType: 'ab-split', icon: Percent, featureFlag: 'mlp' },
      { label: 'Multi-way', nodeType: 'branch', subType: 'multi-way', icon: GitBranch, featureFlag: 'v2' },
    ],
  },
];

export interface NodeTypePickerProps {
  /** Position to render the picker (canvas coordinates) */
  x: number;
  y: number;
  /** Called when a node type is selected */
  onSelect: (nodeType: NodeType, subType: string) => void;
  /** Called when the picker should close (click outside, escape) */
  onClose: () => void;
}

/**
 * Popover picker that appears when clicking the (+) insert button.
 * Shows categorised node types for insertion.
 */
export function NodeTypePicker({ x, y, onSelect, onClose }: NodeTypePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const { mlpEnabled, v2Enabled } = useJourneyFeatureFlags();

  // Filter items based on feature flags
  const filteredCategories = categories.map((category) => ({
    ...category,
    items: category.items.filter((item) => {
      if (!item.featureFlag) return true;
      if (item.featureFlag === 'mlp') return mlpEnabled;
      if (item.featureFlag === 'v2') return v2Enabled;
      return true;
    }),
  })).filter((category) => category.items.length > 0);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 w-56 bg-white border border-border rounded-lg shadow-lg font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: x,
        top: y + 10, // Small offset below the cursor
      }}
    >
      <div className="px-3 py-2 border-b border-border bg-zinc-50">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Add Step
        </span>
      </div>

      <div className="max-h-[320px] overflow-y-auto py-1">
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-1 last:mb-0">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
              {category.name}
            </div>
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.subType}
                  type="button"
                  onClick={() => onSelect(item.nodeType, item.subType)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors duration-100 hover:bg-zinc-50 focus:outline-none focus:bg-zinc-100"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center shrink-0 w-7 h-7 rounded',
                      category.iconClass,
                    )}
                  >
                    <Icon size={16} weight="duotone" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
