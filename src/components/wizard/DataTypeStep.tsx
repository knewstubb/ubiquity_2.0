import { useCallback } from 'react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { Dropdown } from '../shared/Dropdown';
import { RadioCard } from '../shared/RadioCard';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, TransactionalSource } from '../../models/automation';

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
      onUpdate({ transactionalSource: source, selectedFields: [] });
    },
    [draft.transactionalSource, onUpdate],
  );

  const showTransactionalSource =
    draft.dataType === 'transactional' || draft.dataType === 'transactional_with_contact';

  return (
    <div className="flex flex-col gap-6" data-testid="data-type-step">
      {/* Connection selector */}
      <div className="flex flex-col gap-2">
        <Dropdown
          label="Connection"
          placeholder="Select a connection…"
          options={connectionOptions}
          value={draft.connectionId ?? ''}
          onChange={handleConnectionChange}
        />
      </div>

      {/* Connector name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground leading-5" htmlFor="connector-name">
          Connector Name
        </label>
        <input
          id="connector-name"
          type="text"
          className="w-full py-2 px-3 text-sm font-normal text-foreground bg-background border border-border rounded-md leading-5 transition-all duration-150 placeholder:text-tertiary-foreground hover:border-tertiary-foreground focus:outline-none focus:border-ring focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
          placeholder="Enter connector name…"
          value={draft.name}
          onChange={handleNameChange}
        />
      </div>

      {/* Data type selection */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground leading-5">Data Type</span>
        <div className="flex flex-row flex-wrap gap-3">
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
        <div className="flex flex-col gap-2 pl-4 border-l-2 border-accent mt-1">
          <span className="text-xs font-medium text-muted-foreground">Transactional Source</span>
          <div className="flex gap-3">
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
