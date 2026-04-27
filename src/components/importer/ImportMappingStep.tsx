import { useState, useCallback, useMemo } from 'react';
import styles from './ImportMappingStep.module.css';

/* ── Types ── */

type MappingStatus = 'normal' | 'duplicate' | 'no-match';

interface MappingRow {
  sourceField: string;
  targetField: string;
  exampleValue: string;
  status: MappingStatus;
  duplicateSources: string[];
}

interface ImportMappingStepProps {
  type: 'contact' | 'transactional';
}

/* ── Mock data ── */

const CONTACT_SOURCE_FIELDS = [
  'policy_number',
  'policy_start',
  'policy_expire',
  'email_id',
  'test_1_1_2',
  'salutation',
  'email_address',
  'first_name',
  'last_name',
];

const CONTACT_EXAMPLE_VALUES: Record<string, string> = {
  policy_number: 'PO-122-567',
  policy_start: '30/06/2015',
  policy_expire: '22/01/2027',
  email_id: '',
  test_1_1_2: '',
  salutation: 'Hello',
  email_address: '',
  first_name: 'Sam',
  last_name: 'Thomas',
};

const CONTACT_TARGET_FIELDS = [
  'policy_id',
  'policy_start_date',
  'policy_expiry_date',
  'email_address',
  'greeting',
  'first_name',
  'last_name',
  'phone',
  'membership_tier',
  '[[Ignore Field]]',
];

const CONTACT_INITIAL_MAPPINGS: Record<string, string> = {
  policy_number: 'policy_id',
  policy_start: 'policy_start_date',
  policy_expire: 'policy_expiry_date',
  email_id: 'email_address',
  test_1_1_2: '',
  salutation: 'greeting',
  email_address: 'email_address',
  first_name: 'first_name',
  last_name: 'last_name',
};

const TRANSACTIONAL_SOURCE_FIELDS = [
  'transaction_id',
  'customer_ref',
  'treatment_type',
  'treatment_date',
  'duration',
  'price',
  'therapist',
];

const TRANSACTIONAL_EXAMPLE_VALUES: Record<string, string> = {
  transaction_id: 'TXN-00451',
  customer_ref: 'C-1029',
  treatment_type: 'Deep Tissue',
  treatment_date: '15/03/2024',
  duration: '60',
  price: '85.00',
  therapist: 'Dr. Lee',
};

const TRANSACTIONAL_TARGET_FIELDS = [
  'transaction_id',
  'customer_reference',
  'treatment_type',
  'treatment_date',
  'duration_minutes',
  'price',
  'therapist_name',
  '[[Ignore Field]]',
];

const TRANSACTIONAL_INITIAL_MAPPINGS: Record<string, string> = {
  transaction_id: 'transaction_id',
  customer_ref: 'customer_reference',
  treatment_type: 'treatment_type',
  treatment_date: 'treatment_date',
  duration: 'duration_minutes',
  price: 'price',
  therapist: 'therapist_name',
};

/* ── Helpers ── */

function buildInitialRows(
  sourceFields: string[],
  exampleValues: Record<string, string>,
  initialMappings: Record<string, string>,
): MappingRow[] {
  return sourceFields.map((sf) => ({
    sourceField: sf,
    targetField: initialMappings[sf] ?? '',
    exampleValue: exampleValues[sf] ?? '',
    status: initialMappings[sf] ? 'normal' : 'no-match',
    duplicateSources: [],
  }));
}

function recalcStatuses(rows: MappingRow[]): MappingRow[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.targetField && r.targetField !== '[[Ignore Field]]') {
      counts.set(r.targetField, (counts.get(r.targetField) ?? 0) + 1);
    }
  }

  // Build a map of target → list of source fields for duplicate tooltips
  const targetToSources = new Map<string, string[]>();
  for (const r of rows) {
    if (r.targetField && r.targetField !== '[[Ignore Field]]') {
      const list = targetToSources.get(r.targetField) ?? [];
      list.push(r.sourceField);
      targetToSources.set(r.targetField, list);
    }
  }

  return rows.map((r) => {
    if (!r.targetField) {
      return { ...r, status: 'no-match' as const, duplicateSources: [] };
    }
    if (
      r.targetField !== '[[Ignore Field]]' &&
      (counts.get(r.targetField) ?? 0) > 1
    ) {
      const others = (targetToSources.get(r.targetField) ?? []).filter(
        (s) => s !== r.sourceField,
      );
      return { ...r, status: 'duplicate' as const, duplicateSources: others };
    }
    return { ...r, status: 'normal' as const, duplicateSources: [] };
  });
}

