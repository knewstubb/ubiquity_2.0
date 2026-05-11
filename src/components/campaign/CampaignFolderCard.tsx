import { useState, useRef, useEffect, useCallback } from 'react';
import { Folder } from '@phosphor-icons/react';
import type { Campaign } from '../../models/campaign';
import { OverflowMenu } from '../shared/OverflowMenu';
import { cn } from '../../lib/utils';

interface CampaignFolderCardProps {
  campaign: Campaign;
  journeyCount: number;
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

export function CampaignFolderCard({
  campaign,
  journeyCount,
  onRename,
  onDelete,
  onClick,
}: CampaignFolderCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(campaign.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const confirmRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== campaign.name) {
      onRename(campaign.id, trimmed);
    }
    setRenaming(false);
  }, [renameValue, campaign.name, campaign.id, onRename]);

  const cancelRename = useCallback(() => {
    setRenameValue(campaign.name);
    setRenaming(false);
  }, [campaign.name]);

  function handleCardClick() {
    if (!renaming) {
      onClick(campaign.id);
    }
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (!renaming && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(campaign.id);
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
    setRenameValue(campaign.name);
    setRenaming(true);
  }

  const menuItems = [
    { label: 'Rename', onClick: handleStartRename },
    { label: 'Delete', onClick: () => onDelete(campaign.id), danger: true },
  ];

  const journeyLabel = journeyCount === 1 ? '1 journey' : `${journeyCount} journeys`;

  return (
    <div
      className="flex flex-col gap-3 p-4 border border-border rounded-[4px] bg-background shadow-[0px_2px_3px_rgba(0,0,0,0.05)] cursor-pointer transition-[box-shadow,border-color] duration-150 ease-out select-none hover:shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.08)] hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      role="button"
      tabIndex={0}
      aria-label={`Campaign: ${campaign.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="flex items-center gap-3">
        <Folder size={32} weight="duotone" className="shrink-0 text-primary" />
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
              aria-label="Rename campaign"
            />
          ) : (
            <p className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis m-0">{campaign.name}</p>
          )}
          <p className="text-xs text-tertiary-foreground m-0">{journeyLabel}</p>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium leading-tight whitespace-nowrap capitalize',
          STATUS_CLASSES[campaign.status] ?? STATUS_CLASSES.draft
        )}>
          {campaign.status}
        </span>
      </div>
    </div>
  );
}
