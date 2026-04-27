import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConnectors } from '../contexts/ConnectorsContext';
import { useConnections } from '../contexts/ConnectionsContext';
import { StatusToggle } from '../components/dashboard/StatusToggle';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import type { ExportDataType, ScheduleFrequency, FileType } from '../models/connector';
import styles from './ConnectorDetailPage.module.css';

const DATA_TYPE_LABELS: Record<ExportDataType, string> = {
  contact: 'Contact',
  transactional: 'Transactional',
  transactional_with_contact: 'Transactional with Contact Enrichments',
};

const SCHEDULE_LABELS: Record<ScheduleFrequency, string> = {
  every_15_min: 'Every 15 minutes',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DELIMITER_LABELS: Record<string, string> = {
  ',': 'Comma',
  '|': 'Pipe',
  '\t': 'Tab',
  ';': 'Semicolon',
};

const DATE_FORMAT_LABELS: Record<string, string> = {
  ISO8601: 'ISO 8601',
  US: 'US (MM/DD/YYYY)',
  EU: 'EU (DD/MM/YYYY)',
  UNIX: 'UNIX Timestamp',
};

const FILE_TYPE_LABELS: Record<FileType, string> = {
  csv: 'CSV',
  json: 'JSON',
  xml: 'XML',
};

export default function ConnectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connectors, toggleConnectorStatus, deleteConnector } = useConnectors();
  const { getConnectionById } = useConnections();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const connector = connectors.find((c) => c.id === id);

  if (!connector) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2 className={styles.notFoundTitle}>Automation Not Found</h2>
          <p className={styles.notFoundText}>
            The automation you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const connection = getConnectionById(connector.connectionId);

  function handleDeleteConfirm() {
    deleteConnector(connector!.id);
    setShowDeleteModal(false);
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{connector.name}</h1>
          <p className={styles.subtitle}>Export Automation</p>
        </div>
        <div className={styles.actions}>
          <StatusToggle
            active={connector.status === 'active'}
            onToggle={() => toggleConnectorStatus(connector.id)}
          />
          <button
            type="button"
            className={styles.editButton}
            onClick={() => navigate('/')}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Connection */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Connection</h3>
          <p className={styles.sectionValue}>
            {connection ? connection.name : 'Unknown connection'}
          </p>
        </div>

        {/* Data Type */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Data Type</h3>
          <p className={styles.sectionValue}>
            {DATA_TYPE_LABELS[connector.dataType]}
          </p>
        </div>

        {/* Key Field (only for enrichments) */}
        {connector.enrichmentKeyField && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Key Field</h3>
            <p className={styles.sectionValue}>
              {connector.enrichmentKeyField} → ContactRecord.id
            </p>
          </div>
        )}

        {/* Selected Fields */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Selected Fields</h3>
          {connector.selectedFields.length > 0 ? (
            <ol className={styles.fieldList}>
              {connector.selectedFields.map((field, index) => (
                <li key={field.key} className={styles.fieldItem}>
                  <span className={styles.fieldIndex}>{index + 1}.</span>
                  {field.label}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.sectionValue}>No fields selected</p>
          )}
        </div>

        {/* File Type */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>File Type</h3>
          <p className={styles.sectionValue}>
            {FILE_TYPE_LABELS[connector.fileType]}
          </p>
        </div>

        {/* Format Options */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Format Options</h3>
          {connector.fileType === 'csv' && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Delimiter</span>
              <span className={styles.optionValue}>
                {DELIMITER_LABELS[connector.formatOptions.delimiter] ??
                  connector.formatOptions.delimiter}
              </span>
            </div>
          )}
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Header Row</span>
            <span className={styles.optionValue}>
              {connector.formatOptions.includeHeader ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Date Format</span>
            <span className={styles.optionValue}>
              {DATE_FORMAT_LABELS[connector.formatOptions.dateFormat] ??
                connector.formatOptions.dateFormat}
            </span>
          </div>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Timezone</span>
            <span className={styles.optionValue}>
              {connector.formatOptions.timezone}
            </span>
          </div>
        </div>

        {/* File Naming Pattern */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>File Naming Pattern</h3>
          <p className={styles.sectionValue}>
            {connector.fileNamingPattern}
          </p>
        </div>

        {/* Schedule */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Schedule</h3>
          <p className={styles.sectionValue}>
            {SCHEDULE_LABELS[connector.schedule]}
          </p>
        </div>

        {/* Filters */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Filters</h3>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Date Range</span>
            <span className={styles.optionValue}>
              {connector.filters.dateRange.replace(/_/g, ' ')}
            </span>
          </div>
          {connector.filters.membershipTier && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Membership Tier</span>
              <span className={styles.optionValue}>
                {connector.filters.membershipTier}
              </span>
            </div>
          )}
          {connector.filters.transactionType && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Transaction Type</span>
              <span className={styles.optionValue}>
                {connector.filters.transactionType}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Status</h3>
          <div className={styles.statusRow}>
            <StatusBadge status={connector.status} />
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          connectorName={connector.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
