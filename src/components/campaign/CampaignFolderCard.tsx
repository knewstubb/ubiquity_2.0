import { useState, useRef, useEffect, useCallback } from 'react';
import { Folder } from '@phosphor-icons/react';
import type { Campaign } from '../../models/campaign';
import { OverflowMenu } from '../dashboard/OverflowMenu';
import styles from './CampaignFolderCard.module.css';

interface CampaignFolderCardProps {
  campaign: Campaign;
  journeyCount: number;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const STATUS_CLASS: Record<string, string> = {
  draft: styles.statusDraft,
  active: styles.statusActive,
  paused: styles.statusPaused,
  completed: styles.statusCompleted,
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
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`Campaign: ${campaign.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className={styles.header}>
        <Folder size={32} weight="duotone" className={styles.folderIcon} />
        <div className={styles.info}>
          {renaming ? (
            <input
              ref={inputRef}
              className={styles.renameInput}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={confirmRename}
              onClick={(e) => e.stopPropagation()}
              aria-label="Rename campaign"
            />
          ) : (
            <p className={styles.name}>{campaign.name}</p>
          )}
          <p className={styles.journeyCount}>{journeyLabel}</p>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      <div className={styles.footer}>
        <span className={`${styles.statusBadge} ${STATUS_CLASS[campaign.status] ?? styles.statusDraft}`}>
          {campaign.status}
        </span>
      </div>
    </div>
  );
}
