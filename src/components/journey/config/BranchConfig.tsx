import { useCallback, useMemo } from 'react';
import { User, ShoppingCart } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type {
  JourneyNode,
  BranchSubType,
  IfElseConfig,
  AbSplitConfig,
  MultiWayConfig,
  MultiWayCondition,
} from '../../../models/journey';
import type { FilterGroup as SegmentFilterGroup } from '../../../models/segment';
import type { FilterGroup as ModalFilterGroup, SourceCategoryConfig, CardFilterRow } from '../../composed/filter-builder/types';
import { CONTACT_FIELDS, TREATMENT_FIELDS, PRODUCT_FIELDS } from '../../../data/fieldRegistry';
import { ModalFilterBuilder } from '../../composed/filter-builder';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

export interface BranchConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const BRANCH_OPTIONS: { value: BranchSubType; label: string }[] = [
  { value: 'if-else', label: 'If/Else' },
  { value: 'ab-split', label: 'A/B Split' },
  { value: 'multi-way', label: 'Multi-way Split' },
];

/** Map field registry dataType to ModalFilterBuilder dataType */
function mapDataType(dataType: string): 'text' | 'number' | 'date' | 'boolean' | 'enum' {
  if (dataType === 'string') return 'text';
  return dataType as 'text' | 'number' | 'date' | 'boolean' | 'enum';
}

/** Source categories for the ModalFilterBuilder drill-down UI */
const SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: <User size={20} weight="duotone" className="text-primary" />,
    title: 'Contacts',
    description: 'Contact profiles and attributes',
    fields: CONTACT_FIELDS.map(f => ({
      key: f.key,
      label: f.label,
      dataType: mapDataType(f.dataType),
      enumOptions: f.enumValues?.map(v => ({ value: v, label: v })),
    })),
  },
  {
    key: 'transactional',
    icon: <ShoppingCart size={20} weight="duotone" className="text-primary" />,
    title: 'Transactional',
    description: 'Purchase and transaction data',
    fields: [],
    subSources: [
      {
        key: 'treatments',
        label: 'Treatments',
        sourceType: 'transactional',
        fields: TREATMENT_FIELDS.map(f => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumOptions: f.enumValues?.map(v => ({ value: v, label: v })),
        })),
      },
      {
        key: 'products',
        label: 'Products',
        sourceType: 'transactional',
        fields: PRODUCT_FIELDS.map(f => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumOptions: f.enumValues?.map(v => ({ value: v, label: v })),
        })),
      },
    ],
  },
];

/** Convert segment FilterGroup to ModalFilterBuilder FilterGroup */
function segmentToModalFilterGroup(segmentGroup: SegmentFilterGroup): ModalFilterGroup {
  const conditions: ModalFilterGroup['conditions'] = [];

  // Convert rules to row conditions
  for (const rule of segmentGroup.rules) {
    conditions.push({
      type: 'row',
      row: {
        sourceCategory: 'contacts', // Default; will be overridden by full CardFilterRow if present
        subSource: null,
        field: rule.field,
        operator: rule.operator,
        value: rule.value as string | number | boolean | null | [string, string] | string[],
        dateMode: null,
      } as CardFilterRow,
    });
  }

  // Convert nested groups recursively
  for (const nested of segmentGroup.groups) {
    conditions.push({
      type: 'group',
      group: segmentToModalFilterGroup(nested),
    });
  }

  return {
    logic: segmentGroup.combinator.toLowerCase() as 'and' | 'or',
    conditions,
  };
}

/** Convert ModalFilterBuilder FilterGroup to segment FilterGroup */
function modalToSegmentFilterGroup(modalGroup: ModalFilterGroup): SegmentFilterGroup {
  const rules: SegmentFilterGroup['rules'] = [];
  const groups: SegmentFilterGroup['groups'] = [];

  for (const condition of modalGroup.conditions) {
    if (condition.type === 'row') {
      const row = condition.row as CardFilterRow;
      rules.push({
        field: row.field,
        operator: row.operator,
        value: row.value as string | string[] | number,
      });
    } else if (condition.type === 'group') {
      groups.push(modalToSegmentFilterGroup(condition.group));
    }
  }

  return {
    combinator: modalGroup.logic.toUpperCase() as 'AND' | 'OR',
    rules,
    groups,
  };
}

const emptySegmentFilterGroup: SegmentFilterGroup = {
  combinator: 'AND',
  rules: [],
  groups: [],
};

const emptyModalFilterGroup: ModalFilterGroup = {
  logic: 'and',
  conditions: [],
};

let conditionIdCounter = 0;
function generateConditionId(): string {
  conditionIdCounter += 1;
  return `cond-${Date.now()}-${conditionIdCounter}`;
}

