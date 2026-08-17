import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { segments } from '../../../data/segments';
import type { JourneySettings, ReEntryRule } from '../../../models/journey';
import type { CampaignStatus, JourneyType } from '../../../models/campaign';
import { Label } from '../../atoms/label';
import { Input } from '../../atoms/input';
import { Textarea } from '../../atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/select';

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
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="journey-name">Name</Label>
        <Input
          id="journey-name"
          type="text"
          value={settings.name}
          onChange={(e) => handleSettingsChange({ name: e.target.value })}
          placeholder="Journey name…"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="journey-description">Description</Label>
        <Textarea
          id="journey-description"
          value={settings.description}
          onChange={(e) => handleSettingsChange({ description: e.target.value })}
          placeholder="Describe this journey…"
        />
      </div>

      {/* Journey Type */}
      <div className="space-y-2">
        <Label htmlFor="journey-type">Journey Type</Label>
        <Select
          value={settings.journeyType}
          onValueChange={(value) => handleSettingsChange({ journeyType: value as JourneyType })}
        >
          <SelectTrigger id="journey-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOURNEY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entry Criteria — Segment Picker */}
      <div className="space-y-2">
        <Label htmlFor="entry-segment">Entry Segment</Label>
        <Select
          value={settings.entryCriteria?.segmentId ?? ''}
          onValueChange={(value) => handleSettingsChange({ entryCriteria: { segmentId: value } })}
        >
          <SelectTrigger id="entry-segment">
            <SelectValue placeholder="Select a segment…" />
          </SelectTrigger>
          <SelectContent>
            {segments.map((seg) => (
              <SelectItem key={seg.id} value={seg.id}>
                {seg.name} ({seg.memberCount} members)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="body-xs text-muted-foreground block">
          Contacts matching this segment are eligible to enter the journey.
        </span>
      </div>

      {/* Re-entry Rule */}
      <div className="space-y-2">
        <Label htmlFor="reentry-rule">Re-entry Rule</Label>
        <Select
          value={settings.reEntryRule}
          onValueChange={(value) => handleSettingsChange({ reEntryRule: value as ReEntryRule })}
        >
          <SelectTrigger id="reentry-rule">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RE_ENTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="journey-status">Status</Label>
        <Select
          value={settings.status}
          onValueChange={(value) => handleSettingsChange({ status: value as CampaignStatus })}
        >
          <SelectTrigger id="journey-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="body-xs text-muted-foreground block">
          Changing status updates the badge in the canvas header.
        </span>
      </div>
    </div>
  );
}
