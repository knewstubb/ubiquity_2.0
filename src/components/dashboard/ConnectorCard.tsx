import { useState, useRef, useEffect } from 'react';
import type { Connector, ScheduleFrequency } from '../../models/connector';
import { DataTypeBadge } from '../shared/DataTypeBadge';
import { StatusBadge } from '../shared/StatusBadge';
import { Toggle } from '../shared/Toggle';
import styles from './ConnectorCard.module.css';

interface ConnectorCardProps {
  connector: Connector;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SCHEDULE_LABELS: Record<ScheduleFrequency, string> = {
  every_15_min: 'Every 15 min',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function getStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return styles.cardActive;
    case 'paused':
      return styles.cardPaused;
    default:
      return styles.cardError;
  }
}

export function ConnectorCard({ connector, onToggleStatus, onEdit, onDelete }: ConnectorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleCardClick() {
    onEdit();
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit();
    }
  }

  function handleToggleClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function handleToggleChange() {
    onToggleStatus();
  }

  function handleOverflowClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  }

  return (
    <div
      className={`${styles.card} ${getStatusClass(connector.status)}`}
      role="button"
      tabIndex={0}
      aria-label={`Automation: ${connector.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <span className={styles.name}>{connector.name}</span>

      <div className={styles.badges}>
        <span className={styles.directionBadge}>{connector.direction}</span>
        <DataTypeBadge dataType={connector.dataType} />
      </div>

      <span className={styles.schedule}>{SCHEDULE_LABELS[connector.schedule]}</span>

      <StatusBadge status={connector.status} />

      <span className={styles.spacer} />

      <div className={styles.actions}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={handleToggleClick}>
          <Toggle
            checked={connector.status === 'active'}
            onChange={handleToggleChange}
          />
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className={styles.overflowButton}
            onClick={handleOverflowClick}
            aria-label="Automation actions"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="3" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="13" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <div className={styles.overflowMenu} role="menu">
              <button className={styles.menuItem} role="menuitem" onClick={handleEdit}>
                Edit
              </button>
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                role="menuitem"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
