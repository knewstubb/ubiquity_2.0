import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, X, UploadSimple, ArrowLeft, WarningCircle, CalendarBlank } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { HelpPopover } from '@/components/composed/help-popover';
import type { FieldMapping, LookupMapping, ImportDefaultRow } from '../../models/importer';
import { CONTACT_LOOKUP_FIELDS } from '../../models/importer';
import { SetImportDefaultModal } from './SetImportDefaultModal';
import type { AvailableField } from './SetImportDefaultModal';

/* ── Types ── */

type MappingStatus = 'normal' | 'duplicate' | 'no-match';

interface MappingRow {
  sourceField: string;
  targetField: string;
  exampleValue: string;
  status: MappingStatus;
  duplicateSources: string[];
}

interface ImportDefaultMappingRow {
  sourceField: '__import_default__';
  targetField: string;
  exampleValue: string;
  status: 'normal';
  defaultRow: ImportDefaultRow;
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
  '[[Ignore Column]]',
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
];

const TRANSACTIONAL_TARGET_FIELDS = [
  '[[Ignore Column]]',
  'transaction_id',
  'customer_reference',
  'treatment_type',
  'treatment_date',
  'duration_minutes',
  'price',
  'therapist_name',
];

/* ── Helpers ── */

/** Infer field type from field name for import default modal */
function inferFieldType(fieldName: string): 'text' | 'number' | 'date' | 'datetime' | 'boolean' {
  const lower = fieldName.toLowerCase();
  if (lower.includes('date')) return 'date';
  if (lower.includes('price') || lower.includes('minutes') || lower.includes('duration')) return 'number';
  if (
    lower.includes('id') ||
    lower.includes('name') ||
    lower.includes('address') ||
    lower.includes('tier') ||
    lower.includes('type') ||
    lower.includes('greeting')
  ) return 'text';
  return 'text';
}

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
    if (r.targetField && r.targetField !== '[[Ignore Column]]') {
      counts.set(r.targetField, (counts.get(r.targetField) ?? 0) + 1);
    }
  }

  // Build a map of target → list of source fields for duplicate tooltips
  const targetToSources = new Map<string, string[]>();
  for (const r of rows) {
    if (r.targetField && r.targetField !== '[[Ignore Column]]') {
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
      r.targetField !== '[[Ignore Column]]' &&
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
    if (tf === '[[Ignore Column]]') continue;
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
    <span className="relative inline-flex cursor-pointer group" title={tooltip}>
      <WarningCircle size={16} weight="regular" className="shrink-0 text-destructive" aria-label="Duplicate mapping" />
    </span>
  );
}

