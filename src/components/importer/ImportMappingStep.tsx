import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, X, UploadSimple, ArrowLeft } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { HelpPopover } from '@/components/composed/help-popover';
import type { FieldMapping, LookupMapping } from '../../models/importer';
import { CONTACT_LOOKUP_FIELDS } from '../../models/importer';

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
  value: FieldMapping[];
  onUpdate: (mappings: FieldMapping[]) => void;
  csvHeaders?: string[];
  csvExampleValues?: Record<string, string>;
  lookupMappings?: LookupMapping[];
  onLookupUpdate?: (mappings: LookupMapping[]) => void;
  onGoToFileSettings?: () => void;
}

/* ── Target field constants (UbiQuity schema fields) ── */

const CONTACT_TARGET_FIELDS = [
  'customer_id',
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

/* ── Helpers ── */

function buildRows(
  sourceFields: string[],
  exampleValues: Record<string, string>,
  existingMappings: FieldMapping[],
  targetFields?: string[],
): MappingRow[] {
  const valueMappings: Record<string, string> = {};
  for (const m of existingMappings) {
    valueMappings[m.sourceField] = m.targetField;
  }

  // If no existing mappings, attempt auto-mapping based on column names
  if (existingMappings.length === 0 && targetFields) {
    const autoMapped = autoMapHeaders(sourceFields, targetFields);
    for (const [source, target] of Object.entries(autoMapped)) {
      valueMappings[source] = target;
    }
  }

  return sourceFields.map((sf) => ({
    sourceField: sf,
    targetField: valueMappings[sf] ?? '',
    exampleValue: exampleValues[sf] || '—',
    status: valueMappings[sf] ? 'normal' : 'no-match',
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

function getTargetFieldsForType(type: 'contact' | 'transactional') {
  if (type === 'contact') {
    return { targetFields: CONTACT_TARGET_FIELDS, title: 'Contact Mapping' };
  }
  return { targetFields: TRANSACTIONAL_TARGET_FIELDS, title: 'Transactional Mapping' };
}

/**
 * Attempts to auto-match a CSV header to a target field by normalizing both
 * to lowercase with separators stripped, then checking for exact or partial matches.
 */
function autoMatchField(sourceHeader: string, targetFields: string[]): string {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[_\-\s()]/g, '').replace(/address$/, '');

  const normalizedSource = normalize(sourceHeader);

  // Alias map: common CSV column names → target field names
  const aliases: Record<string, string[]> = {
    'email': ['emailaddress', 'email'],
    'firstname': ['firstname', 'first'],
    'lastname': ['lastname', 'last', 'surname'],
    'phone': ['phone', 'phonenumber', 'mobile', 'tel'],
    'customerid': ['customerid', 'custid', 'customerreference', 'customerref'],
    'membershiptier': ['membershiptier', 'tier', 'membership', 'level'],
    'treatmenttype': ['treatmenttype', 'treatment', 'service', 'servicetype'],
    'treatmentdate': ['treatmentdate', 'date', 'appointmentdate'],
    'durationminutes': ['durationminutes', 'duration', 'durationmin', 'minutes'],
    'price': ['price', 'amount', 'cost', 'total'],
    'therapistname': ['therapistname', 'therapist', 'provider', 'staff'],
    'transactionid': ['transactionid', 'txnid', 'txid', 'transid'],
    'policyid': ['policyid', 'policy'],
    'policystartdate': ['policystartdate', 'startdate', 'policystart'],
    'policyexpirydate': ['policyexpirydate', 'expirydate', 'policyexpiry', 'enddate'],
    'greeting': ['greeting', 'salutation', 'title', 'prefix'],
  };

  // Build a reverse lookup: normalized alias → target field key
  const targetByNormalized = new Map<string, string>();
  for (const tf of targetFields) {
    if (tf === '[[Ignore Field]]') continue;
    targetByNormalized.set(normalize(tf), tf);
  }

  // Direct match against normalized target field names
  if (targetByNormalized.has(normalizedSource)) {
    return targetByNormalized.get(normalizedSource)!;
  }

  // Check aliases
  for (const [targetKey, aliasList] of Object.entries(aliases)) {
    if (aliasList.includes(normalizedSource)) {
      // Find the actual target field that matches this key
      const match = targetByNormalized.get(targetKey);
      if (match) return match;
    }
  }

  return '';
}

/**
 * Auto-maps CSV headers to target fields. Each target field is used at most once.
 */
function autoMapHeaders(
  headers: string[],
  targetFields: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  const usedTargets = new Set<string>();

  for (const header of headers) {
    const match = autoMatchField(header, targetFields);
    if (match && !usedTargets.has(match)) {
      result[header] = match;
      usedTargets.add(match);
    }
  }

  return result;
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

export function ImportMappingStep({
  type,
  value,
  onUpdate,
  csvHeaders,
  csvExampleValues,
  lookupMappings,
  onLookupUpdate,
  onGoToFileSettings,
}: ImportMappingStepProps) {
  const { targetFields, title } = useMemo(() => getTargetFieldsForType(type), [type]);

  const hasHeaders = csvHeaders && csvHeaders.length > 0;

  // Build initial mappings from the value prop using CSV headers as source fields
  const [rows, setRows] = useState<MappingRow[]>(() => {
    if (!hasHeaders) return [];
    return recalcStatuses(buildRows(csvHeaders, csvExampleValues ?? {}, value, targetFields));
  });

  // Re-build rows when csvHeaders change
  useEffect(() => {
    if (!hasHeaders) {
      setRows([]);
      return;
    }
    setRows(recalcStatuses(buildRows(csvHeaders, csvExampleValues ?? {}, value, targetFields)));
  }, [csvHeaders, csvExampleValues]);

  // Notify parent whenever mappings change
  useEffect(() => {
    if (!hasHeaders) return;
    const mappings: FieldMapping[] = rows
      .filter((r) => r.targetField && r.targetField !== '[[Ignore Field]]')
      .map((r) => ({ sourceField: r.sourceField, targetField: r.targetField }));
    onUpdate(mappings);
  }, [rows]);

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

  // Lookup field mapping state (transactional only)
  const [lookupRows, setLookupRows] = useState<LookupMapping[]>(() => {
    if (type !== 'transactional') return [];
    if (lookupMappings && lookupMappings.length > 0) return lookupMappings;
    return [{ sourceField: '', contactField: '' }];
  });

  // Re-sync lookup rows when lookupMappings prop changes
  useEffect(() => {
    if (type !== 'transactional') return;
    if (lookupMappings && lookupMappings.length > 0) {
      setLookupRows(lookupMappings);
    } else {
      setLookupRows([{ sourceField: '', contactField: '' }]);
    }
  }, [lookupMappings, type]);

  // Notify parent when lookup rows change
  const handleLookupChange = useCallback(
    (updatedRows: LookupMapping[]) => {
      setLookupRows(updatedRows);
      onLookupUpdate?.(updatedRows);
    },
    [onLookupUpdate],
  );

  const handleLookupSourceChange = useCallback(
    (index: number, value: string) => {
      const updated = lookupRows.map((row, i) =>
        i === index ? { ...row, sourceField: value } : row,
      );
      handleLookupChange(updated);
    },
    [lookupRows, handleLookupChange],
  );

  const handleLookupContactChange = useCallback(
    (index: number, value: string) => {
      const updated = lookupRows.map((row, i) =>
        i === index ? { ...row, contactField: value } : row,
      );
      handleLookupChange(updated);
    },
    [lookupRows, handleLookupChange],
  );

  const handleAddLookupRow = useCallback(() => {
    handleLookupChange([...lookupRows, { sourceField: '', contactField: '' }]);
  }, [lookupRows, handleLookupChange]);

  const handleRemoveLookupRow = useCallback(
    (index: number) => {
      const updated = lookupRows.filter((_, i) => i !== index);
      handleLookupChange(updated);
    },
    [lookupRows, handleLookupChange],
  );

  // If no CSV headers are available, show a guide for editing existing automations
  if (!hasHeaders) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="m-0 text-xl font-semibold text-primary">{title}</h3>
        <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Map your file columns to UbiQuity fields.</p>
        <div className="border border-dashed border-border rounded-lg bg-secondary/30 py-16 px-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <UploadSimple size={24} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground m-0" data-testid="no-csv-message">
              Upload a new file to remap fields
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-0">
              Your current mappings are saved and will continue to be used.
              <br />
              To change them, upload a new CSV on the File Settings step.
            </p>
          </div>
          {onGoToFileSettings && (
            <button
              type="button"
              onClick={onGoToFileSettings}
              className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft size={14} />
              <span>Go to File Settings</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="m-0 text-xl font-semibold text-primary">{title}</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Map your file columns to UbiQuity fields.</p>

      {/* Lookup Field Mapping — transactional only */}
      {type === 'transactional' && (
        <div className="flex flex-col gap-3" data-testid="lookup-field-mapping-section">
          <div className="flex items-center gap-2">
            <h4 className="m-0 text-base font-semibold text-foreground">Lookup Mapping</h4>
            <HelpPopover
              title="How does UbiQuity link transactions to contacts?"
              width="wide"
              body={
                <>
                  <p className="m-0 mb-2">Every transactional record needs to be linked to a contact in UbiQuity. Lookup Mapping tells the system which column in your file identifies the contact that each transaction belongs to.</p>
                  <p className="m-0 mb-2">You do this by pairing a column from your file (File Column) with a column in the contact table (Contact Table Column). For example, if your file has a "Customer ID" column, you'd map it to the "Customer ID" field in the contact table. UbiQuity will then use that to find the matching contact.</p>
                  <p className="m-0">You need at least one lookup mapping. You can add more if a single field isn't enough to uniquely identify a contact (e.g. first name + last name + email).</p>
                </>
              }
              details="If a transaction row can't be matched to a contact, it won't be imported. Make sure the lookup column in your file contains values that exist in the contact database."
              detailsVariant="caution"
            />
          </div>
          <p className="m-0 -mt-1 text-sm text-muted-foreground">
            Map file columns to contact table columns to identify which contact each transactional row belongs to. At least one mapping is required before proceeding.
          </p>
          <div className="border border-border rounded-lg bg-background overflow-hidden">
            {/* Lookup header */}
            <div className="grid grid-cols-[1fr_1fr_40px] items-center py-3 px-4 bg-secondary border-b border-border">
              <span className="text-sm font-semibold text-muted-foreground m-0">File Column</span>
              <span className="text-sm font-semibold text-muted-foreground m-0">Contact Table Column</span>
              <span />
            </div>

            {/* Lookup rows */}
            {lookupRows.map((row, idx) => (
              <div
                className="grid grid-cols-[1fr_1fr_40px] items-center py-2 px-4 gap-3"
                key={idx}
                data-testid={`lookup-row-${idx}`}
              >
                {/* File Column dropdown */}
                <select
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={row.sourceField}
                  onChange={(e) => handleLookupSourceChange(idx, e.target.value)}
                  disabled={!hasHeaders}
                  aria-label={`Lookup file column ${idx + 1}`}
                  data-testid={`lookup-source-${idx}`}
                >
                  <option value="">— select —</option>
                  {(csvHeaders ?? []).map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>

                {/* Contact Table Column dropdown */}
                <select
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8"
                  value={row.contactField}
                  onChange={(e) => handleLookupContactChange(idx, e.target.value)}
                  aria-label={`Lookup contact column ${idx + 1}`}
                  data-testid={`lookup-contact-${idx}`}
                >
                  <option value="">— select —</option>
                  {CONTACT_LOOKUP_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>

                {/* Remove button — visible when > 1 row */}
                <div className="flex items-center justify-center">
                  {lookupRows.length > 1 && (
                    <button
                      type="button"
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleRemoveLookupRow(idx)}
                      aria-label={`Remove lookup row ${idx + 1}`}
                      data-testid={`lookup-remove-${idx}`}
                    >
                      <X size={16} weight="bold" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Lookup Field button — inside table */}
            <div className="py-2 px-4 border-t border-border">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary leading-none hover:underline underline-offset-4"
                onClick={handleAddLookupRow}
                data-testid="add-lookup-field-btn"
              >
                <Plus size={12} weight="bold" className="shrink-0" />
                <span>Add Lookup Field</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactional Database Mapping */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h4 className="m-0 text-base font-semibold text-foreground">Transactional Database Mapping</h4>
          <HelpPopover
            title="How does mapping work for transactional data?"
            width="wide"
            body={
              <>
                <p className="m-0 mb-2">This works the same as contact mapping. Match each column in your file to a field in the transactional table. Columns set to [[Ignore Field]] won't be imported.</p>
                <p className="m-0">Columns showing "Mapped in other context" are already mapped in the contact mapping step and can't be remapped here. This is normal for files that import to both contacts and transactional data. Some columns serve the contact side, others serve the transactional side.</p>
              </>
            }
          />
        </div>

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
                  row.status === 'duplicate' && "border-destructive focus:border-destructive focus:shadow-ring-destructive",
                  row.status === 'no-match' && "border-warning focus:border-warning focus:shadow-[0_0_0_2px_rgba(245,158,11,0.15)]",
                  row.status === 'normal' && "border-border focus:border-primary focus:shadow-ring"
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
                  : row.exampleValue}
              </span>
            </div>
          </div>
        ))}

        {/* Add New Field button — inside table */}
        <div className="py-2 px-4 border-t border-border">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary leading-none hover:underline underline-offset-4"
          >
            <Plus size={12} weight="bold" className="shrink-0" />
            <span>Add New Field</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