function getDataForType(type: 'contact' | 'transactional') {
  if (type === 'contact') {
    return {
      sourceFields: CONTACT_SOURCE_FIELDS,
      exampleValues: CONTACT_EXAMPLE_VALUES,
      targetFields: CONTACT_TARGET_FIELDS,
      initialMappings: CONTACT_INITIAL_MAPPINGS,
      title: 'Contact Mapping',
    };
  }
  return {
    sourceFields: TRANSACTIONAL_SOURCE_FIELDS,
    exampleValues: TRANSACTIONAL_EXAMPLE_VALUES,
    targetFields: TRANSACTIONAL_TARGET_FIELDS,
    initialMappings: TRANSACTIONAL_INITIAL_MAPPINGS,
    title: 'Transactional Mapping',
  };
}

/* ── Icons ── */

function DuplicateWarningIcon({ tooltip }: { tooltip: string }) {
  return (
    <span className={styles.tooltipWrap}>
      <svg
        className={`${styles.warningIcon} ${styles.warningIconDuplicate}`}
        width="22"
        height="22"
        viewBox="0 0 18 18"
        fill="none"
        aria-label="Duplicate mapping"
      >
        <path d="M9 1.5L16.5 15H1.5L9 1.5Z" fill="currentColor" opacity="0.15" />
        <path d="M9 1.5L16.5 15H1.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="12.5" r="0.75" fill="currentColor" />
      </svg>
      <span className={`${styles.tooltip} ${styles.tooltipError}`}>{tooltip}</span>
    </span>
  );
}

function NoMatchWarningIcon() {
  return (
    <span className={styles.tooltipWrap}>
      <svg
        className={`${styles.warningIcon} ${styles.warningIconNoMatch}`}
        width="22"
        height="22"
        viewBox="0 0 18 18"
        fill="none"
        aria-label="No match found"
      >
        <circle cx="9" cy="9" r="7.5" fill="currentColor" opacity="0.15" />
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 6v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="12" r="0.75" fill="currentColor" />
      </svg>
      <span className={`${styles.tooltip} ${styles.tooltipWarning}`}>No matching UbiQuity field was found. Select one manually or set to [[Ignore Field]].</span>
    </span>
  );
}

/* ── Component ── */

export function ImportMappingStep({ type }: ImportMappingStepProps) {
  const { sourceFields, exampleValues, targetFields, initialMappings, title } =
    useMemo(() => getDataForType(type), [type]);

  const [rows, setRows] = useState<MappingRow[]>(() =>
    recalcStatuses(buildInitialRows(sourceFields, exampleValues, initialMappings)),
  );

  const handleTargetChange = useCallback(
    (index: number, newTarget: string) => {
      setRows((prev) => {
        const updated = prev.map((r, i) =>
          i === index ? { ...r, targetField: newTarget } : r,
        );
        return recalcStatuses(updated);
      });
    },
    [],
  );

  const selectClass = (status: MappingStatus) => {
    const base = styles.select;
    if (status === 'duplicate') return `${base} ${styles.selectDuplicate}`;
    if (status === 'no-match') return `${base} ${styles.selectNoMatch}`;
    return base;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>{title}</h2>
      <p className={styles.subtitle}>Map your file columns to UbiQuity fields.</p>

      <div className={styles.table}>
        {/* Header */}
        <div className={styles.headerRow}>
          <span className={styles.headerCell}>Data To Be Mapped</span>
          <span className={styles.headerSpacer} />
          <span className={styles.headerCell}>Ubiquity Fields</span>
          <span className={styles.headerSpacer} />
          <span className={styles.headerCell}>Example Values</span>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <div className={styles.mappingRow} key={row.sourceField}>
            {/* Source field */}
            <span
              className={`${styles.sourceField}${
                row.status === 'duplicate'
                  ? ` ${styles.sourceFieldDuplicate}`
                  : ''
              }`}
            >
              {row.sourceField}
            </span>

            {/* Arrow */}
            <span className={styles.symbol} aria-hidden="true">
              →
            </span>

            {/* Dropdown */}
            <div className={styles.selectWrapper}>
              <select
                className={selectClass(row.status)}
                value={row.targetField}
                onChange={(e) => handleTargetChange(idx, e.target.value)}
                aria-label={`Map ${row.sourceField} to UbiQuity field`}
                data-testid={`mapping-select-${row.sourceField}`}
              >
                {row.status === 'no-match' && (
                  <option value="">no match found</option>
                )}
                {!row.targetField && row.status !== 'no-match' && (
                  <option value="">— select —</option>
                )}
                {targetFields.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Equals */}
            <span className={styles.symbol} aria-hidden="true">
              =
            </span>

            {/* Example value + warning */}
            <div className={styles.exampleCell}>
              {row.status === 'duplicate' && (
                <DuplicateWarningIcon
                  tooltip={`This field is also mapped to ${row.duplicateSources.map(s => `[${s}]`).join(' and ')}. This can only be mapped to a single field.`}
                />
              )}
              {row.status === 'no-match' && <NoMatchWarningIcon />}
              <span className={styles.exampleValue}>
                {row.targetField === '[[Ignore Field]]'
                  ? '—'
                  : row.exampleValue || '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addFieldLink}>
        + Add New Field
      </button>
    </div>
  );
}
