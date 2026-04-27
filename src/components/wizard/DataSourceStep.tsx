import { useCallback } from 'react';
import { KeyFieldPicker } from './KeyFieldPicker';
import { FilterBuilder } from '../shared/FilterBuilder';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FilterGroup } from '../../models/segment';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/connector';
import styles from './DataSourceStep.module.css';

interface DataSourceStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

const DATA_TYPE_OPTIONS: { value: ExportDataType; label: string }[] = [
  { value: 'contact', label: 'Contacts' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'transactional_with_contact', label: 'Combined' },
];

const TRANSACTIONAL_SOURCE_OPTIONS: { value: TransactionalSource; label: string }[] = [
  { value: 'treatments', label: 'Treatments' },
  { value: 'products', label: 'Products' },
];

export function DataSourceStep({ draft, onUpdate }: DataSourceStepProps) {
  const handleDataTypeSelect = useCallback(
    (dataType: ExportDataType) => {
      if (dataType === draft.dataType) return;
      onUpdate({
        dataType,
        transactionalSource: null,
        enrichmentKeyField: null,
        selectedFields: [],
      });
    },
    [draft.dataType, onUpdate],
  );

  const handleTransactionalSourceSelect = useCallback(
    (source: TransactionalSource) => {
      if (source === draft.transactionalSource) return;
      onUpdate({ transactionalSource: source, selectedFields: [], enrichmentKeyField: null });
    },
    [draft.transactionalSource, onUpdate],
  );

  const handleKeyFieldChange = useCallback(
    (key: string) => {
      onUpdate({ enrichmentKeyField: key });
    },
    [onUpdate],
  );

  const handleFiltersUpdate = useCallback(
    (filters: FilterGroup) => {
      onUpdate({ filters });
    },
    [onUpdate],
  );

  const fields = getFieldsForDataType(draft.dataType, draft.transactionalSource ?? undefined);

  const showTransactionalSource =
    draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact';

  const showKeyFieldPicker =
    (draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact');

  return (
    <div className={styles.container} data-testid="data-source-step">
      <h3 className={styles.title}>Data Source</h3>
      <p className={styles.subtitle}>Choose what data to export and configure source options.</p>

      {/* Row 1: Exporting From */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Exporting From</p>
          </div>
          <p className={styles.labelHint}>Select the type of data to export</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {DATA_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.segmentBtn} ${draft.dataType === opt.value ? styles.segmentBtnActive : ''}`}
                onClick={() => handleDataTypeSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Database fields — same pattern as importer */}
          {(draft.dataType === 'contact' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className={styles.inputLabel}>Contacts Database</p>
              <input className={styles.textInput} type="text" value="Customer Contacts" disabled />
            </div>
          )}

          {(draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className={styles.inputLabel}>Transactional Database</p>
              <select className={styles.selectInput} defaultValue="" aria-label="Select transactional database">
                <option value="" disabled>Select Database</option>
                <option value="treatments">Treatments</option>
                <option value="products">Products</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Key Field */}
      {showKeyFieldPicker && (
        <div className={styles.row}>
          <div className={styles.labelCol}>
            <div className={styles.labelRow}>
              <p className={styles.labelText}>Key Field</p>
            </div>
            <p className={styles.labelHint}>Links transactions to contact records</p>
          </div>
          <div className={styles.inputCol}>
            <KeyFieldPicker
              transactionalSource={draft.transactionalSource!}
              value={draft.enrichmentKeyField}
              onChange={handleKeyFieldChange}
            />
          </div>
        </div>
      )}

      {/* Row 4: Filters */}
      {draft.dataType && (
        <div className={styles.row}>
          <div className={styles.labelCol}>
            <div className={styles.labelRow}>
              <p className={styles.labelText}>Filters</p>
            </div>
            <p className={styles.labelHint}>Narrow down the records to export</p>
          </div>
          <div className={styles.inputCol}>
            <FilterBuilder
              value={draft.filters}
              onChange={handleFiltersUpdate}
              fields={fields}
            />
          </div>
        </div>
      )}
    </div>
  );
}
