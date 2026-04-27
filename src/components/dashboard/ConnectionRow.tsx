import { useState, type ReactNode } from 'react';
import type { Connection } from '../../models/connection';
import type { Connector } from '../../models/connector';
import { ProtocolIcon } from '../shared/ProtocolIcon';
import styles from './ConnectionRow.module.css';

interface ConnectionRowProps {
  connection: Connection;
  connectors: Connector[];
  onAddConnector: (connectionId: string) => void;
  children?: ReactNode;
}

export function ConnectionRow({ connection, connectors, onAddConnector, children }: ConnectionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const connectorCount = connectors.length;
  const activeCount = connectors.filter((c) => c.status === 'active').length;

  return (
    <div className={styles.row}>
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
            <ProtocolIcon protocol={connection.protocol} size={20} />
            <span className={styles.name}>{connection.name}</span>
            <span
              className={`${styles.statusDot} ${
                connection.status === 'connected'
                  ? styles.statusConnected
                  : styles.statusError
              }`}
              title={connection.status === 'connected' ? 'Connected' : 'Error'}
            />
          </div>
        </div>

        <div className={styles.meta}>
          <span className={styles.connectorCount}>
            {activeCount} of {connectorCount} Automations Active
          </span>
          <button
            type="button"
            className={styles.addLink}
            onClick={(e) => {
              e.stopPropagation();
              onAddConnector(connection.id);
            }}
          >
            + Add Automation
          </button>
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
