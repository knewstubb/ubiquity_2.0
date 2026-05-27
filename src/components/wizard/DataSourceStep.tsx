import { useCallback } from 'react';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { CheckboxCard } from '@/components/composed/checkbox-card';
import { FilterBuilder } from '../shared/FilterBuilder';
import { getFieldsForDataType } from '../../data/fieldRegistry';
import type { FilterGroup } from '../../models/segment';
import type { ExporterWizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/automation';

interface DataSourceStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
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

export function DataSourceStep({ draft, onUpdate }: DataSourceStepProps) {
  const selectedSources = draft.selectedSources;

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
        selectedSources: current,
        selectedFields: [],
        transactionalSource: current.includes('transactional') ? draft.transactionalSource : null,
      });
    },
    [selectedSources, draft.transactionalSource, onUpdate],
  );

  const handleTransactionalSourceSelect = useCallback(
    (source: TransactionalSource) => {
      if (source === draft.transactionalSource) return;
      onUpdate({ transactionalSource: source, selectedFields: [] });
    },
    [draft.transactionalSource, onUpdate],
  );

  const handleFiltersUpdate = useCallback(
    (filters: FilterGroup) => {
      onUpdate({ filters });
    },
    [onUpdate],
  );

  const fields = getFieldsForDataType(selectedSources[0] ?? 'contact', draft.transactionalSource ?? undefined);

  const showTransactionalSource = selectedSources.includes('transactional');
  const showJoinIndicator = selectedSources.length > 1;

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
          {showJoinIndicator && (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground m-0">
                Joined by: <span className="font-medium text-foreground">Email Address</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Filters */}
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
