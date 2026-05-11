import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { segments } from '../../../data/segments';
import type { JourneySettings, ReEntryRule } from '../../../models/journey';
import type { CampaignStatus, JourneyType } from '../../../models/campaign';

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
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="journey-name">
          Name
        </label>
        <input
          id="journey-name"
          type="text"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={settings.name}
          onChange={(e) => handleSettingsChange({ name: e.target.value })}
          placeholder="Journey name…"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="journey-description">
          Description
        </label>
        <textarea
          id="journey-description"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[72px]"
          value={settings.description}
          onChange={(e) => handleSettingsChange({ description: e.target.value })}
          placeholder="Describe this journey…"
        />
      </div>

      {/* Journey Type */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="journey-type">
          Journey Type
        </label>
        <select
          id="journey-type"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer"
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
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="entry-segment">
          Entry Segment
        </label>
        <select
          id="entry-segment"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer"
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
        <span className="text-xs text-muted-foreground leading-tight">
          Contacts matching this segment are eligible to enter the journey.
        </span>
      </div>

      {/* Re-entry Rule */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="reentry-rule">
          Re-entry Rule
        </label>
        <select
          id="reentry-rule"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer"
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
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="journey-status">
          Status
        </label>
        <select
          id="journey-status"
          className="w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer"
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
        <span className="text-xs text-muted-foreground leading-tight">
          Changing status updates the badge in the canvas header.
        </span>
      </div>
    </div>
  );
}
