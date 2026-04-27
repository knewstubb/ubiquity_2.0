// src/models/journey.ts

import type { Journey } from './campaign';
import type { FilterGroup } from './segment';

// --- Node sub-type discriminated union ---

export type TriggerSubType = 'segment-entry' | 'event-based' | 'manual' | 'scheduled';
export type ActionSubType = 'send-email' | 'send-sms' | 'update-contact' | 'webhook';
export type WaitSubType = 'time-delay' | 'wait-for-event' | 'wait-until-date';
export type BranchSubType = 'if-else' | 'ab-split' | 'multi-way';
export type EndSubType = 'exit' | 'move-to-journey';

export type NodeType = 'trigger' | 'action' | 'wait' | 'branch' | 'end' | 'join';

// --- Node configuration types (discriminated union) ---

export interface SegmentEntryConfig {
  subType: 'segment-entry';
  segmentId: string;
}

export interface EventBasedConfig {
  subType: 'event-based';
  eventType: string;
}

export interface ManualConfig {
  subType: 'manual';
  description: string;
}

export interface ScheduledConfig {
  subType: 'scheduled';
  date: string;
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
}

export type TriggerConfig =
  | SegmentEntryConfig
  | EventBasedConfig
  | ManualConfig
  | ScheduledConfig;

export interface SendEmailConfig {
  subType: 'send-email';
  emailRef: string;
  emailContent: string;
}

export interface SendSmsConfig {
  subType: 'send-sms';
  messageText: string;
  senderName: string;
}

export interface UpdateContactConfig {
  subType: 'update-contact';
  fieldKey: string;
  value: string;
}

export interface WebhookConfig {
  subType: 'webhook';
  url: string;
  method: 'GET' | 'POST';
}

export type ActionConfig =
  | SendEmailConfig
  | SendSmsConfig
  | UpdateContactConfig
  | WebhookConfig;

export interface TimeDelayConfig {
  subType: 'time-delay';
  duration: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
}

export interface WaitForEventConfig {
  subType: 'wait-for-event';
  eventType: string;
  timeoutDuration: number;
  timeoutUnit: 'hours' | 'days' | 'weeks';
}

export interface WaitUntilDateConfig {
  subType: 'wait-until-date';
  targetDate: string;
}

export type WaitConfig =
  | TimeDelayConfig
  | WaitForEventConfig
  | WaitUntilDateConfig;

export interface IfElseConfig {
  subType: 'if-else';
  condition: FilterGroup;
}

export interface AbSplitConfig {
  subType: 'ab-split';
  variantAPercent: number;
}

export interface MultiWayCondition {
  id: string;
  label: string;
  condition: FilterGroup;
}

export interface MultiWayConfig {
  subType: 'multi-way';
  conditions: MultiWayCondition[];
}

export type BranchConfig =
  | IfElseConfig
  | AbSplitConfig
  | MultiWayConfig;

export interface ExitConfig {
  subType: 'exit';
  label: string;
  reason: 'completed' | 'unsubscribed' | 'goal-met' | '';
}

export interface MoveToJourneyConfig {
  subType: 'move-to-journey';
  targetJourneyId: string;
}

export type EndConfig = ExitConfig | MoveToJourneyConfig;

export interface JoinConfig {
  subType: 'join';
}

export type NodeConfig =
  | TriggerConfig
  | ActionConfig
  | WaitConfig
  | BranchConfig
  | EndConfig
  | JoinConfig;

// --- Node and Edge ---

export interface JourneyNode {
  id: string;
  type: NodeType;
  subType: string;
  position: { x: number; y: number };
  label: string;
  config: NodeConfig;
}

export interface JourneyEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  label?: string;
}

// --- Journey Settings ---

export type ReEntryRule = 'allow' | 'block' | 'delay';

export interface JourneySettings {
  name: string;
  description: string;
  journeyType: Journey['type'];
  entryCriteria: {
    segmentId: string;
  };
  reEntryRule: ReEntryRule;
  status: Journey['status'];
}

// --- Full journey definition (extends list-level Journey) ---

export interface JourneyDefinition extends Journey {
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  settings: JourneySettings;
}

// --- Factory: default config for any sub-type ---

