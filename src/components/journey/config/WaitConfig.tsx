import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, WaitSubType } from '../../../models/journey';
import styles from './configStyles.module.css';

export interface WaitConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const WAIT_OPTIONS: { value: WaitSubType; label: string }[] = [
  { value: 'time-delay', label: 'Time Delay' },
  { value: 'wait-for-event', label: 'Wait for Event' },
  { value: 'wait-until-date', label: 'Wait Until Date' },
];

const DELAY_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const TIMEOUT_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'purchase_made', label: 'Purchase Made' },
  { value: 'page_visited', label: 'Page Visited' },
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'link_clicked', label: 'Link Clicked' },
];

export function WaitConfig({ journeyId, node }: WaitConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as WaitSubType;
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
      {/* Wait type selector */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="wait-type">
          Wait Type
        </label>
        <select
          id="wait-type"
          className={styles.select}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {WAIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Delay fields */}
      {config.subType === 'time-delay' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="delay-duration">
              Duration
            </label>
            <input
              id="delay-duration"
              type="number"
              min={0}
              className={styles.input}
              value={config.duration}
              onChange={(e) =>
                handleConfigChange({ duration: Math.max(0, Number(e.target.value)) })
              }
              placeholder="e.g. 3"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="delay-unit">
              Unit
            </label>
            <select
              id="delay-unit"
              className={styles.select}
              value={config.unit}
              onChange={(e) => handleConfigChange({ unit: e.target.value })}
            >
              {DELAY_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Wait for Event fields */}
      {config.subType === 'wait-for-event' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="wait-event-type">
              Event Type
            </label>
            <select
              id="wait-event-type"
              className={styles.select}
              value={config.eventType}
              onChange={(e) => handleConfigChange({ eventType: e.target.value })}
            >
              <option value="">Select an event…</option>
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="timeout-duration">
              Timeout Duration
            </label>
            <input
              id="timeout-duration"
              type="number"
              min={0}
              className={styles.input}
              value={config.timeoutDuration}
              onChange={(e) =>
                handleConfigChange({ timeoutDuration: Math.max(0, Number(e.target.value)) })
              }
              placeholder="e.g. 7"
            />
            <span className={styles.hint}>
              How long to wait before timing out if the event doesn't occur.
            </span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="timeout-unit">
              Timeout Unit
            </label>
            <select
              id="timeout-unit"
              className={styles.select}
              value={config.timeoutUnit}
              onChange={(e) => handleConfigChange({ timeoutUnit: e.target.value })}
            >
              {TIMEOUT_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Wait Until Date fields */}
      {config.subType === 'wait-until-date' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="target-date">
            Target Date
          </label>
          <input
            id="target-date"
            type="date"
            className={styles.input}
            value={config.targetDate}
            onChange={(e) => handleConfigChange({ targetDate: e.target.value })}
          />
          <span className={styles.hint}>
            Contacts will wait until this date before proceeding.
          </span>
        </div>
      )}
    </div>
  );
}
