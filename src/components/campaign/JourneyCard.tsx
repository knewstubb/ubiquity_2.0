import { useState, useRef, useEffect, useCallback } from 'react';
import {
  HandWaving,
  ArrowsClockwise,
  Receipt,
  Megaphone,
} from '@phosphor-icons/react';
import type { Journey, JourneyType } from '../../models/campaign';
import { OverflowMenu } from '../dashboard/OverflowMenu';
import styles from './JourneyCard.module.css';

interface JourneyCardProps {
  journey: Journey;
  campaignName?: string;
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
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`Journey: ${journey.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className={styles.header}>
        <Icon size={32} weight="duotone" className={styles.typeIcon} />
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
              aria-label="Rename journey"
            />
          ) : (
            <p className={styles.name}>{journey.name}</p>
          )}
          <p className={styles.typeLabel}>{journey.type}</p>
          {campaignName && (
            <p className={styles.campaignName}>{campaignName}</p>
          )}
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <OverflowMenu items={menuItems} />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[journey.status] ?? styles.statusDraft}`}>
            {journey.status}
          </span>
          <span className={styles.entryCount}>
            {journey.entryCount.toLocaleString()} {journey.entryCount === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>
    </div>
  );
}
