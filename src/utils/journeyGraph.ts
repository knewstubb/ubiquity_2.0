// src/utils/journeyGraph.ts
// Pure graph utility functions for the journey builder canvas.
// All functions take immutable inputs and return new arrays (no mutation).

import type { JourneyNode, JourneyEdge, BranchLabelConfig, IfElseConfig, FilterGroup } from '../models/journey';

/**
 * Detect whether adding a proposed edge would create a cycle in the graph.
 * Uses DFS from the proposed target node — returns true if it can reach
 * the proposed source node through existing edges.
 */
export function detectCycle(
  _nodes: JourneyNode[],
  edges: JourneyEdge[],
  proposedEdge: { sourceNodeId: string; targetNodeId: string },
): boolean {
  // Self-loop is always a cycle
  if (proposedEdge.sourceNodeId === proposedEdge.targetNodeId) {
    return true;
  }

  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (nodeId === proposedEdge.sourceNodeId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    for (const edge of edges) {
      if (edge.sourceNodeId === nodeId) {
        if (dfs(edge.targetNodeId)) return true;
      }
    }
    return false;
  }

  return dfs(proposedEdge.targetNodeId);
}

/**
 * Split an existing edge and insert a new node between the two previously
 * connected nodes.
 *
 * Algorithm:
 * 1. Find the edge being dropped on (by targetEdgeId)
 * 2. Remove the original edge (A → B)
 * 3. Create two new edges: A → NewNode, NewNode → B
 */
export function autoConnect(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  newNode: JourneyNode,
  targetEdgeId: string,
): { nodes: JourneyNode[]; edges: JourneyEdge[] } {
  const targetEdge = edges.find((e) => e.id === targetEdgeId);
  if (!targetEdge) {
    // Edge not found — just add the node, leave edges unchanged
    return { nodes: [...nodes, newNode], edges: [...edges] };
  }

  const edgeAToNew: JourneyEdge = {
    id: `e-${targetEdge.sourceNodeId}-${newNode.id}`,
    sourceNodeId: targetEdge.sourceNodeId,
    targetNodeId: newNode.id,
    sourceHandle: targetEdge.sourceHandle,
  };

  const edgeNewToB: JourneyEdge = {
    id: `e-${newNode.id}-${targetEdge.targetNodeId}`,
    sourceNodeId: newNode.id,
    targetNodeId: targetEdge.targetNodeId,
    sourceHandle: 'default',
  };

  const updatedEdges = edges
    .filter((e) => e.id !== targetEdgeId)
    .concat(edgeAToNew, edgeNewToB);

  return {
    nodes: [...nodes, newNode],
    edges: updatedEdges,
  };
}

/**
 * Insert a conditional split (if-else) into the graph.
 * 
 * This creates:
 * 1. A ConditionNode at the insertion point
 * 2. Two BranchLabelNodes (True and False) connected to the condition
 * 3. Both branch labels reconnect to the original target (recombination)
 * 
 * Structure:
 *   Source → Condition → True Label  → Target
 *                     → False Label → Target
 */
export function insertConditionalSplit(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  targetEdgeId: string,
  conditionNodeId: string,
  trueLabelNodeId: string,
  falseLabelNodeId: string,
): { nodes: JourneyNode[]; edges: JourneyEdge[] } {
  const targetEdge = edges.find((e) => e.id === targetEdgeId);
  if (!targetEdge) {
    return { nodes, edges };
  }

  const sourceNode = nodes.find((n) => n.id === targetEdge.sourceNodeId);
  const targetNode = nodes.find((n) => n.id === targetEdge.targetNodeId);
  if (!sourceNode || !targetNode) {
    return { nodes, edges };
  }

  // Calculate positions
  const sourceY = sourceNode.position.y;
  const targetY = targetNode.position.y;
  const midY = (sourceY + targetY) / 2;
  const centerX = sourceNode.position.x;

  // Condition node positioned between source and target
  const conditionNode: JourneyNode = {
    id: conditionNodeId,
    type: 'branch',
    subType: 'if-else',
    position: { x: centerX, y: midY - 40 },
    label: 'Condition',
    config: {
      subType: 'if-else',
      condition: { combinator: 'AND', rules: [], groups: [] } as FilterGroup,
    } as IfElseConfig,
  };

  // Branch label offset from center
  const branchOffset = 80;
  const labelYOffset = 60;

  // True label node (left branch)
  const trueLabelNode: JourneyNode = {
    id: trueLabelNodeId,
    type: 'branch-label',
    subType: 'branch-label',
    position: { x: centerX - branchOffset, y: midY + labelYOffset },
    label: 'True',
    config: {
      subType: 'branch-label',
      branchId: 'true',
      parentBranchNodeId: conditionNodeId,
    } as BranchLabelConfig,
  };

  // False label node (right branch)
  const falseLabelNode: JourneyNode = {
    id: falseLabelNodeId,
    type: 'branch-label',
    subType: 'branch-label',
    position: { x: centerX + branchOffset, y: midY + labelYOffset },
    label: 'False',
    config: {
      subType: 'branch-label',
      branchId: 'false',
      parentBranchNodeId: conditionNodeId,
    } as BranchLabelConfig,
  };

  // Push the target node down to make room for the split
  const updatedNodes = nodes.map((n) => {
    if (n.id === targetEdge.targetNodeId) {
      return { ...n, position: { ...n.position, y: n.position.y + 150 } };
    }
    return n;
  });

  // Create new edges
  const newEdges: JourneyEdge[] = [
    // Source → Condition
    {
      id: `e-${targetEdge.sourceNodeId}-${conditionNodeId}`,
      sourceNodeId: targetEdge.sourceNodeId,
      targetNodeId: conditionNodeId,
      sourceHandle: targetEdge.sourceHandle,
    },
    // Condition → True Label
    {
      id: `e-${conditionNodeId}-${trueLabelNodeId}`,
      sourceNodeId: conditionNodeId,
      targetNodeId: trueLabelNodeId,
      sourceHandle: 'true',
    },
    // Condition → False Label
    {
      id: `e-${conditionNodeId}-${falseLabelNodeId}`,
      sourceNodeId: conditionNodeId,
      targetNodeId: falseLabelNodeId,
      sourceHandle: 'false',
    },
    // True Label → Target (recombination)
    {
      id: `e-${trueLabelNodeId}-${targetEdge.targetNodeId}`,
      sourceNodeId: trueLabelNodeId,
      targetNodeId: targetEdge.targetNodeId,
      sourceHandle: 'default',
    },
    // False Label → Target (recombination)
    {
      id: `e-${falseLabelNodeId}-${targetEdge.targetNodeId}`,
      sourceNodeId: falseLabelNodeId,
      targetNodeId: targetEdge.targetNodeId,
      sourceHandle: 'default',
    },
  ];

  // Remove the original edge and add new structure
  const filteredEdges = edges.filter((e) => e.id !== targetEdgeId);

  return {
    nodes: [...updatedNodes, conditionNode, trueLabelNode, falseLabelNode],
    edges: [...filteredEdges, ...newEdges],
  };
}

