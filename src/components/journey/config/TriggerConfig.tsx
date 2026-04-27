import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';
import { segments } from '../../../data/segments';
import styles from './configStyles.module.css';

export interface TriggerConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const TRIGGER_OPTIONS: { value: TriggerSubType; label: string }[] = [
  { value: 'segment-entry', label: 'Segment Entry' },
  { value: 'event-based', label: 'Event-Based' },
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
];

const EVENT_OPTIONS = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'purchase_made', label: 'Purchase Made' },
  { value: 'page_visited', label: 'Page Visited' },
];

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TriggerConfig({ journeyId, node }: TriggerConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as TriggerSubType;
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
      {/* Trigger type selector */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="trigger-type">
          Trigger Type
        </label>
        <select
          id="trigger-type"
          className={styles.select}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {TRIGGER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-type specific fields */}
      {config.subType === 'segment-entry' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="segment-picker">
            Segment
          </label>
          <select
            id="segment-picker"
            className={styles.select}
            value={config.segmentId}
            onChange={(e) => handleConfigChange({ segmentId: e.target.value })}
          >
            <option value="">Select a segment…</option>
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name} ({seg.memberCount} members)
              </option>
            ))}
          </select>
        </div>
      )}

      {config.subType === 'event-based' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="event-type">
            Event Type
          </label>
          <select
            id="event-type"
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
      )}

      {config.subType === 'scheduled' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="schedule-date">
              Date
            </label>
            <input
              id="schedule-date"
              type="date"
              className={styles.input}
              value={config.date}
              onChange={(e) => handleConfigChange({ date: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="recurrence">
              Recurrence
            </label>
            <select
              id="recurrence"
              className={styles.select}
              value={config.recurrence}
              onChange={(e) => handleConfigChange({ recurrence: e.target.value })}
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {config.subType === 'manual' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="manual-description">
            Description
          </label>
          <textarea
            id="manual-description"
            className={styles.textarea}
            value={config.description}
            onChange={(e) => handleConfigChange({ description: e.target.value })}
            placeholder="Describe how contacts are added manually…"
          />
          <span className={styles.hint}>
            Contacts will be added to this journey manually by an operator.
          </span>
        </div>
      )}
    </div>
  );
}
