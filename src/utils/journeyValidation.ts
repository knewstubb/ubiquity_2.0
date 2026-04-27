import type {
  JourneyDefinition,
  JourneyNode,
  NodeConfig,
} from '../models/journey';
import type { FilterGroup } from '../models/segment';

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Check whether a FilterGroup has at least one complete rule
 * (a rule with non-empty field and operator).
 */
function hasCompleteRule(group: FilterGroup): boolean {
  const hasDirectRule = group.rules.some(
    (r) => r.field !== '' && r.operator !== '',
  );
  if (hasDirectRule) return true;
  return group.groups.some((g) => hasCompleteRule(g));
}

/**
 * Returns true if the node's config is missing required fields
 * per the design's completeness rules.
 */
function isConfigIncomplete(config: NodeConfig): boolean {
  switch (config.subType) {
    // Triggers
    case 'segment-entry':
      return !config.segmentId;
    case 'event-based':
      return !config.eventType;
    case 'manual':
      // manual: description is optional — always valid
      return false;
    case 'scheduled':
      return !config.date;

    // Actions
    case 'send-email':
      return !config.emailRef;
    case 'send-sms':
      return !config.messageText;
    case 'update-contact':
      return !config.fieldKey || !config.value;
    case 'webhook':
      return !config.url;

    // Waits
    case 'time-delay':
      return config.duration <= 0;
    case 'wait-for-event':
      return !config.eventType;
    case 'wait-until-date':
      return !config.targetDate;

    // Branches
    case 'if-else':
      return !hasCompleteRule(config.condition);
    case 'ab-split':
      return config.variantAPercent < 1 || config.variantAPercent > 99;
    case 'multi-way':
      return (
        config.conditions.length === 0 ||
        !config.conditions.some((c) => hasCompleteRule(c.condition))
      );

    // Ends
    case 'exit':
      return false; // always valid
    case 'move-to-journey':
      return !config.targetJourneyId;

    // Join
    case 'join':
      return false; // always valid

    default:
      return false;
  }
}

/**
 * Validates a journey definition and returns all errors/warnings found.
 * Pure function — no side effects.
 */
export function validateJourney(journey: JourneyDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  const { nodes, edges } = journey;

  // --- Trigger checks ---
  const triggerNodes = nodes.filter((n) => n.type === 'trigger');

  if (triggerNodes.length === 0) {
    errors.push({
      message: 'Journey must have a trigger node',
      severity: 'error',
    });
  }

  if (triggerNodes.length > 1) {
    errors.push({
      message: 'Journey can only have one trigger node',
      severity: 'error',
    });
  }

  // Build edge lookup sets for quick access
  const outgoingByNode = new Set<string>();
  const incomingByNode = new Set<string>();

  for (const edge of edges) {
    outgoingByNode.add(edge.sourceNodeId);
    incomingByNode.add(edge.targetNodeId);
  }

  // --- Per-node checks ---
  for (const node of nodes) {
    const hasOutgoing = outgoingByNode.has(node.id);
    const hasIncoming = incomingByNode.has(node.id);

    // Disconnected node: no edges at all
    if (!hasOutgoing && !hasIncoming) {
      // Trigger nodes in a single-node journey are not disconnected
      // (they just have no connections yet), but the spec says
      // "no edges at all" means disconnected — only skip if it's the
      // sole node in the journey
      if (nodes.length > 1) {
        errors.push({
          nodeId: node.id,
          message: `${node.label}: Node is disconnected`,
          severity: 'error',
        });
      }
    }

    // Non-end node with no outgoing edge
    if (node.type !== 'end' && !hasOutgoing && (hasIncoming || nodes.length > 1)) {
      errors.push({
        nodeId: node.id,
        message: `${node.label}: No outgoing connection`,
        severity: 'error',
      });
    }

    // End node with outgoing edge (warning)
    if (node.type === 'end' && hasOutgoing) {
      errors.push({
        nodeId: node.id,
        message: `${node.label}: End node should not have outgoing connections`,
        severity: 'warning',
      });
    }

    // Missing required config
    if (isConfigIncomplete(node.config)) {
      errors.push({
        nodeId: node.id,
        message: `${node.label}: Missing required configuration`,
        severity: 'error',
      });
    }
  }

  return errors;
}
