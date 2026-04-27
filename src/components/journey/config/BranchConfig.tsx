import { useCallback } from 'react';
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
import type { FilterGroup } from '../../../models/segment';
import { FilterBuilder } from '../../shared/FilterBuilder';
import styles from './configStyles.module.css';

export interface BranchConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const BRANCH_OPTIONS: { value: BranchSubType; label: string }[] = [
  { value: 'if-else', label: 'If/Else' },
  { value: 'ab-split', label: 'A/B Split' },
  { value: 'multi-way', label: 'Multi-way Split' },
];

const emptyFilterGroup: FilterGroup = {
  combinator: 'AND',
  rules: [],
  groups: [],
};

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

  return (
    <div>
      {/* Branch type selector */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="branch-type">
          Branch Type
        </label>
        <select
          id="branch-type"
          className={styles.select}
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Condition</label>
          <FilterBuilder
            value={(config as IfElseConfig).condition}
            onChange={handleIfElseConditionChange}
          />
        </div>
      )}

      {/* A/B Split: percentage inputs */}
      {config.subType === 'ab-split' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="variant-a-pct">
              Variant A (%)
            </label>
            <input
              id="variant-a-pct"
              type="number"
              className={styles.input}
              min={1}
              max={99}
              value={(config as AbSplitConfig).variantAPercent}
              onChange={handleVariantAChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Variant B (%)</label>
            <input
              type="number"
              className={styles.input}
              value={100 - (config as AbSplitConfig).variantAPercent}
              readOnly
              disabled
            />
            <span className={styles.hint}>
              Variant B is automatically calculated as 100 − Variant A.
            </span>
          </div>
        </>
      )}

      {/* Multi-way: list of conditions + Add Path */}
      {config.subType === 'multi-way' && (
        <>
          {(config as MultiWayConfig).conditions.map((cond, idx) => (
            <div key={cond.id} className={styles.formGroup}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label className={styles.label} style={{ flex: 1 }}>
                  Path {idx + 1}
                </label>
                <button
                  type="button"
                  className={styles.hint}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-error, #EF4444)',
                    fontSize: 'var(--font-xs)',
                  }}
                  onClick={() => handleRemovePath(cond.id)}
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                className={styles.input}
                value={cond.label}
                onChange={(e) => handleConditionLabelChange(cond.id, e.target.value)}
                placeholder="Path label…"
              />
              <FilterBuilder
                value={cond.condition}
                onChange={(group) => handleConditionFilterChange(cond.id, group)}
              />
            </div>
          ))}

          {/* Everyone Else (always present, read-only) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Everyone Else</label>
            <span className={styles.hint}>
              Contacts that don't match any condition above will follow this path.
            </span>
          </div>

          <button
            type="button"
            className={styles.input}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              color: 'var(--color-primary-500, #14B88A)',
              fontWeight: 'var(--weight-semibold, 600)',
            }}
            onClick={handleAddPath}
          >
            + Add Path
          </button>
        </>
      )}
    </div>
  );
}