export function BranchConfig({ journeyId, node }: BranchConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  /* ── If/Else handlers ── */

  // Convert segment FilterGroup to Modal FilterGroup for display
  const ifElseModalValue = useMemo(() => {
    const ifElseConfig = config as IfElseConfig;
    if (!ifElseConfig.condition) return emptyModalFilterGroup;
    return segmentToModalFilterGroup(ifElseConfig.condition);
  }, [config]);

  const handleIfElseConditionChange = useCallback(
    (modalGroup: ModalFilterGroup) => {
      const segmentGroup = modalToSegmentFilterGroup(modalGroup);
      updateNode(journeyId, node.id, {
        config: { ...config, condition: segmentGroup } as IfElseConfig,
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
      condition: { ...emptySegmentFilterGroup },
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
    (conditionId: string, modalGroup: ModalFilterGroup) => {
      const multiConfig = config as MultiWayConfig;
      const segmentGroup = modalToSegmentFilterGroup(modalGroup);
      updateNode(journeyId, node.id, {
        config: {
          ...multiConfig,
          conditions: multiConfig.conditions.map((c) =>
            c.id === conditionId ? { ...c, condition: segmentGroup } : c,
          ),
        } as MultiWayConfig,
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  // Convert multi-way conditions to modal format
  const getMultiWayModalValue = useCallback((cond: MultiWayCondition): ModalFilterGroup => {
    if (!cond.condition) return emptyModalFilterGroup;
    return segmentToModalFilterGroup(cond.condition);
  }, []);

  return (
    <div className="space-y-4">
      {/* Branch type selector */}
      <div className="space-y-2">
        <Label htmlFor="branch-type">Branch Type</Label>
        <Select value={node.subType} onValueChange={(value) => {
          const newSubType = value as BranchSubType;
          const newConfig = createDefaultConfig(newSubType);
          updateNode(journeyId, node.id, { subType: newSubType, config: newConfig });
        }}>
          <SelectTrigger id="branch-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BRANCH_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* If/Else: ModalFilterBuilder for condition */}
      {config.subType === 'if-else' && (
        <div className="space-y-2">
          <Label>Condition</Label>
          <p className="body-xs text-muted-foreground">
            Contacts matching this condition follow the "True" path
          </p>
          <ModalFilterBuilder
            value={ifElseModalValue}
            onChange={handleIfElseConditionChange}
            sourceCategories={SOURCE_CATEGORIES}
            allowNesting={false}
            maxDepth={1}
            maxConditions={10}
            maxGroups={3}
            compact
          />
        </div>
      )}

      {/* A/B Split: percentage inputs */}
      {config.subType === 'ab-split' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="variant-a-pct">Variant A (%)</Label>
            <Input
              id="variant-a-pct"
              type="number"
              min={1}
              max={99}
              value={(config as AbSplitConfig).variantAPercent}
              onChange={handleVariantAChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Variant B (%)</Label>
            <Input
              type="number"
              value={100 - (config as AbSplitConfig).variantAPercent}
              readOnly
              disabled
            />
            <span className="body-xs text-muted-foreground">
              Variant B is automatically calculated as 100 − Variant A.
            </span>
          </div>
        </>
      )}

      {/* Multi-way: list of conditions + Add Path */}
      {config.subType === 'multi-way' && (
        <>
          {(config as MultiWayConfig).conditions.map((cond, idx) => (
            <div key={cond.id} className="space-y-2 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2">
                <Label className="flex-1">Path {idx + 1}</Label>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-destructive body-xs hover:underline"
                  onClick={() => handleRemovePath(cond.id)}
                >
                  Remove
                </button>
              </div>
              <Input
                type="text"
                value={cond.label}
                onChange={(e) => handleConditionLabelChange(cond.id, e.target.value)}
                placeholder="Path label…"
              />
              {/* ModalFilterBuilder for this path's condition */}
              <ModalFilterBuilder
                value={getMultiWayModalValue(cond)}
                onChange={(group) => handleConditionFilterChange(cond.id, group)}
                sourceCategories={SOURCE_CATEGORIES}
                allowNesting={false}
                maxDepth={1}
                maxConditions={10}
                maxGroups={3}
                compact
              />
            </div>
          ))}

          {/* Everyone Else (always present, read-only) */}
          <div className="space-y-1">
            <Label>Everyone Else</Label>
            <span className="body-xs text-muted-foreground block">
              Contacts that don't match any condition above will follow this path.
            </span>
          </div>

          <button
            type="button"
            className="w-full px-3 py-2 text-center text-primary font-semibold border border-border rounded-md bg-white hover:bg-muted transition-colors cursor-pointer"
            onClick={handleAddPath}
          >
            + Add Path
          </button>
        </>
      )}
    </div>
  );
}
