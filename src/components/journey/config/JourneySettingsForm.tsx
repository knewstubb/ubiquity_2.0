import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { segments } from '../../../data/segments';
import type { JourneySettings, ReEntryRule } from '../../../models/journey';
import type { CampaignStatus, JourneyType } from '../../../models/campaign';
import styles from './configStyles.module.css';

export interface JourneySettingsFormProps {
  journeyId: string;
}

const JOURNEY_TYPE_OPTIONS: { value: JourneyType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'promotional', label: 'Promotional' },
];

const RE_ENTRY_OPTIONS: { value: ReEntryRule; label: string }[] = [
  { value: 'allow', label: 'Allow re-entry' },
  { value: 'block', label: 'Block re-entry' },
  { value: 'delay', label: 'Re-enter after delay' },
];

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Archived' },
];

export function JourneySettingsForm({ journeyId }: JourneySettingsFormProps) {
  const { journeys, updateJourney } = useJourneys();
  const journey = journeys.find((j) => j.id === journeyId);

  const settings = journey?.settings;

  const handleSettingsChange = useCallback(
    (updates: Partial<JourneySettings>) => {
      if (!journey || !settings) return;
      const newSettings = { ...settings, ...updates };
      // Sync top-level journey fields that mirror settings
      const journeyUpdates: Record<string, unknown> = { settings: newSettings };
      if (updates.name !== undefined) journeyUpdates.name = updates.name;
      if (updates.status !== undefined) journeyUpdates.status = updates.status;
      if (updates.journeyType !== undefined) journeyUpdates.type = updates.journeyType;
      updateJourney(journeyId, journeyUpdates);
    },
    [journeyId, journey, settings, updateJourney],
  );

  if (!journey || !settings) return null;

  return (
    <div>
      {/* Name */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="journey-name">
          Name
        </label>
        <input
          id="journey-name"
          type="text"
          className={styles.input}
          value={settings.name}
          onChange={(e) => handleSettingsChange({ name: e.target.value })}
          placeholder="Journey name…"
        />
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="journey-description">
          Description
        </label>
        <textarea
          id="journey-description"
          className={styles.textarea}
          value={settings.description}
          onChange={(e) => handleSettingsChange({ description: e.target.value })}
          placeholder="Describe this journey…"
        />
      </div>

      {/* Journey Type */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="journey-type">
          Journey Type
        </label>
        <select
          id="journey-type"
          className={styles.select}
          value={settings.journeyType}
          onChange={(e) =>
            handleSettingsChange({ journeyType: e.target.value as JourneyType })
          }
        >
          {JOURNEY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entry Criteria — Segment Picker */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="entry-segment">
          Entry Segment
        </label>
        <select
          id="entry-segment"
          className={styles.select}
          value={settings.entryCriteria.segmentId}
          onChange={(e) =>
            handleSettingsChange({
              entryCriteria: { segmentId: e.target.value },
            })
          }
        >
          <option value="">Select a segment…</option>
          {segments.map((seg) => (
            <option key={seg.id} value={seg.id}>
              {seg.name} ({seg.memberCount} members)
            </option>
          ))}
        </select>
        <span className={styles.hint}>
          Contacts matching this segment are eligible to enter the journey.
        </span>
      </div>

      {/* Re-entry Rule */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="reentry-rule">
          Re-entry Rule
        </label>
        <select
          id="reentry-rule"
          className={styles.select}
          value={settings.reEntryRule}
          onChange={(e) =>
            handleSettingsChange({ reEntryRule: e.target.value as ReEntryRule })
          }
        >
          {RE_ENTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="journey-status">
          Status
        </label>
        <select
          id="journey-status"
          className={styles.select}
          value={settings.status}
          onChange={(e) =>
            handleSettingsChange({ status: e.target.value as CampaignStatus })
          }
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.hint}>
          Changing status updates the badge in the canvas header.
        </span>
      </div>
    </div>
  );
}
