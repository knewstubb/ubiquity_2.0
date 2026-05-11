import { useState, useRef, useEffect, useCallback } from 'react';
import {
  HandWaving,
  ArrowsClockwise,
  Receipt,
  Megaphone,
} from '@phosphor-icons/react';
import type { Journey, JourneyType } from '../../models/campaign';
import { OverflowMenu } from '../shared/OverflowMenu';
import { cn } from '../../lib/utils';

interface JourneyCardProps {
  journey: Journey;
  campaignName?: string;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-secondary text-muted-foreground',
  active: 'bg-accent text-accent-foreground',
  paused: 'bg-warning-subtle text-warning-foreground',
  completed: 'bg-info-subtle text-info-foreground',
};

const TYPE_ICON: Record<JourneyType, React.ComponentType<{ size?: number; weight?: string; className?: string }>> = {
  welcome: HandWaving,
  're-engagement': ArrowsClockwise,
  transactional: Receipt,
  promotional: Megaphone,
};

export function JourneyCard({
  journey,
  campaignName,
  onRename,
  onDelete,
  onClick,
}: JourneyCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(journey.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const confirmRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== journey.name) {
      onRename(journey.id, trimmed);
    }
    setRenaming(false);
  }, [renameValue, journey.name, journey.id, onRename]);

  const cancelRename = useCallback(() => {
    setRenameValue(journey.name);
    setRenaming(false);
  }, [journey.name]);

  function handleCardClick() {
    if (!renaming) {
      onClick(journey.id);
    }
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (!renaming && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(journey.id);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelRename();
    }
  }

  function handleStartRename() {
    setRenameValue(journey.name);
    setRenaming(true);
  }

  const menuItems = [
    { label: 'Rename', onClick: handleStartRename },
    { label: 'Delete', onClick: () => onDelete(journey.id), danger: true },
  ];

  const Icon = TYPE_ICON[journey.type] ?? HandWaving;

  return (
    <div
      className="flex flex-col gap-3 p-4 border border-border rounded-[4px] bg-background shadow-[0px_2px_3px_rgba(0,0,0,0.05)] cursor-pointer transition-[box-shadow,border-color] duration-150 ease-out select-none hover:shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.08)] hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      role="button"
      tabIndex={0}
      aria-label={`Journey: ${journey.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="flex items-center gap-3">
        <Icon size={32} weight="duotone" className="shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              ref={inputRef}
              className="w-full text-sm font-semibold text-foreground border border-primary rounded-[2px] px-1 py-0.5 outline-none font-[inherit] bg-background"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={confirmRename}
              onClick={(e) => e.stopPropagation()}
              aria-label="Rename journey"
            />
          ) : (
            <p className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis m-0">{journey.name}</p>
          )}
          <p className="text-xs text-tertiary-foreground m-0 capitalize">{journey.type}</p>
          {campaignName && (
            <p className="text-xs text-muted-foreground m-0 whitespace-nowrap overflow-hidden text-ellipsis">{campaignName}</p>
          )}
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium leading-tight whitespace-nowrap capitalize',
            STATUS_CLASSES[journey.status] ?? STATUS_CLASSES.draft
          )}>
            {journey.status}
          </span>
          <span className="text-xs text-tertiary-foreground">
            {journey.entryCount.toLocaleString()} {journey.entryCount === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>
    </div>
  );
}
