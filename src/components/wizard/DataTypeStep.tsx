import { useCallback } from 'react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { Dropdown } from '../shared/Dropdown';
import { RadioCard } from '../shared/RadioCard';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/connector';
import styles from './DataTypeStep.module.css';

interface DataTypeStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

const DATA_TYPE_OPTIONS: {
  value: ExportDataType;
  title: string;
  description: string;
}[] = [
  {
    value: 'contact',
    title: 'Contact',
    description: 'Export customer contact records',
  },
  {
    value: 'transactional',
    title: 'Transactional',
    description: 'Export transaction records (treatments or products)',
  },
  {
    value: 'transactional_with_contact',
    title: 'Transactional with Contact Enrichments',
    description: 'Export transactions enriched with customer contact fields',
  },
];

const TRANSACTIONAL_SOURCE_OPTIONS: {
  value: TransactionalSource;
  title: string;
  description: string;
}[] = [
  {
    value: 'treatments',
    title: 'Treatments',
    description: 'Spa treatment records',
  },
  {
    value: 'products',
    title: 'Products',
    description: 'Product and voucher records',
  },
];

export function DataTypeStep({ draft, onUpdate }: DataTypeStepProps) {
  const { connections } = useConnections();

  const connectionOptions = connections.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.protocol})`,
  }));

  const handleConnectionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({ connectionId: e.target.value || null });
    },
    [onUpdate],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate],
  );

  const handleDataTypeSelect = useCallback(
    (dataType: ExportDataType) => {
      if (dataType === draft.dataType) return;
      // Clear transactionalSource and selectedFields when dataType changes
      onUpdate({
        dataType,
        transactionalSource: null,
        selectedFields: [],
      });
    },
    [draft.dataType, onUpdate],
  );

  const handleTransactionalSourceSelect = useCallback(
    (source: TransactionalSource) => {
      if (source === draft.transactionalSource) return;
      // Clear selectedFields when source changes
      onUpdate({ transactionalSource: source, selectedFields: [] });
    },
    [draft.transactionalSource, onUpdate],
  );

  const showTransactionalSource =
    draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact';

  return (
    <div className={styles.step} data-testid="data-type-step">
      {/* Connection selector */}
      <div className={styles.section}>
        <Dropdown
          label="Connection"
          placeholder="Select a connection…"
          options={connectionOptions}
          value={draft.connectionId ?? ''}
          onChange={handleConnectionChange}
        />
      </div>

      {/* Connector name */}
      <div className={styles.section}>
        <label className={styles.sectionLabel} htmlFor="connector-name">
          Connector Name
        </label>
        <input
          id="connector-name"
          type="text"
          className={styles.nameInput}
          placeholder="Enter connector name…"
          value={draft.name}
          onChange={handleNameChange}
        />
      </div>

      {/* Data type selection */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Data Type</span>
        <div className={styles.radioGroup}>
          {DATA_TYPE_OPTIONS.map((opt) => (
            <RadioCard
              key={opt.value}
              name="dataType"
              value={opt.value}
              title={opt.title}
              description={opt.description}
              selected={draft.dataType === opt.value}
              onSelect={() => handleDataTypeSelect(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Transactional source sub-selector */}
      {showTransactionalSource && (
        <div className={styles.subSelector}>
          <span className={styles.subSelectorLabel}>Transactional Source</span>
          <div className={styles.subRadioGroup}>
            {TRANSACTIONAL_SOURCE_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.value}
                name="transactionalSource"
                value={opt.value}
                title={opt.title}
                description={opt.description}
                selected={draft.transactionalSource === opt.value}
                onSelect={() => handleTransactionalSourceSelect(opt.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
