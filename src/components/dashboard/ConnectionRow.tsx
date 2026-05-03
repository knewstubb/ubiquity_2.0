import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { Connection } from '../../models/connection';
import type { Connector } from '../../models/connector';
import { DotsThree, PencilSimple, Trash, Plus } from '@phosphor-icons/react';
import { ProtocolIcon } from '../shared/ProtocolIcon';
import styles from './ConnectionRow.module.css';

interface ConnectionRowProps {
  connection: Connection;
  connectors: Connector[];
  onAddConnector: (connectionId: string) => void;
  onEditConnection?: (connectionId: string) => void;
  onDeleteConnection?: (connectionId: string) => void;
  children?: ReactNode;
}

export function ConnectionRow({ connection, connectors, onAddConnector, onEditConnection, onDeleteConnection, children }: ConnectionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const connectorCount = connectors.length;
  const activeCount = connectors.filter((c) => c.status === 'active').length;
  const isError = connection.status === 'error';

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

  return (
    <div className={`${styles.row} ${isError ? styles.rowError : ''}`}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        <div className={styles.headerLeft}>
          <span
            className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className={styles.connectionInfo}>
            <ProtocolIcon protocol={connection.protocol} size={20} className={isError ? styles.iconError : ''} />
            <span className={styles.name}>{connection.name}</span>
          </div>
        </div>

        {isError && (
          <span className={styles.errorMessage}>
            Connection Error. <em>Automations Cannot Run</em>
          </span>
        )}

        <div className={styles.meta}>
          {!isError && (
            <span className={styles.connectorCount}>
              {connectorCount === 0
                ? 'No automations yet. Create one to start importing data.'
                : `${activeCount} of ${connectorCount} Automations Active`}
            </span>
          )}
          <div className={styles.meatballWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.meatballButton}
              aria-label="Connection actions"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <DotsThree size={20} weight="bold" />
            </button>
            {menuOpen && (
              <div className={styles.contextMenu} role="menu">
                {!isError && (
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onAddConnector(connection.id);
                    }}
                  >
                    <Plus size={16} weight="regular" /> Add Automation
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEditConnection?.(connection.id);
                  }}
                >
                  <PencilSimple size={16} weight="regular" /> Edit Connection
                </button>
                <div className={styles.menuDivider} />
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.menuItem} ${styles.menuItemDestructive}`}
                  disabled={connectorCount > 0}
                  title={connectorCount > 0 ? 'Remove all Automations before deleting connection' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDeleteConnection?.(connection.id);
                  }}
                >
                  <Trash size={16} weight="regular" /> Delete Connection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`${styles.childrenWrapper} ${expanded ? styles.childrenWrapperExpanded : ''}`}
      >
        <div className={styles.childrenInner}>
          {children && <div className={styles.children}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
