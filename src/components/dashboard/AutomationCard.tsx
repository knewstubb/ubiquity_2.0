import type { Automation } from '../../models/automation';
import { DotsThree, GearSix, PencilSimple, ListBullets, ClockCounterClockwise, Trash, UsersThree, NewspaperClipping } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AutomationCardProps {
  connector: Automation;
  connectionError?: boolean;
  onToggleStatus: () => void;
  onViewSettings: () => void;
  onEditWizard: () => void;
  onDelete: () => void;
  onActivityLog?: () => void;
  onHistory?: () => void;
}

const DATA_TYPE_LABELS: Record<string, string> = {
  contact: 'Contacts',
  transactional: 'Transactional',
  transactional_with_contact: 'Transactional + Contact',
};

function ImporterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 6v14M10 14l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ExporterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 20V6M10 12l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function getLastRunTime(): string {
  return '2 minutes ago';
}

function getLastRunStatus(connector: Automation): 'Completed' | 'Failed' {
  const hash = connector.id.charCodeAt(connector.id.length - 1);
  return hash % 7 === 0 ? 'Failed' : 'Completed';
}

export function AutomationCard({ connector, connectionError, onToggleStatus, onViewSettings, onEditWizard, onDelete, onActivityLog, onHistory }: AutomationCardProps) {
  const isPaused = connector.status === 'paused';
  const lastRunStatus = getLastRunStatus(connector);
  const lastRunTime = getLastRunTime();
  const DirectionIcon = connector.direction === 'import' ? ImporterIcon : ExporterIcon;

  // Show transactional source name when dataType includes transactional
  let dataTypeLabel: string;
  if (connector.dataType === 'transactional' && connector.transactionalSource) {
    dataTypeLabel = connector.transactionalSource;
  } else if (connector.dataType === 'transactional_with_contact' && connector.transactionalSource) {
    dataTypeLabel = `${connector.transactionalSource} + contacts`;
  } else {
    dataTypeLabel = DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-2",
        "bg-surface border border-border rounded-lg shadow-sm",
        "cursor-pointer select-none",
        "transition-[box-shadow,border-color,transform] duration-200",
        "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
        "active:translate-y-px",
        isPaused && "bg-secondary border-border shadow-none opacity-60",
        connectionError
          ? "hover:shadow-md hover:border-destructive"
          : "hover:shadow-md hover:border-primary"
      )}
      role="button"
      tabIndex={0}
      aria-label={`Automation: ${connector.name}`}
      onClick={() => onViewSettings()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewSettings(); } }}
    >
      {/* Group 1: Direction + Name */}
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "inline-flex items-center justify-center shrink-0 text-primary",
          isPaused && "text-tertiary-foreground",
          connectionError && "text-destructive"
        )}>
          <DirectionIcon />
        </span>
        <span className="text-[14px] font-semibold text-foreground truncate">{connector.name}</span>
      </div>

      {/* Group 2: Data type */}
      <span className="inline-flex items-center gap-1.5 text-base text-muted-foreground truncate max-w-[200px]">
        {connector.dataType === 'contact' && (
          <>
            <UsersThree size={14} weight="regular" />
            {dataTypeLabel}
          </>
        )}
        {connector.dataType === 'transactional' && (
          <>
            <NewspaperClipping size={14} weight="regular" />
            {dataTypeLabel}
          </>
        )}
        {connector.dataType === 'transactional_with_contact' && (
          <>
            <NewspaperClipping size={14} weight="regular" />
            {connector.transactionalSource}
            {' + '}
            <UsersThree size={14} weight="regular" />
            contacts
          </>
        )}
      </span>

      {/* Group 3: Status + Time */}
      <div className="flex items-center gap-2">
        <Badge variant={isPaused ? 'neutral-subtle' : lastRunStatus === 'Failed' ? 'error-subtle' : 'default-subtle'}>
          {lastRunStatus}
        </Badge>
        <span className="text-sm text-tertiary-foreground whitespace-nowrap">{lastRunTime}</span>
      </div>

      {/* Group 4: Switch + DropdownMenu */}
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <Switch checked={connector.status === 'active'} onCheckedChange={() => onToggleStatus()} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="Automation actions"
            >
              <DotsThree size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px] p-1.5" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
              onSelect={() => onViewSettings()}
            >
              <GearSix size={16} weight="regular" />
              Automation Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
              onSelect={() => onEditWizard()}
            >
              <PencilSimple size={16} weight="regular" />
              Edit Automation
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
              onSelect={() => onActivityLog?.()}
            >
              <ListBullets size={16} weight="regular" />
              Activity Log
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md"
              onSelect={() => onHistory?.()}
            >
              <ClockCounterClockwise size={16} weight="regular" />
              Automation History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md text-destructive focus:text-destructive focus:bg-destructive/5"
              onSelect={() => onDelete()}
            >
              <Trash size={16} weight="regular" />
              Delete Automation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
