import { useState, useCallback, useMemo } from 'react';
import { Plus } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

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
    <span className="relative inline-flex cursor-pointer group">
      <svg
        className="shrink-0 w-[22px] h-[22px] flex items-center justify-center text-destructive"
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
      <span className="hidden group-hover:block absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[280px] py-2.5 px-3.5 rounded-lg text-[13px] font-medium leading-[18px] text-primary-foreground z-50 pointer-events-none whitespace-normal bg-destructive">{tooltip}</span>
    </span>
  );
}

function NoMatchWarningIcon() {
  return (
    <span className="relative inline-flex cursor-pointer group">
      <svg
        className="shrink-0 w-[22px] h-[22px] flex items-center justify-center text-warning"
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
      <span className="hidden group-hover:block absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[280px] py-2.5 px-3.5 rounded-lg text-[13px] font-medium leading-[18px] text-primary-foreground z-50 pointer-events-none whitespace-normal bg-warning">No matching UbiQuity field was found. Select one manually or set to [[Ignore Field]].</span>
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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="m-0 text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-[-16px] mb-0 text-sm text-tertiary-foreground">Map your file columns to UbiQuity fields.</p>

      <div className="border border-border rounded-lg bg-background overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_32px_1.2fr_32px_1fr] items-center py-3 px-4 bg-secondary border-b border-border">
          <span className="text-sm font-semibold text-muted-foreground m-0">Data To Be Mapped</span>
          <span />
          <span className="text-sm font-semibold text-muted-foreground m-0">Ubiquity Fields</span>
          <span />
          <span className="text-sm font-semibold text-muted-foreground m-0">Example Values</span>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <div className="grid grid-cols-[1fr_40px_1.2fr_40px_1fr] items-center py-2 px-4" key={row.sourceField}>
            {/* Source field */}
            <span
              className={cn(
                "text-sm font-normal text-foreground m-0 break-all",
                row.status === 'duplicate' && "text-destructive font-medium"
              )}
            >
              {row.sourceField}
            </span>

            {/* Arrow */}
            <span className="text-sm text-tertiary-foreground text-center select-none" aria-hidden="true">
              →
            </span>

            {/* Dropdown */}
            <div className="relative w-full">
              <select
                className={cn(
                  "w-full py-2 px-3 text-sm border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8",
                  row.status === 'duplicate' && "border-destructive focus:border-destructive focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]",
                  row.status === 'no-match' && "border-warning focus:border-warning focus:shadow-[0_0_0_2px_rgba(245,158,11,0.15)]",
                  row.status === 'normal' && "border-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
                )}
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
            <span className="text-sm text-tertiary-foreground text-center select-none" aria-hidden="true">
              =
            </span>

            {/* Example value + warning */}
            <div className="flex items-center gap-2 min-h-[20px]">
              {row.status === 'duplicate' && (
                <DuplicateWarningIcon
                  tooltip={`This field is also mapped to ${row.duplicateSources.map(s => `[${s}]`).join(' and ')}. This can only be mapped to a single field.`}
                />
              )}
              {row.status === 'no-match' && <NoMatchWarningIcon />}
              <span className="text-sm text-tertiary-foreground m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {row.targetField === '[[Ignore Field]]'
                  ? '—'
                  : row.exampleValue || '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="link" className="justify-start p-0 h-auto mt-1">
        <Plus size={14} weight="bold" /> Add New Field
      </Button>
    </div>
  );
}