/**
 * When removing a node, reconnect upstream to downstream if possible.
 *
 * Algorithm:
 * - Non-branch node with exactly 1 incoming and 1 outgoing edge:
 *   create a new edge S → T, remove all edges referencing the deleted node.
 * - Otherwise (branch nodes with multiple outputs, or nodes with 0/many
 *   incoming): just remove all edges referencing the deleted node.
 */
export function autoHeal(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  removedNodeId: string,
): { nodes: JourneyNode[]; edges: JourneyEdge[] } {
  const removedNode = nodes.find((n) => n.id === removedNodeId);
  const incoming = edges.filter((e) => e.targetNodeId === removedNodeId);
  const outgoing = edges.filter((e) => e.sourceNodeId === removedNodeId);

  // Special handling for branch-label nodes: also remove sibling and parent condition
  if (removedNode?.type === 'branch-label') {
    const config = removedNode.config as BranchLabelConfig;
    const parentId = config.parentBranchNodeId;
    
    // Find sibling branch label (the other True/False node from same parent)
    const siblingLabels = nodes.filter(
      (n) => n.type === 'branch-label' && 
             n.id !== removedNodeId &&
             (n.config as BranchLabelConfig).parentBranchNodeId === parentId
    );
    
    // Remove the entire conditional split structure
    const nodesToRemove = new Set([removedNodeId, parentId, ...siblingLabels.map((n) => n.id)]);
    
    // Find what was upstream of the condition and downstream of the labels
    const conditionIncoming = edges.find((e) => e.targetNodeId === parentId);
    const labelOutgoing = outgoing.concat(
      edges.filter((e) => siblingLabels.some((s) => s.id === e.sourceNodeId))
    );
    
    // Get unique downstream targets
    const downstreamTargets = [...new Set(labelOutgoing.map((e) => e.targetNodeId))];
    
    const cleanedNodes = nodes.filter((n) => !nodesToRemove.has(n.id));
    const cleanedEdges = edges.filter(
      (e) => !nodesToRemove.has(e.sourceNodeId) && !nodesToRemove.has(e.targetNodeId)
    );
    
    // Reconnect: source → first downstream target (if exists)
    if (conditionIncoming && downstreamTargets.length > 0) {
      const healEdge: JourneyEdge = {
        id: `e-${conditionIncoming.sourceNodeId}-${downstreamTargets[0]}`,
        sourceNodeId: conditionIncoming.sourceNodeId,
        targetNodeId: downstreamTargets[0],
        sourceHandle: conditionIncoming.sourceHandle,
      };
      return {
        nodes: cleanedNodes,
        edges: [...cleanedEdges, healEdge],
      };
    }
    
    return { nodes: cleanedNodes, edges: cleanedEdges };
  }

  // Remove all edges that reference the deleted node
  const cleanedEdges = edges.filter(
    (e) => e.sourceNodeId !== removedNodeId && e.targetNodeId !== removedNodeId,
  );

  // Remove the node itself
  const cleanedNodes = nodes.filter((n) => n.id !== removedNodeId);

  // Non-branch heal: exactly one incoming and one outgoing → reconnect
  if (incoming.length === 1 && outgoing.length === 1) {
    const sourceId = incoming[0].sourceNodeId;
    const targetId = outgoing[0].targetNodeId;

    const healEdge: JourneyEdge = {
      id: `e-${sourceId}-${targetId}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      sourceHandle: incoming[0].sourceHandle,
    };

    return {
      nodes: cleanedNodes,
      edges: [...cleanedEdges, healEdge],
    };
  }

  // Branch or multi-connection case: just remove all edges, no reconnection
  return {
    nodes: cleanedNodes,
    edges: cleanedEdges,
  };
}
