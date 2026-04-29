import { X } from '@phosphor-icons/react';
import type { Connector } from '../../models/connector';
import type { Connection } from '../../models/connection';
import styles from './AutomationSettingsModal.module.css';

interface AutomationSettingsModalProps {
  connector: Connector;
  connection: Connection;
  onClose: () => void;
  onEdit: () => void;
}

const SCHEDULE_LABELS: Record<string, string> = {
  every_15_min: 'Every 15 minutes',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DATA_TYPE_LABELS: Record<string, string> = {
  contact: 'Contacts',
  transactional: 'Transactional',
  transactional_with_contact: 'Transactional + Contact',
};

export function AutomationSettingsModal({ connector, connection, onClose, onEdit }: AutomationSettingsModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{connector.name}</h2>
            <p className={styles.subtitle}>{connection.name} · {connector.direction === 'import' ? 'Importer' : 'Exporter'}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {/* File Settings */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>File Settings</h4>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Connection</span>
              <span className={styles.optionValue}>{connection.name}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Protocol</span>
              <span className={styles.optionValue}>{connection.protocol}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Base Path</span>
              <span className={styles.optionValue}>{connection.basePath}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>File Type</span>
              <span className={styles.optionValue}>{connector.fileType.toUpperCase()}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>File Pattern</span>
              <span className={styles.optionValue}>{connector.fileNamingPattern}</span>
            </div>
          </div>

          {/* Data Configuration */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Data Configuration</h4>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Data Type</span>
              <span className={styles.optionValue}>{DATA_TYPE_LABELS[connector.dataType] ?? connector.dataType}</span>
            </div>
            {connector.transactionalSource && (
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Source Table</span>
                <span className={styles.optionValue}>{connector.transactionalSource}</span>
              </div>
            )}
            {connector.enrichmentKeyField && (
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Enrichment Key</span>
                <span className={styles.optionValue}>{connector.enrichmentKeyField}</span>
              </div>
            )}
          </div>

          {/* Format Options */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Format Options</h4>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Delimiter</span>
              <span className={styles.optionValue}>{connector.formatOptions.delimiter === ',' ? 'Comma (,)' : connector.formatOptions.delimiter === '|' ? 'Pipe (|)' : connector.formatOptions.delimiter === '\t' ? 'Tab' : connector.formatOptions.delimiter}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Header Row</span>
              <span className={styles.optionValue}>{connector.formatOptions.includeHeader ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Date Format</span>
              <span className={styles.optionValue}>{connector.formatOptions.dateFormat}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Timezone</span>
              <span className={styles.optionValue}>{connector.formatOptions.timezone}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Schedule</h4>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Frequency</span>
              <span className={styles.optionValue}>{SCHEDULE_LABELS[connector.schedule] ?? connector.schedule}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Status</span>
              <span className={`${styles.optionValue} ${connector.status === 'active' ? styles.statusActive : styles.statusPaused}`}>
                {connector.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Metadata</h4>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Created</span>
              <span className={styles.optionValue}>{formatDateTime(connector.createdAt)}</span>
            </div>
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Last Updated</span>
              <span className={styles.optionValue}>{formatDateTime(connector.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Close</button>
          <button type="button" className={styles.editBtn} onClick={() => { onClose(); onEdit(); }}>Edit Automation</button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} at ${hours}:${mins}`;
}
