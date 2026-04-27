import { describe, it, expect } from 'vitest';
import { validateJourney, type ValidationError } from './journeyValidation';
import type {
  JourneyDefinition,
  JourneyNode,
  JourneyEdge,
} from '../models/journey';

/** Helper to build a minimal JourneyDefinition for testing */
function makeJourney(
  nodes: JourneyNode[],
  edges: JourneyEdge[] = [],
): JourneyDefinition {
  return {
    id: 'test-journey',
    name: 'Test Journey',
    campaignId: 'cmp-1',
    accountId: 'acc-1',
    status: 'draft',
    nodeCount: nodes.length,
    entryCount: 0,
    type: 'welcome',
    nodes,
    edges,
    settings: {
      name: 'Test Journey',
      description: '',
      journeyType: 'welcome',
      entryCriteria: { segmentId: '' },
      reEntryRule: 'block',
      status: 'draft',
    },
  };
}

function makeTriggerNode(overrides: Partial<JourneyNode> = {}): JourneyNode {
  return {
    id: 'trigger-1',
    type: 'trigger',
    subType: 'segment-entry',
    position: { x: 0, y: 0 },
    label: 'Trigger',
    config: { subType: 'segment-entry', segmentId: 'seg-1' },
    ...overrides,
  };
}

function makeActionNode(overrides: Partial<JourneyNode> = {}): JourneyNode {
  return {
    id: 'action-1',
    type: 'action',
    subType: 'send-email',
    position: { x: 0, y: 150 },
    label: 'Send Email',
    config: { subType: 'send-email', emailRef: 'Welcome', emailContent: '' },
    ...overrides,
  };
}

function makeEndNode(overrides: Partial<JourneyNode> = {}): JourneyNode {
  return {
    id: 'end-1',
    type: 'end',
    subType: 'exit',
    position: { x: 0, y: 300 },
    label: 'Exit',
    config: { subType: 'exit', label: '', reason: '' },
    ...overrides,
  };
}

function edge(source: string, target: string, id?: string): JourneyEdge {
  return {
    id: id ?? `${source}-${target}`,
    sourceNodeId: source,
    targetNodeId: target,
    sourceHandle: 'default',
  };
}

