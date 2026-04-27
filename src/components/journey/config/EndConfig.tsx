import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, EndSubType } from '../../../models/journey';
import styles from './configStyles.module.css';

export interface EndConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const END_OPTIONS: { value: EndSubType; label: string }[] = [
  { value: 'exit', label: 'Exit Journey' },
  { value: 'move-to-journey', label: 'Move to Journey' },
];

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'No reason' },
  { value: 'completed', label: 'Completed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'goal-met', label: 'Goal Met' },
];

export function EndConfig({ journeyId, node }: EndConfigProps) {
  const { updateNode, journeys } = useJourneys();
  const config = node.config;

  const otherJourneys = journeys.filter((j) => j.id !== journeyId);

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as EndSubType;
      const newConfig = createDefaultConfig(newSubType);
      updateNode(journeyId, node.id, { subType: newSubType, config: newConfig });
    },
    [journeyId, node.id, updateNode],
  );

  const handleConfigChange = useCallback(
    (updates: Record<string, unknown>) => {
      updateNode(journeyId, node.id, {
        config: { ...config, ...updates },
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  return (
    <div>
      {/* End type selector */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="end-type">
          End Type
        </label>
        <select
          id="end-type"
          className={styles.select}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {END_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Exit Journey fields */}
      {config.subType === 'exit' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="exit-label">
              Label
            </label>
            <input
              id="exit-label"
              type="text"
              className={styles.input}
              value={config.label}
              onChange={(e) => handleConfigChange({ label: e.target.value })}
              placeholder="e.g. Journey Complete"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="exit-reason">
              Reason
            </label>
            <select
              id="exit-reason"
              className={styles.select}
              value={config.reason}
              onChange={(e) => handleConfigChange({ reason: e.target.value })}
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={styles.hint}>
              Optional reason for why contacts exit at this point.
            </span>
          </div>
        </>
      )}

      {/* Move to Journey fields */}
      {config.subType === 'move-to-journey' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="target-journey">
            Target Journey
          </label>
          <select
            id="target-journey"
            className={styles.select}
            value={config.targetJourneyId}
            onChange={(e) => handleConfigChange({ targetJourneyId: e.target.value })}
          >
            <option value="">Select a journey…</option>
            {otherJourneys.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
          {otherJourneys.length === 0 && (
            <span className={styles.hint}>
              No other journeys available. Create another journey first.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
