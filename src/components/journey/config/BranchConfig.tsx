import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type {
  JourneyNode,
  BranchSubType,
  BranchFilterSource,
  IfElseConfig,
  AbSplitConfig,
  MultiWayConfig,
  MultiWayCondition,
} from '../../../models/journey';
import type { FilterGroup } from '../../../models/segment';
import { CONTACT_FIELDS, TREATMENT_FIELDS, PRODUCT_FIELDS } from '../../../data/fieldRegistry';
import { FilterBuilder } from '../../shared/FilterBuilder';

export interface BranchConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const BRANCH_OPTIONS: { value: BranchSubType; label: string }[] = [
  { value: 'if-else', label: 'If/Else' },
  { value: 'ab-split', label: 'A/B Split' },
  { value: 'multi-way', label: 'Multi-way Split' },
];

const DATA_SOURCE_OPTIONS: { value: BranchFilterSource; label: string }[] = [
  { value: 'contact', label: 'Contact attributes' },
  { value: 'treatments', label: 'Treatment history' },
  { value: 'products', label: 'Product purchases' },
];

/** Get the field definitions for a given filter source */
function getFieldsForSource(source: BranchFilterSource | undefined) {
  switch (source) {
    case 'treatments':
      return TREATMENT_FIELDS;
    case 'products':
      return PRODUCT_FIELDS;
    case 'contact':
    default:
      return CONTACT_FIELDS;
  }
}

const emptyFilterGroup: FilterGroup = {
  combinator: 'AND',
  rules: [],
  groups: [],
};

const inputClasses = "w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer`;

let conditionIdCounter = 0;
function generateConditionId(): string {
  conditionIdCounter += 1;
  return `cond-${Date.now()}-${conditionIdCounter}`;
}

