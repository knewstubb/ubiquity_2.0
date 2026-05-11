import { useCallback } from 'react';
import { cn } from '../../lib/utils';
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
      <h3 className="m-0 text-lg font-semibold text-primary">Data Source</h3>
      <p className="-mt-5 text-sm text-tertiary-foreground">Choose what data to export and configure source options.</p>

      {/* Row 1: Exporting From */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Exporting From</p>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Select the type of data to export</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex border border-border rounded-md overflow-hidden w-full">
            {DATA_TYPE_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-all duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                  i < DATA_TYPE_OPTIONS.length - 1 && "border-r border-r-border",
                  draft.dataType === opt.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                  draft.dataType !== opt.value && "hover:text-muted-foreground"
                )}
                onClick={() => handleDataTypeSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Database fields */}
          {(draft.dataType === 'contact' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Contacts Database</p>
              <input className="w-full py-2 px-3 text-sm border border-border rounded-md bg-secondary text-tertiary-foreground outline-none box-border cursor-not-allowed" type="text" value="Customer Contacts" disabled />
            </div>
          )}

          {(draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Transactional Database</p>
              <select className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer box-border appearance-none bg-no-repeat bg-[right_12px_center] pr-8 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }} defaultValue="" aria-label="Select transactional database">
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
