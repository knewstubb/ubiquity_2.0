import { useCallback } from 'react';
import { Info, Users, Lightning, Hand, CalendarBlank, UsersThree, Package } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';
import type { FilterGroup as SegmentFilterGroup } from '../../../models/segment';
import { segments } from '../../../data/segments';
import { CONTACT_FIELDS, TREATMENT_FIELDS, PRODUCT_FIELDS } from '../../../data/fieldRegistry';
import { ModalFilterBuilder } from '../../organisms/filter-builder';
import type { FilterGroup as ModalFilterGroup, SourceCategoryConfig, CardFilterRow } from '../../organisms/filter-builder';
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
import { cn } from '../../../lib/utils';

/** Map field registry dataType to ModalFilterBuilder dataType */
function mapDataType(dataType: string): 'text' | 'number' | 'date' | 'boolean' | 'enum' {
  if (dataType === 'string') return 'text';
  return dataType as 'text' | 'number' | 'date' | 'boolean' | 'enum';
}

/** Source categories for entry conditions filter */
const SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  {
    id: 'contacts',
    label: 'Contacts',
    icon: UsersThree,
    subSources: [
      {
        id: 'contact-fields',
        label: 'Contact Fields',
        sourceType: 'field',
        fields: CONTACT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
    ],
  },
  {
    id: 'transactional',
    label: 'Transactional',
    icon: Package,
    subSources: [
      {
        id: 'treatments',
        label: 'Treatments',
        sourceType: 'transactional',
        fields: TREATMENT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
      {
        id: 'products',
        label: 'Products',
        sourceType: 'transactional',
        fields: PRODUCT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
    ],
  },
];

/** Convert segment FilterGroup to ModalFilterBuilder FilterGroup */
function segmentToModalFilterGroup(segmentGroup: SegmentFilterGroup): ModalFilterGroup {
  const conditions: ModalFilterGroup['conditions'] = [];
  
  for (const rule of segmentGroup.rules) {
    if (rule.field && rule.operator) {
      conditions.push({
        type: 'row',
        row: {
          sourceCategory: 'contacts',
          subSourcePath: ['contact-fields'],
          field: rule.field,
          operator: rule.operator,
          value: rule.value as string | number | boolean | null | [string, string] | string[],
          dateMode: null,
          subFilters: null,
          aggregate: null,
        },
      });
    }
  }
  
  for (const nestedGroup of segmentGroup.groups) {
    conditions.push({
      type: 'group',
      group: segmentToModalFilterGroup(nestedGroup),
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
      rules.push({
        field: condition.row.field ?? '',
        operator: condition.row.operator ?? '',
        value: condition.row.value as string | string[] | number,
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
    (modalFilters: ModalFilterGroup) => {
      // Convert modal format back to segment format for storage
      const filters = modalToSegmentFilterGroup(modalFilters);
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
                      <span className="body-xs text-muted-foreground">(Coming soon)</span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {currentTrigger && (
          <p className="body-xs text-muted-foreground">{currentTrigger.description}</p>
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
              <p className="body-xs text-muted-foreground">
                Contacts will enter this journey when they join the selected segment.
              </p>
            )}
          </div>

          {/* Entry Conditions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Entry Conditions (optional)</Label>
            <p className="body-xs text-muted-foreground mb-3">
              Further narrow which contacts can enter this journey
            </p>
            <ModalFilterBuilder
              value={segmentToModalFilterGroup((triggerConfig.filters as SegmentFilterGroup) ?? { combinator: 'AND', rules: [], groups: [] })}
              onChange={handleFiltersChange}
              sourceCategories={SOURCE_CATEGORIES}
              allowNesting={false}
              maxDepth={1}
              compact
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
              <p className="body-xs text-muted-foreground">
                Contacts will enter when this event is triggered.
              </p>
            )}
          </div>

          {/* Entry Conditions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Entry Conditions (optional)</Label>
            <p className="body-xs text-muted-foreground mb-3">
              Further narrow which contacts can enter this journey
            </p>
            <ModalFilterBuilder
              value={segmentToModalFilterGroup((triggerConfig.filters as SegmentFilterGroup) ?? { combinator: 'AND', rules: [], groups: [] })}
              onChange={handleFiltersChange}
              sourceCategories={SOURCE_CATEGORIES}
              allowNesting={false}
              maxDepth={1}
              compact
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
              <p className="body-xs text-muted-foreground">
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
  const emptyFilters: SegmentFilterGroup = { combinator: 'AND', rules: [], groups: [] };
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