function NoMatchWarningIcon() {
  return (
    <span className="relative inline-flex cursor-pointer group" title="No matching column found">
      <WarningCircle size={16} weight="regular" className="shrink-0 text-warning" aria-label="No match found" />
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

  // Import default modal state
  const [defaultModalOpen, setDefaultModalOpen] = useState(false);
  const [importDefaults, setImportDefaults] = useState<ImportDefaultMappingRow[]>([]);

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
      .filter((r) => r.targetField && r.targetField !== '[[Ignore Column]]')
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

  // Compute available fields for the import default modal (not already mapped)
  const availableDefaultFields: AvailableField[] = useMemo(() => {
    const mappedTargets = new Set(rows.map((r) => r.targetField).filter(Boolean));
    const defaultTargets = new Set(importDefaults.map((d) => d.targetField));

    return targetFields
      .filter((tf) => tf !== '[[Ignore Column]]' && !mappedTargets.has(tf) && !defaultTargets.has(tf))
      .map((tf) => ({
        value: tf,
        label: tf,
        type: inferFieldType(tf),
      }));
  }, [targetFields, rows, importDefaults]);

  // Handle import default submission
  function handleImportDefaultSubmit(defaultRow: ImportDefaultRow) {
    const newRow: ImportDefaultMappingRow = {
      sourceField: '__import_default__',
      targetField: defaultRow.targetField,
      exampleValue: defaultRow.mode === 'fixed' ? (defaultRow.fixedValue ?? '') : 'Next send date',
      status: 'normal',
      defaultRow,
    };
    setImportDefaults((prev) => [...prev, newRow]);
    setDefaultModalOpen(false);
  }

  function handleRemoveImportDefault(targetField: string) {
    setImportDefaults((prev) => prev.filter((d) => d.targetField !== targetField));
  }

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
                <Combobox
                  value={row.sourceField}
                  onValueChange={(val) => handleLookupSourceChange(idx, val)}
                  options={[
                    ...(csvHeaders ?? []).map((header) => ({
                      value: header,
                      label: header,
                    })),
                  ]}
                  placeholder="— select —"
                  disabled={!hasHeaders}
                />

                {/* Contact Table Column dropdown */}
                <Combobox
                  value={row.contactField}
                  onValueChange={(val) => handleLookupContactChange(idx, val)}
                  options={CONTACT_LOOKUP_FIELDS.map((field) => ({
                    value: field,
                    label: field,
                  }))}
                  placeholder="— select —"
                />

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

      {/* Database Mapping */}
      <div className="flex flex-col gap-3">

      <div className="border border-border rounded-lg bg-background overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_32px_1.2fr_32px_1fr] items-center py-3 px-4 bg-secondary border-b border-border">
          <span className="text-sm font-semibold text-muted-foreground m-0">Columns from File</span>
          <span />
          <span className="text-sm font-semibold text-muted-foreground m-0">Columns in Ubiquity</span>
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
              <Combobox
                value={row.targetField}
                onValueChange={(val) => handleTargetChange(idx, val)}
                options={targetFields.map((tf) => ({ value: tf, label: tf }))}
                placeholder={row.status === 'no-match' ? 'no match found' : '— select —'}
                status={row.status === 'duplicate' ? 'error' : row.status === 'no-match' ? 'warning' : 'normal'}
              />
            </div>

            {/* Equals */}
            <span className="text-sm text-tertiary-foreground text-center select-none" aria-hidden="true">
              =
            </span>

            {/* Example value + warning */}
            <div className="flex items-center gap-1.5 min-h-[20px]">
              {row.status === 'duplicate' && (
                <>
                  <DuplicateWarningIcon
                    tooltip={`This field is also mapped to ${row.duplicateSources.map(s => `[${s}]`).join(' and ')}. This can only be mapped to a single field.`}
                  />
                  <span className="text-xs text-destructive">Duplicate mapping</span>
                </>
              )}
              {row.status === 'no-match' && (
                <>
                  <NoMatchWarningIcon />
                  <span className="text-xs text-warning">No match found</span>
                </>
              )}
              {row.status === 'normal' && (
                <span className="text-sm text-tertiary-foreground m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.targetField === '[[Ignore Column]]'
                    ? '—'
                    : row.exampleValue}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Import default rows */}
        {importDefaults.map((defaultRow) => (
          <div
            className="grid grid-cols-[1fr_40px_1.2fr_40px_1fr] items-center py-2 px-4"
            key={`default-${defaultRow.targetField}`}
          >
            {/* Source field — badge */}
            <div>
              <Badge variant="default-subtle">Import Default</Badge>
            </div>

            {/* Arrow */}
            <span className="text-sm text-tertiary-foreground text-center select-none" aria-hidden="true">
              →
            </span>

            {/* Target field — plain text, aligned with Combobox text above */}
            <span className="text-sm font-medium text-foreground m-0 pl-3">
              {defaultRow.targetField}
            </span>

            {/* Equals */}
            <span className="text-sm text-tertiary-foreground text-center select-none" aria-hidden="true">
              =
            </span>

            {/* Example value + delete */}
            <div className="flex items-center gap-1.5 min-h-[20px]">
              {defaultRow.defaultRow.mode === 'send-date' && (
                <CalendarBlank size={14} className="text-primary shrink-0" />
              )}
              <span className="text-sm text-tertiary-foreground m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {defaultRow.exampleValue}
              </span>
              <button
                type="button"
                className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => handleRemoveImportDefault(defaultRow.targetField)}
                aria-label={`Remove import default for ${defaultRow.targetField}`}
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
        ))}

        {/* Set import default button — inside table */}
        <div className="py-2 px-4 border-t border-border">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary leading-none hover:underline underline-offset-4"
            onClick={() => setDefaultModalOpen(true)}
          >
            <Plus size={12} weight="bold" className="shrink-0" />
            <span>Set import default</span>
          </button>
        </div>
      </div>

      {/* Import Default Modal */}
      <SetImportDefaultModal
        open={defaultModalOpen}
        onOpenChange={setDefaultModalOpen}
        availableFields={availableDefaultFields}
        onSubmit={handleImportDefaultSubmit}
      />
      </div>
    </div>
  );
}
