import { useCallback } from 'react';
import { Info, Users, Lightning, Hand, CalendarBlank } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';
import type { FilterGroup } from '../../../models/segment';
import { segments } from '../../../data/segments';
import { CONTACT_FIELDS } from '../../../data/fieldRegistry';
import { FilterBuilder } from '../../shared/FilterBuilder';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { cn } from '../../../lib/utils';

export interface StartConfigProps {
  journeyId: string;
  node: JourneyNode;
}

interface TriggerOption {
  value: TriggerSubType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
}

// Walking Skeleton: Manual, Segment Entry, and Event-Based enabled
const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    value: 'manual',
    label: 'Manual',
    description: 'Manually add contacts to this journey',
    icon: Hand,
    enabled: true,
  },
  {
    value: 'segment-entry',
    label: 'Segment Entry',
    description: 'Contacts enter when they join a segment',
    icon: Users,
    enabled: true,
  },
  {
    value: 'event-based',
    label: 'Event-Based',
    description: 'Trigger when a specific event occurs',
    icon: Lightning,
    enabled: true,
  },
  {
    value: 'scheduled',
    label: 'Scheduled',
    description: 'Run on a schedule',
    icon: CalendarBlank,
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

export function StartConfig({ journeyId, node }: StartConfigProps) {
  const { journeys, updateJourney } = useJourneys();
  
  // Get the journey's trigger configuration from settings
  const journey = journeys.find((j) => j.id === journeyId);
  const triggerType = (journey?.settings as Record<string, unknown>)?.triggerType as TriggerSubType | undefined ?? 'manual';
  const triggerConfig = (journey?.settings as Record<string, unknown>)?.triggerConfig as Record<string, unknown> | undefined ?? {};

  const handleTriggerTypeChange = useCallback(
    (value: string) => {
      const newTriggerType = value as TriggerSubType;
      // Reset trigger config when changing type
      const defaultConfig = getDefaultTriggerConfig(newTriggerType);
      updateJourney(journeyId, {
        settings: {
          ...journey?.settings,
          triggerType: newTriggerType,
          triggerConfig: defaultConfig,
        },
      });
    },
    [journeyId, journey?.settings, updateJourney],
  );

  const handleConfigChange = useCallback(
    (updates: Record<string, unknown>) => {
      updateJourney(journeyId, {
        settings: {
          ...journey?.settings,
          triggerConfig: { ...triggerConfig, ...updates },
        },
      });
    },
    [journeyId, journey?.settings, triggerConfig, updateJourney],
  );

  const handleFiltersChange = useCallback(
    (filters: FilterGroup) => {
      updateJourney(journeyId, {
        settings: {
          ...journey?.settings,
          triggerConfig: { ...triggerConfig, filters },
        },
      });
    },
    [journeyId, journey?.settings, triggerConfig, updateJourney],
  );

  const currentTrigger = TRIGGER_OPTIONS.find((opt) => opt.value === triggerType);

  return (
    <div className="space-y-4">
      {/* Trigger type selector */}
      <div className="space-y-2">
        <Label htmlFor="trigger-type">Trigger Type</Label>
        <Select value={triggerType} onValueChange={handleTriggerTypeChange}>
          <SelectTrigger id="trigger-type">
            <SelectValue placeholder="Select how contacts enter" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={!opt.enabled}
                  className={cn(!opt.enabled && 'opacity-50')}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="text-muted-foreground" />
                    {opt.label}
                    {!opt.enabled && (
                      <span className="text-xs text-muted-foreground">(Coming soon)</span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {currentTrigger && (
          <p className="text-xs text-muted-foreground">{currentTrigger.description}</p>
        )}
      </div>

      {/* Trigger-specific configuration */}
      {triggerType === 'segment-entry' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="segment-picker">Segment</Label>
            <Select
              value={(triggerConfig.segmentId as string) ?? ''}
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
            {triggerConfig.segmentId && (
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
              value={(triggerConfig.filters as FilterGroup) ?? { combinator: 'AND', rules: [], groups: [] }}
              onChange={handleFiltersChange}
              fields={CONTACT_FIELDS}
            />
          </div>
        </>
      )}

      {triggerType === 'event-based' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select
              value={(triggerConfig.eventType as string) ?? ''}
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
            {triggerConfig.eventType && (
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
              value={(triggerConfig.filters as FilterGroup) ?? { combinator: 'AND', rules: [], groups: [] }}
              onChange={handleFiltersChange}
              fields={CONTACT_FIELDS}
            />
          </div>
        </>
      )}

      {triggerType === 'scheduled' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={(triggerConfig.date as string) ?? ''}
              onChange={(e) => handleConfigChange({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={(triggerConfig.recurrence as string) ?? 'once'}
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
            {triggerConfig.date && (
              <p className="text-xs text-muted-foreground">
                Journey will run {triggerConfig.recurrence === 'once' ? 'once' : triggerConfig.recurrence as string} starting{' '}
                {triggerConfig.date as string}.
              </p>
            )}
          </div>
        </>
      )}

      {triggerType === 'manual' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-description">Description (optional)</Label>
            <Textarea
              id="manual-description"
              value={(triggerConfig.description as string) ?? ''}
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

function getDefaultTriggerConfig(triggerType: TriggerSubType): Record<string, unknown> {
  const emptyFilters: FilterGroup = { combinator: 'AND', rules: [], groups: [] };
  switch (triggerType) {
    case 'segment-entry':
      return { segmentId: '', filters: emptyFilters };
    case 'event-based':
      return { eventType: '', filters: emptyFilters };
    case 'scheduled':
      return { date: '', recurrence: 'once' };
    case 'manual':
    default:
      return { description: '' };
  }
}