const emptyFilterGroup: FilterGroup = {
  combinator: 'AND',
  rules: [],
  groups: [],
};

export function createDefaultConfig(subType: string): NodeConfig {
  switch (subType) {
    // Trigger sub-types
    case 'segment-entry':
      return { subType: 'segment-entry', segmentId: '' };
    case 'event-based':
      return { subType: 'event-based', eventType: '' };
    case 'manual':
      return { subType: 'manual', description: '' };
    case 'scheduled':
      return { subType: 'scheduled', date: '', recurrence: 'once' };

    // Action sub-types
    case 'send-email':
      return { subType: 'send-email', emailRef: '', emailContent: '' };
    case 'send-sms':
      return { subType: 'send-sms', messageText: '', senderName: '' };
    case 'update-contact':
      return { subType: 'update-contact', fieldKey: '', value: '' };
    case 'webhook':
      return { subType: 'webhook', url: '', method: 'POST' };

    // Wait sub-types
    case 'time-delay':
      return { subType: 'time-delay', duration: 0, unit: 'days' };
    case 'wait-for-event':
      return { subType: 'wait-for-event', eventType: '', timeoutDuration: 0, timeoutUnit: 'days' };
    case 'wait-until-date':
      return { subType: 'wait-until-date', targetDate: '' };

    // Branch sub-types
    case 'if-else':
      return { subType: 'if-else', condition: emptyFilterGroup };
    case 'ab-split':
      return { subType: 'ab-split', variantAPercent: 50 };
    case 'multi-way':
      return { subType: 'multi-way', conditions: [] };

    // End sub-types
    case 'exit':
      return { subType: 'exit', label: '', reason: '' };
    case 'move-to-journey':
      return { subType: 'move-to-journey', targetJourneyId: '' };

    // Join
    case 'join':
      return { subType: 'join' };

    default:
      return { subType: 'exit', label: '', reason: '' };
  }
}

// --- Utility: human-readable summary label from node config ---

export function getNodeSummaryLabel(node: JourneyNode): string {
  const { config } = node;

  switch (config.subType) {
    // Triggers
    case 'segment-entry':
      return config.segmentId ? `Segment: ${config.segmentId}` : 'Segment Entry';
    case 'event-based':
      return config.eventType ? `Event: ${config.eventType}` : 'Event-Based';
    case 'manual':
      return config.description ? `Manual: ${config.description}` : 'Manual Trigger';
    case 'scheduled':
      return config.date
        ? `Scheduled: ${config.date} (${config.recurrence})`
        : 'Scheduled';

    // Actions
    case 'send-email':
      return config.emailRef ? `Send: ${config.emailRef}` : 'Send Email';
    case 'send-sms':
      return config.messageText
        ? `SMS: ${config.messageText.slice(0, 30)}${config.messageText.length > 30 ? '…' : ''}`
        : 'Send SMS';
    case 'update-contact':
      return config.fieldKey ? `Update: ${config.fieldKey}` : 'Update Contact';
    case 'webhook':
      return config.url ? `${config.method} ${config.url}` : 'Webhook';

    // Waits
    case 'time-delay':
      return config.duration > 0
        ? `Wait ${config.duration} ${config.unit}`
        : 'Time Delay';
    case 'wait-for-event':
      return config.eventType ? `Wait for: ${config.eventType}` : 'Wait for Event';
    case 'wait-until-date':
      return config.targetDate ? `Until: ${config.targetDate}` : 'Wait Until Date';

    // Branches
    case 'if-else':
      return config.condition.rules.length > 0
        ? `If: ${config.condition.rules[0].field} ${config.condition.rules[0].operator}`
        : 'If/Else';
    case 'ab-split':
      return `A/B Split: ${config.variantAPercent}/${100 - config.variantAPercent}`;
    case 'multi-way':
      return config.conditions.length > 0
        ? `Split: ${config.conditions.length} paths + Everyone Else`
        : 'Multi-way Split';

    // Ends
    case 'exit':
      return config.label || config.reason || 'Exit Journey';
    case 'move-to-journey':
      return config.targetJourneyId
        ? `Move to: ${config.targetJourneyId}`
        : 'Move to Journey';

    // Join
    case 'join':
      return 'Join';

    default:
      return node.label || 'Unknown';
  }
}
