import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Connector } from '../../models/connector';
import { DotsThree, GearSix, PencilSimple, ListBullets, ClockCounterClockwise, Trash } from '@phosphor-icons/react';
import { Toggle } from '../shared/Toggle';
import styles from './ConnectorCard.module.css';

interface ConnectorCardProps {
  connector: Connector;
  connectionError?: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DATA_TYPE_LABELS: Record<string, string> = {
  contact: 'contacts',
  transactional: 'transactional_sales',
  transactional_with_contact: 'transactional_with_contact',
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
  return '2-minutes ago';
}

function getLastRunStatus(connector: Connector): 'Completed' | 'Failed' {
  const hash = connector.id.charCodeAt(connector.id.length - 1);
  return hash % 7 === 0 ? 'Failed' : 'Completed';
}

export function ConnectorCard({ connector, connectionError, onToggleStatus, onEdit, onDelete }: ConnectorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPaused = connector.status === 'paused';

  const openMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const lastRunStatus = getLastRunStatus(connector);
  const lastRunTime = getLastRunTime();
  const DirectionIcon = connector.direction === 'import' ? ImporterIcon : ExporterIcon;
  const dataTypeLabel = DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType;

  const menu = menuOpen
    ? createPortal(
        <div
          ref={menuRef}
          className={styles.contextMenu}
          role="menu"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button type="button" role="menuitem" className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}><GearSix size={16} weight="regular" /> Automation Settings</button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}><PencilSimple size={16} weight="regular" /> Edit Automation</button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}><ListBullets size={16} weight="regular" /> Activity Log</button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}><ClockCounterClockwise size={16} weight="regular" /> History</button>
          <div className={styles.menuDivider} />
          <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}><Trash size={16} weight="regular" /> Delete Automation</button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      className={`${styles.row} ${isPaused ? styles.rowPaused : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Automation: ${connector.name}`}
      onClick={() => onEdit()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } }}
    >
      {/* Group 1: Icon + Name */}
      <div className={styles.groupName}>
        <span className={`${styles.directionIcon} ${isPaused ? styles.directionIconPaused : ''} ${connectionError ? styles.directionIconError : ''}`}>
          <DirectionIcon />
        </span>
        <span className={styles.name}>{connector.name}</span>
      </div>

      {/* Group 2: Data type */}
      <span className={styles.dataType}>{dataTypeLabel}</span>

      {/* Group 3: Status + Time */}
      <div className={styles.groupStatus}>
        <span className={`${styles.lastRunBadge} ${lastRunStatus === 'Failed' ? styles.lastRunFailed : styles.lastRunCompleted}`}>
          {lastRunStatus}
        </span>
        <span className={styles.lastRunTime}>{lastRunTime}</span>
      </div>

      {/* Group 4: Toggle + Meatball */}
      <div className={styles.groupActions}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle checked={connector.status === 'active'} onChange={onToggleStatus} />
        </div>
        <button
          ref={buttonRef}
          type="button"
          className={styles.meatballButton}
          onClick={openMenu}
          aria-label="Automation actions"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <DotsThree size={20} weight="bold" />
        </button>
      </div>

      {menu}
    </div>
  );
}
