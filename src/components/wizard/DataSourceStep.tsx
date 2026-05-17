import { useCallback } from 'react';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { KeyFieldPicker } from './KeyFieldPicker';
import { FilterBuilder } from '../shared/FilterBuilder';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FilterGroup } from '../../models/segment';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/automation';

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
    <div className="flex flex-col gap-8" data-testid="data-source-step">
      <h3 className="m-0 text-xl font-semibold text-primary">Data Source</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Choose what data to export and configure source options.</p>

      {/* Row 0: Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Name</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">A unique name for this automation</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <Input
            value={draft.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Daily Contact Export"
            aria-label="Automation name"
          />
        </div>
      </div>

      {/* Row 1: Exporting From */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Exporting From</p>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Select the type of data to export</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <SegmentedControl
            options={DATA_TYPE_OPTIONS}
            value={draft.dataType ?? 'contact'}
            onValueChange={(v) => handleDataTypeSelect(v as ExportDataType)}
          />

          {/* Database fields */}
          {(draft.dataType === 'contact' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Contacts Database</p>
              <Input value="Customer Contacts" disabled />
            </div>
          )}

          {(draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Transactional Database</p>
              <Select onValueChange={(v) => handleTransactionalSourceSelect(v as TransactionalSource)} value={draft.transactionalSource ?? undefined}>
                <SelectTrigger aria-label="Select transactional database">
                  <SelectValue placeholder="Select Database" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTIONAL_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Key Field */}
      {showKeyFieldPicker && (
        <div className="flex items-start gap-14">
          <div className="w-40 shrink-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground m-0">Key Field</p>
            </div>
            <p className="text-xs text-tertiary-foreground mt-1 m-0">Links transactions to contact records</p>
          </div>
          <div className="w-[552px] flex flex-col gap-3">
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
        <div className="flex items-start gap-14">
          <div className="w-40 shrink-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground m-0">Filters</p>
            </div>
            <p className="text-xs text-tertiary-foreground mt-1 m-0">Narrow down the records to export</p>
          </div>
          <div className="w-[552px] flex flex-col gap-3">
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
