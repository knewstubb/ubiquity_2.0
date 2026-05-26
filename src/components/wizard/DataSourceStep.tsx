import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { CheckboxCard } from '@/components/composed/checkbox-card';
import { ChipInput } from '@/components/composed/chip-input';
import { HelpPopover } from '@/components/composed/help-popover';
import { FilterBuilder } from '../shared/FilterBuilder';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FilterGroup } from '../../models/segment';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/automation';

interface DataSourceStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

interface SourceOption {
  id: ExportDataType;
  label: string;
  description: string;
}

const SOURCE_OPTIONS: SourceOption[] = [
  { id: 'contact', label: 'Contacts', description: 'Contact database records' },
  { id: 'mailout', label: 'Mailout Data', description: 'Email send, delivery, and engagement logs' },
  { id: 'transactional', label: 'Transactional', description: 'Purchase and activity data' },
];

const TRANSACTIONAL_SOURCE_OPTIONS: { value: TransactionalSource; label: string }[] = [
  { value: 'treatments', label: 'Treatments' },
  { value: 'products', label: 'Products' },
];

const JOIN_KEY_OPTIONS = [
  { value: 'email_address', label: 'Email Address' },
  { value: 'customer_number', label: 'Customer Number' },
  { value: 'membership_number', label: 'Membership Number' },
  { value: 'external_id', label: 'External ID' },
];

export function DataSourceStep({ draft, onUpdate }: DataSourceStepProps) {
  const selectedSources: ExportDataType[] = draft.selectedSources ?? [draft.dataType ?? 'contact'];

  const handleSourceToggle = useCallback(
    (sourceId: ExportDataType) => {
      const current = [...selectedSources];
      const index = current.indexOf(sourceId);
      if (index >= 0) {
        if (current.length <= 1) return;
        current.splice(index, 1);
      } else {
        current.push(sourceId);
      }
      onUpdate({
        dataType: current[0],
        selectedSources: current,
        selectedFields: [],
        transactionalSource: current.includes('transactional') ? draft.transactionalSource : null,
        enrichmentKeyField: current.length > 1 ? draft.enrichmentKeyField : null,
      });
    },
    [selectedSources, draft.transactionalSource, draft.enrichmentKeyField, onUpdate],
  );

  const handleTransactionalSourceSelect = useCallback(
    (source: TransactionalSource) => {
      if (source === draft.transactionalSource) return;
      onUpdate({ transactionalSource: source, selectedFields: [], enrichmentKeyField: null });
    },
    [draft.transactionalSource, onUpdate],
  );

  const handleKeyFieldChange = useCallback(
    (keys: string[]) => {
      onUpdate({ enrichmentKeyField: keys.join(',') });
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

  const showTransactionalSource = selectedSources.includes('transactional');
  const showJoinKey = selectedSources.length > 1;

  return (
    <div className="flex flex-col gap-8" data-testid="data-source-step">

      {/* Row 0: Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Name <span className="text-destructive">*</span></p>
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

      {/* Row 1: Exporting From — multi-select cards */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Exporting From</p>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Select one or more data sources</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {SOURCE_OPTIONS.map((source) => (
              <CheckboxCard
                key={source.id}
                selected={selectedSources.includes(source.id)}
                onToggle={() => handleSourceToggle(source.id)}
                label={source.label}
                description={source.description}
              />
            ))}
          </div>

          {/* Transactional database selector — grey background under cards */}
          {showTransactionalSource && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Transactional Database</p>
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

          {/* Join indicator — below all source content */}
          {showJoinKey && (
            <p className="text-xs text-primary font-medium m-0">
              These sources will be joined using the key field below.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Join Key — shown when multiple sources are selected */}
      {showJoinKey && (
        <div className="flex items-start gap-14">
          <div className="w-40 shrink-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground m-0">Join Key</p>
              <HelpPopover
                title="How are sources joined?"
                body="When exporting from multiple sources, records are matched using a shared key field. Choose the field that uniquely identifies a contact across all selected sources."
              />
            </div>
            <p className="text-xs text-tertiary-foreground mt-1 m-0">Links records across selected sources</p>
          </div>
          <div className="w-[552px] flex flex-col gap-3">
            <ChipInput
              values={draft.enrichmentKeyField ? draft.enrichmentKeyField.split(',') : []}
              onChange={handleKeyFieldChange}
              options={JOIN_KEY_OPTIONS.map((opt) => opt.label)}
              placeholder="Select key fields…"
              aria-label="Join key fields"
            />
          </div>
        </div>
      )}

      {/* Row 3: Filters */}
      {selectedSources.length > 0 && (
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
