import { useCallback } from 'react';
import { Info } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, TriggerSubType, SegmentEntryConfig, EventBasedConfig } from '../../../models/journey';
import type { FilterGroup } from '../../../models/segment';
import { segments } from '../../../data/segments';
import { CONTACT_FIELDS } from '../../../data/fieldRegistry';
import { FilterBuilder } from '../../shared/FilterBuilder';
import { Label } from '../../atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/select';
import { Input } from '../../atoms/input';
import { Textarea } from '../../atoms/textarea';

export interface TriggerConfigProps {
  journeyId: string;
  node: JourneyNode;
}

interface TriggerOption {
  value: TriggerSubType;
  label: string;
  description: string;
  enabled: boolean;
}

// Walking Skeleton: Only Manual is enabled for now
const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    value: 'manual',
    label: 'Manual',
    description: 'Manually add contacts to this journey',
    enabled: true,
  },
  {
    value: 'segment-entry',
    label: 'Segment Entry',
    description: 'Contacts enter when they join a segment',
    enabled: false,
  },
  {
    value: 'event-based',
    label: 'Event-Based',
    description: 'Trigger when a specific event occurs',
    enabled: false,
  },
  {
    value: 'scheduled',
    label: 'Scheduled',
    description: 'Run on a schedule',
    enabled: false,
  },
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
    (value: string) => {
      const newSubType = value as TriggerSubType;
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

  const handleFiltersChange = useCallback(
    (filters: FilterGroup) => {
      updateNode(journeyId, node.id, {
        config: { ...config, filters },
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  const currentTrigger = TRIGGER_OPTIONS.find((opt) => opt.value === node.subType);

  return (
    <div className="space-y-4">
      {/* Trigger type selector */}
      <div className="space-y-2">
        <Label htmlFor="trigger-type">Trigger Type</Label>
        <Select value={node.subType} onValueChange={handleSubTypeChange}>
          <SelectTrigger id="trigger-type">
            <SelectValue placeholder="Select a trigger type" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={!opt.enabled}
                className={!opt.enabled ? 'opacity-50' : ''}
              >
                <span className="flex items-center gap-2">
                  {opt.label}
                  {!opt.enabled && (
                    <span className="text-xs text-muted-foreground">(Coming soon)</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentTrigger && (
          <p className="text-xs text-muted-foreground">{currentTrigger.description}</p>
        )}
      </div>

      {/* Sub-type specific fields */}
      {config.subType === 'segment-entry' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="segment-picker">Segment</Label>
            <Select
              value={(config as SegmentEntryConfig).segmentId}
              onValueChange={(value) => handleConfigChange({ segmentId: value })}
            >
              <SelectTrigger id="segment-picker">
                <SelectValue placeholder="Select a segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    {seg.name} ({seg.memberCount.toLocaleString()} members)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(config as SegmentEntryConfig).segmentId && (
              <p className="text-xs text-muted-foreground">
                Contacts will enter this journey when they join the selected segment.
              </p>
            )}
          </div>

          {/* Entry Conditions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Entry Conditions (optional)</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Further narrow which contacts can enter this journey
            </p>
            <FilterBuilder
              value={(config as SegmentEntryConfig).filters ?? { combinator: 'AND', rules: [], groups: [] }}
              onChange={handleFiltersChange}
              fields={CONTACT_FIELDS}
            />
          </div>
        </>
      )}

      {config.subType === 'event-based' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select
              value={(config as EventBasedConfig).eventType}
              onValueChange={(value) => handleConfigChange({ eventType: value })}
            >
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(config as EventBasedConfig).eventType && (
              <p className="text-xs text-muted-foreground">
                Contacts will enter when this event is triggered.
              </p>
            )}
          </div>

          {/* Entry Conditions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Entry Conditions (optional)</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Further narrow which contacts can enter this journey
            </p>
            <FilterBuilder
              value={(config as EventBasedConfig).filters ?? { combinator: 'AND', rules: [], groups: [] }}
              onChange={handleFiltersChange}
              fields={CONTACT_FIELDS}
            />
          </div>
        </>
      )}

      {config.subType === 'scheduled' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={config.date}
              onChange={(e) => handleConfigChange({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={config.recurrence}
              onValueChange={(value) => handleConfigChange({ recurrence: value })}
            >
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.date && (
              <p className="text-xs text-muted-foreground">
                Journey will run {config.recurrence === 'once' ? 'once' : config.recurrence} starting{' '}
                {config.date}.
              </p>
            )}
          </div>
        </>
      )}

      {config.subType === 'manual' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-description">Description (optional)</Label>
            <Textarea
              id="manual-description"
              value={config.description}
              onChange={(e) => handleConfigChange({ description: e.target.value })}
              placeholder="Describe when contacts should be added..."
              className="min-h-[72px] resize-y"
            />
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md bg-secondary text-secondary-foreground">
            <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed">
              Contacts will be added to this journey manually. Use the <strong>Activate</strong> button
              to enable the journey, then add contacts from the audience list or via API.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