export function BranchConfig({ journeyId, node }: BranchConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as BranchSubType;
      const newConfig = createDefaultConfig(newSubType);
      updateNode(journeyId, node.id, { subType: newSubType, config: newConfig });
    },
    [journeyId, node.id, updateNode],
  );

  /* ── If/Else handlers ── */

  const handleIfElseConditionChange = useCallback(
    (group: FilterGroup) => {
      updateNode(journeyId, node.id, {
        config: { ...config, condition: group } as IfElseConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  const handleIfElseSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSource = e.target.value as BranchFilterSource;
      // Reset the condition when changing data source since fields are different
      updateNode(journeyId, node.id, {
        config: { 
          ...config, 
          filterSource: newSource,
          condition: { ...emptyFilterGroup },
        } as IfElseConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  /* ── A/B Split handlers ── */

  const handleVariantAChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseInt(e.target.value, 10);
      const clamped = Number.isNaN(raw) ? 50 : Math.max(1, Math.min(99, raw));
      updateNode(journeyId, node.id, {
        config: { ...config, variantAPercent: clamped } as AbSplitConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  /* ── Multi-way handlers ── */

  const handleAddPath = useCallback(() => {
    const multiConfig = config as MultiWayConfig;
    const newCondition: MultiWayCondition = {
      id: generateConditionId(),
      label: `Path ${multiConfig.conditions.length + 1}`,
      condition: { ...emptyFilterGroup },
    };
    updateNode(journeyId, node.id, {
      config: {
        ...multiConfig,
        conditions: [...multiConfig.conditions, newCondition],
      } as MultiWayConfig,
    });
  }, [journeyId, node.id, config, updateNode]);

  const handleRemovePath = useCallback(
    (conditionId: string) => {
      const multiConfig = config as MultiWayConfig;
      updateNode(journeyId, node.id, {
        config: {
          ...multiConfig,
          conditions: multiConfig.conditions.filter((c) => c.id !== conditionId),
        } as MultiWayConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  const handleConditionLabelChange = useCallback(
    (conditionId: string, label: string) => {
      const multiConfig = config as MultiWayConfig;
      updateNode(journeyId, node.id, {
        config: {
          ...multiConfig,
          conditions: multiConfig.conditions.map((c) =>
            c.id === conditionId ? { ...c, label } : c,
          ),
        } as MultiWayConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  const handleConditionFilterChange = useCallback(
    (conditionId: string, group: FilterGroup) => {
      const multiConfig = config as MultiWayConfig;
      updateNode(journeyId, node.id, {
        config: {
          ...multiConfig,
          conditions: multiConfig.conditions.map((c) =>
            c.id === conditionId ? { ...c, condition: group } : c,
          ),
        } as MultiWayConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  const handleConditionSourceChange = useCallback(
    (conditionId: string, source: BranchFilterSource) => {
      const multiConfig = config as MultiWayConfig;
      // Reset the condition when changing data source since fields are different
      updateNode(journeyId, node.id, {
        config: {
          ...multiConfig,
          conditions: multiConfig.conditions.map((c) =>
            c.id === conditionId 
              ? { ...c, filterSource: source, condition: { ...emptyFilterGroup } } 
              : c,
          ),
        } as MultiWayConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  return (
    <div>
      {/* Branch type selector */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="branch-type">
          Branch Type
        </label>
        <select
          id="branch-type"
          className={selectClasses}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {BRANCH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* If/Else: FilterBuilder for condition */}
      {config.subType === 'if-else' && (
        <>
          {/* Data source selector */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="if-else-source">
              Filter on
            </label>
            <select
              id="if-else-source"
              className={selectClasses}
              value={(config as IfElseConfig).filterSource ?? 'contact'}
              onChange={handleIfElseSourceChange}
            >
              {DATA_SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight">Condition</label>
            <p className="text-xs text-muted-foreground mb-2">
              Contacts matching this condition follow the "True" path
            </p>
            <FilterBuilder
              value={(config as IfElseConfig).condition}
              onChange={handleIfElseConditionChange}
              fields={getFieldsForSource((config as IfElseConfig).filterSource)}
            />
          </div>
        </>
      )}

      {/* A/B Split: percentage inputs */}
      {config.subType === 'ab-split' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="variant-a-pct">
              Variant A (%)
            </label>
            <input
              id="variant-a-pct"
              type="number"
              className={inputClasses}
              min={1}
              max={99}
              value={(config as AbSplitConfig).variantAPercent}
              onChange={handleVariantAChange}
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight">Variant B (%)</label>
            <input
              type="number"
              className={inputClasses}
              value={100 - (config as AbSplitConfig).variantAPercent}
              readOnly
              disabled
            />
            <span className="text-xs text-muted-foreground leading-tight">
              Variant B is automatically calculated as 100 − Variant A.
            </span>
          </div>
        </>
      )}

      {/* Multi-way: list of conditions + Add Path */}
      {config.subType === 'multi-way' && (
        <>
          {(config as MultiWayConfig).conditions.map((cond, idx) => (
            <div key={cond.id} className="flex flex-col gap-2 mb-4 pb-4 border-b border-border last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground leading-tight flex-1">
                  Path {idx + 1}
                </label>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-destructive text-xs"
                  onClick={() => handleRemovePath(cond.id)}
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                className={inputClasses}
                value={cond.label}
                onChange={(e) => handleConditionLabelChange(cond.id, e.target.value)}
                placeholder="Path label…"
              />
              {/* Data source for this path */}
              <select
                className={selectClasses}
                value={cond.filterSource ?? 'contact'}
                onChange={(e) => handleConditionSourceChange(cond.id, e.target.value as BranchFilterSource)}
              >
                {DATA_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FilterBuilder
                value={cond.condition}
                onChange={(group) => handleConditionFilterChange(cond.id, group)}
                fields={getFieldsForSource(cond.filterSource)}
              />
            </div>
          ))}

          {/* Everyone Else (always present, read-only) */}
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight">Everyone Else</label>
            <span className="text-xs text-muted-foreground leading-tight">
              Contacts that don't match any condition above will follow this path.
            </span>
          </div>

          <button
            type="button"
            className={`${inputClasses} cursor-pointer text-center text-primary font-semibold`}
            onClick={handleAddPath}
          >
            + Add Path
          </button>
        </>
      )}
    </div>
  );
}