describe('validateJourney', () => {
  // --- Trigger checks ---

  it('returns error when journey has no trigger node', () => {
    const journey = makeJourney([makeActionNode(), makeEndNode()], [
      edge('action-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        message: 'Journey must have a trigger node',
        severity: 'error',
      }),
    );
  });

  it('returns error when journey has multiple trigger nodes', () => {
    const t1 = makeTriggerNode({ id: 't1', label: 'Trigger 1' });
    const t2 = makeTriggerNode({ id: 't2', label: 'Trigger 2' });
    const end = makeEndNode();
    const journey = makeJourney([t1, t2, end], [
      edge('t1', 'end-1'),
      edge('t2', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        message: 'Journey can only have one trigger node',
        severity: 'error',
      }),
    );
  });

  // --- Config completeness ---

  it('returns error for segment-entry trigger with empty segmentId', () => {
    const trigger = makeTriggerNode({
      config: { subType: 'segment-entry', segmentId: '' },
    });
    const end = makeEndNode();
    const journey = makeJourney([trigger, end], [
      edge('trigger-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'trigger-1',
        message: 'Trigger: Missing required configuration',
        severity: 'error',
      }),
    );
  });

  it('returns error for send-email action with empty emailRef', () => {
    const trigger = makeTriggerNode();
    const action = makeActionNode({
      config: { subType: 'send-email', emailRef: '', emailContent: '' },
    });
    const end = makeEndNode();
    const journey = makeJourney([trigger, action, end], [
      edge('trigger-1', 'action-1'),
      edge('action-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'action-1',
        message: 'Send Email: Missing required configuration',
      }),
    );
  });

  it('returns error for time-delay with duration 0', () => {
    const trigger = makeTriggerNode();
    const wait: JourneyNode = {
      id: 'wait-1',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 0, y: 150 },
      label: 'Wait',
      config: { subType: 'time-delay', duration: 0, unit: 'days' },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, wait, end], [
      edge('trigger-1', 'wait-1'),
      edge('wait-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'wait-1',
        message: 'Wait: Missing required configuration',
      }),
    );
  });

  it('returns error for ab-split with variantAPercent out of range', () => {
    const trigger = makeTriggerNode();
    const branch: JourneyNode = {
      id: 'branch-1',
      type: 'branch',
      subType: 'ab-split',
      position: { x: 0, y: 150 },
      label: 'A/B Split',
      config: { subType: 'ab-split', variantAPercent: 0 },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, branch, end], [
      edge('trigger-1', 'branch-1'),
      edge('branch-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'branch-1',
        message: 'A/B Split: Missing required configuration',
      }),
    );
  });

  it('returns error for if-else with no complete rules', () => {
    const trigger = makeTriggerNode();
    const branch: JourneyNode = {
      id: 'branch-1',
      type: 'branch',
      subType: 'if-else',
      position: { x: 0, y: 150 },
      label: 'If/Else',
      config: {
        subType: 'if-else',
        condition: { combinator: 'AND', rules: [], groups: [] },
      },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, branch, end], [
      edge('trigger-1', 'branch-1'),
      edge('branch-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'branch-1',
        message: 'If/Else: Missing required configuration',
      }),
    );
  });

  it('does not flag exit nodes as incomplete', () => {
    const trigger = makeTriggerNode();
    const end = makeEndNode();
    const journey = makeJourney([trigger, end], [edge('trigger-1', 'end-1')]);
    const errors = validateJourney(journey);
    const configErrors = errors.filter(
      (e) => e.nodeId === 'end-1' && e.message.includes('Missing required'),
    );
    expect(configErrors).toHaveLength(0);
  });

  it('does not flag join nodes as incomplete', () => {
    const trigger = makeTriggerNode();
    const join: JourneyNode = {
      id: 'join-1',
      type: 'join',
      subType: 'join',
      position: { x: 0, y: 150 },
      label: 'Join',
      config: { subType: 'join' },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, join, end], [
      edge('trigger-1', 'join-1'),
      edge('join-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    const configErrors = errors.filter(
      (e) => e.nodeId === 'join-1' && e.message.includes('Missing required'),
    );
    expect(configErrors).toHaveLength(0);
  });

  // --- Connectivity checks ---

  it('returns error for non-end node with no outgoing edge', () => {
    const trigger = makeTriggerNode();
    const action = makeActionNode();
    const journey = makeJourney([trigger, action], [
      edge('trigger-1', 'action-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'action-1',
        message: 'Send Email: No outgoing connection',
        severity: 'error',
      }),
    );
  });

  it('returns error for disconnected node', () => {
    const trigger = makeTriggerNode();
    const action = makeActionNode();
    const end = makeEndNode();
    // action-1 has no edges at all
    const journey = makeJourney([trigger, action, end], [
      edge('trigger-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'action-1',
        message: 'Send Email: Node is disconnected',
        severity: 'error',
      }),
    );
  });

  it('returns warning for end node with outgoing edge', () => {
    const trigger = makeTriggerNode();
    const end = makeEndNode();
    const action = makeActionNode();
    const journey = makeJourney([trigger, end, action], [
      edge('trigger-1', 'end-1'),
      edge('end-1', 'action-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'end-1',
        message: 'Exit: End node should not have outgoing connections',
        severity: 'warning',
      }),
    );
  });

  // --- Valid journey ---

  it('returns no errors for a valid simple journey', () => {
    const trigger = makeTriggerNode();
    const action = makeActionNode();
    const end = makeEndNode();
    const journey = makeJourney([trigger, action, end], [
      edge('trigger-1', 'action-1'),
      edge('action-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    // Only check for errors (not warnings)
    const errorLevel = errors.filter((e) => e.severity === 'error');
    expect(errorLevel).toHaveLength(0);
  });

  // --- Additional sub-type config checks ---

  it('returns error for webhook with empty url', () => {
    const trigger = makeTriggerNode();
    const action: JourneyNode = {
      id: 'action-1',
      type: 'action',
      subType: 'webhook',
      position: { x: 0, y: 150 },
      label: 'Webhook',
      config: { subType: 'webhook', url: '', method: 'POST' },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, action, end], [
      edge('trigger-1', 'action-1'),
      edge('action-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'action-1',
        message: 'Webhook: Missing required configuration',
      }),
    );
  });

  it('returns error for move-to-journey with empty targetJourneyId', () => {
    const trigger = makeTriggerNode();
    const end: JourneyNode = {
      id: 'end-1',
      type: 'end',
      subType: 'move-to-journey',
      position: { x: 0, y: 150 },
      label: 'Move',
      config: { subType: 'move-to-journey', targetJourneyId: '' },
    };
    const journey = makeJourney([trigger, end], [edge('trigger-1', 'end-1')]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'end-1',
        message: 'Move: Missing required configuration',
      }),
    );
  });

  it('returns error for update-contact with empty fieldKey', () => {
    const trigger = makeTriggerNode();
    const action: JourneyNode = {
      id: 'action-1',
      type: 'action',
      subType: 'update-contact',
      position: { x: 0, y: 150 },
      label: 'Update',
      config: { subType: 'update-contact', fieldKey: '', value: 'test' },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, action, end], [
      edge('trigger-1', 'action-1'),
      edge('action-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'action-1',
        message: 'Update: Missing required configuration',
      }),
    );
  });

  it('returns error for multi-way with no conditions', () => {
    const trigger = makeTriggerNode();
    const branch: JourneyNode = {
      id: 'branch-1',
      type: 'branch',
      subType: 'multi-way',
      position: { x: 0, y: 150 },
      label: 'Multi-way',
      config: { subType: 'multi-way', conditions: [] },
    };
    const end = makeEndNode();
    const journey = makeJourney([trigger, branch, end], [
      edge('trigger-1', 'branch-1'),
      edge('branch-1', 'end-1'),
    ]);
    const errors = validateJourney(journey);
    expect(errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'branch-1',
        message: 'Multi-way: Missing required configuration',
      }),
    );
  });
});
